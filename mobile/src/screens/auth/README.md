# Authentication Screens

This directory contains all authentication-related screens for the MoneyGuard mobile app.

## Screens

### 1. OnboardingScreen.tsx
- Welcome screen with 4 feature highlight slides
- Smooth horizontal scrolling with pagination dots
- Navigation to signup/login
- Skip functionality
- Brand-aligned design with MoneyGuard colors

**Features:**
- 💰 Track Every Expense
- 📊 Smart Budgeting
- 📈 Insightful Reports
- 🔒 Secure & Private

### 2. LoginScreen.tsx
- Email and password login form
- Password visibility toggle
- "Forgot Password" link
- Social login placeholders (Google, Apple, Facebook)
- Form validation with real-time error messages
- Loading states during authentication
- Generic error messages (security best practice)

### 3. RegisterScreen.tsx
- Email and password registration
- Password confirmation field
- Password requirements display
- Terms and conditions checkbox with links
- Form validation with comprehensive rules
- Social signup placeholders
- Privacy policy and terms links

### 4. ForgotPasswordScreen.tsx
- Email input for password reset
- Two-state UI (input form and success confirmation)
- Resend email functionality
- Security-focused messaging (no email enumeration)
- Instructions for next steps
- Back to login navigation

## Dependencies

### Required
```bash
npm install react-native-paper
npm install react-native-safe-area-context
npm install @react-navigation/native
npm install @react-navigation/native-stack
```

### Optional (for full functionality)
```bash
# For AdMob integration
npm install react-native-google-mobile-ads

# For social authentication
npm install @react-native-google-signin/google-signin
npm install @invertase/react-native-apple-authentication
npm install react-native-fbsdk-next
```

## Setup Instructions

### 1. Install Dependencies
```bash
cd mobile
npm install
```

### 2. Configure Navigation
Create a navigation file (e.g., `src/navigation/AuthNavigator.tsx`):

```typescript
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  OnboardingScreen,
  LoginScreen,
  RegisterScreen,
  ForgotPasswordScreen,
} from '../screens/auth';

const Stack = createNativeStackNavigator();

export const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};
```

### 3. Configure React Native Paper Theme
In your `App.tsx`:

```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { colors } from './src/theme/colors';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    error: colors.error,
    background: colors.background,
  },
};

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <AuthNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}
```

## Form Validation

All screens use validation utilities from `src/utils/validation.ts`:

- **Email Validation**: RFC-compliant email format
- **Password Validation**:
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
- **Password Match**: Confirms passwords match
- **Terms Validation**: Ensures terms are accepted

## Security Best Practices

These screens follow security best practices:

1. **Generic Error Messages**: No information disclosure
   - ❌ "User john@example.com already exists"
   - ✅ "This email is already registered"

2. **No Email Enumeration**: Forgot password always shows success
   - Even if email doesn't exist
   - Prevents attackers from discovering valid emails

3. **Password Requirements**: Enforced strong passwords
   - Minimum length
   - Character complexity

4. **Secure Input**:
   - Password fields use `secureTextEntry`
   - Email fields disable autocapitalization
   - Proper keyboard types

## Styling

All screens follow the MoneyGuard brand identity:

- **Primary Color**: #2E7D32 (Forest Green)
- **Secondary Color**: #1565C0 (Deep Blue)
- **Accent Color**: #FF6F00 (Amber Orange)
- **Error Color**: #C62828 (Deep Red)
- **Success Color**: #388E3C (Medium Green)

**Design System**:
- 8dp base spacing unit
- 8dp border radius for buttons/inputs
- 16dp border radius for cards
- Material Design 3 principles

## API Integration

To connect these screens to your backend:

1. Create an auth service (`src/services/authService.ts`)
2. Implement API calls for:
   - `login(email, password)`
   - `register(email, password)`
   - `requestPasswordReset(email)`
   - `loginWithGoogle()`
   - `loginWithApple()`
   - `loginWithFacebook()`

3. Update the TODO comments in each screen file

Example auth service:

```typescript
// src/services/authService.ts
import axios from 'axios';

const API_URL = 'https://api.moneyguard.app';

export const authService = {
  async login(email: string, password: string) {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });
    return response.data;
  },

  async register(email: string, password: string) {
    const response = await axios.post(`${API_URL}/auth/register`, {
      email,
      password,
    });
    return response.data;
  },

  async requestPasswordReset(email: string) {
    const response = await axios.post(`${API_URL}/auth/forgot-password`, {
      email,
    });
    return response.data;
  },
};
```

## AdMob Integration

The `AdMobBanner` component is included but requires configuration:

1. **Get AdMob Account**:
   - Sign up at https://admob.google.com
   - Create an app
   - Generate ad unit IDs

2. **Configure Android**:
   ```xml
   <!-- android/app/src/main/AndroidManifest.xml -->
   <meta-data
     android:name="com.google.android.gms.ads.APPLICATION_ID"
     android:value="ca-app-pub-xxxxx~xxxxx"/>
   ```

3. **Configure iOS**:
   ```xml
   <!-- ios/YourApp/Info.plist -->
   <key>GADApplicationIdentifier</key>
   <string>ca-app-pub-xxxxx~xxxxx</string>
   ```

4. **Update AdMobBanner.tsx** with your ad unit IDs

## Testing

For development, all screens include:
- Loading state simulation
- Error handling examples
- Form validation testing

Test accounts (for development only):
- Email: test@moneyguard.app
- Password: Test1234

## Accessibility

All screens support:
- Proper keyboard navigation
- Auto-complete attributes
- ARIA labels (via React Native Paper)
- Sufficient color contrast ratios
- Touch target sizes (minimum 44x44)

## Platform-Specific Features

- **iOS Only**: Apple Sign-In button
- **Android**: Proper back button handling
- **Both**: Platform-specific status bars

## Future Enhancements

- [ ] Biometric authentication (Face ID, Touch ID, Fingerprint)
- [ ] Multi-factor authentication (2FA)
- [ ] Email verification screen
- [ ] Social account linking
- [ ] Remember me functionality
- [ ] Session management
- [ ] Logout across devices

## Support

For questions or issues:
- Check the validation utilities in `src/utils/validation.ts`
- Review the theme configuration in `src/theme/colors.ts`
- Ensure all dependencies are properly installed

## License

Part of the MoneyGuard application - See root LICENSE file
