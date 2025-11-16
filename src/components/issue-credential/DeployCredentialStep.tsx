'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, AlertTriangle, Loader2, Download, Copy, ExternalLink, QrCode } from 'lucide-react';
import { buildApiUrl } from '@/config/api';

interface CredentialData {
  credential_id: string;
  status: string;
  credential_title?: string;
  issuer_name?: string;
  skill_tags?: string[];
  learner_name?: string;
  learner_id?: string;
  metadata?: any;
  vc_payload?: any;
  blockchain_data?: any;
  qr_code_data?: any;
  artifact_url?: string;
}

interface DeployCredentialStepProps {
  credentialId: string;
  initialData?: CredentialData | null;
  onComplete: (data: CredentialData) => void;
  onBack: () => void;
  onNewCredential: () => void;
  onError: (error: string) => void;
}

export function DeployCredentialStep({ 
  credentialId, 
  initialData, 
  onComplete, 
  onBack, 
  onNewCredential, 
  onError 
}: DeployCredentialStepProps) {
  const [isDeploying, setIsDeploying] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credentialData, setCredentialData] = useState<CredentialData | null>(initialData || null);
  const [deployOptions, setDeployOptions] = useState({
    generate_qr: true,
    learner_wallet: ''
  });
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'pending' | 'completed' | 'failed'>('idle');

  useEffect(() => {
    if (initialData) {
      setCredentialData(initialData);
    }
  }, [initialData]);

  const handleDeploy = async () => {
    setIsDeploying(true);
    setError(null);
    setDeploymentStatus('pending');

    try {
      const apiKeyResponse = await fetch(buildApiUrl('/issuer/api-keys'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (!apiKeyResponse.ok) {
        throw new Error('Failed to get API key');
      }

      const apiKeys = await apiKeyResponse.json();
      const apiKey = apiKeys[0].key;

      const payload = {
        generate_qr: deployOptions.generate_qr,
        learner_wallet: deployOptions.learner_wallet || undefined
      };

      const response = await fetch(buildApiUrl(`/issuer/credentials/${credentialId}/deploy`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Deployment failed');
      }

      const result = await response.json();
      setDeploymentStatus('pending');
      setIsDeploying(false);
      setIsPolling(true);

      // Start polling for deployment completion
      pollDeploymentStatus(apiKey);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deployment failed');
      setIsDeploying(false);
      setDeploymentStatus('failed');
    }
  };

  const pollDeploymentStatus = async (apiKey: string) => {
    const maxAttempts = 60; // 10 minutes max
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(buildApiUrl(`/issuer/credentials/${credentialId}`), {
          headers: {
            'X-API-Key': apiKey
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`Deployment Status check ${attempts + 1}/${maxAttempts}:`, data.status);

          if (data.status === 'verified') {
            setDeploymentStatus('completed');
            setIsPolling(false);
            setCredentialData(data);
            onComplete(data);
            return;
          } else if (data.status === 'blockchain_failed') {
            setDeploymentStatus('failed');
            setIsPolling(false);
            setError(`Blockchain deployment failed: ${data.blockchain_data?.blockchain_error || 'Unknown error'}`);
            return;
          }

          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(poll, 10000); // Poll every 10 seconds
          } else {
            setDeploymentStatus('failed');
            setIsPolling(false);
            setError('Deployment timeout - please check credential status later');
          }
        }
      } catch (err) {
        console.warn(`Deployment status check failed:`, err);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000);
        } else {
          setDeploymentStatus('failed');
          setIsPolling(false);
          setError('Failed to check deployment status');
        }
      }
    };

    poll();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const downloadCertificate = () => {
    if (credentialData?.artifact_url) {
      window.open(credentialData.artifact_url, '_blank');
    }
  };

  const openVerificationLink = () => {
    if (credentialData?.qr_code_data?.verification_url) {
      window.open(credentialData.qr_code_data.verification_url, '_blank');
    }
  };

  if (deploymentStatus === 'completed' && credentialData) {
    return (
      <div className="p-8">
        <div className="max-w-3xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Credential Successfully Issued!
            </h2>
            <p className="text-gray-600">
              Your digital credential has been deployed to the blockchain and is now verifiable
            </p>
          </div>

          {/* Credential Summary */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Credential Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Credential ID</label>
                <p className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                  {credentialData.credential_id}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <p className="text-sm text-gray-900">{credentialData.credential_title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Learner</label>
                <p className="text-sm text-gray-900">
                  {credentialData.learner_name} ({credentialData.learner_id})
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Verified
                </span>
              </div>
            </div>
          </div>

          {/* Blockchain Information */}
          {credentialData.blockchain_data && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-blue-900 mb-4">Blockchain Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-800">Transaction Hash</label>
                  <div className="flex items-center">
                    <p className="text-sm text-blue-700 font-mono bg-white p-2 rounded flex-1">
                      {credentialData.blockchain_data.transaction_hash}
                    </p>
                    <button
                      onClick={() => copyToClipboard(credentialData.blockchain_data.transaction_hash)}
                      className="ml-2 p-1 text-blue-600 hover:text-blue-800"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-800">Credential Hash</label>
                  <div className="flex items-center">
                    <p className="text-sm text-blue-700 font-mono bg-white p-2 rounded flex-1">
                      {credentialData.blockchain_data.credential_hash}
                    </p>
                    <button
                      onClick={() => copyToClipboard(credentialData.blockchain_data.credential_hash)}
                      className="ml-2 p-1 text-blue-600 hover:text-blue-800"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* QR Code and Verification */}
          {credentialData.qr_code_data && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-green-900 mb-4">Verification</h3>
              <div className="flex items-start space-x-6">
                {credentialData.qr_code_data.qr_code_image && (
                  <div className="flex-shrink-0">
                    <img
                      src={`data:image/png;base64,${credentialData.qr_code_data.qr_code_image}`}
                      alt="Credential QR Code"
                      className="w-32 h-32 border border-green-300 rounded-lg"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-green-800 mb-1">Verification URL</label>
                    <div className="flex items-center">
                      <p className="text-sm text-green-700 bg-white p-2 rounded flex-1 font-mono">
                        {credentialData.qr_code_data.verification_url}
                      </p>
                      <button
                        onClick={() => copyToClipboard(credentialData.qr_code_data.verification_url)}
                        className="ml-2 p-1 text-green-600 hover:text-green-800"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={openVerificationLink}
                        className="ml-1 p-1 text-green-600 hover:text-green-800"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-green-700">
                    Scan the QR code or use the verification URL to verify this credential
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={downloadCertificate}
              className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Certificate
            </button>
            <button
              onClick={onNewCredential}
              className="flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Issue Another Credential
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Step 3: Deploy Credential
          </h2>
          <p className="text-gray-600">
            Deploy the credential to the blockchain and generate verification QR code
          </p>
        </div>

        {/* Credential Summary */}
        {credentialData && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Credential Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Title:</span>
                <span className="text-sm text-gray-900">{credentialData.credential_title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Learner:</span>
                <span className="text-sm text-gray-900">
                  {credentialData.learner_name} ({credentialData.learner_id})
                </span>
              </div>
              {credentialData.skill_tags && credentialData.skill_tags.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Skills:</span>
                  <span className="text-sm text-gray-900">{credentialData.skill_tags.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Deployment Options */}
        <div className="space-y-6 mb-6">
          <div className="flex items-center">
            <input
              id="generate_qr"
              type="checkbox"
              checked={deployOptions.generate_qr}
              onChange={(e) => setDeployOptions(prev => ({ ...prev, generate_qr: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="generate_qr" className="ml-2 block text-sm text-gray-900">
              Generate QR Code and overlay on certificate
            </label>
          </div>

          <div>
            <label htmlFor="learner_wallet" className="block text-sm font-medium text-gray-700 mb-2">
              Learner Wallet Address (Optional)
            </label>
            <input
              id="learner_wallet"
              type="text"
              value={deployOptions.learner_wallet}
              onChange={(e) => setDeployOptions(prev => ({ ...prev, learner_wallet: e.target.value }))}
              placeholder="Enter learner's wallet address (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              If not provided, the system will use the learner's registered wallet address
            </p>
          </div>
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

        {/* Deployment Status */}
        {(isDeploying || isPolling) && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center mb-2">
              <Loader2 className="w-5 h-5 text-blue-500 mr-2 animate-spin" />
              <p className="text-sm font-medium text-blue-700">
                {isDeploying ? 'Initiating deployment...' : 'Deploying to blockchain...'}
              </p>
            </div>
            <p className="text-xs text-blue-600">
              This may take several minutes. Please do not close this page.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between">
          <button
            onClick={onBack}
            disabled={isDeploying || isPolling}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Verify
          </button>

          <button
            onClick={handleDeploy}
            disabled={isDeploying || isPolling || deploymentStatus === 'pending'}
            className={`flex items-center px-6 py-2 rounded-md font-medium ${
              !isDeploying && !isPolling && deploymentStatus !== 'pending'
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isDeploying || isPolling ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deploying...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Deploy Credential
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
