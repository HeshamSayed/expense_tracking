/**
 * Authentication related TypeScript types
 */

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ValidationErrors {
  [key: string]: string;
}

export interface AuthScreenProps {
  navigation: any; // Replace with proper navigation type from @react-navigation/native
}

export interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  icon: string;
  image?: string;
}
