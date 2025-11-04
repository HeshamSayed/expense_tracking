"""
Views for user authentication and profile management.
Implements secure practices to prevent information disclosure.
"""
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.template.loader import render_to_string
import logging

from .serializers import (
    UserRegistrationSerializer,
    UserProfileSerializer,
    UserProfileUpdateSerializer,
    PasswordChangeSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    AdConsentSerializer,
    UserActivityLogSerializer,
)
from .models import UserActivityLog
from moneyguard.utils import get_client_ip

User = get_user_model()
logger = logging.getLogger(__name__)


class AuthThrottle(AnonRateThrottle):
    """Custom throttle for authentication endpoints."""
    rate = '5/minute'


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
@throttle_classes([AuthThrottle])
def register(request):
    """
    Register a new user account.
    Security: Generic error messages, rate limited.
    """
    serializer = UserRegistrationSerializer(data=request.data)

    if serializer.is_valid():
        user = serializer.save()

        # Log registration
        UserActivityLog.objects.create(
            user=user,
            action='login',
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            'message': 'Account created successfully',
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserProfileSerializer(user).data,
        }, status=status.HTTP_201_CREATED)

    # Security: Don't expose validation details in production
    if settings.DEBUG:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response({
            'error': 'Unable to create account. Please check your information.'
        }, status=status.HTTP_400_BAD_REQUEST)


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom login view with activity logging.
    """
    throttle_classes = [AuthThrottle]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            # Login successful - log activity
            try:
                email = request.data.get('email')
                user = User.objects.get(email=email)

                UserActivityLog.objects.create(
                    user=user,
                    action='login',
                    ip_address=get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', '')
                )

                # Update last login IP
                user.update_last_login_ip(get_client_ip(request))

            except User.DoesNotExist:
                pass  # Should not happen, but don't expose error

        return response


@api_view(['GET', 'PATCH'])
@permission_classes([permissions.IsAuthenticated])
def profile(request):
    """
    Get or update user profile.
    GET: Returns user profile information.
    PATCH: Updates user profile.
    """
    if request.method == 'GET':
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    elif request.method == 'PATCH':
        serializer = UserProfileUpdateSerializer(
            request.user,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    """
    Change user password.
    Requires current password for security.
    """
    serializer = PasswordChangeSerializer(
        data=request.data,
        context={'request': request}
    )

    if serializer.is_valid():
        serializer.save()

        # Log password change
        UserActivityLog.objects.create(
            user=request.user,
            action='password_change',
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )

        return Response({
            'message': 'Password changed successfully'
        })

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
@throttle_classes([AuthThrottle])
def password_reset_request(request):
    """
    Request password reset email.
    Security: Always returns success to prevent user enumeration.
    """
    serializer = PasswordResetRequestSerializer(data=request.data)

    if serializer.is_valid():
        email = serializer.validated_data['email']

        try:
            user = User.objects.get(email=email)

            # Generate reset token
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))

            # In production, send email with reset link
            # For now, just log it
            reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"

            if settings.DEBUG:
                logger.info(f"Password reset URL: {reset_url}")
            else:
                # Send email
                send_mail(
                    subject='Password Reset - MoneyGuard',
                    message=f'Click the link to reset your password: {reset_url}',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[email],
                    fail_silently=True,
                )

        except User.DoesNotExist:
            # Security: Don't reveal user doesn't exist
            pass

    # Always return success
    return Response({
        'message': 'If an account exists with this email, you will receive password reset instructions.'
    })


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
@throttle_classes([AuthThrottle])
def password_reset_confirm(request):
    """
    Confirm password reset with token.
    """
    serializer = PasswordResetConfirmSerializer(data=request.data)

    if serializer.is_valid():
        try:
            # Decode user ID from token
            uid = request.data.get('uid')
            token = serializer.validated_data['token']
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)

            # Verify token
            if default_token_generator.check_token(user, token):
                # Set new password
                user.set_password(serializer.validated_data['new_password'])
                user.save()

                # Log password change
                UserActivityLog.objects.create(
                    user=user,
                    action='password_change',
                    ip_address=get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', '')
                )

                return Response({
                    'message': 'Password reset successful'
                })

        except (User.DoesNotExist, ValueError, TypeError):
            pass

    # Generic error message
    return Response({
        'error': 'Password reset link is invalid or expired.'
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def update_ad_consent(request):
    """
    Update user's ad consent preference (GDPR compliance).
    """
    serializer = AdConsentSerializer(data=request.data)

    if serializer.is_valid():
        request.user.ads_consent = serializer.validated_data['ads_consent']
        request.user.save(update_fields=['ads_consent'])

        return Response({
            'message': 'Consent preference updated',
            'ads_consent': request.user.ads_consent
        })

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def activity_logs(request):
    """
    Get user activity logs (last 50 entries).
    """
    logs = UserActivityLog.objects.filter(user=request.user)[:50]
    serializer = UserActivityLogSerializer(logs, many=True)
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_account(request):
    """
    Delete user account permanently.
    Requires password confirmation.
    """
    password = request.data.get('password')

    if not password:
        return Response({
            'error': 'Password is required to delete account.'
        }, status=status.HTTP_400_BAD_REQUEST)

    if not request.user.check_password(password):
        return Response({
            'error': 'Invalid password.'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Log account deletion
    UserActivityLog.objects.create(
        user=request.user,
        action='account_deleted',
        ip_address=get_client_ip(request),
        user_agent=request.META.get('HTTP_USER_AGENT', '')
    )

    # Delete user account
    request.user.delete()

    return Response({
        'message': 'Account deleted successfully'
    }, status=status.HTTP_204_NO_CONTENT)
