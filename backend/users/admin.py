"""
Django admin configuration for users app.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, UserActivityLog


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom admin for User model."""

    list_display = [
        'email',
        'full_name',
        'is_pro',
        'is_staff',
        'is_active',
        'created_at',
    ]
    list_filter = [
        'is_pro',
        'is_staff',
        'is_superuser',
        'is_active',
        'created_at',
    ]
    search_fields = ['email', 'first_name', 'last_name']
    ordering = ['-created_at']

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'timezone', 'locale', 'default_currency')}),
        (_('Subscription'), {'fields': ('is_pro', 'stripe_customer_id')}),
        (_('Privacy'), {'fields': ('ads_consent',)}),
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (_('Important dates'), {'fields': ('last_login', 'created_at', 'updated_at')}),
        (_('Security'), {'fields': ('last_login_ip',)}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2'),
        }),
    )

    readonly_fields = ['created_at', 'updated_at', 'last_login']

    def full_name(self, obj):
        return obj.full_name
    full_name.short_description = 'Full Name'


@admin.register(UserActivityLog)
class UserActivityLogAdmin(admin.ModelAdmin):
    """Admin for user activity logs."""

    list_display = ['user', 'action', 'ip_address', 'created_at']
    list_filter = ['action', 'created_at']
    search_fields = ['user__email', 'ip_address']
    readonly_fields = ['user', 'action', 'ip_address', 'user_agent', 'created_at', 'metadata']
    ordering = ['-created_at']

    def has_add_permission(self, request):
        """Logs are created automatically, not manually."""
        return False

    def has_change_permission(self, request, obj=None):
        """Logs are read-only."""
        return False
