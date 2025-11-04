/**
 * Common TypeScript type definitions
 */

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

// Expense types
export interface Expense {
  id: string;
  userId: string;
  amount: number;
  categoryId: string;
  description: string;
  date: string;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Category types
export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
}

// Budget types
export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Navigation types
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  ExpenseList: undefined;
  ExpenseDetail: {expenseId: string};
  AddExpense: undefined;
  Profile: undefined;
  Settings: undefined;
  Reports: undefined;
};

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ExpenseFormData {
  amount: string;
  categoryId: string;
  description: string;
  date: Date;
  receiptImage?: string;
}
