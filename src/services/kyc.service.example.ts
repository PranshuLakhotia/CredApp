/**
 * KYC Service Usage Examples
 * This file demonstrates how to use the KYC service for various verification scenarios
 */

import { kycService } from './kyc.service';

// ============================================================================
// Example 1: Authenticate with Sandbox API
// ============================================================================
async function authenticateExample() {
  try {
    const accessToken = await kycService.authenticate();
    console.log('Access Token:', accessToken);
    // Token is stored internally and reused for subsequent calls
  } catch (error) {
    console.error('Authentication failed:', error);
  }
}

// ============================================================================
// Example 2: Verify PAN Card
// ============================================================================
async function verifyPANExample() {
  try {
    const response = await kycService.verifyPAN(
      'ABCDE1234F',              // PAN number
      'John Ronald Doe',         // Name as per PAN
      '11/11/2001'               // Date of birth (DD/MM/YYYY)
    );

    if (response.code === 200 && response.data?.status === 'valid') {
      console.log('PAN verification successful!');
      console.log('PAN:', response.data.pan);
      console.log('Category:', response.data.category);
      console.log('Name Match:', response.data.name_as_per_pan_match);
      console.log('DOB Match:', response.data.date_of_birth_match);
      console.log('Aadhaar Seeding:', response.data.aadhaar_seeding_status);
    } else {
      console.log('PAN verification failed:', response.message);
    }
  } catch (error) {
    console.error('PAN verification error:', error);
  }
}

// ============================================================================
// Example 3: Verify Aadhaar Card (Two-step process)
// ============================================================================
async function verifyAadhaarExample() {
  try {
    // Step 1: Generate OTP
    const otpResponse = await kycService.generateAadhaarOTP('123456789012');

    if (otpResponse.code === 200 && otpResponse.data?.reference_id) {
      console.log('OTP sent successfully!');
      const referenceId = otpResponse.data.reference_id;
      
      // Step 2: Verify OTP (In real app, user would enter this)
      const otp = '121212'; // Example OTP (in production, user enters this)
      
      const verifyResponse = await kycService.verifyAadhaarOTP(referenceId, otp);

      if (verifyResponse.code === 200 && verifyResponse.data?.status === 'VALID') {
        console.log('Aadhaar verification successful!');
        console.log('Name:', verifyResponse.data.name);
        console.log('DOB:', verifyResponse.data.date_of_birth);
        console.log('Gender:', verifyResponse.data.gender);
        console.log('Address:', verifyResponse.data.address);
        console.log('Photo:', verifyResponse.data.photo ? 'Available' : 'Not available');
      } else {
        console.log('OTP verification failed:', verifyResponse.data?.message);
      }
    } else {
      console.log('OTP generation failed:', otpResponse.data?.message || otpResponse.message);
    }
  } catch (error) {
    console.error('Aadhaar verification error:', error);
  }
}

// ============================================================================
// Example 4: Complete KYC Verification Flow
// ============================================================================
async function completeKYCFlow(
  verificationType: 'pan' | 'aadhaar',
  documentNumber: string,
  fullName: string,
  dateOfBirth: string
) {
  try {
    let verificationData: any = {};

    if (verificationType === 'pan') {
      // PAN Verification
      const response = await kycService.verifyPAN(
        documentNumber,
        fullName,
        dateOfBirth
      );

      if (response.code === 200 && response.data?.status === 'valid') {
        verificationData = {
          type: 'pan',
          status: 'verified',
          data: response.data,
          timestamp: new Date().toISOString()
        };
      } else {
        throw new Error('PAN verification failed');
      }
    } else if (verificationType === 'aadhaar') {
      // Aadhaar Verification (requires user interaction for OTP)
      const otpResponse = await kycService.generateAadhaarOTP(documentNumber);

      if (otpResponse.code !== 200 || !otpResponse.data?.reference_id) {
        throw new Error('Failed to generate OTP');
      }

      // In real implementation, wait for user to enter OTP
      // This is just an example
      const userOTP = '121212'; // User would input this
      
      const verifyResponse = await kycService.verifyAadhaarOTP(
        otpResponse.data.reference_id,
        userOTP
      );

      if (verifyResponse.code === 200 && verifyResponse.data?.status === 'VALID') {
        verificationData = {
          type: 'aadhaar',
          status: 'verified',
          data: verifyResponse.data,
          timestamp: new Date().toISOString()
        };
      } else {
        throw new Error('Aadhaar verification failed');
      }
    }

    return {
      success: true,
      verificationData
    };
  } catch (error) {
    console.error('KYC flow error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// ============================================================================
// Example 5: Error Handling
// ============================================================================
async function errorHandlingExample() {
  try {
    // Try to verify with invalid PAN
    const response = await kycService.verifyPAN(
      'INVALID',
      'John Doe',
      '01/01/1990'
    );

    // Check response code
    if (response.code !== 200) {
      console.error('Verification failed with code:', response.code);
      console.error('Message:', response.message);
    }
  } catch (error) {
    // Network errors or other exceptions
    console.error('Exception occurred:', error);
  }
}

// ============================================================================
// Example 6: Token Management
// ============================================================================
async function tokenManagementExample() {
  // Get token (automatically authenticates if needed)
  const token1 = await kycService.authenticate();
  console.log('Token 1:', token1);

  // Token is cached and reused
  const token2 = await kycService.authenticate();
  console.log('Token 2 (same as token 1):', token2);

  // Clear token (useful for testing or logout)
  kycService.clearToken();

  // Next call will get a new token
  const token3 = await kycService.authenticate();
  console.log('Token 3 (new token):', token3);
}

// ============================================================================
// Example 7: React Component Integration
// ============================================================================
// Example of using KYC service in a React component
/*
import { useState } from 'react';
import { kycService } from '@/services/kyc.service';

function KYCComponent() {
  const [panNumber, setPanNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleVerify = async () => {
    setLoading(true);
    try {
      const response = await kycService.verifyPAN(
        panNumber,
        'John Doe',
        '01/01/1990'
      );
      setResult(response);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input 
        value={panNumber}
        onChange={(e) => setPanNumber(e.target.value)}
        placeholder="Enter PAN"
      />
      <button onClick={handleVerify} disabled={loading}>
        {loading ? 'Verifying...' : 'Verify PAN'}
      </button>
      {result && <div>Result: {JSON.stringify(result)}</div>}
    </div>
  );
}
*/

// ============================================================================
// Example 8: Batch Verification
// ============================================================================
async function batchVerificationExample() {
  const usersToVerify = [
    { pan: 'ABCDE1234F', name: 'John Doe', dob: '01/01/1990' },
    { pan: 'FGHIJ5678K', name: 'Jane Smith', dob: '15/05/1985' },
  ];

  const results = await Promise.allSettled(
    usersToVerify.map(user => 
      kycService.verifyPAN(user.pan, user.name, user.dob)
    )
  );

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      console.log(`User ${index + 1} verification:`, result.value);
    } else {
      console.error(`User ${index + 1} failed:`, result.reason);
    }
  });
}

// ============================================================================
// Export examples for testing
// ============================================================================
export {
  authenticateExample,
  verifyPANExample,
  verifyAadhaarExample,
  completeKYCFlow,
  errorHandlingExample,
  tokenManagementExample,
  batchVerificationExample
};


