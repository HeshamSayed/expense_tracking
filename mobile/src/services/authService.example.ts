/**
 * authService.ts Example
 * Authentication API service
 *
 * INSTRUCTIONS:
 * 1. Rename this file to authService.ts
 * 2. Update API_URL with your backend URL
 * 3. Install axios: npm install axios
 * 4. Implement secure token storage (using expo-secure-store or react-native-encrypted-storage)
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

// TODO: Update this with your actual backend URL
const API_URL = process.env.API_URL || 'https://api.moneyguard.app';

/**
 * Create axios instance with default configuration
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor to add auth token
 */
apiClient.interceptors.request.use(
  async (config) => {
    // TODO: Get token from secure storage
    // const token = await SecureStore.getItemAsync('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for error handling
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // TODO: Handle token expiration
      // - Clear stored token
      // - Navigate to login screen
      // - Show session expired message
    }
    return Promise.reject(error);
  }
);

/**
 * Authentication response types
 */
export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    name?: string;
    createdAt: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

/**
 * Authentication Service
 */
export const authService = {
  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', {
        email,
        password,
      });

      // TODO: Store token securely
      // await SecureStore.setItemAsync('authToken', response.data.token);
      // if (response.data.refreshToken) {
      //   await SecureStore.setItemAsync('refreshToken', response.data.refreshToken);
      // }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle specific error cases
        if (error.response?.status === 401) {
          throw new Error('Invalid credentials');
        }
        if (error.response?.status === 429) {
          throw new Error('Too many login attempts. Please try again later.');
        }
      }
      throw new Error('An error occurred during login. Please try again.');
    }
  },

  /**
   * Register new user
   */
  async register(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', {
        email,
        password,
      });

      // TODO: Store token securely
      // await SecureStore.setItemAsync('authToken', response.data.token);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          throw new Error('This email is already registered');
        }
        if (error.response?.status === 400) {
          throw new Error('Invalid email or password format');
        }
      }
      throw new Error('An error occurred during registration. Please try again.');
    }
  },

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post('/auth/forgot-password', {
        email,
      });

      // Always return success message (security best practice)
      return {
        message: 'If an account exists with this email, you will receive password reset instructions.',
      };
    } catch (error) {
      // Don't expose whether email exists or not
      return {
        message: 'If an account exists with this email, you will receive password reset instructions.',
      };
    }
  },

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post('/auth/reset-password', {
        token,
        password: newPassword,
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          throw new Error('Invalid or expired reset token');
        }
      }
      throw new Error('An error occurred. Please try again.');
    }
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Continue logout even if API call fails
      console.error('Logout error:', error);
    } finally {
      // TODO: Clear stored tokens
      // await SecureStore.deleteItemAsync('authToken');
      // await SecureStore.deleteItemAsync('refreshToken');
    }
  },

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<AuthResponse> {
    try {
      // TODO: Get refresh token from secure storage
      // const refreshToken = await SecureStore.getItemAsync('refreshToken');

      const response = await apiClient.post<AuthResponse>('/auth/refresh', {
        // refreshToken,
      });

      // TODO: Store new token
      // await SecureStore.setItemAsync('authToken', response.data.token);

      return response.data;
    } catch (error) {
      // If refresh fails, user needs to login again
      // TODO: Clear tokens and navigate to login
      throw new Error('Session expired. Please login again.');
    }
  },

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post('/auth/verify-email', {
        token,
      });

      return response.data;
    } catch (error) {
      throw new Error('Invalid or expired verification token');
    }
  },

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post('/auth/resend-verification', {
        email,
      });

      return response.data;
    } catch (error) {
      throw new Error('Failed to resend verification email');
    }
  },

  /**
   * Login with Google
   */
  async loginWithGoogle(idToken: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/google', {
        idToken,
      });

      // TODO: Store token securely
      // await SecureStore.setItemAsync('authToken', response.data.token);

      return response.data;
    } catch (error) {
      throw new Error('Google login failed. Please try again.');
    }
  },

  /**
   * Login with Apple
   */
  async loginWithApple(identityToken: string, user?: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/apple', {
        identityToken,
        user,
      });

      // TODO: Store token securely
      // await SecureStore.setItemAsync('authToken', response.data.token);

      return response.data;
    } catch (error) {
      throw new Error('Apple login failed. Please try again.');
    }
  },

  /**
   * Login with Facebook
   */
  async loginWithFacebook(accessToken: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/facebook', {
        accessToken,
      });

      // TODO: Store token securely
      // await SecureStore.setItemAsync('authToken', response.data.token);

      return response.data;
    } catch (error) {
      throw new Error('Facebook login failed. Please try again.');
    }
  },

  /**
   * Get current user profile
   */
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      throw new Error('Failed to get user profile');
    }
  },
};

export default authService;
