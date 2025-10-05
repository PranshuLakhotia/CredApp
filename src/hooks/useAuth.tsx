'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthState, User, AuthTokens, LoginRequest, RegisterRequest } from '@/types/auth';
import { AuthService } from '@/services/auth.service';

// Auth actions
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; tokens: AuthTokens } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_USER'; payload: User }
  | { type: 'CLEAR_ERROR' }
  | { type: 'INIT_COMPLETE' };

// Initial state
const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading true to prevent flash of login screen
  error: null,
};

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'INIT_COMPLETE':
      return {
        ...state,
        isLoading: false,
      };
    default:
      return state;
  }
}

// Auth context
interface AuthContextType extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = AuthService.getAccessToken();
      if (token) {
        try {
          dispatch({ type: 'AUTH_START' });
          const user = await AuthService.getCurrentUser();
          const tokens = {
            access_token: AuthService.getAccessToken() || '',
            refresh_token: AuthService.getRefreshToken() || '',
            token_type: 'bearer',
            expires_in: 3600,
          };
          dispatch({ type: 'AUTH_SUCCESS', payload: { user, tokens } });
        } catch (error) {
          console.error('Auth initialization failed:', error);
          // If access token is invalid, try to refresh
          const refreshToken = AuthService.getRefreshToken();
          if (refreshToken) {
            try {
              const newTokens = await AuthService.refreshToken();
              AuthService.storeTokens(newTokens);
              const user = await AuthService.getCurrentUser();
              dispatch({ type: 'AUTH_SUCCESS', payload: { user, tokens: newTokens } });
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
              AuthService.logout();
              dispatch({ type: 'AUTH_FAILURE', payload: 'Session expired' });
            }
          } else {
            AuthService.logout();
            dispatch({ type: 'AUTH_FAILURE', payload: 'Session expired' });
          }
        }
      } else {
        // No token found, initialization complete
        dispatch({ type: 'INIT_COMPLETE' });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (data: LoginRequest) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await AuthService.login(data);
      
      // Store tokens
      AuthService.storeTokens(response.tokens);
      
      // No role restrictions - user can access all dashboards
      dispatch({ 
        type: 'AUTH_SUCCESS', 
        payload: { 
          user: response.user, 
          tokens: response.tokens 
        } 
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Register function
  const register = async (data: RegisterRequest) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await AuthService.register(data);
      
      // Store tokens
      AuthService.storeTokens(response.tokens);
      
      // No role restrictions - user can access all dashboards
      dispatch({ 
        type: 'AUTH_SUCCESS', 
        payload: { 
          user: response.user, 
          tokens: response.tokens 
        } 
      });
    } catch (error: any) {
      console.error('useAuth.register - Full error:', error);
      console.error('useAuth.register - Error response:', error.response);
      console.error('useAuth.register - Error data:', error.response?.data);
      console.error('useAuth.register - Error status:', error.response?.status);
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          error.message || 
                          'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Logout from all devices
  const logoutAll = async () => {
    try {
      await AuthService.logoutAll();
    } catch (error) {
      console.error('Logout all error:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      const user = await AuthService.getCurrentUser();
      dispatch({ type: 'SET_USER', payload: user });
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    logoutAll,
    clearError,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default useAuth;
