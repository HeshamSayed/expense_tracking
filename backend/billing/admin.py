"""
Django admin configuration for billing app.
Provides admin interface for managing subscriptions and purchases.
"""
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import Subscription, InAppPurchase, PaymentHistory


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    """Admin interface for Subscription model."""

    list_display = [
        'id',
        'user_email',
        'status_badge',
        'stripe_subscription_id',
        'current_period_end',
        'cancel_at_period_end',
        'is_active_badge',
        'created_at',
    ]

    list_filter = [
        'status',
        'cancel_at_period_end',
        'created_at',
        'current_period_end',
    ]

    search_fields = [
        'user__email',
        'stripe_subscription_id',
    ]

    readonly_fields = [
        'id',
        'stripe_subscription_id',
        'status',
        'current_period_start',
        'current_period_end',
        'cancel_at_period_end',
        'canceled_at',
        'trial_start',
        'trial_end',
        'created_at',
        'updated_at',
        'is_active_badge',
        'is_cancelled_badge',
        'user_link',
        'stripe_dashboard_link',
    ]

    fieldsets = (
        ('Subscription Information', {
            'fields': (
                'id',
                'user_link',
                'stripe_subscription_id',
                'stripe_dashboard_link',
            )
        }),
        ('Status', {
            'fields': (
                'status',
                'is_active_badge',
                'is_cancelled_badge',
                'cancel_at_period_end',
                'canceled_at',
            )
        }),
        ('Billing Period', {
            'fields': (
                'current_period_start',
                'current_period_end',
            )
        }),
        ('Trial Period', {
            'fields': (
                'trial_start',
                'trial_end',
            ),
            'classes': ('collapse',),
        }),
        ('Metadata', {
            'fields': (
                'created_at',
                'updated_at',
            )
        }),
    )

    def user_email(self, obj):
        """Display user email."""
        return obj.user.email
    user_email.short_description = 'User'
    user_email.admin_order_field = 'user__email'

    def status_badge(self, obj):
        """Display status as a colored badge."""
        colors = {
            'active': 'green',
            'trialing': 'blue',
            'cancelled': 'red',
            'past_due': 'orange',
            'incomplete': 'gray',
            'incomplete_expired': 'gray',
            'unpaid': 'red',
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; '
            'border-radius: 3px; font-weight: bold;">{}</span>',
            color,
            obj.status.upper()
        )
    status_badge.short_description = 'Status'

    def is_active_badge(self, obj):
        """Display active status as a badge."""
        if obj.is_active:
            return format_html(
                '<span style="color: green; font-weight: bold;">✓ Active</span>'
            )
        return format_html(
            '<span style="color: red; font-weight: bold;">✗ Inactive</span>'
        )
    is_active_badge.short_description = 'Active'

    def is_cancelled_badge(self, obj):
        """Display cancelled status as a badge."""
        if obj.is_cancelled:
            return format_html(
                '<span style="color: red; font-weight: bold;">✓ Cancelled</span>'
            )
        return format_html(
            '<span style="color: green; font-weight: bold;">✗ Not Cancelled</span>'
        )
    is_cancelled_badge.short_description = 'Cancelled'

    def user_link(self, obj):
        """Create a link to the user in admin."""
        url = reverse('admin:users_user_change', args=[obj.user.id])
        return format_html('<a href="{}">{}</a>', url, obj.user.email)
    user_link.short_description = 'User'

    def stripe_dashboard_link(self, obj):
        """Create a link to Stripe dashboard."""
        if obj.stripe_subscription_id:
            url = f'https://dashboard.stripe.com/subscriptions/{obj.stripe_subscription_id}'
            return format_html(
                '<a href="{}" target="_blank">View in Stripe Dashboard →</a>',
                url
            )
        return '-'
    stripe_dashboard_link.short_description = 'Stripe Dashboard'

    def has_add_permission(self, request):
        """Disable manual creation of subscriptions."""
        return False

    def has_delete_permission(self, request, obj=None):
        """Disable deletion of subscriptions."""
        return False


@admin.register(InAppPurchase)
class InAppPurchaseAdmin(admin.ModelAdmin):
    """Admin interface for InAppPurchase model."""

    list_display = [
        'id',
        'user_email',
        'platform_badge',
        'product_id',
        'is_verified_badge',
        'is_active_badge',
        'expires_at',
        'created_at',
    ]

    list_filter = [
        'platform',
        'is_verified',
        'is_active',
        'product_id',
        'created_at',
    ]

    search_fields = [
        'user__email',
        'purchase_token',
        'product_id',
    ]

    readonly_fields = [
        'id',
        'user_link',
        'platform',
        'purchase_token_short',
        'product_id',
        'is_verified',
        'verified_at',
        'is_active',
        'expires_at',
        'raw_receipt_display',
        'created_at',
        'updated_at',
    ]

    fieldsets = (
        ('Purchase Information', {
            'fields': (
                'id',
                'user_link',
                'platform',
                'product_id',
            )
        }),
        ('Verification', {
            'fields': (
                'is_verified',
                'verified_at',
                'is_active',
                'expires_at',
            )
        }),
        ('Token', {
            'fields': (
                'purchase_token_short',
            )
        }),
        ('Raw Receipt Data', {
            'fields': (
                'raw_receipt_display',
            ),
            'classes': ('collapse',),
        }),
        ('Metadata', {
            'fields': (
                'created_at',
                'updated_at',
            )
        }),
    )

    def user_email(self, obj):
        """Display user email."""
        return obj.user.email
    user_email.short_description = 'User'
    user_email.admin_order_field = 'user__email'

    def platform_badge(self, obj):
        """Display platform as a badge."""
        colors = {
            'google': '#4285F4',  # Google Blue
            'apple': '#000000',   # Apple Black
        }
        color = colors.get(obj.platform, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; '
            'border-radius: 3px; font-weight: bold;">{}</span>',
            color,
            obj.get_platform_display()
        )
    platform_badge.short_description = 'Platform'

    def is_verified_badge(self, obj):
        """Display verified status as a badge."""
        if obj.is_verified:
            return format_html(
                '<span style="color: green; font-weight: bold;">✓ Verified</span>'
            )
        return format_html(
            '<span style="color: orange; font-weight: bold;">⚠ Not Verified</span>'
        )
    is_verified_badge.short_description = 'Verified'

    def is_active_badge(self, obj):
        """Display active status as a badge."""
        if obj.is_active:
            return format_html(
                '<span style="color: green; font-weight: bold;">✓ Active</span>'
            )
        return format_html(
            '<span style="color: red; font-weight: bold;">✗ Inactive</span>'
        )
    is_active_badge.short_description = 'Active'

    def user_link(self, obj):
        """Create a link to the user in admin."""
        url = reverse('admin:users_user_change', args=[obj.user.id])
        return format_html('<a href="{}">{}</a>', url, obj.user.email)
    user_link.short_description = 'User'

    def purchase_token_short(self, obj):
        """Display shortened purchase token."""
        if len(obj.purchase_token) > 50:
            return f"{obj.purchase_token[:50]}..."
        return obj.purchase_token
    purchase_token_short.short_description = 'Purchase Token'

    def raw_receipt_display(self, obj):
        """Display raw receipt data in a readable format."""
        if obj.raw_receipt:
            import json
            try:
                formatted_json = json.dumps(obj.raw_receipt, indent=2)
                return format_html('<pre>{}</pre>', formatted_json)
            except Exception:
                return str(obj.raw_receipt)
        return '-'
    raw_receipt_display.short_description = 'Raw Receipt'

    def has_add_permission(self, request):
        """Disable manual creation of purchases."""
        return False

    def has_delete_permission(self, request, obj=None):
        """Allow deletion only for superusers."""
        return request.user.is_superuser


@admin.register(PaymentHistory)
class PaymentHistoryAdmin(admin.ModelAdmin):
    """Admin interface for PaymentHistory model."""

    list_display = [
        'id',
        'user_email',
        'amount_display',
        'status_badge',
        'stripe_payment_intent_id',
        'created_at',
    ]

    list_filter = [
        'status',
        'currency',
        'created_at',
    ]

    search_fields = [
        'user__email',
        'stripe_payment_intent_id',
        'stripe_invoice_id',
    ]

    readonly_fields = [
        'id',
        'user_link',
        'stripe_payment_intent_id',
        'stripe_invoice_id',
        'subscription_link',
        'amount',
        'currency',
        'status',
        'failure_message',
        'created_at',
        'updated_at',
        'stripe_dashboard_link',
    ]

    fieldsets = (
        ('Payment Information', {
            'fields': (
                'id',
                'user_link',
                'stripe_payment_intent_id',
                'stripe_invoice_id',
                'stripe_dashboard_link',
                'subscription_link',
            )
        }),
        ('Amount', {
            'fields': (
                'amount',
                'currency',
            )
        }),
        ('Status', {
            'fields': (
                'status',
                'failure_message',
            )
        }),
        ('Metadata', {
            'fields': (
                'created_at',
                'updated_at',
            )
        }),
    )

    def user_email(self, obj):
        """Display user email."""
        return obj.user.email
    user_email.short_description = 'User'
    user_email.admin_order_field = 'user__email'

    def amount_display(self, obj):
        """Display amount with currency."""
        return f"{obj.amount} {obj.currency}"
    amount_display.short_description = 'Amount'
    amount_display.admin_order_field = 'amount'

    def status_badge(self, obj):
        """Display status as a colored badge."""
        colors = {
            'succeeded': 'green',
            'failed': 'red',
            'pending': 'orange',
            'refunded': 'blue',
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; '
            'border-radius: 3px; font-weight: bold;">{}</span>',
            color,
            obj.status.upper()
        )
    status_badge.short_description = 'Status'

    def user_link(self, obj):
        """Create a link to the user in admin."""
        url = reverse('admin:users_user_change', args=[obj.user.id])
        return format_html('<a href="{}">{}</a>', url, obj.user.email)
    user_link.short_description = 'User'

    def subscription_link(self, obj):
        """Create a link to the subscription in admin."""
        if obj.subscription:
            url = reverse('admin:billing_subscription_change', args=[obj.subscription.id])
            return format_html('<a href="{}">{}</a>', url, obj.subscription.stripe_subscription_id)
        return '-'
    subscription_link.short_description = 'Subscription'

    def stripe_dashboard_link(self, obj):
        """Create a link to Stripe dashboard."""
        if obj.stripe_payment_intent_id:
            url = f'https://dashboard.stripe.com/payments/{obj.stripe_payment_intent_id}'
            return format_html(
                '<a href="{}" target="_blank">View in Stripe Dashboard →</a>',
                url
            )
        return '-'
    stripe_dashboard_link.short_description = 'Stripe Dashboard'

    def has_add_permission(self, request):
        """Disable manual creation of payment history."""
        return False

    def has_delete_permission(self, request, obj=None):
        """Allow deletion only for superusers."""
        return request.user.is_superuser
