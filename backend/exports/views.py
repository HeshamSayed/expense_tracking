"""
Views for the exports app.
Handles export creation, status checking, and listing.
"""
import logging
from datetime import datetime, timedelta
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse
from .models import ExportJob
from .serializers import ExportJobSerializer, CreateExportJobSerializer
from .tasks import process_export_job

logger = logging.getLogger(__name__)


class ExportRateThrottle(UserRateThrottle):
    """
    Custom rate throttle for exports.
    Free users: 10 exports per hour
    Pro users: Unlimited (or higher limit)
    """
    rate = '10/hour'

    def allow_request(self, request, view):
        """
        Check if user is pro and skip throttling if so.
        """
        if request.user.is_authenticated and request.user.is_pro:
            # Pro users get higher limit or unlimited
            return True
        return super().allow_request(request, view)


def check_export_quota(user):
    """
    Check if user has reached their export quota.
    Free users: 10 exports per hour
    Pro users: Unlimited

    Returns:
        tuple: (allowed: bool, message: str)
    """
    if user.is_pro:
        return True, None

    # Check exports in last hour for free users
    one_hour_ago = timezone.now() - timedelta(hours=1)
    recent_exports = ExportJob.objects.filter(
        user=user,
        created_at__gte=one_hour_ago
    ).count()

    if recent_exports >= 10:
        return False, "Export limit reached. Free users can create up to 10 exports per hour. Upgrade to Pro for unlimited exports."

    return True, None


@extend_schema(
    summary="Create Export Job",
    description="Create a new export job for transactions. Free users limited to 10 exports per hour.",
    request=CreateExportJobSerializer,
    responses={
        201: ExportJobSerializer,
        400: OpenApiResponse(description="Validation error"),
        429: OpenApiResponse(description="Rate limit exceeded"),
    },
    tags=["Exports"]
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@throttle_classes([ExportRateThrottle])
def create_export(request):
    """
    Create a new export job.
    The export will be processed asynchronously.

    POST /api/exports/
    Body:
        {
            "export_type": "csv" or "pdf",
            "start_date": "YYYY-MM-DD" (optional),
            "end_date": "YYYY-MM-DD" (optional),
            "account_ids": [1, 2, 3] (optional),
            "category_ids": [1, 2] (optional),
            "transaction_type": "expense" | "income" | "all" (optional, default: "all")
        }
    """
    try:
        # Check quota
        allowed, message = check_export_quota(request.user)
        if not allowed:
            return Response(
                {'error': message},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

        # Validate and create export job
        serializer = CreateExportJobSerializer(
            data=request.data,
            context={'request': request}
        )

        if serializer.is_valid():
            export_job = serializer.save()

            # Enqueue the export task
            process_export_job.delay(export_job.id)

            logger.info(
                f"Export job {export_job.id} created for user {request.user.email}. "
                f"Type: {export_job.export_type}"
            )

            # Return the created job
            response_serializer = ExportJobSerializer(export_job)
            return Response(
                response_serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    except Exception as e:
        logger.error(f"Error creating export: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Failed to create export job. Please try again.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    summary="Get Export Job",
    description="Get the status and download URL of a specific export job.",
    responses={
        200: ExportJobSerializer,
        404: OpenApiResponse(description="Export job not found"),
    },
    tags=["Exports"]
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_export(request, job_id):
    """
    Get export job status and download URL.

    GET /api/exports/<job_id>/
    """
    try:
        # Get the export job (only user's own jobs)
        try:
            export_job = ExportJob.objects.get(
                id=job_id,
                user=request.user
            )
        except ExportJob.DoesNotExist:
            return Response(
                {'error': 'Export job not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Serialize and return
        serializer = ExportJobSerializer(export_job)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Error retrieving export {job_id}: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Failed to retrieve export job'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    summary="List Export Jobs",
    description="List all export jobs for the authenticated user.",
    parameters=[
        OpenApiParameter(
            name='status',
            type=str,
            description='Filter by status (pending, processing, completed, failed)',
            required=False
        ),
        OpenApiParameter(
            name='export_type',
            type=str,
            description='Filter by export type (csv, pdf)',
            required=False
        ),
        OpenApiParameter(
            name='limit',
            type=int,
            description='Number of results to return (default: 50, max: 100)',
            required=False
        ),
    ],
    responses={
        200: ExportJobSerializer(many=True),
    },
    tags=["Exports"]
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_exports(request):
    """
    List user's export jobs with optional filtering.

    GET /api/exports/
    Query params:
        - status: Filter by status (pending, processing, completed, failed)
        - export_type: Filter by type (csv, pdf)
        - limit: Number of results (default: 50, max: 100)
    """
    try:
        # Start with user's exports
        exports = ExportJob.objects.filter(user=request.user)

        # Apply filters
        status_filter = request.query_params.get('status')
        if status_filter:
            exports = exports.filter(status=status_filter)

        type_filter = request.query_params.get('export_type')
        if type_filter:
            exports = exports.filter(export_type=type_filter)

        # Apply limit
        limit = request.query_params.get('limit', 50)
        try:
            limit = min(int(limit), 100)  # Max 100
        except (ValueError, TypeError):
            limit = 50

        exports = exports[:limit]

        # Serialize and return
        serializer = ExportJobSerializer(exports, many=True)

        return Response(
            {
                'count': exports.count(),
                'results': serializer.data
            },
            status=status.HTTP_200_OK
        )

    except Exception as e:
        logger.error(f"Error listing exports: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Failed to retrieve exports'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    summary="Delete Export Job",
    description="Delete an export job and its associated file.",
    responses={
        204: OpenApiResponse(description="Export deleted successfully"),
        404: OpenApiResponse(description="Export job not found"),
    },
    tags=["Exports"]
)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_export(request, job_id):
    """
    Delete an export job and its file.

    DELETE /api/exports/<job_id>/
    """
    try:
        # Get the export job (only user's own jobs)
        try:
            export_job = ExportJob.objects.get(
                id=job_id,
                user=request.user
            )
        except ExportJob.DoesNotExist:
            return Response(
                {'error': 'Export job not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Delete the physical file if it exists
        if export_job.file_url:
            import os
            from django.conf import settings

            file_path = export_job.file_url.replace(settings.MEDIA_URL, '')
            full_path = os.path.join(settings.MEDIA_ROOT, file_path)

            if os.path.exists(full_path):
                try:
                    os.remove(full_path)
                    logger.info(f"Deleted export file: {full_path}")
                except Exception as e:
                    logger.error(f"Error deleting file {full_path}: {str(e)}")

        # Delete the job record
        export_job.delete()
        logger.info(f"Export job {job_id} deleted by user {request.user.email}")

        return Response(status=status.HTTP_204_NO_CONTENT)

    except Exception as e:
        logger.error(f"Error deleting export {job_id}: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Failed to delete export job'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    summary="Get Export Statistics",
    description="Get statistics about user's export usage.",
    responses={
        200: OpenApiResponse(description="Export statistics"),
    },
    tags=["Exports"]
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_stats(request):
    """
    Get export statistics for the user.

    GET /api/exports/stats/
    """
    try:
        user = request.user

        # Total exports
        total_exports = ExportJob.objects.filter(user=user).count()

        # Exports by status
        exports_by_status = {
            'pending': ExportJob.objects.filter(user=user, status='pending').count(),
            'processing': ExportJob.objects.filter(user=user, status='processing').count(),
            'completed': ExportJob.objects.filter(user=user, status='completed').count(),
            'failed': ExportJob.objects.filter(user=user, status='failed').count(),
        }

        # Exports in last hour (for quota)
        one_hour_ago = timezone.now() - timedelta(hours=1)
        exports_last_hour = ExportJob.objects.filter(
            user=user,
            created_at__gte=one_hour_ago
        ).count()

        # Quota information
        is_pro = user.is_pro
        quota_limit = None if is_pro else 10
        quota_remaining = None if is_pro else max(0, 10 - exports_last_hour)

        return Response({
            'total_exports': total_exports,
            'exports_by_status': exports_by_status,
            'exports_last_hour': exports_last_hour,
            'is_pro': is_pro,
            'quota_limit': quota_limit,
            'quota_remaining': quota_remaining,
        }, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Error getting export stats: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Failed to retrieve export statistics'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
