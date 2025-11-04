"""
Expense URL configuration.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ExpenseViewSet, IncomeViewSet, CurrencyViewSet,
    ReceiptViewSet, RecurringTransactionViewSet,
    SharedExpenseViewSet
)

app_name = 'expenses'

router = DefaultRouter()
router.register(r'expenses', ExpenseViewSet, basename='expense')
router.register(r'incomes', IncomeViewSet, basename='income')
router.register(r'currencies', CurrencyViewSet, basename='currency')
router.register(r'receipts', ReceiptViewSet, basename='receipt')
router.register(r'recurring', RecurringTransactionViewSet, basename='recurring')
router.register(r'shared', SharedExpenseViewSet, basename='shared')

urlpatterns = [
    path('', include(router.urls)),
]
