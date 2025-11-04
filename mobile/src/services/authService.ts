import { apiService } from './apiService';
import { SecureStorage, Storage } from './storageService';
import { API_CONFIG } from '../config/api';
import {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
  AuthTokens,
} from '../types';

/**
 * Authentication Service
 *
 * Handles all authentication-related operations:
 * - Login
 * - Register
 * - Logout
 * - Token refresh
 * - Password management
 * - Email verification
 */

class AuthService {
  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>(
        API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      const { user, tokens } = response.data;

      // Save tokens and user data
      await this.saveAuthData(user, tokens);

      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>(
        API_CONFIG.ENDPOINTS.AUTH.REGISTER,
        data
      );

      const { user, tokens } = response.data;

      // Save tokens and user data
      await this.saveAuthData(user, tokens);

      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint (if your API has one)
      await apiService.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Clear all local data
      await this.clearAuthData();
    }
  }

  /**
   * Refresh authentication tokens
   */
  async refreshTokens(): Promise<AuthTokens> {
    try {
      const refreshToken = await SecureStorage.getRefreshToken();

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiService.post<AuthTokens>(
        API_CONFIG.ENDPOINTS.AUTH.REFRESH,
        { refreshToken }
      );

      const { accessToken, refreshToken: newRefreshToken } = response.data;

      // Save new tokens
      await SecureStorage.saveTokens(accessToken, newRefreshToken);

      return response.data;
    } catch (error) {
      console.error('Token refresh error:', error);
      // Clear auth data if refresh fails
      await this.clearAuthData();
      throw error;
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiService.get<User>(
        API_CONFIG.ENDPOINTS.USER.PROFILE
      );

      // Update stored user data
      await Storage.saveUserData(response.data);

      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<void> {
    try {
      await apiService.post(API_CONFIG.ENDPOINTS.AUTH.VERIFY_EMAIL, { token });
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<void> {
    try {
      await apiService.post(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        email,
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await apiService.post(API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, {
        token,
        newPassword,
      });
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  /**
   * Change password (when logged in)
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      await apiService.post(API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        currentPassword,
        newPassword,
      });
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const tokens = await SecureStorage.getTokens();
      return tokens !== null;
    } catch (error) {
      console.error('Authentication check error:', error);
      return false;
    }
  }

  /**
   * Get stored user data
   */
  async getStoredUser(): Promise<User | null> {
    try {
      return await Storage.getUserData();
    } catch (error) {
      console.error('Get stored user error:', error);
      return null;
    }
  }

  /**
   * Save authentication data (tokens and user)
   */
  private async saveAuthData(user: User, tokens: AuthTokens): Promise<void> {
    try {
      await Promise.all([
        SecureStorage.saveTokens(tokens.accessToken, tokens.refreshToken),
        Storage.saveUserData(user),
      ]);
    } catch (error) {
      console.error('Save auth data error:', error);
      throw error;
    }
  }

  /**
   * Clear all authentication data
   */
  private async clearAuthData(): Promise<void> {
    try {
      await Promise.all([
        SecureStorage.clearTokens(),
        Storage.clearUserData(),
      ]);
    } catch (error) {
      console.error('Clear auth data error:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    try {
      const response = await apiService.put<User>(
        API_CONFIG.ENDPOINTS.USER.UPDATE_PROFILE,
        data
      );

      // Update stored user data
      await Storage.saveUserData(response.data);

      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(password: string): Promise<void> {
    try {
      await apiService.delete(API_CONFIG.ENDPOINTS.USER.DELETE_ACCOUNT, {
        data: { password },
      });

      // Clear all data after account deletion
      await this.clearAuthData();
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
  }

  /**
   * Check if access token is expired
   * Note: This is a basic implementation. For production, you might want to
   * decode the JWT and check the exp claim.
   */
  async isTokenExpired(): Promise<boolean> {
    try {
      const token = await SecureStorage.getAccessToken();
      if (!token) return true;

      // Try to decode JWT and check expiration
      // For now, we'll return false and let the API interceptor handle it
      return false;
    } catch (error) {
      console.error('Token expiration check error:', error);
      return true;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();

// Export the class for testing purposes
export default AuthService;
