# Exports App

The exports app handles CSV and PDF export generation for user transactions in MoneyGuard.

## Features

- **CSV Export**: Generate comma-separated values files with transaction data
- **PDF Export**: Generate formatted PDF reports with summary statistics
- **Asynchronous Processing**: Uses Celery for background job processing
- **Rate Limiting**: Free users limited to 10 exports/hour, Pro users unlimited
- **Auto Cleanup**: Automatically deletes exports older than 30 days
- **Filtering**: Support for date range, account, category, and transaction type filters

## Models

### ExportJob

Tracks export job requests and their status.

**Fields:**
- `user` - Foreign key to User model
- `export_type` - Choice: 'csv' or 'pdf'
- `status` - Choice: 'pending', 'processing', 'completed', 'failed'
- `file_url` - URL to download the generated file
- `params` - JSONField storing export parameters (filters)
- `error_message` - Error message if export failed
- `file_size` - Size of generated file in bytes
- `created_at` - Timestamp when export was requested
- `updated_at` - Timestamp when export was last updated
- `completed_at` - Timestamp when export was completed

## API Endpoints

### Create Export
```
POST /api/exports/create/
Content-Type: application/json
Authorization: Bearer <token>

{
  "export_type": "csv",  // or "pdf"
  "start_date": "2024-01-01",  // optional
  "end_date": "2024-12-31",    // optional
  "account_ids": [1, 2, 3],    // optional
  "category_ids": [5, 6],      // optional
  "transaction_type": "all"     // "expense", "income", or "all"
}
```

**Response:**
```json
{
  "id": 123,
  "user": 45,
  "user_email": "user@example.com",
  "export_type": "csv",
  "status": "pending",
  "file_url": "",
  "params": {...},
  "error_message": "",
  "file_size": null,
  "created_at": "2024-11-04T21:00:00Z",
  "updated_at": "2024-11-04T21:00:00Z",
  "completed_at": null,
  "is_expired": false
}
```

### Get Export Status
```
GET /api/exports/<job_id>/
Authorization: Bearer <token>
```

### List Exports
```
GET /api/exports/?status=completed&export_type=csv&limit=50
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` - Filter by status (pending, processing, completed, failed)
- `export_type` - Filter by type (csv, pdf)
- `limit` - Number of results (default: 50, max: 100)

### Delete Export
```
DELETE /api/exports/<job_id>/delete/
Authorization: Bearer <token>
```

### Export Statistics
```
GET /api/exports/stats/
Authorization: Bearer <token>
```

**Response:**
```json
{
  "total_exports": 25,
  "exports_by_status": {
    "pending": 0,
    "processing": 1,
    "completed": 23,
    "failed": 1
  },
  "exports_last_hour": 3,
  "is_pro": false,
  "quota_limit": 10,
  "quota_remaining": 7
}
```

## Rate Limiting

### Free Users
- **Limit**: 10 exports per hour
- **Response when exceeded**: `429 Too Many Requests`

### Pro Users
- **Limit**: Unlimited
- No throttling applied

## Celery Tasks

### process_export_job(job_id)
Processes an export job by generating the CSV or PDF file.

**Features:**
- Automatic retry on failure (max 3 retries)
- Exponential backoff between retries
- Updates job status throughout process
- Stores file in media/exports/ directory

**Usage:**
```python
from exports.tasks import process_export_job
process_export_job.delay(job_id)
```

### cleanup_old_exports()
Deletes export jobs and files older than 30 days.

**Scheduled**: Daily at 2:00 AM (configured in celery.py)

**Also cleans:**
- Failed jobs older than 7 days
- Orphaned files without database records

**Usage:**
```python
from exports.tasks import cleanup_old_exports
cleanup_old_exports.delay()
```

### cleanup_orphaned_export_files()
Removes export files that don't have corresponding database records.

**Usage:**
```python
from exports.tasks import cleanup_orphaned_export_files
cleanup_orphaned_export_files.delay()
```

## Generators

### generate_csv_export(user, params)
Generates a CSV file with transaction data.

**CSV Format:**
- Header row with column names
- One row per transaction
- Summary section with statistics
- UTF-8 encoding

**Returns:** `(file_path, file_size)`

### generate_pdf_export(user, params)
Generates a formatted PDF report with transaction data.

**PDF Features:**
- Professional layout with header and summary
- Colored table for transactions
- Income/expense color coding
- Summary statistics table
- User info and date range

**Returns:** `(file_path, file_size)`

## Filter Parameters

Both export types support the same filtering parameters:

- **start_date** (YYYY-MM-DD): Include transactions from this date onwards
- **end_date** (YYYY-MM-DD): Include transactions up to this date
- **account_ids** (list): Include only transactions from these accounts
- **category_ids** (list): Include only transactions from these categories
- **transaction_type** (string): Filter by 'expense', 'income', or 'all'

## Installation & Setup

1. **Run Migrations**
```bash
cd backend
python manage.py makemigrations exports
python manage.py migrate exports
```

2. **Start Celery Worker**
```bash
celery -A moneyguard worker -l info
```

3. **Start Celery Beat (for scheduled tasks)**
```bash
celery -A moneyguard beat -l info
```

## Admin Interface

The exports app includes a comprehensive Django admin interface:

**Features:**
- List view with status badges
- Filterable by type, status, and date
- Searchable by user email
- Download links for completed exports
- Retry action for failed exports
- Read-only fields (exports are immutable)
- Detailed parameter display

**Access:** http://localhost:8000/admin/exports/exportjob/

## File Storage

Export files are stored in:
```
media/exports/export_{user_id}_{timestamp}.{csv|pdf}
```

**Example:**
```
media/exports/export_42_20241104_210000.csv
media/exports/export_42_20241104_210000.pdf
```

## Security Considerations

1. **Authentication Required**: All endpoints require JWT authentication
2. **User Isolation**: Users can only access their own exports
3. **Rate Limiting**: Prevents abuse through throttling
4. **Auto Cleanup**: Files automatically deleted after 30 days
5. **Error Handling**: Detailed errors logged but generic messages returned to users

## Testing

### Create a Test Export
```python
from django.contrib.auth import get_user_model
from exports.models import ExportJob
from exports.tasks import process_export_job

User = get_user_model()
user = User.objects.first()

# Create export job
job = ExportJob.objects.create(
    user=user,
    export_type='csv',
    params={
        'start_date': '2024-01-01',
        'end_date': '2024-12-31',
        'transaction_type': 'all'
    }
)

# Process it
process_export_job(job.id)
```

## Troubleshooting

### Export Stays in "Pending" Status
- Check if Celery worker is running
- Check Celery logs for errors
- Verify Redis connection

### Export Fails with Error
- Check task logs: `celery -A moneyguard worker -l debug`
- Verify media directory permissions
- Check that reportlab is installed: `pip install reportlab`

### Rate Limit Issues
- Check user's `is_pro` status
- Verify export count in last hour
- Review throttle settings in settings.py

## Dependencies

- Django >= 4.2
- djangorestframework >= 3.14
- celery >= 5.3
- redis >= 5.0
- reportlab >= 4.1 (for PDF generation)
- psycopg2-binary >= 2.9 (PostgreSQL)

## Future Enhancements

- [ ] Excel (XLSX) export format
- [ ] Email delivery of exports
- [ ] Export templates
- [ ] Scheduled exports
- [ ] Export history analytics
- [ ] Batch export for multiple date ranges
- [ ] Custom column selection
- [ ] Export sharing (with expiring links)
