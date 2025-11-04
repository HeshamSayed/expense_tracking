"""
Views for finance app.
Implements DRF viewsets for Account, Transaction, Category, Budget, and RecurringTransaction.
"""
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend, FilterSet, DateFromToRangeFilter, NumberFilter
from django.db.models import Sum, Q, Count
from django.utils import timezone
from datetime import timedelta, datetime
from decimal import Decimal

from .models import Account, Transaction, Category, Budget, RecurringTransaction
from .serializers import (
    AccountSerializer,
    TransactionSerializer,
    CategorySerializer,
    BudgetSerializer,
    RecurringTransactionSerializer,
)


class AccountViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Account model.

    Provides CRUD operations for user accounts/wallets.
    Supports filtering, searching, and ordering.
    """
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['currency', 'is_archived']
    search_fields = ['name']
    ordering_fields = ['created_at', 'updated_at', 'balance', 'name']
    ordering = ['-created_at']

    def get_queryset(self):
        """Filter accounts by authenticated user."""
        return Account.objects.filter(user=self.request.user).select_related('user')

    def perform_create(self, serializer):
        """Set user on account creation."""
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        """Archive an account."""
        account = self.get_object()
        account.is_archived = True
        account.save(update_fields=['is_archived', 'updated_at'])
        return Response({
            'status': 'success',
            'message': 'Account archived successfully.'
        })

    @action(detail=True, methods=['post'])
    def unarchive(self, request, pk=None):
        """Unarchive an account."""
        account = self.get_object()
        account.is_archived = False
        account.save(update_fields=['is_archived', 'updated_at'])
        return Response({
            'status': 'success',
            'message': 'Account unarchived successfully.'
        })


class TransactionFilter(FilterSet):
    """Custom filter for Transaction model."""
    date_from = DateFromToRangeFilter(field_name='date')
    date_to = DateFromToRangeFilter(field_name='date')
    min_amount = NumberFilter(field_name='amount', lookup_expr='gte')
    max_amount = NumberFilter(field_name='amount', lookup_expr='lte')

    class Meta:
        model = Transaction
        fields = ['transaction_type', 'account', 'category', 'date']


class TransactionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Transaction model.

    Provides CRUD operations for transactions with advanced filtering:
    - Filter by date range (date_from, date_to)
    - Filter by account, category, transaction_type
    - Filter by amount range (min_amount, max_amount)
    - Search by notes
    - Order by date, amount, created_at
    """
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = TransactionFilter
    search_fields = ['notes']
    ordering_fields = ['date', 'amount', 'created_at']
    ordering = ['-date', '-created_at']

    def get_queryset(self):
        """
        Filter transactions by authenticated user.
        Apply custom date range filtering if provided.
        """
        queryset = Transaction.objects.filter(
            user=self.request.user
        ).select_related('account', 'category', 'recurring_transaction')

        # Custom date range filtering
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')

        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        if date_to:
            queryset = queryset.filter(date__lte=date_to)

        return queryset

    def perform_create(self, serializer):
        """Set user on transaction creation."""
        serializer.save(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        """
        Override destroy to provide better error handling.
        Transaction deletion will automatically update account balance.
        """
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            return Response(
                {'status': 'success', 'message': 'Transaction deleted successfully.'},
                status=status.HTTP_204_NO_CONTENT
            )
        except Exception as e:
            return Response(
                {'status': 'error', 'message': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """
        Get transaction summary for a date range.
        Returns total income, expenses, and net balance.
        """
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')

        queryset = self.get_queryset()

        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        if date_to:
            queryset = queryset.filter(date__lte=date_to)

        income = queryset.filter(transaction_type='income').aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')

        expenses = queryset.filter(transaction_type='expense').aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')

        return Response({
            'income': float(income),
            'expenses': float(expenses),
            'net': float(income - expenses),
            'transaction_count': queryset.count(),
        })


class CategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Category model.

    Returns user-specific categories and global categories.
    Supports filtering by type (income/expense).
    """
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['type']
    search_fields = ['name']
    ordering_fields = ['name', 'created_at', 'type']
    ordering = ['name']

    def get_queryset(self):
        """
        Return user-specific categories and global categories.
        Global categories have user=None.
        """
        return Category.objects.filter(
            Q(user=self.request.user) | Q(user__isnull=True)
        ).distinct()

    def perform_create(self, serializer):
        """Set user on category creation."""
        serializer.save(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        """Prevent deletion of global categories."""
        instance = self.get_object()

        if instance.user is None:
            return Response(
                {'status': 'error', 'message': 'Cannot delete global categories.'},
                status=status.HTTP_403_FORBIDDEN
            )

        if instance.user != request.user:
            return Response(
                {'status': 'error', 'message': 'Cannot delete categories owned by other users.'},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().destroy(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """Prevent updating global categories."""
        instance = self.get_object()

        if instance.user is None:
            return Response(
                {'status': 'error', 'message': 'Cannot modify global categories.'},
                status=status.HTTP_403_FORBIDDEN
            )

        if instance.user != request.user:
            return Response(
                {'status': 'error', 'message': 'Cannot modify categories owned by other users.'},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().update(request, *args, **kwargs)


class BudgetViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Budget model.

    Provides CRUD operations for budgets with spending tracking.
    Returns spent amount and percentage used for each budget.
    """
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['category', 'period', 'is_active']
    ordering_fields = ['created_at', 'start_date', 'amount']
    ordering = ['-created_at']

    def get_queryset(self):
        """Filter budgets by authenticated user."""
        return Budget.objects.filter(
            user=self.request.user
        ).select_related('category')

    def perform_create(self, serializer):
        """Set user on budget creation."""
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def alerts(self, request):
        """
        Get budgets that have exceeded their alert threshold.
        Returns list of budgets with alerts.
        """
        budgets = self.get_queryset().filter(is_active=True)
        alerts = []

        for budget in budgets:
            percentage_used = budget.get_percentage_used()
            if percentage_used >= budget.alert_threshold:
                alerts.append({
                    'budget_id': budget.id,
                    'category': budget.category.name,
                    'amount': float(budget.amount),
                    'spent': float(budget.get_spent_amount()),
                    'percentage_used': round(percentage_used, 2),
                    'threshold': budget.alert_threshold,
                    'period': budget.period,
                })

        return Response({
            'alerts': alerts,
            'count': len(alerts),
        })


class RecurringTransactionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for RecurringTransaction model.

    Provides CRUD operations for recurring transaction templates.
    Supports filtering by status and frequency.
    """
    serializer_class = RecurringTransactionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'frequency', 'transaction_type']
    search_fields = ['description']
    ordering_fields = ['next_run', 'created_at', 'amount']
    ordering = ['next_run']

    def get_queryset(self):
        """Filter recurring transactions by authenticated user."""
        return RecurringTransaction.objects.filter(
            user=self.request.user
        ).select_related('account', 'category')

    def perform_create(self, serializer):
        """Set user on recurring transaction creation."""
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a recurring transaction."""
        recurring_transaction = self.get_object()
        recurring_transaction.is_active = True
        recurring_transaction.save(update_fields=['is_active', 'updated_at'])
        return Response({
            'status': 'success',
            'message': 'Recurring transaction activated successfully.'
        })

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate a recurring transaction."""
        recurring_transaction = self.get_object()
        recurring_transaction.is_active = False
        recurring_transaction.save(update_fields=['is_active', 'updated_at'])
        return Response({
            'status': 'success',
            'message': 'Recurring transaction deactivated successfully.'
        })


class ReportViewSet(viewsets.ViewSet):
    """
    ViewSet for generating financial reports.

    Provides endpoints for monthly and yearly reports.
    """
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def monthly(self, request):
        """
        Generate monthly financial report.

        Query params:
        - year: Year for report (default: current year)
        - month: Month for report (default: current month)
        """
        try:
            year = int(request.query_params.get('year', timezone.now().year))
            month = int(request.query_params.get('month', timezone.now().month))
        except ValueError:
            return Response(
                {'status': 'error', 'message': 'Invalid year or month parameter.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate month
        if month < 1 or month > 12:
            return Response(
                {'status': 'error', 'message': 'Month must be between 1 and 12.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get transactions for the month
        transactions = Transaction.objects.filter(
            user=request.user,
            date__year=year,
            date__month=month
        ).select_related('category', 'account')

        # Calculate totals
        income = transactions.filter(transaction_type='income').aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')

        expenses = transactions.filter(transaction_type='expense').aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')

        # Group by category
        expense_by_category = transactions.filter(
            transaction_type='expense'
        ).values('category__name').annotate(
            total=Sum('amount'),
            count=Count('id')
        ).order_by('-total')

        income_by_category = transactions.filter(
            transaction_type='income'
        ).values('category__name').annotate(
            total=Sum('amount'),
            count=Count('id')
        ).order_by('-total')

        # Format category data
        expense_categories = [
            {
                'category': item['category__name'] or 'Uncategorized',
                'amount': float(item['total']),
                'count': item['count'],
                'percentage': round((item['total'] / expenses * 100) if expenses > 0 else 0, 2)
            }
            for item in expense_by_category
        ]

        income_categories = [
            {
                'category': item['category__name'] or 'Uncategorized',
                'amount': float(item['total']),
                'count': item['count'],
                'percentage': round((item['total'] / income * 100) if income > 0 else 0, 2)
            }
            for item in income_by_category
        ]

        return Response({
            'period': {
                'year': year,
                'month': month,
            },
            'summary': {
                'income': float(income),
                'expenses': float(expenses),
                'net': float(income - expenses),
                'transaction_count': transactions.count(),
            },
            'expense_by_category': expense_categories,
            'income_by_category': income_categories,
        })

    @action(detail=False, methods=['get'])
    def yearly(self, request):
        """
        Generate yearly financial report.

        Query params:
        - year: Year for report (default: current year)
        """
        try:
            year = int(request.query_params.get('year', timezone.now().year))
        except ValueError:
            return Response(
                {'status': 'error', 'message': 'Invalid year parameter.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get transactions for the year
        transactions = Transaction.objects.filter(
            user=request.user,
            date__year=year
        ).select_related('category', 'account')

        # Calculate totals
        income = transactions.filter(transaction_type='income').aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')

        expenses = transactions.filter(transaction_type='expense').aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')

        # Group by month
        monthly_data = []
        for month in range(1, 13):
            month_transactions = transactions.filter(date__month=month)
            month_income = month_transactions.filter(transaction_type='income').aggregate(
                total=Sum('amount')
            )['total'] or Decimal('0.00')
            month_expenses = month_transactions.filter(transaction_type='expense').aggregate(
                total=Sum('amount')
            )['total'] or Decimal('0.00')

            monthly_data.append({
                'month': month,
                'income': float(month_income),
                'expenses': float(month_expenses),
                'net': float(month_income - month_expenses),
                'transaction_count': month_transactions.count(),
            })

        # Group by category
        expense_by_category = transactions.filter(
            transaction_type='expense'
        ).values('category__name').annotate(
            total=Sum('amount'),
            count=Count('id')
        ).order_by('-total')

        income_by_category = transactions.filter(
            transaction_type='income'
        ).values('category__name').annotate(
            total=Sum('amount'),
            count=Count('id')
        ).order_by('-total')

        # Format category data
        expense_categories = [
            {
                'category': item['category__name'] or 'Uncategorized',
                'amount': float(item['total']),
                'count': item['count'],
                'percentage': round((item['total'] / expenses * 100) if expenses > 0 else 0, 2)
            }
            for item in expense_by_category
        ]

        income_categories = [
            {
                'category': item['category__name'] or 'Uncategorized',
                'amount': float(item['total']),
                'count': item['count'],
                'percentage': round((item['total'] / income * 100) if income > 0 else 0, 2)
            }
            for item in income_by_category
        ]

        return Response({
            'period': {
                'year': year,
            },
            'summary': {
                'income': float(income),
                'expenses': float(expenses),
                'net': float(income - expenses),
                'transaction_count': transactions.count(),
            },
            'monthly_data': monthly_data,
            'expense_by_category': expense_categories,
            'income_by_category': income_categories,
        })
