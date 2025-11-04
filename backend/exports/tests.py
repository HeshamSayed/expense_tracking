"""
Tests for the exports app.
"""
from datetime import datetime, timedelta
from decimal import Decimal
from unittest.mock import patch, MagicMock
from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.files.base import ContentFile
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from finance.models import Account, Category, Transaction
from .models import ExportJob
from .tasks import process_export_job, cleanup_old_exports
from .generators import generate_csv_export, generate_pdf_export

User = get_user_model()


class ExportJobModelTests(TestCase):
    """Tests for ExportJob model."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )

    def test_create_export_job(self):
        """Test creating an export job."""
        job = ExportJob.objects.create(
            user=self.user,
            export_type='csv',
            params={'start_date': '2024-01-01', 'end_date': '2024-12-31'}
        )
        self.assertEqual(job.status, 'pending')
        self.assertEqual(job.export_type, 'csv')
        self.assertFalse(job.is_expired)

    def test_mark_as_processing(self):
        """Test marking job as processing."""
        job = ExportJob.objects.create(user=self.user, export_type='csv')
        job.mark_as_processing()
        job.refresh_from_db()
        self.assertEqual(job.status, 'processing')

    def test_mark_as_completed(self):
        """Test marking job as completed."""
        job = ExportJob.objects.create(user=self.user, export_type='csv')
        job.mark_as_completed('http://example.com/file.csv', 1024)
        job.refresh_from_db()
        self.assertEqual(job.status, 'completed')
        self.assertEqual(job.file_url, 'http://example.com/file.csv')
        self.assertEqual(job.file_size, 1024)
        self.assertIsNotNone(job.completed_at)

    def test_mark_as_failed(self):
        """Test marking job as failed."""
        job = ExportJob.objects.create(user=self.user, export_type='csv')
        job.mark_as_failed('Test error message')
        job.refresh_from_db()
        self.assertEqual(job.status, 'failed')
        self.assertEqual(job.error_message, 'Test error message')

    def test_is_expired_property(self):
        """Test is_expired property."""
        job = ExportJob.objects.create(user=self.user, export_type='csv')

        # Not expired (just created)
        job.completed_at = timezone.now()
        job.save()
        self.assertFalse(job.is_expired)

        # Expired (31 days old)
        job.completed_at = timezone.now() - timedelta(days=31)
        job.save()
        self.assertTrue(job.is_expired)


class ExportAPITests(APITestCase):
    """Tests for export API endpoints."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            is_pro=False
        )
        self.pro_user = User.objects.create_user(
            email='pro@example.com',
            password='testpass123',
            is_pro=True
        )

        # Create test account and transactions
        self.account = Account.objects.create(
            user=self.user,
            name='Test Account',
            currency='USD',
            balance=Decimal('1000.00')
        )

        self.category = Category.objects.create(
            user=self.user,
            name='Food',
            type='expense'
        )

        Transaction.objects.create(
            user=self.user,
            account=self.account,
            category=self.category,
            amount=Decimal('50.00'),
            currency='USD',
            transaction_type='expense',
            date=timezone.now().date(),
            notes='Test transaction'
        )

        self.client = APIClient()

    def test_create_export_authenticated(self):
        """Test creating export with authentication."""
        self.client.force_authenticate(user=self.user)

        with patch('exports.views.process_export_job.delay') as mock_task:
            response = self.client.post('/api/exports/create/', {
                'export_type': 'csv',
                'start_date': '2024-01-01',
                'end_date': '2024-12-31'
            })

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['export_type'], 'csv')
        self.assertEqual(response.data['status'], 'pending')
        mock_task.assert_called_once()

    def test_create_export_unauthenticated(self):
        """Test creating export without authentication."""
        response = self.client.post('/api/exports/create/', {
            'export_type': 'csv'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_export_invalid_type(self):
        """Test creating export with invalid type."""
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/exports/create/', {
            'export_type': 'invalid'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_export_invalid_dates(self):
        """Test creating export with invalid date range."""
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/exports/create/', {
            'export_type': 'csv',
            'start_date': '2024-12-31',
            'end_date': '2024-01-01'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_export_own_job(self):
        """Test retrieving own export job."""
        self.client.force_authenticate(user=self.user)
        job = ExportJob.objects.create(
            user=self.user,
            export_type='csv'
        )

        response = self.client.get(f'/api/exports/{job.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], job.id)

    def test_get_export_other_user_job(self):
        """Test retrieving another user's export job."""
        other_user = User.objects.create_user(
            email='other@example.com',
            password='testpass123'
        )
        job = ExportJob.objects.create(
            user=other_user,
            export_type='csv'
        )

        self.client.force_authenticate(user=self.user)
        response = self.client.get(f'/api/exports/{job.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_list_exports(self):
        """Test listing user's exports."""
        self.client.force_authenticate(user=self.user)

        # Create multiple exports
        ExportJob.objects.create(user=self.user, export_type='csv', status='completed')
        ExportJob.objects.create(user=self.user, export_type='pdf', status='pending')

        response = self.client.get('/api/exports/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)

    def test_list_exports_with_filters(self):
        """Test listing exports with filters."""
        self.client.force_authenticate(user=self.user)

        ExportJob.objects.create(user=self.user, export_type='csv', status='completed')
        ExportJob.objects.create(user=self.user, export_type='pdf', status='pending')

        response = self.client.get('/api/exports/?status=completed')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['status'], 'completed')

    def test_delete_export(self):
        """Test deleting an export."""
        self.client.force_authenticate(user=self.user)
        job = ExportJob.objects.create(
            user=self.user,
            export_type='csv'
        )

        response = self.client.delete(f'/api/exports/{job.id}/delete/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(ExportJob.objects.filter(id=job.id).exists())

    def test_export_stats(self):
        """Test export statistics endpoint."""
        self.client.force_authenticate(user=self.user)

        ExportJob.objects.create(user=self.user, export_type='csv', status='completed')
        ExportJob.objects.create(user=self.user, export_type='pdf', status='pending')

        response = self.client.get('/api/exports/stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_exports'], 2)
        self.assertEqual(response.data['is_pro'], False)
        self.assertEqual(response.data['quota_limit'], 10)

    @override_settings(CELERY_TASK_ALWAYS_EAGER=True)
    def test_rate_limiting_free_user(self):
        """Test rate limiting for free users."""
        self.client.force_authenticate(user=self.user)

        # Create 10 exports (the limit)
        for i in range(10):
            ExportJob.objects.create(
                user=self.user,
                export_type='csv',
                created_at=timezone.now()
            )

        # 11th export should fail
        with patch('exports.views.process_export_job.delay'):
            response = self.client.post('/api/exports/create/', {
                'export_type': 'csv'
            })

        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)

    def test_rate_limiting_pro_user(self):
        """Test no rate limiting for pro users."""
        self.client.force_authenticate(user=self.pro_user)

        # Create 10 exports
        for i in range(10):
            ExportJob.objects.create(
                user=self.pro_user,
                export_type='csv',
                created_at=timezone.now()
            )

        # Pro user should still be able to create more
        with patch('exports.views.process_export_job.delay'):
            response = self.client.post('/api/exports/create/', {
                'export_type': 'csv'
            })

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


class ExportGeneratorTests(TestCase):
    """Tests for export generators."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )

        self.account = Account.objects.create(
            user=self.user,
            name='Test Account',
            currency='USD',
            balance=Decimal('1000.00')
        )

        self.category = Category.objects.create(
            user=self.user,
            name='Food',
            type='expense'
        )

    @override_settings(MEDIA_ROOT='/tmp/test_media')
    def test_generate_csv_export(self):
        """Test CSV export generation."""
        # Create test transactions
        Transaction.objects.create(
            user=self.user,
            account=self.account,
            category=self.category,
            amount=Decimal('50.00'),
            currency='USD',
            transaction_type='expense',
            date=timezone.now().date()
        )

        params = {
            'start_date': '2024-01-01',
            'end_date': '2024-12-31',
            'transaction_type': 'all'
        }

        file_path, file_size = generate_csv_export(self.user, params)

        self.assertIsNotNone(file_path)
        self.assertGreater(file_size, 0)
        self.assertTrue(file_path.endswith('.csv'))

    @override_settings(MEDIA_ROOT='/tmp/test_media')
    def test_generate_pdf_export(self):
        """Test PDF export generation."""
        # Create test transactions
        Transaction.objects.create(
            user=self.user,
            account=self.account,
            category=self.category,
            amount=Decimal('50.00'),
            currency='USD',
            transaction_type='expense',
            date=timezone.now().date()
        )

        params = {
            'start_date': '2024-01-01',
            'end_date': '2024-12-31',
            'transaction_type': 'all'
        }

        file_path, file_size = generate_pdf_export(self.user, params)

        self.assertIsNotNone(file_path)
        self.assertGreater(file_size, 0)
        self.assertTrue(file_path.endswith('.pdf'))


class ExportTaskTests(TestCase):
    """Tests for Celery tasks."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )

    @patch('exports.tasks.generate_csv_export')
    def test_process_export_job_success(self, mock_generate):
        """Test successful export job processing."""
        mock_generate.return_value = ('exports/test.csv', 1024)

        job = ExportJob.objects.create(
            user=self.user,
            export_type='csv',
            params={}
        )

        result = process_export_job(job.id)

        job.refresh_from_db()
        self.assertEqual(job.status, 'completed')
        self.assertIsNotNone(job.file_url)
        self.assertEqual(job.file_size, 1024)
        self.assertEqual(result['status'], 'success')

    @patch('exports.tasks.generate_csv_export')
    def test_process_export_job_failure(self, mock_generate):
        """Test export job processing failure."""
        mock_generate.side_effect = Exception('Test error')

        job = ExportJob.objects.create(
            user=self.user,
            export_type='csv',
            params={}
        )

        # Run without retries for testing
        with patch('exports.tasks.process_export_job.retry'):
            result = process_export_job(job.id)

        job.refresh_from_db()
        self.assertEqual(job.status, 'failed')
        self.assertIn('Test error', job.error_message)

    def test_cleanup_old_exports(self):
        """Test cleanup of old export jobs."""
        # Create old completed export
        old_job = ExportJob.objects.create(
            user=self.user,
            export_type='csv',
            status='completed',
            completed_at=timezone.now() - timedelta(days=31)
        )

        # Create recent export
        recent_job = ExportJob.objects.create(
            user=self.user,
            export_type='csv',
            status='completed',
            completed_at=timezone.now()
        )

        # Run cleanup
        result = cleanup_old_exports()

        # Old job should be deleted, recent one should remain
        self.assertFalse(ExportJob.objects.filter(id=old_job.id).exists())
        self.assertTrue(ExportJob.objects.filter(id=recent_job.id).exists())
        self.assertEqual(result['status'], 'success')
