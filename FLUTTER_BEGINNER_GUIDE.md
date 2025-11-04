# 📱 Complete Beginner's Guide to Running the Flutter Mobile App

## 🎯 What You'll Learn

By the end of this guide, you'll have:
- ✅ Flutter installed on your computer
- ✅ Android emulator running
- ✅ Mobile app running on the emulator
- ✅ Ability to test English and Arabic languages

**Time needed: 20-30 minutes (first time only)**

---

## Part 1: Install Flutter (One-Time Setup)

### For macOS:

**Step 1: Download Flutter**
```bash
cd ~/Downloads

# Download Flutter
curl -O https://storage.googleapis.com/flutter_infra_release/releases/stable/macos/flutter_macos_arm64_3.24.0-stable.tar.xz

# Extract it
tar xf flutter_macos_arm64_3.24.0-stable.tar.xz

# Move to a permanent location
sudo mv flutter /usr/local/flutter
```

**Step 2: Add Flutter to your PATH**
```bash
# Open your shell config file
nano ~/.zshrc

# Add this line at the end:
export PATH="$PATH:/usr/local/flutter/bin"

# Save and exit (Ctrl+X, then Y, then Enter)

# Reload your shell
source ~/.zshrc
```

**Step 3: Verify Flutter is installed**
```bash
flutter --version
```

You should see something like:
```
Flutter 3.24.0 • channel stable
```

✅ **Flutter is now installed!**

---

### For Windows:

**Step 1: Download Flutter**
1. Go to: https://docs.flutter.dev/get-started/install/windows
2. Click "flutter_windows_3.24.0-stable.zip"
3. Extract the zip file to `C:\src\flutter`

**Step 2: Add Flutter to PATH**
1. Search for "Environment Variables" in Windows Start Menu
2. Click "Edit the system environment variables"
3. Click "Environment Variables" button
4. Under "User variables", find "Path"
5. Click "Edit"
6. Click "New"
7. Add: `C:\src\flutter\bin`
8. Click "OK" on all windows

**Step 3: Verify Flutter is installed**
Open a NEW Command Prompt (important!) and run:
```cmd
flutter --version
```

✅ **Flutter is now installed!**

---

### For Linux (Ubuntu/Debian):

```bash
cd ~/Downloads

# Download Flutter
wget https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.24.0-stable.tar.xz

# Extract it
tar xf flutter_linux_3.24.0-stable.tar.xz

# Move to a permanent location
sudo mv flutter /usr/local/flutter

# Add to PATH
echo 'export PATH="$PATH:/usr/local/flutter/bin"' >> ~/.bashrc
source ~/.bashrc

# Verify
flutter --version
```

✅ **Flutter is now installed!**

---

## Part 2: Install Android Studio (Needed for Emulator)

**Why?** Android Studio provides the Android emulator so you can test the mobile app without a physical phone.

### For macOS:

**Step 1: Download Android Studio**
1. Go to: https://developer.android.com/studio
2. Click "Download Android Studio"
3. Open the downloaded `.dmg` file
4. Drag "Android Studio" to Applications folder

**Step 2: Run Android Studio**
1. Open Android Studio from Applications
2. Follow the setup wizard
3. Choose "Standard" installation
4. Wait for downloads to complete (takes 5-10 minutes)

---

### For Windows:

**Step 1: Download Android Studio**
1. Go to: https://developer.android.com/studio
2. Click "Download Android Studio"
3. Run the downloaded `.exe` file
4. Follow the installer

**Step 2: Complete Setup**
1. Choose "Standard" installation
2. Wait for downloads to complete

---

### For Linux:

```bash
# Download Android Studio
wget https://redirector.gvt1.com/edgedl/android/studio/ide-zips/2023.1.1.28/android-studio-2023.1.1.28-linux.tar.gz

# Extract
tar -xzf android-studio-2023.1.1.28-linux.tar.gz

# Move to /opt
sudo mv android-studio /opt/

# Run it
/opt/android-studio/bin/studio.sh
```

---

## Part 3: Configure Flutter for Android

**Step 1: Tell Flutter about Android Studio**
```bash
flutter config --android-studio-dir="/Applications/Android Studio.app/Contents"  # macOS
# OR
flutter config --android-studio-dir="C:\Program Files\Android\Android Studio"  # Windows
# OR
flutter config --android-studio-dir="/opt/android-studio"  # Linux
```

**Step 2: Accept Android licenses**
```bash
flutter doctor --android-licenses
```

Type `y` (yes) when prompted for each license.

**Step 3: Check everything is working**
```bash
flutter doctor
```

You should see mostly ✓ (checkmarks). Don't worry about:
- ✗ Xcode (only needed for iOS)
- ! issues with optional tools

---

## Part 4: Create an Android Emulator

**Step 1: Open Android Studio**

**Step 2: Open Device Manager**
- Click the three dots (⋮) in the top right
- OR: Tools → Device Manager

**Step 3: Create Virtual Device**
1. Click "+ Create Device" button
2. **Choose a Phone:**
   - Select "Pixel 6 Pro"
   - Click "Next"

3. **Choose System Image:**
   - If not already downloaded, click "Download" next to "Tiramisu (API 33)"
   - Wait for download to complete
   - Select "Tiramisu" (Android 13.0)
   - Click "Next"

4. **Verify Configuration:**
   - Name: Pixel 6 Pro API 33
   - Click "Finish"

✅ **Emulator is now created!**

**Step 4: Start the Emulator**
1. In Device Manager, find your "Pixel 6 Pro API 33"
2. Click the ▶️ (Play) button
3. Wait 30-60 seconds for the emulator to boot

You should see an Android phone screen!

---

## Part 5: Prepare Your Mobile App

**Step 1: Navigate to mobile folder**
```bash
cd /path/to/expense_tracking/mobile
```

**Step 2: Install dependencies**
```bash
flutter pub get
```

You'll see:
```
Running "flutter pub get" in mobile...
Resolving dependencies...
Got dependencies!
```

**Step 3: Generate localization files** (for Arabic/English support)
```bash
flutter gen-l10n
```

**Step 4: Update the API URL**

Open the file: `lib/core/constants/app_constants.dart`

**Option A: Using a Text Editor**
```bash
# Open with nano (command line)
nano lib/core/constants/app_constants.dart

# Or open with VS Code
code lib/core/constants/app_constants.dart

# Or open with any text editor
```

**Find this line:**
```dart
static const String baseUrl = 'http://localhost:8000';
```

**Change it to:**
```dart
static const String baseUrl = 'http://10.0.2.2:8000';
```

**Why?** `10.0.2.2` is a special IP that Android emulator uses to connect to your computer's localhost.

**Save the file!**

---

## Part 6: Run Your Mobile App!

**Step 1: Make sure backend is running**

In a separate terminal:
```bash
cd expense_tracking/backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python manage.py runserver
```

Keep this running!

**Step 2: Check emulator is detected**
```bash
cd expense_tracking/mobile
flutter devices
```

You should see:
```
2 connected devices:

sdk gphone64 arm64 (mobile) • emulator-5554 • android-arm64 • Android 13 (API 33)
```

**Step 3: Run the app!**
```bash
flutter run
```

**What happens:**
1. Flutter compiles your app (takes 1-2 minutes first time)
2. You'll see progress messages
3. App automatically opens on the emulator

**Expected output:**
```
Launching lib/main.dart on sdk gphone64 arm64 in debug mode...
Running Gradle task 'assembleDebug'...
✓ Built build/app/outputs/flutter-apk/app-debug.apk.
Installing build/app/outputs/flutter-apk/app.apk...
Waiting for sdk gphone64 arm64 to report its views...
Syncing files to device sdk gphone64 arm64...

Flutter run key commands.
r Hot reload. 🔥🔥🔥
R Hot restart.
h List all available interactive commands.
d Detach (terminate "flutter run" but leave application running).
c Clear the screen
q Quit (terminate the application on the device).

💪 Running with sound null safety 💪

An Observatory debugger and profiler on sdk gphone64 arm64 is available at: http://127.0.0.1:xxxxx/
The Flutter DevTools debugger and profiler on sdk gphone64 arm64 is available at: http://127.0.0.1:xxxxx/
```

✅ **Your app is now running on the emulator!**

---

## Part 7: Test the App

### What You'll See:

**1. Splash Screen (2 seconds)**
```
┌─────────────────────────┐
│                         │
│      💼 (Icon)          │
│                         │
│   Expense Tracker       │
│                         │
│      Loading...         │
│                         │
└─────────────────────────┘
```

**2. Login Screen**
```
┌─────────────────────────┐
│      Welcome Back!      │
│                         │
│  ┌───────────────────┐  │
│  │ 📧 Email          │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │ 🔒 Password   👁  │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │      Login        │  │
│  └───────────────────┘  │
│                         │
│  Don't have an account? │
│       Register          │
└─────────────────────────┘
```

**3. Testing Steps:**

**a) Register a new account:**
1. Tap "Register"
2. Fill in the form:
   - Email: test@example.com
   - Username: testuser
   - First Name: Test
   - Last Name: User
   - Password: Test123!
   - Confirm Password: Test123!
3. Tap "Register" button
4. You'll see: "Registration successful! Please login."

**b) Login:**
1. Enter email: test@example.com
2. Enter password: Test123!
3. Tap "Login"
4. Dashboard appears!

**c) Switch to Arabic:**
1. Tap the ⚙️ (Settings) icon in top right
2. Tap "Language"
3. Select "العربية" (Arabic)
4. **BOOM! Entire app is now in Arabic with RTL layout!**

**d) Verify language persists:**
1. Press the back button on emulator (or swipe up)
2. Close the app
3. Open it again from app drawer
4. **App is still in Arabic!** ✅

---

## Part 8: Useful Flutter Commands

While the app is running, you can press keys in your terminal:

- **r** - Hot reload (instantly apply code changes)
- **R** - Hot restart (restart app)
- **q** - Quit (close app)
- **h** - Help (see all commands)

---

## Part 9: Common Issues & Solutions

### Issue 1: "No devices found"

**Solution:**
```bash
# Make sure emulator is running
# Go to Android Studio → Device Manager → Click ▶️
# Wait for emulator to boot completely
# Then run: flutter devices
```

### Issue 2: "Gradle build failed"

**Solution:**
```bash
cd mobile
flutter clean
flutter pub get
flutter run
```

### Issue 3: "Unable to connect to backend"

**Solution:**
1. Make sure backend is running: `python manage.py runserver`
2. Check API URL is `http://10.0.2.2:8000` in `app_constants.dart`
3. Test connection from emulator:
   ```bash
   # In emulator browser, visit:
   http://10.0.2.2:8000/api/docs/
   ```

### Issue 4: "Command not found: flutter"

**Solution:**
```bash
# Make sure you added Flutter to PATH
# Close and reopen terminal
# Try again: flutter --version
```

### Issue 5: "Android licenses not accepted"

**Solution:**
```bash
flutter doctor --android-licenses
# Press 'y' for all prompts
```

### Issue 6: App shows "Unable to load app"

**Solution:**
1. Make sure backend is running
2. Check logs in terminal for error messages
3. Try: `flutter clean && flutter run`

---

## Part 10: What Each File Does (For Your Understanding)

```
mobile/
├── lib/
│   ├── main.dart                    # App entry point (starts here)
│   ├── core/
│   │   ├── constants/
│   │   │   └── app_constants.dart   # ⚠️ API URL here
│   │   ├── theme/
│   │   │   └── app_theme.dart       # Colors and styling
│   │   ├── l10n/
│   │   │   └── locale_cubit.dart    # Language management
│   │   └── router/
│   │       └── app_router.dart      # Navigation
│   ├── l10n/
│   │   ├── app_en.arb              # English translations
│   │   └── app_ar.arb              # Arabic translations
│   └── features/
│       ├── authentication/          # Login/Register
│       ├── home/                    # Dashboard
│       ├── settings/                # Settings page
│       └── expenses/                # Expense management
└── pubspec.yaml                     # Dependencies list
```

---

## Part 11: Video Tutorial Alternative

If you prefer video tutorials, search YouTube for:
- "How to install Flutter" (for your OS)
- "How to create Android emulator"
- "How to run Flutter app"

---

## 🎉 Congratulations!

You now know how to:
- ✅ Install Flutter
- ✅ Create and start an Android emulator
- ✅ Run a Flutter mobile app
- ✅ Test the app on the emulator
- ✅ Switch between languages

---

## 🆘 Still Stuck?

Run this diagnostic command and share the output:

```bash
cd expense_tracking/mobile
flutter doctor -v
flutter devices
```

---

## 📝 Quick Reference Card

**Every time you want to run the app:**

```bash
# Terminal 1: Start backend
cd expense_tracking/backend
source venv/bin/activate
python manage.py runserver

# Terminal 2: Run mobile app
cd expense_tracking/mobile
flutter run
```

**That's it!** 🚀

---

## Next Steps

Once you're comfortable running the app, you can:
1. Explore the code in `lib/` folder
2. Make changes and press `r` to hot reload
3. Add new features
4. Read Flutter documentation: https://docs.flutter.dev/

**You're now a Flutter developer!** 🎊
