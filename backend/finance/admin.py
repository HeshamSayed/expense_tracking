"""
Django admin configuration for finance app.
Provides admin interface for managing all finance models.
"""
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe

from .models import Account, Transaction, Category, Budget, RecurringTransaction


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    """Admin interface for Account model."""

    list_display = [
        'name',
        'user',
        'currency',
        'balance_display',
        'is_archived',
        'transaction_count',
        'created_at',
        'updated_at',
    ]
    list_filter = [
        'currency',
        'is_archived',
        'created_at',
        'updated_at',
    ]
    search_fields = [
        'name',
        'user__email',
        'user__username',
    ]
    readonly_fields = [
        'balance',
        'created_at',
        'updated_at',
        'transaction_count',
    ]
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'name', 'currency')
        }),
        ('Balance & Status', {
            'fields': ('balance', 'is_archived')
        }),
        ('Metadata', {
            'fields': ('transaction_count', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    list_per_page = 25
    date_hierarchy = 'created_at'

    def balance_display(self, obj):
        """Display balance with currency symbol."""
        color = 'green' if obj.balance > 0 else 'red'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{} {}</span>',
            color,
            obj.currency,
            obj.balance
        )
    balance_display.short_description = 'Balance'

    def transaction_count(self, obj):
        """Display count of transactions."""
        count = obj.transactions.count()
        url = reverse('admin:finance_transaction_changelist') + f'?account__id__exact={obj.id}'
        return format_html('<a href="{}">{} transactions</a>', url, count)
    transaction_count.short_description = 'Transactions'


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """Admin interface for Category model."""

    list_display = [
        'name',
        'type',
        'user_display',
        'icon',
        'color_display',
        'transaction_count',
        'created_at',
    ]
    list_filter = [
        'type',
        'created_at',
    ]
    search_fields = [
        'name',
        'user__email',
        'user__username',
    ]
    readonly_fields = [
        'created_at',
        'transaction_count',
    ]
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'name', 'type')
        }),
        ('Appearance', {
            'fields': ('icon', 'color')
        }),
        ('Metadata', {
            'fields': ('transaction_count', 'created_at'),
            'classes': ('collapse',)
        }),
    )
    list_per_page = 25

    def user_display(self, obj):
        """Display user or 'Global' for system categories."""
        if obj.user is None:
            return format_html('<span style="color: blue; font-weight: bold;">Global</span>')
        return obj.user.email if hasattr(obj.user, 'email') else obj.user.username
    user_display.short_description = 'User'

    def color_display(self, obj):
        """Display color with visual preview."""
        if obj.color:
            return format_html(
                '<span style="background-color: {}; padding: 5px 10px; border: 1px solid #ccc;">{}</span>',
                obj.color,
                obj.color
            )
        return '-'
    color_display.short_description = 'Color'

    def transaction_count(self, obj):
        """Display count of transactions."""
        count = obj.transactions.count()
        url = reverse('admin:finance_transaction_changelist') + f'?category__id__exact={obj.id}'
        return format_html('<a href="{}">{} transactions</a>', url, count)
    transaction_count.short_description = 'Transactions'


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    """Admin interface for Transaction model."""

    list_display = [
        'date',
        'user',
        'account',
        'category',
        'transaction_type_display',
        'amount_display',
        'currency',
        'imported',
        'created_at',
    ]
    list_filter = [
        'transaction_type',
        'currency',
        'imported',
        'date',
        'created_at',
    ]
    search_fields = [
        'notes',
        'user__email',
        'user__username',
        'account__name',
        'category__name',
    ]
    readonly_fields = [
        'created_at',
        'updated_at',
    ]
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'account', 'category', 'transaction_type', 'date')
        }),
        ('Amount & Currency', {
            'fields': ('amount', 'currency')
        }),
        ('Additional Information', {
            'fields': ('notes', 'attachment_url', 'recurring_transaction', 'imported')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    list_per_page = 50
    date_hierarchy = 'date'
    raw_id_fields = ['user', 'account', 'category', 'recurring_transaction']

    def transaction_type_display(self, obj):
        """Display transaction type with color coding."""
        if obj.transaction_type == 'income':
            color = 'green'
            icon = '↑'
        else:
            color = 'red'
            icon = '↓'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{} {}</span>',
            color,
            icon,
            obj.transaction_type.capitalize()
        )
    transaction_type_display.short_description = 'Type'

    def amount_display(self, obj):
        """Display amount with color coding."""
        color = 'green' if obj.transaction_type == 'income' else 'red'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.amount
        )
    amount_display.short_description = 'Amount'


@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    """Admin interface for Budget model."""

    list_display = [
        'category',
        'user',
        'amount_display',
        'period',
        'spent_amount_display',
        'percentage_display',
        'alert_threshold',
        'is_active',
        'start_date',
        'created_at',
    ]
    list_filter = [
        'period',
        'is_active',
        'alert_threshold',
        'created_at',
    ]
    search_fields = [
        'category__name',
        'user__email',
        'user__username',
    ]
    readonly_fields = [
        'created_at',
        'updated_at',
        'spent_amount_display',
        'percentage_display',
    ]
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'category', 'period', 'start_date')
        }),
        ('Budget Settings', {
            'fields': ('amount', 'alert_threshold', 'is_active')
        }),
        ('Current Status', {
            'fields': ('spent_amount_display', 'percentage_display'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    list_per_page = 25
    date_hierarchy = 'start_date'
    raw_id_fields = ['user', 'category']

    def amount_display(self, obj):
        """Display budget amount."""
        return format_html(
            '<span style="font-weight: bold;">{}</span>',
            obj.amount
        )
    amount_display.short_description = 'Budget Amount'

    def spent_amount_display(self, obj):
        """Display spent amount."""
        spent = obj.get_spent_amount()
        percentage = obj.get_percentage_used()

        if percentage >= obj.alert_threshold:
            color = 'red'
        elif percentage >= 70:
            color = 'orange'
        else:
            color = 'green'

        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            spent
        )
    spent_amount_display.short_description = 'Spent Amount'

    def percentage_display(self, obj):
        """Display percentage used with color coding."""
        percentage = obj.get_percentage_used()

        if percentage >= obj.alert_threshold:
            color = 'red'
        elif percentage >= 70:
            color = 'orange'
        else:
            color = 'green'

        return format_html(
            '<div style="width: 100px; background-color: #f0f0f0; border: 1px solid #ccc; border-radius: 3px;">'
            '<div style="width: {}%; background-color: {}; color: white; text-align: center; padding: 2px; border-radius: 3px;">'
            '{:.1f}%'
            '</div>'
            '</div>',
            min(percentage, 100),
            color,
            percentage
        )
    percentage_display.short_description = 'Usage'


@admin.register(RecurringTransaction)
class RecurringTransactionAdmin(admin.ModelAdmin):
    """Admin interface for RecurringTransaction model."""

    list_display = [
        'description',
        'user',
        'account',
        'category',
        'transaction_type_display',
        'amount_display',
        'currency',
        'frequency',
        'next_run',
        'is_active',
        'created_at',
    ]
    list_filter = [
        'frequency',
        'transaction_type',
        'is_active',
        'currency',
        'created_at',
        'next_run',
    ]
    search_fields = [
        'description',
        'user__email',
        'user__username',
        'account__name',
        'category__name',
    ]
    readonly_fields = [
        'created_at',
        'updated_at',
        'transaction_count',
    ]
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'account', 'category', 'transaction_type')
        }),
        ('Amount & Currency', {
            'fields': ('amount', 'currency')
        }),
        ('Recurrence Settings', {
            'fields': ('frequency', 'next_run', 'is_active')
        }),
        ('Description', {
            'fields': ('description',)
        }),
        ('Metadata', {
            'fields': ('transaction_count', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    list_per_page = 25
    date_hierarchy = 'next_run'
    raw_id_fields = ['user', 'account', 'category']

    def transaction_type_display(self, obj):
        """Display transaction type with color coding."""
        if obj.transaction_type == 'income':
            color = 'green'
            icon = '↑'
        else:
            color = 'red'
            icon = '↓'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{} {}</span>',
            color,
            icon,
            obj.transaction_type.capitalize()
        )
    transaction_type_display.short_description = 'Type'

    def amount_display(self, obj):
        """Display amount with color coding."""
        color = 'green' if obj.transaction_type == 'income' else 'red'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.amount
        )
    amount_display.short_description = 'Amount'

    def transaction_count(self, obj):
        """Display count of generated transactions."""
        count = obj.transactions.count()
        url = reverse('admin:finance_transaction_changelist') + f'?recurring_transaction__id__exact={obj.id}'
        return format_html('<a href="{}">{} transactions</a>', url, count)
    transaction_count.short_description = 'Generated Transactions'
