/**
 * API Configuration
 */

import {Platform} from 'react-native';

// Base API URL - Update this based on your environment
export const API_BASE_URL = __DEV__
  ? Platform.select({
      ios: 'http://localhost:3000/api',
      android: 'http://10.0.2.2:3000/api', // Android emulator localhost
    })
  : 'https://api.moneyguard.com/api';

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',
  VERIFY_EMAIL: '/auth/verify-email',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',

  // User
  USER_PROFILE: '/user/profile',
  UPDATE_PROFILE: '/user/profile',
  CHANGE_PASSWORD: '/user/change-password',
  DELETE_ACCOUNT: '/user/delete-account',

  // Expenses
  EXPENSES: '/expenses',
  EXPENSE_BY_ID: (id: string) => `/expenses/${id}`,
  EXPENSE_STATS: '/expenses/stats',
  EXPENSE_EXPORT: '/expenses/export',

  // Categories
  CATEGORIES: '/categories',
  CATEGORY_BY_ID: (id: string) => `/categories/${id}`,

  // Budgets
  BUDGETS: '/budgets',
  BUDGET_BY_ID: (id: string) => `/budgets/${id}`,
  BUDGET_PROGRESS: (id: string) => `/budgets/${id}/progress`,

  // Reports
  REPORTS_OVERVIEW: '/reports/overview',
  REPORTS_BY_CATEGORY: '/reports/by-category',
  REPORTS_BY_PERIOD: '/reports/by-period',
  REPORTS_TRENDS: '/reports/trends',

  // Upload
  UPLOAD_RECEIPT: '/upload/receipt',
};

// API request timeout (in milliseconds)
export const API_TIMEOUT = 30000;

// Retry configuration
export const API_RETRY_COUNT = 3;
export const API_RETRY_DELAY = 1000;
