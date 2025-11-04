import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';
import { Storage } from '../services/storageService';
import { Theme, ThemeMode, ThemeColors } from '../types';

/**
 * Theme Context
 *
 * Provides theme management for the app:
 * - Light/Dark/System mode switching
 * - Theme colors and styling
 * - Persistent theme preference
 */

// Light theme colors
const lightColors: ThemeColors = {
  primary: '#007AFF',
  primaryDark: '#0051D5',
  primaryLight: '#4DA2FF',
  secondary: '#5856D6',
  background: '#F2F2F7',
  surface: '#FFFFFF',
  error: '#FF3B30',
  success: '#34C759',
  warning: '#FF9500',
  info: '#5AC8FA',
  text: '#000000',
  textSecondary: '#8E8E93',
  border: '#E5E5EA',
  disabled: '#C7C7CC',
  placeholder: '#C7C7CC',
  income: '#34C759',
  expense: '#FF3B30',
};

// Dark theme colors
const darkColors: ThemeColors = {
  primary: '#0A84FF',
  primaryDark: '#0051D5',
  primaryLight: '#64B5FF',
  secondary: '#5E5CE6',
  background: '#000000',
  surface: '#1C1C1E',
  error: '#FF453A',
  success: '#32D74B',
  warning: '#FF9F0A',
  info: '#64D2FF',
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  border: '#38383A',
  disabled: '#48484A',
  placeholder: '#48484A',
  income: '#32D74B',
  expense: '#FF453A',
};

// Common theme properties
const commonTheme = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: '700' as const,
      lineHeight: 40,
    },
    h2: {
      fontSize: 28,
      fontWeight: '600' as const,
      lineHeight: 36,
    },
    h3: {
      fontSize: 24,
      fontWeight: '600' as const,
      lineHeight: 32,
    },
    h4: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
    },
    button: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    round: 9999,
  },
};

// Create light theme
const createLightTheme = (): Theme => ({
  mode: 'light',
  colors: lightColors,
  ...commonTheme,
});

// Create dark theme
const createDarkTheme = (): Theme => ({
  mode: 'dark',
  colors: darkColors,
  ...commonTheme,
});

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [theme, setTheme] = useState<Theme>(createLightTheme());

  /**
   * Load saved theme preference on mount
   */
  useEffect(() => {
    loadThemePreference();
  }, []);

  /**
   * Update theme when mode or system scheme changes
   */
  useEffect(() => {
    updateTheme();
  }, [themeMode, systemColorScheme]);

  /**
   * Load theme preference from storage
   */
  const loadThemePreference = async () => {
    try {
      const savedTheme = await Storage.getThemePreference();
      if (savedTheme) {
        setThemeModeState(savedTheme as ThemeMode);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  /**
   * Update theme based on current mode
   */
  const updateTheme = () => {
    let isDarkMode = false;

    if (themeMode === 'system') {
      isDarkMode = systemColorScheme === 'dark';
    } else if (themeMode === 'dark') {
      isDarkMode = true;
    }

    setTheme(isDarkMode ? createDarkTheme() : createLightTheme());
  };

  /**
   * Set theme mode and save preference
   */
  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      await Storage.saveThemePreference(mode as 'light' | 'dark');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  }, []);

  /**
   * Toggle between light and dark mode
   */
  const toggleTheme = useCallback(() => {
    const newMode = theme.mode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
  }, [theme.mode, setThemeMode]);

  /**
   * Check if current theme is dark
   */
  const isDark = theme.mode === 'dark';

  const value: ThemeContextType = {
    theme,
    themeMode,
    isDark,
    setThemeMode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

/**
 * Custom hook to use theme context
 */
export const useTheme = (): ThemeContextType => {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Export themes for testing or direct use
export { createLightTheme, createDarkTheme, lightColors, darkColors };
