/**
 * Storage Service
 * Handles secure storage (Keychain) and async storage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

// Storage keys
const STORAGE_KEYS = {
  USER: '@moneyguard:user',
  SETTINGS: '@moneyguard:settings',
  ONBOARDING_COMPLETE: '@moneyguard:onboarding_complete',
  THEME: '@moneyguard:theme',
};

// Token management (Secure - Keychain)
export const saveToken = async (token: string): Promise<boolean> => {
  try {
    await Keychain.setGenericPassword('auth_token', token);
    return true;
  } catch (error) {
    console.error('Error saving token:', error);
    return false;
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    const credentials = await Keychain.getGenericPassword();
    if (credentials) {
      return credentials.password;
    }
    return null;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const removeToken = async (): Promise<boolean> => {
  try {
    await Keychain.resetGenericPassword();
    return true;
  } catch (error) {
    console.error('Error removing token:', error);
    return false;
  }
};

// User data management (AsyncStorage)
export const saveUserData = async (userData: any): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    return true;
  } catch (error) {
    console.error('Error saving user data:', error);
    return false;
  }
};

export const getUserData = async (): Promise<any | null> => {
  try {
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

export const removeUserData = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    return true;
  } catch (error) {
    console.error('Error removing user data:', error);
    return false;
  }
};

// Settings management
export const saveSettings = async (settings: any): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
};

export const getSettings = async (): Promise<any | null> => {
  try {
    const settings = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    return settings ? JSON.parse(settings) : null;
  } catch (error) {
    console.error('Error getting settings:', error);
    return null;
  }
};

// Theme management
export const saveTheme = async (theme: 'light' | 'dark' | 'auto'): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.THEME, theme);
    return true;
  } catch (error) {
    console.error('Error saving theme:', error);
    return false;
  }
};

export const getTheme = async (): Promise<'light' | 'dark' | 'auto' | null> => {
  try {
    const theme = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
    return theme as 'light' | 'dark' | 'auto' | null;
  } catch (error) {
    console.error('Error getting theme:', error);
    return null;
  }
};

// Onboarding status
export const setOnboardingComplete = async (): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
    return true;
  } catch (error) {
    console.error('Error setting onboarding status:', error);
    return false;
  }
};

export const isOnboardingComplete = async (): Promise<boolean> => {
  try {
    const status = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
    return status === 'true';
  } catch (error) {
    console.error('Error getting onboarding status:', error);
    return false;
  }
};

// Clear all data (logout)
export const clearAllData = async (): Promise<boolean> => {
  try {
    await removeToken();
    await AsyncStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing all data:', error);
    return false;
  }
};
