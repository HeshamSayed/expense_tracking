# 🎬 Complete Demo Guide

## Prerequisites

Before starting, ensure you have:
- Python 3.10+ installed
- PostgreSQL installed and running
- Flutter SDK installed
- Android Studio or Xcode (for mobile)
- A mobile device or emulator

## Part 1: Backend Setup & Demo (15 minutes)

### Step 1: Database Setup

```bash
# Create PostgreSQL database
createdb expense_tracking

# Or using psql:
psql -U postgres
CREATE DATABASE expense_tracking;
\q
```

### Step 2: Backend Installation

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Step 3: Configure Environment

```bash
# Copy environment example
cp .env.example .env

# Edit .env file with your settings
# Minimum required settings:
DEBUG=True
SECRET_KEY=your-secret-key-here-change-this
DB_NAME=expense_tracking
DB_USER=postgres
DB_PASSWORD=your-postgres-password
DB_HOST=localhost
DB_PORT=5432
```

### Step 4: Run Migrations & Setup Data

```bash
# Run database migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser for admin panel
python manage.py createsuperuser
# Enter email: admin@example.com
# Enter username: admin
# Enter password: (your choice)

# Load default currencies (USD, EUR, GBP, AED, SAR, EGP, etc.)
python manage.py setup_currencies

# Load default categories (23 categories in English)
python manage.py setup_categories
```

Expected output:
```
Created currency: USD - US Dollar
Created currency: EUR - Euro
Created currency: GBP - British Pound
Created currency: AED - UAE Dirham
Created currency: SAR - Saudi Riyal
Created currency: EGP - Egyptian Pound
...
Successfully created 10 currencies

Created category: Food & Dining (expense)
Created category: Transportation (expense)
Created category: Shopping (expense)
...
Successfully created 23 categories
```

### Step 5: Start Backend Server

```bash
# Run development server
python manage.py runserver
```

You should see:
```
Watching for file changes with StatReloader
Performing system checks...

System check identified no issues (0 silenced).
November 04, 2025 - 18:30:00
Django version 4.2.7, using settings 'config.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CONTROL-C.
```

### Step 6: Explore Backend Features

Open your browser and visit:

**1. API Documentation (Swagger UI)**
```
http://localhost:8000/api/docs/
```

What you'll see:
- Complete API documentation
- All endpoints organized by feature
- Interactive "Try it out" buttons
- Request/Response examples

**2. Admin Panel**
```
http://localhost:8000/admin/
```

Login with your superuser credentials.

What you'll see:
- Users management
- Categories (23 pre-loaded)
- Currencies (10 pre-loaded)
- Empty expenses, incomes, budgets (ready to add data)

**3. Test API Endpoints**

Using Swagger UI or curl:

**Register a new user:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "testuser",
    "password": "SecurePass123!",
    "password_confirm": "SecurePass123!",
    "first_name": "John",
    "last_name": "Doe",
    "default_currency": "USD"
  }'
```

Expected response:
```json
{
  "user": {
    "id": 2,
    "email": "user@example.com",
    "username": "testuser",
    "first_name": "John",
    "last_name": "Doe",
    "full_name": "John Doe",
    "default_currency": "USD"
  },
  "message": "User registered successfully. Please verify your email."
}
```

**Login:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

Expected response:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 2,
    "email": "user@example.com",
    "username": "testuser",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

**Get Categories:**
```bash
curl http://localhost:8000/api/v1/categories/categories/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Expected response:
```json
{
  "count": 23,
  "results": [
    {
      "id": 1,
      "name": "Food & Dining",
      "description": "Restaurants, groceries, and food delivery",
      "type": "expense",
      "icon": "🍔",
      "color": "#EF4444",
      "is_system_default": true
    },
    {
      "id": 2,
      "name": "Transportation",
      "description": "Gas, public transport, parking",
      "type": "expense",
      "icon": "🚗",
      "color": "#F59E0B"
    }
    // ... 21 more categories
  ]
}
```

**Create an Expense:**
```bash
curl -X POST http://localhost:8000/api/v1/expenses/expenses/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "45.99",
    "currency": 1,
    "category": 1,
    "description": "Lunch at restaurant",
    "date": "2025-11-04",
    "payment_method": "credit_card",
    "location": "Downtown Cafe"
  }'
```

Expected response:
```json
{
  "id": 1,
  "amount": "45.99",
  "currency_detail": {
    "code": "USD",
    "symbol": "$"
  },
  "category_detail": {
    "name": "Food & Dining",
    "icon": "🍔",
    "color": "#EF4444"
  },
  "description": "Lunch at restaurant",
  "date": "2025-11-04",
  "payment_method": "credit_card",
  "location": "Downtown Cafe",
  "created_at": "2025-11-04T18:30:00Z"
}
```

## Part 2: Mobile App Demo (10 minutes)

### Step 1: Get Your Computer's IP Address

The mobile app needs to connect to your backend. Get your IP:

```bash
# On macOS/Linux:
ifconfig | grep "inet " | grep -v 127.0.0.1

# On Windows:
ipconfig

# Example output: 192.168.1.100
```

### Step 2: Update API Base URL

Edit `mobile/lib/core/constants/app_constants.dart`:

```dart
class AppConstants {
  // Replace with YOUR IP address
  static const String baseUrl = 'http://192.168.1.100:8000';
  // ...
}
```

### Step 3: Install Flutter Dependencies

```bash
# Navigate to mobile directory
cd mobile

# Get dependencies
flutter pub get

# Generate localization files
flutter gen-l10n
```

### Step 4: Run the App

```bash
# Check available devices
flutter devices

# Run on specific device
flutter run

# Or for Android emulator
flutter run -d android

# Or for iOS simulator
flutter run -d ios
```

### Step 5: App Walkthrough

**Screen 1: Splash Screen**

What you'll see:
```
┌─────────────────────────┐
│                         │
│     💼 (Large Icon)     │
│                         │
│   Expense Tracker       │
│                         │
│      ⏳ Loading...      │
│                         │
└─────────────────────────┘
```

The app checks if you're logged in. After 1-2 seconds, navigates to Login.

---

**Screen 2: Login Screen**

What you'll see:
```
┌─────────────────────────┐
│         ← Back          │
│                         │
│     💼 (Icon)           │
│                         │
│   Welcome Back!         │
│ Login to manage your    │
│      expenses           │
│                         │
│ ┌─────────────────────┐ │
│ │ 📧 Email            │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ 🔒 Password    👁    │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │      Login          │ │
│ └─────────────────────┘ │
│                         │
│ Don't have an account?  │
│      Register           │
└─────────────────────────┘
```

Try logging in with the user you created earlier.

---

**Screen 3: Register Screen** (if you tap Register)

What you'll see:
```
┌─────────────────────────┐
│    ← Register           │
│                         │
│ ┌─────────────────────┐ │
│ │ 📧 Email            │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ 👤 Username         │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ 📛 First Name       │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ 📛 Last Name        │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ 🔒 Password    👁    │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ 🔒 Confirm Pass 👁   │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │     Register        │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

---

**Screen 4: Dashboard (After Login)**

What you'll see:
```
┌─────────────────────────┐
│  Dashboard         ⚙️   │
├─────────────────────────┤
│                         │
│  Welcome, John!         │
│                         │
│ ┌──────────┬──────────┐ │
│ │ Expenses │  Income  │ │
│ │  📈      │   📉     │ │
│ │  $0.00   │  $0.00   │ │
│ └──────────┴──────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │     Balance         │ │
│ │     💰              │ │
│ │     $0.00           │ │
│ └─────────────────────┘ │
│                         │
│  Quick Actions          │
│                         │
│ ┌──────────┬──────────┐ │
│ │➕ Add    │📋 View   │ │
│ │ Expense  │Expenses  │ │
│ └──────────┴──────────┘ │
│                         │
└─────────────────────────┘
```

---

**Screen 5: Settings Page** (Tap ⚙️)

What you'll see:
```
┌─────────────────────────┐
│    ← Settings           │
├─────────────────────────┤
│                         │
│  👤  John Doe           │
│      user@example.com   │
│                    →    │
│                         │
├─────────────────────────┤
│                         │
│  🌐  Language           │
│      English            │
│                    →    │
│                         │
│  💱  Currency           │
│      USD                │
│                    →    │
│                         │
│  🔔  Notifications      │
│      Budget Alerts   ⚪️ │
│                         │
│  🌙  Dark Mode       ⚪️ │
│                         │
├─────────────────────────┤
│                         │
│  ℹ️   About          →  │
│                         │
│  🚪  Logout (red)       │
│                         │
└─────────────────────────┘
```

---

**Screen 6: Language Switcher** (Tap Language)

What you'll see:
```
┌─────────────────────────┐
│   Change Language       │
├─────────────────────────┤
│                         │
│  ⚪️  English            │
│                         │
│  ⚫️  Arabic             │
│                         │
└─────────────────────────┘
```

Tap "Arabic" and watch the entire UI change!

---

**Screen 7: Dashboard in Arabic** (RTL Layout)

What you'll see:
```
┌─────────────────────────┐
│   ⚙️         لوحة التحكم │
├─────────────────────────┤
│                         │
│         !مرحبا، جون     │
│                         │
│ ┌──────────┬──────────┐ │
│ │  الدخل   │المصروفات│ │
│ │   📉     │    📈    │ │
│ │  $0.00   │  $0.00   │ │
│ └──────────┴──────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │      الرصيد         │ │
│ │       💰            │ │
│ │      $0.00          │ │
│ └─────────────────────┘ │
│                         │
│        إجراءات سريعة    │
│                         │
│ ┌──────────┬──────────┐ │
│ │  عرض    │➕ إضافة  │ │
│ │المصروفات│  مصروف   │ │
│ └──────────┴──────────┘ │
│                         │
└─────────────────────────┘
```

Notice:
- All text is in Arabic
- Layout is Right-to-Left
- Icons and buttons are mirrored
- Settings icon now on the left

---

**Screen 8: Settings in Arabic**

What you'll see:
```
┌─────────────────────────┐
│         الإعدادات    ← │
├─────────────────────────┤
│                         │
│         جون دو    👤    │
│  user@example.com       │
│    ←                    │
│                         │
├─────────────────────────┤
│                         │
│          اللغة    🌐    │
│         العربية         │
│    ←                    │
│                         │
│         العملة    💱    │
│          USD            │
│    ←                    │
│                         │
│  ⚪️  تنبيهات الميزانية │
│       الإشعارات    🔔  │
│                         │
│  ⚪️     الوضع الداكن 🌙 │
│                         │
├─────────────────────────┤
│                         │
│  ←          حول    ℹ️   │
│                         │
│    تسجيل الخروج (red) 🚪 │
│                         │
└─────────────────────────┘
```

## Part 3: Testing Key Features

### Test 1: Create Expense via API

```bash
# Get your access token from login response
TOKEN="your_access_token_here"

# Create an expense
curl -X POST http://localhost:8000/api/v1/expenses/expenses/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "75.50",
    "currency": 1,
    "category": 2,
    "description": "Gas for car",
    "date": "2025-11-04",
    "payment_method": "debit_card"
  }'
```

### Test 2: View Dashboard Analytics

```bash
curl http://localhost:8000/api/v1/analytics/dashboard/?period=month \
  -H "Authorization: Bearer $TOKEN"
```

Response:
```json
{
  "period": "month",
  "start_date": "2025-11-01",
  "end_date": "2025-11-30",
  "expenses": {
    "total": 121.49,
    "count": 2
  },
  "income": {
    "total": 0,
    "count": 0
  },
  "net_balance": -121.49,
  "active_budgets": 0
}
```

### Test 3: Create a Budget

```bash
curl -X POST http://localhost:8000/api/v1/budgets/budgets/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Monthly Food Budget",
    "amount": "500.00",
    "currency": 1,
    "period": "monthly",
    "start_date": "2025-11-01",
    "end_date": "2025-11-30",
    "category": 1,
    "alert_threshold": "80.00"
  }'
```

### Test 4: Get Budget Progress

```bash
curl http://localhost:8000/api/v1/budgets/budgets/1/progress/ \
  -H "Authorization: Bearer $TOKEN"
```

Response:
```json
{
  "budget_id": 1,
  "name": "Monthly Food Budget",
  "amount": "500.00",
  "spent_amount": "45.99",
  "remaining_amount": "454.01",
  "percentage_used": 9.198,
  "is_exceeded": false,
  "is_alert_threshold_reached": false
}
```

## Part 4: Visual Demo Screenshots

### English Version Flow
```
Splash → Login → Dashboard → Settings
   ↓        ↓        ↓          ↓
Loading  Enter     Welcome   Change
         Creds     John!     Language
```

### Arabic Version Flow
```
شاشة البداية → تسجيل الدخول → لوحة التحكم → الإعدادات
      ↓              ↓              ↓             ↓
    تحميل      إدخال البيانات   !مرحبا جون   تغيير اللغة
```

## Part 5: Advanced Testing

### Test Multi-Currency

```bash
# Create expense in EUR
curl -X POST http://localhost:8000/api/v1/expenses/expenses/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "50.00",
    "currency": 2,
    "category": 3,
    "description": "Shopping in Paris",
    "date": "2025-11-04",
    "payment_method": "credit_card"
  }'
```

### Test Category Analysis

```bash
curl "http://localhost:8000/api/v1/analytics/category-analysis/?period=month" \
  -H "Authorization: Bearer $TOKEN"
```

### Test Export

```bash
# Export expenses to CSV
curl "http://localhost:8000/api/v1/analytics/export/expenses/?format=csv&period=month" \
  -H "Authorization: Bearer $TOKEN" \
  -o expenses.csv

# Export to PDF report
curl "http://localhost:8000/api/v1/analytics/export/report/?period=month" \
  -H "Authorization: Bearer $TOKEN" \
  -o report.pdf
```

## Troubleshooting

### Backend Not Starting
```bash
# Check if PostgreSQL is running
pg_isready

# Check Django logs
python manage.py check
```

### Mobile Can't Connect
```bash
# Make sure backend is accessible
curl http://YOUR_IP:8000/api/v1/categories/categories/

# Check firewall isn't blocking port 8000
```

### Translations Not Showing
```bash
# Regenerate localization files
cd mobile
flutter pub get
flutter gen-l10n
flutter run
```

## Summary

You now have:
- ✅ Backend API running on http://localhost:8000
- ✅ Admin panel at http://localhost:8000/admin
- ✅ API docs at http://localhost:8000/api/docs/
- ✅ Mobile app with English & Arabic
- ✅ Language switcher working
- ✅ RTL layout for Arabic
- ✅ 10 currencies loaded
- ✅ 23 categories loaded

Enjoy exploring your multilingual expense tracker! 🎉
