import axios, { AxiosResponse } from 'axios';
import {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  ForgotPasswordRequest,
  VerifyCodeRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  User,
  AuthTokens,
} from '@/types/auth';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/refresh`,
            { refresh_token: refreshToken }
          );

          const { access_token, refresh_token: newRefreshToken } = response.data;
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject(error);
  }
);

export class AuthService {
  // Register new user
  static async register(data: RegisterRequest): Promise<LoginResponse> {
    const response: AxiosResponse<LoginResponse> = await api.post('/api/v1/auth/register', data);
    return response.data;
  }

  // Login user
  static async login(data: LoginRequest): Promise<LoginResponse> {
    const response: AxiosResponse<LoginResponse> = await api.post('/api/v1/auth/login', data);
    return response.data;
  }

  // Logout user
  static async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await api.post('/api/v1/auth/logout', { refresh_token: refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    // Clear local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  // Logout from all devices
  static async logoutAll(): Promise<void> {
    await api.post('/api/v1/auth/logout-all');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  // Refresh access token
  static async refreshToken(): Promise<AuthTokens> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response: AxiosResponse<AuthTokens> = await api.post('/api/v1/auth/refresh', {
      refresh_token: refreshToken,
    });
    return response.data;
  }

  // Get current user profile
  static async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<User> = await api.get('/api/v1/auth/me');
    return response.data;
  }

  // Verify access token
  static async verifyToken(): Promise<{ valid: boolean; user_id: string; email: string }> {
    const response = await api.get('/api/v1/auth/verify-token');
    return response.data;
  }

  // Forgot password
  static async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    const response = await api.post('/api/v1/auth/forgot-password', data);
    return response.data;
  }

  // Verify reset code
  static async verifyResetCode(data: VerifyCodeRequest): Promise<{ valid: boolean; token: string }> {
    const response = await api.post('/api/v1/auth/verify-code', data);
    return response.data;
  }

  // Reset password
  static async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    const response = await api.post('/api/v1/auth/reset-password', data);
    return response.data;
  }

  // Change password
  static async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    const response = await api.post('/api/v1/users/change-password', data);
    return response.data;
  }

  // Store tokens in localStorage
  static storeTokens(tokens: AuthTokens): void {
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
  }

  // Get stored access token
  static getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Get stored refresh token
  static getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return !!token;
  }
}

export default AuthService;
