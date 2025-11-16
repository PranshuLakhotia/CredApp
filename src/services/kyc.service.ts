// KYC API Service
// This service handles all KYC verification calls via our backend proxy
import { buildApiUrl } from '@/config/api';

export interface SandboxAuthResponse {
  code: number;
  timestamp: number;
  access_token: string;
  data: {
    access_token: string;
  };
  transaction_id: string;
}

export interface AadhaarOTPGenerateRequest {
  '@entity': string;
  aadhaar_number: string;
  consent: string;
  reason: string;
}

export interface AadhaarOTPGenerateResponse {
  code: number;
  timestamp: number;
  transaction_id: string;
  data?: {
    '@entity': string;
    reference_id?: string;
    message: string;
  };
  message?: string;
}

export interface AadhaarOTPVerifyRequest {
  '@entity': string;
  reference_id: string;
  otp: string;
}

export interface AadhaarOTPVerifyResponse {
  code: number;
  timestamp: number;
  transaction_id: string;
  data?: {
    '@entity': string;
    reference_id?: string;
    status?: string;
    message: string;
    care_of?: string;
    full_address?: string;
    date_of_birth?: string;
    email_hash?: string;
    gender?: string;
    name?: string;
    address?: {
      '@entity': string;
      country: string;
      district: string;
      house: string;
      landmark: string;
      pincode: string;
      post_office: string;
      state: string;
      street: string;
      subdistrict: string;
      vtc: string;
    };
    year_of_birth?: string;
    mobile_hash?: string;
    photo?: string;
    share_code?: string;
  };
  message?: string;
}

export interface PANVerifyRequest {
  '@entity': string;
  pan: string;
  name_as_per_pan: string;
  date_of_birth: string;
  consent: string;
  reason: string;
}

export interface PANVerifyResponse {
  code: number;
  timestamp: number;
  transaction_id: string;
  data?: {
    '@entity': string;
    pan: string;
    category: string;
    status: string;
    remarks: string | null;
    name_as_per_pan_match: boolean;
    date_of_birth_match: boolean;
    aadhaar_seeding_status: string;
  };
  message?: string;
}

class KYCService {
  // No need to manage token on frontend - backend handles it
  
  /**
   * Test authentication with backend KYC proxy
   */
  async testAuthentication(): Promise<any> {
    try {
      const response = await fetch(buildApiUrl('/kyc/test/authenticate'), {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Authentication test failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Backend authentication test error:', error);
      throw error;
    }
  }

  /**
   * Generate OTP for Aadhaar verification
   */
  async generateAadhaarOTP(aadhaarNumber: string): Promise<AadhaarOTPGenerateResponse> {
    try {
      const requestBody = {
        aadhaar_number: aadhaarNumber
      };

      const response = await fetch(buildApiUrl('/kyc/aadhaar/otp/generate'), {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to generate OTP: ${response.statusText}`);
      }

      const data: AadhaarOTPGenerateResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Generate Aadhaar OTP error:', error);
      throw error;
    }
  }

  /**
   * Verify Aadhaar OTP
   */
  async verifyAadhaarOTP(referenceId: string, otp: string): Promise<AadhaarOTPVerifyResponse> {
    try {
      const requestBody = {
        reference_id: referenceId,
        otp: otp
      };

      const response = await fetch(buildApiUrl('/kyc/aadhaar/otp/verify'), {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to verify OTP: ${response.statusText}`);
      }

      const data: AadhaarOTPVerifyResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Verify Aadhaar OTP error:', error);
      throw error;
    }
  }

  /**
   * Verify PAN card details
   */
  async verifyPAN(
    pan: string,
    nameAsPer: string,
    dateOfBirth: string
  ): Promise<PANVerifyResponse> {
    try {
      const requestBody = {
        pan: pan.toUpperCase(),
        name_as_per_pan: nameAsPer,
        date_of_birth: dateOfBirth // Format: DD/MM/YYYY
      };

      const response = await fetch(buildApiUrl('/kyc/pan/verify'), {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to verify PAN: ${response.statusText}`);
      }

      const data: PANVerifyResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Verify PAN error:', error);
      throw error;
    }
  }

  /**
   * Send phone verification code
   */
  async sendPhoneCode(phoneNumber: string, preferredChannel: string = 'sms'): Promise<any> {
    try {
      const requestBody = {
        phone_number: phoneNumber,
        code_size: 6,
        preferred_channel: preferredChannel
      };

      const response = await fetch(buildApiUrl('/kyc/phone/send'), {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to send phone code: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Send phone code error:', error);
      throw error;
    }
  }

  /**
   * Verify phone code
   */
  async verifyPhoneCode(phoneNumber: string, code: string): Promise<any> {
    try {
      const requestBody = {
        phone_number: phoneNumber,
        code: code
      };

      const response = await fetch(buildApiUrl('/kyc/phone/verify'), {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to verify phone code: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Verify phone code error:', error);
      throw error;
    }
  }

  /**
   * Send email verification code
   */
  async sendEmailCode(email: string): Promise<any> {
    try {
      const requestBody = {
        email: email,
        code_size: 6
      };

      const response = await fetch(buildApiUrl('/kyc/email/send'), {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to send email code: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Send email code error:', error);
      throw error;
    }
  }

  /**
   * Verify email code
   */
  async verifyEmailCode(email: string, code: string): Promise<any> {
    try {
      const requestBody = {
        email: email,
        code: code
      };

      const response = await fetch(buildApiUrl('/kyc/email/verify'), {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to verify email code: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Verify email code error:', error);
      throw error;
    }
  }

  /**
   * Verify face using image
   */
  async verifyFace(imageBase64: string, vendorData?: string): Promise<any> {
    try {
      const requestBody = {
        user_image_base64: imageBase64,
        search_type: 'most_similar',
        vendor_data: vendorData
      };

      const response = await fetch(buildApiUrl('/kyc/face/verify'), {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to verify face: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Verify face error:', error);
      throw error;
    }
  }

  /**
   * Search and verify GSTIN
   */
  async searchGSTIN(gstin: string): Promise<any> {
    try {
      const requestBody = {
        gstin: gstin.toUpperCase()
      };

      const response = await fetch(buildApiUrl('/kyc/gstin/search'), {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to search GSTIN: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Search GSTIN error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const kycService = new KYCService();

