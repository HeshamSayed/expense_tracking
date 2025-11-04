"""
Expense filters for advanced filtering.
"""
import django_filters
from .models import Expense, Income


class ExpenseFilter(django_filters.FilterSet):
    """Filter for Expense model."""
    date_from = django_filters.DateFilter(field_name='date', lookup_expr='gte')
    date_to = django_filters.DateFilter(field_name='date', lookup_expr='lte')
    amount_min = django_filters.NumberFilter(field_name='amount', lookup_expr='gte')
    amount_max = django_filters.NumberFilter(field_name='amount', lookup_expr='lte')
    category = django_filters.NumberFilter(field_name='category__id')
    payment_method = django_filters.CharFilter(field_name='payment_method')
    tags = django_filters.CharFilter(field_name='tags__name', lookup_expr='icontains')

    class Meta:
        model = Expense
        fields = ['date_from', 'date_to', 'amount_min', 'amount_max', 'category', 'payment_method', 'tags']


class IncomeFilter(django_filters.FilterSet):
    """Filter for Income model."""
    date_from = django_filters.DateFilter(field_name='date', lookup_expr='gte')
    date_to = django_filters.DateFilter(field_name='date', lookup_expr='lte')
    amount_min = django_filters.NumberFilter(field_name='amount', lookup_expr='gte')
    amount_max = django_filters.NumberFilter(field_name='amount', lookup_expr='lte')
    income_type = django_filters.CharFilter(field_name='income_type')
    tags = django_filters.CharFilter(field_name='tags__name', lookup_expr='icontains')

    class Meta:
        model = Income
        fields = ['date_from', 'date_to', 'amount_min', 'amount_max', 'income_type', 'tags']
