/**
 * RegisterScreen.tsx
 * Registration form with email, password, confirmation, and terms acceptance
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
  Linking,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Surface,
  HelperText,
  Checkbox,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RegisterFormData, ValidationErrors } from '../../types/auth.types';
import {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateTerms,
} from '../../utils/validation';
import { colors } from '../../theme/colors';

interface RegisterScreenProps {
  navigation: any;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [generalError, setGeneralError] = useState<string>('');

  const handleInputChange = (field: keyof RegisterFormData, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
    // Clear general error
    if (generalError) {
      setGeneralError('');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Validate email
    const emailError = validateEmail(formData.email);
    if (emailError) {
      newErrors.email = emailError;
    }

    // Validate password
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    // Validate password match
    const confirmPasswordError = validatePasswordMatch(
      formData.password,
      formData.confirmPassword
    );
    if (confirmPasswordError) {
      newErrors.confirmPassword = confirmPasswordError;
    }

    // Validate terms acceptance
    const termsError = validateTerms(formData.acceptTerms);
    if (termsError) {
      newErrors.acceptTerms = termsError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setGeneralError('');

    try {
      // TODO: Implement actual registration API call
      // Example: await authService.register(formData.email, formData.password);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // For demo purposes, show error
      // In production, navigate to email verification or main app
      throw new Error('Registration error');

      // navigation.navigate('EmailVerification');
      // or navigation.navigate('MainApp');
    } catch (error: any) {
      // Security best practice: Use generic error message
      setGeneralError('This email is already registered. Please use a different email or login.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignup = (provider: 'google' | 'apple' | 'facebook') => {
    // TODO: Implement social signup
    console.log(`Social signup with ${provider}`);
  };

  const openTermsOfService = () => {
    // TODO: Navigate to Terms of Service screen or open web link
    Linking.openURL('https://moneyguard.app/terms');
  };

  const openPrivacyPolicy = () => {
    // TODO: Navigate to Privacy Policy screen or open web link
    Linking.openURL('https://moneyguard.app/privacy');
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

            <Text style={styles.logo}>🛡️</Text>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join MoneyGuard and take control of your finances</Text>
          </View>

          {/* Registration Form */}
          <Surface style={styles.formContainer} elevation={1}>
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
              />
              <HelperText type="error" visible={!!errors.email}>
                {errors.email}
              </HelperText>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <TextInput
                mode="outlined"
                label="Password"
                value={formData.password}
                onChangeText={(text) => handleInputChange('password', text)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password-new"
                error={!!errors.password}
                disabled={loading}
                left={<TextInput.Icon icon="lock-outline" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                outlineColor={colors.border}
                activeOutlineColor={colors.primary}
                style={styles.input}
              />
              <HelperText type="error" visible={!!errors.password}>
                {errors.password}
              </HelperText>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <TextInput
                mode="outlined"
                label="Confirm Password"
                value={formData.confirmPassword}
                onChangeText={(text) => handleInputChange('confirmPassword', text)}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoComplete="password-new"
                error={!!errors.confirmPassword}
                disabled={loading}
                left={<TextInput.Icon icon="lock-check-outline" />}
                right={
                  <TextInput.Icon
                    icon={showConfirmPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                }
                outlineColor={colors.border}
                activeOutlineColor={colors.primary}
                style={styles.input}
              />
              <HelperText type="error" visible={!!errors.confirmPassword}>
                {errors.confirmPassword}
              </HelperText>
            </View>

            {/* Password Requirements */}
            <Surface style={styles.passwordRequirements} elevation={0}>
              <Text style={styles.requirementsTitle}>Password must contain:</Text>
              <Text style={styles.requirementItem}>• At least 8 characters</Text>
              <Text style={styles.requirementItem}>• One uppercase letter (A-Z)</Text>
              <Text style={styles.requirementItem}>• One lowercase letter (a-z)</Text>
              <Text style={styles.requirementItem}>• One number (0-9)</Text>
            </Surface>

            {/* Terms and Conditions Checkbox */}
            <View style={styles.checkboxContainer}>
              <Checkbox
                status={formData.acceptTerms ? 'checked' : 'unchecked'}
                onPress={() => handleInputChange('acceptTerms', !formData.acceptTerms)}
                color={colors.primary}
                disabled={loading}
              />
              <View style={styles.checkboxTextContainer}>
                <Text style={styles.checkboxText}>
                  I agree to the{' '}
                  <Text style={styles.link} onPress={openTermsOfService}>
                    Terms of Service
                  </Text>
                  {' '}and{' '}
                  <Text style={styles.link} onPress={openPrivacyPolicy}>
                    Privacy Policy
                  </Text>
                </Text>
              </View>
            </View>
            <HelperText type="error" visible={!!errors.acceptTerms} style={styles.termsError}>
              {errors.acceptTerms}
            </HelperText>

            {/* Register Button */}
            <Button
              mode="contained"
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
              buttonColor={colors.primary}
              style={styles.registerButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <Divider style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <Divider style={styles.divider} />
            </View>

            {/* Social Signup Buttons */}
            <View style={styles.socialButtonsContainer}>
              <Button
                mode="outlined"
                onPress={() => handleSocialSignup('google')}
                disabled={loading}
                icon="google"
                style={styles.socialButton}
                textColor={colors.textPrimary}
              >
                Google
              </Button>

              {Platform.OS === 'ios' && (
                <Button
                  mode="outlined"
                  onPress={() => handleSocialSignup('apple')}
                  disabled={loading}
                  icon="apple"
                  style={styles.socialButton}
                  textColor={colors.textPrimary}
                >
                  Apple
                </Button>
              )}

              <Button
                mode="outlined"
                onPress={() => handleSocialSignup('facebook')}
                disabled={loading}
                icon="facebook"
                style={styles.socialButton}
                textColor={colors.textPrimary}
              >
                Facebook
              </Button>
            </View>
          </Surface>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              disabled={loading}
            >
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
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
  inputContainer: {
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.white,
  },
  passwordRequirements: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  requirementsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  requirementItem: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  checkboxTextContainer: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 8,
  },
  checkboxText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  link: {
    color: colors.primary,
    fontWeight: '600',
  },
  termsError: {
    marginTop: -4,
    marginBottom: 8,
  },
  registerButton: {
    borderRadius: 8,
    marginBottom: 24,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    color: colors.textSecondary,
    fontSize: 14,
  },
  socialButtonsContainer: {
    gap: 12,
  },
  socialButton: {
    borderRadius: 8,
    borderColor: colors.border,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RegisterScreen;
