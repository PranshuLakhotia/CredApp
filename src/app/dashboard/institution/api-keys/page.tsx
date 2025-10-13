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
        const allKeyIds = new Set((data.api_keys || []).map((key: ApiKey) => key._id));
        setHiddenKeys(allKeyIds);
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create new API key
  const createApiKey = async () => {
    const keyName = prompt('Enter API key name:');
    if (!keyName) return;

    try {
      const response = await fetch('http://localhost:8000/api/v1/issuer/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ name: keyName })
      });

      if (response.ok) {
        await fetchApiKeys();
        alert('API key created successfully!');
      } else {
        alert('Failed to create API key');
      }
    } catch (error) {
      console.error('Error creating API key:', error);
      alert('Error creating API key');
    }
  };

  // Delete API key
  const deleteApiKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) return;

    try {
      const response = await fetch(`http://localhost:8000/api/v1/issuer/api-keys/${keyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (response.ok) {
        await fetchApiKeys();
        alert('API key deleted successfully!');
      } else {
        alert('Failed to delete API key');
      }
    } catch (error) {
      console.error('Error deleting API key:', error);
      alert('Error deleting API key');
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

  // Copy key to clipboard
  const copyToClipboard = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      alert('API key copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = key;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('API key copied to clipboard!');
    }
  };

  useEffect(() => {
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

          {/* Create API Key Button */}
          <div className="mb-8">
            <button
              onClick={createApiKey}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New API Key
            </button>
          </div>

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
