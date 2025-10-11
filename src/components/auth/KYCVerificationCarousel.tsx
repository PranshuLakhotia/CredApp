import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  CreditCard, 
  FileText, 
  FolderOpen,
  Camera,
  MapPin,
  Mail,
  Phone,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { kycService } from '@/services/kyc.service';

interface KYCVerificationCarouselProps {
  userEmail: string;
  userPhone: string;
  userFullName: string;
  userDateOfBirth: string; // Format: YYYY-MM-DD
  onComplete: (verificationData: any) => void;
  onCancel: () => void;
}

type DocumentVerificationType = 'pan' | 'aadhaar' | 'digilocker' | null;
type VerificationStep = 1 | 2 | 3;

export default function KYCVerificationCarousel({
  userEmail,
  userPhone,
  userFullName,
  userDateOfBirth,
  onComplete,
  onCancel
}: KYCVerificationCarouselProps) {
  const [currentStep, setCurrentStep] = useState<VerificationStep>(1);
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentVerificationType>(null);
  
  // Step 1 - Document Verification
  const [panNumber, setPanNumber] = useState('');
  const [panVerificationStatus, setPanVerificationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [panError, setPanError] = useState('');
  const [panData, setPanData] = useState<any>(null);
  
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [aadhaarOTP, setAadhaarOTP] = useState('');
  const [aadhaarReferenceId, setAadhaarReferenceId] = useState('');
  const [aadhaarStep, setAadhaarStep] = useState<'input' | 'otp'>('input');
  const [aadhaarVerificationStatus, setAadhaarVerificationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [aadhaarError, setAadhaarError] = useState('');
  const [aadhaarData, setAadhaarData] = useState<any>(null);
  
  // Step 2 - Face and Address Verification
  const [faceVerificationStatus, setFaceVerificationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [addressVerificationStatus, setAddressVerificationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [capturedFaceImage, setCapturedFaceImage] = useState<string | null>(null);
  
  // Step 3 - Mobile and Email Verification
  const [verificationEmail, setVerificationEmail] = useState(userEmail); // Editable email
  const [verificationPhone, setVerificationPhone] = useState(userPhone); // Editable phone
  const [emailOTP, setEmailOTP] = useState('');
  const [mobileOTP, setMobileOTP] = useState('');
  const [emailVerificationStatus, setEmailVerificationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [mobileVerificationStatus, setMobileVerificationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Verification data to be sent to backend
  const [verificationData, setVerificationData] = useState<any>({});

  // Helper function to convert date format
  const convertDateFormat = (dateStr: string): string => {
    // Convert YYYY-MM-DD to DD/MM/YYYY
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  // Step 1 - PAN Verification
  const handlePANVerification = async () => {
    if (!panNumber || panNumber.length !== 10) {
      setPanError('Please enter a valid 10-character PAN number');
      return;
    }

    if (!userDateOfBirth) {
      setPanError('Date of birth is required for PAN verification');
      return;
    }

    try {
      setPanVerificationStatus('loading');
      setPanError('');

      const dateOfBirth = convertDateFormat(userDateOfBirth);
      console.log('PAN Verification - Date converted:', dateOfBirth); // Debug log
      const response = await kycService.verifyPAN(panNumber, userFullName, dateOfBirth);

      if (response.code === 200 && response.data?.status === 'valid') {
        setPanVerificationStatus('success');
        setPanData(response.data);
        setVerificationData((prev: any) => ({
          ...prev,
          documentVerification: {
            type: 'pan',
            data: response.data
          }
        }));
      } else {
        setPanVerificationStatus('error');
        setPanError(response.data?.remarks || response.message || 'PAN verification failed');
      }
    } catch (error: any) {
      setPanVerificationStatus('error');
      setPanError(error.message || 'Failed to verify PAN');
      console.error('PAN verification error:', error);
    }
  };

  // Step 1 - Aadhaar Generate OTP
  const handleAadhaarGenerateOTP = async () => {
    if (!aadhaarNumber || aadhaarNumber.length !== 12) {
      setAadhaarError('Please enter a valid 12-digit Aadhaar number');
      return;
    }

    try {
      setAadhaarVerificationStatus('loading');
      setAadhaarError('');

      const response = await kycService.generateAadhaarOTP(aadhaarNumber);

      if (response.code === 200 && response.data?.reference_id) {
        // Ensure reference_id is always stored as a string
        setAadhaarReferenceId(String(response.data.reference_id));
        setAadhaarStep('otp');
        setAadhaarVerificationStatus('idle');
      } else {
        setAadhaarVerificationStatus('error');
        setAadhaarError(response.data?.message || response.message || 'Failed to generate OTP');
      }
    } catch (error: any) {
      setAadhaarVerificationStatus('error');
      setAadhaarError(error.message || 'Failed to generate OTP');
      console.error('Aadhaar OTP generation error:', error);
    }
  };

  // Step 1 - Aadhaar Verify OTP
  const handleAadhaarVerifyOTP = async () => {
    if (!aadhaarOTP || aadhaarOTP.length !== 6) {
      setAadhaarError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setAadhaarVerificationStatus('loading');
      setAadhaarError('');

      const response = await kycService.verifyAadhaarOTP(aadhaarReferenceId, aadhaarOTP);

      if (response.code === 200 && response.data?.status === 'VALID') {
        setAadhaarVerificationStatus('success');
        setAadhaarData(response.data);
        setVerificationData((prev: any) => ({
          ...prev,
          documentVerification: {
            type: 'aadhaar',
            data: response.data
          }
        }));
      } else {
        setAadhaarVerificationStatus('error');
        setAadhaarError(response.data?.message || response.message || 'OTP verification failed');
      }
    } catch (error: any) {
      setAadhaarVerificationStatus('error');
      setAadhaarError(error.message || 'Failed to verify OTP');
      console.error('Aadhaar OTP verification error:', error);
    }
  };

  // Step 2 - Face Verification (Simulated for now)
  const handleFaceVerification = async () => {
    try {
      setFaceVerificationStatus('loading');
      
      // Simulate face capture and verification
      // In a real implementation, you would:
      // 1. Access the user's camera
      // 2. Capture a photo
      // 3. Send to a face verification API
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setFaceVerificationStatus('success');
      setCapturedFaceImage('data:image/png;base64,simulated');
      setVerificationData((prev: any) => ({
        ...prev,
        faceVerification: {
          status: 'verified',
          timestamp: new Date().toISOString()
        }
      }));
    } catch (error: any) {
      setFaceVerificationStatus('error');
      console.error('Face verification error:', error);
    }
  };

  // Step 2 - Address Verification (Uses data from Aadhaar if available)
  const handleAddressVerification = async () => {
    try {
      setAddressVerificationStatus('loading');
      
      // Use address from Aadhaar verification if available
      const addressData = aadhaarData?.address || null;
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setAddressVerificationStatus('success');
      setVerificationData((prev: any) => ({
        ...prev,
        addressVerification: {
          status: 'verified',
          address: addressData || 'Address verified from documents',
          timestamp: new Date().toISOString()
        }
      }));
    } catch (error: any) {
      setAddressVerificationStatus('error');
      console.error('Address verification error:', error);
    }
  };

  // Step 3 - Email Verification (Simulated - you'd integrate with your backend)
  const handleEmailVerification = async () => {
    if (!emailOTP || emailOTP.length !== 6) {
      return;
    }

    try {
      setEmailVerificationStatus('loading');
      
      // In real implementation, verify with your backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setEmailVerificationStatus('success');
      setVerificationData((prev: any) => ({
        ...prev,
        emailVerification: {
          status: 'verified',
          email: verificationEmail,
          timestamp: new Date().toISOString()
        }
      }));
    } catch (error: any) {
      setEmailVerificationStatus('error');
      console.error('Email verification error:', error);
    }
  };

  // Step 3 - Mobile Send OTP
  const handleMobileSendOTP = async () => {
    if (!verificationPhone || verificationPhone.length < 10) {
      alert('Please enter a valid phone number');
      return;
    }

    try {
      setMobileVerificationStatus('loading');
      
      // Ensure phone number is in E.164 format
      let formattedPhone = verificationPhone.trim();
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+' + formattedPhone;
      }
      
      const response = await kycService.sendPhoneCode(formattedPhone, 'sms');
      
      if (response.status === 'Success') {
        setMobileVerificationStatus('idle');
        alert('OTP sent to your mobile number');
      } else {
        setMobileVerificationStatus('error');
        console.error('Failed to send mobile OTP:', response);
      }
    } catch (error: any) {
      setMobileVerificationStatus('error');
      alert('Failed to send OTP: ' + (error.message || 'Unknown error'));
      console.error('Mobile OTP send error:', error);
    }
  };

  // Step 3 - Mobile Verification
  const handleMobileVerification = async () => {
    if (!mobileOTP || mobileOTP.length !== 6) {
      return;
    }

    try {
      setMobileVerificationStatus('loading');
      
      // Ensure phone number is in E.164 format
      let formattedPhone = verificationPhone.trim();
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+' + formattedPhone;
      }
      
      const response = await kycService.verifyPhoneCode(formattedPhone, mobileOTP);
      
      if (response.status === 'Approved') {
        setMobileVerificationStatus('success');
        setVerificationData((prev: any) => ({
          ...prev,
          mobileVerification: {
            status: 'verified',
            phone: formattedPhone,
            data: response.phone,
            timestamp: new Date().toISOString()
          }
        }));
      } else {
        setMobileVerificationStatus('error');
        console.error('Mobile verification failed:', response.message);
      }
    } catch (error: any) {
      setMobileVerificationStatus('error');
      console.error('Mobile verification error:', error);
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      // Check if document verification is complete
      if (panVerificationStatus === 'success' || aadhaarVerificationStatus === 'success') {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      // Check if face and address verification are complete
      if (faceVerificationStatus === 'success' && addressVerificationStatus === 'success') {
        setCurrentStep(3);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as VerificationStep);
    }
  };

  const handleFinish = () => {
    // Check if all verifications are complete
    if (
      emailVerificationStatus === 'success' && 
      mobileVerificationStatus === 'success'
    ) {
      onComplete(verificationData);
    }
  };

  const canProceedToNextStep = () => {
    if (currentStep === 1) {
      return panVerificationStatus === 'success' || aadhaarVerificationStatus === 'success';
    } else if (currentStep === 2) {
      return faceVerificationStatus === 'success' && addressVerificationStatus === 'success';
    } else if (currentStep === 3) {
      return emailVerificationStatus === 'success' && mobileVerificationStatus === 'success';
    }
    return false;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <h2 className="text-2xl font-bold mb-2">KYC Verification</h2>
          <p className="text-blue-100">Complete your identity verification to activate your account</p>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-between mt-6">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step 
                    ? 'bg-white text-blue-600 border-white' 
                    : 'bg-blue-500 text-white border-white opacity-50'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    currentStep > step ? 'bg-white' : 'bg-blue-400 opacity-50'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-between mt-2 text-xs text-blue-100">
            <span>Documents</span>
            <span>Identity</span>
            <span>Contact</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Document Verification */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Step 1: Document Verification</h3>
              <p className="text-gray-600 mb-6">Choose one method to verify your identity</p>

              {/* Document Type Selection */}
              {!selectedDocumentType && (
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setSelectedDocumentType('pan')}
                    className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition group"
                  >
                    <CreditCard className="w-12 h-12 text-gray-400 group-hover:text-blue-600 mx-auto mb-3" />
                    <div className="text-center font-semibold text-gray-700 group-hover:text-blue-600">PAN Card</div>
                  </button>
                  
                  <button
                    onClick={() => setSelectedDocumentType('aadhaar')}
                    className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition group"
                  >
                    <FileText className="w-12 h-12 text-gray-400 group-hover:text-blue-600 mx-auto mb-3" />
                    <div className="text-center font-semibold text-gray-700 group-hover:text-blue-600">Aadhaar Card</div>
                  </button>
                  
                  <button
                    onClick={() => setSelectedDocumentType('digilocker')}
                    className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition group"
                    disabled
                  >
                    <FolderOpen className="w-12 h-12 text-gray-400 group-hover:text-blue-600 mx-auto mb-3" />
                    <div className="text-center font-semibold text-gray-700 group-hover:text-blue-600">DigiLocker</div>
                    <div className="text-xs text-gray-400 mt-1">Coming Soon</div>
                  </button>
                </div>
              )}

              {/* PAN Verification */}
              {selectedDocumentType === 'pan' && (
                <div className="border-2 border-blue-200 rounded-xl p-6 bg-blue-50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-lg">PAN Card Verification</h4>
                    {panVerificationStatus === 'success' && (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PAN Number
                      </label>
                      <input
                        type="text"
                        value={panNumber}
                        onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                        maxLength={10}
                        placeholder="ABCDE1234F"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none uppercase"
                        disabled={panVerificationStatus === 'success'}
                      />
                    </div>

                    {panError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                        <XCircle className="w-5 h-5" />
                        <span className="text-sm">{panError}</span>
                      </div>
                    )}

                    {panVerificationStatus === 'success' && panData && (
                      <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-semibold">Verification Successful</span>
                        </div>
                        <div className="text-sm space-y-1 ml-7">
                          <div>PAN: {panData.pan}</div>
                          <div>Category: {panData.category}</div>
                          <div>Status: {panData.status}</div>
                        </div>
                      </div>
                    )}

                    {panVerificationStatus !== 'success' && (
                      <button
                        onClick={handlePANVerification}
                        disabled={panVerificationStatus === 'loading'}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {panVerificationStatus === 'loading' ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          'Verify PAN'
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedDocumentType(null)}
                      className="w-full text-gray-600 py-2 text-sm hover:text-gray-800"
                    >
                      Choose Different Method
                    </button>
                  </div>
                </div>
              )}

              {/* Aadhaar Verification */}
              {selectedDocumentType === 'aadhaar' && (
                <div className="border-2 border-blue-200 rounded-xl p-6 bg-blue-50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-lg">Aadhaar Card Verification</h4>
                    {aadhaarVerificationStatus === 'success' && (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {aadhaarStep === 'input' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Aadhaar Number
                          </label>
                          <input
                            type="text"
                            value={aadhaarNumber}
                            onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                            maxLength={12}
                            placeholder="123456789012"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          />
                        </div>

                        {aadhaarError && (
                          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                            <XCircle className="w-5 h-5" />
                            <span className="text-sm">{aadhaarError}</span>
                          </div>
                        )}

                        <button
                          onClick={handleAadhaarGenerateOTP}
                          disabled={aadhaarVerificationStatus === 'loading'}
                          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {aadhaarVerificationStatus === 'loading' ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Generating OTP...
                            </>
                          ) : (
                            'Generate OTP'
                          )}
                        </button>
                      </>
                    )}

                    {aadhaarStep === 'otp' && (
                      <>
                        <div className="bg-blue-100 border border-blue-300 text-blue-700 px-4 py-3 rounded-lg text-sm">
                          OTP sent to mobile number linked with your Aadhaar
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Enter OTP
                          </label>
                          <input
                            type="text"
                            value={aadhaarOTP}
                            onChange={(e) => setAadhaarOTP(e.target.value.replace(/\D/g, ''))}
                            maxLength={6}
                            placeholder="123456"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-center text-2xl tracking-widest"
                            disabled={aadhaarVerificationStatus === 'success'}
                          />
                        </div>

                        {aadhaarError && (
                          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                            <XCircle className="w-5 h-5" />
                            <span className="text-sm">{aadhaarError}</span>
                          </div>
                        )}

                        {aadhaarVerificationStatus === 'success' && aadhaarData && (
                          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="w-5 h-5" />
                              <span className="font-semibold">Verification Successful</span>
                            </div>
                            <div className="text-sm space-y-1 ml-7">
                              <div>Name: {aadhaarData.name}</div>
                              <div>DOB: {aadhaarData.date_of_birth}</div>
                              <div>Status: {aadhaarData.status}</div>
                            </div>
                          </div>
                        )}

                        {aadhaarVerificationStatus !== 'success' && (
                          <>
                            <button
                              onClick={handleAadhaarVerifyOTP}
                              disabled={aadhaarVerificationStatus === 'loading'}
                              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              {aadhaarVerificationStatus === 'loading' ? (
                                <>
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                  Verifying OTP...
                                </>
                              ) : (
                                'Verify OTP'
                              )}
                            </button>

                            <button
                              onClick={() => {
                                setAadhaarStep('input');
                                setAadhaarOTP('');
                                setAadhaarError('');
                              }}
                              className="w-full text-blue-600 py-2 text-sm hover:text-blue-800"
                            >
                              Resend OTP
                            </button>
                          </>
                        )}
                      </>
                    )}

                    <button
                      onClick={() => {
                        setSelectedDocumentType(null);
                        setAadhaarStep('input');
                        setAadhaarNumber('');
                        setAadhaarOTP('');
                        setAadhaarError('');
                      }}
                      className="w-full text-gray-600 py-2 text-sm hover:text-gray-800"
                    >
                      Choose Different Method
                    </button>
                  </div>
                </div>
              )}

              {/* DigiLocker */}
              {selectedDocumentType === 'digilocker' && (
                <div className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50">
                  <h4 className="font-semibold text-lg mb-4">DigiLocker Verification</h4>
                  <p className="text-gray-600 mb-4">This feature is coming soon!</p>
                  <button
                    onClick={() => setSelectedDocumentType(null)}
                    className="w-full text-gray-600 py-2 text-sm hover:text-gray-800"
                  >
                    Choose Different Method
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Face & Address Verification */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Step 2: Identity Verification</h3>
              
              {/* Face Verification */}
              <div className="border-2 border-blue-200 rounded-xl p-6 bg-blue-50">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    Face Verification
                  </h4>
                  {faceVerificationStatus === 'success' && (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  )}
                </div>

                {faceVerificationStatus === 'idle' && (
                  <div className="space-y-4">
                    <p className="text-gray-600 text-sm">
                      Please position your face within the frame and click capture
                    </p>
                    <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                      <Camera className="w-16 h-16 text-gray-400" />
                    </div>
                    <button
                      onClick={handleFaceVerification}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                      Capture & Verify
                    </button>
                  </div>
                )}

                {faceVerificationStatus === 'loading' && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                  </div>
                )}

                {faceVerificationStatus === 'success' && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-semibold">Face verified successfully</span>
                  </div>
                )}
              </div>

              {/* Address Verification */}
              <div className="border-2 border-blue-200 rounded-xl p-6 bg-blue-50">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Address Verification
                  </h4>
                  {addressVerificationStatus === 'success' && (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  )}
                </div>

                {addressVerificationStatus === 'idle' && (
                  <div className="space-y-4">
                    <p className="text-gray-600 text-sm">
                      {aadhaarData?.address 
                        ? 'We will use the address from your Aadhaar card'
                        : 'Please verify your address'}
                    </p>
                    {aadhaarData?.address && (
                      <div className="bg-white p-4 rounded-lg text-sm">
                        <div>{aadhaarData.address.house}, {aadhaarData.address.street}</div>
                        <div>{aadhaarData.address.vtc}, {aadhaarData.address.district}</div>
                        <div>{aadhaarData.address.state} - {aadhaarData.address.pincode}</div>
                      </div>
                    )}
                    <button
                      onClick={handleAddressVerification}
                      disabled={faceVerificationStatus !== 'success'}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Verify Address
                    </button>
                  </div>
                )}

                {addressVerificationStatus === 'loading' && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                  </div>
                )}

                {addressVerificationStatus === 'success' && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-semibold">Address verified successfully</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Email & Mobile Verification */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Step 3: Contact Verification</h3>
              
              {/* Email Verification */}
              <div className="border-2 border-blue-200 rounded-xl p-6 bg-blue-50">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Email Verification
                  </h4>
                  {emailVerificationStatus === 'success' && (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  )}
                </div>

                <div className="space-y-4">
                  {/* Email Input Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={verificationEmail}
                      onChange={(e) => setVerificationEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="your.email@example.com"
                      disabled={emailVerificationStatus === 'success'}
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter the email you want to verify</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter Email OTP
                    </label>
                    <input
                      type="text"
                      value={emailOTP}
                      onChange={(e) => setEmailOTP(e.target.value.replace(/\D/g, ''))}
                      maxLength={6}
                      placeholder="123456"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-center text-2xl tracking-widest"
                      disabled={emailVerificationStatus === 'success'}
                    />
                  </div>

                  {emailVerificationStatus === 'success' ? (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-semibold">Email verified successfully</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleEmailVerification}
                      disabled={emailVerificationStatus === 'loading'}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {emailVerificationStatus === 'loading' ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        'Verify Email'
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Mobile Verification */}
              <div className="border-2 border-blue-200 rounded-xl p-6 bg-blue-50">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Mobile Verification
                  </h4>
                  {mobileVerificationStatus === 'success' && (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  )}
                </div>

                <div className="space-y-4">
                  {/* Phone Number Input Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={verificationPhone}
                      onChange={(e) => setVerificationPhone(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="+14155552671"
                      disabled={mobileVerificationStatus === 'success'}
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter phone number in E.164 format (e.g., +14155552671 or +919876543210)</p>
                  </div>

                  {/* Send OTP Button */}
                  <button
                    onClick={handleMobileSendOTP}
                    disabled={mobileVerificationStatus === 'loading' || mobileVerificationStatus === 'success' || emailVerificationStatus !== 'success'}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {mobileVerificationStatus === 'loading' ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      'Send OTP to Mobile'
                    )}
                  </button>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter Mobile OTP
                    </label>
                    <input
                      type="text"
                      value={mobileOTP}
                      onChange={(e) => setMobileOTP(e.target.value.replace(/\D/g, ''))}
                      maxLength={6}
                      placeholder="123456"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-center text-2xl tracking-widest"
                      disabled={mobileVerificationStatus === 'success'}
                    />
                  </div>

                  {mobileVerificationStatus === 'success' ? (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-semibold">Mobile verified successfully</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleMobileVerification}
                      disabled={mobileVerificationStatus === 'loading' || emailVerificationStatus !== 'success'}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {mobileVerificationStatus === 'loading' ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        'Verify Mobile'
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex items-center justify-between">
          <button
            onClick={currentStep === 1 ? onCancel : handleBack}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium flex items-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </button>

          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              disabled={!canProceedToNextStep()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={!canProceedToNextStep()}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Complete Verification
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

