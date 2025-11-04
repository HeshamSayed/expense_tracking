# MoneyGuard Mobile App

A modern, feature-rich React Native mobile application for expense tracking and financial management.

## Tech Stack

- **React Native 0.73.2** - Cross-platform mobile framework
- **TypeScript 5.3** - Type-safe development
- **React Navigation 6** - Navigation (Stack, Bottom Tabs, Drawer)
- **React Native Paper** - Material Design UI components
- **TanStack Query (React Query)** - Data fetching and caching
- **AdMob** - Mobile advertising integration
- **React Native Keychain** - Secure credential storage
- **AsyncStorage** - Local data persistence
- **Axios** - HTTP client
- **React Hook Form + Zod** - Form validation
- **Chart Kit** - Data visualization
- **Image Picker** - Receipt photo capture

## Project Structure

```
mobile/
├── android/                  # Android native code
│   └── app/
│       ├── build.gradle     # Android build configuration
│       └── src/main/
│           └── AndroidManifest.xml
├── ios/                      # iOS native code (to be generated)
├── src/                      # Source code
│   ├── assets/              # Images, fonts, icons
│   ├── components/          # Reusable UI components
│   ├── config/              # App configuration
│   ├── hooks/               # Custom React hooks
│   ├── navigation/          # Navigation structure
│   ├── screens/             # App screens
│   ├── services/            # API services, storage
│   ├── store/               # State management
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Utility functions
├── .eslintrc.js             # ESLint configuration
├── .prettierrc              # Prettier configuration
├── app.json                 # App configuration
├── babel.config.js          # Babel configuration
├── metro.config.js          # Metro bundler configuration
├── package.json             # Dependencies
└── tsconfig.json            # TypeScript configuration
```

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

1. **Node.js** (v18 or higher)
   ```bash
   node --version
   ```

2. **npm** or **yarn** (v9 or higher)
   ```bash
   npm --version
   ```

3. **React Native CLI**
   ```bash
   npm install -g react-native-cli
   ```

4. **Watchman** (for macOS)
   ```bash
   brew install watchman
   ```

### Android Development

1. **Java Development Kit (JDK 17)**
   - Download from [Oracle](https://www.oracle.com/java/technologies/downloads/) or use OpenJDK

2. **Android Studio**
   - Download from [Android Studio](https://developer.android.com/studio)
   - During installation, ensure the following are selected:
     - Android SDK
     - Android SDK Platform
     - Android Virtual Device (AVD)

3. **Android SDK**
   - Open Android Studio → Settings → Appearance & Behavior → System Settings → Android SDK
   - Install the following:
     - Android 13 (API Level 33)
     - Android SDK Build-Tools
     - Android Emulator
     - Android SDK Platform-Tools

4. **Environment Variables**

   Add to your `~/.bashrc`, `~/.zshrc`, or `~/.bash_profile`:
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

   For Windows, add these to System Environment Variables:
   ```
   ANDROID_HOME=C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk
   PATH=%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\emulator
   ```

### iOS Development (macOS only)

1. **Xcode** (version 14 or higher)
   - Download from the App Store

2. **Xcode Command Line Tools**
   ```bash
   xcode-select --install
   ```

3. **CocoaPods**
   ```bash
   sudo gem install cocoapods
   ```

## Installation

### 1. Clone and Install Dependencies

```bash
# Navigate to the mobile directory
cd /home/user/expense_tracking/mobile

# Install dependencies
npm install

# For iOS only (macOS)
cd ios && pod install && cd ..
```

### 2. Initialize React Native (First Time Setup)

If this is a fresh project, you may need to initialize the iOS/Android folders:

```bash
# This will generate native iOS and Android folders if needed
npx react-native init MoneyGuard --template react-native-template-typescript
```

### 3. Link Assets

```bash
npx react-native-asset
```

## Configuration

### 1. AdMob Setup

Replace the test AdMob App IDs in the following files:

**android/app/build.gradle:**
```gradle
manifestPlaceholders = [
    admobAppId: "ca-app-pub-YOUR_ANDROID_ADMOB_APP_ID~XXXXXXXXXX"
]
```

**app.json (iOS):**
```json
"GADApplicationIdentifier": "ca-app-pub-YOUR_IOS_ADMOB_APP_ID~XXXXXXXXXX"
```

### 2. API Configuration

Update the API URL in **app.json**:
```json
"extra": {
  "apiUrl": "https://your-api-domain.com/api"
}
```

Or create a `.env` file (requires react-native-dotenv):
```
API_BASE_URL=https://your-api-domain.com/api
ADMOB_ANDROID_APP_ID=ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX
ADMOB_IOS_APP_ID=ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX
```

### 3. Keystore Setup (Android Release)

For production builds, create a keystore:

```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore moneyguard-release-key.keystore -alias moneyguard-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

Create **android/gradle.properties**:
```properties
MYAPP_UPLOAD_STORE_FILE=moneyguard-release-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=moneyguard-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=YOUR_KEYSTORE_PASSWORD
MYAPP_UPLOAD_KEY_PASSWORD=YOUR_KEY_PASSWORD
```

## Running the App

### Development Mode

#### Android

1. **Start Metro Bundler:**
   ```bash
   npm start
   ```

2. **Run on Android Emulator:**
   ```bash
   # In a new terminal
   npm run android
   ```

   Or for a specific device:
   ```bash
   npx react-native run-android --deviceId=DEVICE_ID
   ```

3. **Run on Physical Device:**
   - Enable USB debugging on your Android device
   - Connect via USB
   - Run: `npm run android`

#### iOS (macOS only)

1. **Start Metro Bundler:**
   ```bash
   npm start
   ```

2. **Run on iOS Simulator:**
   ```bash
   # In a new terminal
   npm run ios
   ```

   Or for a specific simulator:
   ```bash
   npx react-native run-ios --simulator="iPhone 15 Pro"
   ```

### Production Build

#### Android APK

```bash
cd android
./gradlew assembleRelease

# APK location: android/app/build/outputs/apk/release/app-release.apk
```

#### Android AAB (for Google Play)

```bash
cd android
./gradlew bundleRelease

# AAB location: android/app/build/outputs/bundle/release/app-release.aab
```

#### iOS (macOS only)

1. Open `ios/MoneyGuard.xcworkspace` in Xcode
2. Select "Any iOS Device" as the target
3. Product → Archive
4. Follow the Xcode Organizer steps to upload to App Store

## Development

### Code Quality

```bash
# Lint code
npm run lint

# Fix lint issues
npm run lint:fix

# Format code
npm run format

# Type check
npm run type-check
```

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```

### Debugging

#### React Native Debugger

1. Install [React Native Debugger](https://github.com/jhen0409/react-native-debugger/releases)
2. Enable Debug JS Remotely in the app (Shake device → Debug)

#### Flipper

React Native 0.62+ includes Flipper by default:
1. Install [Flipper Desktop](https://fbflipper.com/)
2. Run your app in development mode
3. Flipper should auto-detect your app

#### Chrome DevTools

1. Shake the device to open the developer menu
2. Select "Debug JS Remotely"
3. Open Chrome DevTools (chrome://inspect)

### Hot Reload

- **Fast Refresh** is enabled by default
- Changes to components will update automatically
- Shake device → "Enable Fast Refresh"

## Troubleshooting

### Common Issues

#### Metro Bundler Cache Issues

```bash
npm start -- --reset-cache
```

#### Android Build Failures

```bash
cd android
./gradlew clean
cd ..
npm run android
```

#### iOS Build Failures

```bash
cd ios
pod deintegrate
pod install
cd ..
npm run ios
```

#### Port Already in Use

```bash
# Kill process on port 8081
npx react-native start --port 8082
```

#### Unable to Load Script

```bash
# Clear cache and restart
rm -rf $TMPDIR/react-*
watchman watch-del-all
npm start -- --reset-cache
```

#### Gradle Daemon Issues

```bash
cd android
./gradlew --stop
cd ..
```

### Platform-Specific Issues

#### Android

**Issue:** `SDK location not found`
- Create `android/local.properties`:
  ```properties
  sdk.dir=/Users/USERNAME/Library/Android/sdk
  ```

**Issue:** `Execution failed for task ':app:installDebug'`
- Ensure only one device/emulator is connected
- Run: `adb devices` to check

#### iOS

**Issue:** `No bundle URL present`
- Ensure Metro bundler is running
- Clean build: Product → Clean Build Folder in Xcode

**Issue:** `Pod installation error`
```bash
cd ios
pod repo update
pod install
cd ..
```

## Key Features to Implement

### Core Features
- [ ] User Authentication (Login, Register, Biometric)
- [ ] Expense Management (Add, Edit, Delete, List)
- [ ] Receipt Photo Capture
- [ ] Category Management
- [ ] Budget Tracking
- [ ] Reports and Analytics
- [ ] Data Synchronization
- [ ] Offline Mode

### UI Features
- [ ] Dark Mode Support
- [ ] Multi-language Support
- [ ] Charts and Visualizations
- [ ] Push Notifications
- [ ] AdMob Integration

### Advanced Features
- [ ] Recurring Expenses
- [ ] Export to CSV/PDF
- [ ] Cloud Backup
- [ ] Sharing Expenses
- [ ] Currency Conversion

## Performance Optimization

### Bundle Size

```bash
# Analyze bundle
npx react-native-bundle-visualizer

# Enable Hermes (faster startup)
# Already enabled in android/app/build.gradle
```

### Image Optimization

- Use WebP format for images
- Implement lazy loading for lists
- Use `react-native-fast-image` for caching

### Memory Management

- Use `FlatList` instead of `ScrollView` for long lists
- Implement proper cleanup in `useEffect`
- Use `React.memo` for expensive components

## Deployment

### Google Play Store

1. Generate signed AAB
2. Create a developer account
3. Upload to Google Play Console
4. Fill in store listing details
5. Submit for review

### Apple App Store

1. Archive the app in Xcode
2. Create app in App Store Connect
3. Upload via Xcode Organizer
4. Fill in app metadata
5. Submit for review

## Resources

### Documentation
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [TanStack Query](https://tanstack.com/query/latest)

### Community
- [React Native Community](https://github.com/react-native-community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native)
- [Reddit r/reactnative](https://www.reddit.com/r/reactnative/)

### Tools
- [React Native Directory](https://reactnative.directory/)
- [Expo](https://expo.dev/)
- [CodePush](https://microsoft.github.io/code-push/)

## License

Proprietary - MoneyGuard Expense Tracker

## Support

For issues and support, please contact: support@moneyguard.com

---

Built with React Native + TypeScript + Love
