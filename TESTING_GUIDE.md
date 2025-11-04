# 🧪 Complete Testing Guide

## ✅ Verified So Far

- **Backend Files:** 14 Python modules (models, views, serializers) ✅
- **Mobile Files:** 20+ Dart files (clean architecture) ✅
- **Translation Files:** 137 strings in English & Arabic ✅
- **Management Commands:** setup_currencies, setup_categories ✅
- **Setup Scripts:** Automated backend and mobile setup ✅

## 🎯 How YOU Can Test (3 Options)

---

## Option 1: Test Backend Only (No Emulator Needed) 🚀

**You can test the complete backend RIGHT NOW without any mobile setup!**

### Step 1: Quick Backend Setup (2 minutes)

```bash
# Clone your repository (if not already)
git clone git@github.com:HeshamSayed/expense_tracking.git
cd expense_tracking/backend

# Run automated setup
chmod +x setup_demo.sh
./setup_demo.sh

# Start server
source venv/bin/activate
python manage.py runserver
```

### Step 2: Test in Your Browser

**Visit these URLs:**

1. **Swagger API Docs** (Interactive testing)
   ```
   http://localhost:8000/api/docs/
   ```
   - Click on any endpoint
   - Click "Try it out"
   - Fill in the request body
   - Click "Execute"
   - See the response!

2. **Admin Panel** (Manage data)
   ```
   http://localhost:8000/admin/
   ```
   - Login with superuser credentials
   - View 10 pre-loaded currencies
   - View 23 pre-loaded categories
   - Add/edit/delete data with full UI

### Step 3: Test API with curl (Terminal)

```bash
# Test 1: Register a user
curl -X POST http://localhost:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Test123456!",
    "password_confirm": "Test123456!",
    "first_name": "Test",
    "last_name": "User",
    "default_currency": "USD"
  }'

# Expected output:
# {
#   "user": {
#     "id": 2,
#     "email": "test@example.com",
#     "username": "testuser",
#     "first_name": "Test",
#     "last_name": "User"
#   },
#   "message": "User registered successfully. Please verify your email."
# }

# Test 2: Login
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456!"
  }'

# Expected output:
# {
#   "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
#   "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
#   "user": { ... }
# }

# Test 3: Get Categories (copy the access token from login)
TOKEN="paste_your_access_token_here"
curl http://localhost:8000/api/v1/categories/categories/ \
  -H "Authorization: Bearer $TOKEN"

# Expected output:
# {
#   "count": 23,
#   "results": [
#     {
#       "id": 1,
#       "name": "Food & Dining",
#       "icon": "🍔",
#       "color": "#EF4444",
#       "type": "expense"
#     },
#     ...
#   ]
# }

# Test 4: Create an Expense
curl -X POST http://localhost:8000/api/v1/expenses/expenses/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "25.50",
    "currency": 1,
    "category": 1,
    "description": "Lunch",
    "date": "2025-11-04",
    "payment_method": "cash"
  }'

# Test 5: Get Dashboard
curl http://localhost:8000/api/v1/analytics/dashboard/?period=month \
  -H "Authorization: Bearer $TOKEN"
```

---

## Option 2: Test Mobile App with Android Studio Emulator 📱

**Prerequisites:**
- Android Studio installed
- Flutter SDK installed

### Step 1: Setup Android Studio Emulator

```bash
# Open Android Studio
# Tools → Device Manager → Create Device
# Choose: Pixel 6 Pro
# System Image: Android 13 (API 33)
# Click Finish
```

### Step 2: Start Emulator

```bash
# In Android Studio:
# Click the ▶️ play button next to your virtual device

# OR from terminal:
emulator -avd Pixel_6_Pro_API_33
```

### Step 3: Setup Mobile App

```bash
cd mobile

# Run automated setup
chmod +x setup_demo.sh
./setup_demo.sh

# Update API URL
# Edit: lib/core/constants/app_constants.dart
# Change: baseUrl = 'http://10.0.2.2:8000'  # Special IP for Android emulator
```

### Step 4: Run App on Emulator

```bash
# Check emulator is running
flutter devices

# You should see:
# Android SDK built for x86 64 (mobile) • emulator-5554 • android-x64 • Android 13 (API 33)

# Run the app
flutter run -d emulator-5554
```

### What You'll See:

1. **Splash Screen** → Shows "Expense Tracker" logo for 1-2 seconds
2. **Login Screen** → English by default
3. **Register** → Create an account
4. **Dashboard** → See "Welcome, [Your Name]!"
5. **Settings** → Tap ⚙️ → Language → Select العربية
6. **Dashboard (Arabic)** → Everything in Arabic with RTL layout!

---

## Option 3: Test Mobile App with Physical Device 📲

**Easier than emulator!**

### Step 1: Enable Developer Mode (Android)

```
Settings → About Phone → Tap "Build Number" 7 times
Settings → System → Developer Options → Enable USB Debugging
```

### Step 2: Connect Phone

```bash
# Connect phone via USB
# Allow USB debugging when prompted

# Verify connection
flutter devices

# You should see your device listed
```

### Step 3: Run App

```bash
cd mobile

# Get your computer's IP address
# On Mac/Linux:
ifconfig | grep "inet " | grep -v 127.0.0.1
# On Windows:
ipconfig

# Update API URL with YOUR IP
# Edit: lib/core/constants/app_constants.dart
# Change: baseUrl = 'http://YOUR_IP_ADDRESS:8000'

# Run app
flutter run
```

---

## 🎬 Live Testing Scenarios

### Scenario 1: Test Authentication Flow

```bash
# 1. Start backend
cd backend
source venv/bin/activate
python manage.py runserver

# 2. In Swagger UI (browser):
http://localhost:8000/api/docs/

# 3. Test Register endpoint:
POST /api/v1/auth/register/
Body:
{
  "email": "demo@test.com",
  "username": "demo",
  "password": "Demo123!",
  "password_confirm": "Demo123!",
  "first_name": "Demo",
  "last_name": "User",
  "default_currency": "USD"
}

# 4. Click Execute
# ✅ Should return: 201 Created with user object

# 5. Test Login endpoint:
POST /api/v1/auth/login/
Body:
{
  "email": "demo@test.com",
  "password": "Demo123!"
}

# 6. Click Execute
# ✅ Should return: 200 OK with access token
```

### Scenario 2: Test Internationalization

```bash
# In mobile app (or use Swagger):

# 1. Login with credentials

# 2. View dashboard in English
# ✅ Should see: "Dashboard", "Expenses", "Income"

# 3. Go to Settings → Language → Select Arabic

# 4. View dashboard in Arabic
# ✅ Should see: "لوحة التحكم", "المصروفات", "الدخل"
# ✅ Layout should be RTL (right-to-left)

# 5. Close app and reopen
# ✅ Should still be in Arabic (persistent)
```

### Scenario 3: Test Data Management

```bash
# Using Swagger UI:

# 1. Authorize with your access token
# Click "Authorize" button → Paste token

# 2. Get all categories
GET /api/v1/categories/categories/
# ✅ Should return 23 categories

# 3. Create an expense
POST /api/v1/expenses/expenses/
Body:
{
  "amount": "50.00",
  "currency": 1,
  "category": 1,
  "description": "Grocery shopping",
  "date": "2025-11-04",
  "payment_method": "credit_card"
}
# ✅ Should return: 201 Created

# 4. Get dashboard
GET /api/v1/analytics/dashboard/?period=month
# ✅ Should show your expense in total

# 5. Create a budget
POST /api/v1/budgets/budgets/
Body:
{
  "name": "Food Budget",
  "amount": "500.00",
  "currency": 1,
  "period": "monthly",
  "start_date": "2025-11-01",
  "category": 1
}
# ✅ Should return: 201 Created

# 6. Check budget progress
GET /api/v1/budgets/budgets/1/progress/
# ✅ Should show: spent $50, remaining $450, 10% used
```

---

## 🔍 What to Verify

### Backend Checklist:

- [ ] Server starts without errors
- [ ] Admin panel accessible at /admin/
- [ ] Swagger docs accessible at /api/docs/
- [ ] User registration works (201 response)
- [ ] User login returns JWT tokens
- [ ] 10 currencies loaded in database
- [ ] 23 categories loaded in database
- [ ] Can create expenses with authenticated user
- [ ] Can create budgets
- [ ] Analytics endpoints return data
- [ ] Export endpoints work (CSV, PDF)

### Mobile App Checklist:

- [ ] App launches without errors
- [ ] Splash screen shows
- [ ] Login screen displays in English
- [ ] Registration form works
- [ ] Login succeeds with valid credentials
- [ ] Dashboard shows user's name
- [ ] Settings page accessible
- [ ] Language switcher shows English/Arabic
- [ ] Switching to Arabic changes all text
- [ ] RTL layout applied for Arabic
- [ ] Language preference persists after app restart
- [ ] Logout returns to login screen

---

## 📊 Expected Test Results

### Backend API Response Times:
- Registration: < 500ms
- Login: < 300ms
- Get Categories: < 100ms
- Create Expense: < 200ms
- Dashboard Analytics: < 500ms

### Mobile App Performance:
- App Launch: < 3 seconds
- Login: < 2 seconds
- Language Switch: < 1 second (instant)
- Screen Navigation: < 500ms

---

## 🐛 Common Issues & Solutions

### Issue 1: Backend won't start
```bash
# Solution:
python manage.py migrate  # Run migrations
createdb expense_tracking  # Create database if missing
```

### Issue 2: Mobile can't connect
```bash
# Solution:
# For Android Emulator use: http://10.0.2.2:8000
# For Physical Device use: http://YOUR_IP:8000
# Make sure firewall allows port 8000
```

### Issue 3: Translations not showing
```bash
# Solution:
cd mobile
flutter clean
flutter pub get
flutter gen-l10n
flutter run
```

---

## 🎥 Video Recording Suggestion

If you want to record a demo:

1. **macOS:**
   ```bash
   # Use built-in screen recording
   Cmd + Shift + 5
   ```

2. **Windows:**
   ```bash
   # Use Windows Game Bar
   Win + G
   ```

3. **Linux:**
   ```bash
   sudo apt install simplescreenrecorder
   simplescreenrecorder
   ```

---

## 📝 Test Report Template

After testing, you can use this template:

```markdown
# Test Report - Expense Tracker

Date: [Date]
Tester: [Your Name]

## Backend Tests
- [ ] Setup completed successfully
- [ ] Server running: ✅ / ❌
- [ ] Admin panel: ✅ / ❌
- [ ] API endpoints: ✅ / ❌
- [ ] Authentication: ✅ / ❌
- [ ] Data management: ✅ / ❌

## Mobile App Tests
- [ ] App installation: ✅ / ❌
- [ ] English UI: ✅ / ❌
- [ ] Arabic UI: ✅ / ❌
- [ ] RTL layout: ✅ / ❌
- [ ] Language persistence: ✅ / ❌

## Issues Found
1. [List any issues]

## Screenshots
[Attach screenshots]

## Overall Rating
[Your rating out of 10]
```

---

## 🚀 Ready to Test?

**Quickest way to see it working:**

```bash
# Terminal 1: Start backend
cd backend && ./setup_demo.sh && source venv/bin/activate && python manage.py runserver

# Terminal 2 (optional): Run mobile
cd mobile && ./setup_demo.sh && flutter run

# Browser: Test API
http://localhost:8000/api/docs/
```

**That's it! You're testing!** 🎉
