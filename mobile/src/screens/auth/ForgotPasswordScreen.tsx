/**
 * ForgotPasswordScreen.tsx
 * Password reset request form
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Surface,
  HelperText,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ForgotPasswordFormData, ValidationErrors } from '../../types/auth.types';
import { validateEmail } from '../../utils/validation';
import { colors } from '../../theme/colors';

interface ForgotPasswordScreenProps {
  navigation: any;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: '',
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [emailSent, setEmailSent] = useState(false);

  const handleInputChange = (field: keyof ForgotPasswordFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
    // Clear messages
    if (generalError) {
      setGeneralError('');
    }
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Validate email
    const emailError = validateEmail(formData.email);
    if (emailError) {
      newErrors.email = emailError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setGeneralError('');
    setSuccessMessage('');

    try {
      // TODO: Implement actual password reset API call
      // Example: await authService.requestPasswordReset(formData.email);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Security best practice: Always show success message even if email doesn't exist
      // This prevents email enumeration attacks
      setEmailSent(true);
      setSuccessMessage(
        'If an account exists with this email, you will receive password reset instructions shortly.'
      );
    } catch (error: any) {
      // Generic error message for security
      setGeneralError('Unable to process your request. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    await handleResetPassword();
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              disabled={loading}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>

            <Text style={styles.logo}>🔐</Text>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              {emailSent
                ? 'Check your email for reset instructions'
                : "No worries! Enter your email and we'll send you reset instructions"}
            </Text>
          </View>

          {/* Form Container */}
          <Surface style={styles.formContainer} elevation={1}>
            {emailSent ? (
              // Success State
              <>
                <Surface style={styles.successContainer} elevation={0}>
                  <Text style={styles.successIcon}>✓</Text>
                  <Text style={styles.successTitle}>Email Sent!</Text>
                  <Text style={styles.successText}>{successMessage}</Text>
                </Surface>

                <View style={styles.instructionsContainer}>
                  <Text style={styles.instructionsTitle}>What to do next:</Text>
                  <Text style={styles.instructionItem}>1. Check your email inbox</Text>
                  <Text style={styles.instructionItem}>
                    2. Look for an email from MoneyGuard
                  </Text>
                  <Text style={styles.instructionItem}>
                    3. Click the reset link in the email
                  </Text>
                  <Text style={styles.instructionItem}>
                    4. Create a new password
                  </Text>
                </View>

                <View style={styles.emailNotReceivedContainer}>
                  <Text style={styles.emailNotReceivedText}>
                    Didn't receive the email?
                  </Text>
                  <Text style={styles.emailNotReceivedSubtext}>
                    Check your spam folder or wait a few minutes
                  </Text>
                </View>

                <Button
                  mode="outlined"
                  onPress={handleResendEmail}
                  loading={loading}
                  disabled={loading}
                  style={styles.resendButton}
                  textColor={colors.primary}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                >
                  Resend Email
                </Button>

                <Button
                  mode="contained"
                  onPress={handleBackToLogin}
                  disabled={loading}
                  buttonColor={colors.primary}
                  style={styles.backToLoginButton}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                >
                  Back to Login
                </Button>
              </>
            ) : (
              // Initial State - Email Input
              <>
                {/* General Error */}
                {generalError ? (
                  <Surface style={styles.errorContainer} elevation={0}>
                    <Text style={styles.errorText}>{generalError}</Text>
                  </Surface>
                ) : null}

                {/* Email Input */}
                <View style={styles.inputContainer}>
                  <TextInput
                    mode="outlined"
                    label="Email"
                    value={formData.email}
                    onChangeText={(text) => handleInputChange('email', text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    error={!!errors.email}
                    disabled={loading}
                    left={<TextInput.Icon icon="email-outline" />}
                    outlineColor={colors.border}
                    activeOutlineColor={colors.primary}
                    style={styles.input}
                    placeholder="Enter your registered email"
                  />
                  <HelperText type="error" visible={!!errors.email}>
                    {errors.email}
                  </HelperText>
                </View>

                {/* Info Box */}
                <Surface style={styles.infoContainer} elevation={0}>
                  <Text style={styles.infoIcon}>ℹ️</Text>
                  <Text style={styles.infoText}>
                    We'll send you an email with instructions to reset your password. The link
                    will be valid for 1 hour.
                  </Text>
                </Surface>

                {/* Reset Password Button */}
                <Button
                  mode="contained"
                  onPress={handleResetPassword}
                  loading={loading}
                  disabled={loading}
                  buttonColor={colors.primary}
                  style={styles.resetButton}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                >
                  {loading ? 'Sending Email...' : 'Send Reset Link'}
                </Button>

                {/* Back to Login Link */}
                <View style={styles.loginLinkContainer}>
                  <Text style={styles.loginLinkText}>Remember your password? </Text>
                  <TouchableOpacity onPress={handleBackToLogin} disabled={loading}>
                    <Text style={styles.loginLink}>Login</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Surface>

          {/* Security Note */}
          <Surface style={styles.securityNote} elevation={0}>
            <Text style={styles.securityNoteIcon}>🔒</Text>
            <Text style={styles.securityNoteText}>
              For security reasons, we don't disclose whether an email exists in our system.
            </Text>
          </Surface>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 22,
  },
  formContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  errorContainer: {
    backgroundColor: colors.error + '15',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
  },
  successContainer: {
    backgroundColor: colors.success + '15',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  successIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.success,
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  instructionsContainer: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  instructionItem: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  emailNotReceivedContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  emailNotReceivedText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  emailNotReceivedSubtext: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: colors.white,
  },
  infoContainer: {
    backgroundColor: colors.secondary + '15',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  resetButton: {
    borderRadius: 8,
    marginBottom: 16,
  },
  resendButton: {
    borderRadius: 8,
    borderColor: colors.primary,
    marginBottom: 12,
  },
  backToLoginButton: {
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginLinkText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  securityNote: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityNoteIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  securityNoteText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});

export default ForgotPasswordScreen;
