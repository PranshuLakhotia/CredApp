'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import RoleGuard from '@/components/auth/RoleGuard';

interface ApiKey {
  _id: string;
  key: string;
  name: string;
  created_at: string;
  last_used: string;
  is_active: boolean;
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(new Set());
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'rejected' | 'not_submitted'>('not_submitted');
  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [nameError, setNameError] = useState('');

  // Fetch verification status
  const fetchVerificationStatus = async () => {
    try {
      const token = localStorage.getItem('access_token');
      console.log('🔍 Fetching verification status with token:', !!token);
      
      const response = await fetch('http://localhost:8000/api/v1/issuer/verification-status', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('🔍 Verification status response:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Full verification response data:', data);
        console.log('🔍 Raw verification_status field:', data.verification_status);
        console.log('🔍 Data keys:', Object.keys(data));
        
        // Use the same field name as InstitutionDashboard
        const status = data.status || data.verification_status || 'not_submitted';
        console.log('🔍 Final resolved status:', status);
        
        setVerificationStatus(status);
      } else {
        console.error('❌ Verification status fetch failed:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        
        // Try to parse as JSON for better error info
        try {
          const errorData = JSON.parse(errorText);
          console.error('❌ Parsed error data:', errorData);
        } catch (parseError) {
          console.error('❌ Could not parse error response as JSON');
        }
      }
    } catch (error) {
      console.error('💥 Error fetching verification status:', error);
    }
  };

  // Fetch API Keys
  const fetchApiKeys = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:8000/api/v1/issuer/api-keys', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setApiKeys(data.api_keys || []);
        // Initialize all keys as hidden by default
        const allKeyIds = new Set<string>((data.api_keys || []).map((key: ApiKey) => key._id));
        setHiddenKeys(allKeyIds);
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create new API key
  const createApiKey = async (keyName?: string) => {
    console.log('🔑 Create API key function called with:', keyName);
    console.log('🔍 Current verification status:', verificationStatus);
    
    // Check verification status before allowing API key generation
    if (verificationStatus !== 'verified') {
      alert(`Your verification status is: ${verificationStatus}. You must be verified to create API keys. Please complete the verification process first.`);
      return;
    }

    // If no keyName provided, try prompt first, then fallback to dialog
    let finalKeyName = keyName;
    if (!finalKeyName) {
      console.log('🔑 Trying prompt dialog...');
      try {
        finalKeyName = prompt('Enter API key name:') || undefined;
        console.log('🔑 Prompt result:', finalKeyName);
      } catch (error) {
        console.error('❌ Prompt failed:', error);
        // Fallback to showing dialog
        setShowKeyDialog(true);
        return;
      }
    }
    
    if (!finalKeyName || finalKeyName.trim() === '') {
      console.log('❌ No key name provided or empty string');
      // Fallback to showing dialog
      setShowKeyDialog(true);
      return;
    }

    console.log('🔑 Creating API key with name:', finalKeyName);
    const token = localStorage.getItem('access_token');
    console.log('🔑 Token exists:', !!token);

    try {
      const response = await fetch('http://localhost:8000/api/v1/issuer/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: finalKeyName })
      });

      console.log('🔑 API response status:', response.status);

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ API key created successfully:', responseData);
        await fetchApiKeys();
        alert(`API key created successfully!\n\nKey: ${responseData.api_key}\n\nPlease copy and store this key securely. It won't be shown again.`);
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to create API key:', response.status, errorData);
        alert(`Failed to create API key: ${errorData.detail || errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('💥 Error creating API key:', error);
      alert(`Error creating API key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Delete API key
  const deleteApiKey = async (keyId: string) => {
    console.log('🗑️ Deleting API key:', keyId);
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      console.log('❌ Delete cancelled by user');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      console.log('🗑️ Delete request with token:', !!token);
      
      const response = await fetch(`http://localhost:8000/api/v1/issuer/api-keys/${keyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('🗑️ Delete response status:', response.status);

      if (response.ok) {
        console.log('✅ API key deleted successfully');
        await fetchApiKeys();
        alert('API key deleted successfully!');
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to delete API key:', response.status, errorData);
        alert(`Failed to delete API key: ${errorData.detail || errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('💥 Error deleting API key:', error);
      alert(`Error deleting API key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Toggle key visibility
  const toggleKeyVisibility = (keyId: string) => {
    setHiddenKeys(prev => {
      const newHidden = new Set(prev);
      if (newHidden.has(keyId)) {
        newHidden.delete(keyId);
      } else {
        newHidden.add(keyId);
      }
      return newHidden;
    });
  };

  // Check if API key name is unique
  const isNameUnique = (name: string): boolean => {
    return !apiKeys.some(key => key.name.toLowerCase() === name.toLowerCase());
  };

  // Copy key to clipboard
  const copyToClipboard = async (key: string) => {
    console.log('📋 Copying API key to clipboard');
    try {
      await navigator.clipboard.writeText(key);
      console.log('✅ API key copied successfully');
      alert('API key copied to clipboard!');
    } catch (error) {
      console.error('❌ Failed to copy to clipboard:', error);
      // Fallback for older browsers
      try {
      const textArea = document.createElement('textarea');
      textArea.value = key;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
      document.body.appendChild(textArea);
        textArea.focus();
      textArea.select();
        const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
        
        if (successful) {
          console.log('✅ API key copied using fallback method');
      alert('API key copied to clipboard!');
        } else {
          throw new Error('Fallback copy failed');
        }
      } catch (fallbackError) {
        console.error('❌ Fallback copy also failed:', fallbackError);
        alert('Failed to copy API key. Please select and copy manually.');
      }
    }
  };

  useEffect(() => {
    fetchVerificationStatus();
    fetchApiKeys();
  }, []);

  return (
    <RoleGuard allowedPath="/dashboard/institution/api-keys" requiredRole="issuer">
      <DashboardLayout title="API Keys Management">
        <div className="w-full p-4 sm:p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">API Keys Management</h1>
            <p className="text-gray-600 mt-2">Manage your institution's API keys for credential issuance</p>
          </div>

          {/* Verification Status Alert */}
          {verificationStatus !== 'verified' && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Verification Required
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Your verification status is: <strong>{verificationStatus}</strong></p>
                    <p>You must be verified to create API keys. Please complete the verification process first.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Create API Key Button */}
          <div className="mb-8 flex gap-4">
            <button
              onClick={() => {
                console.log('🔑 Button clicked!');
                createApiKey();
              }}
              disabled={verificationStatus !== 'verified'}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                verificationStatus === 'verified'
                  ? 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                  : 'text-gray-400 bg-gray-300 cursor-not-allowed'
              }`}
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New API Key
            </button>
            
            <button
              onClick={async () => {
                console.log('🔍 Debug: Checking verification status...');
                await fetchVerificationStatus();
                
                // Also try to trigger auto-verification
                try {
                  const token = localStorage.getItem('access_token');
                  const response = await fetch('http://localhost:8000/api/v1/issuer/trigger-auto-verification', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                    },
                  });
                  
                  if (response.ok) {
                    const data = await response.json();
                    console.log('🔄 Auto-verification triggered:', data);
                    alert(`Auto-verification triggered: ${data.message}`);
                    // Refresh verification status after a delay
                    setTimeout(() => fetchVerificationStatus(), 12000);
                  } else {
                    const errorData = await response.json();
                    console.error('❌ Failed to trigger auto-verification:', errorData);
                    alert(`Failed to trigger auto-verification: ${errorData.detail || 'Unknown error'}`);
                  }
                } catch (error) {
                  console.error('💥 Error triggering auto-verification:', error);
                  alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              🔄 Trigger Auto-Verification
            </button>
          </div>

          {/* API Key Name Dialog */}
          {showKeyDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center">
              <div className="relative p-6 border w-96 shadow-xl rounded-lg bg-white mx-4">
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Create New API Key</h3>
                  <div className="mb-4">
                    <label htmlFor="keyName" className="block text-sm font-medium text-gray-700 mb-2">
                      API Key Name
                    </label>
                    <input
                      id="keyName"
                      type="text"
                      value={newKeyName}
                      onChange={(e) => {
                        const value = e.target.value;
                        setNewKeyName(value);
                        
                        // Check for unique name
                        if (value.trim() && !isNameUnique(value.trim())) {
                          setNameError('This API key name already exists. Please choose a unique name.');
                        } else {
                          setNameError('');
                        }
                      }}
                      placeholder="Enter a unique name for your API key"
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
                        nameError 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      autoFocus
                    />
                    {nameError && (
                      <p className="mt-1 text-sm text-red-600">{nameError}</p>
                    )}
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setShowKeyDialog(false);
                        setNewKeyName('');
                        setNameError('');
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        const trimmedName = newKeyName.trim();
                        if (!trimmedName) {
                          alert('Please enter a name for your API key.');
                          return;
                        }
                        
                        if (!isNameUnique(trimmedName)) {
                          setNameError('This API key name already exists. Please choose a unique name.');
                          return;
                        }
                        
                        setShowKeyDialog(false);
                        createApiKey(trimmedName);
                        setNewKeyName('');
                        setNameError('');
                      }}
                      disabled={!!nameError || !newKeyName.trim()}
                      className={`px-4 py-2 text-sm font-medium rounded-md ${
                        nameError || !newKeyName.trim()
                          ? 'text-gray-400 bg-gray-200 cursor-not-allowed'
                          : 'text-white bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      Create API Key
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* API Keys List */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">Your API Keys</h3>
              
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading API keys...</p>
                </div>
              ) : apiKeys.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2a2 2 0 00-2 2m2-2V5a2 2 0 00-2-2M9 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2a2 2 0 00-2 2m2-2V5a2 2 0 00-2-2" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No API keys</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating your first API key.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {apiKeys.map((apiKey) => (
                    <div key={apiKey._id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-medium text-gray-900">{apiKey.name}</h4>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              apiKey.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {apiKey.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                            <span>Created: {new Date(apiKey.created_at).toLocaleDateString()}</span>
                            {apiKey.last_used && (
                              <span>Last used: {new Date(apiKey.last_used).toLocaleDateString()}</span>
                            )}
                          </div>
                          
                          {/* API Key Display */}
                          <div className="flex items-center space-x-2">
                            <code className="bg-gray-100 px-3 py-2 rounded text-sm font-mono flex-1">
                              {hiddenKeys.has(apiKey._id) ? '••••••••••••••••••••••••••••••••' : apiKey.key}
                            </code>
                            <button
                              onClick={() => toggleKeyVisibility(apiKey._id)}
                              className="inline-flex items-center px-2 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              title={hiddenKeys.has(apiKey._id) ? 'Show key' : 'Hide key'}
                            >
                              {hiddenKeys.has(apiKey._id) ? (
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              ) : (
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                </svg>
                              )}
                            </button>
                            <button
                              onClick={() => copyToClipboard(apiKey.key)}
                              className="inline-flex items-center px-2 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              title="Copy to clipboard"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                          
                          <div className="mt-3">
                            <p className="text-xs text-gray-500">
                              Keep your API keys secure and never share them publicly. Use them in the X-API-Key header for credential issuance requests.
                            </p>
                          </div>
                        </div>
                        
                        <div className="ml-6">
                          <button
                            onClick={() => deleteApiKey(apiKey._id)}
                            className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <svg className="-ml-0.5 mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Usage Information */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-4">How to Use API Keys</h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p>• Include your API key in the <code className="bg-blue-100 px-1 rounded">X-API-Key</code> header when making requests to the credential issuance API</p>
              <p>• API keys are used for authentication when creating and managing credentials</p>
              <p>• Keep your API keys secure and rotate them regularly for better security</p>
              <p>• Each API key can be used to issue unlimited credentials until deleted</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
