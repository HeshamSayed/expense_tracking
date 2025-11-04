import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage Service
 *
 * Provides secure storage for sensitive data (tokens) using react-native-keychain
 * and regular storage for non-sensitive data using AsyncStorage.
 */

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  THEME_PREFERENCE: 'theme_preference',
  LANGUAGE: 'language',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  BIOMETRIC_ENABLED: 'biometric_enabled',
} as const;

/**
 * Secure Storage using react-native-keychain
 * Used for storing sensitive data like tokens
 */
export class SecureStorage {
  /**
   * Store access and refresh tokens securely
   */
  static async saveTokens(
    accessToken: string,
    refreshToken: string
  ): Promise<boolean> {
    try {
      await Keychain.setGenericPassword(
        STORAGE_KEYS.ACCESS_TOKEN,
        JSON.stringify({
          accessToken,
          refreshToken,
          timestamp: Date.now(),
        }),
        {
          service: 'com.expensetracker.auth',
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
        }
      );
      return true;
    } catch (error) {
      console.error('Error saving tokens:', error);
      return false;
    }
  }

  /**
   * Retrieve stored tokens
   */
  static async getTokens(): Promise<{
    accessToken: string;
    refreshToken: string;
  } | null> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: 'com.expensetracker.auth',
      });

      if (!credentials) {
        return null;
      }

      const { accessToken, refreshToken } = JSON.parse(credentials.password);
      return { accessToken, refreshToken };
    } catch (error) {
      console.error('Error retrieving tokens:', error);
      return null;
    }
  }

  /**
   * Get only the access token
   */
  static async getAccessToken(): Promise<string | null> {
    const tokens = await this.getTokens();
    return tokens?.accessToken || null;
  }

  /**
   * Get only the refresh token
   */
  static async getRefreshToken(): Promise<string | null> {
    const tokens = await this.getTokens();
    return tokens?.refreshToken || null;
  }

  /**
   * Clear all stored tokens
   */
  static async clearTokens(): Promise<boolean> {
    try {
      await Keychain.resetGenericPassword({
        service: 'com.expensetracker.auth',
      });
      return true;
    } catch (error) {
      console.error('Error clearing tokens:', error);
      return false;
    }
  }

  /**
   * Check if biometric authentication is available
   */
  static async isBiometricsAvailable(): Promise<boolean> {
    try {
      const biometryType = await Keychain.getSupportedBiometryType();
      return biometryType !== null;
    } catch (error) {
      console.error('Error checking biometrics:', error);
      return false;
    }
  }

  /**
   * Get supported biometry type
   */
  static async getBiometryType(): Promise<Keychain.BIOMETRY_TYPE | null> {
    try {
      return await Keychain.getSupportedBiometryType();
    } catch (error) {
      console.error('Error getting biometry type:', error);
      return null;
    }
  }
}

/**
 * Regular Storage using AsyncStorage
 * Used for non-sensitive data
 */
export class Storage {
  /**
   * Save user data
   */
  static async saveUserData(userData: any): Promise<boolean> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_DATA,
        JSON.stringify(userData)
      );
      return true;
    } catch (error) {
      console.error('Error saving user data:', error);
      return false;
    }
  }

  /**
   * Get user data
   */
  static async getUserData(): Promise<any | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  /**
   * Clear user data
   */
  static async clearUserData(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
      return true;
    } catch (error) {
      console.error('Error clearing user data:', error);
      return false;
    }
  }

  /**
   * Save theme preference
   */
  static async saveThemePreference(theme: 'light' | 'dark'): Promise<boolean> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME_PREFERENCE, theme);
      return true;
    } catch (error) {
      console.error('Error saving theme preference:', error);
      return false;
    }
  }

  /**
   * Get theme preference
   */
  static async getThemePreference(): Promise<'light' | 'dark' | null> {
    try {
      const theme = await AsyncStorage.getItem(STORAGE_KEYS.THEME_PREFERENCE);
      return theme as 'light' | 'dark' | null;
    } catch (error) {
      console.error('Error getting theme preference:', error);
      return null;
    }
  }

  /**
   * Set onboarding completed status
   */
  static async setOnboardingCompleted(completed: boolean): Promise<boolean> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.ONBOARDING_COMPLETED,
        JSON.stringify(completed)
      );
      return true;
    } catch (error) {
      console.error('Error setting onboarding status:', error);
      return false;
    }
  }

  /**
   * Check if onboarding is completed
   */
  static async isOnboardingCompleted(): Promise<boolean> {
    try {
      const completed = await AsyncStorage.getItem(
        STORAGE_KEYS.ONBOARDING_COMPLETED
      );
      return completed === 'true';
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  }

  /**
   * Set biometric authentication preference
   */
  static async setBiometricEnabled(enabled: boolean): Promise<boolean> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.BIOMETRIC_ENABLED,
        JSON.stringify(enabled)
      );
      return true;
    } catch (error) {
      console.error('Error setting biometric preference:', error);
      return false;
    }
  }

  /**
   * Check if biometric authentication is enabled
   */
  static async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
      return enabled === 'true';
    } catch (error) {
      console.error('Error checking biometric preference:', error);
      return false;
    }
  }

  /**
   * Save a generic item
   */
  static async setItem(key: string, value: any): Promise<boolean> {
    try {
      const stringValue =
        typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(key, stringValue);
      return true;
    } catch (error) {
      console.error(`Error saving item ${key}:`, error);
      return false;
    }
  }

  /**
   * Get a generic item
   */
  static async getItem(key: string): Promise<any | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (!value) return null;

      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove a generic item
   */
  static async removeItem(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear all storage
   */
  static async clearAll(): Promise<boolean> {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing all storage:', error);
      return false;
    }
  }
}

// Export storage keys for use in other modules
export { STORAGE_KEYS };
