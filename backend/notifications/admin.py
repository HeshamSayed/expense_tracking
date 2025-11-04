"""
Django admin configuration for notifications app.
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import NotificationPreference


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    """Admin configuration for NotificationPreference model."""

    list_display = [
        'user_email',
        'daily_summary',
        'weekly_summary',
        'budget_alerts',
        'recurring_transaction_alerts',
        'created_at',
        'updated_at',
    ]

    list_filter = [
        'daily_summary',
        'weekly_summary',
        'budget_alerts',
        'recurring_transaction_alerts',
        'created_at',
    ]

    search_fields = ['user__email', 'user__first_name', 'user__last_name']

    readonly_fields = ['user', 'created_at', 'updated_at']

    ordering = ['-created_at']

    fieldsets = (
        (_('User'), {
            'fields': ('user',)
        }),
        (_('Email Notifications'), {
            'fields': (
                'daily_summary',
                'weekly_summary',
                'budget_alerts',
                'recurring_transaction_alerts',
            )
        }),
        (_('Metadata'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def user_email(self, obj):
        """Display user email."""
        return obj.user.email

    user_email.short_description = 'User Email'
    user_email.admin_order_field = 'user__email'

    def has_add_permission(self, request):
        """
        Preferences are created automatically when users access the settings.
        Disable manual addition in admin.
        """
        return False
