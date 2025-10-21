/**
 * API Configuration
 * Centralized configuration for all API endpoints and services
 */

// =============================================================================
// CORE API CONFIGURATION
// =============================================================================
// Get the API base URL from environment variables with fallback to deployed backend
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://credhub.twilightparadox.com';

// Frontend URL for sharing and redirects
export const FRONTEND_BASE_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://cred-app-pearl.vercel.app';

// =============================================================================
// BLOCKCHAIN CONFIGURATION
// =============================================================================
export const BLOCKCHAIN_CONFIG = {
  NETWORK: process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK || 'amoy',
  RPC_URL: process.env.NEXT_PUBLIC_BLOCKCHAIN_RPC_URL || 'https://rpc-amoy.polygon.technology',
  CHAIN_ID: parseInt(process.env.NEXT_PUBLIC_BLOCKCHAIN_CHAIN_ID || '80002'),
  ISSUER_REGISTRY_ADDRESS: process.env.NEXT_PUBLIC_ISSUER_REGISTRY_ADDRESS || '0x5868c5Fa4eeF9db8Ca998F16845CCffA3B85C472',
  CREDENTIAL_REGISTRY_ADDRESS: process.env.NEXT_PUBLIC_CREDENTIAL_REGISTRY_ADDRESS || '0xE70530BdAe091D597840FD787f5Dafa7c6Ef796A',
};

// =============================================================================
// QR CODE CONFIGURATION
// =============================================================================
export const QR_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_QR_BASE_URL || API_BASE_URL,
  VERIFICATION_ENDPOINT: process.env.NEXT_PUBLIC_QR_VERIFICATION_ENDPOINT || '/api/v1/verify/qr',
};

// =============================================================================
// EXTERNAL SERVICES CONFIGURATION
// =============================================================================
export const EXTERNAL_SERVICES = {
  SANDBOX_API: {
    BASE_URL: process.env.NEXT_PUBLIC_SANDBOX_API_BASE_URL || 'https://api.sandbox.co.in',
  },
  DIDIT_API: {
    BASE_URL: process.env.NEXT_PUBLIC_DIDIT_API_BASE_URL || 'https://verification.didit.me',
  },
};

// =============================================================================
// FEATURE FLAGS
// =============================================================================
export const FEATURE_FLAGS = {
  BLOCKCHAIN_INTEGRATION: process.env.NEXT_PUBLIC_ENABLE_BLOCKCHAIN_INTEGRATION === 'true',
  KYC_VERIFICATION: process.env.NEXT_PUBLIC_ENABLE_KYC_VERIFICATION === 'true',
  QR_GENERATION: process.env.NEXT_PUBLIC_ENABLE_QR_GENERATION === 'true',
  ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
};

// =============================================================================
// APP CONFIGURATION
// =============================================================================
export const APP_CONFIG = {
  NAME: process.env.NEXT_PUBLIC_APP_NAME || 'CredHub',
  VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  PROJECT_NAME: process.env.NEXT_PUBLIC_PROJECT_NAME || 'CredHub',
};

// API endpoints configuration
export const API_ENDPOINTS = {
  // Health and root
  HEALTH: '/api/v1/health',
  ROOT: '/',
  
  // Authentication
  AUTH: {
    REGISTER: '/api/v1/auth/register',
    LOGIN: '/api/v1/auth/login',
    LOGOUT: '/api/v1/auth/logout',
    LOGOUT_ALL: '/api/v1/auth/logout-all',
    REFRESH: '/api/v1/auth/refresh',
    ME: '/api/v1/auth/me',
    VERIFY_TOKEN: '/api/v1/auth/verify-token',
    FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
    VERIFY_CODE: '/api/v1/auth/verify-code',
    RESET_PASSWORD: '/api/v1/auth/reset-password',
  },
  
  // User management
  USERS: {
    PROFILE: '/api/v1/users/profile',
    CHANGE_PASSWORD: '/api/v1/users/change-password',
    DELETE_ACCOUNT: '/api/v1/users/account',
  },
  
  // Roles
  ROLES: '/api/v1/roles',
  
  // Learner endpoints
  LEARNER: {
    CREDENTIALS: '/api/v1/learner/credentials',
    RECOMMENDATIONS: '/api/v1/learner/recommendations/',
    DOWNLOAD_PORTFOLIO: '/api/v1/learner/download-portfolio',
    SHARE: '/api/v1/learner/share',
    SHARED_PROFILE: (userId: string, shareToken: string) => `/api/v1/learner/share/${userId}/${shareToken}`,
  },
  
  // Issuer endpoints
  ISSUER: {
    VERIFICATION_STATUS: '/api/v1/issuer/verification-status',
    SUBMIT_VERIFICATION: '/api/v1/issuer/submit-verification',
    APPROVE_VERIFICATION: (userId: string) => `/api/v1/issuer/verification/${userId}/approve`,
    API_KEYS: '/api/v1/issuer/api-keys',
    DELETE_API_KEY: (keyId: string) => `/api/v1/issuer/api-keys/${keyId}`,
    CREDENTIALS: '/api/v1/issuer/credentials',
    CREDENTIAL_BY_ID: (credentialId: string) => `/api/v1/issuer/credentials/${credentialId}`,
    VERIFY_CREDENTIAL: (credentialId: string) => `/api/v1/issuer/credentials/${credentialId}/verify`,
    DEPLOY_CREDENTIAL: (credentialId: string) => `/api/v1/issuer/credentials/${credentialId}/deploy`,
    UPLOAD_CREDENTIAL: '/api/v1/issuer/credentials/upload',
    EXTRACT_OCR: '/api/v1/issuer/credentials/extract-ocr',
    OVERLAY_QR: '/api/v1/issuer/credentials/overlay-qr',
    CHECK_USER_IS_LEARNER: (learnerId: string) => `/api/v1/issuer/users/${learnerId}/is-learner`,
  },
  
  // Employer endpoints
  EMPLOYER: {
    CANDIDATES: '/api/v1/employer/candidates',
    VERIFY_CREDENTIALS: '/api/v1/employer/verify-credentials',
    VERIFIED_CREDENTIALS: '/api/v1/employer/verified-credentials',
  },
  
  // Blockchain endpoints
  BLOCKCHAIN: {
    ISSUE_CREDENTIAL: '/api/v1/blockchain/credentials/issue',
    COMPLETE_CREDENTIAL: (credentialId: string) => `/api/v1/blockchain/credentials/${credentialId}/complete`,
  },
  
  // KYC endpoints
  KYC: {
    TEST_AUTH: '/api/v1/kyc/test/authenticate',
    AADHAAR_OTP_GENERATE: '/api/v1/kyc/aadhaar/otp/generate',
    AADHAAR_OTP_VERIFY: '/api/v1/kyc/aadhaar/otp/verify',
    PAN_VERIFY: '/api/v1/kyc/pan/verify',
    PHONE_SEND: '/api/v1/kyc/phone/send',
    PHONE_VERIFY: '/api/v1/kyc/phone/verify',
    EMAIL_SEND: '/api/v1/kyc/email/send',
    EMAIL_VERIFY: '/api/v1/kyc/email/verify',
    FACE_VERIFY: '/api/v1/kyc/face/verify',
    GSTIN_SEARCH: '/api/v1/kyc/gstin/search',
  },
};

/**
 * Helper function to build full API URL
 */
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

/**
 * Helper function to get auth headers
 */
export const getAuthHeaders = (): Record<string, string> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

/**
 * Helper function to get API key headers
 */
export const getApiKeyHeaders = (apiKey: string): Record<string, string> => {
  return {
    'Content-Type': 'application/json',
    'X-API-Key': apiKey,
  };
};

export default {
  API_BASE_URL,
  FRONTEND_BASE_URL,
  API_ENDPOINTS,
  buildApiUrl,
  getAuthHeaders,
  getApiKeyHeaders,
};
