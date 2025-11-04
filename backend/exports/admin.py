"""
Admin configuration for the exports app.
"""
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import ExportJob


@admin.register(ExportJob)
class ExportJobAdmin(admin.ModelAdmin):
    """
    Admin interface for ExportJob model.
    """
    list_display = [
        'id',
        'user_email',
        'export_type',
        'status_badge',
        'file_size_display',
        'created_at',
        'completed_at',
        'download_link',
    ]
    list_filter = [
        'export_type',
        'status',
        'created_at',
        'completed_at',
    ]
    search_fields = [
        'user__email',
        'user__first_name',
        'user__last_name',
        'error_message',
    ]
    readonly_fields = [
        'id',
        'user',
        'created_at',
        'updated_at',
        'completed_at',
        'file_size',
        'params_display',
        'download_button',
    ]
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'user', 'export_type', 'status')
        }),
        ('Export Parameters', {
            'fields': ('params_display',),
            'classes': ('collapse',)
        }),
        ('File Information', {
            'fields': ('file_url', 'file_size', 'download_button')
        }),
        ('Status Information', {
            'fields': ('error_message', 'created_at', 'updated_at', 'completed_at')
        }),
    )
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    list_per_page = 50

    def user_email(self, obj):
        """Display user email with link to user admin."""
        if obj.user:
            url = reverse('admin:users_user_change', args=[obj.user.id])
            return format_html('<a href="{}">{}</a>', url, obj.user.email)
        return '-'
    user_email.short_description = 'User'
    user_email.admin_order_field = 'user__email'

    def status_badge(self, obj):
        """Display status with colored badge."""
        colors = {
            'pending': '#FFA500',    # Orange
            'processing': '#2196F3', # Blue
            'completed': '#4CAF50',  # Green
            'failed': '#F44336',     # Red
        }
        color = colors.get(obj.status, '#999999')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; '
            'border-radius: 3px; font-weight: bold;">{}</span>',
            color,
            obj.status.upper()
        )
    status_badge.short_description = 'Status'
    status_badge.admin_order_field = 'status'

    def file_size_display(self, obj):
        """Display file size in human-readable format."""
        if not obj.file_size:
            return '-'

        size = obj.file_size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"
    file_size_display.short_description = 'File Size'
    file_size_display.admin_order_field = 'file_size'

    def download_link(self, obj):
        """Display download link if file is available."""
        if obj.status == 'completed' and obj.file_url:
            return format_html(
                '<a href="{}" target="_blank" style="color: #2196F3; text-decoration: none;">'
                '⬇️ Download</a>',
                obj.file_url
            )
        return '-'
    download_link.short_description = 'Download'

    def download_button(self, obj):
        """Display download button in detail view."""
        if obj.status == 'completed' and obj.file_url:
            return format_html(
                '<a href="{}" target="_blank" class="button" style="padding: 10px 15px; '
                'background-color: #2196F3; color: white; text-decoration: none; '
                'border-radius: 4px;">⬇️ Download Export File</a>',
                obj.file_url
            )
        return format_html('<span style="color: #999;">No file available</span>')
    download_button.short_description = 'Download'

    def params_display(self, obj):
        """Display export parameters in a formatted way."""
        if not obj.params:
            return format_html('<span style="color: #999;">No parameters</span>')

        html = '<table style="width: 100%; border-collapse: collapse;">'
        for key, value in obj.params.items():
            html += f'''
                <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 8px; font-weight: bold; width: 200px;">{key}</td>
                    <td style="padding: 8px;">{value}</td>
                </tr>
            '''
        html += '</table>'
        return mark_safe(html)
    params_display.short_description = 'Export Parameters'

    def has_add_permission(self, request):
        """Disable add permission - exports should be created via API."""
        return False

    def has_change_permission(self, request, obj=None):
        """Disable change permission - exports are immutable."""
        return False

    def get_actions(self, request):
        """Custom admin actions."""
        actions = super().get_actions(request)
        # Add custom action to retry failed exports
        actions['retry_failed_exports'] = (
            self.retry_failed_exports,
            'retry_failed_exports',
            'Retry selected failed exports'
        )
        return actions

    def retry_failed_exports(self, request, queryset):
        """Retry failed export jobs."""
        from .tasks import process_export_job

        failed_exports = queryset.filter(status='failed')
        count = 0

        for export in failed_exports:
            export.status = 'pending'
            export.error_message = ''
            export.save()
            process_export_job.delay(export.id)
            count += 1

        self.message_user(
            request,
            f'{count} export(s) have been queued for retry.'
        )
    retry_failed_exports.short_description = 'Retry selected failed exports'
