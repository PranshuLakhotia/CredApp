# KYC Verification Flow Diagram

## Complete User Journey

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER SIGNUP FLOW                            │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────┐
│   User      │
│  Visits     │
│  /register  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│              SIGNUP FORM (SignUpForm.tsx)                   │
├─────────────────────────────────────────────────────────────┤
│  • First Name & Last Name          [John] [Doe]             │
│  • Email                           [john@example.com]       │
│  • Phone                           [+1234567890]            │
│  • Date of Birth                   [1990-01-01]            │
│  • Gender                          [Male ▼]                 │
│  • Address (Optional)              [Street, City, State...] │
│  • Password & Confirm              [••••••••]              │
│  • [✓] Agree to Terms                                       │
│                                                              │
│              [Create Account Button]                         │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼ (Form Validation)
                           │
                    [Valid?]──No──▶ Show Errors
                           │
                          Yes
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│          KYC VERIFICATION CAROUSEL (KYCVerificationCarousel.tsx)    │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │    Progress: [1]──────[2]──────[3]                           │ │
│  │              Documents Identity Contact                        │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                  STEP 1: DOCUMENT VERIFICATION              │   │
│  │                                                              │   │
│  │  Choose one verification method:                            │   │
│  │                                                              │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │   │
│  │  │   PAN Card   │  │ Aadhaar Card │  │  DigiLocker  │    │   │
│  │  │   [Credit]   │  │   [FileText] │  │  [Folder]    │    │   │
│  │  │              │  │              │  │ (Coming Soon)│    │   │
│  │  └──────┬───────┘  └──────┬───────┘  └──────────────┘    │   │
│  │         │                  │                                │   │
│  │         ▼                  ▼                                │   │
│  │  ┌─────────────┐    ┌─────────────┐                       │   │
│  │  │ Enter PAN   │    │Enter Aadhaar│                       │   │
│  │  │ XXXPX1234A  │    │123456789012 │                       │   │
│  │  └─────┬───────┘    └─────┬───────┘                       │   │
│  │        │                   │                                │   │
│  │        ▼                   ▼                                │   │
│  │  ┌──────────────┐   ┌──────────────┐                      │   │
│  │  │ Sandbox API  │   │ Generate OTP │                      │   │
│  │  │ Verify PAN   │   │  via Sandbox │                      │   │
│  │  └──────┬───────┘   └──────┬───────┘                      │   │
│  │         │                   │                               │   │
│  │         ▼                   ▼                               │   │
│  │   [✓] Valid           ┌──────────────┐                     │   │
│  │   Status: valid       │  Enter OTP   │                     │   │
│  │   Name: Match         │   121212     │                     │   │
│  │   DOB: Match          └──────┬───────┘                     │   │
│  │                              │                               │   │
│  │                              ▼                               │   │
│  │                        ┌──────────────┐                     │   │
│  │                        │ Verify OTP   │                     │   │
│  │                        │ via Sandbox  │                     │   │
│  │                        └──────┬───────┘                     │   │
│  │                               │                              │   │
│  │                               ▼                              │   │
│  │                         [✓] Verified                        │   │
│  │                         Name: John Doe                      │   │
│  │                         DOB: 21-04-1985                     │   │
│  │                         Address: Retrieved                  │   │
│  │                                                              │   │
│  │                      [Next Button] ──────────────────────┐  │   │
│  └──────────────────────────────────────────────────────────┼──┘   │
│                                                               │      │
│                                                               ▼      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                  STEP 2: IDENTITY VERIFICATION              │   │
│  │                                                              │   │
│  │  ┌─────────────────────────────────────────────────────┐  │   │
│  │  │            FACE VERIFICATION                         │  │   │
│  │  │                                                       │  │   │
│  │  │  ┌───────────────────────────────────────┐          │  │   │
│  │  │  │         [Camera Icon]                 │          │  │   │
│  │  │  │   Position your face in the frame     │          │  │   │
│  │  │  └───────────────────────────────────────┘          │  │   │
│  │  │                                                       │  │   │
│  │  │         [Capture & Verify Button]                    │  │   │
│  │  │                  │                                    │  │   │
│  │  │                  ▼                                    │  │   │
│  │  │         [✓] Face verified successfully               │  │   │
│  │  └─────────────────────────────────────────────────────┘  │   │
│  │                                                              │   │
│  │  ┌─────────────────────────────────────────────────────┐  │   │
│  │  │          ADDRESS VERIFICATION                        │  │   │
│  │  │                                                       │  │   │
│  │  │  Address from Aadhaar (if available):                │  │   │
│  │  │  123 Main Street, Bengaluru                          │  │   │
│  │  │  Karnataka - 581615                                  │  │   │
│  │  │                                                       │  │   │
│  │  │         [Verify Address Button]                      │  │   │
│  │  │                  │                                    │  │   │
│  │  │                  ▼                                    │  │   │
│  │  │         [✓] Address verified successfully            │  │   │
│  │  └─────────────────────────────────────────────────────┘  │   │
│  │                                                              │   │
│  │                      [Next Button] ──────────────────────┐  │   │
│  └──────────────────────────────────────────────────────────┼──┘   │
│                                                               │      │
│                                                               ▼      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                  STEP 3: CONTACT VERIFICATION               │   │
│  │                                                              │   │
│  │  ┌─────────────────────────────────────────────────────┐  │   │
│  │  │            EMAIL VERIFICATION                        │  │   │
│  │  │                                                       │  │   │
│  │  │  OTP sent to: john@example.com                       │  │   │
│  │  │                                                       │  │   │
│  │  │  Enter OTP: [1] [2] [3] [4] [5] [6]                │  │   │
│  │  │                                                       │  │   │
│  │  │         [Verify Email Button]                        │  │   │
│  │  │                  │                                    │  │   │
│  │  │                  ▼                                    │  │   │
│  │  │         [✓] Email verified successfully              │  │   │
│  │  └─────────────────────────────────────────────────────┘  │   │
│  │                                                              │   │
│  │  ┌─────────────────────────────────────────────────────┐  │   │
│  │  │            MOBILE VERIFICATION                       │  │   │
│  │  │                                                       │  │   │
│  │  │  OTP sent to: +1234567890                            │  │   │
│  │  │                                                       │  │   │
│  │  │  Enter OTP: [1] [2] [3] [4] [5] [6]                │  │   │
│  │  │                                                       │  │   │
│  │  │         [Verify Mobile Button]                       │  │   │
│  │  │                  │                                    │  │   │
│  │  │                  ▼                                    │  │   │
│  │  │         [✓] Mobile verified successfully             │  │   │
│  │  └─────────────────────────────────────────────────────┘  │   │
│  │                                                              │   │
│  │              [Complete Verification Button]                 │   │
│  └──────────────────────────┬───────────────────────────────────   │
└─────────────────────────────┼───────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Combine Data    │
                    │  • Form Data     │
                    │  • KYC Data      │
                    └─────────┬────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   Send to        │
                    │   Backend API    │
                    │  POST /register  │
                    └─────────┬────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Create User     │
                    │  with KYC Data   │
                    └─────────┬────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   Redirect to    │
                    │  /dashboard      │
                    └──────────────────┘
```

## API Integration Flow

```
┌─────────────┐                    ┌──────────────────┐
│  Frontend   │                    │  Sandbox API     │
│  (React)    │                    │  api.sandbox.co  │
└──────┬──────┘                    └────────┬─────────┘
       │                                    │
       │ 1. Authenticate                   │
       ├───────────────────────────────────▶│
       │   POST /authenticate               │
       │   Headers:                         │
       │   - x-api-key                      │
       │   - x-api-secret                   │
       │                                    │
       │◀───────────────────────────────────┤
       │   200 OK                           │
       │   { access_token: "..." }          │
       │                                    │
       │ 2. Verify PAN (if user chose PAN)  │
       ├───────────────────────────────────▶│
       │   POST /kyc/pan/verify             │
       │   Headers:                         │
       │   - authorization: <token>         │
       │   - x-api-key                      │
       │   Body:                            │
       │   - pan: "XXXPX1234A"              │
       │   - name: "John Doe"               │
       │   - dob: "01/01/1990"              │
       │                                    │
       │◀───────────────────────────────────┤
       │   200 OK                           │
       │   { status: "valid", ... }         │
       │                                    │
       │ 3. Generate Aadhaar OTP            │
       │    (if user chose Aadhaar)         │
       ├───────────────────────────────────▶│
       │   POST /kyc/aadhaar/okyc/otp       │
       │   Headers:                         │
       │   - authorization: <token>         │
       │   - x-api-key                      │
       │   - x-api-version: 2.0             │
       │   Body:                            │
       │   - aadhaar_number: "123..."       │
       │                                    │
       │◀───────────────────────────────────┤
       │   200 OK                           │
       │   { reference_id: "1234567" }      │
       │                                    │
       │ 4. Verify Aadhaar OTP              │
       ├───────────────────────────────────▶│
       │   POST /kyc/aadhaar/okyc/otp/verify│
       │   Headers:                         │
       │   - authorization: <token>         │
       │   - x-api-key                      │
       │   - x-api-version: 2.0             │
       │   Body:                            │
       │   - reference_id: "1234567"        │
       │   - otp: "121212"                  │
       │                                    │
       │◀───────────────────────────────────┤
       │   200 OK                           │
       │   { status: "VALID",               │
       │     name: "...",                   │
       │     address: {...} }               │
       │                                    │
       ▼                                    ▼
```

## Data Flow

```
┌───────────────┐
│  User Input   │
│  (Form Data)  │
└───────┬───────┘
        │
        ▼
┌────────────────────────────────────────┐
│      Validation & KYC Flow             │
├────────────────────────────────────────┤
│  1. Form Validation                    │
│  2. Show KYC Carousel                  │
│  3. Document Verification              │
│     → Sandbox API                      │
│  4. Identity Verification              │
│     → Face + Address                   │
│  5. Contact Verification               │
│     → Email + Mobile OTP               │
└───────┬────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────────┐
│     Combined Registration Data         │
├────────────────────────────────────────┤
│  {                                      │
│    email: "...",                        │
│    full_name: "...",                    │
│    password: "...",                     │
│    phone_number: "...",                 │
│    date_of_birth: "...",                │
│    kyc_verification: {                  │
│      documentVerification: { ... },    │
│      faceVerification: { ... },        │
│      addressVerification: { ... },     │
│      emailVerification: { ... },       │
│      mobileVerification: { ... }       │
│    }                                    │
│  }                                      │
└───────┬────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────────┐
│       Backend API                      │
│    POST /api/v1/auth/register          │
└───────┬────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────────┐
│      Database Storage                  │
│  User Document with KYC Data           │
└───────┬────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────────┐
│    Redirect to Dashboard               │
│    /dashboard/learner                  │
└────────────────────────────────────────┘
```

## Component Architecture

```
SignUpForm.tsx
├── State Management
│   ├── formData (user input)
│   ├── validationErrors
│   ├── showKYCCarousel
│   └── kycVerificationData
│
├── Form Fields
│   ├── Personal Info
│   ├── Contact Info
│   ├── Address (optional)
│   └── Password
│
├── Handlers
│   ├── handleSubmit() → Show KYC
│   ├── handleKYCComplete() → Register
│   └── handleKYCCancel() → Close KYC
│
└── KYCVerificationCarousel
    ├── Step 1: Documents
    │   ├── PAN Verification
    │   │   ├── Input PAN
    │   │   ├── Call kycService.verifyPAN()
    │   │   └── Show Result
    │   │
    │   ├── Aadhaar Verification
    │   │   ├── Input Aadhaar
    │   │   ├── Call kycService.generateAadhaarOTP()
    │   │   ├── Input OTP
    │   │   ├── Call kycService.verifyAadhaarOTP()
    │   │   └── Show Result
    │   │
    │   └── DigiLocker (Coming Soon)
    │
    ├── Step 2: Identity
    │   ├── Face Verification
    │   │   ├── Camera Access
    │   │   ├── Capture Photo
    │   │   └── Verify (simulated)
    │   │
    │   └── Address Verification
    │       ├── Show Address
    │       └── Verify (simulated)
    │
    └── Step 3: Contact
        ├── Email Verification
        │   ├── Send OTP (simulated)
        │   ├── Input OTP
        │   └── Verify (simulated)
        │
        └── Mobile Verification
            ├── Send OTP (simulated)
            ├── Input OTP
            └── Verify (simulated)
```

## Service Architecture

```
kyc.service.ts
│
├── Class: KYCService
│   │
│   ├── Private Properties
│   │   ├── sandboxAccessToken: string | null
│   │   └── tokenExpiry: number | null
│   │
│   ├── authenticate()
│   │   ├── Check if token exists and is valid
│   │   ├── If expired, fetch new token
│   │   ├── Store token and expiry
│   │   └── Return access_token
│   │
│   ├── generateAadhaarOTP(aadhaarNumber)
│   │   ├── Authenticate first
│   │   ├── POST /kyc/aadhaar/okyc/otp
│   │   └── Return { reference_id, message }
│   │
│   ├── verifyAadhaarOTP(referenceId, otp)
│   │   ├── Authenticate first
│   │   ├── POST /kyc/aadhaar/okyc/otp/verify
│   │   └── Return { status, name, address, ... }
│   │
│   ├── verifyPAN(pan, name, dob)
│   │   ├── Authenticate first
│   │   ├── POST /kyc/pan/verify
│   │   └── Return { status, matches, ... }
│   │
│   └── clearToken()
│       └── Reset token and expiry
│
└── Export: kycService (singleton instance)
```

---

**Legend:**
- `→` : User action
- `├─▶` : API call
- `◀──` : API response
- `▼` : Flow continuation
- `[✓]` : Success state


