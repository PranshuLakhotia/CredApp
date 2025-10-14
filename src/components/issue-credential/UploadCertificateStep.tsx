'use client';

import React, { useState, useRef, useCallback } from 'react';
import { UploadCloud, FileText, AlertTriangle, CheckCircle, Loader2, X } from 'lucide-react';

interface CredentialData {
  credential_id: string;
  status: string;
  credential_title?: string;
  issuer_name?: string;
  skill_tags?: string[];
  learner_name?: string;
  learner_id?: string;
  metadata?: any;
}

interface UploadCertificateStepProps {
  onNext: (credentialId: string, data: CredentialData) => void;
  onError: (error: string) => void;
}

export function UploadCertificateStep({ onNext, onError }: UploadCertificateStepProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [learnerId, setLearnerId] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [ocrStatus, setOcrStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle');
  const [credentialId, setCredentialId] = useState<string | null>(null);
  const [ocrData, setOcrData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showExtractedData, setShowExtractedData] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Valid file types
  const validFileTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  const maxFileSize = 20 * 1024 * 1024;

  const validateFile = (file: File): string | null => {
    if (!validFileTypes.includes(file.type)) {
      return `Invalid file type. Please upload a PDF, JPEG, or PNG file.`;
    }
    if (file.size > maxFileSize) {
      return `File too large. Maximum size is ${maxFileSize / (1024 * 1024)}MB.`;
    }
    return null;
  };

  const handleFileSelect = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setSelectedFile(file);
    setError(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const extractData = async () => {
    if (!selectedFile || !learnerId.trim()) {
      setError('Please select a file and enter a learner ID');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
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

      const apiKeys = await apiKeyResponse.json();
      if (!apiKeys || apiKeys.length === 0) {
        throw new Error('No API keys found. Please generate an API key first.');
      }

      const apiKey = apiKeys[0].key;

      // Upload file and start OCR
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('learner_id', learnerId.trim());
      formData.append('idempotency_key', `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

      setUploadProgress(25);

      const uploadResponse = await fetch('http://localhost:8000/api/v1/issuer/credentials/upload', {
        method: 'POST',
        headers: {
          'X-API-Key': apiKey
        },
        body: formData
      });

      setUploadProgress(50);

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      const uploadResult = await uploadResponse.json();
      setCredentialId(uploadResult.credential_id);
      setUploadProgress(75);

      // Start polling for OCR completion
      pollOcrStatus(uploadResult.credential_id, apiKey);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Extraction failed');
      setIsUploading(false);
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
            setUploadProgress(100);
            setOcrStatus('completed');
            setIsUploading(false);
            setOcrData(statusData);
            setShowExtractedData(true);
            return;
          } else if (statusData.status === 'ocr_failed') {
            setOcrStatus('failed');
            setIsUploading(false);
            setError(`OCR processing failed: ${statusData.metadata?.extraction_errors?.[0] || 'Unknown error'}`);
            return;
          }

          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(poll, 10000); // Poll every 10 seconds
          } else {
            setOcrStatus('failed');
            setIsUploading(false);
            setError('OCR processing timeout - please try again');
          }
        }
      } catch (err) {
        console.warn(`OCR status check failed:`, err);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000);
        } else {
          setOcrStatus('failed');
          setIsUploading(false);
          setError('Failed to check OCR status');
        }
      }
    };

    poll();
  };

  const proceedToNextStep = () => {
    if (ocrData && credentialId) {
      onNext(credentialId, ocrData);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Issue Single Credential
          </h2>
          <p className="text-gray-600">
            Upload a certificate file and enter the learner ID, then click "Extract Data" to automatically extract information and fill the form
          </p>
        </div>

        {/* Learner ID Input */}
        <div className="mb-6">
          <label htmlFor="learnerId" className="block text-sm font-medium text-gray-700 mb-2">
            Learner ID
          </label>
          <input
            id="learnerId"
            type="text"
            value={learnerId}
            onChange={(e) => setLearnerId(e.target.value)}
            placeholder="Enter the learner's ID"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={isUploading || ocrStatus === 'processing'}
          />
          <p className="text-xs text-gray-500 mt-1">
            The learner must be registered in the system
          </p>
        </div>

        {/* File Upload Area */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Certificate File
          </label>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver 
                ? 'border-blue-400 bg-blue-50' 
                : selectedFile 
                ? 'border-green-400 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            } ${(isUploading || ocrStatus === 'processing') ? 'opacity-50 pointer-events-none' : ''}`}
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
                  disabled={isUploading || ocrStatus === 'processing'}
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
                    disabled={isUploading || ocrStatus === 'processing'}
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
            disabled={isUploading || ocrStatus === 'processing'}
            className="hidden"
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {(isUploading || ocrStatus === 'processing') && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center mb-2">
              <Loader2 className="w-5 h-5 text-blue-500 mr-2 animate-spin" />
              <p className="text-sm font-medium text-blue-700">
                {ocrStatus === 'processing' ? 'Processing OCR...' : 'Uploading file...'}
              </p>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-blue-600 mt-1">
              {uploadProgress}% complete
            </p>
          </div>
        )}

        {/* OCR Success - Show Extracted Data */}
        {ocrStatus === 'completed' && ocrData && showExtractedData && (
          <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
              <h3 className="text-lg font-medium text-green-800">
                Data Extracted Successfully!
              </h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Certificate Title</label>
                <input
                  type="text"
                  value={ocrData.credential_title || ''}
                  readOnly
                  className="w-full px-3 py-2 bg-white border border-green-200 rounded-md text-green-900 font-medium"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Issuer Name</label>
                <input
                  type="text"
                  value={ocrData.issuer_name || ''}
                  readOnly
                  className="w-full px-3 py-2 bg-white border border-green-200 rounded-md text-green-900 font-medium"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Skills</label>
                <input
                  type="text"
                  value={ocrData.skill_tags ? ocrData.skill_tags.join(', ') : ''}
                  readOnly
                  className="w-full px-3 py-2 bg-white border border-green-200 rounded-md text-green-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={3}
                  placeholder="Auto-generated from certificate data"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">NSQF Level</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                      <option key={level} value={level}>Level {level}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Credential Type</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
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
                  placeholder="e.g., verified, premium, industry-recognized"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => {
                  setShowExtractedData(false);
                  setOcrStatus('idle');
                  setOcrData(null);
                  setCredentialId(null);
                  setError(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Start Over
              </button>
              <button
                onClick={proceedToNextStep}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Continue to Issue Credential
              </button>
            </div>
          </div>
        )}

        {/* Extract Button */}
        {!showExtractedData && (
          <div className="flex justify-center">
            <button
              onClick={extractData}
              disabled={!selectedFile || !learnerId.trim() || isUploading || ocrStatus === 'processing'}
              className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                selectedFile && learnerId.trim() && !isUploading && ocrStatus !== 'processing'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isUploading || ocrStatus === 'processing' ? (
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
      </div>
    </div>
  );
}
