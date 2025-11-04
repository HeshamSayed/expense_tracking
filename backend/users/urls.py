"""
URL configuration for users app.
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

app_name = 'users'

urlpatterns = [
    # Authentication
    path('register/', views.register, name='register'),
    path('token/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Profile management
    path('me/', views.profile, name='profile'),
    path('me/password/', views.change_password, name='change_password'),
    path('me/delete/', views.delete_account, name='delete_account'),

    # Password reset
    path('password-reset/', views.password_reset_request, name='password_reset_request'),
    path('password-reset/confirm/', views.password_reset_confirm, name='password_reset_confirm'),

    # Privacy & settings
    path('ads/consent/', views.update_ad_consent, name='ad_consent'),
    path('activity/', views.activity_logs, name='activity_logs'),
]
