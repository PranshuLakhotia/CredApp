'use client';

import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { X } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import RoleGuard from '@/components/auth/RoleGuard';
import { useAuth } from '@/hooks/useAuth';

interface FormData {
  certificateTitle: string;
  issuerOrganization: string;
  mode: string;
  duration: string;
  issueDate: string;
  learnerId: string;
  skills: string[];
}

export const fetchApiKeys = async () => {
  try {
    console.log('🔑 Fetching API keys...');
    const token = localStorage.getItem('access_token');
    console.log('🎫 Access token exists:', !!token);
    
    const response = await fetch('http://localhost:8000/api/v1/issuer/api-keys', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('📡 Fetch API keys response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API keys data received:', data);
      return data.api_keys;
    } else {
      const errorText = await response.text();
      console.error('❌ Failed to fetch API keys:', response.status, errorText);
      return [];
    }
  } catch (error) {
    console.error('💥 Error fetching API keys:', error);
    return [];
  }
};

export const validateLearner = async (learnerId: string) => {
  try {
    console.log('🔍 Checking learner:', learnerId);
    
    // Get API key first
    const apiKeys = await fetchApiKeys();
    if (!apiKeys || apiKeys.length === 0) {
      throw new Error('No API keys found. Please generate an API key first.');
    }
    
    const apiKey = apiKeys[0].key;
    console.log('🔑 Using API key:', apiKey);
    
    const learnerResponse = await fetch(`http://localhost:8000/api/v1/issuer/users/${learnerId}/is-learner`, {
      headers: {
        'x-api-key': apiKey,
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    });
    
    console.log('📡 Learner API response status:', learnerResponse.status);
    console.log('📡 Learner API response headers:', learnerResponse.headers);
    
    if (learnerResponse.ok) {
      const learnerData = await learnerResponse.json();
      console.log('✅ Learner data received:', learnerData);
      
      if (!learnerData.is_learner) {
        throw new Error(`User ${learnerId} is not registered as a learner`);
      }
      
      return learnerData;
    } else {
      const errorText = await learnerResponse.text();
      console.error('❌ Learner API failed:', learnerResponse.status, errorText);
      throw new Error(`Learner validation failed: ${learnerResponse.status} - ${errorText}`);
    }
  } catch (error) {
    console.error('💥 Learner verification exception:', error);
    throw error;
  }
};

export const createCredential = async (payload: any) => {
  try {
    console.log('📝 Step 1: Creating credential in database...');
    console.log('📤 Sending create credential request:', payload);

    const apiKeys = await fetchApiKeys();
    if (!apiKeys || apiKeys.length === 0) {
      throw new Error('No API keys found. Please generate an API key first.');
    }
    
    const apiKey = apiKeys[0].key;

    const createResponse = await fetch('http://localhost:8000/api/v1/issuer/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
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

export const issueCredentialOnBlockchain = async (credentialId: string, learnerAddress: string) => {
  try {
    console.log('⛓️ Step 2: Issuing credential on blockchain...');

    const issuePayload = {
      credential_id: credentialId,
      learner_address: learnerAddress,
      generate_qr: true,
      wait_for_confirmation: false
    };

    console.log('📤 Sending blockchain issue request:', issuePayload);

    const issueResponse = await fetch('http://localhost:8000/api/v1/blockchain/credentials/issue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
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

export default function CertificateForm(): React.JSX.Element {
  const { user } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    certificateTitle: '',
    issuerOrganization: user?.full_name || 'Institution', // Use logged-in user's name
    mode: 'Online',
    duration: '4 Weeks',
    issueDate: new Date().toISOString().split('T')[0], // Today's date
    learnerId: '',
    skills: [],
  });

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [skillInput, setSkillInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [verificationStatus, setVerificationStatus] = useState<{
    learnerCheck: 'pending' | 'success' | 'error';
    apiKeyCheck: 'pending' | 'success' | 'error';
    blockchainCheck: 'pending' | 'success' | 'error';
    allVerified: boolean;
  }>({
    learnerCheck: 'pending',
    apiKeyCheck: 'pending', 
    blockchainCheck: 'pending',
    allVerified: false
  });
  const [verificationData, setVerificationData] = useState<any>(null);
  const [isIssuingCertificate, setIsIssuingCertificate] = useState<boolean>(false);
  const [issuedCertificate, setIssuedCertificate] = useState<any>(null);
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    // Check required fields
    if (!formData.certificateTitle.trim()) {
      newErrors.certificateTitle = 'Certificate title is required';
    }
    if (!formData.learnerId.trim()) {
      newErrors.learnerId = 'Learner ID is required';
    }
    if (formData.skills.length === 0) {
      newErrors.skills = 'At least one skill is required';
    }
    if (!pdfFile) {
      newErrors.pdfFile = 'PDF certificate template is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (name: string, value: string): void => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user makes a selection
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSkill = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
      
      // Clear skills error when user adds a skill
      if (errors.skills) {
        setErrors(prev => ({ ...prev, skills: '' }));
      }
    }
  };

  const handleRemoveSkill = (skillToRemove: string): void => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSave = (): void => {
    console.log('Saved:', { ...formData, banner: bannerFile });
    alert('Form saved!');
  };

  const handleCancel = (): void => {
    setFormData({
      certificateTitle: '',
      issuerOrganization: user?.full_name || 'Institution', // Keep the issuer organization
      mode: 'Online',
      duration: '4 Weeks',
      issueDate: new Date().toISOString().split('T')[0], // Today's date
      learnerId: '',
      skills: [],
    });
    setBannerFile(null);
    setBannerPreview(null);
    setErrors({});
    setCurrentStep(1);
  };

  const handleVerify = (): void => {
    if (validateForm()) {
      setCurrentStep(2);
    }
  };

  const performVerification = async (): Promise<void> => {
    try {
      // Get API key first
      const apiKeys = await fetchApiKeys();
      if (!apiKeys || apiKeys.length === 0) {
        setVerificationStatus(prev => ({ ...prev, apiKeyCheck: 'error' }));
        return;
      }
      
      const apiKey = apiKeys[0].key;

      // Reset verification status
      setVerificationStatus({
        learnerCheck: 'pending',
        apiKeyCheck: 'pending',
        blockchainCheck: 'pending',
        allVerified: false
      });

      const verificationResults: any = {};

      // 1. Check if user is a learner
      try {
        console.log('🔍 Checking learner:', formData.learnerId);
        console.log('🔑 Using API key:', apiKey);
        
        const learnerResponse = await fetch(`http://localhost:8000/api/v1/issuer/users/${formData.learnerId}/is-learner`, {
          headers: {
            'x-api-key': apiKey,
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        
        console.log('📡 Learner API response status:', learnerResponse.status);
        console.log('📡 Learner API response headers:', learnerResponse.headers);
        
        if (learnerResponse.ok) {
          const learnerData = await learnerResponse.json();
          console.log('✅ Learner data received:', learnerData);
          verificationResults.learnerData = learnerData;
          setVerificationStatus(prev => ({ ...prev, learnerCheck: 'success' }));
        } else {
          const errorText = await learnerResponse.text();
          console.error('❌ Learner API failed:', learnerResponse.status, errorText);
          setVerificationStatus(prev => ({ ...prev, learnerCheck: 'error' }));
        }
      } catch (error) {
        console.error('💥 Learner verification exception:', error);
        setVerificationStatus(prev => ({ ...prev, learnerCheck: 'error' }));
      }

      // 2. Check API key validity
      try {
        console.log('🔑 Checking API key validity...');
        
        const apiKeyResponse = await fetch('http://localhost:8000/api/v1/issuer/api-keys', {
          headers: {
            'x-api-key': apiKey,
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        
        console.log('📡 API Key response status:', apiKeyResponse.status);
        
        if (apiKeyResponse.ok) {
          const apiKeyData = await apiKeyResponse.json();
          console.log('✅ API Key data received:', apiKeyData);
          verificationResults.apiKeyData = apiKeyData;
          setVerificationStatus(prev => ({ ...prev, apiKeyCheck: 'success' }));
        } else {
          const errorText = await apiKeyResponse.text();
          console.error('❌ API Key check failed:', apiKeyResponse.status, errorText);
          setVerificationStatus(prev => ({ ...prev, apiKeyCheck: 'error' }));
        }
      } catch (error) {
        console.error('💥 API key verification exception:', error);
        setVerificationStatus(prev => ({ ...prev, apiKeyCheck: 'error' }));
      }

      // 3. Check blockchain status
      try {
        console.log('⛓️ Checking blockchain status...');
        
        const blockchainResponse = await fetch('http://localhost:8000/api/v1/blockchain/network/status', {
          headers: {
            'x-api-key': apiKey,
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        
        console.log('📡 Blockchain response status:', blockchainResponse.status);
        
        if (blockchainResponse.ok) {
          const blockchainData = await blockchainResponse.json();
          console.log('✅ Blockchain data received:', blockchainData);
          verificationResults.blockchainData = blockchainData;
          setVerificationStatus(prev => ({ ...prev, blockchainCheck: 'success' }));
        } else {
          const errorText = await blockchainResponse.text();
          console.error('❌ Blockchain check failed:', blockchainResponse.status, errorText);
          setVerificationStatus(prev => ({ ...prev, blockchainCheck: 'error' }));
        }
      } catch (error) {
        console.error('💥 Blockchain verification exception:', error);
        setVerificationStatus(prev => ({ ...prev, blockchainCheck: 'error' }));
      }

      // Check if all verifications passed after a short delay to ensure state updates
      setTimeout(() => {
        setVerificationStatus(prev => {
          const allPassed = prev.learnerCheck === 'success' && 
                           prev.apiKeyCheck === 'success' && 
                           prev.blockchainCheck === 'success';
          
          if (allPassed) {
            setVerificationData(verificationResults);
          }
          
          return { ...prev, allVerified: allPassed };
        });
      }, 100);

    } catch (error) {
      console.error('Verification process failed:', error);
    }
  };

  const handleIssueCertificate = async (): Promise<void> => {
    if (!verificationStatus.allVerified) return;
    
    setIsIssuingCertificate(true);
    
    try {
      // Get API key from the institution's API keys
      const apiKeys = await fetchApiKeys();
      if (!apiKeys || apiKeys.length === 0) {
        alert('No API keys found. Please generate an API key first in the institution dashboard.');
        return;
      }
      
      // Use the first active API key
      const apiKey = apiKeys[0].key;

      console.log('🚀 Starting credential issuance process...');
      console.log('🔑 Using API Key:', apiKey);
      console.log('🎫 Access Token:', localStorage.getItem('access_token'));

      // STEP 1: Create Credential in Database
      console.log('📝 Step 1: Creating credential in database...');
      
      // Get learner data from verification results
      const learnerData = verificationData?.learnerData?.user_info;
      const learnerAddress = learnerData?.wallet_address || "0x3AF15A0035a717ddb5b4B4D727B7EE94A52Cc4e3"; // Fallback if no wallet address

      const createPayload = {
        credential_id: `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        vc_payload: {
          "@context": ["https://www.w3.org/2018/credentials/v1"],
          "type": ["VerifiableCredential"],
          "credentialSubject": {
            "learner_address": learnerAddress,
            "name": learnerData?.full_name || "Learner Name",
            "course": formData.certificateTitle,
            "grade": "A+",
            "completion_date": formData.issueDate,
            "skills": formData.skills,
            "duration": formData.duration,
            "mode": formData.mode
          },
          "issuer": {
            "name": formData.issuerOrganization,
            "did": "did:example:tech-university" // This should come from issuer profile
          },
          "issuanceDate": new Date().toISOString()
        },
        artifact_url: pdfFile ? URL.createObjectURL(pdfFile) : "",
        idempotency_key: `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        credential_type: "digital-certificate"
      };

      console.log('📤 Sending create credential request:', createPayload);

      const createResponse = await fetch('http://localhost:8000/api/v1/issuer/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify(createPayload)
      });

      console.log('📡 Create credential response status:', createResponse.status);

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        console.error('❌ Failed to create credential:', errorData);
        alert(`Failed to create credential: ${errorData.detail || errorData.message || 'Unknown error'}`);
        return;
      }

      const createResult = await createResponse.json();
      console.log('✅ Credential created successfully:', createResult);

      // STEP 2: Issue on Blockchain
      console.log('⛓️ Step 2: Issuing credential on blockchain...');

      const issuePayload = {
        credential_id: createResult.credential_id,
        learner_address: learnerAddress,
        generate_qr: true,
        wait_for_confirmation: false
      };

      console.log('📤 Sending blockchain issue request:', issuePayload);

      const issueResponse = await fetch('http://localhost:8000/api/v1/blockchain/credentials/issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(issuePayload)
      });

      console.log('📡 Blockchain issue response status:', issueResponse.status);

      if (!issueResponse.ok) {
        const errorData = await issueResponse.json();
        console.error('❌ Failed to issue credential on blockchain:', errorData);
        alert(`Failed to issue credential on blockchain: ${errorData.detail || errorData.message || 'Unknown error'}`);
        return;
      }

      const issueResult = await issueResponse.json();
      console.log('✅ Credential issued on blockchain successfully:', issueResult);

      // Store the final result and move to step 3
      setIssuedCertificate(issueResult);
      setCurrentStep(3);

    } catch (error) {
      console.error('💥 Error in credential issuance process:', error);
      alert('An error occurred while issuing the credential. Please try again.');
    } finally {
      setIsIssuingCertificate(false);
    }
  };

  const handleVerificationComplete = (): void => {
    if (verificationStatus.allVerified) {
      setCurrentStep(3);
    }
  };

  // Trigger verification when step 2 is reached
  useEffect(() => {
    if (currentStep === 2) {
      performVerification();
    }
  }, [currentStep]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    // Validate form before submitting
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get API key from the institution's API keys
      const apiKeys = await fetchApiKeys();
      if (!apiKeys || apiKeys.length === 0) {
        alert('No API keys found. Please generate an API key first in the institution dashboard.');
        return;
      }
      
      // Use the first active API key
      const apiKey = apiKeys[0].key;

      // Prepare the API payload using form data
      const payload = {
        artifact_url: pdfFile ? URL.createObjectURL(pdfFile) : "", // Use uploaded PDF file or empty
        credential_type: "json-ld",
        idempotency_key: `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        metadata: {
          completion_date: formData.issueDate,
          course_name: formData.certificateTitle,
          grade: "A+" // Default grade - you can add this as a form field later
        },
        vc_payload: {
          "@context": [
            "https://www.w3.org/2018/credentials/v1"
          ],
          "credentialSubject": {
            "achievement": formData.certificateTitle,
            "id": formData.learnerId || "did:example:learner",
            "name": "John Doe" // You can add a learner name field later if needed
          },
          "issuer": "did:example:issuer", // This should come from issuer profile
          "type": [
            "VerifiableCredential",
            "EducationalCredential"
          ]
        }
      };

      console.log('Submitting credential with payload:', payload);

      // Send API request
      const response = await fetch('http://localhost:8000/api/v1/issuer/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Credential issued successfully:', result);
        alert('Credential issued successfully!');
        
        // Reset form after successful submission
        handleCancel();
      } else {
        const errorData = await response.json();
        console.error('Failed to issue credential:', errorData);
        alert(`Failed to issue credential: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error issuing credential:', error);
      alert('An error occurred while issuing the credential. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RoleGuard allowedPath="/dashboard/institution/credentials" requiredRole="issuer">
      <DashboardLayout title="Institution Credentials">
        <div className="w-full p-4 sm:p-8">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg p-8">
          
          {/* Step Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-8">
              {/* Step 1 */}
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 1 
                    ? currentStep === 1 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  1
                </div>
                <span className={`ml-3 text-sm ${
                  currentStep >= 1 ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  Fill Details
                </span>
              </div>

              {/* Step 2 */}
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 2 
                    ? currentStep === 2 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  2
                </div>
                <span className={`ml-3 text-sm ${
                  currentStep >= 2 ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  Verification
                </span>
              </div>

              {/* Step 3 */}
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 3 
                    ? currentStep === 3 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  3
                </div>
                <span className={`ml-3 text-sm ${
                  currentStep >= 3 ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  Issue Certificate
                </span>
              </div>
            </div>
          </div>

          {/* Step 1: Fill Details */}
          {currentStep === 1 && (
            <>
              {/* Credentials Info Section */}
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Credentials Info</h2>

              {/* Certificate Title */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Certificate Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="certificateTitle"
              placeholder="Certificate title"
              value={formData.certificateTitle}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                errors.certificateTitle ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.certificateTitle && (
              <p className="text-red-500 text-sm mt-1">{errors.certificateTitle}</p>
            )}
          </div>

          {/* Issuer Organization and Mode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issuer Organization Name
              </label>
              <div className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700">
                {formData.issuerOrganization}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                This is automatically set to your organization name
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mode
              </label>
              <select
                value={formData.mode}
                onChange={(e) => handleSelectChange('mode', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option>Online</option>
                <option>Offline</option>
                <option>Hybrid</option>
              </select>
            </div>
          </div>

          {/* Learner ID */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Learner ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="learnerId"
              placeholder="Enter Learner ID (e.g., did:example:learner123)"
              value={formData.learnerId}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                errors.learnerId ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.learnerId && (
              <p className="text-red-500 text-sm mt-1">{errors.learnerId}</p>
            )}
          </div>

          {/* PDF Certificate Template and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certificate PDF Template *
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Upload the PDF template for the certificate. QR code will be overlaid on top right.
              </p>
              <label className="relative cursor-pointer">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setPdfFile(file);
                    }
                  }}
                  className="hidden"
                />
                <div className="flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400 transition">
                  <span className="text-gray-600">
                    {pdfFile ? pdfFile.name : 'Choose PDF file'}
                  </span>
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
              </label>
              {pdfFile && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm text-blue-700 font-medium">
                      PDF template ready: {pdfFile.name}
                    </p>
                  </div>
                </div>
              )}
              {errors.pdfFile && (
                <p className="text-red-500 text-sm mt-1">{errors.pdfFile}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration
              </label>
              <select
                value={formData.duration}
                onChange={(e) => handleSelectChange('duration', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option>1 Week</option>
                <option>2 Weeks</option>
                <option>3 Weeks</option>
                <option>4 Weeks</option>
                <option>6 Weeks</option>
                <option>8 Weeks</option>
                <option>12 Weeks</option>
              </select>
            </div>
          </div>

          {/* Issue Date Section */}
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Issue Date</h3>

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Issue Date
            </label>
            <input
              type="date"
              value={formData.issueDate}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Issue date is automatically set to today's date
            </p>
          </div>

          {/* Learnings & Skills Section */}
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Learnings & Skills</h3>

          <div className="mb-6">
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill(e as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <svg
                className="absolute right-3 top-2.5 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Skills Tags */}
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill) => (
                <div
                  key={skill}
                  className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full"
                >
                  <span className="text-sm">{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="ml-1 text-blue-700 hover:text-blue-900"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            {errors.skills && (
              <p className="text-red-500 text-sm mt-2">{errors.skills}</p>
            )}
          </div>

              {/* Step 1 Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition font-medium"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleVerify}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                >
                  Verify
                </button>
              </div>
            </>
          )}

          {/* Step 2: Verification */}
          {currentStep === 2 && (
            <>
              <div className="text-center py-12">
                {/* Animated Header */}
                <div className="relative mb-8">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-500 ${
                    verificationStatus.allVerified 
                      ? 'bg-green-100 scale-110' 
                      : 'bg-blue-100 animate-pulse'
                  }`}>
                    {verificationStatus.allVerified ? (
                      <svg className="w-10 h-10 text-green-600 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-10 h-10 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                  </div>
                  
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    {isIssuingCertificate ? 'Issuing Certificate' : 
                     verificationStatus.allVerified ? 'System Verification Complete' : 'Verification in Progress'}
                  </h2>
                  <p className="text-gray-600 max-w-md mx-auto">
                    {isIssuingCertificate ? 'Please wait while we process and issue the digital certificate...' :
                     verificationStatus.allVerified 
                      ? 'All verification checks have passed. The system is ready to issue the digital certificate.'
                      : 'Verifying learner credentials, API authentication, and blockchain connectivity...'
                    }
                  </p>
                </div>
                
                {/* Verification Steps with Cool Animations */}
                <div className="space-y-6 mb-8 max-w-md mx-auto">
                  {/* Learner Check */}
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 transition-all duration-500 hover:shadow-md">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        verificationStatus.learnerCheck === 'success' 
                          ? 'bg-green-100 scale-110' 
                          : verificationStatus.learnerCheck === 'error'
                          ? 'bg-red-100'
                          : 'bg-blue-100 animate-pulse'
                      }`}>
                        {verificationStatus.learnerCheck === 'success' ? (
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : verificationStatus.learnerCheck === 'error' ? (
                          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        ) : (
                          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
                        )}
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Learner Verification</p>
                        <p className="text-sm text-gray-500">
                          {verificationStatus.learnerCheck === 'success' ? 'User is a valid learner' :
                           verificationStatus.learnerCheck === 'error' ? 'Learner verification failed' :
                           'Checking learner status...'}
                        </p>
                        {/* Learner Info Box */}
                        {verificationStatus.learnerCheck === 'success' && verificationData?.learnerData?.user_info && (
                          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="text-xs text-green-700">
                              <div className="font-semibold mb-1">Learner Details:</div>
                              <div>Name: {verificationData.learnerData.user_info.full_name}</div>
                              <div>Email: {verificationData.learnerData.user_info.email}</div>
                              <div>Status: {verificationData.learnerData.user_info.is_active ? 'Active' : 'Inactive'}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* API Key Check */}
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 transition-all duration-500 hover:shadow-md">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        verificationStatus.apiKeyCheck === 'success' 
                          ? 'bg-green-100 scale-110' 
                          : verificationStatus.apiKeyCheck === 'error'
                          ? 'bg-red-100'
                          : 'bg-blue-100 animate-pulse'
                      }`}>
                        {verificationStatus.apiKeyCheck === 'success' ? (
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : verificationStatus.apiKeyCheck === 'error' ? (
                          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        ) : (
                          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
                        )}
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">API Key Validation</p>
                        <p className="text-sm text-gray-500">
                          {verificationStatus.apiKeyCheck === 'success' ? 'API key is valid and active' :
                           verificationStatus.apiKeyCheck === 'error' ? 'API key validation failed' :
                           'Validating API key...'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Blockchain Check */}
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 transition-all duration-500 hover:shadow-md">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        verificationStatus.blockchainCheck === 'success' 
                          ? 'bg-green-100 scale-110' 
                          : verificationStatus.blockchainCheck === 'error'
                          ? 'bg-red-100'
                          : 'bg-blue-100 animate-pulse'
                      }`}>
                        {verificationStatus.blockchainCheck === 'success' ? (
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : verificationStatus.blockchainCheck === 'error' ? (
                          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        ) : (
                          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
                        )}
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Blockchain Status</p>
                        <p className="text-sm text-gray-500">
                          {verificationStatus.blockchainCheck === 'success' ? 'Blockchain network is ready' :
                           verificationStatus.blockchainCheck === 'error' ? 'Blockchain connection failed' :
                           'Checking blockchain status...'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-medium"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleIssueCertificate}
                    disabled={!verificationStatus.allVerified || isIssuingCertificate}
                    className={`px-8 py-3 rounded-lg transition font-medium text-lg ${
                      verificationStatus.allVerified && !isIssuingCertificate
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isIssuingCertificate ? 'Processing Certificate...' : 
                     verificationStatus.allVerified ? 'Issue Digital Certificate' : 'Verification Required'}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Step 3: Certificate Issued */}
          {currentStep === 3 && (
            <>
              <div className="py-8 w-full">
                {/* Success Header */}
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Certificate Successfully Issued</h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Your digital certificate has been successfully created and deployed on the blockchain. 
                    The certificate is now verifiable and tamper-proof.
                  </p>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full px-6">
                  
                  {/* Blockchain Information Block */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-8 shadow-sm w-full">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Blockchain Record</h3>
                        <p className="text-sm text-gray-600">Immutable certificate data</p>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Certificate ID</label>
                        <p className="text-gray-900 font-mono text-sm bg-white p-3 rounded border break-all">
                          {issuedCertificate?.credential_id || 'N/A'}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Blockchain Hash</label>
                        <p className="text-gray-900 font-mono text-sm bg-white p-3 rounded border break-all">
                          {issuedCertificate?.credential_hash || 'N/A'}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Transaction Hash</label>
                        <p className="text-gray-900 font-mono text-sm bg-white p-3 rounded border break-all">
                          {issuedCertificate?.transaction_hash || 'N/A'}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">Blockchain Status</span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {issuedCertificate?.status || 'Unknown'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Network:</span>
                          <p className="font-medium">{issuedCertificate?.blockchain_data?.network || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Issued At:</span>
                          <p className="font-medium">{issuedCertificate?.issued_at ? new Date(issuedCertificate.issued_at).toLocaleString() : 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Certificate Details Block */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-8 shadow-sm">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Certificate Details</h3>
                        <p className="text-sm text-gray-600">Credential information</p>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Certificate Title</label>
                        <p className="text-lg font-bold text-gray-900 bg-white p-4 rounded border">
                          {formData.certificateTitle}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Issuing Organization</label>
                        <p className="text-gray-900 bg-white p-4 rounded border">
                          {formData.issuerOrganization}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Learner Name</label>
                        <p className="text-gray-900 bg-white p-4 rounded border">
                          {verificationData?.learnerData?.user_info?.full_name || 'N/A'}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Issue Date:</span>
                          <p className="font-medium">{formData.issueDate}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Duration:</span>
                          <p className="font-medium">{formData.duration}</p>
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-gray-600 text-sm">Skills Certified:</span>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {formData.skills.map((skill, index) => (
                            <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* QR Code Block */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-8 shadow-sm">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Verification QR</h3>
                        <p className="text-sm text-gray-600">Instant verification</p>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      {issuedCertificate?.qr_code_data?.qr_code_image ? (
                        <>
                          <div className="bg-white p-6 rounded-lg border-2 border-gray-200 mb-6 inline-block">
                            <img
                              src={`data:image/png;base64,${issuedCertificate.qr_code_data.qr_code_image}`}
                              alt="Certificate QR Code"
                              className="w-40 h-40 mx-auto"
                            />
                          </div>
                          <p className="text-sm text-gray-600">
                            Scan this QR code to instantly verify the certificate authenticity
                          </p>
                        </>
                      ) : (
                        <div className="bg-white p-8 rounded-lg border-2 border-gray-200">
                          <svg className="w-16 h-16 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                          </svg>
                          <p className="text-sm text-gray-500">QR code not available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center mt-12">
                  <button
                    type="button"
                    onClick={() => setShowCertificateModal(true)}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-lg shadow-md hover:shadow-lg"
                  >
                    View Full Certificate
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // Navigate back to dashboard overview
                      window.location.href = '/dashboard/institution';
                    }}
                    className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium text-lg shadow-md hover:shadow-lg"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            </>
          )}
        </form>
        </div>

        {/* Certificate Modal */}
        {showCertificateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Digital Certificate</h3>
                <button
                  onClick={() => setShowCertificateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6">
                {/* PDF Certificate Display with QR Overlay */}
                <div className="relative bg-white border border-gray-200 rounded-lg shadow-lg mb-6">
                  {/* QR Code Overlay - Top Right */}
                  {issuedCertificate?.qr_code_data?.qr_code_image && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className="bg-white p-2 rounded-lg border border-gray-300 shadow-lg">
                        <img
                          src={`data:image/png;base64,${issuedCertificate.qr_code_data.qr_code_image}`}
                          alt="Certificate QR Code"
                          className="w-16 h-16"
                        />
                      </div>
                    </div>
                  )}

                  {/* PDF Display */}
                  <div className="w-full h-auto">
                    {pdfFile ? (
                      <iframe
                        src={URL.createObjectURL(pdfFile)}
                        className="w-full h-[800px] border-0 rounded-lg"
                        title="Certificate PDF"
                      />
                    ) : (
                      <div className="p-12 text-center text-gray-500">
                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-lg">PDF template not available</p>
                        <p className="text-sm">Please upload a PDF template in the form</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Blockchain Verification Details */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Blockchain Verification Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Transaction Hash: </span>
                      <p className="font-mono text-xs break-all">{issuedCertificate?.transaction_hash || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Credential Hash: </span>
                      <p className="font-mono text-xs break-all">{issuedCertificate?.credential_hash || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Network: </span>
                      <span className="font-semibold">{issuedCertificate?.blockchain_data?.network || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Issued At: </span>
                      <span className="font-semibold">{issuedCertificate?.issued_at ? new Date(issuedCertificate.issued_at).toLocaleString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  This certificate is blockchain-verified and tamper-proof
                </p>
                <button
                  onClick={() => setShowCertificateModal(false)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </RoleGuard>
  );
}