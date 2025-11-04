/**
 * Formatter Utilities
 *
 * Common formatting functions for currency, dates, numbers, etc.
 */

/**
 * Format currency with symbol and locale
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US',
  showSymbol: boolean = true
): string => {
  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const formatted = formatter.format(amount);

    // If showSymbol is false, remove the currency symbol
    if (!showSymbol) {
      return formatted.replace(/[^\d,.-]/g, '').trim();
    }

    return formatted;
  } catch (error) {
    console.error('Currency formatting error:', error);
    // Fallback formatting
    return `${currency} ${amount.toFixed(2)}`;
  }
};

/**
 * Format large numbers with K, M, B suffixes
 */
export const formatCompactNumber = (
  num: number,
  decimals: number = 1
): string => {
  if (num < 1000) {
    return num.toString();
  }

  const units = ['K', 'M', 'B', 'T'];
  const order = Math.floor(Math.log10(Math.abs(num)) / 3);
  const unitIndex = order - 1;
  const unit = units[unitIndex] || 'T+';
  const value = num / Math.pow(1000, order);

  return `${value.toFixed(decimals)}${unit}`;
};

/**
 * Format date to readable string
 */
export const formatDate = (
  date: Date | string,
  format: 'short' | 'medium' | 'long' | 'full' = 'medium',
  locale: string = 'en-US'
): string => {
  try {
    const dateObj = date instanceof Date ? date : new Date(date);

    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }

    const options: Intl.DateTimeFormatOptions = {
      short: { month: 'numeric', day: 'numeric', year: '2-digit' },
      medium: { month: 'short', day: 'numeric', year: 'numeric' },
      long: { month: 'long', day: 'numeric', year: 'numeric' },
      full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
    }[format];

    return new Intl.DateTimeFormat(locale, options).format(dateObj);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};

/**
 * Format date with time
 */
export const formatDateTime = (
  date: Date | string,
  locale: string = 'en-US',
  includeSeconds: boolean = false
): string => {
  try {
    const dateObj = date instanceof Date ? date : new Date(date);

    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }

    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      ...(includeSeconds && { second: '2-digit' }),
    };

    return new Intl.DateTimeFormat(locale, options).format(dateObj);
  } catch (error) {
    console.error('DateTime formatting error:', error);
    return 'Invalid Date';
  }
};

/**
 * Format time only
 */
export const formatTime = (
  date: Date | string,
  locale: string = 'en-US',
  use24Hour: boolean = false
): string => {
  try {
    const dateObj = date instanceof Date ? date : new Date(date);

    if (isNaN(dateObj.getTime())) {
      return 'Invalid Time';
    }

    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: !use24Hour,
    };

    return new Intl.DateTimeFormat(locale, options).format(dateObj);
  } catch (error) {
    console.error('Time formatting error:', error);
    return 'Invalid Time';
  }
};

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 */
export const formatRelativeTime = (
  date: Date | string,
  locale: string = 'en-US'
): string => {
  try {
    const dateObj = date instanceof Date ? date : new Date(date);

    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }

    const now = new Date();
    const diffMs = dateObj.getTime() - now.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    // Just now
    if (Math.abs(diffSeconds) < 60) {
      return 'just now';
    }

    // Minutes
    if (Math.abs(diffMinutes) < 60) {
      return diffMinutes > 0
        ? `in ${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`
        : `${Math.abs(diffMinutes)} minute${diffMinutes !== -1 ? 's' : ''} ago`;
    }

    // Hours
    if (Math.abs(diffHours) < 24) {
      return diffHours > 0
        ? `in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`
        : `${Math.abs(diffHours)} hour${diffHours !== -1 ? 's' : ''} ago`;
    }

    // Days
    if (Math.abs(diffDays) < 7) {
      return diffDays > 0
        ? `in ${diffDays} day${diffDays !== 1 ? 's' : ''}`
        : `${Math.abs(diffDays)} day${diffDays !== -1 ? 's' : ''} ago`;
    }

    // For dates more than a week away, use formatted date
    return formatDate(dateObj, 'medium', locale);
  } catch (error) {
    console.error('Relative time formatting error:', error);
    return 'Invalid Date';
  }
};

/**
 * Format percentage
 */
export const formatPercentage = (
  value: number,
  decimals: number = 0,
  includeSign: boolean = true
): string => {
  const formatted = value.toFixed(decimals);
  return includeSign ? `${formatted}%` : formatted;
};

/**
 * Format phone number
 */
export const formatPhoneNumber = (
  phone: string,
  format: 'US' | 'INTL' = 'US'
): string => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  if (format === 'US' && digits.length === 10) {
    // Format as (XXX) XXX-XXXX
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  if (format === 'INTL' && digits.length > 10) {
    // Format as +X (XXX) XXX-XXXX
    const countryCode = digits.slice(0, digits.length - 10);
    const areaCode = digits.slice(-10, -7);
    const firstPart = digits.slice(-7, -4);
    const secondPart = digits.slice(-4);
    return `+${countryCode} (${areaCode}) ${firstPart}-${secondPart}`;
  }

  return phone;
};

/**
 * Format number with thousands separator
 */
export const formatNumber = (
  num: number,
  decimals: number = 0,
  locale: string = 'en-US'
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  } catch (error) {
    console.error('Number formatting error:', error);
    return num.toFixed(decimals);
  }
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (
  text: string,
  maxLength: number,
  ellipsis: string = '...'
): string => {
  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength - ellipsis.length) + ellipsis;
};

/**
 * Capitalize first letter
 */
export const capitalizeFirst = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Capitalize each word
 */
export const capitalizeWords = (text: string): string => {
  if (!text) return '';
  return text
    .split(' ')
    .map((word) => capitalizeFirst(word))
    .join(' ');
};

/**
 * Format card number (mask all but last 4 digits)
 */
export const formatCardNumber = (cardNumber: string): string => {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 4) return cardNumber;

  const lastFour = digits.slice(-4);
  const masked = '*'.repeat(digits.length - 4);

  return `${masked.match(/.{1,4}/g)?.join(' ')} ${lastFour}`;
};

/**
 * Format duration in seconds to readable format
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
  }

  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }

  if (secs > 0 || parts.length === 0) {
    parts.push(`${secs}s`);
  }

  return parts.join(' ');
};

/**
 * Format month and year
 */
export const formatMonthYear = (
  date: Date | string,
  format: 'short' | 'long' = 'long',
  locale: string = 'en-US'
): string => {
  try {
    const dateObj = date instanceof Date ? date : new Date(date);

    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }

    const options: Intl.DateTimeFormatOptions = {
      month: format,
      year: 'numeric',
    };

    return new Intl.DateTimeFormat(locale, options).format(dateObj);
  } catch (error) {
    console.error('Month/Year formatting error:', error);
    return 'Invalid Date';
  }
};

/**
 * Format initials from name
 */
export const formatInitials = (name: string): string => {
  if (!name) return '';

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (
    parts[0].charAt(0).toUpperCase() + parts[parts.length - 1].charAt(0).toUpperCase()
  );
};

/**
 * Format transaction amount with sign
 */
export const formatTransactionAmount = (
  amount: number,
  type: 'income' | 'expense',
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  const formattedAmount = formatCurrency(Math.abs(amount), currency, locale);
  const sign = type === 'income' ? '+' : '-';
  return `${sign}${formattedAmount}`;
};

/**
 * Parse currency string to number
 */
export const parseCurrency = (currencyString: string): number => {
  // Remove currency symbols, commas, and spaces
  const cleaned = currencyString.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Format account number (mask all but last 4 digits)
 */
export const formatAccountNumber = (accountNumber: string): string => {
  const digits = accountNumber.replace(/\D/g, '');
  if (digits.length < 4) return accountNumber;

  const lastFour = digits.slice(-4);
  return `****${lastFour}`;
};

/**
 * Format budget progress
 */
export const formatBudgetProgress = (spent: number, limit: number): string => {
  const percentage = (spent / limit) * 100;
  return `${formatPercentage(percentage, 0)} (${formatCurrency(spent)} of ${formatCurrency(limit)})`;
};

export default {
  formatCurrency,
  formatCompactNumber,
  formatDate,
  formatDateTime,
  formatTime,
  formatRelativeTime,
  formatPercentage,
  formatPhoneNumber,
  formatNumber,
  formatFileSize,
  truncateText,
  capitalizeFirst,
  capitalizeWords,
  formatCardNumber,
  formatDuration,
  formatMonthYear,
  formatInitials,
  formatTransactionAmount,
  parseCurrency,
  formatAccountNumber,
  formatBudgetProgress,
};
