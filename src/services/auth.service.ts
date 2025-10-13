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
  // User profile - GET / PUT /api/v1/users/profile
  static async getUserProfile(): Promise<any> {
    const response = await api.get('/api/v1/users/profile');
    return response.data;
  }

  static async updateUserProfile(data: {
    full_name?: string;
    phone_number?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      postal_code?: string;
    } | null;
  }): Promise<any> {
    const response = await api.put('/api/v1/users/profile', data);
    return response.data;
  }
  // Test backend connectivity
  static async testConnection(): Promise<any> {
    try {
      console.log('Testing backend connection...');
      // Try different common health endpoints
      let response;
      try {
        response = await api.get('/api/v1/health');
      } catch (e) {
        try {
          response = await api.get('/health');
        } catch (e2) {
          try {
            response = await api.get('/');
          } catch (e3) {
            response = await api.get('/api/v1/');
          }
        }
      }
      console.log('Backend connection test - Success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Backend connection test - Failed:', error);
      console.error('Backend connection test - Error status:', error.response?.status);
      console.error('Backend connection test - Error data:', error.response?.data);
      throw error;
    }
  }
  // Register new user
  static async register(data: RegisterRequest): Promise<LoginResponse> {
    try {
      console.log('AuthService.register - API URL:', api.defaults.baseURL);
      console.log('AuthService.register - Full URL:', `${api.defaults.baseURL}/api/v1/auth/register`);
      console.log('AuthService.register - Sending data:', JSON.stringify(data, null, 2));
      console.log('AuthService.register - Request headers:', api.defaults.headers);
      
      const response: AxiosResponse<LoginResponse> = await api.post('/api/v1/auth/register', data);
      console.log('AuthService.register - Response status:', response.status);
      console.log('AuthService.register - Response headers:', response.headers);
      console.log('AuthService.register - Response data:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('AuthService.register - Full error object:', error);
      console.error('AuthService.register - Error message:', error.message);
      console.error('AuthService.register - Error response:', error.response);
      console.error('AuthService.register - Error status:', error.response?.status);
      console.error('AuthService.register - Error data:', error.response?.data);
      console.error('AuthService.register - Error headers:', error.response?.headers);
      throw error;
    }
  }

  // Login user
  static async login(data: LoginRequest): Promise<LoginResponse> {
    const response: AxiosResponse<LoginResponse> = await api.post('/api/v1/auth/login', data);
    
    // Handle remember me functionality
    if (data.remember_me) {
      // Store tokens in localStorage with longer expiration for remember me
      localStorage.setItem('remember_me', 'true');
      localStorage.setItem('remember_email', data.email);
    } else {
      // Clear remember me data if not checked
      localStorage.removeItem('remember_me');
      localStorage.removeItem('remember_email');
    }
    
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

  // Delete account (irreversible)
  static async deleteAccount(): Promise<{ message: string }> {
    const response = await api.delete('/api/v1/users/account');
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

  // Fetch course recommendations
  static async getRecommendations(): Promise<any[]> {
    const response = await api.get('/api/v1/learner/recommendations/');
    return response.data;
  }

  // Fetch available roles for registration (public endpoint - no auth required)
  static async getRoles(): Promise<{ roles: any[], total: number }> {
    try {
      // Create a separate axios instance without auth headers for public endpoints
      const publicApi = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const response = await publicApi.get('/api/v1/roles');
      return response.data;
    } catch (error: any) {
      console.error('AuthService.getRoles - Error:', error);
      throw error;
    }
  }

  // Get user roles information
  static async getUserRoles(userId: string): Promise<any> {
    const response = await api.get(`/api/v1/roles/user/${userId}`);
    return response.data;
  }
}

export default AuthService;
