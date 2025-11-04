"""
Authentication admin configuration.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserProfile


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin interface for User model."""
    list_display = [
        'email', 'username', 'first_name', 'last_name',
        'is_active', 'is_staff', 'created_at'
    ]
    list_filter = ['is_active', 'is_staff', 'is_superuser', 'created_at']
    search_fields = ['email', 'username', 'first_name', 'last_name']
    ordering = ['-created_at']

    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': (
                'phone_number', 'profile_picture', 'default_currency',
                'timezone', 'is_email_verified'
            )
        }),
        ('Notification Settings', {
            'fields': (
                'enable_budget_alerts', 'enable_recurring_reminders',
                'budget_alert_threshold'
            )
        }),
    )


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """Admin interface for UserProfile model."""
    list_display = ['user', 'country', 'city', 'occupation', 'created_at']
    search_fields = ['user__email', 'country', 'city']
    list_filter = ['country', 'created_at']
