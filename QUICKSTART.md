# 🚀 Quick Start - 5 Minutes to Demo!

## The Fastest Way to See the Demo

### Backend (2 minutes)

```bash
cd backend

# Run the automated setup script
./setup_demo.sh

# Start the server
source venv/bin/activate  # if not already activated
python manage.py runserver
```

**✅ Backend is now running!**
- Admin: http://localhost:8000/admin/
- API Docs: http://localhost:8000/api/docs/

### Mobile (3 minutes)

```bash
cd mobile

# Run the automated setup script
./setup_demo.sh

# Update API URL (script will show your IP)
# Edit: lib/core/constants/app_constants.dart
# Change: baseUrl = 'http://YOUR_IP:8000'

# Run the app
flutter run
```

**✅ Mobile app is now running!**

## What You'll See

### 1. Login Screen (English)
```
┌─────────────────────────────────┐
│                                 │
│          💼 (Icon)              │
│                                 │
│       Welcome Back!             │
│  Login to manage your expenses  │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 📧 Email                │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🔒 Password        👁   │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │        Login            │   │
│  └─────────────────────────┘   │
│                                 │
│   Don't have an account?        │
│          Register               │
│                                 │
└─────────────────────────────────┘
```

### 2. Register & Create Account
```
Register → Enter details → Success!
  → "Registration successful! Please login."
```

### 3. Dashboard (After Login)
```
┌─────────────────────────────────┐
│  Dashboard              ⚙️      │
├─────────────────────────────────┤
│                                 │
│  Welcome, John!                 │
│                                 │
│  ┌────────────┬────────────┐   │
│  │  Expenses  │   Income   │   │
│  │    📈      │     📉     │   │
│  │   $0.00    │   $0.00    │   │
│  └────────────┴────────────┘   │
│                                 │
│  ┌───────────────────────┐     │
│  │      Balance          │     │
│  │        💰             │     │
│  │       $0.00           │     │
│  └───────────────────────┘     │
│                                 │
│   Quick Actions                 │
│                                 │
│  ┌────────────┬────────────┐   │
│  │  ➕ Add    │  📋 View   │   │
│  │  Expense   │  Expenses  │   │
│  └────────────┴────────────┘   │
│                                 │
└─────────────────────────────────┘
```

### 4. Switch to Arabic
```
Tap ⚙️ → Language → العربية
```

### 5. Dashboard (Arabic - RTL)
```
┌─────────────────────────────────┐
│      ⚙️              لوحة التحكم │
├─────────────────────────────────┤
│                                 │
│              !مرحبا، جون        │
│                                 │
│  ┌────────────┬────────────┐   │
│  │   الدخل    │ المصروفات │   │
│  │     📉     │     📈     │   │
│  │   $0.00    │   $0.00    │   │
│  └────────────┴────────────┘   │
│                                 │
│  ┌───────────────────────┐     │
│  │       الرصيد          │     │
│  │         💰            │     │
│  │       $0.00           │     │
│  └───────────────────────┘     │
│                                 │
│              إجراءات سريعة      │
│                                 │
│  ┌────────────┬────────────┐   │
│  │   عرض     │ ➕ إضافة   │   │
│  │ المصروفات │   مصروف    │   │
│  └────────────┴────────────┘   │
│                                 │
└─────────────────────────────────┘
```

**Notice:**
- Everything is in Arabic ✅
- Right-to-Left layout ✅
- Icons mirrored ✅
- Settings moved to left ✅

## Test the API

### Quick API Test
```bash
# Register a user
curl -X POST http://localhost:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "username": "demo",
    "password": "Demo123!",
    "password_confirm": "Demo123!",
    "first_name": "Demo",
    "last_name": "User",
    "default_currency": "USD"
  }'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@example.com", "password": "Demo123!"}'

# View categories (23 pre-loaded)
curl http://localhost:8000/api/v1/categories/categories/
```

## What's Pre-Loaded?

After running `setup_demo.sh`:

**✅ 10 Currencies:**
- USD, EUR, GBP, JPY, INR
- AED, SAR, EGP (Middle East)
- CAD, AUD

**✅ 23 Categories:**

**Expense Categories:**
1. 🍔 Food & Dining
2. 🚗 Transportation
3. 🛍️ Shopping
4. 🎬 Entertainment
5. 🏥 Healthcare
6. 💡 Bills & Utilities
7. 📚 Education
8. 🏠 Housing
9. 💇 Personal Care
10. ✈️ Travel
11. 🛡️ Insurance
12. 🎁 Gifts & Donations
13. 💪 Fitness
14. 🐾 Pets
15. 📝 Other Expenses

**Income Categories:**
1. 💰 Salary
2. 💼 Freelance
3. 🏢 Business
4. 📈 Investments
5. 🏡 Rental Income
6. 🎁 Gifts Received
7. 💵 Refunds
8. 💸 Other Income

## Features to Try

### In the Mobile App:
1. ✅ **Register** a new account
2. ✅ **Login** with credentials
3. ✅ **Switch language** (Settings → Language → Arabic)
4. ✅ See **RTL layout** automatically
5. ✅ **Logout** and login again

### Via API (Browser/Swagger):
1. ✅ Visit http://localhost:8000/api/docs/
2. ✅ Try the **Register** endpoint
3. ✅ Try the **Login** endpoint
4. ✅ Copy the access token
5. ✅ Click "Authorize" button
6. ✅ Paste token
7. ✅ Try any endpoint (e.g., Get Categories)

### In Admin Panel:
1. ✅ Visit http://localhost:8000/admin/
2. ✅ Login with superuser
3. ✅ View **Users**
4. ✅ View **Categories** (23 items)
5. ✅ View **Currencies** (10 items)

## Next Steps

Want to explore more? Check out:

- **DEMO_GUIDE.md** - Detailed step-by-step walkthrough
- **README_I18N.md** - Complete internationalization guide
- **README.md** - Full project documentation

## Troubleshooting

**Backend won't start?**
```bash
# Check PostgreSQL
pg_isready

# Check database exists
psql -l | grep expense_tracking
```

**Mobile can't connect?**
```bash
# Make sure you updated the IP in:
# lib/core/constants/app_constants.dart

# Test connection:
curl http://YOUR_IP:8000/api/docs/
```

**Translations not working?**
```bash
cd mobile
flutter clean
flutter pub get
flutter gen-l10n
flutter run
```

---

**That's it! You're ready to explore! 🎉**

The app is fully functional with:
- ✅ English & Arabic languages
- ✅ RTL support
- ✅ JWT authentication
- ✅ 10 currencies
- ✅ 23 categories
- ✅ Clean architecture
- ✅ REST API with Swagger docs
