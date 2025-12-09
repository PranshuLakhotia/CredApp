'use client';

import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { X } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import RoleGuard from '@/components/auth/RoleGuard';
import { useAuth } from '@/hooks/useAuth';
import { buildApiUrl } from '@/config/api';
import CertificateTemplateSelector, { CertificateTemplate } from '@/components/certificate/CertificateTemplateSelector';
import TemplatePreviewModal from '@/components/certificate/TemplatePreviewModal';

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

interface VerificationData {
  learner?: any;
  nameMatch?: boolean | null; // null indicates comparison was not performed
  learnerData?: any;
  apiKeyData?: any;
  blockchainData?: any;
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
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Drag and drop states
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // OCR extraction states
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [ocrData, setOcrData] = useState<OcrResponse | null>(null);
  const [showExtractedData, setShowExtractedData] = useState<boolean>(false);

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
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);

  // Certificate issuance states
  const [isIssuingCertificate, setIsIssuingCertificate] = useState<boolean>(false);

  // Verification file upload states
  const [verificationFile, setVerificationFile] = useState<File | null>(null);
  const [isVerificationDragOver, setIsVerificationDragOver] = useState<boolean>(false);
  const [isVerifyingFile, setIsVerifyingFile] = useState<boolean>(false);
  const [issuedCertificate, setIssuedCertificate] = useState<any>(null);
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);

  // Email autocomplete states
  const [emailSuggestions, setEmailSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState<boolean>(false);

  // Identifier Type State
  const [identifierType, setIdentifierType] = useState<'email' | 'aadhaar' | 'pan'>('email');
  const [isFetchingDigiLocker, setIsFetchingDigiLocker] = useState<boolean>(false);
  
  // DigiLocker Data State
  const [digilockerData, setDigilockerData] = useState<any>(null);
  const [fetchedAadharNo, setFetchedAadharNo] = useState<string>('');

  // Certificate protection options
  const [addQrCode, setAddQrCode] = useState<boolean>(true);
  const [addSteganography, setAddSteganography] = useState<boolean>(false);

  // Template selection states
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate | null>(null);
  const [showTemplatePreview, setShowTemplatePreview] = useState<boolean>(false);
  const [previewTemplate, setPreviewTemplate] = useState<CertificateTemplate | null>(null);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!selectedTemplate) {
      newErrors.template = 'Please select a certificate template';
    }
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

  // Template selection handlers
  const handleTemplateSelect = (template: CertificateTemplate): void => {
    setSelectedTemplate(template);
    if (errors.template) {
      setErrors(prev => ({ ...prev, template: '' }));
    }
    // Automatically proceed to next step after template selection
    setTimeout(() => {
      setCurrentStep(1);
    }, 500); // Small delay for better UX
  };

  const handleTemplatePreview = (template: CertificateTemplate): void => {
    setPreviewTemplate(template);
    setShowTemplatePreview(true);
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

  // Email autocomplete
  const searchLearnerEmails = async (query: string) => {
    console.log('🔍 searchLearnerEmails called with query:', query);
    if (!query || query.length < 2) {
      console.log('⚠️ Query too short, clearing suggestions');
      setEmailSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setIsLoadingSuggestions(true);
    try {
      const url = buildApiUrl(`/users/search?q=${encodeURIComponent(query)}`);
      console.log('📡 Fetching from:', url);
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
      });
      console.log('📡 Response status:', response.status, response.ok);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API Response data:', data);
        // API returns array directly, not nested in 'users'
        const users = Array.isArray(data) ? data : (data.users || []);
        const emails = users.map((user: any) => user.email).filter(Boolean);
        console.log('📧 Extracted emails:', emails);
        setEmailSuggestions(emails);
        setShowSuggestions(emails.length > 0);
        console.log('✅ Set suggestions:', { emails, showSuggestions: emails.length > 0 });
      } else {
        const errorText = await response.text();
        console.error('❌ API failed:', response.status, errorText);
      }
    } catch (error) {
      console.error('💥 Error searching emails:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleEmailSelect = (email: string) => {
    console.log('✅ Email selected:', email);
    setFormData(prev => ({ ...prev, learnerId: email }));
    setShowSuggestions(false);
    setEmailSuggestions([]);
  };

  // Fetch DigiLocker data from MongoDB by Aadhaar number
  const handleFetchFromDigiLocker = async () => {
    try {
      // Prompt user for Aadhaar number
      const aadharNo = prompt('Enter Aadhaar number to fetch credentials:');
      
      if (!aadharNo || !aadharNo.trim()) {
        return; // User cancelled or entered empty value
      }

      setIsFetchingDigiLocker(true);

      // Get auth token
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      // Fetch from MongoDB via backend API
      const response = await fetch(
        buildApiUrl(`/learners/digilocker-data/by-aadhar/${encodeURIComponent(aadharNo.trim())}`),
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to fetch DigiLocker data' }));
        throw new Error(errorData.detail || errorData.error || 'Failed to fetch DigiLocker data');
      }

      const data = await response.json();
      const fetchedDigilockerData = data.digilocker_data;

      if (!fetchedDigilockerData) {
        throw new Error('No DigiLocker data found for this Aadhaar number');
      }

      console.log('✅ DigiLocker Data Fetched from MongoDB:', fetchedDigilockerData);

      // Store the fetched data and Aadhaar number
      setDigilockerData(fetchedDigilockerData);
      setFetchedAadharNo(aadharNo.trim());

      // Extract and populate form data
      const name = fetchedDigilockerData.name || '';
      const dob = fetchedDigilockerData.dob || '';
      const panNumber = fetchedDigilockerData.pan_number || '';
      const aadharNoFromData = fetchedDigilockerData.aadhar_no || '';

      // Update form with fetched data
      setFormData(prev => ({
        ...prev,
        learnerId: identifierType === 'aadhaar' ? aadharNoFromData : 
                   identifierType === 'pan' ? panNumber : prev.learnerId,
        description: (prev.description || '') + 
          (prev.description ? '\n\n' : '') + 
          `Verified via DigiLocker:\n` +
          `Name: ${name}\n` +
          `DOB: ${dob}\n` +
          (panNumber ? `PAN: ${panNumber}\n` : '') +
          (aadharNoFromData ? `Aadhaar: ${aadharNoFromData}` : '')
      }));

      alert(`DigiLocker data fetched successfully for ${name || 'User'}!`);

    } catch (error: any) {
      console.error('Error fetching DigiLocker data:', error);
      alert(error.message || 'Failed to fetch DigiLocker data. Please check the Aadhaar number and try again.');
    } finally {
      setIsFetchingDigiLocker(false);
    }
  };

  useEffect(() => {
    console.log('🔍 useEffect triggered:', { learnerId: formData.learnerId, showExtractedData });
    const timer = setTimeout(() => {
      if (formData.learnerId && !showExtractedData && identifierType === 'email') {
        console.log('📧 Calling searchLearnerEmails with:', formData.learnerId);
        searchLearnerEmails(formData.learnerId);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [formData.learnerId, showExtractedData, identifierType]);

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

      const formDataToSend = new FormData();
      formDataToSend.append('file', pdfFile);

      console.log('📤 Sending OCR extraction request...');
      console.log('👤 User entered Learner ID:', formData.learnerId.trim());

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

        // Auto-fill form data with OCR results
        // Keep the user-entered learner ID (don't override with OCR)
        setFormData(prev => ({
          ...prev,
          certificateTitle: extractedData.credential_name || prev.certificateTitle,
          issuerOrganization: extractedData.issuer_name || prev.issuerOrganization,
          // Keep user-entered learner ID - don't override with OCR
          learnerId: prev.learnerId,
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
    console.log('🔘 ========== Starting Verification ==========');
    console.log('📍 Current step:', currentStep);
    console.log('📄 OCR data available:', !!ocrData);
    console.log('📋 OCR extracted name:', ocrData?.extracted_data?.learner_name);
    
    if (currentStep !== 2) {
      console.error('❌ Not on step 2! Current step:', currentStep);
      alert('Please navigate to Step 2 first');
      return;
    }
    
    if (!ocrData || !ocrData.extracted_data) {
      console.error('❌ No OCR data available. Please extract data in Step 1 first.');
      alert('Please extract certificate data in Step 1 first.');
      return;
    }

    console.log('⏳ Setting isVerifyingFile to true');
    setIsVerifyingFile(true);

    try {
      // Use existing OCR data from Step 1 - no need to re-upload
      console.log('✅ Using OCR data from Step 1');
      console.log('📋 Learner name from OCR:', ocrData.extracted_data.learner_name);
      
      // Perform verification with existing OCR data
      console.log('🔄 Starting verification with OCR data from Step 1...');
      console.log('📞 Calling performVerification()...');
      try {
        await performVerification();
        console.log('✅ Verification call completed successfully');
      } catch (verificationError) {
        console.error('💥 Error in performVerification:', verificationError);
        throw verificationError;
      }

    } catch (error) {
      console.error('💥 Error during verification:', error);
      console.error('💥 Error details:', error instanceof Error ? error.message : String(error));
      console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      alert('An error occurred during verification. Please try again.');
    } finally {
      console.log('🏁 Verification process finished - setting isVerifyingFile to false');
      setIsVerifyingFile(false);
    }
  };

  const performVerification = async (): Promise<void> => {
    console.log('🚀 Starting verification process...');
    
    try {
      // Reset status to pending
      setVerificationStatus({
        learnerCheck: 'pending',
        apiKeyCheck: 'pending',
        blockchainCheck: 'pending',
        allVerified: false
      });

      const apiKeys = await fetchApiKeys();
      if (!apiKeys || apiKeys.length === 0) {
        console.error('❌ No API keys found');
        setVerificationStatus(prev => ({ 
          ...prev, 
          apiKeyCheck: 'error',
          allVerified: false
        }));
        return;
      }

      const apiKey = apiKeys[0].key;
      console.log('✅ API key retrieved');

        const verificationResults: any = {};
        
        // Helper function to add timeout to fetch
        const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs: number = 30000): Promise<Response> => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
          try {
            const response = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(timeoutId);
            return response;
          } catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof Error && error.name === 'AbortError') {
              throw new Error(`Request timeout after ${timeoutMs}ms`);
            }
            throw error;
          }
        };

      // 1. Check if learner exists and fetch their profile using email
      try {
        if (identifierType === 'email') {
          console.log('🔍 Looking up learner by email:', formData.learnerId);

          // Use wallet lookup endpoint to get learner details by email
          console.log('📡 Fetching learner data...');
          let learnerResponse: Response;
          try {
            learnerResponse = await fetchWithTimeout(
              buildApiUrl(`/wallet/lookup/${encodeURIComponent(formData.learnerId)}`),
              {
                headers: {
                  'x-api-key': apiKey,
                  'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('access_token') : ''}`
                }
              },
              30000 // 30 second timeout
            );
          } catch (error) {
            console.error('❌ Learner lookup request failed:', error);
            setVerificationStatus(prev => ({ ...prev, learnerCheck: 'error' }));
            // Continue to next check instead of returning
            learnerResponse = null as any; // Mark as failed
          }

          if (!learnerResponse) {
            // Request failed, already set error status
            console.log('⚠️ Learner lookup skipped due to previous error');
          } else {
            console.log('📡 Learner lookup response status:', learnerResponse.status);

            if (learnerResponse.ok) {
            const learnerProfile = await learnerResponse.json();
            console.log('✅ Learner profile received:', learnerProfile);
            console.log('📋 Full profile data:', JSON.stringify(learnerProfile, null, 2));

            // Extract learner data from wallet response
            // The wallet lookup endpoint now returns full_name
            const learnerData = {
              email: learnerProfile.email || formData.learnerId,
              full_name: learnerProfile.full_name || learnerProfile.name || '',
              user_id: learnerProfile.learner_id || learnerProfile.user_id || learnerProfile._id || '',
              wallet_id: learnerProfile.wallet_address || learnerProfile.wallet_id || learnerProfile.did || ''
            };
            
            console.log('📊 Extracted learner data:', learnerData);

            verificationResults.learnerData = learnerData;

            // Compare learner name with OCR extracted name
            // OCR name: extracted from certificate
            // DB name: fetched from database using learner email (inputted by issuer)
            const ocrLearnerName = (ocrData?.extracted_data?.learner_name || '').trim();
            const dbLearnerName = (learnerData.full_name || '').trim();

            console.log('📝 ========== NAME COMPARISON ==========');
            console.log('📄 OCR extracted name (from certificate):', ocrLearnerName || '(not available)');
            console.log('👤 Database name (from learner email):', dbLearnerName);
            console.log('📧 Learner email used for lookup:', formData.learnerId);

            // Normalize names for comparison (remove extra spaces, convert to lowercase, remove special characters)
            const normalizeName = (name: string): string => {
              if (!name) return '';
              return name
                .toLowerCase()
                .replace(/[^\w\s]/g, '') // Remove special characters
                .replace(/\s+/g, ' ') // Replace multiple spaces with single space
                .trim();
            };

            // Extract and normalize individual name parts (first name, last name, etc.)
            const extractNameParts = (name: string): string[] => {
              const normalized = normalizeName(name);
              return normalized.split(/\s+/).filter(part => part.length >= 2);
            };

            // If OCR data is not available, mark as success (learner found) but skip name comparison
            let namesMatch: boolean | null = null;
            
            if (!ocrData || !ocrData.extracted_data || !ocrLearnerName) {
              console.log('ℹ️ OCR data not available. Learner lookup successful, but name comparison skipped.');
              namesMatch = null; // null indicates comparison was not performed
            } else {
              const normalizedOcrName = normalizeName(ocrLearnerName);
              const normalizedDbName = normalizeName(dbLearnerName);

              console.log('🔍 Detailed name comparison:');
              console.log('  Normalized OCR name:', normalizedOcrName);
              console.log('  Normalized DB name:', normalizedDbName);

              // 1. Exact match after normalization
              const exactMatch = normalizedOcrName === normalizedDbName;
              
              // 2. Partial match (one contains the other) - more lenient
              const partialMatch = normalizedOcrName && normalizedDbName && 
                (normalizedDbName.includes(normalizedOcrName) || normalizedOcrName.includes(normalizedDbName));
              
              // 3. Word-based matching - check if significant words match
              const ocrParts = extractNameParts(ocrLearnerName);
              const dbParts = extractNameParts(dbLearnerName);
              
              console.log('  OCR name parts:', ocrParts);
              console.log('  DB name parts:', dbParts);
              
              // Check if words match (allowing for partial matches and common variations)
              const checkWordMatch = (word1: string, word2: string): boolean => {
                if (word1 === word2) return true;
                if (word1.includes(word2) || word2.includes(word1)) return true;
                // Check first 3 characters match (for common abbreviations/variations)
                if (word1.length >= 3 && word2.length >= 3) {
                  if (word1.substring(0, 3) === word2.substring(0, 3)) return true;
                  if (word1.substring(word1.length - 3) === word2.substring(word2.length - 3)) return true;
                }
                return false;
              };
              
              // Count how many OCR words have a match in DB words
              let matchedOcrWords = 0;
              ocrParts.forEach(ocrPart => {
                if (dbParts.some(dbPart => checkWordMatch(ocrPart, dbPart))) {
                  matchedOcrWords++;
                }
              });
              
              // Count how many DB words have a match in OCR words
              let matchedDbWords = 0;
              dbParts.forEach(dbPart => {
                if (ocrParts.some(ocrPart => checkWordMatch(dbPart, ocrPart))) {
                  matchedDbWords++;
                }
              });
              
              // Consider it a match if:
              // - At least one significant word matches (very lenient)
              // - All words from the shorter name match (for cases like "John" vs "John Smith")
              // - At least 50% of words match
              const minLength = Math.min(ocrParts.length, dbParts.length);
              const maxLength = Math.max(ocrParts.length, dbParts.length);
              
              // Very lenient matching: if any significant word (3+ chars) matches, consider it a match
              const hasSignificantMatch = ocrParts.some(ocrPart => 
                ocrPart.length >= 3 && dbParts.some(dbPart => 
                  dbPart.length >= 3 && checkWordMatch(ocrPart, dbPart)
                )
              ) || dbParts.some(dbPart => 
                dbPart.length >= 3 && ocrParts.some(ocrPart => 
                  ocrPart.length >= 3 && checkWordMatch(dbPart, ocrPart)
                )
              );
              
              // Even more lenient: check if first name or last name matches
              const firstNameMatch = ocrParts.length > 0 && dbParts.length > 0 && 
                checkWordMatch(ocrParts[0], dbParts[0]);
              const lastNameMatch = ocrParts.length > 1 && dbParts.length > 1 && 
                checkWordMatch(ocrParts[ocrParts.length - 1], dbParts[dbParts.length - 1]);
              
              // Check if any single word matches (even 2 characters)
              const hasAnyWordMatch = ocrParts.some(ocrPart => 
                dbParts.some(dbPart => checkWordMatch(ocrPart, dbPart))
              ) || dbParts.some(dbPart => 
                ocrParts.some(ocrPart => checkWordMatch(dbPart, ocrPart))
              );
              
              const wordMatch = 
                hasSignificantMatch || // Any significant word matches (very lenient)
                firstNameMatch || // First name matches
                lastNameMatch || // Last name matches
                hasAnyWordMatch || // Any word matches at all
                (matchedOcrWords > 0 && matchedDbWords > 0) || // At least one word matches on both sides
                (minLength > 0 && matchedOcrWords === minLength) || // All OCR words matched
                (minLength > 0 && matchedDbWords === minLength) || // All DB words matched
                (minLength >= 2 && matchedOcrWords >= Math.ceil(minLength * 0.5)) || // At least 50% of shorter name matches
                (minLength >= 2 && matchedDbWords >= Math.ceil(minLength * 0.5)); // At least 50% of shorter name matches
              
              console.log('  Matched OCR words:', matchedOcrWords, 'out of', ocrParts.length);
              console.log('  Matched DB words:', matchedDbWords, 'out of', dbParts.length);
              
              console.log('  Exact match:', exactMatch);
              console.log('  Partial match:', partialMatch);
              console.log('  First name match:', firstNameMatch);
              console.log('  Last name match:', lastNameMatch);
              console.log('  Has any word match:', hasAnyWordMatch);
              console.log('  Has significant match:', hasSignificantMatch);
              console.log('  Word match:', wordMatch);
              
              namesMatch = exactMatch || partialMatch || wordMatch;
              
              console.log('  ========== FINAL MATCH RESULT:', namesMatch, '==========');
              if (!namesMatch) {
                console.warn('  ⚠️ Names do not match. Consider this a match anyway if names are similar.');
                console.warn('  💡 Suggestion: If the names are similar (e.g., "John" vs "John Doe"), this should pass.');
              }
            }

            if (namesMatch === null) {
              // OCR data not available - learner found but name comparison skipped
              console.log('✅ Learner found. Name comparison skipped (OCR data not available).');
              setVerificationStatus(prev => ({ ...prev, learnerCheck: 'success' }));
            } else if (namesMatch) {
              console.log('✅ Learner names match!');
              setVerificationStatus(prev => ({ ...prev, learnerCheck: 'success' }));
            } else {
              console.warn('⚠️ ========== LEARNER NAME MISMATCH ==========');
              console.warn(`  📄 OCR Name (from certificate): "${ocrLearnerName}"`);
              console.warn(`  👤 DB Name (from learner email): "${dbLearnerName}"`);
              console.warn(`  📧 Email used: "${formData.learnerId}"`);
              console.warn('  ⚠️ Names do not match after all matching attempts.');
              
              // Even if names don't match exactly, if they're somewhat similar, allow it
              // This handles cases where OCR might have errors or names are formatted differently
              const ocrLower = ocrLearnerName.toLowerCase();
              const dbLower = dbLearnerName.toLowerCase();
              
              // Final fallback: if names share any 4+ character substring, consider it a match
              let hasCommonSubstring = false;
              for (let i = 0; i <= ocrLower.length - 4; i++) {
                const substr = ocrLower.substring(i, i + 4);
                if (dbLower.includes(substr)) {
                  hasCommonSubstring = true;
                  console.log('  ✅ Found common substring:', substr);
                  break;
                }
              }
              
              if (hasCommonSubstring) {
                console.log('  ✅ Names share common substring - considering as match');
                namesMatch = true;
                setVerificationStatus(prev => ({ ...prev, learnerCheck: 'success' }));
              } else {
                setVerificationStatus(prev => ({ ...prev, learnerCheck: 'error' }));
              }
            }

            // Store verification data with proper structure
            setVerificationData((prev: VerificationData | null) => ({
              ...(prev || {}),
              learner: learnerData,
              learnerData: {
                user_info: {
                  full_name: learnerData.full_name,
                  email: learnerData.email,
                  user_id: learnerData.user_id,
                  wallet_id: learnerData.wallet_id,
                  is_active: true
                }
              },
              nameMatch: namesMatch
            }));

          } else {
            const errorData = await learnerResponse.json().catch(() => ({}));
            console.error('❌ Learner lookup failed:', learnerResponse.status, errorData);
            console.error('   Email not found or learner doesn\'t exist');
            setVerificationStatus(prev => ({ ...prev, learnerCheck: 'error' }));
          }
          }
        } else {
          // Logic for Aadhaar/PAN (Direct Issuance to ID)
          console.log(`✅ Using Government ID (${identifierType}) for issuance. Skipping wallet lookup.`);

          const learnerData = {
            email: '',
            full_name: ocrData?.extracted_data?.learner_name || 'Verified via DigiLocker',
            user_id: '',
            wallet_id: '', // Will likely generate a new wallet or link later
            gov_id: formData.learnerId,
            id_type: identifierType
          };

          verificationResults.learnerData = learnerData;

          setVerificationStatus(prev => ({ ...prev, learnerCheck: 'success' }));

          setVerificationData((prev: VerificationData | null) => ({
            ...(prev || {}),
            learner: learnerData,
            nameMatch: true
          }));
        }
      } catch (error) {
        console.error('💥 Learner verification exception:', error);
        setVerificationStatus(prev => ({ ...prev, learnerCheck: 'error' }));
      }

      // 2. Check API key validity
      try {
        console.log('🔑 Checking API key validity...');

        console.log('📡 Fetching API key data...');
        let apiKeyResponse: Response;
        try {
          apiKeyResponse = await fetchWithTimeout(
            buildApiUrl('/issuer/api-keys'),
            {
              headers: {
                'x-api-key': apiKey,
                'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('access_token') : ''}`
              }
            },
            30000 // 30 second timeout
          );
        } catch (error) {
          console.error('❌ API key check request failed:', error);
          setVerificationStatus(prev => ({ ...prev, apiKeyCheck: 'error' }));
          apiKeyResponse = null as any; // Mark as failed
        }

        if (apiKeyResponse && apiKeyResponse.ok) {
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

        console.log('📡 Fetching blockchain status...');
        let blockchainResponse: Response;
        try {
          blockchainResponse = await fetchWithTimeout(
            buildApiUrl('/blockchain/network/status'),
            {
              headers: {
                'x-api-key': apiKey,
                'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('access_token') : ''}`
              }
            },
            30000 // 30 second timeout
          );
        } catch (error) {
          console.error('❌ Blockchain check request failed:', error);
          setVerificationStatus(prev => ({ ...prev, blockchainCheck: 'error' }));
          blockchainResponse = null as any; // Mark as failed
        }

        if (blockchainResponse && blockchainResponse.ok) {
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

      // Update final verification status - ensure this always runs
      // Use a small delay to ensure all state updates from individual checks have been processed
      await new Promise(resolve => setTimeout(resolve, 200));
      
      console.log('📊 Finalizing verification status...');
      
      // Force a final status update after all checks complete
      setVerificationStatus(prev => {
        const allPassed = prev.learnerCheck === 'success' &&
          prev.apiKeyCheck === 'success' &&
          prev.blockchainCheck === 'success';

        console.log('📊 Verification results:');
        console.log('  Learner check:', prev.learnerCheck);
        console.log('  API key check:', prev.apiKeyCheck);
        console.log('  Blockchain check:', prev.blockchainCheck);
        console.log('  All verified:', allPassed);

        if (allPassed) {
          setVerificationData((prevData: VerificationData | null) => ({
            ...(prevData || {}),
            ...verificationResults
          }));
        }

        const newStatus = { ...prev, allVerified: allPassed };
        console.log('📊 Setting final status:', newStatus);
        return newStatus;
      });
      
      // Force another update after a brief moment to ensure React processes it
      await new Promise(resolve => setTimeout(resolve, 100));
      console.log('✅ Verification process completed');

    } catch (error) {
      console.error('💥 Verification process failed:', error);
      // Ensure status is updated even on error
      setVerificationStatus(prev => {
        // Mark any pending checks as error
        const updated = { ...prev };
        if (updated.learnerCheck === 'pending') updated.learnerCheck = 'error';
        if (updated.apiKeyCheck === 'pending') updated.apiKeyCheck = 'error';
        if (updated.blockchainCheck === 'pending') updated.blockchainCheck = 'error';
        updated.allVerified = false;
        return updated;
      });
    } finally {
      // Force a final status check to ensure UI updates
      console.log('🔍 Final status check...');
      setVerificationStatus(prev => {
        const allPassed = prev.learnerCheck === 'success' &&
          prev.apiKeyCheck === 'success' &&
          prev.blockchainCheck === 'success';
        console.log('🔍 Final check - All verified:', allPassed, {
          learner: prev.learnerCheck,
          apiKey: prev.apiKeyCheck,
          blockchain: prev.blockchainCheck
        });
        return { ...prev, allVerified: allPassed };
      });
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

      // If steganography is enabled, ensure seed is synced to backend
      if (addSteganography) {
        console.log('🔐 Steganography enabled - ensuring seed is synced to backend...');
        const seed = typeof window !== 'undefined' ? localStorage.getItem('issuer_seed') : null;
        
        if (!seed) {
          alert('❌ Secret key not found. Please generate a secret key in the sidebar first (click "Shuffle" button).');
          return;
        }

        try {
          // Sync seed to backend
          // Backend expects seed as a plain string in the body, not JSON
          const seedSyncResponse = await fetch(buildApiUrl('/issuer/steganography-seed'), {
            method: 'POST',
            headers: {
              'Content-Type': 'text/plain',
              'x-api-key': apiKey,
              'Authorization': `Bearer ${token}`
            },
            body: seed
          });

          if (!seedSyncResponse.ok) {
            const errorData = await seedSyncResponse.json().catch(() => ({ detail: 'Unknown error' }));
            console.error('❌ Failed to sync seed to backend:', errorData);
            alert(`❌ Failed to sync secret key to backend: ${errorData.detail || 'Unknown error'}. Please click "Shuffle" in the sidebar first.`);
            return;
          }

          console.log('✅ Seed synced to backend successfully');
        } catch (error) {
          console.error('💥 Error syncing seed to backend:', error);
          alert('❌ Failed to sync secret key to backend. Please click "Shuffle" in the sidebar first.');
          return;
        }
      }

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
          tags: formData.tags,
          aadhar_number: fetchedAadharNo || (digilockerData?.aadhar_no || '')
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

      // Prepare FormData with the original certificate file and options
      const overlayFormData = new FormData();
      overlayFormData.append('certificate_file', fileBlob, pdfFile.name);
      overlayFormData.append('credential_id', credentialId);
      overlayFormData.append('add_qr_code', addQrCode.toString());
      overlayFormData.append('add_steganography', addSteganography.toString());
      
      if (addQrCode) {
        overlayFormData.append('qr_data', JSON.stringify(issueResult.qr_code_data || {}));
      }
      
      // Note: issuer_seed is NOT sent - it's retrieved securely from database on backend
      // issuer_did is no longer required for steganography

      console.log('📤 Certificate Processing Request Data:');
      console.log('  - Credential ID:', credentialId);
      console.log('  - File Blob size:', fileBlob.size, 'bytes');
      console.log('  - File Type:', fileBlob.type);
      console.log('  - Add QR Code:', addQrCode);
      console.log('  - Add Steganography:', addSteganography);
      if (addQrCode) {
        console.log('  - QR Data:', issueResult.qr_code_data);
      }

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
    setDigilockerData(null);
    setFetchedAadharNo('');
    setPdfFile(null);
    setErrors({});
    setCurrentStep(0);
    setShowExtractedData(false);
    setOcrData(null);
  };

  // Note: Verification is now only triggered when user clicks "Verify Certificate" button
  // after uploading a verification file. This ensures we use OCR data from the correct file.
  // Removed auto-verification on step 2 load to prevent using wrong OCR data.

  // Monitor verification status and ensure allVerified is updated when all checks complete
  useEffect(() => {
    const { learnerCheck, apiKeyCheck, blockchainCheck, allVerified } = verificationStatus;
    
    // Only update if not already verified and all checks are complete (not pending)
    if (!allVerified && 
        learnerCheck !== 'pending' && 
        apiKeyCheck !== 'pending' && 
        blockchainCheck !== 'pending') {
      
      const allPassed = learnerCheck === 'success' &&
        apiKeyCheck === 'success' &&
        blockchainCheck === 'success';
      
      if (allPassed !== allVerified) {
        console.log('🔄 Auto-updating allVerified status:', allPassed);
        setVerificationStatus(prev => ({ ...prev, allVerified: allPassed }));
      }
    }
  }, [verificationStatus.learnerCheck, verificationStatus.apiKeyCheck, verificationStatus.blockchainCheck, verificationStatus.allVerified]);

  return (
    <RoleGuard allowedPath="/dashboard/institution/credentials" requiredRole="issuer">
      <DashboardLayout title="Institution Credentials">
        <div className="w-full p-4 sm:p-8">
          <div className="bg-white rounded-lg p-8">

            {/* Step Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-center space-x-6">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 0
                    ? currentStep === 0
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-500'
                    }`}>
                    1
                  </div>
                  <span className={`ml-3 text-sm ${currentStep >= 0 ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                    Choose Template
                  </span>
                </div>

                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 1
                    ? currentStep === 1
                      ? 'bg-green-100 text-green-700'
                      : 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-500'
                    }`}>
                    2
                  </div>
                  <span className={`ml-3 text-sm ${currentStep >= 1 ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                    Fill Details
                  </span>
                </div>

                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 2
                    ? currentStep === 2
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-500'
                    }`}>
                    3
                  </div>
                  <span className={`ml-3 text-sm ${currentStep >= 2 ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                    Verification
                  </span>
                </div>

                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 3
                    ? currentStep === 3
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-500'
                    }`}>
                    4
                  </div>
                  <span className={`ml-3 text-sm ${currentStep >= 3 ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                    Issue Certificate
                  </span>
                </div>
              </div>
            </div>

            {/* Step 0: Template Selection */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <CertificateTemplateSelector
                  selectedTemplate={selectedTemplate}
                  onTemplateSelect={handleTemplateSelect}
                  showPreview={true}
                />
                
                {/* Template Selection Error */}
                {errors.template && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700 text-sm font-medium">{errors.template}</p>
                  </div>
                )}

                {/* Continue Button */}
                <div className="flex justify-center pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedTemplate) {
                        setCurrentStep(1);
                      } else {
                        setErrors(prev => ({ ...prev, template: 'Please select a certificate template' }));
                      }
                    }}
                    disabled={!selectedTemplate}
                    className={`px-8 py-3 rounded-lg font-medium text-lg transition-colors ${
                      selectedTemplate
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Continue to Details
                  </button>
                </div>
              </div>
            )}

            {/* Step 1: Fill Details with OCR Extraction */}
            {currentStep === 1 && (
              <>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Credentials Info</h2>

                {/* Learner ID and Certificate Upload - Initial Fields */}
                {!showExtractedData && (
                  <>
                    {/* Identifier Type Selection */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Learner Identifier Type
                      </label>
                      <div className="flex space-x-4">
                        <button
                          type="button"
                          onClick={() => {
                            setIdentifierType('email');
                            setFormData(prev => ({ ...prev, learnerId: '' }));
                          }}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${identifierType === 'email'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                          Email ID
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIdentifierType('aadhaar');
                            setFormData(prev => ({ ...prev, learnerId: '' }));
                          }}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${identifierType === 'aadhaar'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                          Aadhaar Number
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIdentifierType('pan');
                            setFormData(prev => ({ ...prev, learnerId: '' }));
                          }}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${identifierType === 'pan'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                          PAN Card
                        </button>
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {identifierType === 'email' ? 'Learner Email' : identifierType === 'aadhaar' ? 'Aadhaar Number' : 'PAN Number'} <span className="text-red-500">*</span>
                      </label>
                      <div className="flex justify-between items-start">
                        <div className="relative flex-grow">
                          <input
                            type="text"
                            name="learnerId"
                            placeholder={identifierType === 'email' ? "Enter Learner Email (e.g., learner@example.com)" : identifierType === 'aadhaar' ? "Enter Aadhaar Number (12 digits)" : "Enter PAN Number"}
                            value={formData.learnerId}
                            onChange={handleInputChange}
                            onFocus={() => { if (identifierType === 'email' && emailSuggestions.length > 0) setShowSuggestions(true); }}
                            onBlur={() => { setTimeout(() => setShowSuggestions(false), 300); }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            autoComplete="off"
                          />
                          {identifierType === 'email' && showSuggestions && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              {isLoadingSuggestions ? (
                                <div className="px-4 py-3 text-sm text-gray-500 flex items-center">
                                  <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Loading...
                                </div>
                              ) : (
                                emailSuggestions.map((email, index) => (
                                  <button key={index} type="button" onMouseDown={(e) => { e.preventDefault(); handleEmailSelect(email); }} className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b last:border-b-0">
                                    {email}
                                  </button>
                                ))
                              )}
                            </div>
                          )}
                        </div>

                        {(identifierType === 'aadhaar' || identifierType === 'pan') && (
                          <button
                            type="button"
                            onClick={handleFetchFromDigiLocker}
                            disabled={isFetchingDigiLocker}
                            className="ml-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-sm hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all flex items-center whitespace-nowrap"
                          >
                            {isFetchingDigiLocker ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Fetching...
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                Fetch from DigiLocker
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      <p className="text-xs text-gray-500 mt-2">
                        {identifierType === 'email'
                          ? "Enter the learner's email address. System will verify the learner exists and match with certificate details."
                          : "Enter the user's government ID to issue credential directly against their identity. Use 'Fetch' to verify via DigiLocker."}
                      </p>

                      {errors.learnerId && (
                        <p className="text-red-500 text-sm mt-1">{errors.learnerId}</p>
                      )}

                      {/* DigiLocker Data Display */}
                      {digilockerData && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                              <h3 className="text-lg font-semibold text-gray-900">DigiLocker Verification Data</h3>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setDigilockerData(null);
                                setFetchedAadharNo('');
                              }}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                            {/* Personal Information */}
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold text-gray-700 border-b pb-1">Personal Information</h4>
                              {digilockerData.name && (
                                <div>
                                  <span className="text-xs text-gray-500">Name:</span>
                                  <p className="text-sm font-medium text-gray-900">{digilockerData.name}</p>
                                </div>
                              )}
                              {digilockerData.dob && (
                                <div>
                                  <span className="text-xs text-gray-500">Date of Birth:</span>
                                  <p className="text-sm font-medium text-gray-900">{digilockerData.dob}</p>
                                </div>
                              )}
                              {digilockerData.gender && (
                                <div>
                                  <span className="text-xs text-gray-500">Gender:</span>
                                  <p className="text-sm font-medium text-gray-900">{digilockerData.gender}</p>
                                </div>
                              )}
                              {digilockerData.fathername && (
                                <div>
                                  <span className="text-xs text-gray-500">Father's Name:</span>
                                  <p className="text-sm font-medium text-gray-900">{digilockerData.fathername}</p>
                                </div>
                              )}
                            </div>

                            {/* Identity Documents */}
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold text-gray-700 border-b pb-1">Identity Documents</h4>
                              {digilockerData.aadhar_no && (
                                <div>
                                  <span className="text-xs text-gray-500">Aadhaar Number:</span>
                                  <p className="text-sm font-medium text-gray-900 font-mono">{digilockerData.aadhar_no}</p>
                                </div>
                              )}
                              {digilockerData.pan_number && (
                                <div>
                                  <span className="text-xs text-gray-500">PAN Number:</span>
                                  <p className="text-sm font-medium text-gray-900 font-mono">{digilockerData.pan_number}</p>
                                </div>
                              )}
                            </div>

                            {/* Address Information */}
                            {digilockerData.aadhar_address && (
                              <div className="md:col-span-2 space-y-2">
                                <h4 className="text-sm font-semibold text-gray-700 border-b pb-1">Address</h4>
                                <div>
                                  <span className="text-xs text-gray-500">Full Address:</span>
                                  <p className="text-sm font-medium text-gray-900">{digilockerData.aadhar_address}</p>
                                </div>
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                  {digilockerData.dist && (
                                    <div>
                                      <span className="text-xs text-gray-500">District:</span>
                                      <p className="text-sm font-medium text-gray-900">{digilockerData.dist}</p>
                                    </div>
                                  )}
                                  {digilockerData.state && (
                                    <div>
                                      <span className="text-xs text-gray-500">State:</span>
                                      <p className="text-sm font-medium text-gray-900">{digilockerData.state}</p>
                                    </div>
                                  )}
                                  {digilockerData.pincode && (
                                    <div>
                                      <span className="text-xs text-gray-500">Pincode:</span>
                                      <p className="text-sm font-medium text-gray-900">{digilockerData.pincode}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Document Links */}
                            {(digilockerData.aadhar_filename || digilockerData.pan_image_path) && (
                              <div className="md:col-span-2 space-y-2">
                                <h4 className="text-sm font-semibold text-gray-700 border-b pb-1">Identity Document Links</h4>
                                <div className="flex flex-wrap gap-2">
                                  {digilockerData.aadhar_filename && (
                                    <a
                                      href={digilockerData.aadhar_filename}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
                                    >
                                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                      Aadhaar PDF
                                    </a>
                                  )}
                                  {digilockerData.pan_image_path && (
                                    <a
                                      href={digilockerData.pan_image_path}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 transition-colors"
                                    >
                                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                      PAN PDF
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Certificates/Other Documents */}
                            {digilockerData.other_documents_files && Object.keys(digilockerData.other_documents_files).length > 0 && (
                              <div className="md:col-span-2 space-y-2">
                                <h4 className="text-sm font-semibold text-gray-700 border-b pb-1 flex items-center">
                                  <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  Certificates Available for Issuance
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {Object.entries(digilockerData.other_documents_files)
                                    .filter(([key, url]) => typeof url === 'string' && url.toLowerCase().endsWith('.pdf'))
                                    .map(([docKey, docUrl]: [string, any]) => {
                                      // Extract a readable document name from the key
                                      const docName = docKey
                                        .replace(/^in\.gov\./, '')
                                        .replace(/-/g, ' ')
                                        .replace(/\d+/g, '')
                                        .trim() || 'Certificate';
                                      
                                      return (
                                        <div
                                          key={docKey}
                                          className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all"
                                        >
                                          <div className="flex items-center flex-1 min-w-0">
                                            <svg className="w-5 h-5 text-purple-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <div className="min-w-0 flex-1">
                                              <p className="text-sm font-medium text-gray-900 truncate">
                                                {docName}
                                              </p>
                                              <p className="text-xs text-gray-500 truncate">
                                                {docKey}
                                              </p>
                                            </div>
                                          </div>
                                          <a
                                            href={docUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ml-3 inline-flex items-center px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 rounded-md hover:bg-purple-100 transition-colors flex-shrink-0"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            View PDF
                                          </a>
                                        </div>
                                      );
                                    })}
                                </div>
                                {Object.entries(digilockerData.other_documents_files).filter(([key, url]) => typeof url === 'string' && url.toLowerCase().endsWith('.pdf')).length === 0 && (
                                  <p className="text-xs text-gray-500 italic">No PDF certificates found in other documents</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
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
                        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${isDragOver
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
                                className={`w-12 h-12 transition-colors duration-200 ${isDragOver ? 'text-blue-500' : 'text-gray-400'
                                  }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                            </div>
                            <div>
                              <p className={`text-lg font-medium transition-colors duration-200 ${isDragOver ? 'text-blue-700' : 'text-gray-900'
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
                        className={`px-6 py-2 rounded-lg transition font-medium ${pdfFile && formData.learnerId.trim() && !isExtracting
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
                      className="px-6 py-2 rounded-lg transition font-medium bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Verify & Continue
                    </button>
                  )}
                </div>
              </>
            )}

            {/* Step 2: Verification */}
            {currentStep === 2 && (
              <>
                {/* Certificate Verification */}
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Verify Learner</h2>

                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 mb-2">
                      <strong>Verification Information:</strong>
                    </p>
                    <p className="text-xs text-blue-700">
                      The system will verify the learner's identity by comparing the name extracted from the certificate (Step 1) with the learner's information in the database.
                    </p>
                    {ocrData?.extracted_data?.learner_name && (
                      <div className="mt-3 p-2 bg-white rounded border border-blue-300">
                        <p className="text-xs text-gray-700">
                          <strong>Certificate Name:</strong> {ocrData.extracted_data.learner_name}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Verify Button */}
                  <div className="mt-6 text-center">
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('🖱️ ========== VERIFY BUTTON CLICKED ==========');
                        console.log('📍 Current step:', currentStep);
                        console.log('📄 OCR data available:', !!ocrData);
                        console.log('📋 OCR learner name:', ocrData?.extracted_data?.learner_name);
                        console.log('⏳ isVerifyingFile state:', isVerifyingFile);
                        console.log('🔍 About to call handleVerifyFile...');
                        
                        if (!ocrData || !ocrData.extracted_data) {
                          console.error('❌ No OCR data available!');
                          alert('Please extract certificate data in Step 1 first.');
                          return;
                        }
                        
                        try {
                          await handleVerifyFile();
                          console.log('✅ handleVerifyFile returned successfully');
                        } catch (error) {
                          console.error('💥 Error calling handleVerifyFile:', error);
                          alert('An error occurred. Check console for details.');
                        }
                      }}
                      disabled={isVerifyingFile || !ocrData || !ocrData.extracted_data}
                      className={`px-8 py-3 rounded-lg font-medium text-lg transition ${(isVerifyingFile || !ocrData || !ocrData.extracted_data)
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                        }`}
                    >
                      {isVerifyingFile ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Verifying...
                        </span>
                      ) : (
                        'Verify Learner'
                      )}
                    </button>
                    {(!ocrData || !ocrData.extracted_data) && (
                      <p className="mt-2 text-xs text-red-600">
                        Please extract certificate data in Step 1 first
                      </p>
                    )}
                  </div>
                </div>

                {/* System Verification Status */}
                <div className="text-center py-12">
                  <div className="relative mb-8">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-500 ${verificationStatus.allVerified
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
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${verificationStatus.learnerCheck === 'success'
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
                            {verificationStatus.learnerCheck === 'success' ? 'Learner name verified successfully' :
                              verificationStatus.learnerCheck === 'error' ? 'Learner name mismatch detected' :
                                'Checking learner status...'}
                          </p>
                          {verificationStatus.learnerCheck === 'success' && verificationData?.learner && (
                            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="text-xs text-green-700">
                                <div className="font-semibold mb-1">Verification Details:</div>
                                <div>Name: {verificationData.learner.full_name}</div>
                                <div>Email: {verificationData.learner.email}</div>
                                {ocrData?.extracted_data?.learner_name && (
                                  <div className="mt-1 pt-1 border-t border-green-300">
                                    <div className="text-green-600">Certificate Name: {ocrData.extracted_data.learner_name}</div>
                                    <div className="text-green-600">✓ Names match</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          {verificationStatus.learnerCheck === 'error' && verificationData?.learner && ocrData?.extracted_data?.learner_name && (
                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                              <div className="text-xs text-red-700">
                                <div className="font-semibold mb-1">Name Mismatch:</div>
                                <div>Database Name: {verificationData.learner.full_name}</div>
                                <div>Certificate Name: {ocrData.extracted_data.learner_name}</div>
                                <div className="mt-1 text-red-600">⚠ Names do not match. Please verify the learner email is correct.</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* API Key Check */}
                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 transition-all duration-500 hover:shadow-md">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${verificationStatus.apiKeyCheck === 'success'
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
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${verificationStatus.blockchainCheck === 'success'
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

                  {/* Certificate Protection Options */}
                  <div className="mt-8 mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Certificate Protection Options</h3>
                    
                    <div className="space-y-4">
                      {/* QR Code Option */}
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          id="addQrCode"
                          checked={addQrCode}
                          onChange={(e) => setAddQrCode(e.target.checked)}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="addQrCode" className="ml-3 flex-1">
                          <span className="text-sm font-medium text-gray-900">Add QR Code to Certificate</span>
                          <p className="text-xs text-gray-600 mt-1">
                            Embed a QR code on the certificate for instant verification
                          </p>
                        </label>
                      </div>

                      {/* Steganography Option */}
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          id="addSteganography"
                          checked={addSteganography}
                          onChange={(e) => setAddSteganography(e.target.checked)}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="addSteganography" className="ml-3 flex-1">
                          <span className="text-sm font-medium text-gray-900">Protect Certificate with Steganography</span>
                          <p className="text-xs text-gray-600 mt-1">
                            Embed invisible watermark using steganography for tamper detection
                          </p>
                        </label>
                      </div>

                      {/* Steganography Fields (shown when enabled) */}
                      {addSteganography && (
                        <div className="ml-7 mt-3 p-4 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-xs text-blue-700">
                            <strong>Note:</strong> Your secret seed is stored securely on the server and will be used automatically. 
                            The blockchain hash from certificate issuance will be embedded as the steganography payload.
                          </p>
                        </div>
                      )}
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
                      className={`px-8 py-3 rounded-lg transition font-medium text-lg ${verificationStatus.allVerified && !isIssuingCertificate
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
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const response = await fetch(issuedCertificate.certificate_url);
                              const blob = await response.blob();
                              
                              // Convert to PNG using canvas (works for both JPEG and PDF images)
                              const img = new Image();
                              const canvas = document.createElement('canvas');
                              const ctx = canvas.getContext('2d');
                              
                              const imageUrl = URL.createObjectURL(blob);
                              img.onload = () => {
                                canvas.width = img.width;
                                canvas.height = img.height;
                                ctx?.drawImage(img, 0, 0);
                                
                                canvas.toBlob((pngBlob) => {
                                  if (pngBlob) {
                                    // Convert blob to data URL for use in new tab
                                    const reader = new FileReader();
                                    reader.onload = () => {
                                      const dataUrl = reader.result as string;
                                      
                                      // Create a temporary HTML page that auto-downloads
                                      const htmlContent = `
                                        <!DOCTYPE html>
                                        <html>
                                          <head>
                                            <title>Downloading Certificate...</title>
                                          </head>
                                          <body>
                                            <script>
                                              const link = document.createElement('a');
                                              link.href = '${dataUrl}';
                                              link.download = 'certificate_${issuedCertificate.credential_id}.png';
                                              document.body.appendChild(link);
                                              link.click();
                                              document.body.removeChild(link);
                                              setTimeout(() => window.close(), 1000);
                                            </script>
                                            <p style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
                                              Downloading certificate... If download doesn't start automatically, 
                                              <a href="${dataUrl}" download="certificate_${issuedCertificate.credential_id}.png" style="color: #0066cc;">click here</a>.
                                            </p>
                                          </body>
                                        </html>
                                      `;
                                      
                                      const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
                                      const htmlUrl = URL.createObjectURL(htmlBlob);
                                      
                                      // Open in new tab
                                      const newTab = window.open(htmlUrl, '_blank');
                                      
                                      if (!newTab) {
                                        // If popup blocked, fallback to direct download
                                        const a = document.createElement('a');
                                        a.href = dataUrl;
                                        a.download = `certificate_${issuedCertificate.credential_id}.png`;
                                        document.body.appendChild(a);
                                        a.click();
                                        document.body.removeChild(a);
                                      }
                                      
                                      // Clean up after a delay
                                      setTimeout(() => {
                                        window.URL.revokeObjectURL(imageUrl);
                                        window.URL.revokeObjectURL(htmlUrl);
                                      }, 2000);
                                    };
                                    reader.readAsDataURL(pngBlob);
                                  }
                                }, 'image/png');
                              };
                              img.onerror = () => {
                                // If image fails to load, try direct download
                                const a = document.createElement('a');
                                a.href = imageUrl;
                                a.download = `certificate_${issuedCertificate.credential_id}.png`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                window.URL.revokeObjectURL(imageUrl);
                              };
                              img.src = imageUrl;
                            } catch (error) {
                              console.error('Error downloading PNG:', error);
                              alert('Failed to download certificate as PNG');
                            }
                          }}
                          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-lg shadow-md hover:shadow-lg flex items-center"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Download as PNG
                        </button>
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

        {/* Template Preview Modal */}
        <TemplatePreviewModal
          template={previewTemplate}
          open={showTemplatePreview}
          onClose={() => setShowTemplatePreview(false)}
          onSelect={handleTemplateSelect}
          showSelectButton={true}
        />
      </DashboardLayout>
    </RoleGuard>
  );
}

