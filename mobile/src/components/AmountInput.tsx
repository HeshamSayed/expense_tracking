import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput as RNTextInput } from 'react-native';
import { TextInput, Text, useTheme, HelperText } from 'react-native-paper';

interface AmountInputProps {
  value: string;
  onChangeValue: (value: string, numericValue: number) => void;
  currency?: string;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  maxAmount?: number;
  minAmount?: number;
  allowNegative?: boolean;
  showCurrencySymbol?: boolean;
  testID?: string;
}

export default function AmountInput({
  value,
  onChangeValue,
  currency = 'USD',
  label = 'Amount',
  placeholder = '0.00',
  error,
  disabled = false,
  autoFocus = false,
  maxAmount,
  minAmount = 0,
  allowNegative = false,
  showCurrencySymbol = true,
  testID = 'amount-input',
}: AmountInputProps) {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const getCurrencySymbol = (curr: string): string => {
    const symbols: { [key: string]: string } = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CNY: '¥',
      INR: '₹',
      AUD: 'A$',
      CAD: 'C$',
      CHF: 'CHF',
      BRL: 'R$',
      MXN: '$',
      ZAR: 'R',
    };
    return symbols[curr] || curr;
  };

  const formatAmount = (input: string): string => {
    // Remove all non-numeric characters except decimal point and minus sign
    let cleaned = input.replace(/[^0-9.-]/g, '');

    // Handle negative sign
    if (!allowNegative) {
      cleaned = cleaned.replace(/-/g, '');
    } else {
      // Ensure only one minus sign at the beginning
      const isNegative = cleaned.startsWith('-');
      cleaned = cleaned.replace(/-/g, '');
      if (isNegative) cleaned = '-' + cleaned;
    }

    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }

    // Limit to 2 decimal places
    if (parts.length === 2 && parts[1].length > 2) {
      cleaned = parts[0] + '.' + parts[1].substring(0, 2);
    }

    return cleaned;
  };

  const handleChangeText = (text: string) => {
    const formatted = formatAmount(text);
    setLocalValue(formatted);

    // Convert to number
    const numericValue = parseFloat(formatted) || 0;

    // Validate against min/max
    let validatedValue = numericValue;
    if (maxAmount !== undefined && numericValue > maxAmount) {
      validatedValue = maxAmount;
      setLocalValue(maxAmount.toString());
    }
    if (minAmount !== undefined && numericValue < minAmount) {
      validatedValue = minAmount;
    }

    onChangeValue(formatted, validatedValue);
  };

  const handleBlur = () => {
    setIsFocused(false);

    // Format the display value on blur
    if (localValue && localValue !== '-' && localValue !== '.') {
      const numericValue = parseFloat(localValue);
      if (!isNaN(numericValue)) {
        const formatted = numericValue.toFixed(2);
        setLocalValue(formatted);
        onChangeValue(formatted, numericValue);
      }
    } else if (localValue === '' || localValue === '-' || localValue === '.') {
      setLocalValue('');
      onChangeValue('', 0);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const getValidationError = (): string | undefined => {
    if (error) return error;

    const numericValue = parseFloat(localValue) || 0;

    if (maxAmount !== undefined && numericValue > maxAmount) {
      return `Maximum amount is ${getCurrencySymbol(currency)} ${maxAmount.toFixed(2)}`;
    }

    if (minAmount !== undefined && numericValue < minAmount) {
      return `Minimum amount is ${getCurrencySymbol(currency)} ${minAmount.toFixed(2)}`;
    }

    if (!allowNegative && numericValue < 0) {
      return 'Amount cannot be negative';
    }

    return undefined;
  };

  const validationError = getValidationError();
  const hasError = !!validationError;

  return (
    <View style={styles.container}>
      <TextInput
        label={label}
        value={localValue}
        onChangeText={handleChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        keyboardType="decimal-pad"
        placeholder={placeholder}
        mode="outlined"
        disabled={disabled}
        autoFocus={autoFocus}
        error={hasError}
        left={
          showCurrencySymbol ? (
            <TextInput.Affix
              text={getCurrencySymbol(currency)}
              textStyle={[
                styles.currencySymbol,
                {
                  color: isFocused
                    ? theme.colors.primary
                    : disabled
                    ? theme.colors.onSurfaceDisabled
                    : theme.colors.onSurface,
                },
              ]}
            />
          ) : undefined
        }
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          hasError && styles.inputError,
        ]}
        contentStyle={styles.inputContent}
        outlineStyle={[
          styles.outline,
          isFocused && { borderWidth: 2 },
          hasError && { borderColor: theme.colors.error },
        ]}
        testID={testID}
      />

      {/* Helper Text */}
      <HelperText type={hasError ? 'error' : 'info'} visible={!!validationError || isFocused}>
        {validationError ||
          (localValue && !hasError
            ? `${getCurrencySymbol(currency)} ${
                parseFloat(localValue).toFixed(2) || '0.00'
              }`
            : ' ')}
      </HelperText>

      {/* Additional Information */}
      {isFocused && !hasError && (maxAmount !== undefined || minAmount !== undefined) && (
        <View style={styles.infoContainer}>
          {minAmount !== undefined && (
            <Text
              variant="bodySmall"
              style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}
            >
              Min: {getCurrencySymbol(currency)} {minAmount.toFixed(2)}
            </Text>
          )}
          {maxAmount !== undefined && (
            <Text
              variant="bodySmall"
              style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}
            >
              Max: {getCurrencySymbol(currency)} {maxAmount.toFixed(2)}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  input: {
    fontSize: 18,
  },
  inputFocused: {},
  inputError: {},
  inputContent: {
    paddingHorizontal: 12,
  },
  outline: {
    borderRadius: 8,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingHorizontal: 12,
  },
  infoText: {
    fontSize: 11,
  },
});
