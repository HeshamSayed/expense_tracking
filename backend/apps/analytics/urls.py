"""
Analytics URL configuration.
"""
from django.urls import path
from .views import (
    DashboardView,
    SpendingTrendsView,
    CategoryAnalysisView,
    PaymentMethodAnalysisView,
    IncomeVsExpenseView,
    export_expenses,
    export_report,
)

app_name = 'analytics'

urlpatterns = [
    # Analytics endpoints
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('spending-trends/', SpendingTrendsView.as_view(), name='spending-trends'),
    path('category-analysis/', CategoryAnalysisView.as_view(), name='category-analysis'),
    path('payment-analysis/', PaymentMethodAnalysisView.as_view(), name='payment-analysis'),
    path('income-vs-expense/', IncomeVsExpenseView.as_view(), name='income-vs-expense'),

    # Export endpoints
    path('export/expenses/', export_expenses, name='export-expenses'),
    path('export/report/', export_report, name='export-report'),
]
