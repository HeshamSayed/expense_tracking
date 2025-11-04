import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * useAuth Hook
 *
 * Custom hook for accessing authentication context
 * Provides a clean interface to authentication state and methods
 *
 * Usage:
 * ```typescript
 * const { user, isAuthenticated, login, logout } = useAuth();
 * ```
 */

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export default useAuth;
