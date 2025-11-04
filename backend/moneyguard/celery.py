"""
Celery configuration for MoneyGuard.
"""
import os
from celery import Celery
from celery.schedules import crontab

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moneyguard.settings.development')

app = Celery('moneyguard')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys
#   should have a `CELERY_` prefix.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

# Celery Beat schedule for periodic tasks
app.conf.beat_schedule = {
    'process-recurring-transactions': {
        'task': 'finance.tasks.process_recurring_transactions',
        'schedule': crontab(hour='*/1'),  # Every hour
    },
    'send-daily-summaries': {
        'task': 'notifications.tasks.send_daily_summaries',
        'schedule': crontab(hour='8', minute='0'),  # 8 AM daily
    },
    'send-weekly-summaries': {
        'task': 'notifications.tasks.send_weekly_summaries',
        'schedule': crontab(day_of_week='monday', hour='8', minute='0'),  # Monday 8 AM
    },
    'cleanup-old-export-files': {
        'task': 'exports.tasks.cleanup_old_exports',
        'schedule': crontab(hour='2', minute='0'),  # 2 AM daily
    },
}

@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
