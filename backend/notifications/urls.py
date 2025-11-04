"""
URL configuration for notifications app.
"""
from django.urls import path
from . import views

app_name = 'notifications'

urlpatterns = [
    path('preferences/', views.get_preferences, name='get_preferences'),
    path('preferences/update/', views.update_preferences, name='update_preferences'),
]
