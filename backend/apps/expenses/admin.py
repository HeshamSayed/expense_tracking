"""
Expense admin configuration.
"""
from django.contrib import admin
from .models import (
    Expense, Income, Currency, Receipt,
    RecurringTransaction, SharedExpense
)


@admin.register(Currency)
class CurrencyAdmin(admin.ModelAdmin):
    """Admin interface for Currency model."""
    list_display = ['code', 'name', 'symbol', 'exchange_rate_to_usd', 'created_at']
    search_fields = ['code', 'name']
    ordering = ['code']


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    """Admin interface for Expense model."""
    list_display = [
        'user', 'category', 'amount', 'currency',
        'date', 'payment_method', 'created_at'
    ]
    list_filter = ['date', 'payment_method', 'category', 'currency', 'created_at']
    search_fields = ['description', 'location', 'user__email']
    date_hierarchy = 'date'
    ordering = ['-date']
    list_per_page = 50

    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'category', 'amount', 'currency', 'date')
        }),
        ('Details', {
            'fields': ('description', 'payment_method', 'location', 'tags', 'notes')
        }),
        ('Settings', {
            'fields': ('is_recurring', 'is_deleted')
        }),
    )


@admin.register(Income)
class IncomeAdmin(admin.ModelAdmin):
    """Admin interface for Income model."""
    list_display = [
        'user', 'category', 'amount', 'currency',
        'date', 'income_type', 'created_at'
    ]
    list_filter = ['date', 'income_type', 'category', 'currency', 'created_at']
    search_fields = ['description', 'source', 'user__email']
    date_hierarchy = 'date'
    ordering = ['-date']
    list_per_page = 50


@admin.register(Receipt)
class ReceiptAdmin(admin.ModelAdmin):
    """Admin interface for Receipt model."""
    list_display = ['expense', 'file_name', 'file_size', 'created_at']
    list_filter = ['created_at']
    search_fields = ['expense__description', 'file_name']
    ordering = ['-created_at']


@admin.register(RecurringTransaction)
class RecurringTransactionAdmin(admin.ModelAdmin):
    """Admin interface for RecurringTransaction model."""
    list_display = [
        'user', 'transaction_type', 'description', 'amount',
        'frequency', 'next_due_date', 'is_active'
    ]
    list_filter = ['transaction_type', 'frequency', 'is_active', 'created_at']
    search_fields = ['description', 'user__email']
    ordering = ['next_due_date']
    list_per_page = 50


@admin.register(SharedExpense)
class SharedExpenseAdmin(admin.ModelAdmin):
    """Admin interface for SharedExpense model."""
    list_display = [
        'expense', 'shared_with', 'share_amount',
        'is_settled', 'settled_date', 'created_at'
    ]
    list_filter = ['is_settled', 'created_at']
    search_fields = ['expense__description', 'shared_with__email']
    ordering = ['-created_at']
