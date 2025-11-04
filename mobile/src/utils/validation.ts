/**
 * Validation Utilities
 *
 * Common validation functions for forms and user input
 */

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Email validation
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
};

/**
 * Password validation
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password || password.trim() === '') {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return {
      isValid: false,
      error: 'Password must be at least 8 characters long',
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one uppercase letter',
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one lowercase letter',
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one number',
    };
  }

  return { isValid: true };
};

/**
 * Confirm password validation
 */
export const validateConfirmPassword = (
  password: string,
  confirmPassword: string
): ValidationResult => {
  if (!confirmPassword || confirmPassword.trim() === '') {
    return { isValid: false, error: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }

  return { isValid: true };
};

/**
 * Name validation
 */
export const validateName = (name: string, fieldName = 'Name'): ValidationResult => {
  if (!name || name.trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }

  if (name.trim().length < 2) {
    return {
      isValid: false,
      error: `${fieldName} must be at least 2 characters long`,
    };
  }

  if (name.length > 50) {
    return {
      isValid: false,
      error: `${fieldName} must not exceed 50 characters`,
    };
  }

  return { isValid: true };
};

/**
 * Amount validation
 */
export const validateAmount = (amount: string | number): ValidationResult => {
  if (!amount || amount === '') {
    return { isValid: false, error: 'Amount is required' };
  }

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return { isValid: false, error: 'Please enter a valid amount' };
  }

  if (numAmount <= 0) {
    return { isValid: false, error: 'Amount must be greater than 0' };
  }

  if (numAmount > 999999999) {
    return { isValid: false, error: 'Amount is too large' };
  }

  return { isValid: true };
};

/**
 * Description validation
 */
export const validateDescription = (
  description: string,
  required = true
): ValidationResult => {
  if (required && (!description || description.trim() === '')) {
    return { isValid: false, error: 'Description is required' };
  }

  if (description && description.length > 500) {
    return {
      isValid: false,
      error: 'Description must not exceed 500 characters',
    };
  }

  return { isValid: true };
};

/**
 * Category validation
 */
export const validateCategory = (categoryId: string): ValidationResult => {
  if (!categoryId || categoryId.trim() === '') {
    return { isValid: false, error: 'Please select a category' };
  }

  return { isValid: true };
};

/**
 * Date validation
 */
export const validateDate = (date: Date | string | null): ValidationResult => {
  if (!date) {
    return { isValid: false, error: 'Date is required' };
  }

  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    return { isValid: false, error: 'Please enter a valid date' };
  }

  // Check if date is not in the future (for transactions)
  const now = new Date();
  if (dateObj > now) {
    return { isValid: false, error: 'Date cannot be in the future' };
  }

  // Check if date is not too old (e.g., more than 10 years ago)
  const tenYearsAgo = new Date();
  tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
  if (dateObj < tenYearsAgo) {
    return { isValid: false, error: 'Date cannot be more than 10 years ago' };
  }

  return { isValid: true };
};

/**
 * Phone number validation
 */
export const validatePhone = (phone: string, required = false): ValidationResult => {
  if (!phone || phone.trim() === '') {
    if (required) {
      return { isValid: false, error: 'Phone number is required' };
    }
    return { isValid: true };
  }

  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');

  if (digitsOnly.length < 10 || digitsOnly.length > 15) {
    return {
      isValid: false,
      error: 'Please enter a valid phone number',
    };
  }

  return { isValid: true };
};

/**
 * URL validation
 */
export const validateUrl = (url: string, required = false): ValidationResult => {
  if (!url || url.trim() === '') {
    if (required) {
      return { isValid: false, error: 'URL is required' };
    }
    return { isValid: true };
  }

  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Please enter a valid URL' };
  }
};

/**
 * Required field validation
 */
export const validateRequired = (
  value: any,
  fieldName = 'This field'
): ValidationResult => {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }

  if (typeof value === 'string' && value.trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }

  return { isValid: true };
};

/**
 * Min length validation
 */
export const validateMinLength = (
  value: string,
  minLength: number,
  fieldName = 'This field'
): ValidationResult => {
  if (!value || value.length < minLength) {
    return {
      isValid: false,
      error: `${fieldName} must be at least ${minLength} characters long`,
    };
  }

  return { isValid: true };
};

/**
 * Max length validation
 */
export const validateMaxLength = (
  value: string,
  maxLength: number,
  fieldName = 'This field'
): ValidationResult => {
  if (value && value.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} must not exceed ${maxLength} characters`,
    };
  }

  return { isValid: true };
};

/**
 * Budget amount validation
 */
export const validateBudgetAmount = (
  amount: string | number,
  minAmount = 1
): ValidationResult => {
  const result = validateAmount(amount);
  if (!result.isValid) return result;

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (numAmount < minAmount) {
    return {
      isValid: false,
      error: `Budget amount must be at least ${minAmount}`,
    };
  }

  return { isValid: true };
};

/**
 * Date range validation
 */
export const validateDateRange = (
  startDate: Date | string,
  endDate: Date | string
): ValidationResult => {
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { isValid: false, error: 'Please enter valid dates' };
  }

  if (start > end) {
    return { isValid: false, error: 'Start date must be before end date' };
  }

  return { isValid: true };
};

/**
 * Username validation
 */
export const validateUsername = (username: string): ValidationResult => {
  if (!username || username.trim() === '') {
    return { isValid: false, error: 'Username is required' };
  }

  if (username.length < 3) {
    return {
      isValid: false,
      error: 'Username must be at least 3 characters long',
    };
  }

  if (username.length > 20) {
    return {
      isValid: false,
      error: 'Username must not exceed 20 characters',
    };
  }

  // Username should only contain letters, numbers, and underscores
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return {
      isValid: false,
      error: 'Username can only contain letters, numbers, and underscores',
    };
  }

  return { isValid: true };
};

/**
 * Validate multiple fields and return all errors
 */
export const validateFields = (
  validations: Array<{ field: string; result: ValidationResult }>
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  validations.forEach(({ field, result }) => {
    if (!result.isValid && result.error) {
      errors[field] = result.error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Sanitize input (remove potentially harmful characters)
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';

  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
};

/**
 * Credit card validation (Luhn algorithm)
 */
export const validateCreditCard = (cardNumber: string): ValidationResult => {
  if (!cardNumber || cardNumber.trim() === '') {
    return { isValid: false, error: 'Card number is required' };
  }

  // Remove spaces and dashes
  const digits = cardNumber.replace(/[\s-]/g, '');

  // Check if it contains only digits
  if (!/^\d+$/.test(digits)) {
    return { isValid: false, error: 'Card number must contain only digits' };
  }

  // Check length (typically 13-19 digits)
  if (digits.length < 13 || digits.length > 19) {
    return { isValid: false, error: 'Invalid card number length' };
  }

  // Luhn algorithm
  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  if (sum % 10 !== 0) {
    return { isValid: false, error: 'Invalid card number' };
  }

  return { isValid: true };
};

export default {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateName,
  validateAmount,
  validateDescription,
  validateCategory,
  validateDate,
  validatePhone,
  validateUrl,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateBudgetAmount,
  validateDateRange,
  validateUsername,
  validateFields,
  sanitizeInput,
  validateCreditCard,
};
