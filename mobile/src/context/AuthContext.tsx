import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { authService } from '../services/authService';
import { User, LoginCredentials, RegisterData, ApiError } from '../types';

/**
 * Auth Context
 *
 * Provides authentication state and methods throughout the app:
 * - Current user state
 * - Login/logout functionality
 * - Registration
 * - Authentication status
 * - Loading states
 */

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Check authentication status on mount
   */
  useEffect(() => {
    checkAuthStatus();
  }, []);

  /**
   * Check if user is authenticated and load user data
   */
  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const isAuth = await authService.isAuthenticated();

      if (isAuth) {
        // Load stored user data
        const storedUser = await authService.getStoredUser();
        if (storedUser) {
          setUser(storedUser);
        }

        // Try to fetch fresh user data
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } catch (fetchError) {
          // If fetching fresh data fails, use stored data
          console.warn('Failed to fetch current user:', fetchError);
        }
      }
    } catch (error) {
      console.error('Auth status check error:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login with credentials
   */
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.login(credentials);
      setUser(response.user);
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.message || 'Login failed. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Register new user
   */
  const register = useCallback(async (data: RegisterData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.register(data);
      setUser(response.user);
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage =
        apiError.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      await authService.logout();
      setUser(null);
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.message || 'Logout failed. Please try again.';
      setError(errorMessage);
      // Clear user even if API call fails
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refresh user data from API
   */
  const refreshUser = useCallback(async () => {
    try {
      setError(null);
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage =
        apiError.message || 'Failed to refresh user data.';
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Update user data locally (after profile update)
   */
  const updateUser = useCallback((userData: Partial<User>) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      return { ...prevUser, ...userData };
    });
  }, []);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = user !== null;

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshUser,
    updateUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use auth context
 * This is exported here for convenience, but you can also use the separate useAuth hook
 */
export const useAuthContext = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
