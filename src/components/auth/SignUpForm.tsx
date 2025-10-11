import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { RegisterRequest } from '@/types/auth';
import { AuthService } from '@/services/auth.service';
import InlineKYCSteps from './InlineKYCSteps';

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      postalCode: ''
    }
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    feedback: string[];
  }>({
    score: 0,
    feedback: []
  });
  const [currentStep, setCurrentStep] = useState<'signup' | 'kyc-step1' | 'kyc-step2' | 'kyc-step3'>('signup');
  const [kycVerificationData, setKycVerificationData] = useState<any>(null);

  const { register, isLoading, error, clearError } = useAuth();
  const router = useRouter();

  const checkPasswordStrength = (password: string) => {
    const feedback = [];
    let score = 0;

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('At least 8 characters');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One uppercase letter');
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One lowercase letter');
    }

    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One special character');
    }

    if (/[0-9]/.test(password)) {
      score += 1;
    }

    return { score, feedback };
  };

  const handleChange = (field: string, value: string) => {
    if (field.includes('address.')) {
      const addressField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    // Check password strength in real-time
    if (field === 'password') {
      const strength = checkPasswordStrength(value);
      setPasswordStrength(strength);
    }
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else {
      const passwordErrors = [];
      
      if (formData.password.length < 8) {
        passwordErrors.push('Password must be at least 8 characters long');
      }
      
      if (!/[A-Z]/.test(formData.password)) {
        passwordErrors.push('Password must contain at least one uppercase letter');
      }
      
      if (!/[a-z]/.test(formData.password)) {
        passwordErrors.push('Password must contain at least one lowercase letter');
      }
      
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(formData.password)) {
        passwordErrors.push('Password must contain at least one special character');
      }
      
      if (passwordErrors.length > 0) {
        errors.password = passwordErrors.join(', ');
      }
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Validate phone number format if provided
    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }

    // Date of birth is required for KYC verification
    if (!formData.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required for KYC verification';
    } else {
      const selectedDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - selectedDate.getFullYear();
      
      if (age < 13) {
        errors.dateOfBirth = 'You must be at least 13 years old to register';
      } else if (age > 120) {
        errors.dateOfBirth = 'Please enter a valid date of birth';
      }
    }

    if (!agreedToTerms) {
      errors.terms = 'You must agree to the terms and conditions';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Transition to KYC Step 1
    setCurrentStep('kyc-step1');
  };

  const handleKYCComplete = async (verificationData: any) => {
    try {
      setIsSubmitting(true);
      clearError();
      
      // Convert form data to backend API format - only include non-empty fields
      const registrationData: any = {
        email: formData.email.trim(),
        full_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
        password: formData.password,
        confirm_password: formData.confirmPassword,
      };

      // Only add optional fields if they have values
      if (formData.phone?.trim()) {
        registrationData.phone_number = formData.phone.trim();
      }
      
      if (formData.dateOfBirth?.trim()) {
        registrationData.date_of_birth = formData.dateOfBirth.trim();
      }
      
      if (formData.gender?.trim()) {
        registrationData.gender = formData.gender.trim();
      }

      // Only add address if at least one field is filled
      const hasAddressData = formData.address.street?.trim() || 
                            formData.address.city?.trim() || 
                            formData.address.state?.trim() || 
                            formData.address.country?.trim() || 
                            formData.address.postalCode?.trim();
      
      if (hasAddressData) {
        registrationData.address = {};
        if (formData.address.street?.trim()) registrationData.address.street = formData.address.street.trim();
        if (formData.address.city?.trim()) registrationData.address.city = formData.address.city.trim();
        if (formData.address.state?.trim()) registrationData.address.state = formData.address.state.trim();
        if (formData.address.country?.trim()) registrationData.address.country = formData.address.country.trim();
        if (formData.address.postalCode?.trim()) registrationData.address.postal_code = formData.address.postalCode.trim();
      }

      // Add KYC verification data
      registrationData.kyc_verification = verificationData;
      
      console.log('Sending registration data with KYC:', JSON.stringify(registrationData, null, 2));
      await register(registrationData);
      
      // Redirect to dashboard
      router.push('/dashboard/learner');
    } catch (error: any) {
      console.error('SignUpForm - Registration failed:', error);
      console.error('SignUpForm - Error response:', error.response);
      console.error('SignUpForm - Error data:', error.response?.data);
      console.error('SignUpForm - Error status:', error.response?.status);
      console.error('SignUpForm - Error headers:', error.response?.headers);
      setCurrentStep('signup'); // Go back to signup form on error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToSignup = () => {
    setCurrentStep('signup');
    setKycVerificationData(null);
  };

  const handleLogin = () => {
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-50 to-blue-50 items-center justify-center p-12">
        <div className="max-w-lg">
          {/* Placeholder for illustration */}
          <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-8 flex items-center justify-center aspect-square">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="text-gray-400 text-sm">Sign Up Illustration Placeholder</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form or KYC Steps */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        {currentStep === 'signup' ? (
          <div className="w-full max-w-xl">
          {/* Logo */}
          <div className="flex items-center justify-end gap-2 mb-6">
          <svg width="150" height="100" viewBox="0 0 388 106" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M87.3006 25.5C87.3671 25.2868 87.4336 25.0743 87.5 24.8623C88.6384 20.8014 88.3406 18.7631 85 15.8623L66 1.8623C61.0271 -1.00737 58.8635 -0.600929 56 3.3623L43.5 24.8623H6C2.68629 24.8623 0 27.5486 0 30.8623V99.8623C0 103.176 2.68629 105.862 6 105.862H57C61.4057 99.4154 56.1561 95.8321 45.3873 88.4814C39.7427 84.6284 32.5817 79.7403 24.5 72.8623C24.5 72.8623 23.8567 72.2839 23.5 71.8623C20.7252 68.5829 21.0542 65.2012 23.5 60.8623L43.1457 25.5H87.3006ZM58.9336 105.862H58.5C58.6427 105.883 58.7872 105.882 58.9336 105.862Z" fill="#0279F2"/>
        <path d="M87.5 24.8623C87.4336 25.0743 87.3671 25.2868 87.3006 25.5C84.6983 33.8392 82.0368 43.0725 79.3996 52.2216C71.6681 79.0444 64.1453 105.143 58.9336 105.862H102C105.314 105.862 108 103.176 108 99.8623V30.8623C108 27.5486 105.314 24.8623 102 24.8623H87.5Z" fill="#014B99"/>
        <path d="M165.29 58.2866H150.326C149.638 53.2986 147.058 51.7506 143.962 51.7506C138.974 51.7506 136.308 56.2226 136.308 64.5646C136.308 72.8206 139.06 77.2926 144.392 77.2926C147.574 77.2926 149.81 75.4006 150.67 71.7026H165.548C163.57 83.3986 155.056 89.3326 144.048 89.3326C129.858 89.3326 121 79.7866 121 64.5646C121 48.7406 130.116 39.7106 143.962 39.7106C154.884 39.7106 163.656 45.8166 165.29 58.2866Z" fill="#014B99"/>
        <path d="M167.911 87.7846V41.2586H182.789V47.6226C185.627 42.1186 190.013 39.7106 194.485 39.7106C196.463 39.7106 198.269 40.2266 199.129 41.2586V53.8146C197.495 53.4706 195.947 53.2986 193.797 53.2986C186.315 53.2986 182.789 57.4266 182.789 64.3926V87.7846H167.911Z" fill="#014B99"/>
        <path d="M244.638 72.4766C242.23 83.1406 233.372 89.3326 221.59 89.3326C206.97 89.3326 197.768 79.8726 197.768 64.5646C197.768 48.7406 207.056 39.7106 221.074 39.7106C235.35 39.7106 244.294 49.0846 244.294 64.3926V67.6606H213.162C213.85 74.1106 216.774 77.5506 221.59 77.5506C225.374 77.5506 227.696 76.0026 228.986 72.4766H244.638ZM221.074 51.4926C216.946 51.4926 214.366 54.2446 213.42 59.4906H228.814C227.868 54.2446 225.202 51.4926 221.074 51.4926Z" fill="#014B99"/>
        <path d="M264.575 89.3326C252.707 89.3326 245.139 79.8726 245.139 64.5646C245.139 48.7406 252.879 39.7106 264.575 39.7106C269.305 39.7106 273.089 41.6886 275.841 45.5586V25.8646H290.719V87.7846H275.841V83.2266C273.089 87.1826 269.219 89.3326 264.575 89.3326ZM268.101 77.2926C273.175 77.2926 275.841 72.8206 275.841 64.5646C275.841 56.2226 273.175 51.7506 268.101 51.7506C263.113 51.7506 260.447 56.2226 260.447 64.5646C260.447 72.8206 263.113 77.2926 268.101 77.2926Z" fill="#014B99"/>
        <path d="M310.951 52.6106V41.2586H316.369C316.455 30.1646 321.873 24.3166 330.989 24.3166C334.859 24.3166 337.611 25.0906 338.987 25.7786V34.9806H337.955C332.451 34.9806 331.247 37.3886 331.247 41.2586H338.987V52.6106H331.247V87.7846H316.369V52.6106H310.951Z" fill="#014B99"/>
        <path d="M352 63C352 63 348.681 55 341.181 41.2583H350.234C353.363 41.3138 355 41 357.5 46.5L358.5 48.5C366.201 28.6023 372.39 22.1827 386 23L387.5 23.5C361 62 366 89.5 341 88L351.5 67C352.337 65.1285 352.957 64.6244 352 63Z" fill="#014B99"/>
        <path d="M293.622 87.7843V41.2583H308.5V87.7843H293.622Z" fill="#014B99"/>
        <circle cx="301" cy="28" r="8" fill="#0279F2"/>
        </svg>
          </div>

          {/* Sign Up Form */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Sign up</h1>
            <p className="text-gray-600 mb-8">Let's get you all set up so you can access your personal account.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* First Name & Last Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                      validationErrors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="John"
                  />
                  {validationErrors.firstName && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                      validationErrors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Doe"
                  />
                  {validationErrors.lastName && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Email & Phone Number */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                      validationErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="john.doe@gmail.com"
                  />
                  {validationErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                      validationErrors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+1 (555) 123-4567"
                  />
                  {validationErrors.phone && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>
                  )}
                </div>
              </div>

              {/* Date of Birth & Gender */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                      validationErrors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.dateOfBirth && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.dateOfBirth}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              {/* Address Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address (Optional)
                </label>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={formData.address.street}
                    onChange={(e) => handleChange('address.street', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="Street Address"
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) => handleChange('address.city', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="City"
                    />
                    <input
                      type="text"
                      value={formData.address.state}
                      onChange={(e) => handleChange('address.state', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="State"
                    />
                    <input
                      type="text"
                      value={formData.address.postalCode}
                      onChange={(e) => handleChange('address.postalCode', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="Postal Code"
                    />
                  </div>
                  <input
                    type="text"
                    value={formData.address.country}
                    onChange={(e) => handleChange('address.country', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="Country"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition pr-12 ${
                      validationErrors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="••••••••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>
                )}
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-600">Password strength:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-1 w-8 rounded ${
                              level <= passwordStrength.score
                                ? passwordStrength.score <= 2
                                  ? 'bg-red-500'
                                  : passwordStrength.score <= 3
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className={`text-xs font-medium ${
                        passwordStrength.score <= 2
                          ? 'text-red-500'
                          : passwordStrength.score <= 3
                          ? 'text-yellow-500'
                          : 'text-green-500'
                      }`}>
                        {passwordStrength.score <= 2
                          ? 'Weak'
                          : passwordStrength.score <= 3
                          ? 'Medium'
                          : 'Strong'}
                      </span>
                    </div>
                    
                    {/* Password Requirements */}
                    <div className="text-xs text-gray-600">
                      <div className="grid grid-cols-2 gap-1">
                        <div className={`flex items-center gap-1 ${
                          formData.password.length >= 8 ? 'text-green-600' : 'text-gray-400'
                        }`}>
                          <span>{formData.password.length >= 8 ? '✓' : '○'}</span>
                          <span>8+ characters</span>
                        </div>
                        <div className={`flex items-center gap-1 ${
                          /[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'
                        }`}>
                          <span>{/[A-Z]/.test(formData.password) ? '✓' : '○'}</span>
                          <span>Uppercase letter</span>
                        </div>
                        <div className={`flex items-center gap-1 ${
                          /[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'
                        }`}>
                          <span>{/[a-z]/.test(formData.password) ? '✓' : '○'}</span>
                          <span>Lowercase letter</span>
                        </div>
                        <div className={`flex items-center gap-1 ${
                          /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'
                        }`}>
                          <span>{/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(formData.password) ? '✓' : '○'}</span>
                          <span>Special character</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition pr-12 ${
                      validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="••••••••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {validationErrors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.confirmPassword}</p>
                )}
              </div>

              {/* Terms & Conditions */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                />
                <div>
                  <label className="text-sm text-gray-700">
                    I agree to all the{' '}
                    <button type="button" className="text-red-500 hover:text-red-600 font-medium">
                      Terms
                    </button>
                    {' '}and{' '}
                    <button type="button" className="text-red-500 hover:text-red-600 font-medium">
                      Privacy Policies
                    </button>
                  </label>
                  {validationErrors.terms && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.terms}</p>
                  )}
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Create Account Button */}
              <button
                type="submit"
                disabled={isLoading || isSubmitting}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading || isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>

              {/* Login Link */}
              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={handleLogin}
                  className="text-red-500 hover:text-red-600 font-semibold"
                >
                  Login
                </button>
              </p>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gray-50 text-gray-500">Or Sign up with</span>
                </div>
              </div>

              {/* Social Sign Up Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  className="flex items-center justify-center py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="#1877F2"
                      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="#000000"
                      d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
                    />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
        ) : (
          <InlineKYCSteps
            currentStep={currentStep as 'kyc-step1' | 'kyc-step2' | 'kyc-step3'}
            userEmail={formData.email}
            userPhone={formData.phone}
            userFullName={`${formData.firstName} ${formData.lastName}`}
            userDateOfBirth={formData.dateOfBirth}
            onStepChange={(step) => setCurrentStep(step)}
            onComplete={handleKYCComplete}
            onBack={handleBackToSignup}
          />
        )}
      </div>
    </div>
  );
}