"""
URL configuration for MoneyGuard project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # API endpoints
    path('api/auth/', include('users.urls')),
    path('api/', include('finance.urls')),
    path('api/billing/', include('billing.urls')),
    path('api/exports/', include('exports.urls')),

    # Health check endpoint
    path('health/', include('moneyguard.health_urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Customize admin site
admin.site.site_header = 'MoneyGuard Administration'
admin.site.site_title = 'MoneyGuard Admin'
admin.site.index_title = 'Welcome to MoneyGuard Admin'
