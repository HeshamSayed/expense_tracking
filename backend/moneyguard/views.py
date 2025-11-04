"""
Core views for MoneyGuard.
Includes health checks and error handlers.
"""
from django.http import JsonResponse
from django.db import connection
from django.core.cache import cache
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import logging

logger = logging.getLogger(__name__)


@csrf_exempt
@require_http_methods(["GET"])
def health_check(request):
    """
    Basic health check endpoint.
    Returns 200 if the service is running.
    """
    return JsonResponse({
        'status': 'healthy',
        'service': 'moneyguard-api',
    })


@csrf_exempt
@require_http_methods(["GET"])
def readiness_check(request):
    """
    Readiness check endpoint.
    Verifies database and cache connectivity.
    Returns 200 if ready, 503 if not ready.
    """
    checks = {
        'database': False,
        'cache': False,
    }

    # Check database
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        checks['database'] = True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")

    # Check cache
    try:
        cache.set('health_check', 'ok', 10)
        if cache.get('health_check') == 'ok':
            checks['cache'] = True
    except Exception as e:
        logger.error(f"Cache health check failed: {e}")

    all_healthy = all(checks.values())
    status_code = 200 if all_healthy else 503

    return JsonResponse(
        {
            'status': 'ready' if all_healthy else 'not_ready',
            'checks': checks,
        },
        status=status_code
    )


def csrf_failure(request, reason=""):
    """
    Custom CSRF failure view that doesn't expose sensitive information.
    """
    logger.warning(
        f"CSRF failure from IP {request.META.get('REMOTE_ADDR')}",
        extra={'reason': reason}
    )

    return JsonResponse(
        {
            'error': 'Request validation failed.',
            'status_code': 403,
        },
        status=403
    )


def handler404(request, exception=None):
    """
    Custom 404 handler that doesn't expose path information.
    """
    return JsonResponse(
        {
            'error': 'The requested resource was not found.',
            'status_code': 404,
        },
        status=404
    )


def handler500(request):
    """
    Custom 500 handler that doesn't expose server information.
    """
    logger.error(
        f"500 error at {request.path}",
        extra={
            'method': request.method,
            'user': getattr(request.user, 'id', None),
        }
    )

    return JsonResponse(
        {
            'error': 'An error occurred. Please try again later.',
            'status_code': 500,
        },
        status=500
    )
