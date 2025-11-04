"""
Celery tasks for export generation and cleanup.
"""
import os
import logging
from datetime import timedelta
from django.conf import settings
from django.utils import timezone
from celery import shared_task
from .models import ExportJob
from .generators import generate_csv_export, generate_pdf_export

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def process_export_job(self, job_id):
    """
    Process an export job - generate CSV or PDF export.

    Args:
        job_id: ID of the ExportJob to process

    Returns:
        dict: Status and message
    """
    try:
        # Get the export job
        try:
            job = ExportJob.objects.get(id=job_id)
        except ExportJob.DoesNotExist:
            logger.error(f"Export job {job_id} not found")
            return {'status': 'error', 'message': 'Export job not found'}

        # Mark as processing
        job.mark_as_processing()
        logger.info(f"Processing export job {job_id} for user {job.user.email}")

        try:
            # Generate export based on type
            if job.export_type == 'csv':
                file_path, file_size = generate_csv_export(job.user, job.params)
            elif job.export_type == 'pdf':
                file_path, file_size = generate_pdf_export(job.user, job.params)
            else:
                raise ValueError(f"Invalid export type: {job.export_type}")

            # Build file URL
            file_url = f"{settings.MEDIA_URL}{file_path}"

            # Mark as completed
            job.mark_as_completed(file_url, file_size)
            logger.info(f"Export job {job_id} completed successfully. File: {file_url}")

            return {
                'status': 'success',
                'message': 'Export generated successfully',
                'file_url': file_url,
                'file_size': file_size
            }

        except Exception as generation_error:
            # Log the error
            error_message = str(generation_error)
            logger.error(f"Error generating export for job {job_id}: {error_message}", exc_info=True)

            # Mark job as failed
            job.mark_as_failed(error_message)

            # Retry if possible
            if self.request.retries < self.max_retries:
                logger.info(f"Retrying export job {job_id} (attempt {self.request.retries + 1})")
                raise self.retry(exc=generation_error, countdown=60 * (self.request.retries + 1))

            return {
                'status': 'error',
                'message': error_message
            }

    except Exception as e:
        logger.error(f"Unexpected error in process_export_job for job {job_id}: {str(e)}", exc_info=True)
        return {
            'status': 'error',
            'message': f"Unexpected error: {str(e)}"
        }


@shared_task
def cleanup_old_exports():
    """
    Cleanup export jobs and files older than 30 days.
    This task should be run periodically (e.g., daily via celery beat).

    Returns:
        dict: Cleanup statistics
    """
    logger.info("Starting cleanup of old exports")

    try:
        # Calculate cutoff date (30 days ago)
        cutoff_date = timezone.now() - timedelta(days=30)

        # Find old completed export jobs
        old_jobs = ExportJob.objects.filter(
            status='completed',
            completed_at__lt=cutoff_date
        )

        deleted_files_count = 0
        deleted_jobs_count = 0
        errors = []

        # Delete files and jobs
        for job in old_jobs:
            try:
                # Delete the physical file if it exists
                if job.file_url:
                    # Extract file path from URL
                    file_path = job.file_url.replace(settings.MEDIA_URL, '')
                    full_path = os.path.join(settings.MEDIA_ROOT, file_path)

                    if os.path.exists(full_path):
                        os.remove(full_path)
                        deleted_files_count += 1
                        logger.info(f"Deleted file: {full_path}")

                # Delete the job record
                job.delete()
                deleted_jobs_count += 1

            except Exception as e:
                error_msg = f"Error deleting export job {job.id}: {str(e)}"
                logger.error(error_msg)
                errors.append(error_msg)

        # Also cleanup failed jobs older than 7 days
        failed_cutoff = timezone.now() - timedelta(days=7)
        failed_jobs = ExportJob.objects.filter(
            status='failed',
            created_at__lt=failed_cutoff
        )
        failed_count = failed_jobs.count()
        failed_jobs.delete()

        logger.info(
            f"Cleanup completed. Deleted {deleted_jobs_count} completed jobs, "
            f"{deleted_files_count} files, and {failed_count} failed jobs"
        )

        return {
            'status': 'success',
            'deleted_jobs': deleted_jobs_count,
            'deleted_files': deleted_files_count,
            'deleted_failed_jobs': failed_count,
            'errors': errors
        }

    except Exception as e:
        error_msg = f"Error during cleanup: {str(e)}"
        logger.error(error_msg, exc_info=True)
        return {
            'status': 'error',
            'message': error_msg
        }


@shared_task
def cleanup_orphaned_export_files():
    """
    Cleanup export files that don't have corresponding database records.
    This handles cases where files exist but records were deleted.

    Returns:
        dict: Cleanup statistics
    """
    logger.info("Starting cleanup of orphaned export files")

    try:
        exports_dir = os.path.join(settings.MEDIA_ROOT, 'exports')
        if not os.path.exists(exports_dir):
            logger.info("Exports directory doesn't exist, nothing to cleanup")
            return {'status': 'success', 'message': 'No exports directory found'}

        deleted_count = 0
        errors = []

        # Get all export file URLs from database
        db_files = set()
        for job in ExportJob.objects.filter(status='completed').exclude(file_url=''):
            file_path = job.file_url.replace(settings.MEDIA_URL, '')
            db_files.add(os.path.basename(file_path))

        # Check all files in exports directory
        for filename in os.listdir(exports_dir):
            if filename not in db_files:
                try:
                    file_path = os.path.join(exports_dir, filename)
                    # Check if file is older than 1 day (safety check)
                    file_age = timezone.now().timestamp() - os.path.getmtime(file_path)
                    if file_age > 86400:  # 24 hours in seconds
                        os.remove(file_path)
                        deleted_count += 1
                        logger.info(f"Deleted orphaned file: {filename}")
                except Exception as e:
                    error_msg = f"Error deleting orphaned file {filename}: {str(e)}"
                    logger.error(error_msg)
                    errors.append(error_msg)

        logger.info(f"Orphaned file cleanup completed. Deleted {deleted_count} files")

        return {
            'status': 'success',
            'deleted_files': deleted_count,
            'errors': errors
        }

    except Exception as e:
        error_msg = f"Error during orphaned file cleanup: {str(e)}"
        logger.error(error_msg, exc_info=True)
        return {
            'status': 'error',
            'message': error_msg
        }
