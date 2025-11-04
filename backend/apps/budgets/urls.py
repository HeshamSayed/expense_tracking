"""
Budget URL configuration.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BudgetViewSet, BudgetAlertViewSet

app_name = 'budgets'

router = DefaultRouter()
router.register(r'budgets', BudgetViewSet, basename='budget')
router.register(r'alerts', BudgetAlertViewSet, basename='alert')

urlpatterns = [
    path('', include(router.urls)),
]
