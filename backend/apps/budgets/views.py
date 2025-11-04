"""
Budget views.
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Sum, Count, Avg
from django.utils import timezone
from decimal import Decimal
from core.permissions import IsOwner
from .models import Budget, BudgetAlert
from .serializers import (
    BudgetSerializer, BudgetAlertSerializer,
    BudgetSummarySerializer
)


class BudgetViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Budget CRUD operations.
    """
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['period', 'is_active', 'category']
    search_fields = ['name']
    ordering_fields = ['start_date', 'amount', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        """Return budgets for the current user."""
        return Budget.objects.filter(
            user=self.request.user,
            is_deleted=False
        ).select_related('category', 'currency')

    def perform_destroy(self, instance):
        """Soft delete budget."""
        instance.soft_delete()

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get budget summary."""
        queryset = self.get_queryset().filter(is_active=True)

        total_budgets = queryset.count()
        exceeded_budgets = sum(1 for b in queryset if b.is_exceeded)

        total_budget_amount = sum(b.amount for b in queryset)
        total_spent = sum(b.spent_amount for b in queryset)
        total_remaining = total_budget_amount - total_spent

        avg_usage = sum(b.percentage_used for b in queryset) / total_budgets if total_budgets > 0 else 0

        summary_data = {
            'total_budgets': total_budgets,
            'active_budgets': total_budgets,
            'exceeded_budgets': exceeded_budgets,
            'total_budget_amount': total_budget_amount,
            'total_spent': total_spent,
            'total_remaining': total_remaining,
            'average_usage_percentage': avg_usage,
        }

        serializer = BudgetSummarySerializer(summary_data)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def exceeded(self, request):
        """Get exceeded budgets."""
        queryset = self.get_queryset().filter(is_active=True)
        exceeded = [budget for budget in queryset if budget.is_exceeded]

        serializer = self.get_serializer(exceeded, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def alerts(self, request):
        """Get budgets that have reached alert threshold."""
        queryset = self.get_queryset().filter(is_active=True)
        alert_budgets = [budget for budget in queryset if budget.is_alert_threshold_reached]

        serializer = self.get_serializer(alert_budgets, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Toggle active status of budget."""
        budget = self.get_object()
        budget.is_active = not budget.is_active
        budget.save()

        return Response({
            'is_active': budget.is_active,
            'message': f'Budget {"activated" if budget.is_active else "deactivated"}.'
        })

    @action(detail=True, methods=['get'])
    def progress(self, request, pk=None):
        """Get detailed progress for a budget."""
        budget = self.get_object()

        return Response({
            'budget_id': budget.id,
            'name': budget.name,
            'amount': budget.amount,
            'spent_amount': budget.spent_amount,
            'remaining_amount': budget.remaining_amount,
            'percentage_used': budget.percentage_used,
            'is_exceeded': budget.is_exceeded,
            'is_alert_threshold_reached': budget.is_alert_threshold_reached,
            'period': budget.period,
            'start_date': budget.start_date,
            'end_date': budget.end_date,
        })


class BudgetAlertViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for BudgetAlert (read-only).
    """
    serializer_class = BudgetAlertSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['alert_type', 'is_read']
    ordering = ['-created_at']

    def get_queryset(self):
        """Return budget alerts for the current user."""
        return BudgetAlert.objects.filter(
            budget__user=self.request.user
        ).select_related('budget')

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark alert as read."""
        alert = self.get_object()

        if alert.is_read:
            return Response(
                {'message': 'Alert already marked as read.'},
                status=status.HTTP_200_OK
            )

        alert.is_read = True
        alert.read_at = timezone.now()
        alert.save()

        return Response({
            'message': 'Alert marked as read.',
            'read_at': alert.read_at
        })

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all alerts as read."""
        unread_alerts = self.get_queryset().filter(is_read=False)
        count = unread_alerts.update(
            is_read=True,
            read_at=timezone.now()
        )

        return Response({
            'message': f'{count} alerts marked as read.'
        })

    @action(detail=False, methods=['get'])
    def unread(self, request):
        """Get unread alerts."""
        queryset = self.get_queryset().filter(is_read=False)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
