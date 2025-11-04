"""
Billing models for MoneyGuard.
Tracks Stripe subscriptions and mobile in-app purchases.
"""
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError


class Subscription(models.Model):
    """
    Tracks Stripe subscription details for Pro users.
    Synced with Stripe webhooks to maintain accurate subscription status.
    """

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('cancelled', 'Cancelled'),
        ('past_due', 'Past Due'),
        ('trialing', 'Trialing'),
        ('incomplete', 'Incomplete'),
        ('incomplete_expired', 'Incomplete Expired'),
        ('unpaid', 'Unpaid'),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='subscription',
        help_text=_('User who owns this subscription')
    )

    stripe_subscription_id = models.CharField(
        _('Stripe subscription ID'),
        max_length=255,
        unique=True,
        db_index=True,
        help_text=_('Stripe subscription ID (sub_xxxxx)')
    )

    status = models.CharField(
        _('subscription status'),
        max_length=50,
        choices=STATUS_CHOICES,
        default='incomplete',
        help_text=_('Current subscription status from Stripe')
    )

    current_period_start = models.DateTimeField(
        _('current period start'),
        help_text=_('Start of the current billing period')
    )

    current_period_end = models.DateTimeField(
        _('current period end'),
        help_text=_('End of the current billing period')
    )

    cancel_at_period_end = models.BooleanField(
        _('cancel at period end'),
        default=False,
        help_text=_('If true, subscription will be cancelled at the end of the current period')
    )

    canceled_at = models.DateTimeField(
        _('canceled at'),
        null=True,
        blank=True,
        help_text=_('When the subscription was canceled')
    )

    trial_start = models.DateTimeField(
        _('trial start'),
        null=True,
        blank=True,
        help_text=_('Start of the trial period if applicable')
    )

    trial_end = models.DateTimeField(
        _('trial end'),
        null=True,
        blank=True,
        help_text=_('End of the trial period if applicable')
    )

    # Metadata
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        verbose_name = _('subscription')
        verbose_name_plural = _('subscriptions')
        db_table = 'subscriptions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['stripe_subscription_id']),
            models.Index(fields=['status']),
            models.Index(fields=['-created_at']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.status}"

    @property
    def is_active(self):
        """Check if subscription is currently active (active or trialing)."""
        return self.status in ['active', 'trialing']

    @property
    def is_cancelled(self):
        """Check if subscription is cancelled or will be cancelled."""
        return self.status == 'cancelled' or self.cancel_at_period_end

    def clean(self):
        """Validate model fields."""
        super().clean()

        # Ensure period_end is after period_start
        if self.current_period_start and self.current_period_end:
            if self.current_period_end <= self.current_period_start:
                raise ValidationError({
                    'current_period_end': _('Period end must be after period start')
                })

        # Ensure trial_end is after trial_start
        if self.trial_start and self.trial_end:
            if self.trial_end <= self.trial_start:
                raise ValidationError({
                    'trial_end': _('Trial end must be after trial start')
                })

    def save(self, *args, **kwargs):
        """Override save to run validation."""
        self.full_clean()
        super().save(*args, **kwargs)


class InAppPurchase(models.Model):
    """
    Tracks mobile in-app purchases from Google Play and Apple App Store.
    Requires verification before granting Pro access.
    """

    PLATFORM_CHOICES = [
        ('google', 'Google Play'),
        ('apple', 'Apple App Store'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='in_app_purchases',
        help_text=_('User who made this purchase')
    )

    platform = models.CharField(
        _('platform'),
        max_length=20,
        choices=PLATFORM_CHOICES,
        help_text=_('Platform where purchase was made')
    )

    purchase_token = models.CharField(
        _('purchase token'),
        max_length=4096,
        help_text=_('Purchase token from Google Play or Apple receipt data'),
        db_index=True
    )

    product_id = models.CharField(
        _('product ID'),
        max_length=255,
        help_text=_('Product ID from the app store (e.g., pro_monthly)')
    )

    is_verified = models.BooleanField(
        _('is verified'),
        default=False,
        help_text=_('Whether the purchase has been verified with the platform')
    )

    verified_at = models.DateTimeField(
        _('verified at'),
        null=True,
        blank=True,
        help_text=_('When the purchase was verified')
    )

    expires_at = models.DateTimeField(
        _('expires at'),
        null=True,
        blank=True,
        help_text=_('When the subscription expires (for subscriptions)')
    )

    is_active = models.BooleanField(
        _('is active'),
        default=False,
        help_text=_('Whether the purchase is currently active')
    )

    # Store the raw receipt/response for debugging
    raw_receipt = models.JSONField(
        _('raw receipt'),
        null=True,
        blank=True,
        help_text=_('Raw receipt data from the platform (for debugging)')
    )

    # Metadata
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        verbose_name = _('in-app purchase')
        verbose_name_plural = _('in-app purchases')
        db_table = 'in_app_purchases'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['platform']),
            models.Index(fields=['purchase_token']),
            models.Index(fields=['is_verified']),
            models.Index(fields=['is_active']),
        ]
        # Prevent duplicate purchase tokens per platform
        unique_together = [['platform', 'purchase_token']]

    def __str__(self):
        return f"{self.user.email} - {self.platform} - {self.product_id}"

    def verify_and_activate(self):
        """
        Mark purchase as verified and activate user's Pro subscription.
        Should be called after successful verification with the platform.
        """
        from django.utils import timezone

        self.is_verified = True
        self.verified_at = timezone.now()
        self.is_active = True
        self.save(update_fields=['is_verified', 'verified_at', 'is_active', 'updated_at'])

        # Activate Pro for the user
        self.user.activate_pro()

    def deactivate(self):
        """
        Deactivate the purchase (e.g., when subscription expires or is cancelled).
        """
        self.is_active = False
        self.save(update_fields=['is_active', 'updated_at'])

        # Check if user has any other active purchases or subscriptions
        has_active_subscription = (
            hasattr(self.user, 'subscription') and
            self.user.subscription.is_active
        )
        has_other_active_purchases = self.user.in_app_purchases.filter(
            is_active=True
        ).exclude(id=self.id).exists()

        # Deactivate Pro if no other active purchases/subscriptions
        if not has_active_subscription and not has_other_active_purchases:
            self.user.deactivate_pro()


class PaymentHistory(models.Model):
    """
    Tracks payment history for auditing and customer support.
    Created from Stripe webhook events.
    """

    STATUS_CHOICES = [
        ('succeeded', 'Succeeded'),
        ('failed', 'Failed'),
        ('pending', 'Pending'),
        ('refunded', 'Refunded'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='payment_history',
        help_text=_('User who made this payment')
    )

    stripe_payment_intent_id = models.CharField(
        _('Stripe payment intent ID'),
        max_length=255,
        unique=True,
        db_index=True,
        help_text=_('Stripe payment intent ID (pi_xxxxx)')
    )

    stripe_invoice_id = models.CharField(
        _('Stripe invoice ID'),
        max_length=255,
        null=True,
        blank=True,
        help_text=_('Stripe invoice ID (in_xxxxx)')
    )

    subscription = models.ForeignKey(
        Subscription,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payments',
        help_text=_('Related subscription if applicable')
    )

    amount = models.DecimalField(
        _('amount'),
        max_digits=10,
        decimal_places=2,
        help_text=_('Payment amount')
    )

    currency = models.CharField(
        _('currency'),
        max_length=3,
        default='USD',
        help_text=_('Payment currency (ISO 4217)')
    )

    status = models.CharField(
        _('status'),
        max_length=20,
        choices=STATUS_CHOICES,
        help_text=_('Payment status')
    )

    failure_message = models.TextField(
        _('failure message'),
        blank=True,
        help_text=_('Error message if payment failed')
    )

    # Metadata
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        verbose_name = _('payment history')
        verbose_name_plural = _('payment histories')
        db_table = 'payment_history'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['stripe_payment_intent_id']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.amount} {self.currency} - {self.status}"
