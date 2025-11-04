"""
Notification models for MoneyGuard.
Manages user notification preferences.
"""
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class NotificationPreference(models.Model):
    """
    User notification preferences for email alerts and summaries.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notification_preferences',
        primary_key=True
    )

    # Email notification preferences
    daily_summary = models.BooleanField(
        _('daily summary'),
        default=True,
        help_text=_('Receive daily transaction summary email')
    )

    weekly_summary = models.BooleanField(
        _('weekly summary'),
        default=True,
        help_text=_('Receive weekly summary with insights')
    )

    budget_alerts = models.BooleanField(
        _('budget alerts'),
        default=True,
        help_text=_('Receive alerts when approaching budget limits')
    )

    recurring_transaction_alerts = models.BooleanField(
        _('recurring transaction alerts'),
        default=True,
        help_text=_('Receive alerts for upcoming recurring transactions')
    )

    # Metadata
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        verbose_name = _('notification preference')
        verbose_name_plural = _('notification preferences')
        db_table = 'notification_preferences'

    def __str__(self):
        return f"Notification preferences for {self.user.email}"
