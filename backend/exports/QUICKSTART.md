# Exports App - Quick Start Guide

## Installation

1. **The exports app is already configured in `settings.py`**
   - Listed in `INSTALLED_APPS`
   - URLs already included in main `urls.py`
   - Celery task scheduled in `celery.py`

2. **Run Database Migrations**
   ```bash
   cd /home/user/expense_tracking/backend
   python manage.py migrate exports
   ```

3. **Start Required Services**

   **Terminal 1 - Django Server:**
   ```bash
   python manage.py runserver
   ```

   **Terminal 2 - Celery Worker:**
   ```bash
   celery -A moneyguard worker -l info
   ```

   **Terminal 3 - Celery Beat (for scheduled cleanup):**
   ```bash
   celery -A moneyguard beat -l info
   ```

## Quick API Examples

### 1. Create a CSV Export

```bash
curl -X POST http://localhost:8000/api/exports/create/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "export_type": "csv",
    "start_date": "2024-01-01",
    "end_date": "2024-12-31",
    "transaction_type": "all"
  }'
```

**Response:**
```json
{
  "id": 1,
  "user": 1,
  "user_email": "user@example.com",
  "export_type": "csv",
  "status": "pending",
  "file_url": "",
  "params": {
    "start_date": "2024-01-01",
    "end_date": "2024-12-31",
    "transaction_type": "all"
  },
  "created_at": "2024-11-04T21:00:00Z"
}
```

### 2. Check Export Status

```bash
curl -X GET http://localhost:8000/api/exports/1/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (when completed):**
```json
{
  "id": 1,
  "export_type": "csv",
  "status": "completed",
  "file_url": "http://localhost:8000/media/exports/export_1_20241104_210000.csv",
  "file_size": 2048,
  "completed_at": "2024-11-04T21:00:15Z"
}
```

### 3. Download the File

```bash
wget http://localhost:8000/media/exports/export_1_20241104_210000.csv
```

Or open the `file_url` in your browser.

### 4. List All Exports

```bash
curl -X GET http://localhost:8000/api/exports/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Get Export Statistics

```bash
curl -X GET http://localhost:8000/api/exports/stats/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "total_exports": 5,
  "exports_by_status": {
    "pending": 0,
    "processing": 0,
    "completed": 4,
    "failed": 1
  },
  "exports_last_hour": 2,
  "is_pro": false,
  "quota_limit": 10,
  "quota_remaining": 8
}
```

## Using in Python Code

### Create an Export Programmatically

```python
from django.contrib.auth import get_user_model
from exports.models import ExportJob
from exports.tasks import process_export_job

User = get_user_model()
user = User.objects.get(email='user@example.com')

# Create export job
job = ExportJob.objects.create(
    user=user,
    export_type='csv',
    params={
        'start_date': '2024-01-01',
        'end_date': '2024-12-31',
        'account_ids': [1, 2],
        'transaction_type': 'expense'
    }
)

# Queue the export task
process_export_job.delay(job.id)

print(f"Export job {job.id} created and queued")
```

### Check Job Status

```python
from exports.models import ExportJob

job = ExportJob.objects.get(id=1)
print(f"Status: {job.status}")
print(f"File URL: {job.file_url}")
print(f"File Size: {job.file_size} bytes")
```

### Manually Trigger Cleanup

```python
from exports.tasks import cleanup_old_exports

result = cleanup_old_exports()
print(f"Deleted {result['deleted_jobs']} jobs")
print(f"Deleted {result['deleted_files']} files")
```

## Filter Options

### Date Filters
```json
{
  "start_date": "2024-01-01",
  "end_date": "2024-12-31"
}
```

### Account Filter
```json
{
  "account_ids": [1, 2, 3]
}
```

### Category Filter
```json
{
  "category_ids": [5, 6, 7]
}
```

### Transaction Type Filter
```json
{
  "transaction_type": "expense"  // Options: "expense", "income", "all"
}
```

### Combined Filters
```json
{
  "export_type": "pdf",
  "start_date": "2024-01-01",
  "end_date": "2024-03-31",
  "account_ids": [1],
  "category_ids": [5, 6],
  "transaction_type": "expense"
}
```

## Rate Limits

### Free Users
- **Limit:** 10 exports per hour
- **Status Code:** 429 when exceeded
- **Response:**
  ```json
  {
    "error": "Export limit reached. Free users can create up to 10 exports per hour. Upgrade to Pro for unlimited exports."
  }
  ```

### Pro Users
- **Limit:** Unlimited
- No throttling applied

## File Retention

- Export files are automatically deleted after **30 days**
- Cleanup runs daily at **2:00 AM**
- Failed export jobs deleted after **7 days**

## Testing

### Run All Tests
```bash
cd /home/user/expense_tracking/backend
python manage.py test exports
```

### Run Specific Test Class
```bash
python manage.py test exports.tests.ExportAPITests
```

### Run with Coverage
```bash
pytest --cov=exports --cov-report=html
```

## Admin Interface

Access the admin interface at:
```
http://localhost:8000/admin/exports/exportjob/
```

**Features:**
- View all export jobs
- Filter by status, type, date
- Search by user email
- Download completed exports
- Retry failed exports
- View detailed parameters

## Troubleshooting

### Export Stuck in "Pending"
**Cause:** Celery worker not running

**Solution:**
```bash
celery -A moneyguard worker -l info
```

### Export Failed with Error
**Check Celery logs:**
```bash
celery -A moneyguard worker -l debug
```

**Check Django logs:**
```bash
tail -f /home/user/expense_tracking/backend/logs/moneyguard.log
```

### "No module named 'reportlab'"
**Solution:**
```bash
pip install reportlab
```

### Rate Limit Issues
**Check user's Pro status:**
```python
from django.contrib.auth import get_user_model
User = get_user_model()
user = User.objects.get(email='user@example.com')
print(f"Is Pro: {user.is_pro}")
```

**Upgrade to Pro:**
```python
user.activate_pro()
```

### File Not Found (404)
**Check media files are being served:**
- Verify `MEDIA_ROOT` and `MEDIA_URL` in settings
- Ensure Django is serving media files in development
- Check file exists: `ls -la /home/user/expense_tracking/backend/media/exports/`

## Production Considerations

1. **Use a proper file storage backend** (S3, Google Cloud Storage)
2. **Enable HTTPS** for secure file downloads
3. **Set up monitoring** for Celery workers
4. **Configure Redis** for task queue
5. **Set up logging** to track export failures
6. **Use CDN** for faster file downloads
7. **Implement signed URLs** for temporary access

## API Documentation

Full API documentation available at:
```
http://localhost:8000/api/docs/
```

Interactive API schema with request/response examples.

## Next Steps

1. ✅ Run migrations: `python manage.py migrate exports`
2. ✅ Start Celery worker
3. ✅ Test API endpoints
4. ✅ Access admin interface
5. ✅ Create your first export!

## Support

For issues or questions, check:
- `/home/user/expense_tracking/backend/exports/README.md` - Full documentation
- `/home/user/expense_tracking/backend/exports/tests.py` - Test examples
- Django logs: `/home/user/expense_tracking/backend/logs/`
