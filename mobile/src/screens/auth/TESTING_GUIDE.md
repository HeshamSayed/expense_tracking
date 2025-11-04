# Authentication Screens Testing Guide

Complete testing guide for all authentication screens in the MoneyGuard mobile app.

## Test Environment Setup

### Prerequisites
```bash
# Ensure app is running
npm start

# For testing on device/simulator
npm run android  # or npm run ios
```

### Test Data
```typescript
// Valid test credentials
const validEmail = "test@moneyguard.app";
const validPassword = "Test1234";

// Invalid test cases
const invalidEmail = "notanemail";
const weakPassword = "123";
const noUppercase = "test1234";
const noNumber = "TestPassword";
```

---

## 1. OnboardingScreen Tests

### Visual Tests
- [ ] **T1.1**: All 4 slides are visible and correctly formatted
- [ ] **T1.2**: Emojis display correctly (💰, 📊, 📈, 🔒)
- [ ] **T1.3**: Text is readable and properly aligned
- [ ] **T1.4**: Skip button is visible in top-right corner
- [ ] **T1.5**: Pagination dots display correctly
- [ ] **T1.6**: Primary button text changes on last slide

### Interaction Tests
- [ ] **T1.7**: Horizontal scrolling works smoothly
  - Swipe left to go to next slide
  - Swipe right to go back

- [ ] **T1.8**: Pagination dots update on scroll
  - Active dot is highlighted
  - Width changes for active dot

- [ ] **T1.9**: "Next" button navigates to next slide
  - Button works on slides 1-3
  - Button shows "Next" text

- [ ] **T1.10**: "Get Started" button on last slide
  - Appears only on slide 4
  - Navigates to RegisterScreen

- [ ] **T1.11**: "Skip" button navigation
  - Always navigates to LoginScreen
  - Works from any slide

- [ ] **T1.12**: "I Already Have an Account" button
  - Appears on last slide
  - Navigates to LoginScreen

### Edge Cases
- [ ] **T1.13**: Rapid slide scrolling doesn't break pagination
- [ ] **T1.14**: Device rotation maintains current slide
- [ ] **T1.15**: Back button (Android) doesn't crash app

---

## 2. LoginScreen Tests

### Visual Tests
- [ ] **T2.1**: Logo/shield emoji displays at top
- [ ] **T2.2**: "Welcome Back!" title is visible
- [ ] **T2.3**: Email input has email icon
- [ ] **T2.4**: Password input has lock icon
- [ ] **T2.5**: Social login buttons display correctly
- [ ] **T2.6**: Apple button only shows on iOS

### Email Validation Tests
- [ ] **T2.7**: Empty email shows error "Email is required"
- [ ] **T2.8**: Invalid email format shows error
  - Test: "notanemail"
  - Test: "test@"
  - Test: "@domain.com"
  - Test: "test @domain.com"

- [ ] **T2.9**: Valid email clears error
  - Test: "test@example.com"
  - Test: "user+tag@domain.co.uk"

### Password Validation Tests
- [ ] **T2.10**: Empty password shows "Password is required"
- [ ] **T2.11**: Password visibility toggle works
  - Default: hidden (dots/asterisks)
  - Click eye icon: shows password
  - Click again: hides password

### Form Behavior Tests
- [ ] **T2.12**: Error clears when user starts typing
- [ ] **T2.13**: Multiple errors can display simultaneously
- [ ] **T2.14**: Form submission disabled during loading
- [ ] **T2.15**: Loading spinner shows during submission
- [ ] **T2.16**: Button text changes to "Logging in..." during load

### Navigation Tests
- [ ] **T2.17**: "Forgot Password?" link navigates to ForgotPasswordScreen
- [ ] **T2.18**: "Sign Up" link navigates to RegisterScreen
- [ ] **T2.19**: Back button returns to OnboardingScreen

### API Integration Tests
- [ ] **T2.20**: Successful login navigates to main app
- [ ] **T2.21**: Invalid credentials show generic error
  - Error: "Invalid credentials. Please check your email and password."

- [ ] **T2.22**: Network error shows appropriate message
- [ ] **T2.23**: Rate limiting shows error message

### Social Login Tests
- [ ] **T2.24**: Google button is clickable
- [ ] **T2.25**: Apple button is clickable (iOS only)
- [ ] **T2.26**: Facebook button is clickable
- [ ] **T2.27**: Social buttons disabled during loading

### Accessibility Tests
- [ ] **T2.28**: Keyboard type is "email-address" for email
- [ ] **T2.29**: Email field disables autocapitalize
- [ ] **T2.30**: Password field uses secure entry
- [ ] **T2.31**: Tab order is logical

---

## 3. RegisterScreen Tests

### Visual Tests
- [ ] **T3.1**: Back button visible at top
- [ ] **T3.2**: "Create Account" title displays
- [ ] **T3.3**: All input fields render correctly
- [ ] **T3.4**: Password requirements box displays
- [ ] **T3.5**: Terms checkbox and text display
- [ ] **T3.6**: Terms and Privacy links are styled

### Email Validation Tests
- [ ] **T3.7**: Empty email shows error
- [ ] **T3.8**: Invalid email format shows error
- [ ] **T3.9**: Valid email clears error
- [ ] **T3.10**: Duplicate email error handled (if API supports)

### Password Validation Tests
- [ ] **T3.11**: Empty password shows error
- [ ] **T3.12**: Password < 8 characters shows error
  - Test: "Test123"
  - Error: "Password must be at least 8 characters long"

- [ ] **T3.13**: No uppercase letter shows error
  - Test: "test1234"
  - Error: "Password must contain at least one uppercase letter"

- [ ] **T3.14**: No lowercase letter shows error
  - Test: "TEST1234"
  - Error: "Password must contain at least one lowercase letter"

- [ ] **T3.15**: No number shows error
  - Test: "TestPassword"
  - Error: "Password must contain at least one number"

- [ ] **T3.16**: Valid password clears errors
  - Test: "Test1234"

### Password Confirmation Tests
- [ ] **T3.17**: Empty confirmation shows error
- [ ] **T3.18**: Non-matching passwords show error
  - Password: "Test1234"
  - Confirm: "Test5678"
  - Error: "Passwords do not match"

- [ ] **T3.19**: Matching passwords clear error
- [ ] **T3.20**: Both password visibility toggles work independently

### Terms Acceptance Tests
- [ ] **T3.21**: Unchecked terms shows error on submit
  - Error: "You must accept the terms and conditions"

- [ ] **T3.22**: Checked terms clears error
- [ ] **T3.23**: Terms of Service link opens
- [ ] **T3.24**: Privacy Policy link opens

### Form Behavior Tests
- [ ] **T3.25**: All errors display simultaneously
- [ ] **T3.26**: Errors clear individually as user fixes them
- [ ] **T3.27**: Form disabled during loading
- [ ] **T3.28**: Loading spinner shows
- [ ] **T3.29**: Button text changes to "Creating Account..."

### Password Requirements Display Tests
- [ ] **T3.30**: Requirements box always visible
- [ ] **T3.31**: All 4 requirements listed
- [ ] **T3.32**: Text is readable and properly formatted

### Navigation Tests
- [ ] **T3.33**: Back button returns to previous screen
- [ ] **T3.34**: "Login" link navigates to LoginScreen
- [ ] **T3.35**: Successful registration navigates appropriately

### API Integration Tests
- [ ] **T3.36**: Successful registration creates account
- [ ] **T3.37**: Duplicate email handled gracefully
- [ ] **T3.38**: Network errors show appropriate message

### Social Signup Tests
- [ ] **T3.39**: Google signup button works
- [ ] **T3.40**: Apple signup button works (iOS)
- [ ] **T3.41**: Facebook signup button works
- [ ] **T3.42**: Terms must be accepted for social signup

---

## 4. ForgotPasswordScreen Tests

### Visual Tests - Initial State
- [ ] **T4.1**: Back button visible
- [ ] **T4.2**: Lock emoji displays
- [ ] **T4.3**: "Forgot Password?" title displays
- [ ] **T4.4**: Descriptive subtitle shows
- [ ] **T4.5**: Email input field visible
- [ ] **T4.6**: Info box with instructions displays
- [ ] **T4.7**: Security note at bottom shows

### Email Validation Tests
- [ ] **T4.8**: Empty email shows error
- [ ] **T4.9**: Invalid email format shows error
- [ ] **T4.10**: Valid email clears error

### Form Submission Tests
- [ ] **T4.11**: Valid email can be submitted
- [ ] **T4.12**: Loading state shows during submission
- [ ] **T4.13**: Button text changes to "Sending Email..."
- [ ] **T4.14**: Form disabled during loading

### Success State Tests
- [ ] **T4.15**: Success state displays after submission
- [ ] **T4.16**: Success icon (✓) displays
- [ ] **T4.17**: "Email Sent!" title shows
- [ ] **T4.18**: Success message displays
- [ ] **T4.19**: Instructions (4 steps) display
- [ ] **T4.20**: "Didn't receive email?" text shows
- [ ] **T4.21**: Resend button visible
- [ ] **T4.22**: "Back to Login" button visible

### Security Tests
- [ ] **T4.23**: Same message for existing/non-existing emails
  - Test with valid email: shows success
  - Test with invalid email: shows same success
  - Prevents email enumeration

- [ ] **T4.24**: Generic success message used
  - "If an account exists with this email, you will receive password reset instructions."

### Resend Email Tests
- [ ] **T4.25**: Resend button works
- [ ] **T4.26**: Loading state during resend
- [ ] **T4.27**: Can resend multiple times

### Navigation Tests
- [ ] **T4.28**: Back button returns to LoginScreen
- [ ] **T4.29**: "Back to Login" button works from success state
- [ ] **T4.30**: "Remember your password?" link works

### Edge Cases
- [ ] **T4.31**: Network error handled gracefully
- [ ] **T4.32**: Timeout error shows message
- [ ] **T4.33**: Device back button works correctly

---

## 5. Cross-Screen Tests

### Navigation Flow Tests
- [ ] **T5.1**: Onboarding → Login → Register → Login works
- [ ] **T5.2**: Onboarding → Register → Login works
- [ ] **T5.3**: Login → Forgot Password → Login works
- [ ] **T5.4**: All back buttons work correctly

### Theme Consistency Tests
- [ ] **T5.5**: Primary color consistent across screens
- [ ] **T5.6**: Font sizes consistent
- [ ] **T5.7**: Button styles consistent
- [ ] **T5.8**: Input field styles consistent
- [ ] **T5.9**: Error message styles consistent

### Keyboard Behavior Tests
- [ ] **T5.10**: Keyboard doesn't cover input fields
- [ ] **T5.11**: "Next" key moves to next field
- [ ] **T5.12**: "Done" key submits form (where appropriate)
- [ ] **T5.13**: Keyboard dismisses on outside tap

### Loading State Tests
- [ ] **T5.14**: Loading spinner consistent across screens
- [ ] **T5.15**: Button disabled during loading
- [ ] **T5.16**: Form inputs disabled during loading
- [ ] **T5.17**: Navigation disabled during loading

### Error Handling Tests
- [ ] **T5.18**: Network errors show user-friendly messages
- [ ] **T5.19**: Timeout errors handled
- [ ] **T5.20**: Server errors (500) show generic message
- [ ] **T5.21**: Errors don't crash the app

---

## 6. Platform-Specific Tests

### Android Tests
- [ ] **T6.1**: Hardware back button works on all screens
- [ ] **T6.2**: Status bar color correct
- [ ] **T6.3**: Keyboard behavior correct
- [ ] **T6.4**: Material icons display correctly
- [ ] **T6.5**: Ripple effects on buttons

### iOS Tests
- [ ] **T6.6**: Safe area respected (notch/home indicator)
- [ ] **T6.7**: Status bar style correct
- [ ] **T6.8**: Keyboard behavior correct
- [ ] **T6.9**: Apple Sign-In button displays
- [ ] **T6.10**: Swipe back gesture works

---

## 7. Performance Tests

- [ ] **T7.1**: Screens load quickly (< 2 seconds)
- [ ] **T7.2**: Smooth animations
- [ ] **T7.3**: No lag during typing
- [ ] **T7.4**: No memory leaks
- [ ] **T7.5**: Smooth scrolling on Onboarding

---

## 8. Accessibility Tests

- [ ] **T8.1**: Screen reader support
- [ ] **T8.2**: Sufficient color contrast
- [ ] **T8.3**: Touch targets minimum 44x44
- [ ] **T8.4**: Focus order is logical
- [ ] **T8.5**: Error messages announced

---

## Test Scenarios

### Scenario 1: New User Registration
1. Open app → See Onboarding
2. Tap "Get Started"
3. Fill registration form
4. Accept terms
5. Submit
6. Verify account created

### Scenario 2: Existing User Login
1. Open app → See Onboarding
2. Tap "Skip" or "I Already Have an Account"
3. Enter credentials
4. Tap "Login"
5. Verify logged in

### Scenario 3: Forgot Password Flow
1. On LoginScreen
2. Tap "Forgot Password?"
3. Enter email
4. Tap "Send Reset Link"
5. Verify success message
6. Tap "Resend Email"
7. Verify can resend
8. Tap "Back to Login"
9. Verify back on LoginScreen

### Scenario 4: Form Validation
1. Try to submit empty forms
2. Verify all errors show
3. Fill one field
4. Verify that error clears
5. Fill all fields correctly
6. Verify form submits

---

## Automated Testing Examples

### Jest Test Example
```typescript
// __tests__/LoginScreen.test.tsx
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { LoginScreen } from '../src/screens/auth/LoginScreen';

describe('LoginScreen', () => {
  it('should show error for invalid email', () => {
    const { getByLabelText, getByText } = render(<LoginScreen />);

    const emailInput = getByLabelText('Email');
    const loginButton = getByText('Login');

    fireEvent.changeText(emailInput, 'invalid');
    fireEvent.press(loginButton);

    expect(getByText('Please enter a valid email address')).toBeTruthy();
  });
});
```

---

## Bug Report Template

When you find a bug, report it with:

```markdown
**Screen**: LoginScreen
**Test Case**: T2.8
**Expected**: Invalid email shows error
**Actual**: No error shown
**Steps**:
1. Navigate to LoginScreen
2. Enter "notanemail" in email field
3. Tap Login button
**Screenshots**: [attach]
**Device**: iPhone 14 Pro / iOS 16.4
```

---

## Success Criteria

All tests should pass with:
- ✅ 0 crashes
- ✅ 0 navigation errors
- ✅ All validations working
- ✅ All loading states working
- ✅ All error messages displaying
- ✅ Consistent design across screens
- ✅ Smooth user experience

---

## Testing Tools

### Recommended
- React Native Testing Library
- Jest
- Detox (E2E testing)
- React Native Debugger
- Flipper

### Commands
```bash
# Run unit tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test
npm test LoginScreen

# Run E2E tests
npm run test:e2e
```

---

**Last Updated**: 2025-11-04
**Version**: 1.0.0
