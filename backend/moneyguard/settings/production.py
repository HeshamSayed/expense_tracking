"""
Production settings for MoneyGuard.
SECURITY HARDENED - Ready for Google Play Store deployment.
"""
from .base import *
import dj_database_url

# SECURITY WARNING: never run with debug on in production!
DEBUG = False

# Must be set in environment
ALLOWED_HOSTS = config('ALLOWED_HOSTS', cast=Csv())

# Security settings - ENFORCE HTTPS
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Additional security headers
SECURE_REFERRER_POLICY = 'same-origin'
SECURE_CROSS_ORIGIN_OPENER_POLICY = 'same-origin'

# CSRF settings
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = 'Strict'
CSRF_USE_SESSIONS = True
CSRF_FAILURE_VIEW = 'moneyguard.views.csrf_failure'

# Session security
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Strict'
SESSION_COOKIE_AGE = 86400  # 24 hours
SESSION_SAVE_EVERY_REQUEST = False
SESSION_EXPIRE_AT_BROWSER_CLOSE = False

# Database - Use environment variable (supports DATABASE_URL)
DATABASES['default'] = dj_database_url.config(
    default=config('DATABASE_URL'),
    conn_max_age=600,
    ssl_require=True,
)

# Strict CORS policy
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS', cast=Csv())
CORS_ALLOW_CREDENTIALS = True

# Email configuration
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = config('EMAIL_HOST')
EMAIL_PORT = config('EMAIL_PORT', cast=int)
EMAIL_USE_TLS = config('EMAIL_USE_TLS', cast=bool)
EMAIL_HOST_USER = config('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL')

# Static and media files - Use S3 or CDN in production
# Configure based on your hosting provider
STATIC_URL = config('STATIC_URL', default='/static/')
MEDIA_URL = config('MEDIA_URL', default='/media/')

# Optional: AWS S3 configuration (uncomment if using S3)
# INSTALLED_APPS += ['storages']
# DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
# STATICFILES_STORAGE = 'storages.backends.s3boto3.S3StaticStorage'
# AWS_ACCESS_KEY_ID = config('AWS_ACCESS_KEY_ID')
# AWS_SECRET_ACCESS_KEY = config('AWS_SECRET_ACCESS_KEY')
# AWS_STORAGE_BUCKET_NAME = config('AWS_STORAGE_BUCKET_NAME')
# AWS_S3_REGION_NAME = config('AWS_S3_REGION_NAME', default='us-east-1')
# AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'
# AWS_DEFAULT_ACL = 'private'
# AWS_QUERYSTRING_AUTH = True
# AWS_S3_FILE_OVERWRITE = False

# Celery - Never use eager mode in production
CELERY_TASK_ALWAYS_EAGER = False

# Strict rate limiting for production
REST_FRAMEWORK['DEFAULT_THROTTLE_RATES'] = {
    'anon': '100/hour',
    'user': '1000/hour',
    'auth': '5/minute',
    'export': '10/hour',
}

# Enable Axes brute force protection
AXES_ENABLED = True

# Production logging - Less verbose, focus on errors
LOGGING['root']['level'] = 'WARNING'
LOGGING['loggers']['django']['level'] = 'WARNING'
LOGGING['loggers']['django.request']['level'] = 'ERROR'
LOGGING['loggers']['django.security']['level'] = 'ERROR'

# Add additional handler for critical errors
ADMINS = [
    ('Admin', config('ADMIN_EMAIL', default='admin@moneyguard.com')),
]

LOGGING['handlers']['mail_admins'] = {
    'level': 'ERROR',
    'class': 'django.utils.log.AdminEmailHandler',
    'filters': ['require_debug_false'],
}

LOGGING['loggers']['django.request']['handlers'].append('mail_admins')

# REST Framework - Suppress exception details in production
REST_FRAMEWORK['EXCEPTION_HANDLER'] = 'moneyguard.utils.secure_exception_handler'

# Disable browsable API in production
REST_FRAMEWORK['DEFAULT_RENDERER_CLASSES'] = [
    'rest_framework.renderers.JSONRenderer',
]

# Password validators - Extra strict in production
AUTH_PASSWORD_VALIDATORS += [
    {
        'NAME': 'users.validators.ComplexityPasswordValidator',
        'OPTIONS': {
            'min_uppercase': 1,
            'min_lowercase': 1,
            'min_digits': 1,
        }
    },
]

# Require Stripe keys in production
if not STRIPE_SECRET_KEY or not STRIPE_WEBHOOK_SECRET:
    raise ValueError("Stripe configuration is required in production")

# Content Security Policy (optional but recommended)
# Uncomment and configure based on your needs
# CSP_DEFAULT_SRC = ("'self'",)
# CSP_SCRIPT_SRC = ("'self'",)
# CSP_STYLE_SRC = ("'self'", "'unsafe-inline'")
# CSP_IMG_SRC = ("'self'", "data:", "https:")
# CSP_FONT_SRC = ("'self'",)
# CSP_CONNECT_SRC = ("'self'",)
# CSP_FRAME_ANCESTORS = ("'none'",)

# File upload limits - Be strict
FILE_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB

# Database connection pooling (if using pgbouncer)
DATABASES['default']['DISABLE_SERVER_SIDE_CURSORS'] = True
