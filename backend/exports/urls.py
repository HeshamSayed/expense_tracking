"""
URL configuration for the exports app.
"""
from django.urls import path
from . import views

app_name = 'exports'

urlpatterns = [
    # Export CRUD operations
    path('', views.list_exports, name='list_exports'),
    path('create/', views.create_export, name='create_export'),
    path('<int:job_id>/', views.get_export, name='get_export'),
    path('<int:job_id>/delete/', views.delete_export, name='delete_export'),

    # Export statistics
    path('stats/', views.export_stats, name='export_stats'),
]
