# Mobile App Dependencies

This document lists all required dependencies for the MoneyGuard mobile app.

## Core Dependencies

### React Native & Expo
```bash
# If using Expo
npx create-expo-app@latest moneyguard

# Or with React Native CLI
npx react-native init MoneyGuard --template react-native-template-typescript
```

### Required Packages

```bash
# Navigation
npm install @react-navigation/native
npm install @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context

# UI Components
npm install react-native-paper
npm install react-native-vector-icons

# For Expo:
npx expo install react-native-screens react-native-safe-area-context

# For React Native CLI, additional setup required:
# See: https://reactnavigation.org/docs/getting-started
```

## Package.json

Add these to your `package.json`:

```json
{
  "name": "moneyguard-mobile",
  "version": "1.0.0",
  "description": "MoneyGuard - Your Personal Finance Guardian",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "lint": "eslint . --ext .ts,.tsx",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-native": "^0.73.0",
    "react-native-paper": "^5.11.0",
    "react-native-safe-area-context": "^4.8.0",
    "react-native-screens": "^3.29.0",
    "react-native-vector-icons": "^10.0.3",
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/native-stack": "^6.9.17"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-native": "^0.73.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "typescript": "^5.0.0"
  }
}
```

## Optional Dependencies

### Social Authentication

```bash
# Google Sign-In
npm install @react-native-google-signin/google-signin

# Apple Authentication (iOS only)
npm install @invertase/react-native-apple-authentication

# Facebook Login
npm install react-native-fbsdk-next
```

### AdMob (Monetization)

```bash
npm install react-native-google-mobile-ads
```

### HTTP Client

```bash
# For API calls
npm install axios

# Or
npm install @tanstack/react-query axios
```

### State Management (Optional)

```bash
# Redux Toolkit
npm install @reduxjs/toolkit react-redux

# Or Zustand (lighter alternative)
npm install zustand

# Or MobX
npm install mobx mobx-react-lite
```

### Secure Storage

```bash
# For storing auth tokens securely
npm install react-native-encrypted-storage

# Or for Expo
npx expo install expo-secure-store
```

### Form Management (Optional)

```bash
# React Hook Form (lightweight)
npm install react-hook-form

# Or Formik
npm install formik
```

## TypeScript Configuration

Create or update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "commonjs",
    "lib": ["es2017"],
    "allowJs": true,
    "jsx": "react-native",
    "strict": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@screens/*": ["src/screens/*"],
      "@navigation/*": ["src/navigation/*"],
      "@theme/*": ["src/theme/*"],
      "@types/*": ["src/types/*"],
      "@utils/*": ["src/utils/*"],
      "@services/*": ["src/services/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "babel.config.js", "metro.config.js"]
}
```

## Installation Steps

### 1. Create New Project (if starting from scratch)

```bash
# With Expo (Recommended for beginners)
npx create-expo-app@latest moneyguard --template blank-typescript

# Or with React Native CLI
npx react-native init MoneyGuard --template react-native-template-typescript
```

### 2. Install Core Dependencies

```bash
cd moneyguard

# Install navigation
npm install @react-navigation/native @react-navigation/native-stack

# Install supporting libraries
npm install react-native-screens react-native-safe-area-context

# Install UI library
npm install react-native-paper react-native-vector-icons

# For Expo users, also run:
npx expo install react-native-screens react-native-safe-area-context
```

### 3. Configure React Native Paper

Add Material Icons to your project:

**For Expo:**
```bash
npx expo install @expo/vector-icons
```

**For React Native CLI:**
Follow instructions at: https://github.com/oblador/react-native-vector-icons

### 4. iOS Setup (React Native CLI only)

```bash
cd ios
pod install
cd ..
```

### 5. Run the App

```bash
# For Expo
npm start

# For React Native CLI - Android
npm run android

# For React Native CLI - iOS
npm run ios
```

## Environment Variables

Create `.env` file:

```env
# API Configuration
API_URL=https://api.moneyguard.app
API_TIMEOUT=10000

# AdMob (get from AdMob console)
ADMOB_APP_ID_ANDROID=ca-app-pub-xxxxx~xxxxx
ADMOB_APP_ID_IOS=ca-app-pub-xxxxx~xxxxx
ADMOB_BANNER_UNIT_ID_ANDROID=ca-app-pub-xxxxx/xxxxx
ADMOB_BANNER_UNIT_ID_IOS=ca-app-pub-xxxxx/xxxxx

# Social Auth (get from respective developer consoles)
GOOGLE_WEB_CLIENT_ID=xxxxx.apps.googleusercontent.com
FACEBOOK_APP_ID=xxxxx
```

## Troubleshooting

### Common Issues

1. **Metro bundler issues**
   ```bash
   npm start -- --reset-cache
   ```

2. **iOS build issues**
   ```bash
   cd ios
   pod deintegrate
   pod install
   cd ..
   ```

3. **Android build issues**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```

4. **Vector icons not showing**
   - Ensure you've linked the icons properly
   - For React Native CLI: `npx react-native link react-native-vector-icons`
   - For Expo: Icons should work out of the box

### Platform-Specific Setup

**Android:**
- Minimum SDK: 21 (Android 5.0)
- Target SDK: 33 (Android 13)

**iOS:**
- Minimum iOS: 13.0
- Requires Xcode 14+

## Verification

After installation, verify everything works:

```bash
# Check TypeScript
npm run type-check

# Check linting
npm run lint

# Run app
npm start
```

## Next Steps

1. Copy the auth screens to `mobile/src/screens/auth/`
2. Copy the navigation setup to `mobile/src/navigation/`
3. Copy the theme files to `mobile/src/theme/`
4. Copy the utils to `mobile/src/utils/`
5. Update your `App.tsx` with the navigation provider
6. Test each screen individually
7. Connect to your backend API

## Resources

- [React Navigation Docs](https://reactnavigation.org/)
- [React Native Paper Docs](https://callstack.github.io/react-native-paper/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
