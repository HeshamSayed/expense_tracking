"""
URL configuration for finance app.
Uses DRF routers for automatic URL routing.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    AccountViewSet,
    TransactionViewSet,
    CategoryViewSet,
    BudgetViewSet,
    RecurringTransactionViewSet,
    ReportViewSet,
)

app_name = 'finance'

# Create router and register viewsets
router = DefaultRouter()
router.register(r'accounts', AccountViewSet, basename='account')
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'budgets', BudgetViewSet, basename='budget')
router.register(r'recurring-transactions', RecurringTransactionViewSet, basename='recurring-transaction')
router.register(r'reports', ReportViewSet, basename='report')

urlpatterns = [
    path('', include(router.urls)),
]
