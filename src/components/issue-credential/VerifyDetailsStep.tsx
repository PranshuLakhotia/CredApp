'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, AlertTriangle, Loader2, Edit3 } from 'lucide-react';

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

interface VerifyDetailsStepProps {
  credentialId: string;
  initialData?: CredentialData | null;
  onNext: (data: CredentialData) => void;
  onBack: () => void;
  onError: (error: string) => void;
}

export function VerifyDetailsStep({ credentialId, initialData, onNext, onBack, onError }: VerifyDetailsStepProps) {
  const [formData, setFormData] = useState({
    credential_title: '',
    issuer_name: '',
    description: '',
    nsqf_level: 6,
    credential_type: 'digital-certificate',
    tags: [] as string[],
    skill_tags: [] as string[]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    if (initialData) {
      setFormData({
        credential_title: initialData.credential_title || '',
        issuer_name: initialData.issuer_name || '',
        description: `${initialData.credential_title || 'Certificate'} issued by ${initialData.issuer_name || 'Institution'}`,
        nsqf_level: 6,
        credential_type: 'digital-certificate',
        tags: [],
        skill_tags: initialData.skill_tags || []
      });
    } else {
      // Fetch credential data if not provided
      fetchCredentialData();
    }
  }, [credentialId, initialData]);

  const fetchCredentialData = async () => {
    setIsLoading(true);
    try {
      const apiKeyResponse = await fetch('http://localhost:8000/api/v1/issuer/api-keys', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (!apiKeyResponse.ok) {
        throw new Error('Failed to get API key');
      }

      const apiKeys = await apiKeyResponse.json();
      const apiKey = apiKeys[0].key;

      const response = await fetch(`http://localhost:8000/api/v1/issuer/credentials/${credentialId}`, {
        headers: {
          'X-API-Key': apiKey
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch credential data');
      }

      const data = await response.json();
      setFormData({
        credential_title: data.credential_title || '',
        issuer_name: data.issuer_name || '',
        description: data.description || `${data.credential_title || 'Certificate'} issued by ${data.issuer_name || 'Institution'}`,
        nsqf_level: data.nsqf_level || 6,
        credential_type: data.credential_type || 'digital-certificate',
        tags: data.tags || [],
        skill_tags: data.skill_tags || []
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load credential data');
    } finally {
      setIsLoading(false);
    }
  };


  const updateSkillTags = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({ ...prev, skill_tags: tags }));
  };

  const updateTags = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({ ...prev, tags }));
  };

  const handleVerify = async () => {
    setIsVerifying(true);
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

      const apiKeys = await apiKeyResponse.json();
      const apiKey = apiKeys[0].key;

      const payload = {
        credential_title: formData.credential_title,
        issuer_name: formData.issuer_name,
        description: formData.description,
        nsqf_level: formData.nsqf_level,
        credential_type: formData.credential_type,
        tags: formData.tags,
        skill_tags: formData.skill_tags
      };

      const response = await fetch(`http://localhost:8000/api/v1/issuer/credentials/${credentialId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Verification failed');
      }

      const result = await response.json();
      
      // Show success message briefly before advancing
      setTimeout(() => {
        onNext(result);
      }, 1000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
        <p className="text-gray-600">Loading credential data...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Step 2: Verify & Add Metadata
          </h2>
          <p className="text-gray-600">
            Review the auto-extracted data and add additional metadata
          </p>
        </div>

        {/* OCR Extracted Data - Read Only */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            OCR Extracted Data (Auto-filled)
          </h3>
          <div className="space-y-4">
            {/* Certificate Title */}
            <div>
              <label className="block text-sm font-medium text-blue-800 mb-1">
                Certificate Title
              </label>
              <div className="bg-white border border-blue-200 rounded-md px-3 py-2">
                <span className="text-blue-900 font-medium">{formData.credential_title || 'Not extracted'}</span>
              </div>
            </div>

            {/* Issuer Name */}
            <div>
              <label className="block text-sm font-medium text-blue-800 mb-1">
                Issuer Name
              </label>
              <div className="bg-white border border-blue-200 rounded-md px-3 py-2">
                <span className="text-blue-900 font-medium">{formData.issuer_name || 'Not extracted'}</span>
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-blue-800 mb-1">
                Skills
              </label>
              <div className="bg-white border border-blue-200 rounded-md px-3 py-2">
                <span className="text-blue-900 font-medium">
                  {formData.skill_tags.length > 0 ? formData.skill_tags.join(', ') : 'No skills extracted'}
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-3">
            This data was automatically extracted from your certificate. If any information is incorrect, 
            you can contact support to have it corrected.
          </p>
        </div>

        {/* Additional Metadata */}
        <div className="space-y-6">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Auto-generated from certificate data"
            />
            <p className="text-xs text-gray-500 mt-1">
              You can edit this description if needed
            </p>
          </div>

          {/* NSQF Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              NSQF Level
            </label>
            <select
              value={formData.nsqf_level}
              onChange={(e) => setFormData(prev => ({ ...prev, nsqf_level: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                <option key={level} value={level}>Level {level}</option>
              ))}
            </select>
          </div>

          {/* Credential Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Credential Type
            </label>
            <select
              value={formData.credential_type}
              onChange={(e) => setFormData(prev => ({ ...prev, credential_type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="digital-certificate">Digital Certificate</option>
              <option value="micro-credential">Micro Credential</option>
              <option value="badge">Digital Badge</option>
              <option value="diploma">Diploma</option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <input
              type="text"
              value={formData.tags.join(', ')}
              onChange={(e) => updateTags(e.target.value)}
              placeholder="Enter tags separated by commas (e.g., verified, premium, industry-recognized)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Add custom tags to categorize this credential
            </p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {isVerifying && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center">
              <Loader2 className="w-5 h-5 text-green-500 mr-2 animate-spin" />
              <p className="text-sm font-medium text-green-700">
                Verifying credential and running validation checks...
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={onBack}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Upload
          </button>

          <button
            onClick={handleVerify}
            disabled={!formData.credential_title.trim() || isVerifying}
            className={`flex items-center px-6 py-2 rounded-md font-medium ${
              formData.credential_title.trim() && !isVerifying
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Continue to Deployment
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
