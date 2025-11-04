# MoneyGuard - Personal Expense Tracking App

**Track Smart. Save Smarter.**

MoneyGuard is a production-ready, full-stack expense tracking application with a Django REST Framework backend and React Native mobile app for Android and iOS.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Python](https://img.shields.io/badge/python-3.11-green.svg)
![Django](https://img.shields.io/badge/django-4.2-green.svg)
![React Native](https://img.shields.io/badge/react--native-0.73-blue.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 📱 Features

### Core Functionality
- ✅ **Manual Expense Tracking** - Record income and expenses with categories
- ✅ **Multiple Accounts** - Manage checking, savings, credit cards, cash accounts
- ✅ **Budget Management** - Set spending limits by category with alerts
- ✅ **Recurring Transactions** - Automate recurring bills and income
- ✅ **Financial Reports** - Monthly/yearly reports with category breakdowns
- ✅ **Receipt Attachments** - Upload and store receipt photos
- ✅ **Multi-Currency Support** - Basic support for multiple currencies
- ✅ **Data Export** - Export transactions to CSV/PDF (Pro feature)
- ✅ **Email Summaries** - Daily/weekly financial summaries

### Monetization
- 🆓 **Free Tier**: Basic tracking + banner ads
- 💎 **Pro Subscription ($4.99/month)**: No ads + cloud sync + unlimited exports + advanced insights

### Platforms
- 📱 **Android** - Android 6.0+ (API 23+)
- 🍎 **iOS** - iOS 12.0+
- 🌐 **Web API** - RESTful API with OpenAPI/Swagger docs

## 🏗️ Architecture

### Backend Stack
- **Framework**: Django 4.2 + Django REST Framework
- **Database**: PostgreSQL 15
- **Cache/Queue**: Redis 7
- **Task Queue**: Celery with Beat scheduler
- **Payments**: Stripe for subscriptions
- **Ads**: Google AdMob (mobile)
- **Storage**: Local/S3 for attachments
- **Monitoring**: Sentry integration

### Mobile Stack
- **Framework**: React Native 0.73 with TypeScript
- **Navigation**: React Navigation 6
- **State Management**: React Query + Context API
- **UI Components**: React Native Paper (Material Design 3)
- **Storage**: React Native Keychain (secure) + AsyncStorage
- **Payments**: Stripe + Google Play Billing + Apple In-App Purchase (stubs)
- **Ads**: Google Mobile Ads SDK

## 🚀 Quick Start

### Prerequisites
- **Backend**: Python 3.11+, PostgreSQL 15+, Redis 7+
- **Mobile**: Node.js 18+, npm/yarn, Android Studio or Xcode
- **Tools**: Docker & docker-compose (recommended)

### Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/moneyguard.git
cd moneyguard

# Start all services
./scripts/start_local.sh

# Access the application
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/api/docs/
# Django Admin: http://localhost:8000/admin/
```

### Manual Setup

#### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
# Edit .env with your configuration

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver

# In separate terminals, start Celery
celery -A moneyguard worker -l info
celery -A moneyguard beat -l info
```

#### Mobile Setup

```bash
cd mobile

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your backend URL

# Start Metro bundler
npm start

# In another terminal, run on Android
npm run android

# Or run on iOS (macOS only)
npm run ios
```

## 📁 Project Structure

```
expense_tracking/
├── backend/                    # Django REST API
│   ├── moneyguard/            # Main project settings
│   │   ├── settings/          # Split settings (dev, prod, test)
│   │   ├── celery.py          # Celery configuration
│   │   ├── urls.py            # URL routing
│   │   └── utils.py           # Utility functions
│   ├── users/                 # User authentication & profiles
│   ├── finance/               # Accounts, transactions, budgets
│   ├── billing/               # Stripe & in-app purchases
│   ├── exports/               # CSV/PDF exports
│   ├── notifications/         # Email notifications
│   ├── requirements.txt       # Python dependencies
│   ├── Dockerfile             # Docker configuration
│   └── manage.py              # Django management
├── mobile/                     # React Native app
│   ├── src/
│   │   ├── screens/           # App screens
│   │   ├── components/        # Reusable components
│   │   ├── navigation/        # Navigation setup
│   │   ├── services/          # API & storage services
│   │   ├── context/           # React contexts
│   │   ├── hooks/             # Custom hooks
│   │   ├── utils/             # Utilities
│   │   └── types/             # TypeScript types
│   ├── android/               # Android native code
│   ├── ios/                   # iOS native code
│   ├── package.json           # Node dependencies
│   └── tsconfig.json          # TypeScript config
├── docker-compose.yml         # Docker services
├── .github/workflows/ci.yml   # CI/CD pipeline
├── scripts/                   # Utility scripts
├── PRIVACY_POLICY.md          # Privacy policy
├── TERMS_OF_SERVICE.md        # Terms of service
└── README.md                  # This file
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
# Django
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=your-domain.com

# Database
DATABASE_URL=postgresql://user:password@host:port/dbname

# Redis
REDIS_URL=redis://localhost:6379/0

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-password

# Sentry (optional)
SENTRY_DSN=https://...@sentry.io/...
```

#### Mobile (.env)
```bash
API_URL=https://api.yourapp.com
ADMOB_ANDROID_APP_ID=ca-app-pub-...
ADMOB_IOS_APP_ID=ca-app-pub-...
ADMOB_BANNER_AD_UNIT_ID_ANDROID=ca-app-pub-.../...
ADMOB_BANNER_AD_UNIT_ID_IOS=ca-app-pub-.../...
```

## 🧪 Testing

### Backend Tests
```bash
cd backend

# Run all tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html

# Run specific app tests
pytest users/tests/
pytest finance/tests/
```

### Mobile Tests
```bash
cd mobile

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

## 📊 API Documentation

Once the backend is running, access the interactive API documentation:

- **Swagger UI**: http://localhost:8000/api/docs/
- **OpenAPI Schema**: http://localhost:8000/api/schema/

### Key Endpoints

#### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/token/` - Login (get JWT tokens)
- `POST /api/auth/token/refresh/` - Refresh access token
- `GET /api/auth/me/` - Get user profile

#### Finance
- `GET /api/finance/accounts/` - List accounts
- `GET /api/finance/transactions/` - List transactions (with filters)
- `POST /api/finance/transactions/` - Create transaction
- `GET /api/finance/budgets/` - List budgets
- `GET /api/finance/reports/monthly/` - Monthly report

#### Billing
- `POST /api/billing/checkout/` - Create Stripe checkout session
- `POST /api/billing/webhook/` - Stripe webhook handler
- `GET /api/billing/status/` - Get subscription status

#### Exports
- `POST /api/exports/create/` - Create export job
- `GET /api/exports/<id>/` - Get export status

## 🚢 Deployment

### Backend Deployment

#### Heroku
```bash
# Create Heroku app
heroku create your-app-name

# Add PostgreSQL and Redis
heroku addons:create heroku-postgresql:mini
heroku addons:create heroku-redis:mini

# Set environment variables
heroku config:set SECRET_KEY=your-secret-key
heroku config:set DJANGO_SETTINGS_MODULE=moneyguard.settings.production

# Deploy
git push heroku main

# Run migrations
heroku run python manage.py migrate

# Create superuser
heroku run python manage.py createsuperuser
```

#### AWS/GCP
See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### Mobile Deployment

#### Android (Google Play)
```bash
cd mobile/android

# Generate release keystore (first time only)
keytool -genkeypair -v -storetype PKCS12 -keystore release.keystore -alias release -keyalg RSA -keysize 2048 -validity 10000

# Build release APK
./gradlew assembleRelease

# Build AAB (for Play Store)
./gradlew bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab
```

#### iOS (App Store)
```bash
cd mobile/ios

# Install pods
pod install

# Open in Xcode
open MoneyGuard.xcworkspace

# Build for release (Xcode: Product > Archive)
```

## 🔐 Security

### Security Features
- ✅ HTTPS enforced in production
- ✅ JWT token authentication with refresh
- ✅ Rate limiting on all API endpoints
- ✅ CORS protection
- ✅ CSRF protection
- ✅ SQL injection prevention (Django ORM)
- ✅ XSS protection
- ✅ Password hashing (bcrypt)
- ✅ Secure headers (HSTS, CSP, etc.)
- ✅ Input validation and sanitization
- ✅ Brute force protection (django-axes)
- ✅ Generic error messages (no information disclosure)

### Privacy Compliance
- ✅ GDPR compliant (EU)
- ✅ CCPA compliant (California)
- ✅ COPPA compliant (children's privacy)
- ✅ No data selling
- ✅ User data export/deletion
- ✅ Encryption at rest and in transit

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style
- **Python**: Follow PEP 8, use Black formatter
- **TypeScript**: Follow ESLint rules, use Prettier
- **Commits**: Use conventional commits (feat:, fix:, docs:, etc.)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Django and Django REST Framework teams
- React Native community
- Stripe for payment processing
- Google AdMob for monetization

## 📞 Support

- **Email**: support@moneyguard.com
- **Issues**: [GitHub Issues](https://github.com/yourusername/moneyguard/issues)
- **Documentation**: [Wiki](https://github.com/yourusername/moneyguard/wiki)

## 🗺️ Roadmap

- [ ] Social login (Google, Apple, Facebook)
- [ ] Bank account sync (Plaid integration)
- [ ] Investment tracking
- [ ] Bill reminders and notifications
- [ ] Shared budgets (family accounts)
- [ ] Web app (React)
- [ ] Desktop app (Electron)
- [ ] AI-powered insights and predictions
- [ ] Receipt OCR for automatic categorization

---

**Built with ❤️ by the MoneyGuard Team**

*Take control of your finances today!*
