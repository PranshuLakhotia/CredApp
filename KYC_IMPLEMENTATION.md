# KYC Verification Implementation Guide

## Overview
This document describes the multi-step KYC (Know Your Customer) verification system integrated into the signup process. The implementation uses the Sandbox API for document verification.

## Architecture

### Files Created/Modified

1. **`src/services/kyc.service.ts`** - Sandbox API service
   - Handles authentication with Sandbox API
   - Implements PAN card verification
   - Implements Aadhaar OTP generation and verification
   - Manages access token lifecycle

2. **`src/components/auth/KYCVerificationCarousel.tsx`** - Main KYC component
   - 3-step verification carousel
   - Document verification (Step 1)
   - Identity verification (Step 2)
   - Contact verification (Step 3)

3. **`src/components/auth/SignUpForm.tsx`** - Updated signup form
   - Integrated KYC verification flow
   - Shows KYC carousel after form validation
   - Sends KYC data with registration

## KYC Verification Flow

### Step 1: Document Verification (Choose One)

#### Option A: PAN Card Verification
1. User selects "PAN Card" option
2. User enters their 10-character PAN number
3. System verifies with Sandbox API using:
   - PAN number
   - Name (from signup form)
   - Date of birth (from signup form)
4. On success, displays verification status and proceeds

**API Endpoint:** `POST /kyc/pan/verify`

**Request:**
```json
{
  "@entity": "in.co.sandbox.kyc.pan_verification.request",
  "pan": "ABCDE1234F",
  "name_as_per_pan": "John Doe",
  "date_of_birth": "01/01/1990",
  "consent": "Y",
  "reason": "For KYC verification"
}
```

**Response:**
```json
{
  "code": 200,
  "data": {
    "pan": "ABCDE1234F",
    "category": "individual",
    "status": "valid",
    "name_as_per_pan_match": true,
    "date_of_birth_match": true,
    "aadhaar_seeding_status": "y"
  }
}
```

#### Option B: Aadhaar Card Verification
1. User selects "Aadhaar Card" option
2. User enters their 12-digit Aadhaar number
3. System generates OTP via Sandbox API
4. OTP is sent to mobile number linked with Aadhaar
5. User enters 6-digit OTP
6. System verifies OTP and retrieves Aadhaar details
7. On success, displays verification status and proceeds

**API Endpoints:**

**Generate OTP:** `POST /kyc/aadhaar/okyc/otp`
```json
{
  "@entity": "in.co.sandbox.kyc.aadhaar.okyc.otp.request",
  "aadhaar_number": "123456789012",
  "consent": "y",
  "reason": "For KYC verification"
}
```

**Verify OTP:** `POST /kyc/aadhaar/okyc/otp/verify`
```json
{
  "@entity": "in.co.sandbox.kyc.aadhaar.okyc.request",
  "reference_id": "1234567",
  "otp": "123456"
}
```

**Response (on verification success):**
```json
{
  "code": 200,
  "data": {
    "status": "VALID",
    "name": "John Doe",
    "date_of_birth": "21-04-1985",
    "gender": "M",
    "address": {
      "house": "123 Main Street",
      "street": "Main Street",
      "city": "Bengaluru",
      "state": "Karnataka",
      "pincode": "581615"
    },
    "photo": "data:image/jpeg;base64,..."
  }
}
```

#### Option C: DigiLocker (Coming Soon)
- Placeholder for future implementation

### Step 2: Identity Verification

#### Face Verification
- User captures their face photo using device camera
- System verifies the photo (simulated in current implementation)
- Can be integrated with face matching API in production
- Verifies that the person registering matches the document

#### Address Verification
- If Aadhaar was used, address is automatically extracted
- Otherwise, user can upload proof of address document
- System verifies the address matches provided information

### Step 3: Contact Verification

#### Email Verification
- OTP is sent to user's email address
- User enters 6-digit OTP to verify email
- Currently simulated, integrate with your backend email service

#### Mobile Verification
- OTP is sent to user's mobile number
- User enters 6-digit OTP to verify mobile
- Currently simulated, integrate with your backend SMS service

## API Authentication

### Sandbox API Authentication

Before making any KYC API calls, the system authenticates with Sandbox API:

**Endpoint:** `POST https://api.sandbox.co.in/authenticate`

**Headers:**
```
x-api-key: key_live_360a66a07624420a91b9413f9905a9ea
x-api-secret: secret_live_c888e880175d44299277e9a1ba9e2b05
```

**Response:**
```json
{
  "code": 200,
  "access_token": "eyJ0eXAiOiJKV1...",
  "data": {
    "access_token": "eyJ0eXAiOiJKV1..."
  }
}
```

The access token is:
- Stored in the KYC service
- Valid for 24 hours
- Automatically refreshed when expired
- Used in all subsequent KYC API calls

### Using the Access Token

All KYC verification requests include:
```
authorization: <access_token>
x-api-key: key_live_360a66a07624420a91b9413f9905a9ea
x-api-version: 2.0
```

## Data Flow

1. **User fills signup form** → Form data stored in state
2. **User clicks "Create Account"** → Form validation runs
3. **Validation passes** → KYC carousel opens
4. **User completes Step 1** → Document verification data stored
5. **User completes Step 2** → Identity verification data stored
6. **User completes Step 3** → Contact verification data stored
7. **User clicks "Complete Verification"** → All data sent to backend
8. **Backend registers user** → User redirected to dashboard

## Registration Payload Structure

When KYC is complete, the following payload is sent to your backend:

```json
{
  "email": "user@example.com",
  "full_name": "John Doe",
  "password": "SecurePass123!",
  "confirm_password": "SecurePass123!",
  "phone_number": "+1234567890",
  "date_of_birth": "1990-01-01",
  "gender": "male",
  "address": {
    "street": "123 Main St",
    "city": "City",
    "state": "State",
    "country": "Country",
    "postal_code": "12345"
  },
  "kyc_verification": {
    "documentVerification": {
      "type": "pan" | "aadhaar",
      "data": { /* Full response from Sandbox API */ }
    },
    "faceVerification": {
      "status": "verified",
      "timestamp": "2024-01-01T00:00:00Z"
    },
    "addressVerification": {
      "status": "verified",
      "address": { /* Address data */ },
      "timestamp": "2024-01-01T00:00:00Z"
    },
    "emailVerification": {
      "status": "verified",
      "email": "user@example.com",
      "timestamp": "2024-01-01T00:00:00Z"
    },
    "mobileVerification": {
      "status": "verified",
      "phone": "+1234567890",
      "timestamp": "2024-01-01T00:00:00Z"
    }
  }
}
```

## Security Considerations

1. **API Keys**: Store Sandbox API keys in environment variables in production
2. **Token Storage**: Access token is stored in memory only, not persisted
3. **Sensitive Data**: KYC data should be encrypted before storage in backend
4. **User Consent**: All verification steps require explicit user consent
5. **Data Retention**: Follow regulations for storing KYC documents

## Testing

### Test PAN Numbers (Sandbox Environment)
- Use any valid PAN format: `XXXPX1234A`
- Name and DOB matching is simulated in sandbox

### Test Aadhaar Numbers (Sandbox Environment)
- Use any 12-digit number in sandbox: `123456789012`
- OTP in sandbox: Usually `121212` or check Sandbox documentation

### Testing Flow
1. Fill signup form with test data
2. Click "Create Account"
3. Select PAN or Aadhaar verification
4. Use test credentials
5. Complete all three steps
6. Verify data is sent to backend

## Production Deployment Checklist

- [ ] Move Sandbox API keys to environment variables
- [ ] Implement real face verification API
- [ ] Integrate backend email OTP service
- [ ] Integrate backend SMS OTP service
- [ ] Add proper error handling and retry logic
- [ ] Implement data encryption for KYC storage
- [ ] Add logging and monitoring
- [ ] Set up CORS properly for API calls
- [ ] Test with real PAN and Aadhaar numbers
- [ ] Implement DigiLocker verification
- [ ] Add analytics tracking
- [ ] Implement proper loading states and animations
- [ ] Add accessibility features (ARIA labels, keyboard navigation)
- [ ] Test on multiple devices and browsers
- [ ] Add rate limiting for API calls
- [ ] Implement proper session management
- [ ] Add data backup and recovery mechanisms

## Environment Variables

Create a `.env.local` file in the CredApp directory:

```env
# Sandbox API Credentials (use production keys in production)
NEXT_PUBLIC_SANDBOX_API_KEY=key_live_360a66a07624420a91b9413f9905a9ea
NEXT_PUBLIC_SANDBOX_API_SECRET=secret_live_c888e880175d44299277e9a1ba9e2b05
NEXT_PUBLIC_SANDBOX_API_BASE_URL=https://api.sandbox.co.in
```

## UI/UX Features

1. **Progress Indicator**: Visual step indicator shows user progress
2. **Validation**: Real-time validation for PAN and Aadhaar numbers
3. **Error Handling**: Clear error messages for failed verifications
4. **Loading States**: Loading indicators during API calls
5. **Success Feedback**: Visual confirmation when steps complete
6. **Responsive Design**: Works on mobile and desktop
7. **Accessibility**: Keyboard navigation and screen reader support

## Future Enhancements

1. **DigiLocker Integration**: Add DigiLocker document verification
2. **Biometric Verification**: Add fingerprint/facial recognition
3. **Document Upload**: Allow manual document upload as fallback
4. **Video KYC**: Implement live video verification
5. **Multi-language Support**: Add support for regional languages
6. **Offline Mode**: Allow partial completion with later sync
7. **Re-verification**: Allow users to update KYC documents
8. **Admin Dashboard**: Dashboard for reviewing KYC submissions

## Support

For issues or questions:
- Check Sandbox API documentation: https://docs.sandbox.co.in
- Review error logs in browser console
- Contact support team with transaction IDs from failed verifications

## License

This implementation is part of the CredApp project.


