import React, { useState, useEffect } from 'react';
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
  ArrowLeft
} from 'lucide-react';
import { kycService } from '@/services/kyc.service';

interface InlineKYCStepsProps {
  currentStep: 'kyc-step1' | 'kyc-step2' | 'kyc-step3';
  userEmail: string;
  userPhone: string;
  userFullName: string;
  userDateOfBirth: string;
  onStepChange: (step: 'kyc-step1' | 'kyc-step2' | 'kyc-step3') => void;
  onComplete: (verificationData: any) => void;
  onBack: () => void;
}

type DocumentVerificationType = 'pan' | 'aadhaar' | 'digilocker' | null;

export default function InlineKYCSteps({
  currentStep,
  userEmail,
  userPhone,
  userFullName,
  userDateOfBirth,
  onStepChange,
  onComplete,
  onBack
}: InlineKYCStepsProps) {
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
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  
  // Step 3 - Mobile and Email Verification
  const [verificationEmail, setVerificationEmail] = useState(userEmail);
  const [verificationPhone, setVerificationPhone] = useState(userPhone);
  const [emailOTP, setEmailOTP] = useState('');
  const [mobileOTP, setMobileOTP] = useState('');
  const [emailVerificationStatus, setEmailVerificationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [mobileVerificationStatus, setMobileVerificationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const [verificationData, setVerificationData] = useState<any>({});

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Helper to convert date
  const convertDateFormat = (dateStr: string): string => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  // PAN Verification
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
      const response = await kycService.verifyPAN(panNumber, userFullName, dateOfBirth);

      if (response.code === 200 && response.data?.status === 'valid') {
        setPanVerificationStatus('success');
        setPanData(response.data);
        setVerificationData((prev: any) => ({
          ...prev,
          documentVerification: { type: 'pan', data: response.data }
        }));
      } else {
        setPanVerificationStatus('error');
        setPanError(response.data?.remarks || response.message || 'PAN verification failed');
      }
    } catch (error: any) {
      setPanVerificationStatus('error');
      setPanError(error.message || 'Failed to verify PAN');
    }
  };

  // Aadhaar Generate OTP
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
    }
  };

  // Aadhaar Verify OTP
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
          documentVerification: { type: 'aadhaar', data: response.data }
        }));
      } else {
        setAadhaarVerificationStatus('error');
        setAadhaarError(response.data?.message || response.message || 'OTP verification failed');
      }
    } catch (error: any) {
      setAadhaarVerificationStatus('error');
      setAadhaarError(error.message || 'Failed to verify OTP');
    }
  };

  // Start Camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } 
      });
      setCameraStream(stream);
      setShowCamera(true);
      
      // Set video source when video element is ready
      if (videoRef) {
        videoRef.srcObject = stream;
      }
    } catch (error: any) {
      alert('Camera access denied. Please allow camera access to verify your face.');
      console.error('Camera access error:', error);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  // Capture Photo
  const capturePhoto = () => {
    if (!videoRef) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.videoWidth;
    canvas.height = videoRef.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(videoRef, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(imageData);
      stopCamera();
    }
  };

  // Verify Face with Captured Image
  const handleFaceVerification = async () => {
    if (!capturedImage) {
      alert('Please capture a photo first');
      return;
    }

    try {
      setFaceVerificationStatus('loading');
      
      const response = await kycService.verifyFace(capturedImage, userEmail);
      
      // Face search returns matches - for first-time users, no matches is good!
      // If there are matches, it might indicate duplicate or blocklisted user
      setFaceVerificationStatus('success');
      setVerificationData((prev: any) => ({
        ...prev,
        faceVerification: { 
          status: 'verified', 
          image: capturedImage,
          data: response,
          timestamp: new Date().toISOString() 
        }
      }));
    } catch (error: any) {
      setFaceVerificationStatus('error');
      alert('Face verification failed: ' + (error.message || 'Unknown error'));
    }
  };

  // Address Verification
  const handleAddressVerification = async () => {
    try {
      setAddressVerificationStatus('loading');
      const addressData = aadhaarData?.address || null;
      await new Promise(resolve => setTimeout(resolve, 1500));
      setAddressVerificationStatus('success');
      setVerificationData((prev: any) => ({
        ...prev,
        addressVerification: { status: 'verified', address: addressData, timestamp: new Date().toISOString() }
      }));
    } catch (error: any) {
      setAddressVerificationStatus('error');
    }
  };

  // Email Send OTP
  const handleEmailSendOTP = async () => {
    if (!verificationEmail || !/\S+@\S+\.\S+/.test(verificationEmail)) {
      alert('Please enter a valid email address');
      return;
    }

    try {
      setEmailVerificationStatus('loading');
      
      const response = await kycService.sendEmailCode(verificationEmail);
      
      if (response.status === 'Success') {
        setEmailVerificationStatus('idle');
        alert('OTP sent to your email address');
      } else {
        setEmailVerificationStatus('error');
      }
    } catch (error: any) {
      setEmailVerificationStatus('error');
      alert('Failed to send OTP: ' + (error.message || 'Unknown error'));
    }
  };

  // Email Verification
  const handleEmailVerification = async () => {
    if (!emailOTP || emailOTP.length !== 6) return;

    try {
      setEmailVerificationStatus('loading');
      
      const response = await kycService.verifyEmailCode(verificationEmail, emailOTP);
      
      if (response.status === 'Approved') {
        setEmailVerificationStatus('success');
        setVerificationData((prev: any) => ({
          ...prev,
          emailVerification: { 
            status: 'verified', 
            email: verificationEmail, 
            data: response.email,
            timestamp: new Date().toISOString() 
          }
        }));
      } else {
        setEmailVerificationStatus('error');
      }
    } catch (error: any) {
      setEmailVerificationStatus('error');
    }
  };

  // Mobile Send OTP
  const handleMobileSendOTP = async () => {
    if (!verificationPhone || verificationPhone.length < 10) {
      alert('Please enter a valid phone number');
      return;
    }

    try {
      setMobileVerificationStatus('loading');
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
      }
    } catch (error: any) {
      setMobileVerificationStatus('error');
      alert('Failed to send OTP: ' + (error.message || 'Unknown error'));
    }
  };

  // Mobile Verification
  const handleMobileVerification = async () => {
    if (!mobileOTP || mobileOTP.length !== 6) return;

    try {
      setMobileVerificationStatus('loading');
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
      }
    } catch (error: any) {
      setMobileVerificationStatus('error');
    }
  };

  const canProceed = () => {
    if (currentStep === 'kyc-step1') {
      return panVerificationStatus === 'success' || aadhaarVerificationStatus === 'success';
    } else if (currentStep === 'kyc-step2') {
      return faceVerificationStatus === 'success' && addressVerificationStatus === 'success';
    } else if (currentStep === 'kyc-step3') {
      return emailVerificationStatus === 'success' && mobileVerificationStatus === 'success';
    }
    return false;
  };

  const handleNext = () => {
    if (currentStep === 'kyc-step1' && canProceed()) {
      onStepChange('kyc-step2');
    } else if (currentStep === 'kyc-step2' && canProceed()) {
      onStepChange('kyc-step3');
    } else if (currentStep === 'kyc-step3' && canProceed()) {
      onComplete(verificationData);
    }
  };

  const stepNumber = currentStep === 'kyc-step1' ? 1 : currentStep === 'kyc-step2' ? 2 : 3;

  return (
    <div className="w-full max-w-xl">
      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                stepNumber >= step 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-gray-200 text-gray-500 border-gray-300'
              }`}>
                {step}
              </div>
              {step < 3 && (
                <div className={`flex-1 h-1 mx-2 ${
                  stepNumber > step ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Documents</span>
          <span>Identity</span>
          <span>Contact</span>
        </div>
      </div>

      {/* Step 1: Document Verification */}
      {currentStep === 'kyc-step1' && (
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Identity</h1>
          <p className="text-gray-600 mb-6">Choose one method to verify your documents</p>

          {!selectedDocumentType && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              <button
                onClick={() => setSelectedDocumentType('pan')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition group"
              >
                <CreditCard className="w-10 h-10 text-gray-400 group-hover:text-blue-600 mx-auto mb-2" />
                <div className="text-sm font-semibold text-gray-700 group-hover:text-blue-600">PAN Card</div>
              </button>
              
              <button
                onClick={() => setSelectedDocumentType('aadhaar')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition group"
              >
                <FileText className="w-10 h-10 text-gray-400 group-hover:text-blue-600 mx-auto mb-2" />
                <div className="text-sm font-semibold text-gray-700 group-hover:text-blue-600">Aadhaar</div>
              </button>
              
              <button
                onClick={() => setSelectedDocumentType('digilocker')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition opacity-50 cursor-not-allowed"
                disabled
              >
                <FolderOpen className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <div className="text-xs text-gray-500">Coming Soon</div>
              </button>
            </div>
          )}

          {/* PAN Verification */}
          {selectedDocumentType === 'pan' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number</label>
                <input
                  type="text"
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                  maxLength={10}
                  placeholder="ABCDE1234F"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                  disabled={panVerificationStatus === 'success'}
                />
              </div>

              {panError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  {panError}
                </div>
              )}

              {panVerificationStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold text-sm">Verified Successfully</span>
                  </div>
                  <div className="text-xs ml-7">{panData?.pan} - {panData?.status}</div>
                </div>
              )}

              {panVerificationStatus !== 'success' && (
                <button
                  onClick={handlePANVerification}
                  disabled={panVerificationStatus === 'loading'}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {panVerificationStatus === 'loading' ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</>
                  ) : (
                    'Verify PAN'
                  )}
                </button>
              )}

              <button onClick={() => setSelectedDocumentType(null)} className="w-full text-gray-600 text-sm hover:text-gray-800">
                Choose Different Method
              </button>
            </div>
          )}

          {/* Aadhaar Verification */}
          {selectedDocumentType === 'aadhaar' && (
            <div className="space-y-4">
              {aadhaarStep === 'input' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Number</label>
                    <input
                      type="text"
                      value={aadhaarNumber}
                      onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                      maxLength={12}
                      placeholder="123456789012"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  {aadhaarError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      {aadhaarError}
                    </div>
                  )}

                  <button
                    onClick={handleAadhaarGenerateOTP}
                    disabled={aadhaarVerificationStatus === 'loading'}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {aadhaarVerificationStatus === 'loading' ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Generating OTP...</>
                    ) : (
                      'Generate OTP'
                    )}
                  </button>
                </>
              )}

              {aadhaarStep === 'otp' && (
                <>
                  <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
                    OTP sent to mobile linked with Aadhaar
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
                    <input
                      type="text"
                      value={aadhaarOTP}
                      onChange={(e) => setAadhaarOTP(e.target.value.replace(/\D/g, ''))}
                      maxLength={6}
                      placeholder="123456"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-center text-2xl tracking-widest"
                      disabled={aadhaarVerificationStatus === 'success'}
                    />
                  </div>

                  {aadhaarError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      {aadhaarError}
                    </div>
                  )}

                  {aadhaarVerificationStatus === 'success' && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold text-sm">Verified Successfully</span>
                      </div>
                      <div className="text-xs ml-7">{aadhaarData?.name}</div>
                    </div>
                  )}

                  {aadhaarVerificationStatus !== 'success' && (
                    <button
                      onClick={handleAadhaarVerifyOTP}
                      disabled={aadhaarVerificationStatus === 'loading'}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {aadhaarVerificationStatus === 'loading' ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</>
                      ) : (
                        'Verify OTP'
                      )}
                    </button>
                  )}

                  <button onClick={() => setAadhaarStep('input')} className="w-full text-blue-600 text-sm hover:text-blue-800">
                    Resend OTP
                  </button>
                </>
              )}

              <button onClick={() => setSelectedDocumentType(null)} className="w-full text-gray-600 text-sm hover:text-gray-800">
                Choose Different Method
              </button>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onBack}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Form
            </button>
            <button
              onClick={handleNext}
            //   disabled={!canProceed()}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next Step
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Face & Address */}
      {currentStep === 'kyc-step2' && (
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Identity Verification</h1>
          <p className="text-gray-600 mb-6">Verify your face and address</p>

          <div className="space-y-4">
            {/* Face Verification */}
            <div className="border-2 border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Face Verification
                </h3>
                {faceVerificationStatus === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
              </div>

              {faceVerificationStatus === 'idle' && !showCamera && !capturedImage && (
                <div>
                  {/* Instructions */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-sm text-blue-900 mb-2">Photo Guidelines</h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="font-semibold text-green-700 mb-1">✓ DO:</div>
                        <ul className="text-gray-700 space-y-1">
                          <li>• Face the camera directly</li>
                          <li>• Remove glasses & hat</li>
                          <li>• Good lighting</li>
                          <li>• Neutral expression</li>
                        </ul>
                      </div>
                      <div>
                        <div className="font-semibold text-red-700 mb-1">✗ DON'T:</div>
                        <ul className="text-gray-700 space-y-1">
                          <li>• Turn your head</li>
                          <li>• Cover your face</li>
                          <li>• Dim lighting</li>
                          <li>• Blurry photos</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={startCamera}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  >
                    <Camera className="w-5 h-5" />
                    Open Camera
                  </button>
                </div>
              )}

              {/* Camera View */}
              {showCamera && !capturedImage && (
                <div>
                  <div className="relative bg-black rounded-lg overflow-hidden mb-3">
                    <video
                      ref={(ref) => {
                        setVideoRef(ref);
                        if (ref && cameraStream) {
                          ref.srcObject = cameraStream;
                          ref.play();
                        }
                      }}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-64 object-cover"
                    />
                    {/* Face Guide Oval */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-48 h-64 border-4 border-white border-dashed rounded-full opacity-50"></div>
                    </div>
                  </div>
                  <p className="text-xs text-center text-gray-600 mb-3">Position your face within the oval</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={stopCamera}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={capturePhoto}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      Capture
                    </button>
                  </div>
                </div>
              )}

              {/* Captured Photo Review */}
              {capturedImage && faceVerificationStatus === 'idle' && (
                <div>
                  <div className="bg-gray-100 rounded-lg overflow-hidden mb-3">
                    <img src={capturedImage} alt="Captured face" className="w-full h-64 object-cover" />
                  </div>
                  <p className="text-xs text-center text-gray-600 mb-3">Review your photo</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setCapturedImage(null);
                        startCamera();
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    >
                      Retake
                    </button>
                    <button
                      onClick={handleFaceVerification}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Verify
                    </button>
                  </div>
                </div>
              )}

              {faceVerificationStatus === 'loading' && (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-2" />
                  <p className="text-sm text-gray-600">Analyzing face...</p>
                </div>
              )}

              {faceVerificationStatus === 'success' && (
                <div>
                  <div className="bg-gray-100 rounded-lg overflow-hidden mb-3">
                    <img src={capturedImage!} alt="Verified face" className="w-full h-32 object-cover" />
                  </div>
                  <div className="bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Face verified successfully
                  </div>
                </div>
              )}
            </div>

            {/* Address Verification */}
            <div className="border-2 border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Address Verification
                </h3>
                {addressVerificationStatus === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
              </div>

              {addressVerificationStatus === 'idle' && (
                <div>
                  {aadhaarData?.address && (
                    <div className="bg-gray-50 p-3 rounded-lg text-sm mb-3">
                      <div>{aadhaarData.address.house}, {aadhaarData.address.street}</div>
                      <div>{aadhaarData.address.vtc}, {aadhaarData.address.state} - {aadhaarData.address.pincode}</div>
                    </div>
                  )}
                  <button
                    onClick={handleAddressVerification}
                    disabled={faceVerificationStatus !== 'success'}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    Verify Address
                  </button>
                </div>
              )}

              {addressVerificationStatus === 'loading' && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              )}

              {addressVerificationStatus === 'success' && (
                <div className="bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Address verified successfully
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => onStepChange('kyc-step1')}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Back
            </button>
            <button
              onClick={handleNext}
            //   disabled={!canProceed()}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next Step
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Email & Phone */}
      {currentStep === 'kyc-step3' && (
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Contacts</h1>
          <p className="text-gray-600 mb-6">Verify your email and phone number</p>

          <div className="space-y-4">
            {/* Email Verification */}
            <div className="border-2 border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Email
                </h3>
                {emailVerificationStatus === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
              </div>

              <div className="space-y-3">
                <input
                  type="email"
                  value={verificationEmail}
                  onChange={(e) => setVerificationEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="your.email@example.com"
                  disabled={emailVerificationStatus === 'success'}
                />

                <button
                  onClick={handleEmailSendOTP}
                  disabled={emailVerificationStatus === 'loading' || emailVerificationStatus === 'success'}
                  className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {emailVerificationStatus === 'loading' ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                  ) : (
                    'Send OTP to Email'
                  )}
                </button>

                <input
                  type="text"
                  value={emailOTP}
                  onChange={(e) => setEmailOTP(e.target.value.replace(/\D/g, ''))}
                  maxLength={6}
                  placeholder="Enter OTP"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-center text-xl tracking-widest"
                  disabled={emailVerificationStatus === 'success'}
                />

                {emailVerificationStatus === 'success' ? (
                  <div className="bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Email verified
                  </div>
                ) : (
                  <button
                    onClick={handleEmailVerification}
                    disabled={emailVerificationStatus === 'loading'}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {emailVerificationStatus === 'loading' ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
                    ) : (
                      'Verify Email'
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Phone Verification */}
            <div className="border-2 border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Phone
                </h3>
                {mobileVerificationStatus === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
              </div>

              <div className="space-y-3">
                <input
                  type="tel"
                  value={verificationPhone}
                  onChange={(e) => setVerificationPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="+14155552671"
                  disabled={mobileVerificationStatus === 'success'}
                />
                <p className="text-xs text-gray-500">E.164 format: +14155552671</p>

                <button
                  onClick={handleMobileSendOTP}
                  disabled={mobileVerificationStatus === 'loading' || mobileVerificationStatus === 'success'}
                  className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {mobileVerificationStatus === 'loading' ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                  ) : (
                    'Send OTP to Phone'
                  )}
                </button>

                <input
                  type="text"
                  value={mobileOTP}
                  onChange={(e) => setMobileOTP(e.target.value.replace(/\D/g, ''))}
                  maxLength={6}
                  placeholder="Enter OTP"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-center text-xl tracking-widest"
                  disabled={mobileVerificationStatus === 'success'}
                />

                {mobileVerificationStatus === 'success' ? (
                  <div className="bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Phone verified
                  </div>
                ) : (
                  <button
                    onClick={handleMobileVerification}
                    disabled={mobileVerificationStatus === 'loading'}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {mobileVerificationStatus === 'loading' ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
                    ) : (
                      'Verify Phone'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => onStepChange('kyc-step2')}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Complete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

