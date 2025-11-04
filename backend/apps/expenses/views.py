"""
Expense views.
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db import models
from django.db.models import Q, Sum, Count
from datetime import datetime, timedelta
from core.permissions import IsOwner
from .models import (
    Expense, Income, Currency, Receipt,
    RecurringTransaction, SharedExpense
)
from .serializers import (
    ExpenseSerializer, IncomeSerializer, CurrencySerializer,
    ReceiptSerializer, RecurringTransactionSerializer,
    SharedExpenseSerializer
)
from .filters import ExpenseFilter, IncomeFilter


class CurrencyViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for Currency (read-only).
    """
    queryset = Currency.objects.all()
    serializer_class = CurrencySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['code', 'name']
    ordering = ['code']


class ExpenseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Expense CRUD operations.
    """
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ExpenseFilter
    search_fields = ['description', 'location', 'notes']
    ordering_fields = ['date', 'amount', 'created_at']
    ordering = ['-date']

    def get_queryset(self):
        """Return expenses for the current user."""
        return Expense.objects.filter(
            user=self.request.user,
            is_deleted=False
        ).select_related('category', 'currency').prefetch_related('tags', 'receipts')

    def perform_destroy(self, instance):
        """Soft delete expense."""
        instance.soft_delete()

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get expense summary for a period."""
        queryset = self.filter_queryset(self.get_queryset())

        total = queryset.aggregate(total=Sum('amount'))['total'] or 0
        count = queryset.count()

        # Group by category
        by_category = queryset.values(
            'category__name', 'category__color'
        ).annotate(
            total=Sum('amount'),
            count=models.Count('id')
        ).order_by('-total')

        # Group by payment method
        by_payment = queryset.values(
            'payment_method'
        ).annotate(
            total=Sum('amount'),
            count=models.Count('id')
        ).order_by('-total')

        return Response({
            'total_amount': total,
            'total_count': count,
            'by_category': by_category,
            'by_payment_method': by_payment,
        })

    @action(detail=True, methods=['post'])
    def add_receipt(self, request, pk=None):
        """Add a receipt to an expense."""
        expense = self.get_object()
        serializer = ReceiptSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(expense=expense)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent expenses (last 10)."""
        queryset = self.get_queryset()[:10]
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class IncomeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Income CRUD operations.
    """
    serializer_class = IncomeSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = IncomeFilter
    search_fields = ['description', 'source', 'notes']
    ordering_fields = ['date', 'amount', 'created_at']
    ordering = ['-date']

    def get_queryset(self):
        """Return incomes for the current user."""
        return Income.objects.filter(
            user=self.request.user,
            is_deleted=False
        ).select_related('category', 'currency').prefetch_related('tags')

    def perform_destroy(self, instance):
        """Soft delete income."""
        instance.soft_delete()

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get income summary for a period."""
        queryset = self.filter_queryset(self.get_queryset())

        total = queryset.aggregate(total=Sum('amount'))['total'] or 0
        count = queryset.count()

        # Group by income type
        by_type = queryset.values(
            'income_type'
        ).annotate(
            total=Sum('amount'),
            count=models.Count('id')
        ).order_by('-total')

        # Group by source
        by_source = queryset.values(
            'source'
        ).annotate(
            total=Sum('amount'),
            count=models.Count('id')
        ).order_by('-total')[:10]

        return Response({
            'total_amount': total,
            'total_count': count,
            'by_type': by_type,
            'by_source': by_source,
        })


class ReceiptViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Receipt CRUD operations.
    """
    serializer_class = ReceiptSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [OrderingFilter]
    ordering = ['-created_at']

    def get_queryset(self):
        """Return receipts for user's expenses."""
        return Receipt.objects.filter(
            expense__user=self.request.user,
            is_deleted=False
        ).select_related('expense')

    def perform_destroy(self, instance):
        """Soft delete receipt."""
        instance.soft_delete()


class RecurringTransactionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for RecurringTransaction CRUD operations.
    """
    serializer_class = RecurringTransactionSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['transaction_type', 'frequency', 'is_active']
    search_fields = ['description']
    ordering_fields = ['next_due_date', 'created_at']
    ordering = ['next_due_date']

    def get_queryset(self):
        """Return recurring transactions for the current user."""
        return RecurringTransaction.objects.filter(
            user=self.request.user,
            is_deleted=False
        ).select_related('category', 'currency')

    def perform_destroy(self, instance):
        """Soft delete recurring transaction."""
        instance.soft_delete()

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming recurring transactions (next 30 days)."""
        today = datetime.now().date()
        upcoming_date = today + timedelta(days=30)

        queryset = self.get_queryset().filter(
            is_active=True,
            next_due_date__gte=today,
            next_due_date__lte=upcoming_date
        )

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Toggle active status of recurring transaction."""
        transaction = self.get_object()
        transaction.is_active = not transaction.is_active
        transaction.save()

        return Response({
            'is_active': transaction.is_active,
            'message': f'Recurring transaction {"activated" if transaction.is_active else "deactivated"}.'
        })


class SharedExpenseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for SharedExpense CRUD operations.
    """
    serializer_class = SharedExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['is_settled']
    ordering = ['-created_at']

    def get_queryset(self):
        """Return shared expenses for the current user."""
        user = self.request.user
        return SharedExpense.objects.filter(
            Q(expense__user=user) | Q(shared_with=user),
            is_deleted=False
        ).select_related('expense', 'shared_with')

    def perform_destroy(self, instance):
        """Soft delete shared expense."""
        # Only owner can delete
        if instance.expense.user != self.request.user:
            return Response(
                {'error': 'Only expense owner can delete shares.'},
                status=status.HTTP_403_FORBIDDEN
            )
        instance.soft_delete()

    @action(detail=False, methods=['get'])
    def my_shares(self, request):
        """Get expenses shared with me."""
        queryset = self.get_queryset().filter(
            shared_with=request.user
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def i_shared(self, request):
        """Get expenses I shared with others."""
        queryset = self.get_queryset().filter(
            expense__user=request.user
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def settle(self, request, pk=None):
        """Mark a shared expense as settled."""
        shared_expense = self.get_object()

        if shared_expense.is_settled:
            return Response(
                {'error': 'This shared expense is already settled.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        shared_expense.is_settled = True
        shared_expense.settled_date = datetime.now().date()
        shared_expense.save()

        return Response({
            'message': 'Shared expense marked as settled.',
            'settled_date': shared_expense.settled_date
        })
