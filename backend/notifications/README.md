# Notifications App

Comprehensive email notification system for MoneyGuard with user preferences and automated summaries.

## Features

- **User Notification Preferences** - Customizable email notification settings
- **Daily Summaries** - Automated daily transaction summaries sent via email
- **Weekly Summaries** - Weekly financial insights with top spending categories and budget status
- **Budget Alerts** - Real-time alerts when budget thresholds are reached
- **Celery Integration** - Background task processing with scheduled jobs

## Files Overview

### 1. `__init__.py`
Empty initialization file for the Django app.

### 2. `models.py`
**NotificationPreference Model:**
- `user` (OneToOneField) - User foreign key relationship
- `daily_summary` (BooleanField) - Enable/disable daily transaction summaries
- `weekly_summary` (BooleanField) - Enable/disable weekly summaries
- `budget_alerts` (BooleanField) - Enable/disable budget threshold alerts
- `recurring_transaction_alerts` (BooleanField) - Enable/disable recurring transaction alerts
- Timestamps: `created_at`, `updated_at`

### 3. `tasks.py`
**Celery Tasks:**
- `send_daily_summaries()` - Sends daily transaction summary to all opted-in users (runs daily at 8 AM)
- `send_weekly_summaries()` - Sends weekly summary with insights (runs Monday at 8 AM)
- `send_budget_alert(user_id, budget_id)` - Sends budget threshold alert to specific user

All tasks are configured in `/backend/moneyguard/celery.py` beat schedule.

### 4. `email_templates.py`
**Email Generation Functions:**
- `generate_daily_summary_email(user)` - Creates daily summary with income/expenses breakdown
- `generate_weekly_summary_email(user)` - Creates weekly summary with top categories and budget warnings
- `generate_budget_alert_email(user, budget)` - Creates budget alert with progress bar and details

Each function returns: `(subject, plain_text_message, html_message)`

### 5. `serializers.py`
**NotificationPreferenceSerializer:**
- Handles serialization/deserialization of notification preferences
- Includes user email (read-only)
- Validates preference updates

### 6. `views.py`
**API Endpoints:**
- `GET /api/notifications/preferences/` - Get user notification preferences
- `PATCH /api/notifications/preferences/update/` - Update notification preferences

Both endpoints require authentication.

### 7. `admin.py`
**Django Admin Configuration:**
- NotificationPreference admin panel
- List display with all preference fields
- Filterable by preference types
- Search by user email/name
- Read-only metadata fields

### 8. `urls.py`
URL routing configuration for notification endpoints.

### 9. `apps.py`
Django app configuration for notifications.

## Installation & Setup

### 1. Add to INSTALLED_APPS
Edit `/backend/moneyguard/settings/base.py`:

```python
INSTALLED_APPS = [
    # ... other apps ...
    'notifications',
]
```

### 2. Configure Email Settings
Edit `/backend/moneyguard/settings/base.py`:

```python
# Email Configuration
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'  # or your SMTP server
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@example.com'
EMAIL_HOST_PASSWORD = 'your-app-password'
DEFAULT_FROM_EMAIL = 'MoneyGuard <noreply@moneyguard.com>'
```

For development, you can use console backend:
```python
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
```

### 3. Include URLs
Edit `/backend/moneyguard/urls.py`:

```python
from django.urls import path, include

urlpatterns = [
    # ... other patterns ...
    path('api/notifications/', include('notifications.urls')),
]
```

### 4. Run Migrations

```bash
cd /home/user/expense_tracking/backend
python manage.py makemigrations notifications
python manage.py migrate notifications
```

### 5. Start Celery Workers

For development:
```bash
# Terminal 1 - Start Celery worker
celery -A moneyguard worker -l info

# Terminal 2 - Start Celery beat (scheduler)
celery -A moneyguard beat -l info
```

For production, use systemd services or supervisor.

## API Usage Examples

### Get Notification Preferences

```bash
curl -X GET http://localhost:8000/api/notifications/preferences/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Response:
```json
{
  "user_email": "user@example.com",
  "daily_summary": true,
  "weekly_summary": true,
  "budget_alerts": true,
  "recurring_transaction_alerts": true,
  "created_at": "2024-11-04T21:00:00Z",
  "updated_at": "2024-11-04T21:00:00Z"
}
```

### Update Notification Preferences

```bash
curl -X PATCH http://localhost:8000/api/notifications/preferences/update/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "daily_summary": false,
    "budget_alerts": true
  }'
```

Response:
```json
{
  "user_email": "user@example.com",
  "daily_summary": false,
  "weekly_summary": true,
  "budget_alerts": true,
  "recurring_transaction_alerts": true,
  "created_at": "2024-11-04T21:00:00Z",
  "updated_at": "2024-11-04T21:05:00Z"
}
```

## Triggering Budget Alerts

Budget alerts can be triggered manually from code:

```python
from notifications.tasks import send_budget_alert

# Trigger alert for specific user and budget
send_budget_alert.delay(user_id=1, budget_id=5)
```

Or integrate into your Budget model to automatically send alerts:

```python
# In finance/models.py - Budget model
def check_and_send_alert(self):
    """Check if alert threshold reached and send notification."""
    percentage_used = self.get_percentage_used()

    if percentage_used >= self.alert_threshold:
        from notifications.tasks import send_budget_alert
        send_budget_alert.delay(self.user.id, self.id)
```

## Email Templates

All emails include both plain text and HTML versions:

### Daily Summary Email
- Transaction count for the day
- Income vs Expense breakdown
- Net total (with color coding)
- Individual transaction list with categories

### Weekly Summary Email
- 7-day transaction summary
- Top 5 spending categories
- Budget warnings (if any budgets exceed threshold)
- Transaction count

### Budget Alert Email
- Visual progress bar
- Category and period information
- Amount spent vs budget limit
- Remaining budget amount
- Alert threshold percentage

## Testing

### Manual Testing
```bash
# Test sending daily summaries
python manage.py shell
>>> from notifications.tasks import send_daily_summaries
>>> send_daily_summaries()

# Test budget alert
>>> from notifications.tasks import send_budget_alert
>>> send_budget_alert(user_id=1, budget_id=1)
```

### Celery Beat Schedule
Tasks are scheduled in `/backend/moneyguard/celery.py`:
- Daily summaries: 8:00 AM every day
- Weekly summaries: Monday 8:00 AM
- Can be customized by editing the crontab schedule

## Admin Panel

Access notification preferences at:
`http://localhost:8000/admin/notifications/notificationpreference/`

Features:
- View all users' notification preferences
- Filter by preference types
- Search by user email/name
- Edit preferences (read-only user field)
- View creation/update timestamps

## Security Considerations

1. **Authentication Required** - All endpoints require user authentication
2. **User Isolation** - Users can only view/edit their own preferences
3. **Email Privacy** - Emails are sent only to opted-in users
4. **Rate Limiting** - Consider adding rate limiting for preference updates
5. **GDPR Compliance** - Users can disable all notifications

## Troubleshooting

### Emails Not Sending

1. Check email configuration in settings
2. Verify EMAIL_BACKEND is not console backend in production
3. Check Celery worker logs: `celery -A moneyguard worker -l debug`
4. Test SMTP connection manually

### Tasks Not Running

1. Ensure Celery beat is running
2. Check beat schedule in celery.py
3. Verify broker (Redis/RabbitMQ) is running
4. Check worker logs for errors

### Preferences Not Created

1. Preferences are created automatically on first GET request
2. Can also be created in Django admin
3. Run migrations if model doesn't exist

## Future Enhancements

- [ ] SMS notifications support
- [ ] Push notifications for mobile apps
- [ ] Customizable email templates via admin
- [ ] Notification history/log
- [ ] Email preference management from email links
- [ ] A/B testing for email content
- [ ] Notification delivery statistics

## Dependencies

- Django (core framework)
- Celery (background tasks)
- django-celery-beat (scheduled tasks)
- Redis or RabbitMQ (message broker)

All dependencies are included in `/backend/requirements.txt`.
