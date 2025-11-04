"""
Analytics views for reporting and insights.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Sum, Count, Avg, Q
from django.db.models.functions import TruncMonth, TruncWeek, TruncDay
from datetime import datetime, timedelta
from decimal import Decimal
from apps.expenses.models import Expense, Income
from apps.budgets.models import Budget
from core.utils import get_date_range
from .services import AnalyticsService, ExportService


class DashboardView(APIView):
    """
    Dashboard view with overview statistics.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get dashboard statistics."""
        user = request.user
        period = request.query_params.get('period', 'month')  # today, week, month, year

        start_date, end_date = get_date_range(period)

        # Expenses
        expenses = Expense.objects.filter(
            user=user,
            date__gte=start_date,
            date__lte=end_date,
            is_deleted=False
        )

        total_expenses = expenses.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        expense_count = expenses.count()

        # Income
        incomes = Income.objects.filter(
            user=user,
            date__gte=start_date,
            date__lte=end_date,
            is_deleted=False
        )

        total_income = incomes.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        income_count = incomes.count()

        # Net balance
        net_balance = total_income - total_expenses

        # Budgets
        active_budgets = Budget.objects.filter(
            user=user,
            is_active=True,
            is_deleted=False
        ).count()

        # Recent transactions
        recent_expenses = expenses.order_by('-date')[:5].values(
            'id', 'description', 'amount', 'date', 'category__name'
        )

        recent_incomes = incomes.order_by('-date')[:5].values(
            'id', 'description', 'amount', 'date', 'source'
        )

        return Response({
            'period': period,
            'start_date': start_date,
            'end_date': end_date,
            'expenses': {
                'total': float(total_expenses),
                'count': expense_count,
                'recent': list(recent_expenses)
            },
            'income': {
                'total': float(total_income),
                'count': income_count,
                'recent': list(recent_incomes)
            },
            'net_balance': float(net_balance),
            'active_budgets': active_budgets,
        })


class SpendingTrendsView(APIView):
    """
    View for spending trends and patterns.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get spending trends."""
        user = request.user
        period = request.query_params.get('period', 'month')  # week, month, year
        group_by = request.query_params.get('group_by', 'day')  # day, week, month

        start_date, end_date = get_date_range(period)

        expenses = Expense.objects.filter(
            user=user,
            date__gte=start_date,
            date__lte=end_date,
            is_deleted=False
        )

        # Group by time period
        if group_by == 'day':
            trends = expenses.annotate(
                period=TruncDay('date')
            ).values('period').annotate(
                total=Sum('amount'),
                count=Count('id')
            ).order_by('period')
        elif group_by == 'week':
            trends = expenses.annotate(
                period=TruncWeek('date')
            ).values('period').annotate(
                total=Sum('amount'),
                count=Count('id')
            ).order_by('period')
        else:  # month
            trends = expenses.annotate(
                period=TruncMonth('date')
            ).values('period').annotate(
                total=Sum('amount'),
                count=Count('id')
            ).order_by('period')

        return Response({
            'period': period,
            'group_by': group_by,
            'start_date': start_date,
            'end_date': end_date,
            'trends': list(trends)
        })


class CategoryAnalysisView(APIView):
    """
    View for category-wise spending analysis.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get category analysis."""
        user = request.user
        period = request.query_params.get('period', 'month')

        start_date, end_date = get_date_range(period)

        expenses = Expense.objects.filter(
            user=user,
            date__gte=start_date,
            date__lte=end_date,
            is_deleted=False
        )

        total_expenses = expenses.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        # Group by category
        by_category = expenses.values(
            'category__id',
            'category__name',
            'category__color',
            'category__icon'
        ).annotate(
            total=Sum('amount'),
            count=Count('id'),
            average=Avg('amount')
        ).order_by('-total')

        # Calculate percentages
        for item in by_category:
            if total_expenses > 0:
                item['percentage'] = float((item['total'] / total_expenses) * 100)
            else:
                item['percentage'] = 0

        return Response({
            'period': period,
            'start_date': start_date,
            'end_date': end_date,
            'total_expenses': float(total_expenses),
            'by_category': list(by_category)
        })


class PaymentMethodAnalysisView(APIView):
    """
    View for payment method analysis.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get payment method analysis."""
        user = request.user
        period = request.query_params.get('period', 'month')

        start_date, end_date = get_date_range(period)

        expenses = Expense.objects.filter(
            user=user,
            date__gte=start_date,
            date__lte=end_date,
            is_deleted=False
        )

        by_payment = expenses.values('payment_method').annotate(
            total=Sum('amount'),
            count=Count('id')
        ).order_by('-total')

        return Response({
            'period': period,
            'start_date': start_date,
            'end_date': end_date,
            'by_payment_method': list(by_payment)
        })


class IncomeVsExpenseView(APIView):
    """
    View for income vs expense comparison.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get income vs expense data."""
        user = request.user
        period = request.query_params.get('period', 'year')
        group_by = request.query_params.get('group_by', 'month')

        start_date, end_date = get_date_range(period)

        # Income trends
        incomes = Income.objects.filter(
            user=user,
            date__gte=start_date,
            date__lte=end_date,
            is_deleted=False
        )

        # Expense trends
        expenses = Expense.objects.filter(
            user=user,
            date__gte=start_date,
            date__lte=end_date,
            is_deleted=False
        )

        if group_by == 'month':
            income_trends = incomes.annotate(
                period=TruncMonth('date')
            ).values('period').annotate(
                total=Sum('amount')
            ).order_by('period')

            expense_trends = expenses.annotate(
                period=TruncMonth('date')
            ).values('period').annotate(
                total=Sum('amount')
            ).order_by('period')
        else:  # week
            income_trends = incomes.annotate(
                period=TruncWeek('date')
            ).values('period').annotate(
                total=Sum('amount')
            ).order_by('period')

            expense_trends = expenses.annotate(
                period=TruncWeek('date')
            ).values('period').annotate(
                total=Sum('amount')
            ).order_by('period')

        return Response({
            'period': period,
            'group_by': group_by,
            'start_date': start_date,
            'end_date': end_date,
            'income_trends': list(income_trends),
            'expense_trends': list(expense_trends)
        })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def export_expenses(request):
    """
    Export expenses to CSV or Excel.
    """
    format_type = request.query_params.get('format', 'csv')  # csv or excel
    period = request.query_params.get('period', 'month')

    start_date, end_date = get_date_range(period)

    expenses = Expense.objects.filter(
        user=request.user,
        date__gte=start_date,
        date__lte=end_date,
        is_deleted=False
    ).select_related('category', 'currency')

    export_service = ExportService()

    if format_type == 'excel':
        file_data = export_service.export_expenses_to_excel(expenses)
        filename = f'expenses_{start_date}_{end_date}.xlsx'
        content_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    else:
        file_data = export_service.export_expenses_to_csv(expenses)
        filename = f'expenses_{start_date}_{end_date}.csv'
        content_type = 'text/csv'

    from django.http import HttpResponse
    response = HttpResponse(file_data, content_type=content_type)
    response['Content-Disposition'] = f'attachment; filename="{filename}"'

    return response


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def export_report(request):
    """
    Export comprehensive financial report to PDF.
    """
    period = request.query_params.get('period', 'month')

    start_date, end_date = get_date_range(period)

    user = request.user
    export_service = ExportService()

    pdf_data = export_service.generate_financial_report_pdf(
        user, start_date, end_date
    )

    from django.http import HttpResponse
    response = HttpResponse(pdf_data, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="financial_report_{start_date}_{end_date}.pdf"'

    return response
