# Advanced Expense Tracking Application

A full-featured expense tracking application with Django/DRF backend and Flutter mobile app, following clean architecture principles.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Internationalization](#internationalization)
- [Project Structure](#project-structure)
- [Backend Setup](#backend-setup)
- [Mobile App Setup](#mobile-app-setup)
- [API Documentation](#api-documentation)
- [Architecture](#architecture)
- [Development Guide](#development-guide)

## ✨ Features

### Backend Features
- ✅ JWT Authentication & User Management
- ✅ **Full Internationalization (i18n)** - Arabic & English Support
- ✅ Expense & Income Tracking
- ✅ **Multi-currency Support** (USD, EUR, GBP, AED, SAR, EGP, etc.)
- ✅ Category Management (with hierarchies)
- ✅ **Management Commands** for easy setup
- ✅ Budget Management with Alerts
- ✅ Recurring Transactions
- ✅ Shared Expenses (Split Bills)
- ✅ Receipt Image Uploads
- ✅ Tags & Custom Categories
- ✅ Analytics & Reporting
- ✅ Data Export (CSV, Excel, PDF)
- ✅ Advanced Filtering & Search

### Mobile App Features
- ✅ Clean Architecture with BLoC
- ✅ JWT Authentication (Login, Register, Logout)
- ✅ **Full Bilingual Support** - English & Arabic with RTL
- ✅ **Dynamic Language Switching** with Settings Page
- ✅ Dashboard with Overview
- ✅ **Locale Management** with Persistent Storage
- ✅ Modern Material Design 3 UI
- ✅ Dark Theme Support
- 🚧 Complete Expense Management
- 🚧 Budget Tracking with Charts
- 🚧 Analytics & Visualizations
- 🚧 Offline Support with Sync
- 🚧 Push Notifications
- 🚧 Camera Integration for Receipts

## 🛠 Tech Stack

### Backend
- **Framework:** Django 4.2 + Django REST Framework
- **Database:** PostgreSQL
- **Authentication:** JWT (Simple JWT)
- **Internationalization:** Django i18n with middleware
- **Task Queue:** Celery + Redis
- **Storage:** AWS S3 (optional)
- **Documentation:** drf-spectacular (OpenAPI/Swagger)

### Mobile
- **Framework:** Flutter 3.x
- **State Management:** BLoC Pattern
- **Localization:** flutter_localizations with ARB files
- **Languages:** English & Arabic (with RTL support)
- **Dependency Injection:** GetIt + Injectable
- **API Client:** Dio + Retrofit
- **Local Storage:** Hive + Shared Preferences
- **Routing:** GoRouter
- **Charts:** FL Chart

## 🌍 Internationalization

This application supports **full bilingual functionality**:

### Features
- ✅ **English & Arabic** languages
- ✅ **RTL (Right-to-Left)** support for Arabic
- ✅ **Dynamic language switching** without app restart
- ✅ **Persistent language preference**
- ✅ **100+ translated strings** covering all features
- ✅ **Settings page** for easy language management
- ✅ **Backend i18n** with Django middleware
- ✅ **Management commands** for multilingual data setup

### Quick Language Switch
Users can change the app language from:
- **Settings Page** → Language → Select English or Arabic
- Changes apply immediately
- Preference persists across app restarts

For detailed internationalization guide, see **[README_I18N.md](README_I18N.md)**

## 📁 Project Structure

```
expense_tracking/
├── backend/
│   ├── apps/
│   │   ├── authentication/     # User auth & management
│   │   ├── categories/         # Categories & tags
│   │   ├── expenses/          # Expenses, income, recurring
│   │   ├── budgets/           # Budget management
│   │   └── analytics/         # Reports & analytics
│   ├── config/                # Django settings
│   ├── core/                  # Shared utilities
│   ├── requirements.txt
│   └── manage.py
└── mobile/
    └── lib/
        ├── core/
        │   ├── di/            # Dependency injection
        │   ├── network/       # API client
        │   ├── storage/       # Local storage
        │   ├── theme/         # App theme
        │   └── router/        # Navigation
        └── features/
            ├── authentication/
            │   ├── domain/    # Entities, repositories, use cases
            │   ├── data/      # Models, data sources
            │   └── presentation/  # BLoC, UI
            ├── home/
            ├── expenses/
            └── budgets/
```

## 🚀 Backend Setup

### Prerequisites
- Python 3.10+
- PostgreSQL 14+
- Redis (for Celery)

### Installation

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Create virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Create PostgreSQL database:**
```bash
createdb expense_tracking
```

5. **Configure environment variables:**
```bash
cp .env.example .env
```

Edit `.env` and update:
```env
DEBUG=True
SECRET_KEY=your-secret-key-here
DB_NAME=expense_tracking
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432
```

6. **Run migrations:**
```bash
python manage.py makemigrations
python manage.py migrate
```

7. **Create superuser:**
```bash
python manage.py createsuperuser
```

8. **Load default currencies (optional):**
```bash
python manage.py shell
```
```python
from apps.expenses.models import Currency

currencies = [
    {"code": "USD", "name": "US Dollar", "symbol": "$", "exchange_rate_to_usd": 1.0},
    {"code": "EUR", "name": "Euro", "symbol": "€", "exchange_rate_to_usd": 1.1},
    {"code": "GBP", "name": "British Pound", "symbol": "£", "exchange_rate_to_usd": 1.3},
    {"code": "JPY", "name": "Japanese Yen", "symbol": "¥", "exchange_rate_to_usd": 0.0091},
    {"code": "INR", "name": "Indian Rupee", "symbol": "₹", "exchange_rate_to_usd": 0.012},
]

for curr in currencies:
    Currency.objects.get_or_create(**curr)
```

9. **Load default categories (optional):**
```python
from apps.categories.models import Category

default_categories = [
    {"name": "Food & Dining", "type": "expense", "icon": "🍔", "color": "#EF4444", "is_system_default": True},
    {"name": "Transportation", "type": "expense", "icon": "🚗", "color": "#F59E0B", "is_system_default": True},
    {"name": "Shopping", "type": "expense", "icon": "🛍️", "color": "#EC4899", "is_system_default": True},
    {"name": "Entertainment", "type": "expense", "icon": "🎬", "color": "#8B5CF6", "is_system_default": True},
    {"name": "Healthcare", "type": "expense", "icon": "🏥", "color": "#10B981", "is_system_default": True},
    {"name": "Bills & Utilities", "type": "expense", "icon": "💡", "color": "#6366F1", "is_system_default": True},
    {"name": "Salary", "type": "income", "icon": "💰", "color": "#10B981", "is_system_default": True},
    {"name": "Freelance", "type": "income", "icon": "💼", "color": "#14B8A6", "is_system_default": True},
]

for cat in default_categories:
    Category.objects.get_or_create(**cat)
```

10. **Run development server:**
```bash
python manage.py runserver
```

The backend will be available at `http://localhost:8000`

### API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/api/docs/`
- OpenAPI Schema: `http://localhost:8000/api/schema/`
- Admin Panel: `http://localhost:8000/admin/`

## 📱 Mobile App Setup

### Prerequisites
- Flutter SDK 3.x
- Android Studio / Xcode
- Android SDK / iOS SDK

### Installation

1. **Navigate to mobile directory:**
```bash
cd mobile
```

2. **Install dependencies:**
```bash
flutter pub get
```

3. **Generate code (for json_serializable, etc.):**
```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

4. **Update API base URL:**

Edit `lib/core/constants/app_constants.dart`:
```dart
static const String baseUrl = 'http://YOUR_IP:8000';  // Use your machine's IP
```

5. **Run the app:**
```bash
# For Android
flutter run

# For iOS
flutter run -d ios

# For specific device
flutter devices  # List devices
flutter run -d <device-id>
```

## 🏗 Architecture

### Backend Architecture

The backend follows **Clean Architecture** principles with clear separation of concerns:

```
apps/
└── <feature>/
    ├── models.py           # Domain entities
    ├── serializers.py      # Data transformation
    ├── views.py           # Presentation layer
    ├── urls.py            # Routing
    ├── admin.py           # Admin interface
    └── services.py        # Business logic (where applicable)
```

**Key Principles:**
- **Domain Layer:** Models represent business entities
- **Data Layer:** Serializers handle data transformation
- **Presentation Layer:** Views/ViewSets handle HTTP requests
- **Business Logic:** Services layer for complex operations

### Mobile Architecture

The mobile app follows **Clean Architecture** with **BLoC** pattern:

```
features/
└── <feature>/
    ├── domain/
    │   ├── entities/      # Business objects
    │   ├── repositories/  # Abstract repository interfaces
    │   └── usecases/      # Business rules
    ├── data/
    │   ├── models/        # Data transfer objects
    │   ├── datasources/   # API & local data sources
    │   └── repositories/  # Repository implementations
    └── presentation/
        ├── bloc/          # State management
        ├── pages/         # UI screens
        └── widgets/       # Reusable UI components
```

**Key Principles:**
- **Domain Layer:** Pure Dart, no dependencies
- **Data Layer:** Implements repositories, handles data sources
- **Presentation Layer:** UI and state management
- **Dependency Rule:** Dependencies point inward

## 🔌 API Endpoints

### Authentication
```
POST   /api/v1/auth/register/         # Register new user
POST   /api/v1/auth/login/            # Login (get JWT tokens)
POST   /api/v1/auth/token/refresh/    # Refresh access token
GET    /api/v1/auth/profile/          # Get user profile
PATCH  /api/v1/auth/profile/          # Update profile
POST   /api/v1/auth/change-password/  # Change password
DELETE /api/v1/auth/delete-account/   # Delete account
```

### Expenses
```
GET    /api/v1/expenses/expenses/           # List expenses
POST   /api/v1/expenses/expenses/           # Create expense
GET    /api/v1/expenses/expenses/{id}/      # Get expense
PATCH  /api/v1/expenses/expenses/{id}/      # Update expense
DELETE /api/v1/expenses/expenses/{id}/      # Delete expense
GET    /api/v1/expenses/expenses/summary/   # Get summary
GET    /api/v1/expenses/expenses/recent/    # Recent expenses
```

### Income
```
GET    /api/v1/expenses/incomes/           # List incomes
POST   /api/v1/expenses/incomes/           # Create income
GET    /api/v1/expenses/incomes/{id}/      # Get income
PATCH  /api/v1/expenses/incomes/{id}/      # Update income
DELETE /api/v1/expenses/incomes/{id}/      # Delete income
GET    /api/v1/expenses/incomes/summary/   # Get summary
```

### Categories
```
GET    /api/v1/categories/categories/               # List categories
POST   /api/v1/categories/categories/               # Create category
GET    /api/v1/categories/categories/{id}/          # Get category
PATCH  /api/v1/categories/categories/{id}/          # Update category
DELETE /api/v1/categories/categories/{id}/          # Delete category
GET    /api/v1/categories/categories/system_defaults/  # System categories
```

### Budgets
```
GET    /api/v1/budgets/budgets/          # List budgets
POST   /api/v1/budgets/budgets/          # Create budget
GET    /api/v1/budgets/budgets/{id}/     # Get budget
PATCH  /api/v1/budgets/budgets/{id}/     # Update budget
DELETE /api/v1/budgets/budgets/{id}/     # Delete budget
GET    /api/v1/budgets/budgets/summary/  # Budget summary
GET    /api/v1/budgets/budgets/exceeded/ # Exceeded budgets
GET    /api/v1/budgets/alerts/           # Budget alerts
```

### Analytics
```
GET    /api/v1/analytics/dashboard/            # Dashboard data
GET    /api/v1/analytics/spending-trends/      # Spending trends
GET    /api/v1/analytics/category-analysis/    # Category breakdown
GET    /api/v1/analytics/income-vs-expense/    # Income vs expense
GET    /api/v1/analytics/export/expenses/      # Export expenses
GET    /api/v1/analytics/export/report/        # Generate PDF report
```

## 👨‍💻 Development Guide

### Adding a New Feature (Backend)

1. **Create models in `models.py`:**
```python
from core.models import TimeStampedModel

class MyModel(TimeStampedModel):
    # fields
    pass
```

2. **Create serializers in `serializers.py`:**
```python
from rest_framework import serializers

class MyModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = MyModel
        fields = '__all__'
```

3. **Create views in `views.py`:**
```python
from rest_framework import viewsets

class MyModelViewSet(viewsets.ModelViewSet):
    serializer_class = MyModelSerializer
    queryset = MyModel.objects.all()
```

4. **Add URLs in `urls.py`:**
```python
router.register(r'mymodel', MyModelViewSet)
```

5. **Run migrations:**
```bash
python manage.py makemigrations
python manage.py migrate
```

### Adding a New Feature (Mobile)

1. **Create domain layer** (entities, repository interface, use cases)
2. **Create data layer** (models, data sources, repository implementation)
3. **Create presentation layer** (BLoC, pages, widgets)
4. **Register dependencies** in `core/di/injection.dart`
5. **Add routes** in `core/router/app_router.dart`

### Running Tests

**Backend:**
```bash
python manage.py test
```

**Mobile:**
```bash
flutter test
```

### Code Generation (Mobile)

When you modify models or add new ones:
```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

## 🤝 Contributing

This is a template project. Feel free to customize and extend it for your needs!

### Next Steps for Full Implementation

1. **Mobile App:**
   - Complete expense management features
   - Implement budget tracking UI
   - Add analytics charts and visualizations
   - Implement offline support with sync
   - Add push notifications
   - Implement camera integration for receipts

2. **Backend:**
   - Add email verification
   - Implement password reset
   - Add social authentication (Google, Facebook)
   - Implement WebSocket for real-time updates
   - Add comprehensive test coverage
   - Set up CI/CD pipeline

3. **DevOps:**
   - Docker containerization
   - Kubernetes deployment
   - Monitoring and logging
   - Automated backups

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

Built with clean architecture principles and modern development practices.

---

**Happy Coding!** 🚀
