"""
URL configuration for billing app.
"""
from django.urls import path
from . import views

app_name = 'billing'

urlpatterns = [
    # Stripe checkout
    path('checkout/', views.create_checkout_session, name='create_checkout_session'),

    # Stripe webhook (must be publicly accessible)
    path('webhook/', views.stripe_webhook, name='stripe_webhook'),

    # In-app purchase verification
    path('verify-purchase/', views.verify_in_app_purchase, name='verify_in_app_purchase'),

    # Subscription management
    path('cancel/', views.cancel_subscription, name='cancel_subscription'),
    path('status/', views.get_subscription_status, name='get_subscription_status'),

    # Payment history
    path('payments/', views.get_payment_history, name='get_payment_history'),

    # Customer portal
    path('portal/', views.create_portal_session, name='create_portal_session'),
]
