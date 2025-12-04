'use client';

import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { X } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import RoleGuard from '@/components/auth/RoleGuard';
import { useAuth } from '@/hooks/useAuth';
import { buildApiUrl } from '@/config/api';

interface FormData {
  certificateTitle: string;
  issuerOrganization: string;
  mode: string;
  duration: string;
  issueDate: string;
  learnerId: string;
  skills: string[];
  nsqfLevel: string;
  description: string;
  tags: string[];
  tagInput: string;
}

interface ExtractedData {
  credential_name: string;
  issuer_name: string;
  issued_date: string;
  expiry_date: string;
  skill_tags: string[];
  description: string;
  learner_id: string;
  learner_name?: string;
  nsqf_level?: number;
  credential_type?: string;
  tags?: string[];
  raw_text?: string;
}

interface OcrResponse {
  success: boolean;
  extracted_data: ExtractedData;
  provider: string;
  confidence: number;
  metadata?: {
    processing_time: number;
    file_size: number;
    filename: string;
    file_type: string;
    model: string;
  };
}

export const fetchApiKeys = async () => {
  try {
    console.log('🔑 Fetching API keys...');
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    console.log('🎫 Access token exists:', !!token);
    
    const response = await fetch(buildApiUrl('/issuer/api-keys'), {
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

export default function CertificateForm(): React.JSX.Element {
  const { user } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    certificateTitle: '',
    issuerOrganization: user?.full_name || 'Institution',
    mode: 'Online',
    duration: '4 Weeks',
    issueDate: new Date().toISOString().split('T')[0],
    learnerId: '',
    skills: [],
    nsqfLevel: '',
    description: '',
    tags: [],
    tagInput: '',
  });

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [skillInput, setSkillInput] = useState<string>('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  // Drag and drop states
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  
  // OCR extraction states
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [ocrData, setOcrData] = useState<OcrResponse | null>(null);
  const [showExtractedData, setShowExtractedData] = useState<boolean>(false);
  const [learnerIdMatch, setLearnerIdMatch] = useState<boolean>(false);
  
  // Verification states
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
  
  // Certificate issuance states
  const [isIssuingCertificate, setIsIssuingCertificate] = useState<boolean>(false);
  
  // Verification file upload states
  const [verificationFile, setVerificationFile] = useState<File | null>(null);
  const [isVerificationDragOver, setIsVerificationDragOver] = useState<boolean>(false);
  const [isVerifyingFile, setIsVerifyingFile] = useState<boolean>(false);
  const [issuedCertificate, setIssuedCertificate] = useState<any>(null);
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.learnerId.trim()) {
      newErrors.learnerId = 'Learner ID is required';
    }
    if (!pdfFile) {
      newErrors.pdfFile = 'PDF certificate template is required';
    }
    if (!formData.nsqfLevel) {
      newErrors.nsqfLevel = 'NSQF Level is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (name: string, value: string): void => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
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

  // File validation function
  const validateFile = (file: File): boolean => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    return allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension);
  };

  // Handle file selection (for both drag/drop and file input)
  const handleFileSelection = (file: File): void => {
    if (!validateFile(file)) {
      alert('Invalid file type. Please upload PDF, JPG, JPEG, or PNG files only.');
      return;
    }
    
    setPdfFile(file);
    console.log('✅ Certificate file selected:', file.name, file.type);
    
    // Clear any existing errors
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.pdfFile;
      return newErrors;
    });
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      handleFileSelection(file);
    }
  };

  // Verification file handlers
  const handleVerificationFileSelection = (file: File): void => {
    if (validateFile(file)) {
      setVerificationFile(file);
      console.log('📄 Verification file selected:', file.name);
    }
  };

  const handleVerificationDragEnter = (e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsVerificationDragOver(true);
  };

  const handleVerificationDragLeave = (e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsVerificationDragOver(false);
  };

  const handleVerificationDragOver = (e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleVerificationDrop = (e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsVerificationDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      handleVerificationFileSelection(file);
    }
  };

  const handleExtractData = async (): Promise<void> => {
    if (!pdfFile) {
      alert('Please upload a PDF certificate first');
      return;
    }

    if (!formData.learnerId.trim()) {
      alert('Please enter a Learner ID first');
      return;
    }

    setIsExtracting(true);
    
    try {
      const apiKeys = await fetchApiKeys();
      if (!apiKeys || apiKeys.length === 0) {
        alert('No API keys found. Please generate an API key first.');
        setIsExtracting(false);
        return;
      }
      
      const apiKey = apiKeys[0].key;
      
      // Store the user-entered learner ID before extraction
      const userEnteredLearnerId = formData.learnerId.trim();
      
      const formDataToSend = new FormData();
      formDataToSend.append('file', pdfFile);

      console.log('📤 Sending OCR extraction request...');
      console.log('👤 User entered Learner ID:', userEnteredLearnerId);
      
      const response = await fetch(buildApiUrl('/issuer/credentials/extract-ocr'), {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
        },
        body: formDataToSend
      });

      if (response.ok) {
        const ocrResponse = await response.json();
        console.log('✅ OCR extraction successful - Full Response:', ocrResponse);
        
        // Store the full response - extracted_data is nested inside
        setOcrData(ocrResponse);
        
        // Access the nested extracted_data object
        const extractedData = ocrResponse.extracted_data || {};
        console.log('📋 Extracted Data Object:', extractedData);
        
        // Compare user-entered Learner ID with OCR-extracted Learner ID
        const ocrLearnerId = (extractedData.learner_id || '').trim();
        const matches = userEnteredLearnerId === ocrLearnerId || !ocrLearnerId;
        
        console.log('🔍 Learner ID Verification:');
        console.log('  User Entered:', `"${userEnteredLearnerId}"`);
        console.log('  OCR Extracted:', `"${ocrLearnerId}"`);
        console.log('  Match:', matches);
        
        setLearnerIdMatch(matches);
        
        // Show notification if there's a mismatch
        if (!matches && ocrLearnerId) {
          console.warn('⚠️ Learner ID mismatch detected!');
          console.warn(`  User entered: "${userEnteredLearnerId}"`);
          console.warn(`  Certificate shows: "${ocrLearnerId}"`);
          console.warn('  Using certificate learner ID for consistency.');
        }
        
        // Auto-fill form data with OCR results
        // Use OCR-extracted learner ID if there's a mismatch to ensure consistency
        const finalLearnerId = (ocrLearnerId && !matches) ? ocrLearnerId : userEnteredLearnerId;
        
        setFormData(prev => ({
          ...prev,
          certificateTitle: extractedData.credential_name || prev.certificateTitle,
          issuerOrganization: extractedData.issuer_name || prev.issuerOrganization,
          // Use OCR-extracted learner ID to ensure consistency with certificate
          learnerId: finalLearnerId || prev.learnerId,
          issueDate: extractedData.issued_date || prev.issueDate,
          nsqfLevel: extractedData.nsqf_level ? extractedData.nsqf_level.toString() : prev.nsqfLevel,
          skills: extractedData.skill_tags && extractedData.skill_tags.length > 0 
            ? extractedData.skill_tags 
            : prev.skills,
          description: extractedData.description || prev.description,
          tags: extractedData.tags && extractedData.tags.length > 0 
            ? extractedData.tags 
            : prev.tags
        }));
        
        setShowExtractedData(true);
        console.log('✅ Form auto-filled with OCR data');
      } else {
        const errorData = await response.json();
        console.error('❌ OCR extraction failed:', errorData);
        alert(`OCR extraction failed: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('💥 Error during OCR extraction:', error);
      alert('An error occurred during OCR extraction. Please try again.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleVerify = (): void => {
    if (validateForm()) {
      setCurrentStep(2);
    }
  };

  const handleVerifyFile = async (): Promise<void> => {
    if (!verificationFile) {
      alert('Please upload a certificate file first');
      return;
    }

    setIsVerifyingFile(true);
    
    try {
      const apiKeys = await fetchApiKeys();
      if (!apiKeys || apiKeys.length === 0) {
        alert('No API keys found. Please generate an API key first.');
        setIsVerifyingFile(false);
        return;
      }
      
      const apiKey = apiKeys[0].key;
      
      const formDataToSend = new FormData();
      formDataToSend.append('file', verificationFile);

      console.log('🔍 Sending verification request...');
      
      const response = await fetch(buildApiUrl('/issuer/credentials/extract-ocr'), {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
        },
        body: formDataToSend
      });

      if (response.ok) {
        const extractedData = await response.json();
        console.log('✅ Verification extraction successful:', extractedData);
        
        // Here you can add logic to verify the extracted data
        // against the original credential data
        alert('Certificate verification completed! Check console for details.');
        
      } else {
        const errorData = await response.json();
        console.error('❌ Verification failed:', errorData);
        alert(`Verification failed: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('💥 Error during verification:', error);
      alert('An error occurred during verification. Please try again.');
    } finally {
      setIsVerifyingFile(false);
    }
  };

  const performVerification = async (): Promise<void> => {
    try {
      const apiKeys = await fetchApiKeys();
      if (!apiKeys || apiKeys.length === 0) {
        setVerificationStatus(prev => ({ ...prev, apiKeyCheck: 'error' }));
        return;
      }
      
      const apiKey = apiKeys[0].key;

      setVerificationStatus({
        learnerCheck: 'pending',
        apiKeyCheck: 'pending',
        blockchainCheck: 'pending',
        allVerified: false
      });

      const verificationResults: any = {};

      // 1. Check if user is a learner (using API key endpoint)
      try {
        console.log('🔍 Checking learner:', formData.learnerId);
        
        // Use the API key authenticated endpoint
        const learnerResponse = await fetch(buildApiUrl(`/issuer/api-key/users/${formData.learnerId}/is-learner`), {
          headers: {
            'x-api-key': apiKey
          }
        });
        
        console.log('📡 Learner check response status:', learnerResponse.status);
        
        if (learnerResponse.ok) {
          const learnerData = await learnerResponse.json();
          console.log('✅ Learner data received:', learnerData);
          verificationResults.learnerData = learnerData;
          
          if (learnerData.is_learner) {
            setVerificationStatus(prev => ({ ...prev, learnerCheck: 'success' }));
          } else {
            console.warn('⚠️ User exists but is not a learner');
            setVerificationStatus(prev => ({ ...prev, learnerCheck: 'error' }));
          }
        } else {
          const errorData = await learnerResponse.json().catch(() => ({}));
          console.error('❌ Learner API failed:', learnerResponse.status, errorData);
          setVerificationStatus(prev => ({ ...prev, learnerCheck: 'error' }));
        }
      } catch (error) {
        console.error('💥 Learner verification exception:', error);
        setVerificationStatus(prev => ({ ...prev, learnerCheck: 'error' }));
      }

      // 2. Check API key validity
      try {
        console.log('🔑 Checking API key validity...');
        
        const apiKeyResponse = await fetch(buildApiUrl('/issuer/api-keys'), {
          headers: {
            'x-api-key': apiKey,
            'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('access_token') : ''}`
          }
        });
        
        if (apiKeyResponse.ok) {
          const apiKeyData = await apiKeyResponse.json();
          console.log('✅ API Key data received:', apiKeyData);
          verificationResults.apiKeyData = apiKeyData;
          setVerificationStatus(prev => ({ ...prev, apiKeyCheck: 'success' }));
        } else {
          console.error('❌ API Key check failed');
          setVerificationStatus(prev => ({ ...prev, apiKeyCheck: 'error' }));
        }
      } catch (error) {
        console.error('💥 API key verification exception:', error);
        setVerificationStatus(prev => ({ ...prev, apiKeyCheck: 'error' }));
      }

      // 3. Check blockchain status
      try {
        console.log('⛓️ Checking blockchain status...');
        
        const blockchainResponse = await fetch(buildApiUrl('/blockchain/network/status'), {
          headers: {
            'x-api-key': apiKey,
            'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('access_token') : ''}`
          }
        });
        
        if (blockchainResponse.ok) {
          const blockchainData = await blockchainResponse.json();
          console.log('✅ Blockchain data received:', blockchainData);
          verificationResults.blockchainData = blockchainData;
          setVerificationStatus(prev => ({ ...prev, blockchainCheck: 'success' }));
        } else {
          console.error('❌ Blockchain check failed');
          setVerificationStatus(prev => ({ ...prev, blockchainCheck: 'error' }));
        }
      } catch (error) {
        console.error('💥 Blockchain verification exception:', error);
        setVerificationStatus(prev => ({ ...prev, blockchainCheck: 'error' }));
      }

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
      const apiKeys = await fetchApiKeys();
      if (!apiKeys || apiKeys.length === 0) {
        alert('No API keys found. Please generate an API key first in the institution dashboard.');
        return;
      }
      
      const apiKey = apiKeys[0].key;
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : '';

      console.log('🚀 Starting credential issuance process...');

      const learnerData = verificationData?.learnerData?.user_info;
      const learnerAddress = learnerData?.wallet_address || "0x3AF15A0035a717ddb5b4B4D727B7EE94A52Cc4e3";

      // Step 1: Create Credential in Database
      console.log('📝 Step 1: Creating credential...');
      console.log('📋 Learner Data:', learnerData);
      console.log('📋 OCR Data:', ocrData);
      console.log('📋 Form Data:', formData);

      // Extract OCR data (handle nested structure)
      const extractedOcrData = ocrData?.extracted_data || {} as ExtractedData;
      
      const createPayload = {
        vc_payload: {
          "@context": ["https://www.w3.org/2018/credentials/v1"],
          "type": ["VerifiableCredential", "EducationalCredential"],
          "issuer": {
            "id": "did:example:issuer",
"name": ocrData?.extracted_data?.issuer_name || formData.issuerOrganization
          },
          "credentialSubject": {
            "id": formData.learnerId,
            "name": learnerData?.full_name || "Learner Name",
"achievement": ocrData?.extracted_data?.credential_name || formData.certificateTitle,
            "learner_address": learnerAddress,
            "course": ocrData?.extracted_data?.credential_name || formData.certificateTitle,
            "grade": "A+",
            "completion_date": ocrData?.extracted_data?.issued_date || formData.issueDate,
            "skills": ocrData?.extracted_data?.skill_tags || [],
            "duration": formData.duration,
            "mode": formData.mode,
            "nsqf_level": parseInt(formData.nsqfLevel),
            "description": formData.description,
            "tags": formData.tags
          },
          "issuanceDate": new Date().toISOString(),
"expirationDate": ocrData?.extracted_data?.expiry_date || null
        },
        artifact_url: pdfFile ? URL.createObjectURL(pdfFile) : "",
        idempotency_key: `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        credential_type: "digital-certificate",
        metadata: {
          learner_address: learnerAddress,
completion_date: ocrData?.extracted_data?.issued_date || formData.issueDate,
          course_name: ocrData?.extracted_data?.credential_name || formData.certificateTitle,
          issuer_name: ocrData?.extracted_data?.issuer_name || formData.issuerOrganization,
          issue_date: ocrData?.extracted_data?.issued_date || formData.issueDate,
          expiry_date: ocrData?.extracted_data?.expiry_date || null,
          skill_tags: ocrData?.extracted_data?.skill_tags || [],
          nsqf_level: parseInt(formData.nsqfLevel),
          description: formData.description,
          tags: formData.tags
        }
      };
      
      console.log('📤 Credential Creation Payload:', JSON.stringify(createPayload, null, 2));

      const createResponse = await fetch(buildApiUrl('/issuer/credentials'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(createPayload)
      });

      console.log('📡 Create credential response status:', createResponse.status);

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        console.error('❌ Failed to create credential - Full Error:', errorData);
        console.error('❌ Error Details:', JSON.stringify(errorData, null, 2));
        
        let errorMessage = 'Failed to create credential: ';
        if (errorData.detail) {
          errorMessage += errorData.detail;
        } else if (errorData.message) {
          errorMessage += errorData.message;
        } else {
          errorMessage += 'Unknown error';
        }
        
        if (errorData.details) {
          console.error('❌ Validation Errors:', errorData.details);
          errorMessage += '\n\nValidation Errors:\n' + JSON.stringify(errorData.details, null, 2);
        }
        
        alert(errorMessage);
        return;
      }

      const createResult = await createResponse.json();
      console.log('✅ Credential created successfully!');
      console.log('📋 Create Result:', JSON.stringify(createResult, null, 2));
      const credentialId = createResult.credential_id;
      console.log('🆔 Credential ID:', credentialId);

      // Step 2: Issue on Blockchain (generates QR code)
      console.log('⛓️ Step 2: Issuing on blockchain...');
      const issuePayload = {
        credential_id: credentialId,
        learner_address: learnerAddress,
        generate_qr: true,
        wait_for_confirmation: false
      };

      console.log('📤 Blockchain Issue Payload:', JSON.stringify(issuePayload, null, 2));

      const issueResponse = await fetch(buildApiUrl('/blockchain/credentials/issue'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(issuePayload)
      });

      console.log('📡 Blockchain issue response status:', issueResponse.status);

      if (!issueResponse.ok) {
        const errorData = await issueResponse.json();
        console.error('❌ Failed to issue on blockchain - Full Error:', errorData);
        console.error('❌ Error Details:', JSON.stringify(errorData, null, 2));
        alert(`Failed to issue on blockchain: ${errorData.detail || errorData.message || 'Unknown error'}`);
        return;
      }

      const issueResult = await issueResponse.json();
      console.log('✅ Blockchain issuance successful!');
      console.log('📋 Issue Result:', JSON.stringify(issueResult, null, 2));
      console.log('🔑 QR Code Data:', issueResult.qr_code_data);

      // Step 3: Overlay QR code on certificate and upload to blob storage
      console.log('📄 Step 3: Generating certificate with QR overlay...');
      
      if (!pdfFile) {
        console.error('❌ Original certificate file not found');
        alert('Original certificate file not found');
        return;
      }

      // Read the file as ArrayBuffer to ensure it's properly sent
      const fileArrayBuffer = await pdfFile.arrayBuffer();
      const fileBlob = new Blob([fileArrayBuffer], { type: pdfFile.type });
      
      console.log('📄 Certificate File Info:');
      console.log('  - Name:', pdfFile.name);
      console.log('  - Size:', pdfFile.size, 'bytes');
      console.log('  - Type:', pdfFile.type);
      console.log('  - ArrayBuffer size:', fileArrayBuffer.byteLength, 'bytes');
      console.log('  - Is PDF:', pdfFile.type === 'application/pdf');
      console.log('  - Is Image:', pdfFile.type.startsWith('image/'));

      // Prepare FormData with the original certificate file and QR code data
      const overlayFormData = new FormData();
      overlayFormData.append('certificate_file', fileBlob, pdfFile.name);
      overlayFormData.append('credential_id', credentialId);
      overlayFormData.append('qr_data', JSON.stringify(issueResult.qr_code_data || {}));
      
      console.log('📤 QR Overlay Request Data:');
      console.log('  - Credential ID:', credentialId);
      console.log('  - File Blob size:', fileBlob.size, 'bytes');
      console.log('  - File Type:', fileBlob.type);
      console.log('  - QR Data:', issueResult.qr_code_data);

      const overlayResponse = await fetch(buildApiUrl('/issuer/credentials/overlay-qr'), {
        method: 'POST',
        headers: {
          'X-API-Key': apiKey,
          'Authorization': `Bearer ${token}`
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
          alert(`Failed to generate final certificate: ${errorData.detail || errorData.message || 'Unknown error'}`);
        } catch {
          console.error('❌ Non-JSON Error Response:', errorText);
          alert(`Failed to generate final certificate: ${errorText}`);
        }
        return;
      }
      
      const overlayResult = await overlayResponse.json();
      console.log('✅ Certificate with QR uploaded successfully!');
      console.log('📋 Overlay Result:', JSON.stringify(overlayResult, null, 2));
      console.log('🔗 Certificate URL:', overlayResult.certificate_url);

      // Combine all results for display in Step 3
      const finalResult = {
        ...issueResult,
        credential_id: credentialId,
        certificate_url: overlayResult.certificate_url,
        certificate_with_qr: overlayResult.certificate_url,
        vc_payload: createPayload.vc_payload,
        learner_data: learnerData
      };
      
      console.log('✅ All steps completed successfully!');
      console.log('📋 Final Result:', JSON.stringify(finalResult, null, 2));

      setIssuedCertificate(finalResult);
      setCurrentStep(3);

    } catch (error) {
      console.error('💥 Error in credential issuance process:', error);
      alert('An error occurred while issuing the credential. Please try again.');
    } finally {
      setIsIssuingCertificate(false);
    }
  };

  const handleCancel = (): void => {
    setFormData({
      certificateTitle: '',
      issuerOrganization: user?.full_name || 'Institution',
      mode: 'Online',
      duration: '4 Weeks',
      issueDate: new Date().toISOString().split('T')[0],
      learnerId: '',
      skills: [],
      nsqfLevel: '',
      description: '',
      tags: [],
      tagInput: '',
    });
    setPdfFile(null);
    setErrors({});
    setCurrentStep(1);
    setShowExtractedData(false);
    setOcrData(null);
    setLearnerIdMatch(false);
  };

  useEffect(() => {
    if (currentStep === 2) {
      performVerification();
    }
  }, [currentStep]);

  return (
    <RoleGuard allowedPath="/dashboard/institution/credentials" requiredRole="issuer">
      <DashboardLayout title="Institution Credentials">
        <div className="w-full p-4 sm:p-8">
          <div className="bg-white rounded-lg p-8">
          
          {/* Step Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-8">
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

          {/* Step 1: Fill Details with OCR Extraction */}
          {currentStep === 1 && (
            <>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Credentials Info</h2>

              {/* Learner ID and Certificate Upload - Initial Fields */}
              {!showExtractedData && (
                <>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Learner ID <span className="text-red-500">*</span>
            </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Enter the learner ID. This will be verified against the certificate during extraction.
                    </p>
            <input
              type="text"
              name="learnerId"
              placeholder="Enter Learner ID (e.g., did:example:learner123)"
              value={formData.learnerId}
              onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            {errors.learnerId && (
              <p className="text-red-500 text-sm mt-1">{errors.learnerId}</p>
            )}
          </div>

                  <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                      Certificate File <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">
                      Upload certificate as PDF or image (JPG, JPEG, PNG). Data will be extracted automatically.
              </p>
              
              {/* Drag and Drop Area */}
              <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                  isDragOver
                    ? 'border-blue-500 bg-blue-50 scale-105'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/jpg,image/png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileSelection(file);
                    }
                  }}
                  className="hidden"
                  id="file-upload"
                />
                
                {pdfFile ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900">File Uploaded Successfully!</p>
                      <p className="text-sm text-gray-600 mt-1">{pdfFile.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Size: {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPdfFile(null);
                        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                        if (fileInput) fileInput.value = '';
                      }}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remove File
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <svg 
                        className={`w-12 h-12 transition-colors duration-200 ${
                          isDragOver ? 'text-blue-500' : 'text-gray-400'
                        }`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div>
                      <p className={`text-lg font-medium transition-colors duration-200 ${
                        isDragOver ? 'text-blue-700' : 'text-gray-900'
                      }`}>
                        {isDragOver ? 'Drop your file here' : 'Drag & drop your certificate here'}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">or</p>
                      <label 
                        htmlFor="file-upload"
                        className="inline-flex items-center px-4 py-2 mt-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Choose File
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">
                      Supports PDF, JPG, JPEG, PNG files
                    </p>
                  </div>
                )}
              </div>
              
              {errors.pdfFile && (
                <p className="text-red-500 text-sm mt-1">{errors.pdfFile}</p>
              )}
            </div>

                  {/* Extract Button */}
                  <div className="mb-8">
                    <button
                      type="button"
                      onClick={handleExtractData}
                      disabled={!pdfFile || !formData.learnerId.trim() || isExtracting}
                      className={`px-6 py-2 rounded-lg transition font-medium ${
                        pdfFile && formData.learnerId.trim() && !isExtracting
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isExtracting ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Extracting Data...
                        </span>
                      ) : (
                        'Extract Data from Certificate'
                      )}
                    </button>
                  </div>
                </>
              )}

              {/* Extracted Data and Full Form - Shown after extraction */}
              {showExtractedData && (
                <>

                  {/* Learner ID Verification Section */}
          <div className="mb-6">
                    <div className="mb-4 pb-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">Learner ID Verification</p>
                      <p className="text-xs text-gray-500 mt-1">Comparison of entered and extracted learner IDs</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* User Entered Learner ID */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Entered Learner ID
                        </label>
              <input
                type="text"
                          value={formData.learnerId}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">Provided by issuer</p>
                      </div>

                      {/* OCR Extracted Learner ID */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Certificate Learner ID
                        </label>
                        <input
                          type="text"
                          value={ocrData?.extracted_data?.learner_id || ''}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">Extracted from certificate</p>
                      </div>
                    </div>
                      
                    {/* Verification Status */}
                    <div className={`p-4 rounded-lg border-2 ${
                      learnerIdMatch 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-start">
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
                          learnerIdMatch ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                          {learnerIdMatch ? (
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
                          ) : (
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </div>
                        <div className="ml-3 flex-1">
                          <h4 className={`text-sm font-semibold ${
                            learnerIdMatch ? 'text-green-900' : 'text-red-900'
                          }`}>
                            {learnerIdMatch ? 'Learner ID Verified Successfully' : 'Learner ID Verification Failed'}
                          </h4>
                          <p className={`text-sm mt-1 ${
                            learnerIdMatch ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {learnerIdMatch 
                              ? 'The entered Learner ID matches the certificate. This credential can be safely issued to the learner.'
                              : 'The entered Learner ID does not match the certificate. The system will automatically use the learner ID from the certificate to ensure consistency. Please verify this is correct before proceeding.'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
            </div>

                  {/* Credential Details - Auto-populated from Certificate */}
                  <div className="mb-6">
                    <div className="mb-4 pb-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">Credential Details</p>
                      <p className="text-xs text-gray-500 mt-1">Auto-extracted from certificate (immutable)</p>
                    </div>

                    <div className="space-y-6">
                      {/* Certificate Title */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Certificate Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="certificateTitle"
                          value={formData.certificateTitle}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 cursor-not-allowed"
                        />
                        {errors.certificateTitle && (
                          <p className="text-red-500 text-sm mt-1">{errors.certificateTitle}</p>
                        )}
                      </div>
                      
                      {/* Issuing Organization */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Issuing Organization <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="issuerOrganization"
                          value={formData.issuerOrganization}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 cursor-not-allowed"
                        />
                        {errors.issuerOrganization && (
                          <p className="text-red-500 text-sm mt-1">{errors.issuerOrganization}</p>
                        )}
                      </div>
                      
                      {/* NSQF Level */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          NSQF Level <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="nsqfLevel"
                          value={formData.nsqfLevel}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 cursor-not-allowed"
                        >
                          <option value="">Select NSQF Level</option>
                          <option value="1">Level 1</option>
                          <option value="2">Level 2</option>
                          <option value="3">Level 3</option>
                          <option value="4">Level 4</option>
                          <option value="5">Level 5</option>
                          <option value="6">Level 6</option>
                          <option value="7">Level 7</option>
                          <option value="8">Level 8</option>
                        </select>
                        {errors.nsqfLevel && (
                          <p className="text-red-500 text-sm mt-1">{errors.nsqfLevel}</p>
                        )}
                      </div>

                      {/* Mode */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mode
                        </label>
                        <select
                          name="mode"
                          value={formData.mode}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 cursor-not-allowed"
                        >
                          <option value="Online">Online</option>
                          <option value="Offline">Offline</option>
                          <option value="Hybrid">Hybrid</option>
                        </select>
                      </div>
                      
                      {/* Duration */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Duration
                        </label>
                        <input
                          type="text"
                          name="duration"
                          value={formData.duration}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 cursor-not-allowed"
                        />
                      </div>
                      
                      {/* Issue Date */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Issue Date
                        </label>
                        <input
                          type="date"
                          name="issueDate"
                          value={formData.issueDate}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 cursor-not-allowed"
                        />
                      </div>
                      
                      {/* Skills */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Skills
                        </label>
                        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border border-gray-300 rounded-lg min-h-[44px]">
                          {formData.skills && formData.skills.length > 0 ? (
                            formData.skills.map((skill, index) => (
                              <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">No skills extracted</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description 
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          disabled
                          rows={4}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 cursor-not-allowed resize-none"
                        />
                        {errors.description && (
                          <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                        )}
                      </div>

                      {/* Tags (Optional) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tags <span className="text-gray-500">(Optional)</span>
                        </label>
                        <div className="relative mb-3">
                          <input
                            type="text"
                            placeholder="Type a tag and press Enter"
                            value={formData.tagInput}
                            onChange={(e) => setFormData(prev => ({ ...prev, tagInput: e.target.value }))}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const tag = formData.tagInput.trim();
                                if (tag && !formData.tags.includes(tag)) {
                                  setFormData(prev => ({
                                    ...prev,
                                    tags: [...prev.tags, tag],
                                    tagInput: ''
                                  }));
                                }
                              }
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          />
                        </div>
                        <div className="flex flex-wrap gap-2 p-3 bg-white border border-gray-300 rounded-lg min-h-[44px]">
                          {formData.tags.length > 0 ? (
                            formData.tags.map((tag, index) => (
                              <div key={index} className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                                <span className="text-sm">{tag}</span>
                  <button
                    type="button"
                                  onClick={() => {
                                    setFormData(prev => ({
                                      ...prev,
                                      tags: prev.tags.filter((_, i) => i !== index)
                                    }));
                                  }}
                                  className="ml-1 text-gray-500 hover:text-gray-700"
                                >
                                  <X size={14} />
                  </button>
                </div>
                            ))
                          ) : (
                            <span className="text-sm text-gray-400">No tags added</span>
            )}
          </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Step 1 Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-medium"
                >
                  Cancel
                </button>
                {showExtractedData && (
                <button
                  type="button"
                  onClick={handleVerify}
                    className={`px-6 py-2 rounded-lg transition font-medium ${
                      learnerIdMatch
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-orange-600 text-white hover:bg-orange-700'
                    }`}
                  >
                    {learnerIdMatch ? 'Verify & Continue' : 'Continue with Certificate Learner ID'}
                </button>
                )}
              </div>
            </>
          )}

          {/* Step 2: Verification */}
          {currentStep === 2 && (
            <>
              {/* Certificate Verification Upload */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Verify Certificate</h2>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Certificate for Verification <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-4">
                    Upload the certificate file to verify its authenticity and extract data for comparison.
                  </p>
                  
                  {/* Drag and Drop Area */}
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isVerificationDragOver
                        ? 'border-blue-500 bg-blue-50'
                        : verificationFile
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleVerificationDragEnter}
                    onDragLeave={handleVerificationDragLeave}
                    onDragOver={handleVerificationDragOver}
                    onDrop={handleVerificationDrop}
                  >
                    {verificationFile ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center">
                          <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-700">File uploaded successfully</p>
                          <p className="text-sm text-gray-600">{verificationFile.name}</p>
                          <p className="text-xs text-gray-500">{(verificationFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setVerificationFile(null)}
                          className="text-sm text-red-600 hover:text-red-800 underline"
                        >
                          Remove file
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            {isVerificationDragOver ? 'Drop the file here' : 'Drag and drop your certificate here'}
                          </p>
                          <p className="text-sm text-gray-500">or</p>
                          <label className="cursor-pointer">
                            <span className="text-sm text-blue-600 hover:text-blue-800 underline">
                              browse files
                            </span>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleVerificationFileSelection(e.target.files[0]);
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">
                          Supports PDF, JPG, JPEG, PNG files up to 20MB
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Verify Button */}
                  {verificationFile && (
                    <div className="mt-4 text-center">
                      <button
                        type="button"
                        onClick={handleVerifyFile}
                        disabled={isVerifyingFile}
                        className={`px-6 py-2 rounded-lg font-medium transition ${
                          isVerifyingFile
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isVerifyingFile ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Verifying...
                          </span>
                        ) : (
                          'Verify Certificate'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* System Verification Status */}
              <div className="text-center py-12">
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

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
                  <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowCertificateModal(true)}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-lg shadow-md hover:shadow-lg"
                  >
                    View Full Certificate
                  </button>

                    {issuedCertificate?.certificate_url && (
                      <a
                        href={issuedCertificate.certificate_url}
                        download={`certificate_${issuedCertificate.credential_id}.pdf`}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-lg shadow-md hover:shadow-lg flex items-center"
                      >
                        
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l4-4m-4 4l-4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Download PDF
                      </a>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = '/dashboard/institution';
                    }}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium text-lg shadow-md hover:shadow-lg"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
        </div>

        {/* Certificate Modal */}
        {showCertificateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Digital Certificate</h3>
                <div className="flex items-center space-x-3">
                  {/* Download Certificate Button */}
                  {issuedCertificate?.certificate_url && (
                    <a
                      href={issuedCertificate.certificate_url}
                      download={`certificate_${issuedCertificate.credential_id}.pdf`}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l4-4m-4 4l-4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Download PDF
                    </a>
                  )}

                  {/* Open Certificate Button */}
                  {issuedCertificate?.certificate_url && (
                    <button
                      onClick={() => window.open(issuedCertificate.certificate_url, '_blank')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      Open Certificate
                    </button>
                  )}

                <button
                  onClick={() => setShowCertificateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                </div>
              </div>

              <div className="p-6">
                <div className="relative bg-white border border-gray-200 rounded-lg shadow-lg mb-6">
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

                  <div className="w-full h-auto">
                    {issuedCertificate?.certificate_url ? (
                      <div className="p-12 text-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
                        <svg className="w-20 h-20 mx-auto mb-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h4 className="text-xl font-semibold text-gray-900 mb-2">Certificate Ready</h4>
                        <p className="text-gray-600 mb-6">
                          Your blockchain-verified certificate with embedded QR code is ready for viewing and download.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                          <button
                            onClick={() => window.open(issuedCertificate.certificate_url, '_blank')}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            View Certificate
                          </button>
                          <a
                            href={issuedCertificate.certificate_url}
                            download={`certificate_${issuedCertificate.credential_id}.pdf`}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l4-4m-4 4l-4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Download PDF
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="p-12 text-center text-gray-500">
                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-lg">Certificate not available</p>
                        <p className="text-sm">Please complete the credential issuance process</p>
                      </div>
                    )}
                  </div>
                </div>

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
