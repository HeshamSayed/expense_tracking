# MoneyGuard Mobile - Quick Start Guide

## Files Created ✅

### Core Configuration Files
1. **package.json** - All dependencies for React Native, Navigation, AdMob, Storage, etc.
2. **tsconfig.json** - TypeScript configuration with strict mode and path aliases
3. **babel.config.js** - Babel transpiler with module resolver for path aliases
4. **metro.config.js** - Metro bundler configuration
5. **.eslintrc.js** - ESLint configuration for TypeScript and React
6. **.prettierrc** - Code formatting rules
7. **app.json** - App configuration with AdMob IDs and permissions
8. **jest.config.js** - Testing configuration with 70% coverage threshold
9. **jest.setup.js** - Jest mocks for React Native modules
10. **.gitignore** - Git ignore rules for mobile development
11. **.env.example** - Environment variables template

### Entry Point Files
12. **index.js** - React Native app entry point
13. **App.tsx** - Main app component with providers (React Query, Paper)

### Android Configuration
14. **android/build.gradle** - Project-level build configuration
15. **android/gradle.properties** - Gradle settings and optimizations
16. **android/settings.gradle** - Module settings
17. **android/app/build.gradle** - App-level build with AdMob integration
18. **android/app/src/main/AndroidManifest.xml** - App manifest with permissions
19. **android/app/src/main/res/values/strings.xml** - App name resources
20. **android/app/src/main/res/xml/file_paths.xml** - File provider for image picker

### Source Code - Services (NEW)
21. **src/config/api.ts** - API endpoints and configuration
22. **src/services/api.service.ts** - HTTP client with Axios and interceptors
23. **src/services/storage.service.ts** - Secure storage and AsyncStorage wrapper

### Source Code - Types (NEW)
24. **src/types/index.ts** - Complete TypeScript type definitions

### Source Code - Utils (NEW)
25. **src/utils/helpers.ts** - Common helper functions (formatting, validation, etc.)

### Documentation
26. **README.md** - Comprehensive setup and development guide
27. **PROJECT_STRUCTURE.md** - Complete project structure overview
28. **QUICK_START.md** - This file

## Immediate Next Steps

### 1. Initialize React Native (If needed)
If native folders are not fully set up, initialize:
```bash
cd /home/user/expense_tracking/mobile
npx react-native init MoneyGuard --template react-native-template-typescript
# Then copy/merge your configuration files
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment
```bash
cp .env.example .env
# Edit .env with your values:
# - API_BASE_URL=http://your-api-server:3000/api
# - ADMOB_ANDROID_APP_ID=ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX
```

### 4. Configure AdMob
Get your AdMob App IDs from https://apps.admob.com/

Update in:
- **android/app/build.gradle**: Line 59-60
- **app.json**: iOS section

### 5. Test Android Build
```bash
# Start Metro bundler
npm start

# In another terminal
npm run android
```

## Key Dependencies Installed

### Navigation (React Navigation 6)
- Stack Navigator
- Bottom Tabs Navigator  
- Drawer Navigator
- All required peer dependencies

### UI Components
- React Native Paper (Material Design)
- React Native Vector Icons
- React Native Chart Kit (for graphs)

### Data Management
- TanStack Query (React Query) - Data fetching
- Axios - HTTP client

### Storage
- AsyncStorage - Local storage
- React Native Keychain - Secure storage

### Monetization
- AdMob SDK - Mobile ads

### Media
- React Native Image Picker - Camera/gallery access

### Forms & Validation
- React Hook Form
- Zod

### Utilities
- date-fns - Date manipulation

## File Structure Summary

```
mobile/
├── Configuration (11 files) ✅
├── Entry Points (2 files) ✅
├── Android (7 files) ✅
├── iOS (to be generated)
└── src/
    ├── assets/ (empty - add your icons/images)
    ├── components/ (existing components)
    ├── config/ (1 NEW file) ✅
    ├── context/ (existing)
    ├── hooks/ (existing)
    ├── navigation/ (existing)
    ├── screens/ (existing)
    ├── services/ (2 NEW files) ✅
    ├── store/ (empty)
    ├── theme/ (existing)
    ├── types/ (1 NEW file) ✅
    └── utils/ (1 NEW file) ✅
```

## Common Commands

### Development
```bash
npm start                  # Start Metro
npm run android            # Run on Android
npm run ios                # Run on iOS (macOS only)
npm run lint               # Check code quality
npm run lint:fix           # Auto-fix lint issues
npm run format             # Format code with Prettier
npm run type-check         # TypeScript validation
npm test                   # Run tests
```

### Android Build
```bash
# Debug APK
cd android && ./gradlew assembleDebug

# Release APK
cd android && ./gradlew assembleRelease

# Release AAB (for Play Store)
cd android && ./gradlew bundleRelease
```

### Clean Build
```bash
# Clear cache and rebuild
npm start -- --reset-cache
cd android && ./gradlew clean && cd ..
npm run android
```

## Path Aliases Configuration

Import using aliases instead of relative paths:
```typescript
// Instead of: import Button from '../../../components/Button'
import Button from '@components/Button';

// Instead of: import { formatCurrency } from '../../../utils/helpers'
import { formatCurrency } from '@utils/helpers';

// All available aliases:
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

## New Services Created

### 1. API Service (`src/services/api.service.ts`)
HTTP client with automatic token injection:
```typescript
import apiService from '@services/api.service';

// GET request
const data = await apiService.get('/expenses');

// POST request
const result = await apiService.post('/expenses', {amount: 100});

// Upload file
const formData = new FormData();
formData.append('receipt', file);
const uploaded = await apiService.uploadFile('/upload/receipt', formData);
```

### 2. Storage Service (`src/services/storage.service.ts`)
Secure and local storage:
```typescript
import {saveToken, getToken, saveUserData} from '@services/storage.service';

// Secure storage (Keychain)
await saveToken('your-jwt-token');
const token = await getToken();

// Local storage (AsyncStorage)
await saveUserData({id: '1', name: 'John'});
const user = await getUserData();
```

### 3. Helper Functions (`src/utils/helpers.ts`)
Common utilities:
```typescript
import {formatCurrency, formatDate, isValidEmail} from '@utils/helpers';

formatCurrency(1234.56);              // "$1,234.56"
formatDate(new Date());               // "Nov 04, 2025"
isValidEmail('test@example.com');     // true
```

## Type Definitions Available

All types are in `src/types/index.ts`:
```typescript
import type {User, Expense, Category, Budget, ApiResponse} from '@types';
```

## Testing Your Setup

### 1. Verify TypeScript
```bash
npm run type-check
# Should complete without errors
```

### 2. Verify Linting
```bash
npm run lint
# Should show no errors
```

### 3. Run the App
```bash
npm start
# In another terminal:
npm run android
# You should see "Welcome to MoneyGuard" screen
```

## Troubleshooting

### Issue: "SDK location not found"
Solution: Create `android/local.properties`:
```properties
sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk
```

### Issue: "Command failed: ./gradlew"
Solution: Make gradlew executable:
```bash
cd android
chmod +x gradlew
cd ..
```

### Issue: Metro bundler port 8081 in use
Solution: Kill the process or use different port:
```bash
npx react-native start --port 8082
```

### Issue: Build fails with cache errors
Solution: Clear all caches:
```bash
watchman watch-del-all
rm -rf node_modules
npm install
npm start -- --reset-cache
```

## Production Checklist

Before releasing to production:
- [ ] Replace AdMob test IDs with production IDs
- [ ] Update API_BASE_URL to production server
- [ ] Generate Android release keystore
- [ ] Update app.json version
- [ ] Add app icons to src/assets/
- [ ] Test on physical devices
- [ ] Run full test suite
- [ ] Generate release build
- [ ] Test release build thoroughly

## Resources

- **React Native Docs**: https://reactnative.dev/docs/getting-started
- **React Navigation**: https://reactnavigation.org/docs/getting-started
- **React Native Paper**: https://callstack.github.io/react-native-paper/
- **AdMob Setup**: https://docs.page/invertase/react-native-google-mobile-ads

## Support

For detailed documentation, see:
- `README.md` - Full setup guide
- `PROJECT_STRUCTURE.md` - Complete file structure

---

Ready to build? Run: `npm install && npm run android`
