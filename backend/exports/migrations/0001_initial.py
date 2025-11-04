# Generated migration file for ExportJob model
# Run 'python manage.py makemigrations' to regenerate this file

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='ExportJob',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('export_type', models.CharField(choices=[('csv', 'CSV'), ('pdf', 'PDF')], help_text='Type of export: CSV or PDF', max_length=10, verbose_name='export type')),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('processing', 'Processing'), ('completed', 'Completed'), ('failed', 'Failed')], default='pending', help_text='Current status of the export job', max_length=20, verbose_name='status')),
                ('file_url', models.URLField(blank=True, help_text='URL to download the generated export file', verbose_name='file URL')),
                ('params', models.JSONField(blank=True, default=dict, help_text='Export parameters (start_date, end_date, filters, etc.)', verbose_name='parameters')),
                ('error_message', models.TextField(blank=True, help_text='Error message if export failed', verbose_name='error message')),
                ('file_size', models.IntegerField(blank=True, help_text='Size of the generated file in bytes', null=True, verbose_name='file size (bytes)')),
                ('created_at', models.DateTimeField(auto_now_add=True, help_text='When the export was requested', verbose_name='created at')),
                ('updated_at', models.DateTimeField(auto_now=True, help_text='When the export was last updated', verbose_name='updated at')),
                ('completed_at', models.DateTimeField(blank=True, help_text='When the export was completed', null=True, verbose_name='completed at')),
                ('user', models.ForeignKey(help_text='User who requested the export', on_delete=django.db.models.deletion.CASCADE, related_name='export_jobs', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'export job',
                'verbose_name_plural': 'export jobs',
                'db_table': 'export_jobs',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='exportjob',
            index=models.Index(fields=['user', '-created_at'], name='export_jobs_user_id_created_idx'),
        ),
        migrations.AddIndex(
            model_name='exportjob',
            index=models.Index(fields=['user', 'status'], name='export_jobs_user_id_status_idx'),
        ),
        migrations.AddIndex(
            model_name='exportjob',
            index=models.Index(fields=['status', 'created_at'], name='export_jobs_status_created_idx'),
        ),
        migrations.AddIndex(
            model_name='exportjob',
            index=models.Index(fields=['created_at'], name='export_jobs_created_at_idx'),
        ),
    ]
