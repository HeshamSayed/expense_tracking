"""
Development settings for MoneyGuard.
"""
from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', '*']

# Development-specific installed apps
INSTALLED_APPS += [
    'django_extensions',  # Useful development tools
]

# CORS - Allow all origins in development
CORS_ALLOW_ALL_ORIGINS = True

# Disable some security features for development convenience
# NEVER use these in production!
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
SECURE_BROWSER_XSS_FILTER = False
SECURE_CONTENT_TYPE_NOSNIFF = False
X_FRAME_OPTIONS = 'SAMEORIGIN'

# Email backend for development (console)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Celery eager mode for development (executes tasks synchronously)
# Comment this out to test actual async behavior
CELERY_TASK_ALWAYS_EAGER = config('CELERY_EAGER', default=False, cast=bool)
CELERY_TASK_EAGER_PROPAGATES = True

# Django toolbar for debugging (optional)
# Uncomment to enable:
# INSTALLED_APPS += ['debug_toolbar']
# MIDDLEWARE.insert(0, 'debug_toolbar.middleware.DebugToolbarMiddleware')
# INTERNAL_IPS = ['127.0.0.1']

# Less strict throttling for development
REST_FRAMEWORK['DEFAULT_THROTTLE_RATES'] = {
    'anon': '1000/hour',
    'user': '10000/hour',
    'auth': '100/minute',
    'export': '100/hour',
}

# Disable Axes in development for easier testing
AXES_ENABLED = False

# Verbose logging in development
LOGGING['root']['level'] = 'DEBUG'
LOGGING['loggers']['django']['level'] = 'DEBUG'
