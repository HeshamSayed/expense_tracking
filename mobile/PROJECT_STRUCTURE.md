# MoneyGuard Mobile - Project Structure

## Overview
Complete React Native TypeScript mobile application for expense tracking with AdMob integration, secure storage, and modern UI components.

## Directory Structure

```
mobile/
├── Configuration Files
│   ├── .env.example                 # Environment variables template
│   ├── .eslintrc.js                 # ESLint configuration
│   ├── .gitignore                   # Git ignore rules
│   ├── .prettierrc                  # Prettier code formatting
│   ├── app.json                     # App configuration & metadata
│   ├── babel.config.js              # Babel transpiler config
│   ├── jest.config.js               # Jest testing configuration
│   ├── jest.setup.js                # Jest setup & mocks
│   ├── metro.config.js              # Metro bundler config
│   ├── package.json                 # Dependencies & scripts
│   └── tsconfig.json                # TypeScript configuration
│
├── Entry Points
│   ├── index.js                     # React Native entry point
│   └── App.tsx                      # Main app component
│
├── Android Configuration
│   └── android/
│       ├── build.gradle             # Project-level build config
│       ├── gradle.properties        # Gradle properties
│       ├── settings.gradle          # Module settings
│       └── app/
│           ├── build.gradle         # App-level build config (AdMob)
│           └── src/main/
│               ├── AndroidManifest.xml  # App manifest & permissions
│               └── res/
│                   ├── values/
│                   │   └── strings.xml  # App strings
│                   └── xml/
│                       └── file_paths.xml  # File provider paths
│
├── Source Code (src/)
│   ├── components/                  # Reusable UI components
│   │   ├── AccountCard.tsx
│   │   ├── AdBanner.tsx
│   │   ├── AdMobBanner.tsx
│   │   ├── AmountInput.tsx
│   │   ├── BudgetProgressCard.tsx
│   │   ├── CategoryPicker.tsx
│   │   ├── ErrorMessage.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── ProBadge.tsx
│   │   ├── TransactionCard.tsx
│   │   └── index.ts
│   │
│   ├── config/                      # App configuration
│   │   └── api.ts                   # API endpoints & config
│   │
│   ├── context/                     # React Context providers
│   │   ├── AuthContext.tsx          # Authentication context
│   │   └── ThemeContext.tsx         # Theme management
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── useApi.ts                # API hook
│   │   └── useAuth.ts               # Auth hook
│   │
│   ├── navigation/                  # Navigation structure
│   │   ├── AppNavigator.tsx         # Main navigator
│   │   ├── AuthNavigator.tsx        # Auth flow navigator
│   │   └── index.ts
│   │
│   ├── screens/                     # App screens
│   │   ├── AccountsScreen.tsx
│   │   ├── AddTransactionScreen.tsx
│   │   ├── BudgetsScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── ReportsScreen.tsx
│   │   ├── TransactionListScreen.tsx
│   │   └── auth/
│   │       ├── ForgotPasswordScreen.tsx
│   │       ├── LoginScreen.tsx
│   │       ├── OnboardingScreen.tsx
│   │       ├── RegisterScreen.tsx
│   │       └── index.ts
│   │
│   ├── services/                    # Business logic & API
│   │   ├── adService.ts             # AdMob service
│   │   ├── api.service.ts           # HTTP client (NEW)
│   │   ├── apiService.ts            # API service
│   │   ├── authService.ts           # Authentication
│   │   ├── storage.service.ts       # Storage management (NEW)
│   │   └── storageService.ts        # Storage service
│   │
│   ├── store/                       # State management
│   │   └── (to be implemented)
│   │
│   ├── theme/                       # Theme & styling
│   │   └── colors.ts                # Color palette
│   │
│   ├── types/                       # TypeScript definitions
│   │   ├── auth.types.ts            # Auth types
│   │   └── index.ts                 # Common types (NEW)
│   │
│   ├── utils/                       # Utility functions
│   │   ├── helpers.ts               # Helper functions (NEW)
│   │   └── validation.ts            # Validation utilities
│   │
│   └── assets/                      # Images, fonts, icons
│       └── (to be added)
│
└── Documentation
    ├── README.md                    # Setup & development guide
    └── PROJECT_STRUCTURE.md         # This file
```

## Key Features Implemented

### 1. Configuration Files ✅
- **package.json**: All required dependencies (React Native 0.73, Navigation, AdMob, etc.)
- **tsconfig.json**: Strict TypeScript with path aliases
- **babel.config.js**: Module resolver with path aliases
- **metro.config.js**: Metro bundler configuration
- **.eslintrc.js**: ESLint + TypeScript + Prettier rules
- **.prettierrc**: Code formatting rules
- **jest.config.js**: Testing configuration with coverage thresholds
- **app.json**: App metadata, permissions, AdMob IDs

### 2. Android Setup ✅
- **build.gradle**: AdMob integration, dependency versions
- **AndroidManifest.xml**: Permissions (Camera, Storage, Internet)
- **gradle.properties**: Build optimization settings
- **file_paths.xml**: File provider for image picker
- **strings.xml**: App name resources

### 3. Core Services (NEW) ✅
- **api.service.ts**: Axios-based HTTP client with interceptors
- **storage.service.ts**: Secure storage (Keychain) + AsyncStorage
- **config/api.ts**: API endpoints and configuration

### 4. Type Definitions (NEW) ✅
- **types/index.ts**: Complete type definitions for:
  - User, Expense, Category, Budget models
  - API responses (ApiResponse, PaginatedResponse)
  - Navigation types (RootStackParamList)
  - Form data types

### 5. Utilities (NEW) ✅
- **utils/helpers.ts**: Common helper functions:
  - Currency formatting
  - Date formatting (absolute & relative)
  - Email/password validation
  - Text manipulation
  - Debounce, deep clone, groupBy, etc.

## Technology Stack

### Core
- React Native 0.73.2
- TypeScript 5.3
- React 18.2

### Navigation
- @react-navigation/native 6.1.9
- @react-navigation/stack 6.3.20
- @react-navigation/bottom-tabs 6.5.11
- @react-navigation/drawer 6.6.6

### UI & Styling
- react-native-paper 5.11.6
- react-native-vector-icons 10.0.3
- react-native-chart-kit 6.12.0
- react-native-svg 14.1.0

### Data & State
- @tanstack/react-query 5.17.19
- axios 1.6.5

### Storage
- @react-native-async-storage/async-storage 1.21.0
- react-native-keychain 8.2.0

### Monetization
- @react-native-google-mobile-ads/admob 12.0.0

### Media
- react-native-image-picker 7.1.0

### Utilities
- date-fns 3.0.6
- react-hook-form 7.49.3
- zod 3.22.4

### Development
- @typescript-eslint/eslint-plugin 6.18.1
- @typescript-eslint/parser 6.18.1
- eslint 8.56.0
- prettier 3.1.1
- jest 29.7.0

## Path Aliases

The following path aliases are configured for cleaner imports:

```typescript
@/*           → src/*
@components/* → src/components/*
@screens/*    → src/screens/*
@navigation/* → src/navigation/*
@services/*   → src/services/*
@hooks/*      → src/hooks/*
@utils/*      → src/utils/*
@types/*      → src/types/*
@store/*      → src/store/*
@assets/*     → src/assets/*
@config/*     → src/config/*
```

## Getting Started

### 1. Install Dependencies
```bash
cd /home/user/expense_tracking/mobile
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your API URLs and AdMob IDs
```

### 3. Run Android
```bash
npm run android
```

### 4. Run iOS (macOS only)
```bash
cd ios && pod install && cd ..
npm run ios
```

## Development Scripts

```bash
npm start              # Start Metro bundler
npm run android        # Run on Android
npm run ios            # Run on iOS
npm test               # Run tests
npm run lint           # Lint code
npm run lint:fix       # Fix lint issues
npm run format         # Format code
npm run type-check     # TypeScript check
```

## Next Steps

### Immediate Tasks
1. Generate iOS/Android native folders (if not present)
2. Add app icons and splash screens to src/assets/
3. Configure AdMob App IDs in app.json
4. Set up backend API endpoint in .env
5. Test the basic app structure

### Development Tasks
1. Implement authentication screens (Login, Register)
2. Build main dashboard with expense overview
3. Create expense management screens (Add, Edit, List, Detail)
4. Implement category management
5. Add budget tracking features
6. Build reports and analytics screens
7. Integrate AdMob ads (banner, interstitial)
8. Add receipt photo capture
9. Implement data synchronization
10. Add offline support

### Advanced Features
1. Push notifications
2. Dark mode support
3. Multi-language support
4. Export to CSV/PDF
5. Cloud backup
6. Recurring expenses
7. Currency conversion
8. Sharing expenses

## File Naming Conventions

- **Components**: PascalCase (e.g., `TransactionCard.tsx`)
- **Screens**: PascalCase + "Screen" suffix (e.g., `DashboardScreen.tsx`)
- **Services**: camelCase + "Service" suffix (e.g., `apiService.ts`)
- **Utilities**: camelCase (e.g., `helpers.ts`)
- **Types**: camelCase + ".types" suffix (e.g., `auth.types.ts`)
- **Hooks**: camelCase with "use" prefix (e.g., `useAuth.ts`)

## Code Quality Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Enforced with TypeScript rules
- **Prettier**: Consistent code formatting
- **Testing**: Minimum 70% code coverage
- **Documentation**: JSDoc comments for functions

## Production Checklist

- [ ] Update app.json with correct app name and version
- [ ] Replace AdMob test IDs with production IDs
- [ ] Configure production API URL
- [ ] Generate Android keystore for release builds
- [ ] Set up iOS provisioning profiles
- [ ] Add app icons and splash screens
- [ ] Test on physical devices (Android & iOS)
- [ ] Review and accept permissions requirements
- [ ] Set up crash reporting
- [ ] Enable analytics
- [ ] Prepare app store listings

## Support

For setup help, see README.md
For project updates, check git commit history

---
Last Updated: 2025-11-04
