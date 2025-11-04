"""
Views for notification preferences management.
"""
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import NotificationPreference
from .serializers import NotificationPreferenceSerializer


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_preferences(request):
    """
    Get user notification preferences.

    GET /api/notifications/preferences/

    Returns:
        NotificationPreference object for the authenticated user.
        Creates one with default values if it doesn't exist.
    """
    # Get or create notification preferences for the user
    preference, created = NotificationPreference.objects.get_or_create(
        user=request.user,
        defaults={
            'daily_summary': True,
            'weekly_summary': True,
            'budget_alerts': True,
            'recurring_transaction_alerts': True,
        }
    )

    serializer = NotificationPreferenceSerializer(preference)

    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_preferences(request):
    """
    Update user notification preferences.

    PATCH /api/notifications/preferences/

    Request body (all fields optional):
        {
            "daily_summary": true/false,
            "weekly_summary": true/false,
            "budget_alerts": true/false,
            "recurring_transaction_alerts": true/false
        }

    Returns:
        Updated NotificationPreference object.
    """
    # Get or create notification preferences for the user
    preference, created = NotificationPreference.objects.get_or_create(
        user=request.user,
        defaults={
            'daily_summary': True,
            'weekly_summary': True,
            'budget_alerts': True,
            'recurring_transaction_alerts': True,
        }
    )

    # Update preferences with partial data
    serializer = NotificationPreferenceSerializer(
        preference,
        data=request.data,
        partial=True
    )

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
