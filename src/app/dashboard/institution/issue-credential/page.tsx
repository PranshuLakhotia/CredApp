'use client';

import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { UploadCloud, FileText, X, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function IssueCredentialPage() {
  console.log('🎯 SINGLE CREDENTIAL ISSUE PAGE LOADED - TIMESTAMP:', Date.now());
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [learnerId, setLearnerId] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractProgress, setExtractProgress] = useState(0);
  const [ocrStatus, setOcrStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle');
  const [credentialId, setCredentialId] = useState<string | null>(null);
  const [ocrData, setOcrData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showExtractedData, setShowExtractedData] = useState(false);
  
  // Form data for extracted fields
  const [formData, setFormData] = useState({
    credential_title: '',
    issuer_name: '',
    skill_tags: [] as string[],
    description: '',
    nsqf_level: 6,
    credential_type: 'digital-certificate',
    tags: [] as string[]
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  // Valid file types
  const validFileTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  const maxFileSize = 20 * 1024 * 1024; // 20MB

  const validateFile = (file: File): string | null => {
    if (!validFileTypes.includes(file.type)) {
      return 'Invalid file type. Please upload a PDF, JPEG, or PNG file.';
    }
    if (file.size > maxFileSize) {
      return 'File size too large. Please upload a file smaller than 20MB.';
    }
    return null;
  };

  const handleFileChange = (file: File | null) => {
    setError(null);
    if (file) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      handleFileChange(event.target.files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      handleFileChange(event.dataTransfer.files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setError(null);
  };

  const extractData = async () => {
    if (!selectedFile || !learnerId.trim()) {
      setError('Please select a file and enter a learner ID');
      return;
    }

    setIsExtracting(true);
    setExtractProgress(0);
    setError(null);
    setOcrStatus('processing');

    try {
      // Get API key
      const apiKeyResponse = await fetch('http://localhost:8000/api/v1/issuer/api-keys', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (!apiKeyResponse.ok) {
        throw new Error('Failed to get API key');
      }

      const apiKeysData = await apiKeyResponse.json();
      console.log('API Keys response:', apiKeysData);
      
      // Handle different response formats
      let apiKeys = apiKeysData;
      if (apiKeysData.api_keys) {
        apiKeys = apiKeysData.api_keys;
      }
      
      if (!apiKeys || !Array.isArray(apiKeys) || apiKeys.length === 0) {
        throw new Error('No API keys found. Please generate an API key first from the API Keys page.');
      }

      const apiKey = apiKeys[0].key;
      console.log('Using API key:', apiKey ? 'Found' : 'Not found');

      // Upload file and start OCR
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('learner_id', learnerId.trim());
      formData.append('idempotency_key', `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

      setExtractProgress(25);

      const uploadResponse = await fetch('http://localhost:8000/api/v1/issuer/credentials/upload', {
        method: 'POST',
        headers: {
          'X-API-Key': apiKey
        },
        body: formData
      });

      setExtractProgress(50);

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      const uploadResult = await uploadResponse.json();
      setCredentialId(uploadResult.credential_id);
      setExtractProgress(75);

      // Start polling for OCR completion
      pollOcrStatus(uploadResult.credential_id, apiKey);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Extraction failed');
      setIsExtracting(false);
      setOcrStatus('failed');
    }
  };

  const pollOcrStatus = async (credId: string, apiKey: string) => {
    const maxAttempts = 30; // 5 minutes max
    let attempts = 0;

    const poll = async () => {
      try {
        const statusResponse = await fetch(`http://localhost:8000/api/v1/issuer/credentials/${credId}`, {
          headers: {
            'X-API-Key': apiKey
          }
        });

        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          console.log(`OCR Status check ${attempts + 1}/${maxAttempts}:`, statusData.status);

          if (statusData.status === 'ocr_completed') {
            setExtractProgress(100);
            setOcrStatus('completed');
            setIsExtracting(false);
            setOcrData(statusData);
            
            // Auto-fill form data
            setFormData({
              credential_title: statusData.credential_title || '',
              issuer_name: statusData.issuer_name || '',
              skill_tags: statusData.skill_tags || [],
              description: statusData.description || '',
              nsqf_level: statusData.nsqf_level || 6,
              credential_type: statusData.credential_type || 'digital-certificate',
              tags: statusData.tags || []
            });
            
            setShowExtractedData(true);
            return;
          } else if (statusData.status === 'ocr_failed') {
            setOcrStatus('failed');
            setIsExtracting(false);
            setError(`OCR processing failed: ${statusData.metadata?.extraction_errors?.[0] || 'Unknown error'}`);
            return;
          }

          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(poll, 10000); // Poll every 10 seconds
          } else {
            setOcrStatus('failed');
            setIsExtracting(false);
            setError('OCR processing timeout - please try again later');
          }
        } else {
          setOcrStatus('failed');
          setIsExtracting(false);
          setError('Failed to check OCR status');
        }
      } catch (err) {
        setOcrStatus('failed');
        setIsExtracting(false);
        setError('Failed to check OCR status');
      }
    };

    poll();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleTagChange = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({ ...prev, tags }));
  };

  const issueCredential = async () => {
    if (!credentialId) {
      setError('No credential ID found');
      return;
    }

    setIsExtracting(true);
    setError(null);

    try {
      const apiKeyResponse = await fetch('http://localhost:8000/api/v1/issuer/api-keys', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (!apiKeyResponse.ok) {
        throw new Error('Failed to get API key');
      }

      const apiKeysData = await apiKeyResponse.json();
      console.log('API Keys response (issue):', apiKeysData);
      
      // Handle different response formats
      let apiKeys = apiKeysData;
      if (apiKeysData.api_keys) {
        apiKeys = apiKeysData.api_keys;
      }
      
      if (!apiKeys || !Array.isArray(apiKeys) || apiKeys.length === 0) {
        throw new Error('No API keys found. Please generate an API key first from the API Keys page.');
      }

      const apiKey = apiKeys[0].key;

      // Step 2: Verify
      const verifyPayload = {
        credential_title: formData.credential_title,
        description: formData.description,
        nsqf_level: formData.nsqf_level,
        credential_type: formData.credential_type,
        tags: formData.tags,
        skill_tags: formData.skill_tags
      };

      const verifyResponse = await fetch(`http://localhost:8000/api/v1/issuer/credentials/${credentialId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify(verifyPayload)
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        throw new Error(errorData.detail || 'Verification failed');
      }

      // Step 3: Deploy
      const deployPayload = {
        learner_wallet: '',
        generate_qr: true
      };

      const deployResponse = await fetch(`http://localhost:8000/api/v1/issuer/credentials/${credentialId}/deploy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify(deployPayload)
      });

      if (!deployResponse.ok) {
        const errorData = await deployResponse.json();
        throw new Error(errorData.detail || 'Deployment failed');
      }

      // Get complete credential information with QR code
      const completeInfoResponse = await fetch(`http://localhost:8000/api/v1/issuer/credentials/${credentialId}/complete-info`, {
        headers: {
          'X-API-Key': apiKey
        }
      });

      if (completeInfoResponse.ok) {
        const completeData = await completeInfoResponse.json();
        console.log('Complete credential data:', completeData);
        
        // Store complete data for display
        setOcrData(completeData);
        
        setError(null);
        setShowExtractedData(true);
        
        // Show success message with QR code info
        alert(`✅ Credential issued successfully!\n\n📱 QR Code generated with complete verification data\n🔗 Verification URL: ${completeData.qr_code.verification_url}\n📄 Blockchain TX: ${completeData.blockchain.transaction_hash}`);
      } else {
        setError(null);
        alert('✅ Credential issued successfully! (Note: Complete info could not be retrieved)');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to issue credential');
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    <strong>✅ SINGLE CREDENTIAL ISSUE PAGE LOADED:</strong> Upload certificate, extract data with OCR, and issue credential all in one page.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>⚠️ PREREQUISITE:</strong> Make sure you have generated an API key first. Go to the API Keys page to create one if you haven't already.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Issue Single Credential
              </h1>
              <p className="text-gray-600">
                Upload a certificate file and enter the learner ID, then click "Extract Data" to automatically extract information and fill the form
              </p>
            </div>

            {/* Learner ID Input */}
            <div className="mb-6">
              <label htmlFor="learnerId" className="block text-sm font-medium text-gray-700 mb-2">
                Learner ID *
              </label>
              <input
                id="learnerId"
                type="text"
                value={learnerId}
                onChange={(e) => setLearnerId(e.target.value)}
                placeholder="Enter the learner's ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={isExtracting || ocrStatus === 'processing'}
              />
              <p className="text-xs text-gray-500 mt-1">
                The learner must be registered in the system
              </p>
            </div>

            {/* File Upload Area */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certificate File *
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragOver 
                    ? 'border-blue-400 bg-blue-50' 
                    : selectedFile 
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400'
                } ${(isExtracting || ocrStatus === 'processing') ? 'opacity-50 pointer-events-none' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {selectedFile ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <FileText className="w-12 h-12 text-green-500" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                    </div>
                    <button
                      onClick={removeFile}
                      disabled={isExtracting || ocrStatus === 'processing'}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                    <div>
                      <p className="text-lg text-gray-600 mb-2">
                        Drag and drop your certificate here, or
                      </p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isExtracting || ocrStatus === 'processing'}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Browse Files
                      </button>
                    </div>
                    <p className="text-sm text-gray-500">
                      Supports PDF, JPEG, and PNG files up to 20MB
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileInputChange}
                disabled={isExtracting || ocrStatus === 'processing'}
                className="hidden"
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex">
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
                  <p className="text-sm font-medium text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Extract Progress */}
            {isExtracting && extractProgress > 0 && (
              <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${extractProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 text-center">
                  {ocrStatus === 'processing' ? 'Extracting Data...' : 'Uploading...'}: {extractProgress}% complete
                </p>
              </div>
            )}

            {/* Extract Button */}
            {!showExtractedData && (
              <div className="flex justify-center mb-8">
                <button
                  onClick={extractData}
                  disabled={!selectedFile || !learnerId.trim() || isExtracting || ocrStatus === 'processing'}
                  className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                    selectedFile && learnerId.trim() && !isExtracting && ocrStatus !== 'processing'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isExtracting || ocrStatus === 'processing' ? (
                    <div className="flex items-center">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {ocrStatus === 'processing' ? 'Extracting Data...' : 'Uploading...'}
                    </div>
                  ) : (
                    'Extract Data from Certificate'
                  )}
                </button>
              </div>
            )}

            {/* Extracted Data Form */}
            {ocrStatus === 'completed' && ocrData && showExtractedData && (
              <div className="border-t pt-8">
                <div className="flex items-center mb-6">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
                  <h2 className="text-xl font-semibold text-green-800">
                    Data Extracted Successfully!
                  </h2>
                </div>
                
                <div className="space-y-6">
                  {/* Auto-filled fields (read-only) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-2">Certificate Title</label>
                      <input
                        type="text"
                        value={formData.credential_title}
                        readOnly
                        className="w-full px-3 py-2 bg-green-50 border border-green-200 rounded-md text-green-900 font-medium"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-2">Issuer Name</label>
                      <input
                        type="text"
                        value={formData.issuer_name}
                        readOnly
                        className="w-full px-3 py-2 bg-green-50 border border-green-200 rounded-md text-green-900 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-2">Skills</label>
                    <input
                      type="text"
                      value={formData.skill_tags.join(', ')}
                      readOnly
                      className="w-full px-3 py-2 bg-green-50 border border-green-200 rounded-md text-green-900 font-medium"
                    />
                  </div>

                  {/* Editable fields */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Auto-generated from certificate data"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">You can edit this description if needed</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">NSQF Level</label>
                      <select
                        value={formData.nsqf_level}
                        onChange={(e) => setFormData(prev => ({ ...prev, nsqf_level: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                          <option key={level} value={level}>Level {level}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Credential Type</label>
                      <select
                        value={formData.credential_type}
                        onChange={(e) => setFormData(prev => ({ ...prev, credential_type: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="digital-certificate">Digital Certificate</option>
                        <option value="micro-credential">Micro Credential</option>
                        <option value="badge">Badge</option>
                        <option value="diploma">Diploma</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Additional Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={formData.tags.join(', ')}
                      onChange={(e) => handleTagChange(e.target.value)}
                      placeholder="e.g., verified, premium, industry-recognized"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">These tags will be associated with the credential</p>
                  </div>
                </div>
                
                <div className="flex justify-center gap-4 mt-8">
                  <button
                    onClick={() => {
                      setShowExtractedData(false);
                      setOcrStatus('idle');
                      setOcrData(null);
                      setCredentialId(null);
                      setError(null);
                      setFormData({
                        credential_title: '',
                        issuer_name: '',
                        skill_tags: [],
                        description: '',
                        nsqf_level: 6,
                        credential_type: 'digital-certificate',
                        tags: []
                      });
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Start Over
                  </button>
                  <button
                    onClick={issueCredential}
                    disabled={isExtracting || !formData.credential_title.trim()}
                    className={`px-8 py-2 rounded-lg font-medium ${
                      isExtracting || !formData.credential_title.trim()
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {isExtracting ? (
                      <div className="flex items-center">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Issuing Credential...
                      </div>
                    ) : (
                      'Issue Credential'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* QR Code and Complete Credential Display */}
            {ocrStatus === 'completed' && ocrData && ocrData.qr_code && (
              <div className="border-t pt-8 mt-8">
                <div className="flex items-center mb-6">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
                  <h2 className="text-xl font-semibold text-green-800">
                    🎉 Credential Successfully Issued with QR Code!
                  </h2>
                </div>

                {/* QR Code Display */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">📱 QR Code Verification</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* QR Code Image */}
                    <div className="text-center">
                      <img 
                        src={ocrData.qr_code.data_url} 
                        alt="Credential QR Code" 
                        className="mx-auto border-2 border-blue-300 rounded-lg shadow-md"
                        style={{ maxWidth: '250px', height: 'auto' }}
                      />
                      <p className="text-sm text-blue-700 mt-2">Scan to verify credential offline</p>
                    </div>

                    {/* QR Code Info */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-blue-700">Verification URL</label>
                        <a 
                          href={ocrData.qr_code.verification_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline break-all text-sm"
                        >
                          {ocrData.qr_code.verification_url}
                        </a>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-blue-700">Data Size</label>
                        <p className="text-sm text-gray-600">{ocrData.qr_code.qr_json_data.length} characters</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-blue-700">Offline Verification</label>
                        <p className="text-sm text-gray-600">{ocrData.qr_code.qr_data.verification_info.offline_verification ? 'Yes' : 'No'}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-blue-700">Tamper Proof</label>
                        <p className="text-sm text-gray-600">{ocrData.qr_code.qr_data.security_info.tamper_proof ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </div>

                  {/* QR Code Actions */}
                  <div className="flex flex-wrap gap-3 mt-6 justify-center">
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = ocrData.qr_code.data_url;
                        link.download = `credential-qr-${ocrData.credential.id}.png`;
                        link.click();
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      📥 Download QR Code
                    </button>
                    <button
                      onClick={() => {
                        const blob = new Blob([ocrData.qr_code.qr_json_data], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `credential-data-${ocrData.credential.id}.json`;
                        link.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                    >
                      📄 Download Data
                    </button>
                    <a 
                      href={ocrData.qr_code.verification_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm no-underline"
                    >
                      🔗 Verify Online
                    </a>
                  </div>
                </div>

                {/* Blockchain Information */}
                {ocrData.blockchain && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-green-900 mb-4">⛓️ Blockchain Verification</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <label className="block text-sm font-medium text-green-700">Transaction Hash</label>
                        <a 
                          href={ocrData.blockchain.block_explorer_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-green-600 hover:underline break-all"
                        >
                          {ocrData.blockchain.transaction_hash}
                        </a>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-green-700">Block Number</label>
                        <p className="text-gray-600">{ocrData.blockchain.block_number}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-green-700">Network</label>
                        <p className="text-gray-600">{ocrData.blockchain.network}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-green-700">Gas Used</label>
                        <p className="text-gray-600">{ocrData.blockchain.gas_used}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Learner and Issuer Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Learner Info */}
                  {ocrData.learner && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-900 mb-3">👤 Learner Information</h4>
                      <div className="space-y-2 text-sm">
                        <p><strong>Name:</strong> {ocrData.learner.name}</p>
                        <p><strong>Email:</strong> {ocrData.learner.email}</p>
                        <p><strong>Phone:</strong> {ocrData.learner.phone}</p>
                        <p><strong>KYC Verified:</strong> {ocrData.learner.kyc_verified ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  )}

                  {/* Issuer Info */}
                  {ocrData.issuer && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-900 mb-3">🏢 Issuer Information</h4>
                      <div className="space-y-2 text-sm">
                        <p><strong>Organization:</strong> {ocrData.issuer.organization_name}</p>
                        <p><strong>Type:</strong> {ocrData.issuer.organization_type}</p>
                        <p><strong>Registration:</strong> {ocrData.issuer.registration_number}</p>
                        <p><strong>Website:</strong> 
                          <a href={ocrData.issuer.website} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline ml-1">
                            {ocrData.issuer.website}
                          </a>
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* QR Code Data Preview */}
                <details className="mt-6">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                    📋 View Complete QR Code Data
                  </summary>
                  <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(ocrData.qr_code.qr_data, null, 2)}
                    </pre>
                  </div>
                </details>

                {/* Final Actions */}
                <div className="flex justify-center gap-4 mt-8">
                  <button
                    onClick={() => {
                      setShowExtractedData(false);
                      setOcrStatus('idle');
                      setOcrData(null);
                      setCredentialId(null);
                      setError(null);
                      setFormData({
                        credential_title: '',
                        issuer_name: '',
                        skill_tags: [],
                        description: '',
                        nsqf_level: 6,
                        credential_type: 'digital-certificate',
                        tags: []
                      });
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Issue Another Credential
                  </button>
                  <button
                    onClick={() => window.location.href = '/dashboard/institution/credentials'}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    View All Credentials
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}