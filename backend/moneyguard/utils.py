"""
Utility functions for MoneyGuard.
Includes secure exception handling that doesn't expose sensitive information.
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import PermissionDenied
from django.http import Http404
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


def secure_exception_handler(exc, context):
    """
    Custom exception handler that prevents information disclosure.
    Returns generic error messages in production.
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)

    # Log the actual error for debugging (internal only)
    request = context.get('request')
    if request:
        logger.error(
            f"API Error: {exc.__class__.__name__} at {request.path}",
            exc_info=exc,
            extra={
                'user': getattr(request.user, 'id', None),
                'method': request.method,
                'path': request.path,
            }
        )

    # In production, use generic messages to avoid information disclosure
    if not settings.DEBUG:
        if response is not None:
            # Map status codes to generic messages
            generic_messages = {
                400: "The request could not be processed.",
                401: "Authentication is required.",
                403: "You don't have permission to access this resource.",
                404: "The requested resource was not found.",
                405: "This method is not allowed.",
                429: "Too many requests. Please try again later.",
                500: "An error occurred. Please try again later.",
                503: "Service temporarily unavailable. Please try again later.",
            }

            status_code = response.status_code

            # Replace detailed error messages with generic ones
            if status_code in generic_messages:
                response.data = {
                    'error': generic_messages[status_code],
                    'status_code': status_code,
                }
            else:
                response.data = {
                    'error': "An error occurred processing your request.",
                    'status_code': status_code,
                }

    # If response is None (unhandled exception), return generic 500
    if response is None:
        if not settings.DEBUG:
            return Response(
                {
                    'error': 'An error occurred. Please try again later.',
                    'status_code': 500,
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    return response


def custom_exception_handler(exc, context):
    """
    Custom exception handler for development that shows more details.
    """
    response = exception_handler(exc, context)

    # Log the error
    request = context.get('request')
    if request:
        logger.error(
            f"API Error: {exc.__class__.__name__} at {request.path}",
            exc_info=exc,
            extra={
                'user': getattr(request.user, 'id', None),
                'method': request.method,
                'path': request.path,
            }
        )

    return response


def sanitize_error_message(message: str) -> str:
    """
    Sanitize error messages to remove sensitive information.

    Args:
        message: The original error message

    Returns:
        Sanitized error message
    """
    # List of patterns that should be removed from error messages
    sensitive_patterns = [
        'password',
        'token',
        'secret',
        'key',
        'credential',
        'authorization',
        'session',
        'cookie',
    ]

    message_lower = message.lower()
    for pattern in sensitive_patterns:
        if pattern in message_lower:
            return "An error occurred."

    return message


def get_client_ip(request):
    """
    Get the client's IP address from the request.
    Handles proxy headers correctly.

    Args:
        request: Django request object

    Returns:
        Client IP address as string
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def mask_email(email: str) -> str:
    """
    Mask email address for privacy.
    Example: john.doe@example.com -> j***@example.com

    Args:
        email: Email address to mask

    Returns:
        Masked email address
    """
    if '@' not in email:
        return email

    username, domain = email.split('@', 1)
    if len(username) <= 2:
        masked_username = username[0] + '***'
    else:
        masked_username = username[0] + '***' + username[-1]

    return f"{masked_username}@{domain}"


def mask_card_number(card_number: str) -> str:
    """
    Mask credit card number for display.
    Example: 4242424242424242 -> **** **** **** 4242

    Args:
        card_number: Card number to mask

    Returns:
        Masked card number
    """
    if len(card_number) < 4:
        return '****'

    return '**** **** **** ' + card_number[-4:]


def safe_delete(obj):
    """
    Safely delete an object with proper error handling.

    Args:
        obj: Django model instance to delete

    Returns:
        Tuple of (success: bool, error_message: str or None)
    """
    try:
        obj.delete()
        return True, None
    except Exception as e:
        logger.error(f"Error deleting {obj.__class__.__name__}: {e}")
        return False, "Unable to delete the resource."
