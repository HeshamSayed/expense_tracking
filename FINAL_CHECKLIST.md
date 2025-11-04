# MoneyGuard - Final Configuration Checklist

This checklist outlines all manual tasks that must be completed to fully configure and deploy the MoneyGuard application.

## 📋 Pre-Launch Checklist

### Backend Configuration

#### ✅ 1. Environment Variables
- [ ] Copy `backend/.env.example` to `backend/.env`
- [ ] Generate and set `SECRET_KEY` (50+ characters)
  ```bash
  python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
  ```
- [ ] Set `DEBUG=False` for production
- [ ] Configure `ALLOWED_HOSTS` with your domain(s)
- [ ] Set `DATABASE_URL` for PostgreSQL connection
- [ ] Set `REDIS_URL` for Redis connection

#### ✅ 2. Stripe Configuration
- [ ] Create Stripe account at https://stripe.com
- [ ] Get API keys from https://dashboard.stripe.com/apikeys
  - [ ] `STRIPE_SECRET_KEY` (sk_live_...)
  - [ ] `STRIPE_PUBLISHABLE_KEY` (pk_live_...)
- [ ] Create Pro subscription product in Stripe
- [ ] Get `STRIPE_PRO_PRICE_ID` from product page
- [ ] Set up webhook endpoint: `https://yourdomain.com/api/billing/webhook/`
- [ ] Get `STRIPE_WEBHOOK_SECRET` from webhook settings
- [ ] Configure webhook events:
  - [ ] `checkout.session.completed`
  - [ ] `invoice.payment_succeeded`
  - [ ] `invoice.payment_failed`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`

#### ✅ 3. Email Configuration
- [ ] Choose email provider (SendGrid, AWS SES, Gmail)
- [ ] Configure email settings in `.env`:
  - [ ] `EMAIL_HOST`
  - [ ] `EMAIL_PORT`
  - [ ] `EMAIL_HOST_USER`
  - [ ] `EMAIL_HOST_PASSWORD`
  - [ ] `DEFAULT_FROM_EMAIL`
- [ ] Verify email domain (if using SendGrid/SES)
- [ ] Test email sending

#### ✅ 4. Sentry (Error Tracking)
- [ ] Create Sentry account at https://sentry.io
- [ ] Create new project for MoneyGuard
- [ ] Copy DSN to `SENTRY_DSN` in `.env`
- [ ] Test error reporting

#### ✅ 5. Database Setup
- [ ] Provision PostgreSQL database (version 15+)
- [ ] Create database: `moneyguard`
- [ ] Create database user with permissions
- [ ] Update `DATABASE_URL` in `.env`
- [ ] Run migrations:
  ```bash
  python manage.py migrate
  ```
- [ ] Load default categories fixture:
  ```bash
  python manage.py loaddata default_categories
  ```
- [ ] Create superuser:
  ```bash
  python manage.py createsuperuser
  ```

#### ✅ 6. Redis Setup
- [ ] Provision Redis instance (version 7+)
- [ ] Update `REDIS_URL` in `.env`
- [ ] Test connection:
  ```bash
  redis-cli -h <host> -p <port> PING
  ```

#### ✅ 7. File Storage
**For Development:**
- [ ] Use local file storage (default)

**For Production:**
- [ ] Create S3 bucket: `moneyguard-media`
- [ ] Configure bucket CORS policy
- [ ] Create IAM user with S3 permissions
- [ ] Set AWS credentials in `.env`:
  - [ ] `AWS_ACCESS_KEY_ID`
  - [ ] `AWS_SECRET_ACCESS_KEY`
  - [ ] `AWS_STORAGE_BUCKET_NAME`
- [ ] Uncomment S3 settings in `settings/production.py`

#### ✅ 8. CORS Configuration
- [ ] Set `CORS_ALLOWED_ORIGINS` with your frontend URLs
- [ ] Include mobile app URLs if applicable

---

### Mobile App Configuration

#### ✅ 1. Environment Setup
- [ ] Copy `mobile/.env.example` to `mobile/.env`
- [ ] Set `API_URL` to your backend API URL
  - Development: `http://10.0.2.2:8000` (Android emulator)
  - Development: `http://localhost:8000` (iOS simulator)
  - Production: `https://api.yourapp.com`

#### ✅ 2. AdMob Setup
- [ ] Create AdMob account at https://admob.google.com
- [ ] Create new app in AdMob
- [ ] Get AdMob App ID
- [ ] Create ad units:
  - [ ] Banner ad unit
  - [ ] Interstitial ad unit
  - [ ] Rewarded ad unit
- [ ] Update `mobile/.env` with AdMob IDs:
  - [ ] `ADMOB_ANDROID_APP_ID`
  - [ ] `ADMOB_IOS_APP_ID`
  - [ ] `ADMOB_BANNER_AD_UNIT_ID_ANDROID`
  - [ ] `ADMOB_BANNER_AD_UNIT_ID_IOS`
- [ ] Update `android/app/build.gradle` (line 59-60) with real AdMob App ID
- [ ] Update `app.json` iOS section with AdMob App ID
- [ ] Configure ad content filtering in AdMob dashboard:
  - [ ] Block sensitive categories
  - [ ] Enable brand safety controls

#### ✅ 3. Android Configuration
- [ ] Update package name in:
  - [ ] `android/app/build.gradle` (applicationId)
  - [ ] `android/app/src/main/AndroidManifest.xml`
  - [ ] `app.json`
- [ ] Generate release signing key:
  ```bash
  keytool -genkeypair -v -storetype PKCS12 -keystore release.keystore -alias release -keyalg RSA -keysize 2048 -validity 10000
  ```
- [ ] Store keystore password securely (use environment variable or secrets manager)
- [ ] Configure signing in `android/app/build.gradle`
- [ ] Update app name in `android/app/src/main/res/values/strings.xml`

#### ✅ 4. iOS Configuration (macOS only)
- [ ] Update bundle identifier in Xcode
- [ ] Update app name in Info.plist
- [ ] Configure signing & capabilities in Xcode
- [ ] Add privacy usage descriptions:
  - [ ] Camera (for receipt photos)
  - [ ] Photo Library
  - [ ] Face ID/Touch ID (for biometric auth)

#### ✅ 5. Google Play Billing (Android)
- [ ] Create app in Google Play Console
- [ ] Set up in-app products:
  - [ ] Product ID: `pro_monthly`
  - [ ] Price: $4.99
  - [ ] Subscription period: 1 month
- [ ] Configure Play Billing in app
- [ ] Test with test accounts
- [ ] Implement server-side verification in `backend/billing/views.py::verify_in_app_purchase()`

#### ✅ 6. Apple In-App Purchase (iOS)
- [ ] Create app in App Store Connect
- [ ] Set up in-app purchase:
  - [ ] Product ID: `pro_monthly`
  - [ ] Price: $4.99
  - [ ] Subscription duration: 1 month
- [ ] Create shared secret for receipt validation
- [ ] Implement server-side verification in `backend/billing/views.py::verify_in_app_purchase()`

#### ✅ 7. App Icons & Splash Screen
- [ ] Generate app icons (1024x1024)
- [ ] Generate splash screen
- [ ] Add to `mobile/android/app/src/main/res/` directories
- [ ] Add to `mobile/ios/MoneyGuard/Images.xcassets/`

---

### Security & Compliance

#### ✅ 1. SSL/HTTPS Setup
- [ ] Obtain SSL certificate (Let's Encrypt, Cloudflare, or commercial)
- [ ] Configure HTTPS on server
- [ ] Force HTTPS redirect
- [ ] Verify SSL configuration (https://www.ssllabs.com/ssltest/)

#### ✅ 2. Privacy Policy & Terms
- [ ] Review `PRIVACY_POLICY.md` template
- [ ] Customize with your company information
- [ ] Add to website/app
- [ ] Host at: `https://yourapp.com/privacy`
- [ ] Review `TERMS_OF_SERVICE.md` template
- [ ] Customize with your company information
- [ ] Host at: `https://yourapp.com/terms`
- [ ] Add links to mobile app settings

#### ✅ 3. GDPR Compliance (EU users)
- [ ] Implement data export functionality (already built)
- [ ] Implement data deletion (already built)
- [ ] Add cookie consent banner (if web)
- [ ] Create data processing agreement
- [ ] Appoint Data Protection Officer (if required)

#### ✅ 4. COPPA Compliance (US users)
- [ ] Verify age gate (13+ requirement)
- [ ] Review app content for child safety
- [ ] Configure AdMob for child-directed treatment

---

### Testing

#### ✅ 1. Backend Testing
- [ ] Run all tests:
  ```bash
  cd backend
  pytest --cov=. --cov-report=html
  ```
- [ ] Verify >70% code coverage
- [ ] Test all API endpoints manually
- [ ] Test authentication flow
- [ ] Test subscription flow (Stripe test mode)
- [ ] Test exports (CSV/PDF)
- [ ] Test Celery tasks
- [ ] Test email notifications

#### ✅ 2. Mobile Testing
- [ ] Test on Android emulator
- [ ] Test on physical Android device
- [ ] Test on iOS simulator (macOS)
- [ ] Test on physical iOS device (macOS)
- [ ] Test authentication flow
- [ ] Test transaction CRUD
- [ ] Test budget creation and alerts
- [ ] Test ads display (free user)
- [ ] Test ads removal (Pro user)
- [ ] Test subscription upgrade
- [ ] Test offline mode
- [ ] Test image upload (receipts)

#### ✅ 3. Integration Testing
- [ ] Test end-to-end user flow:
  1. Register → Login
  2. Create account → Add transaction
  3. Set budget → Verify alert
  4. Upgrade to Pro → Verify no ads
  5. Export data → Download file
  6. Cancel subscription → Verify downgrade

---

### Deployment

#### ✅ 1. Backend Deployment
- [ ] Choose hosting provider (Heroku, AWS, GCP)
- [ ] Follow deployment guide in `DEPLOYMENT.md`
- [ ] Configure environment variables on server
- [ ] Run database migrations
- [ ] Collect static files
- [ ] Start Celery workers and beat
- [ ] Verify health check: `GET /health/`
- [ ] Verify API docs: `GET /api/docs/`

#### ✅ 2. Mobile Deployment - Android
- [ ] Build release APK/AAB:
  ```bash
  cd mobile/android
  ./gradlew bundleRelease
  ```
- [ ] Test release build on device
- [ ] Create Google Play Console account
- [ ] Complete store listing:
  - [ ] App title: "MoneyGuard - Expense Tracker"
  - [ ] Short description
  - [ ] Full description
  - [ ] Screenshots (5-8 images)
  - [ ] Feature graphic
  - [ ] App icon
- [ ] Set content rating (ESRB: Everyone)
- [ ] Set pricing (Free with in-app purchases)
- [ ] Upload AAB file
- [ ] Submit for review

#### ✅ 3. Mobile Deployment - iOS
- [ ] Build iOS archive in Xcode
- [ ] Test on TestFlight
- [ ] Create App Store Connect account
- [ ] Complete app information:
  - [ ] App title: "MoneyGuard - Expense Tracker"
  - [ ] Subtitle
  - [ ] Description
  - [ ] Keywords
  - [ ] Screenshots (required sizes)
  - [ ] App preview video (optional)
- [ ] Set age rating (4+)
- [ ] Set price (Free with in-app purchases)
- [ ] Upload build
- [ ] Submit for review

#### ✅ 4. CI/CD Setup
- [ ] Verify GitHub Actions workflows
- [ ] Set up deployment secrets
- [ ] Test automated deployments
- [ ] Configure branch protection rules

---

### Monitoring & Maintenance

#### ✅ 1. Monitoring Setup
- [ ] Configure Sentry alerts
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Configure server monitoring (New Relic, DataDog)
- [ ] Set up log aggregation (Papertrail, Loggly)
- [ ] Create status page (statuspage.io)

#### ✅ 2. Backup Configuration
- [ ] Enable database automated backups
- [ ] Test database restore procedure
- [ ] Enable S3 versioning (if using S3)
- [ ] Document backup and restore procedures

#### ✅ 3. Performance Optimization
- [ ] Enable database query caching
- [ ] Configure CDN for static files (Cloudflare, CloudFront)
- [ ] Enable Redis caching
- [ ] Optimize database indexes
- [ ] Enable gzip compression

---

### Marketing & Launch

#### ✅ 1. App Store Optimization (ASO)
- [ ] Research keywords
- [ ] Optimize app title and description
- [ ] Create compelling screenshots
- [ ] Add app preview video
- [ ] Localize for target markets

#### ✅ 2. Website
- [ ] Create landing page
- [ ] Add app download links
- [ ] Add privacy policy and terms
- [ ] Add FAQ section
- [ ] Set up analytics (Google Analytics)

#### ✅ 3. Social Media
- [ ] Create social media accounts
- [ ] Announce launch
- [ ] Share feature highlights
- [ ] Engage with users

---

## 📊 Post-Launch Checklist

### Week 1
- [ ] Monitor error rates in Sentry
- [ ] Review user feedback in app stores
- [ ] Check server performance metrics
- [ ] Verify payment processing
- [ ] Monitor ad revenue (AdMob dashboard)

### Week 2-4
- [ ] Analyze user retention
- [ ] Identify and fix critical bugs
- [ ] Respond to user reviews
- [ ] Plan first feature update
- [ ] Optimize conversion funnel

### Monthly
- [ ] Review analytics and KPIs
- [ ] Update dependencies
- [ ] Run security audit
- [ ] Optimize database performance
- [ ] Review and respond to feedback

---

## 🆘 Support Contacts

**Technical Issues:**
- Email: dev@moneyguard.com
- GitHub: https://github.com/yourusername/moneyguard/issues

**Business Inquiries:**
- Email: hello@moneyguard.com

**Security Issues:**
- Email: security@moneyguard.com

---

## 📝 Notes

### Important Reminders
- Never commit `.env` files to version control
- Keep API keys and passwords in secure storage
- Regularly update dependencies for security patches
- Monitor costs (server, database, storage, Stripe fees)
- Comply with app store guidelines
- Keep privacy policy and terms up to date

### Useful Commands
```bash
# Backend
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
celery -A moneyguard worker -l info
celery -A moneyguard beat -l info

# Mobile
npm install
npm start
npm run android
npm run ios
npm run build:android
npm run build:ios

# Docker
docker-compose up -d
docker-compose logs -f
docker-compose down
./scripts/start_local.sh

# Testing
pytest --cov=. --cov-report=html
npm test -- --coverage
```

---

**Checklist Complete! 🎉**

Once all items are checked, your MoneyGuard application is ready for production launch!

Good luck with your launch! 🚀
