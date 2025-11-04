"""
Export models for MoneyGuard.
Handles export job tracking and status.
"""
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class ExportJob(models.Model):
    """
    Export job model for tracking CSV and PDF export requests.
    """
    EXPORT_TYPE_CHOICES = [
        ('csv', _('CSV')),
        ('pdf', _('PDF')),
    ]

    STATUS_CHOICES = [
        ('pending', _('Pending')),
        ('processing', _('Processing')),
        ('completed', _('Completed')),
        ('failed', _('Failed')),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='export_jobs',
        help_text=_('User who requested the export')
    )
    export_type = models.CharField(
        _('export type'),
        max_length=10,
        choices=EXPORT_TYPE_CHOICES,
        help_text=_('Type of export: CSV or PDF')
    )
    status = models.CharField(
        _('status'),
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        help_text=_('Current status of the export job')
    )
    file_url = models.URLField(
        _('file URL'),
        blank=True,
        help_text=_('URL to download the generated export file')
    )
    params = models.JSONField(
        _('parameters'),
        default=dict,
        blank=True,
        help_text=_('Export parameters (start_date, end_date, filters, etc.)')
    )
    error_message = models.TextField(
        _('error message'),
        blank=True,
        help_text=_('Error message if export failed')
    )
    file_size = models.IntegerField(
        _('file size (bytes)'),
        null=True,
        blank=True,
        help_text=_('Size of the generated file in bytes')
    )
    created_at = models.DateTimeField(
        _('created at'),
        auto_now_add=True,
        help_text=_('When the export was requested')
    )
    updated_at = models.DateTimeField(
        _('updated at'),
        auto_now=True,
        help_text=_('When the export was last updated')
    )
    completed_at = models.DateTimeField(
        _('completed at'),
        null=True,
        blank=True,
        help_text=_('When the export was completed')
    )

    class Meta:
        verbose_name = _('export job')
        verbose_name_plural = _('export jobs')
        db_table = 'export_jobs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['user', 'status']),
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.export_type} - {self.status}"

    def mark_as_processing(self):
        """Mark the export job as processing."""
        self.status = 'processing'
        self.save(update_fields=['status', 'updated_at'])

    def mark_as_completed(self, file_url, file_size=None):
        """Mark the export job as completed."""
        from django.utils import timezone
        self.status = 'completed'
        self.file_url = file_url
        if file_size:
            self.file_size = file_size
        self.completed_at = timezone.now()
        self.save(update_fields=['status', 'file_url', 'file_size', 'completed_at', 'updated_at'])

    def mark_as_failed(self, error_message):
        """Mark the export job as failed."""
        self.status = 'failed'
        self.error_message = error_message
        self.save(update_fields=['status', 'error_message', 'updated_at'])

    @property
    def is_expired(self):
        """Check if the export file is older than 30 days."""
        from django.utils import timezone
        from datetime import timedelta
        if self.completed_at:
            expiry_date = self.completed_at + timedelta(days=30)
            return timezone.now() > expiry_date
        return False
