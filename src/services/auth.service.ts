import axios, { AxiosResponse } from 'axios';
import { API_BASE_URL } from '@/config/api';
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
  baseURL: API_BASE_URL,
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
    
    // Skip interceptor handling for auth endpoints
    if (originalRequest.url?.includes('/auth/')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

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
  private static readonly MAX_LOGIN_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

  // Get login attempts from localStorage
  private static getLoginAttempts(email: string): { attempts: number; lastAttemptTime: number } {
    const key = `login_attempts_${email}`;
    const stored = localStorage.getItem(key);
    
    if (!stored) {
      return { attempts: 0, lastAttemptTime: 0 };
    }
    
    try {
      return JSON.parse(stored);
    } catch {
      return { attempts: 0, lastAttemptTime: 0 };
    }
  }

  // Set login attempts in localStorage
  private static setLoginAttempts(email: string, attempts: number, lastAttemptTime: number): void {
    const key = `login_attempts_${email}`;
    localStorage.setItem(key, JSON.stringify({ attempts, lastAttemptTime }));
  }

  // Clear login attempts
  private static clearLoginAttempts(email: string): void {
    const key = `login_attempts_${email}`;
    localStorage.removeItem(key);
  }

  // Check if account is locked
  private static isAccountLocked(email: string): boolean {
    const { attempts, lastAttemptTime } = this.getLoginAttempts(email);
    
    if (attempts < this.MAX_LOGIN_ATTEMPTS) {
      return false;
    }
    
    const now = Date.now();
    const timeSinceLastAttempt = now - lastAttemptTime;
    
    // Account is locked if lockout duration hasn't passed
    return timeSinceLastAttempt < this.LOCKOUT_DURATION;
  }

  // Get remaining lockout time in minutes
  static getRemainingLockoutTime(email: string): number {
    const { attempts, lastAttemptTime } = this.getLoginAttempts(email);
    
    if (attempts < this.MAX_LOGIN_ATTEMPTS) {
      return 0;
    }
    
    const now = Date.now();
    const timeSinceLastAttempt = now - lastAttemptTime;
    const remainingTime = this.LOCKOUT_DURATION - timeSinceLastAttempt;
    
    return Math.ceil(remainingTime / 60000); // Return in minutes
  }

  // Record failed login attempt
  private static recordFailedAttempt(email: string): void {
    const { attempts } = this.getLoginAttempts(email);
    this.setLoginAttempts(email, attempts + 1, Date.now());
  }

  // User profile - GET / PUT /users/profile
  static async getUserProfile(): Promise<any> {
    const response = await api.get('/users/profile');
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
    const response = await api.put('/users/profile', data);
    return response.data;
  }
  // Test backend connectivity
  static async testConnection(): Promise<any> {
    try {
      console.log('Testing backend connection...');
      // Try different common health endpoints
      let response;
      const candidates = ['/health', '/', ''];
      for (const path of candidates) {
        try {
          response = await api.get(path);
          break;
        } catch (e) {
          response = undefined;
        }
      }
      if (!response) {
        throw new Error('Unable to reach backend health endpoints');
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
      console.log('AuthService.register - Full URL:', `${api.defaults.baseURL}/auth/register`);
      console.log('AuthService.register - Sending data:', JSON.stringify(data, null, 2));
      console.log('AuthService.register - Request headers:', api.defaults.headers);
      
      const response: AxiosResponse<LoginResponse> = await api.post('/auth/register', data);
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
    // Check if account is locked
    if (this.isAccountLocked(data.email)) {
      const remainingTime = this.getRemainingLockoutTime(data.email);
      throw new Error(`Account locked due to too many failed login attempts. Try again in ${remainingTime} minute(s).`);
    }

    try {
      const response: AxiosResponse<LoginResponse> = await api.post('/auth/login', data);
      
      // Clear login attempts on successful login
      this.clearLoginAttempts(data.email);
      
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
    } catch (error: any) {
      console.error('Login error details:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        detail: error.response?.data?.detail,
        errorMessage: error.message
      });

      // Record failed attempt on authentication error
      if (error.response?.status === 401) {
        this.recordFailedAttempt(data.email);
        const { attempts } = this.getLoginAttempts(data.email);
        const remainingAttempts = this.MAX_LOGIN_ATTEMPTS - attempts;
        
        if (remainingAttempts > 0) {
          throw new Error(`Invalid email or password. ${remainingAttempts} attempt(s) remaining before account lock.`);
        } else {
          const remainingTime = this.getRemainingLockoutTime(data.email);
          throw new Error(`Account locked due to too many failed login attempts. Try again in ${remainingTime} minute(s).`);
        }
      }

      // Extract meaningful error message
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error(error.message || 'Login failed');
    }
  }

  // Logout user
  static async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refresh_token: refreshToken });
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
    await api.post('/auth/logout-all');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  // Refresh access token
  static async refreshToken(): Promise<AuthTokens> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response: AxiosResponse<AuthTokens> = await api.post('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return response.data;
  }

  // Get current user profile
  static async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<User> = await api.get('/auth/me');
    return response.data;
  }

  // Verify access token
  static async verifyToken(): Promise<{ valid: boolean; user_id: string; email: string }> {
    const response = await api.get('/auth/verify-token');
    return response.data;
  }

  // Forgot password
  static async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    const response = await api.post('/auth/forgot-password', data);
    return response.data;
  }

  // Verify reset code
  static async verifyResetCode(data: VerifyCodeRequest): Promise<{ valid: boolean; token: string }> {
    const response = await api.post('/auth/verify-code', data);
    return response.data;
  }

  // Reset password
  static async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  }

  // Change password
  static async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    const response = await api.post('/users/change-password', data);
    return response.data;
  }

  // Delete account (irreversible)
  static async deleteAccount(): Promise<{ message: string }> {
    const response = await api.delete('/users/account');
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
    const response = await api.get('/learner/recommendations/');
    return response.data;
  }

  // Fetch available roles for registration (public endpoint - no auth required)
  static async getRoles(): Promise<{ roles: any[], total: number }> {
    try {
      // Create a separate axios instance without auth headers for public endpoints
      const publicApi = axios.create({
        baseURL: API_BASE_URL,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const response = await publicApi.get('/roles');
      return response.data;
    } catch (error: any) {
      console.error('AuthService.getRoles - Error:', error);
      throw error;
    }
  }

  // Get user roles information
  static async getUserRoles(userId: string): Promise<any> {
    const response = await api.get(`/roles/user/${userId}`);
    return response.data;
  }

  // Admin function to unlock a user account (for removing account lock)
  static unlockUserAccount(email: string): void {
    this.clearLoginAttempts(email);
  }

  // Admin function to get account lock status
  static getAccountLockStatus(email: string): { isLocked: boolean; remainingTimeMinutes: number; attempts: number } {
    const isLocked = this.isAccountLocked(email);
    const remainingTime = isLocked ? this.getRemainingLockoutTime(email) : 0;
    const { attempts } = this.getLoginAttempts(email);
    
    return {
      isLocked,
      remainingTimeMinutes: remainingTime,
      attempts
    };
  }
}

export default AuthService;
