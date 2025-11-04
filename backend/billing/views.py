"""
API views for billing operations.
Handles Stripe checkout, webhooks, and in-app purchase verification.
"""
import stripe
import logging
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.db import transaction
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import Subscription, InAppPurchase
from .serializers import (
    SubscriptionSerializer,
    SubscriptionStatusSerializer,
    InAppPurchaseSerializer,
    VerifyInAppPurchaseSerializer,
    CreateCheckoutSessionSerializer,
    CancelSubscriptionSerializer,
    PaymentHistorySerializer,
)
from . import stripe_service
from users.models import UserActivityLog

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_checkout_session(request):
    """
    Create a Stripe checkout session for Pro subscription.

    POST /api/billing/checkout/
    Body:
        {
            "success_url": "https://example.com/success",
            "cancel_url": "https://example.com/cancel",
            "price_id": "price_xxxxx"  // Optional, defaults to settings.STRIPE_PRO_PRICE_ID
        }

    Returns:
        {
            "checkout_session_id": "cs_xxxxx",
            "checkout_url": "https://checkout.stripe.com/..."
        }
    """
    serializer = CreateCheckoutSessionSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {'error': 'Invalid request data', 'details': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = request.user

    # Check if user already has an active subscription
    if hasattr(user, 'subscription') and user.subscription.is_active:
        return Response(
            {'error': 'You already have an active subscription'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Get price ID from request or use default
    price_id = serializer.validated_data.get('price_id') or settings.STRIPE_PRO_PRICE_ID

    if not price_id:
        logger.error("STRIPE_PRO_PRICE_ID not configured in settings")
        return Response(
            {'error': 'Stripe price ID not configured'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    try:
        # Create checkout session
        session_data = stripe_service.create_checkout_session(
            user=user,
            price_id=price_id,
            success_url=serializer.validated_data['success_url'],
            cancel_url=serializer.validated_data['cancel_url'],
        )

        return Response({
            'checkout_session_id': session_data['id'],
            'checkout_url': session_data['url'],
        }, status=status.HTTP_200_OK)

    except stripe_service.StripeServiceError as e:
        logger.error(f"Failed to create checkout session: {str(e)}")
        return Response(
            {'error': 'Failed to create checkout session', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def stripe_webhook(request):
    """
    Handle Stripe webhook events.

    POST /api/billing/webhook/
    Headers:
        Stripe-Signature: <signature>

    Handles these events:
        - checkout.session.completed: When checkout is successful
        - invoice.payment_succeeded: When subscription payment succeeds
        - invoice.payment_failed: When subscription payment fails
        - customer.subscription.updated: When subscription is updated
        - customer.subscription.deleted: When subscription is cancelled
    """
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')

    if not sig_header:
        logger.error("Missing Stripe signature header")
        return Response(
            {'error': 'Missing signature'},
            status=status.HTTP_400_BAD_REQUEST
        )

    webhook_secret = settings.STRIPE_WEBHOOK_SECRET
    if not webhook_secret:
        logger.error("STRIPE_WEBHOOK_SECRET not configured")
        return Response(
            {'error': 'Webhook secret not configured'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    try:
        # Verify webhook signature
        event = stripe_service.verify_webhook_signature(
            payload=payload,
            signature=sig_header,
            webhook_secret=webhook_secret
        )

    except stripe_service.StripeServiceError as e:
        logger.error(f"Webhook signature verification failed: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Log the event
    logger.info(f"Received Stripe webhook event: {event.type}")

    # Handle the event
    try:
        if event.type == 'checkout.session.completed':
            handle_checkout_session_completed(event.data.object)

        elif event.type == 'invoice.payment_succeeded':
            handle_invoice_payment_succeeded(event.data.object)

        elif event.type == 'invoice.payment_failed':
            handle_invoice_payment_failed(event.data.object)

        elif event.type == 'customer.subscription.updated':
            handle_subscription_updated(event.data.object)

        elif event.type == 'customer.subscription.deleted':
            handle_subscription_deleted(event.data.object)

        else:
            logger.info(f"Unhandled webhook event type: {event.type}")

        return Response({'status': 'success'}, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Error handling webhook event {event.type}: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Internal server error'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def handle_checkout_session_completed(session):
    """Handle successful checkout session."""
    customer_id = session.get('customer')
    subscription_id = session.get('subscription')

    if not customer_id or not subscription_id:
        logger.warning(f"Checkout session {session.id} missing customer or subscription")
        return

    try:
        # Find user by Stripe customer ID
        from users.models import User
        user = User.objects.get(stripe_customer_id=customer_id)

        # Retrieve subscription from Stripe and sync
        stripe_subscription = stripe_service.retrieve_subscription(subscription_id)
        subscription = stripe_service.sync_subscription_from_stripe(stripe_subscription, user)

        # Log activity
        UserActivityLog.objects.create(
            user=user,
            action='pro_activated',
            metadata={
                'subscription_id': subscription.stripe_subscription_id,
                'via': 'checkout'
            }
        )

        logger.info(f"Checkout completed for user {user.email}, subscription {subscription_id}")

    except Exception as e:
        logger.error(f"Error handling checkout session completed: {str(e)}", exc_info=True)


def handle_invoice_payment_succeeded(invoice):
    """Handle successful invoice payment."""
    customer_id = invoice.get('customer')
    subscription_id = invoice.get('subscription')

    if not customer_id:
        logger.warning(f"Invoice {invoice.id} missing customer")
        return

    try:
        from users.models import User
        user = User.objects.get(stripe_customer_id=customer_id)

        # Create payment history record
        stripe_service.create_payment_history_from_invoice(invoice, user)

        # Sync subscription if present
        if subscription_id:
            stripe_subscription = stripe_service.retrieve_subscription(subscription_id)
            stripe_service.sync_subscription_from_stripe(stripe_subscription, user)

        logger.info(f"Invoice payment succeeded for user {user.email}, invoice {invoice.id}")

    except Exception as e:
        logger.error(f"Error handling invoice payment succeeded: {str(e)}", exc_info=True)


def handle_invoice_payment_failed(invoice):
    """Handle failed invoice payment."""
    customer_id = invoice.get('customer')
    subscription_id = invoice.get('subscription')

    if not customer_id:
        logger.warning(f"Invoice {invoice.id} missing customer")
        return

    try:
        from users.models import User
        user = User.objects.get(stripe_customer_id=customer_id)

        # Create payment history record
        stripe_service.create_payment_history_from_invoice(invoice, user)

        # Update subscription status if present
        if subscription_id:
            stripe_subscription = stripe_service.retrieve_subscription(subscription_id)
            stripe_service.sync_subscription_from_stripe(stripe_subscription, user)

        logger.warning(f"Invoice payment failed for user {user.email}, invoice {invoice.id}")

        # TODO: Send notification to user about failed payment

    except Exception as e:
        logger.error(f"Error handling invoice payment failed: {str(e)}", exc_info=True)


def handle_subscription_updated(subscription):
    """Handle subscription update."""
    customer_id = subscription.get('customer')

    if not customer_id:
        logger.warning(f"Subscription {subscription.id} missing customer")
        return

    try:
        from users.models import User
        user = User.objects.get(stripe_customer_id=customer_id)

        # Sync subscription
        stripe_service.sync_subscription_from_stripe(subscription, user)

        logger.info(f"Subscription updated for user {user.email}, subscription {subscription.id}")

    except Exception as e:
        logger.error(f"Error handling subscription updated: {str(e)}", exc_info=True)


def handle_subscription_deleted(subscription):
    """Handle subscription deletion/cancellation."""
    customer_id = subscription.get('customer')

    if not customer_id:
        logger.warning(f"Subscription {subscription.id} missing customer")
        return

    try:
        from users.models import User
        user = User.objects.get(stripe_customer_id=customer_id)

        # Sync subscription (will update status to cancelled)
        local_subscription = stripe_service.sync_subscription_from_stripe(subscription, user)

        # Log activity
        UserActivityLog.objects.create(
            user=user,
            action='pro_cancelled',
            metadata={
                'subscription_id': local_subscription.stripe_subscription_id,
                'via': 'webhook'
            }
        )

        logger.info(f"Subscription deleted for user {user.email}, subscription {subscription.id}")

    except Exception as e:
        logger.error(f"Error handling subscription deleted: {str(e)}", exc_info=True)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_in_app_purchase(request):
    """
    Verify an in-app purchase from Google Play or Apple App Store.

    POST /api/billing/verify-purchase/
    Body:
        {
            "platform": "google" | "apple",
            "purchase_token": "<token>",
            "product_id": "pro_monthly"
        }

    Returns:
        {
            "success": true,
            "purchase": {...},
            "is_pro": true
        }

    NOTE: This is a stub implementation. You need to implement actual verification
    with Google Play Billing API and Apple App Store Server API.
    """
    serializer = VerifyInAppPurchaseSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {'error': 'Invalid request data', 'details': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = request.user
    platform = serializer.validated_data['platform']
    purchase_token = serializer.validated_data['purchase_token']
    product_id = serializer.validated_data['product_id']

    try:
        with transaction.atomic():
            # Check if purchase already exists
            existing_purchase = InAppPurchase.objects.filter(
                platform=platform,
                purchase_token=purchase_token
            ).first()

            if existing_purchase:
                if existing_purchase.is_verified:
                    return Response(
                        {'error': 'Purchase already verified'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                # Update existing purchase
                purchase = existing_purchase
                purchase.user = user
                purchase.product_id = product_id
            else:
                # Create new purchase
                purchase = InAppPurchase.objects.create(
                    user=user,
                    platform=platform,
                    purchase_token=purchase_token,
                    product_id=product_id,
                )

            # TODO: Implement actual verification with platform APIs
            # For Google Play:
            #   1. Use Google Play Developer API
            #   2. Call purchases.products.get() or purchases.subscriptions.get()
            #   3. Verify purchase token, product ID, and purchase state
            #   4. Check expiry time for subscriptions
            #
            # For Apple App Store:
            #   1. Use App Store Server API or verifyReceipt endpoint
            #   2. Send receipt data to Apple's verification endpoint
            #   3. Parse response to verify purchase
            #   4. Check expiry date for subscriptions
            #
            # Example Google Play verification:
            # from google.oauth2 import service_account
            # from googleapiclient.discovery import build
            #
            # credentials = service_account.Credentials.from_service_account_file(
            #     'path/to/service-account.json',
            #     scopes=['https://www.googleapis.com/auth/androidpublisher']
            # )
            # service = build('androidpublisher', 'v3', credentials=credentials)
            # result = service.purchases().products().get(
            #     packageName='com.moneyguard.app',
            #     productId=product_id,
            #     token=purchase_token
            # ).execute()
            #
            # if result['purchaseState'] == 0:  # 0 = purchased
            #     purchase.verify_and_activate()
            #
            # Example Apple verification:
            # import requests
            # receipt_data = {'receipt-data': purchase_token, 'password': 'shared-secret'}
            # response = requests.post(
            #     'https://buy.itunes.apple.com/verifyReceipt',
            #     json=receipt_data
            # )
            # if response.json()['status'] == 0:
            #     purchase.verify_and_activate()

            # For now, return stub response
            logger.warning(
                f"In-app purchase verification not implemented for {platform}. "
                f"User: {user.email}, Product: {product_id}"
            )

            return Response({
                'error': 'In-app purchase verification not yet implemented',
                'details': (
                    f'Please implement {platform} purchase verification in '
                    'billing/views.py::verify_in_app_purchase()'
                ),
                'todo': [
                    'Add Google Play Developer API credentials',
                    'Add Apple App Store shared secret',
                    'Implement verification logic',
                    'Handle subscription expiry',
                ]
            }, status=status.HTTP_501_NOT_IMPLEMENTED)

    except Exception as e:
        logger.error(f"Error verifying in-app purchase: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Failed to verify purchase', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_subscription(request):
    """
    Cancel user's Stripe subscription.

    POST /api/billing/cancel/
    Body:
        {
            "cancel_immediately": false,  // Optional, default false
            "reason": "Too expensive"     // Optional cancellation reason
        }

    Returns:
        {
            "success": true,
            "subscription": {...},
            "message": "Subscription will be cancelled at the end of the billing period"
        }
    """
    serializer = CancelSubscriptionSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {'error': 'Invalid request data', 'details': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = request.user

    # Check if user has a subscription
    if not hasattr(user, 'subscription'):
        return Response(
            {'error': 'No active subscription found'},
            status=status.HTTP_404_NOT_FOUND
        )

    subscription = user.subscription

    # Check if already cancelled
    if subscription.status == 'cancelled':
        return Response(
            {'error': 'Subscription is already cancelled'},
            status=status.HTTP_400_BAD_REQUEST
        )

    cancel_immediately = serializer.validated_data.get('cancel_immediately', False)
    reason = serializer.validated_data.get('reason', '')

    try:
        # Cancel subscription in Stripe
        stripe_subscription = stripe_service.cancel_subscription(
            subscription_id=subscription.stripe_subscription_id,
            cancel_immediately=cancel_immediately
        )

        # Sync subscription
        subscription = stripe_service.sync_subscription_from_stripe(stripe_subscription, user)

        # Log activity
        UserActivityLog.objects.create(
            user=user,
            action='pro_cancelled',
            metadata={
                'subscription_id': subscription.stripe_subscription_id,
                'cancel_immediately': cancel_immediately,
                'reason': reason,
                'via': 'api'
            }
        )

        # Determine message
        if cancel_immediately:
            message = 'Subscription cancelled immediately'
        else:
            message = 'Subscription will be cancelled at the end of the billing period'

        return Response({
            'success': True,
            'subscription': SubscriptionSerializer(subscription).data,
            'message': message
        }, status=status.HTTP_200_OK)

    except stripe_service.StripeServiceError as e:
        logger.error(f"Failed to cancel subscription: {str(e)}")
        return Response(
            {'error': 'Failed to cancel subscription', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_subscription_status(request):
    """
    Get current subscription status for the authenticated user.

    GET /api/billing/status/

    Returns:
        {
            "is_pro": true,
            "has_stripe_subscription": true,
            "has_in_app_purchase": false,
            "subscription": {...},
            "subscription_status": "active",
            "current_period_end": "2024-01-01T00:00:00Z",
            "cancel_at_period_end": false
        }
    """
    user = request.user

    # Check if user has Stripe subscription
    has_stripe_subscription = hasattr(user, 'subscription')
    subscription_data = None
    subscription_status = None
    current_period_end = None
    cancel_at_period_end = False

    if has_stripe_subscription:
        subscription = user.subscription
        subscription_data = SubscriptionSerializer(subscription).data
        subscription_status = subscription.status
        current_period_end = subscription.current_period_end
        cancel_at_period_end = subscription.cancel_at_period_end

    # Check if user has active in-app purchases
    has_in_app_purchase = user.in_app_purchases.filter(is_active=True).exists()

    response_data = {
        'is_pro': user.is_pro,
        'has_stripe_subscription': has_stripe_subscription,
        'has_in_app_purchase': has_in_app_purchase,
        'subscription': subscription_data,
        'subscription_status': subscription_status,
        'current_period_end': current_period_end,
        'cancel_at_period_end': cancel_at_period_end,
    }

    serializer = SubscriptionStatusSerializer(response_data)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_payment_history(request):
    """
    Get payment history for the authenticated user.

    GET /api/billing/payments/

    Returns:
        [
            {
                "id": 1,
                "stripe_payment_intent_id": "pi_xxxxx",
                "amount": "4.99",
                "currency": "USD",
                "status": "succeeded",
                "created_at": "2024-01-01T00:00:00Z"
            },
            ...
        ]
    """
    user = request.user
    payments = user.payment_history.all()[:20]  # Last 20 payments

    serializer = PaymentHistorySerializer(payments, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_portal_session(request):
    """
    Create a Stripe customer portal session URL.
    Allows customers to manage their subscription and payment methods.

    POST /api/billing/portal/
    Body:
        {
            "return_url": "https://example.com/account"
        }

    Returns:
        {
            "url": "https://billing.stripe.com/session/xxxxx"
        }
    """
    user = request.user

    if not user.stripe_customer_id:
        return Response(
            {'error': 'No Stripe customer found'},
            status=status.HTTP_404_NOT_FOUND
        )

    return_url = request.data.get('return_url')
    if not return_url:
        return Response(
            {'error': 'return_url is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        portal_url = stripe_service.get_customer_portal_url(
            customer_id=user.stripe_customer_id,
            return_url=return_url
        )

        return Response({'url': portal_url}, status=status.HTTP_200_OK)

    except stripe_service.StripeServiceError as e:
        logger.error(f"Failed to create portal session: {str(e)}")
        return Response(
            {'error': 'Failed to create portal session', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
