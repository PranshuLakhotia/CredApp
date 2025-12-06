export type UserRole = 'learner' | 'employer' | 'institution' | 'admin';

export interface User {
  id?: string;
  _id?: string;
  email: string;
  full_name: string;
  phone_number?: string;
  gender?: string;
  is_active: boolean;
  is_verified: boolean;
  is_superuser?: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
  // Role is added client-side for dashboard functionality
  role?: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterRequest {
  email: string;
  full_name: string;
  password: string;
  confirm_password: string;
  role_type?: string; // Role type selected during registration
  phone_number?: string;
  date_of_birth?: string;
  gender?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
  };
  kyc_verification?: {
    status?: string;
    documents?: string[];
    verified_at?: string;
    verification_level?: string;
  };
}

export interface Role {
  id: string;
  name: string;
  description: string;
  role_type: string;
  permissions: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Form data types for UI components
export interface LoginFormData {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  dateOfBirth?: string;
  gender?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyCodeRequest {
  email: string;
  code: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
  confirm_password: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, unknown>;
}