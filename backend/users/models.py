"""
User model for MoneyGuard.
Extends Django's AbstractUser with additional fields for Pro subscription tracking.
"""
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _
from .managers import UserManager


class User(AbstractUser):
    """
    Custom user model with email as the primary identifier.
    Includes Pro subscription tracking and user preferences.
    """

    # Override username to make email the primary identifier
    username = None
    email = models.EmailField(_('email address'), unique=True, db_index=True)

    # Subscription status
    is_pro = models.BooleanField(
        _('pro subscriber'),
        default=False,
        help_text=_('Indicates if user has an active Pro subscription')
    )

    # Stripe customer ID for billing
    stripe_customer_id = models.CharField(
        _('stripe customer ID'),
        max_length=255,
        blank=True,
        null=True,
        unique=True,
        db_index=True,
    )

    # User preferences
    timezone = models.CharField(
        _('timezone'),
        max_length=50,
        default='UTC',
        help_text=_('User timezone for date/time display')
    )

    locale = models.CharField(
        _('locale'),
        max_length=10,
        default='en',
        help_text=_('User preferred language')
    )

    # Default currency
    default_currency = models.CharField(
        _('default currency'),
        max_length=3,
        default='USD',
        help_text=_('User default currency code (ISO 4217)')
    )

    # Privacy settings
    ads_consent = models.BooleanField(
        _('personalized ads consent'),
        default=False,
        help_text=_('User consent for personalized ads (GDPR)')
    )

    # Metadata
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    last_login_ip = models.GenericIPAddressField(
        _('last login IP'),
        blank=True,
        null=True,
        help_text=_('IP address of last login (for security)')
    )

    # Use email as the USERNAME_FIELD
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')
        db_table = 'users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['stripe_customer_id']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return self.email

    @property
    def full_name(self):
        """Return user's full name or email if name not set."""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.email

    def activate_pro(self):
        """Activate Pro subscription for this user."""
        self.is_pro = True
        self.save(update_fields=['is_pro', 'updated_at'])

    def deactivate_pro(self):
        """Deactivate Pro subscription for this user."""
        self.is_pro = False
        self.save(update_fields=['is_pro', 'updated_at'])

    def update_last_login_ip(self, ip_address):
        """Update last login IP address."""
        self.last_login_ip = ip_address
        self.save(update_fields=['last_login_ip'])


class UserActivityLog(models.Model):
    """
    Log of important user activities for security and auditing.
    Does not contain sensitive data.
    """
    ACTION_CHOICES = [
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('password_change', 'Password Changed'),
        ('email_change', 'Email Changed'),
        ('pro_activated', 'Pro Activated'),
        ('pro_cancelled', 'Pro Cancelled'),
        ('export_created', 'Export Created'),
        ('account_deleted', 'Account Deleted'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='activity_logs'
    )
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # Additional context (JSON field for flexibility)
    metadata = models.JSONField(blank=True, null=True)

    class Meta:
        verbose_name = _('user activity log')
        verbose_name_plural = _('user activity logs')
        db_table = 'user_activity_logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['action']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.action} at {self.created_at}"
