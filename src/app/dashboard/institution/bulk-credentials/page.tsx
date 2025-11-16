'use client';

import React, { useState, ChangeEvent, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import RoleGuard from '@/components/auth/RoleGuard';
import { useAuth } from '@/hooks/useAuth';
import { 
  Plus, 
  Trash2, 
  Upload, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  User,
  FileText,
  Edit,
  RefreshCw
} from 'lucide-react';
import { buildApiUrl } from '@/config/api';

// Import functions from single credential page
import { fetchApiKeys } from '../credentials/page';

// OCR extraction function
const extractDataFromCertificate = async (certificateFile: File, apiKey: string): Promise<any> => {
  try {
    console.log('🔍 Starting OCR extraction for certificate:', certificateFile.name);

    const formData = new FormData();
    formData.append('file', certificateFile);

    const response = await fetch(buildApiUrl('/issuer/credentials/extract-ocr'), {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
      },
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ OCR extraction successful:', result);
      return result;
    } else {
      const errorText = await response.text();
      console.error('❌ OCR extraction failed:', response.status, errorText);
      throw new Error(`OCR extraction failed: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    console.error('💥 OCR extraction error:', error);
    throw error;
  }
};

// Validation function
const validateLearner = async (learnerId: string, apiKey: string) => {
  try {
    console.log('🔍 Checking learner:', learnerId);
    
    const learnerResponse = await fetch(buildApiUrl(`/issuer/users/${learnerId}/is-learner`), {
      headers: {
        'x-api-key': apiKey,
        'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('access_token') : ''}`
      }
    });
    
    if (learnerResponse.ok) {
      const learnerData = await learnerResponse.json();
      console.log('✅ Learner data received:', learnerData);
      return { success: true, data: learnerData };
    } else {
      const errorText = await learnerResponse.text();
      console.error('❌ Learner API failed:', learnerResponse.status, errorText);
      return { success: false, error: `Learner validation failed: ${learnerResponse.status} - ${errorText}` };
    }
  } catch (error) {
    console.error('💥 Learner verification exception:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Credential creation function
const createCredential = async (payload: any, apiKey: string) => {
  try {
    console.log('📝 Creating credential in database...');
    
    const createResponse = await fetch(buildApiUrl('/issuer/credentials'), {
      method: 'POST',
          headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
        'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('access_token') : ''}`
      },
      body: JSON.stringify(payload)
    });

    console.log('📡 Create credential response status:', createResponse.status);

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      console.error('❌ Failed to create credential:', errorData);
      throw new Error(`Failed to create credential: ${errorData.detail || errorData.message || 'Unknown error'}`);
    }

    const createResult = await createResponse.json();
    console.log('✅ Credential created successfully:', createResult);
    return createResult;
      } catch (error) {
    console.error('💥 Error creating credential:', error);
    throw error;
  }
};

// Blockchain issuance function
const issueCredentialOnBlockchain = async (credentialId: string, learnerAddress: string) => {
  try {
    console.log('⛓️ Issuing credential on blockchain...');
    
    const issuePayload = {
      credential_id: credentialId,
      learner_address: learnerAddress,
      generate_qr: true,
      wait_for_confirmation: false
    };

    console.log('📤 Sending blockchain issue request:', issuePayload);

    const issueResponse = await fetch(buildApiUrl('/blockchain/credentials/issue'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('access_token') : ''}`
      },
      body: JSON.stringify(issuePayload)
    });

    console.log('📡 Blockchain issue response status:', issueResponse.status);

    if (!issueResponse.ok) {
      const errorData = await issueResponse.json();
      console.error('❌ Failed to issue credential on blockchain:', errorData);
      throw new Error(`Failed to issue credential on blockchain: ${errorData.detail || errorData.message || 'Unknown error'}`);
    }

    const issueResult = await issueResponse.json();
    console.log('✅ Credential issued on blockchain successfully:', issueResult);
    return issueResult;
    } catch (error) {
    console.error('💥 Error issuing credential on blockchain:', error);
    throw error;
  }
};

// QR overlay function
const overlayQrOnCertificate = async (certificateFile: File, credentialId: string, qrData: any, apiKey: string) => {
  try {
    console.log('📄 Overlaying QR code on certificate...');
    
    // Read the file as ArrayBuffer to ensure it's properly sent
    const fileArrayBuffer = await certificateFile.arrayBuffer();
    const fileBlob = new Blob([fileArrayBuffer], { type: certificateFile.type });
    
    console.log('📄 Certificate File Info:');
    console.log('  - Name:', certificateFile.name);
    console.log('  - Size:', certificateFile.size, 'bytes');
    console.log('  - Type:', certificateFile.type);
    console.log('  - ArrayBuffer size:', fileArrayBuffer.byteLength, 'bytes');
    
    const overlayFormData = new FormData();
    overlayFormData.append('certificate_file', fileBlob, certificateFile.name);
    overlayFormData.append('credential_id', credentialId);
    overlayFormData.append('qr_data', JSON.stringify(qrData || {}));

    console.log('📤 QR Overlay Request Data:');
    console.log('  - Credential ID:', credentialId);
    console.log('  - File Blob size:', fileBlob.size, 'bytes');
    console.log('  - File Type:', fileBlob.type);
    console.log('  - QR Data:', qrData);

    const overlayResponse = await fetch(buildApiUrl('/issuer/credentials/overlay-qr'), {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('access_token') : ''}`
      },
      body: overlayFormData
    });

    console.log('📡 QR overlay response status:', overlayResponse.status);

    if (!overlayResponse.ok) {
      const errorText = await overlayResponse.text();
      console.error('❌ Failed to overlay QR and upload - Raw Response:', errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        console.error('❌ Error Data:', JSON.stringify(errorData, null, 2));
        throw new Error(`QR overlay failed: ${errorData.detail || errorData.message || 'Unknown error'}`);
      } catch {
        console.error('❌ Non-JSON Error Response:', errorText);
        throw new Error(`QR overlay failed: ${errorText}`);
      }
    }

    const overlayResult = await overlayResponse.json();
    console.log('✅ Certificate with QR uploaded:', overlayResult);
    return overlayResult;
  } catch (error) {
    console.error('💥 Error overlaying QR:', error);
    throw error;
  }
};

interface CredentialEntry {
  id: string;
  learnerId: string;
  certificateFile: File | null;
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
  result?: any;
  progress?: {
    step: string;
    description: string;
  };
  isEditing?: boolean;
}

// Edit Entry Component
const EditEntryComponent = ({ 
  entry, 
  onSave, 
  onCancel 
}: { 
  entry: CredentialEntry;
  onSave: (data: Partial<CredentialEntry>) => void;
  onCancel: () => void;
}) => {
  const [learnerId, setLearnerId] = useState(entry.learnerId);
  const [certificateFile, setCertificateFile] = useState<File | null>(entry.certificateFile);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid file (PDF, JPG, JPEG, or PNG)');
        return;
      }
      setCertificateFile(file);
    }
  };

  const handleSave = () => {
    if (!learnerId.trim()) {
      alert('Learner ID is required');
      return;
    }
    if (!certificateFile) {
      alert('Certificate file is required');
      return;
    }
    onSave({ learnerId: learnerId.trim(), certificateFile });
  };

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h4 className="font-medium text-yellow-900 mb-4">Edit Entry Details</h4>
      
      <div className="space-y-4">
        {/* Learner ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Learner ID *
          </label>
          <input
            type="text"
            value={learnerId}
            onChange={(e) => setLearnerId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter learner ID"
          />
        </div>

        {/* Certificate File */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Certificate File *
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {certificateFile && (
            <p className="text-sm text-gray-600 mt-1">
              Selected: {certificateFile.name}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Save Changes
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default function BulkCredentialsPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<CredentialEntry[]>([
    { id: '1', learnerId: '', certificateFile: null, status: 'pending' }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [processingComplete, setProcessingComplete] = useState(false);

  // Add new entry
  const addEntry = () => {
    setEntries(prev => {
      const newId = (prev.length + 1).toString();
      return [...prev, { 
        id: newId, 
        learnerId: '', 
        certificateFile: null, 
        status: 'pending' 
      }];
    });
  };

  // Remove entry
  const removeEntry = (id: string) => {
    setEntries(prev => {
      if (prev.length > 1) {
        return prev.filter(entry => entry.id !== id);
      }
      return prev;
    });
  };

  // Update learner ID
  const updateLearnerId = (id: string, learnerId: string) => {
    setEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, learnerId } : entry
    ));
  };

  // Update certificate file
  const updateCertificateFile = (id: string, file: File | null) => {
    setEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, certificateFile: file } : entry
    ));
  };

  // Update entry status
  const updateEntryStatus = (id: string, status: CredentialEntry['status'], error?: string, result?: any, progress?: CredentialEntry['progress']) => {
    console.log(`🔄 Updating entry ${id} status to:`, status, { error, result: !!result, progress });
    setEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, status, error, result, progress } : entry
    ));
  };

  // Process a single credential entry
  const processCredentialEntry = async (entry: CredentialEntry, index: number): Promise<void> => {
    try {
      console.log(`🚀 Processing entry ${index + 1}: ${entry.learnerId}`);
      
      updateEntryStatus(entry.id, 'processing', undefined, undefined, {
        step: 'Fetching API Key',
        description: 'Authenticating with server...'
      });

      // Get API key
      const apiKeys = await fetchApiKeys();
      if (!apiKeys || apiKeys.length === 0) {
        throw new Error('No API keys found. Please generate an API key first.');
      }
      const apiKey = apiKeys[0].key;

      // Step 1: OCR Extraction
      updateEntryStatus(entry.id, 'processing', undefined, undefined, {
        step: 'OCR Extraction',
        description: 'Extracting data from certificate...'
      });

      if (!entry.certificateFile) {
        throw new Error('Certificate file is required');
      }

      const ocrResult = await extractDataFromCertificate(entry.certificateFile, apiKey);
      console.log('✅ OCR extraction completed:', ocrResult);

      // Step 2: Learner Validation
      updateEntryStatus(entry.id, 'processing', undefined, undefined, {
        step: 'Learner Validation',
        description: 'Verifying learner credentials...'
      });

      const learnerValidation = await validateLearner(entry.learnerId, apiKey);
      if (!learnerValidation.success) {
        throw new Error(learnerValidation.error);
      }

      const learnerData = learnerValidation.data;
      if (!learnerData.is_learner) {
        throw new Error(`User ${entry.learnerId} is not registered as a learner`);
      }

      // Step 3: Create Credential
      updateEntryStatus(entry.id, 'processing', undefined, undefined, {
        step: 'Creating Credential',
        description: 'Creating credential in database...'
      });

      const credentialData = {
        credential_name: ocrResult.credential_title || ocrResult.credential_name || 'Certificate',
        issuer_name: ocrResult.issuer_name || user?.full_name || 'Institution',
        learner_name: ocrResult.learner_name || 'Learner',
        issue_date: ocrResult.issued_date || new Date().toISOString().split('T')[0],
        expiry_date: ocrResult.expiry_date || null,
        skill_tags: ocrResult.skill_tags || [],
        nsqf_level: ocrResult.nsqf_level || 6,
        description: ocrResult.description || `${ocrResult.credential_title || 'Certificate'} issued by ${user?.full_name || 'Institution'}`,
        tags: [],
        duration: ocrResult.duration || '4 Weeks',
        mode: ocrResult.mode || 'Online'
      };

      const createPayload = {
        learner_id: entry.learnerId,
        credential_data: credentialData,
        metadata: {
          learner_address: learnerData.user_info?.wallet_address || "0x3AF15A0035a717ddb5b4B4D727B7EE94A52Cc4e3",
          completion_date: credentialData.issue_date
        },
        vc_payload: {
          "@context": ["https://www.w3.org/2018/credentials/v1"],
          "type": ["VerifiableCredential"],
          "credentialSubject": {
            "learner_address": learnerData.user_info?.wallet_address || "0x3AF15A0035a717ddb5b4B4D727B7EE94A52Cc4e3",
            "name": ocrResult.learner_name || "Learner Name",
            "course": credentialData.credential_name,
            "grade": "A+",
            "completion_date": credentialData.issue_date,
            "skills": credentialData.skill_tags,
            "duration": credentialData.duration,
            "mode": credentialData.mode
          },
          "issuer": {
            "name": credentialData.issuer_name,
            "did": "did:example:tech-university"
          },
          "issuanceDate": new Date().toISOString()
        },
        artifact_url: entry.certificateFile ? URL.createObjectURL(entry.certificateFile) : "",
        idempotency_key: `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        credential_type: "digital-certificate"
      };

      console.log('📤 Credential Creation Payload:', JSON.stringify(createPayload, null, 2));
      const createResult = await createCredential(createPayload, apiKey);
      console.log('✅ Credential created successfully:', createResult);

      // Step 4: Issue on Blockchain
      updateEntryStatus(entry.id, 'processing', undefined, undefined, {
        step: 'Blockchain Issuance',
        description: 'Deploying to blockchain...'
      });

      const learnerAddress = learnerData.user_info?.wallet_address || "0x3AF15A0035a717ddb5b4B4D727B7EE94A52Cc4e3";
      console.log('⛓️ Blockchain Issuance Data:');
      console.log('  - Credential ID:', createResult.credential_id);
      console.log('  - Learner Address:', learnerAddress);
      
      const issueResult = await issueCredentialOnBlockchain(
        createResult.credential_id, 
        learnerAddress
      );
      console.log('✅ Blockchain issuance completed:', issueResult);

      // Step 5: Overlay QR Code
      updateEntryStatus(entry.id, 'processing', undefined, undefined, {
        step: 'Adding QR Code',
        description: 'Embedding QR code in certificate...'
      });

      const overlayResult = await overlayQrOnCertificate(
        entry.certificateFile,
        createResult.credential_id,
        issueResult.qr_code_data,
        apiKey
      );

      // Success!
      const finalResult = {
        ...issueResult,
          credential_id: createResult.credential_id,
          certificate_url: overlayResult.certificate_url,
        extracted_data: ocrResult,
        learner_data: learnerData.user_info
      };

      updateEntryStatus(entry.id, 'success', undefined, finalResult);
      console.log(`✅ Entry ${index + 1} completed successfully`);

      } catch (error) {
      console.error(`❌ Entry ${index + 1} failed:`, error);
      updateEntryStatus(entry.id, 'error', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  // Process all credentials
  const processAllCredentials = async () => {
    // Validate entries
    const validEntries = entries.filter(entry => 
      entry.learnerId.trim() && entry.certificateFile
    );

    if (validEntries.length === 0) {
      alert('Please add at least one entry with learner ID and certificate file.');
      return;
    }

    if (validEntries.length !== entries.length) {
      alert('Please fill in all learner IDs and upload all certificate files.');
      return;
    }

    setIsProcessing(true);
    setShowResults(true);
    setProcessingComplete(false);

    // Reset all entry statuses
    setEntries(prev => prev.map(entry => ({ ...entry, status: 'pending', error: undefined, result: undefined })));

    // Process entries sequentially
    for (let i = 0; i < validEntries.length; i++) {
      const entry = validEntries[i];
      await processCredentialEntry(entry, i);
      
      // Add a small delay between entries for better UX
      if (i < validEntries.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    setIsProcessing(false);
    setProcessingComplete(true);
  };

  // Reset form
  const resetForm = () => {
    setEntries([{ id: '1', learnerId: '', certificateFile: null, status: 'pending' }]);
    setIsProcessing(false);
    setShowResults(false);
    setProcessingComplete(false);
  };

  // Edit entry
  const startEditingEntry = (entryId: string) => {
    setEntries(prev => prev.map(entry => 
      entry.id === entryId 
        ? { ...entry, isEditing: true }
        : entry
    ));
  };

  // Cancel editing
  const cancelEditingEntry = (entryId: string) => {
    setEntries(prev => prev.map(entry => 
      entry.id === entryId 
        ? { ...entry, isEditing: false }
        : entry
    ));
  };

  // Save edited entry
  const saveEditedEntry = (entryId: string, updatedData: Partial<CredentialEntry>) => {
    setEntries(prev => prev.map(entry => 
      entry.id === entryId 
        ? { 
            ...entry, 
            ...updatedData, 
            isEditing: false,
            status: 'pending',
            error: undefined,
            result: undefined,
            progress: undefined
          }
        : entry
    ));
  };

  // Retry failed entry
  const retryEntry = async (entryId: string) => {
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;

    // Find the entry index
    const entryIndex = entries.findIndex(e => e.id === entryId);
    if (entryIndex === -1) return;

    // Reset entry status and process
    setEntries(prev => prev.map(e => 
      e.id === entryId 
        ? { 
            ...e, 
            status: 'processing', 
            error: undefined, 
            result: undefined,
            progress: { step: 'Preparing', description: 'Starting retry...' }
          }
        : e
    ));

    try {
      await processCredentialEntry(entry, entryIndex);
    } catch (error) {
      console.error('Error retrying entry:', error);
    }
  };

  const getStatusIcon = (status: CredentialEntry['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: CredentialEntry['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'processing':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const successCount = entries.filter(entry => entry.status === 'success').length;
  const errorCount = entries.filter(entry => entry.status === 'error').length;

  return (
    <RoleGuard allowedPath="/dashboard/institution/bulk-credentials" requiredRole="issuer">
      <DashboardLayout title="Bulk Credential Issuer">
        <div className="w-full p-4 sm:p-8">
          <div className="bg-white rounded-lg p-8">
            
          {/* Header */}
          <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Bulk Credential Issuer</h1>
              <p className="text-gray-600">
                Add multiple credential entries and issue them all at once with automated processing.
              </p>
          </div>

            {/* Form Section */}
            {!showResults && (
              <div className="space-y-6">
                {/* Entries */}
                {entries.map((entry, index) => (
                  <div key={entry.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        Entry #{index + 1}
                      </h3>
                      {entries.length > 1 && (
                  <button
                          onClick={() => removeEntry(entry.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="w-5 h-5" />
                  </button>
              )}
            </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Learner ID */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Learner ID *
                </label>
                        <input
                          type="text"
                          value={entry.learnerId}
                          onChange={(e) => updateLearnerId(entry.id, e.target.value)}
                          placeholder="Enter learner ID"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
              </div>

                      {/* Certificate Upload */}
                <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Certificate File *
                  </label>
                        <div className="relative">
                  <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => updateCertificateFile(entry.id, e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                          {entry.certificateFile && (
                            <div className="mt-2 flex items-center text-sm text-green-600">
                              <FileText className="w-4 h-4 mr-1" />
                              {entry.certificateFile.name}
                  </div>
                )}
              </div>
            </div>
              </div>
              </div>
                ))}

                {/* Add Entry Button */}
                <div className="flex justify-center">
                <button
                    onClick={addEntry}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Another Entry
                </button>
              </div>

                {/* Issue Credentials Button */}
                <div className="flex justify-center pt-6">
                <button
                  onClick={processAllCredentials}
                    className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-lg"
                  >
                    Issue All Credentials
                </button>
              </div>
            </div>
          )}

            {/* Processing/Results Section */}
            {showResults && (
              <div className="space-y-6">
                {/* Summary */}
                <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {isProcessing ? 'Processing Credentials...' : 'Processing Complete'}
                    </h2>
                    {processingComplete && (
                  <button
                        onClick={resetForm}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Issue More Credentials
                  </button>
                    )}
              </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{entries.length}</div>
                      <div className="text-sm text-gray-600">Total Entries</div>
                          </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{successCount}</div>
                      <div className="text-sm text-gray-600">Issued</div>
                        </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{errorCount}</div>
                      <div className="text-sm text-gray-600">Failed</div>
                          </div>
                          </div>
                          </div>

                {/* Progress Bar */}
                {isProcessing && (
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${((successCount + errorCount) / entries.length) * 100}%` 
                      }}
                            />
                          </div>
                )}

                {/* Entries Status */}
                <div className="space-y-4">
                  {entries.map((entry, index) => (
                    <div 
                      key={entry.id} 
                      className={`border rounded-lg p-6 transition-all duration-500 ${getStatusColor(entry.status)}`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                          {getStatusIcon(entry.status)}
                              <div>
                            <h3 className="font-medium text-gray-900">
                              Entry #{index + 1} - {entry.learnerId}
                            </h3>
                            {entry.certificateFile && (
                              <p className="text-sm text-gray-600">
                                {entry.certificateFile.name}
                              </p>
                            )}
                            {entry.progress && entry.status === 'processing' && (
                              <div className="mt-2">
                                <p className="text-sm font-medium text-blue-900">
                                  {entry.progress.step}
                                </p>
                                <p className="text-xs text-blue-700">
                                  {entry.progress.description}
                                </p>
                                </div>
                    )}
                            {entry.error && (
                              <p className="text-sm text-red-700 mt-1">
                                {entry.error}
                              </p>
                            )}
                                </div>
                              </div>

                      {/* Edit/Retry Section for Failed Entries */}
                      {entry.status === 'error' && (
                        <div className="mt-4">
                          {entry.isEditing ? (
                            <EditEntryComponent
                              entry={entry}
                              onSave={(data) => saveEditedEntry(entry.id, data)}
                              onCancel={() => cancelEditingEntry(entry.id)}
                            />
                          ) : (
                            <div className="flex space-x-3">
                            <button
                                onClick={() => startEditingEntry(entry.id)}
                                className="flex items-center px-4 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Details
                              </button>
                              <button
                                onClick={() => retryEntry(entry.id)}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Retry
                            </button>
                      </div>
                    )}
            </div>
          )}

                        <div className="text-right">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            entry.status === 'success' 
                              ? 'bg-green-100 text-green-800'
                              : entry.status === 'error'
                              ? 'bg-red-100 text-red-800'
                              : entry.status === 'processing'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {entry.status === 'success' && 'Issued'}
                            {entry.status === 'error' && 'Failed'}
                            {entry.status === 'processing' && 'Processing...'}
                            {entry.status === 'pending' && 'Pending'}
                </span>
                            </div>
              </div>

                      {/* Success Details */}
                      {entry.status === 'success' && entry.result && (
                        <div className="mt-4 p-4 bg-green-100 rounded-lg">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium text-green-900">Credential Details</h4>
                            {/* View Certificate Button */}
                            {entry.result.certificate_url && (
                            <button
                                onClick={() => window.open(entry.result.certificate_url, '_blank')}
                                className="flex items-center px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                View Certificate
                            </button>
                    )}
                        </div>
                        
                          <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                              <span className="font-medium">Credential ID:</span>
                              <p className="text-green-800 font-mono break-all">
                                {entry.result.credential_id}
                            </p>
                          </div>
                          <div>
                              <span className="font-medium">Blockchain Hash:</span>
                              <p className="text-green-800 font-mono break-all">
                                {entry.result.credential_hash || 'N/A'}
                            </p>
                          </div>
                          <div>
                              <span className="font-medium">Status:</span>
                              <p className="text-green-800 font-semibold">Issued Successfully</p>
                          </div>
                          <div>
                              <span className="font-medium">Certificate:</span>
                              <p className="text-green-800">
                                {entry.result.certificate_url ? 'Available with QR Code' : 'Not Available'}
                            </p>
                          </div>
                        </div>

                          {/* QR Code */}
                          {entry.result.qr_code_data?.qr_code_image && (
                            <div className="mt-4 p-3 bg-white rounded-lg border">
                              <h5 className="font-medium text-green-900 mb-2">Verification QR Code</h5>
                              <div className="flex items-center space-x-4">
                                <img
                                  src={`data:image/png;base64,${entry.result.qr_code_data.qr_code_image}`}
                                  alt="QR Code"
                                  className="w-16 h-16 border rounded"
                                />
                                <div className="flex-1">
                                  <p className="text-sm text-green-800 mb-2">
                                    Scan this QR code to verify the credential
                                  </p>
                                  {entry.result.qr_code_data.verification_url && (
                                  <button
                                      onClick={() => window.open(entry.result.qr_code_data.verification_url, '_blank')}
                                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                                    >
                                      Verify Online
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      )}
                  </div>
                ))}
              </div>
            </div>
          )}
                  </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}