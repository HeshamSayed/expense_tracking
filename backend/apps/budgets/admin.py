"""
Budget admin configuration.
"""
from django.contrib import admin
from .models import Budget, BudgetAlert


@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    """Admin interface for Budget model."""
    list_display = [
        'name', 'user', 'amount', 'currency', 'period',
        'start_date', 'end_date', 'is_active', 'created_at'
    ]
    list_filter = ['period', 'is_active', 'created_at', 'currency']
    search_fields = ['name', 'user__email']
    date_hierarchy = 'start_date'
    ordering = ['-created_at']
    list_per_page = 50

    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'name', 'amount', 'currency')
        }),
        ('Period', {
            'fields': ('period', 'start_date', 'end_date')
        }),
        ('Category', {
            'fields': ('category',)
        }),
        ('Alert Settings', {
            'fields': ('alert_threshold', 'is_active')
        }),
    )

    readonly_fields = ['created_at', 'updated_at']


@admin.register(BudgetAlert)
class BudgetAlertAdmin(admin.ModelAdmin):
    """Admin interface for BudgetAlert model."""
    list_display = [
        'budget', 'alert_type', 'percentage_at_alert',
        'is_read', 'created_at'
    ]
    list_filter = ['alert_type', 'is_read', 'created_at']
    search_fields = ['budget__name', 'message']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'read_at']
