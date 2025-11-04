# MoneyGuard Deployment Guide

Production deployment guide for MoneyGuard expense tracking application.

## Table of Contents

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Heroku Deployment](#heroku-deployment)
- [AWS Deployment](#aws-deployment)
- [Google Cloud Platform (GCP)](#google-cloud-platform-gcp)
- [Database Setup](#database-setup)
- [Redis Setup](#redis-setup)
- [File Storage (S3)](#file-storage-s3)
- [Email Configuration](#email-configuration)
- [Monitoring & Logging](#monitoring--logging)
- [CI/CD Setup](#cicd-setup)
- [Mobile App Deployment](#mobile-app-deployment)
- [Post-Deployment](#post-deployment)

---

## Pre-Deployment Checklist

### Security
- [ ] Generate strong `SECRET_KEY` (50+ characters)
- [ ] Set `DEBUG=False` in production
- [ ] Configure `ALLOWED_HOSTS` with your domain
- [ ] Set up HTTPS/SSL certificates
- [ ] Configure CORS with specific origins
- [ ] Review security headers (HSTS, CSP, etc.)
- [ ] Enable rate limiting
- [ ] Set up firewall rules

### Services
- [ ] PostgreSQL database provisioned
- [ ] Redis instance provisioned
- [ ] Stripe account configured (Live keys)
- [ ] AdMob account configured (Real ad unit IDs)
- [ ] Email service configured (SendGrid/AWS SES)
- [ ] Sentry account for error tracking
- [ ] Domain name purchased and configured

### Code
- [ ] All tests passing
- [ ] Code linting passed
- [ ] Database migrations generated
- [ ] Static files collected
- [ ] Environment variables documented

---

## Heroku Deployment

### 1. Install Heroku CLI
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows
# Download from https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login
```

### 2. Create Heroku App
```bash
cd backend

# Create app
heroku create moneyguard-api

# Add buildpack
heroku buildpacks:set heroku/python
```

### 3. Provision Add-ons
```bash
# PostgreSQL database
heroku addons:create heroku-postgresql:mini

# Redis
heroku addons:create heroku-redis:mini

# Papertrail for logging (optional)
heroku addons:create papertrail:choklad
```

### 4. Configure Environment Variables
```bash
# Django settings
heroku config:set DJANGO_SETTINGS_MODULE=moneyguard.settings.production
heroku config:set SECRET_KEY=$(python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')
heroku config:set ALLOWED_HOSTS=moneyguard-api.herokuapp.com

# Stripe
heroku config:set STRIPE_SECRET_KEY=sk_live_...
heroku config:set STRIPE_PUBLISHABLE_KEY=pk_live_...
heroku config:set STRIPE_WEBHOOK_SECRET=whsec_...
heroku config:set STRIPE_PRO_PRICE_ID=price_...

# Email (using SendGrid)
heroku addons:create sendgrid:starter
# SendGrid credentials auto-configured

# Sentry
heroku config:set SENTRY_DSN=https://...@sentry.io/...

# CORS
heroku config:set CORS_ALLOWED_ORIGINS=https://yourapp.com,https://www.yourapp.com
```

### 5. Create Procfile
```bash
# Already created at backend/Procfile
cat > Procfile << EOF
web: gunicorn moneyguard.wsgi:application --log-file -
worker: celery -A moneyguard worker --loglevel=info
beat: celery -A moneyguard beat --loglevel=info
EOF
```

### 6. Deploy
```bash
# Add remote
heroku git:remote -a moneyguard-api

# Deploy
git push heroku main

# Run migrations
heroku run python manage.py migrate

# Create superuser
heroku run python manage.py createsuperuser

# Collect static files
heroku run python manage.py collectstatic --noinput
```

### 7. Scale Workers
```bash
# Scale web dyno
heroku ps:scale web=1

# Scale Celery workers
heroku ps:scale worker=1 beat=1
```

### 8. Configure Domain
```bash
# Add custom domain
heroku domains:add api.moneyguard.com

# Get DNS target
heroku domains

# Add CNAME record in your DNS:
# api.moneyguard.com -> [heroku-dns-target]
```

### 9. Enable SSL
```bash
# Automatic SSL (requires paid dyno)
heroku certs:auto:enable
```

---

## AWS Deployment

### Architecture
- **Compute**: AWS Elastic Beanstalk or ECS
- **Database**: Amazon RDS (PostgreSQL)
- **Cache**: Amazon ElastiCache (Redis)
- **Storage**: Amazon S3
- **CDN**: Amazon CloudFront
- **Load Balancer**: Application Load Balancer

### 1. Setup AWS CLI
```bash
# Install AWS CLI
pip install awscli

# Configure credentials
aws configure
# Enter: Access Key ID, Secret Access Key, Region (us-east-1)
```

### 2. Create RDS Database
```bash
# Create PostgreSQL RDS instance
aws rds create-db-instance \
  --db-instance-identifier moneyguard-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.3 \
  --master-username moneyguard \
  --master-user-password YourStrongPassword123! \
  --allocated-storage 20 \
  --backup-retention-period 7 \
  --publicly-accessible

# Get endpoint
aws rds describe-db-instances \
  --db-instance-identifier moneyguard-db \
  --query 'DBInstances[0].Endpoint.Address'
```

### 3. Create ElastiCache Redis
```bash
# Create Redis cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id moneyguard-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1

# Get endpoint
aws elasticache describe-cache-clusters \
  --cache-cluster-id moneyguard-redis \
  --query 'CacheClusters[0].CacheNodes[0].Endpoint.Address'
```

### 4. Create S3 Bucket
```bash
# Create bucket for media files
aws s3 mb s3://moneyguard-media

# Set bucket policy (public read for images)
cat > bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::moneyguard-media/*"
  }]
}
EOF

aws s3api put-bucket-policy \
  --bucket moneyguard-media \
  --policy file://bucket-policy.json
```

### 5. Deploy with Elastic Beanstalk
```bash
# Install EB CLI
pip install awsebcli

# Initialize
cd backend
eb init -p python-3.11 moneyguard-api --region us-east-1

# Create environment
eb create moneyguard-prod \
  --instance-type t3.small \
  --scale 2

# Set environment variables
eb setenv \
  DJANGO_SETTINGS_MODULE=moneyguard.settings.production \
  SECRET_KEY="your-secret-key" \
  DATABASE_URL="postgresql://user:pass@rds-endpoint:5432/moneyguard" \
  REDIS_URL="redis://redis-endpoint:6379/0" \
  AWS_ACCESS_KEY_ID="..." \
  AWS_SECRET_ACCESS_KEY="..." \
  AWS_STORAGE_BUCKET_NAME="moneyguard-media"

# Deploy
eb deploy

# Open in browser
eb open
```

### 6. Setup Application Load Balancer
```bash
# ALB automatically created by EB
# Add HTTPS listener with ACM certificate

# Request SSL certificate
aws acm request-certificate \
  --domain-name api.moneyguard.com \
  --validation-method DNS

# Follow validation instructions
# Add HTTPS listener in EB console
```

---

## Google Cloud Platform (GCP)

### 1. Setup GCP CLI
```bash
# Install gcloud CLI
curl https://sdk.cloud.google.com | bash

# Initialize
gcloud init

# Create project
gcloud projects create moneyguard-app
gcloud config set project moneyguard-app
```

### 2. Create Cloud SQL (PostgreSQL)
```bash
# Create instance
gcloud sql instances create moneyguard-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1

# Create database
gcloud sql databases create moneyguard \
  --instance=moneyguard-db

# Create user
gcloud sql users create moneyguard \
  --instance=moneyguard-db \
  --password=YourStrongPassword123!
```

### 3. Create Memorystore (Redis)
```bash
# Create Redis instance
gcloud redis instances create moneyguard-redis \
  --size=1 \
  --region=us-central1 \
  --redis-version=redis_7_0
```

### 4. Deploy to Cloud Run
```bash
# Build container
cd backend
gcloud builds submit --tag gcr.io/moneyguard-app/backend

# Deploy
gcloud run deploy moneyguard-api \
  --image gcr.io/moneyguard-app/backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="DJANGO_SETTINGS_MODULE=moneyguard.settings.production,SECRET_KEY=..." \
  --add-cloudsql-instances=moneyguard-app:us-central1:moneyguard-db

# Get URL
gcloud run services describe moneyguard-api --platform managed --region us-central1 --format 'value(status.url)'
```

---

## Database Setup

### PostgreSQL Optimization
```sql
-- Create indexes for performance
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX idx_transactions_account ON transactions(account_id);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_budgets_user_category ON budgets(user_id, category_id);
CREATE INDEX idx_accounts_user ON accounts(user_id);

-- Enable pg_stat_statements for monitoring
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Configure connection pooling (recommended: PgBouncer)
-- Max connections: 100
-- Pool mode: transaction
```

### Database Backups
```bash
# Heroku (automatic)
heroku pg:backups:schedule --at '02:00 America/New_York' DATABASE_URL

# AWS RDS (automatic with retention period)
# Configured during RDS creation

# Manual backup
pg_dump -h hostname -U username -d moneyguard > backup_$(date +%Y%m%d).sql

# Restore
psql -h hostname -U username -d moneyguard < backup_20250104.sql
```

---

## Redis Setup

### Configuration
```conf
# /etc/redis/redis.conf

# Persistence
save 900 1
save 300 10
save 60 10000

# Memory
maxmemory 256mb
maxmemory-policy allkeys-lru

# Security
requirepass your-redis-password
```

### Monitoring
```bash
# Monitor Redis
redis-cli INFO stats
redis-cli SLOWLOG GET 10
```

---

## File Storage (S3)

### Django Settings for S3
```python
# settings/production.py

# Install: pip install django-storages boto3

INSTALLED_APPS += ['storages']

# AWS S3 settings
AWS_ACCESS_KEY_ID = config('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = config('AWS_SECRET_ACCESS_KEY')
AWS_STORAGE_BUCKET_NAME = config('AWS_STORAGE_BUCKET_NAME')
AWS_S3_REGION_NAME = 'us-east-1'
AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'
AWS_DEFAULT_ACL = 'private'
AWS_QUERYSTRING_AUTH = True
AWS_S3_FILE_OVERWRITE = False

# Storage backends
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
STATICFILES_STORAGE = 'storages.backends.s3boto3.S3StaticStorage'
```

---

## Email Configuration

### SendGrid
```python
# settings/production.py
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.sendgrid.net'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'apikey'
EMAIL_HOST_PASSWORD = config('SENDGRID_API_KEY')
DEFAULT_FROM_EMAIL = 'noreply@moneyguard.com'
```

### AWS SES
```python
EMAIL_BACKEND = 'django_ses.SESBackend'
AWS_SES_REGION_NAME = 'us-east-1'
AWS_SES_REGION_ENDPOINT = 'email.us-east-1.amazonaws.com'
```

---

## Monitoring & Logging

### Sentry Setup
```python
# settings/production.py
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration
from sentry_sdk.integrations.celery import CeleryIntegration

sentry_sdk.init(
    dsn=config('SENTRY_DSN'),
    integrations=[DjangoIntegration(), CeleryIntegration()],
    traces_sample_rate=0.1,
    send_default_pii=False,
    environment='production',
)
```

### Application Monitoring
```bash
# Install New Relic
pip install newrelic

# Configure
newrelic-admin generate-config YOUR_LICENSE_KEY newrelic.ini

# Run with New Relic
NEW_RELIC_CONFIG_FILE=newrelic.ini newrelic-admin run-program gunicorn moneyguard.wsgi:application
```

---

## CI/CD Setup

### GitHub Actions (Already Configured)
- Automated tests on pull requests
- Linting and code quality checks
- Docker image builds
- Automatic deployment to staging

### Manual Deployment Trigger
```bash
# Trigger deployment workflow
gh workflow run deploy.yml -f environment=production
```

---

## Mobile App Deployment

### Android (Google Play Store)

#### 1. Generate Signing Key
```bash
cd mobile/android/app

keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore release.keystore \
  -alias release \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Store password securely!
```

#### 2. Configure Gradle
```properties
# android/gradle.properties
RELEASE_STORE_FILE=release.keystore
RELEASE_KEY_ALIAS=release
RELEASE_STORE_PASSWORD=your-password
RELEASE_KEY_PASSWORD=your-password
```

#### 3. Build Release
```bash
cd mobile/android

# Build AAB for Play Store
./gradlew bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab
```

#### 4. Upload to Play Store
1. Create app in Google Play Console
2. Complete store listing
3. Set up pricing & distribution
4. Upload AAB file
5. Submit for review

### iOS (App Store)

#### 1. Configure in Xcode
```bash
cd mobile/ios
pod install
open MoneyGuard.xcworkspace
```

#### 2. Build Archive
1. Select "Any iOS Device" as destination
2. Product → Archive
3. Distribute App → App Store Connect
4. Upload

#### 3. Submit to App Store
1. Create app in App Store Connect
2. Complete app information
3. Add screenshots
4. Submit for review

---

## Post-Deployment

### 1. Verify Deployment
```bash
# Health check
curl https://api.moneyguard.com/health/

# API documentation
curl https://api.moneyguard.com/api/docs/

# Create test transaction
curl -X POST https://api.moneyguard.com/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

### 2. Setup Monitoring Alerts
- Database connection errors
- High CPU/memory usage
- Failed Celery tasks
- Stripe webhook failures
- Error rate spike (Sentry)

### 3. Configure Backups
- Database: Daily automated backups
- File storage: Versioning enabled
- Configuration: Stored in secure vault

### 4. Performance Optimization
```bash
# Enable database connection pooling
# Configure CDN for static files
# Enable Redis caching
# Set up query optimization
```

### 5. Security Hardening
```bash
# Enable WAF (Web Application Firewall)
# Set up DDoS protection (Cloudflare)
# Configure fail2ban
# Regular security audits
# Dependency updates
```

---

## Troubleshooting

### Common Issues

**Database connection errors**
```bash
# Check connection
psql $DATABASE_URL

# Check max connections
SELECT max_connections FROM pg_settings;
```

**Redis connection errors**
```bash
# Test connection
redis-cli -h host -p 6379 -a password PING
```

**Celery tasks not running**
```bash
# Check worker status
celery -A moneyguard inspect active

# Check beat schedule
celery -A moneyguard inspect scheduled
```

**Static files not loading**
```bash
# Collect static files
python manage.py collectstatic --noinput

# Check S3 permissions
aws s3 ls s3://your-bucket/static/
```

---

## Scaling Considerations

### Horizontal Scaling
- Load balancer with multiple app servers
- Database read replicas
- Redis cluster
- Celery worker scaling

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Add database indexes
- Implement caching strategies

### Database Optimization
```sql
-- Find slow queries
SELECT query, mean_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Add missing indexes
CREATE INDEX CONCURRENTLY idx_name ON table(column);
```

---

## Support

For deployment issues:
- Email: devops@moneyguard.com
- Documentation: https://docs.moneyguard.com
- Status Page: https://status.moneyguard.com

---

**Deployment Complete! 🚀**

Monitor your application and respond to alerts promptly.
