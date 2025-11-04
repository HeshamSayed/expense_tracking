"""
URL configuration for expense tracking project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),

    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # API endpoints
    path('api/v1/auth/', include('apps.authentication.urls')),
    path('api/v1/expenses/', include('apps.expenses.urls')),
    path('api/v1/budgets/', include('apps.budgets.urls')),
    path('api/v1/analytics/', include('apps.analytics.urls')),
    path('api/v1/categories/', include('apps.categories.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
