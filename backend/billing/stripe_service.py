"""
Stripe service helper functions.
Provides a clean interface for Stripe API operations.
"""
import stripe
import logging
from django.conf import settings
from django.utils import timezone
from typing import Optional, Dict, Any
from .models import Subscription, PaymentHistory

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

logger = logging.getLogger(__name__)


class StripeServiceError(Exception):
    """Custom exception for Stripe service errors."""
    pass


def create_customer(user, email: Optional[str] = None) -> str:
    """
    Create a Stripe customer for the given user.

    Args:
        user: User instance
        email: Optional email override (defaults to user.email)

    Returns:
        Stripe customer ID

    Raises:
        StripeServiceError: If customer creation fails
    """
    try:
        customer = stripe.Customer.create(
            email=email or user.email,
            metadata={
                'user_id': user.id,
                'environment': settings.ENVIRONMENT if hasattr(settings, 'ENVIRONMENT') else 'development',
            }
        )

        # Save Stripe customer ID to user
        user.stripe_customer_id = customer.id
        user.save(update_fields=['stripe_customer_id'])

        logger.info(f"Created Stripe customer {customer.id} for user {user.email}")
        return customer.id

    except stripe.error.StripeError as e:
        logger.error(f"Failed to create Stripe customer for user {user.email}: {str(e)}")
        raise StripeServiceError(f"Failed to create customer: {str(e)}")


def get_or_create_customer(user) -> str:
    """
    Get existing Stripe customer ID or create a new one.

    Args:
        user: User instance

    Returns:
        Stripe customer ID

    Raises:
        StripeServiceError: If customer retrieval/creation fails
    """
    if user.stripe_customer_id:
        try:
            # Verify customer still exists in Stripe
            stripe.Customer.retrieve(user.stripe_customer_id)
            return user.stripe_customer_id
        except stripe.error.InvalidRequestError:
            logger.warning(f"Stripe customer {user.stripe_customer_id} not found, creating new one")

    return create_customer(user)


def create_checkout_session(
    user,
    price_id: str,
    success_url: str,
    cancel_url: str,
    trial_period_days: Optional[int] = None
) -> Dict[str, Any]:
    """
    Create a Stripe checkout session for subscription.

    Args:
        user: User instance
        price_id: Stripe price ID
        success_url: URL to redirect after successful payment
        cancel_url: URL to redirect if user cancels
        trial_period_days: Optional trial period in days

    Returns:
        Dict containing checkout session details (id, url)

    Raises:
        StripeServiceError: If checkout session creation fails
    """
    try:
        customer_id = get_or_create_customer(user)

        session_params = {
            'customer': customer_id,
            'payment_method_types': ['card'],
            'line_items': [{
                'price': price_id,
                'quantity': 1,
            }],
            'mode': 'subscription',
            'success_url': success_url,
            'cancel_url': cancel_url,
            'metadata': {
                'user_id': user.id,
            },
            'subscription_data': {
                'metadata': {
                    'user_id': user.id,
                }
            }
        }

        # Add trial period if specified
        if trial_period_days:
            session_params['subscription_data']['trial_period_days'] = trial_period_days

        session = stripe.checkout.Session.create(**session_params)

        logger.info(f"Created checkout session {session.id} for user {user.email}")

        return {
            'id': session.id,
            'url': session.url,
        }

    except stripe.error.StripeError as e:
        logger.error(f"Failed to create checkout session for user {user.email}: {str(e)}")
        raise StripeServiceError(f"Failed to create checkout session: {str(e)}")


def create_subscription(
    user,
    price_id: str,
    trial_period_days: Optional[int] = None
) -> stripe.Subscription:
    """
    Create a Stripe subscription directly (without checkout).

    Args:
        user: User instance
        price_id: Stripe price ID
        trial_period_days: Optional trial period in days

    Returns:
        Stripe subscription object

    Raises:
        StripeServiceError: If subscription creation fails
    """
    try:
        customer_id = get_or_create_customer(user)

        subscription_params = {
            'customer': customer_id,
            'items': [{'price': price_id}],
            'metadata': {
                'user_id': user.id,
            }
        }

        if trial_period_days:
            subscription_params['trial_period_days'] = trial_period_days

        subscription = stripe.Subscription.create(**subscription_params)

        logger.info(f"Created subscription {subscription.id} for user {user.email}")
        return subscription

    except stripe.error.StripeError as e:
        logger.error(f"Failed to create subscription for user {user.email}: {str(e)}")
        raise StripeServiceError(f"Failed to create subscription: {str(e)}")


def cancel_subscription(
    subscription_id: str,
    cancel_immediately: bool = False
) -> stripe.Subscription:
    """
    Cancel a Stripe subscription.

    Args:
        subscription_id: Stripe subscription ID
        cancel_immediately: If True, cancel immediately. If False, cancel at period end.

    Returns:
        Updated Stripe subscription object

    Raises:
        StripeServiceError: If cancellation fails
    """
    try:
        if cancel_immediately:
            # Cancel immediately
            subscription = stripe.Subscription.delete(subscription_id)
            logger.info(f"Immediately cancelled subscription {subscription_id}")
        else:
            # Cancel at end of billing period
            subscription = stripe.Subscription.modify(
                subscription_id,
                cancel_at_period_end=True
            )
            logger.info(f"Scheduled subscription {subscription_id} for cancellation at period end")

        return subscription

    except stripe.error.StripeError as e:
        logger.error(f"Failed to cancel subscription {subscription_id}: {str(e)}")
        raise StripeServiceError(f"Failed to cancel subscription: {str(e)}")


def reactivate_subscription(subscription_id: str) -> stripe.Subscription:
    """
    Reactivate a subscription that was scheduled for cancellation.

    Args:
        subscription_id: Stripe subscription ID

    Returns:
        Updated Stripe subscription object

    Raises:
        StripeServiceError: If reactivation fails
    """
    try:
        subscription = stripe.Subscription.modify(
            subscription_id,
            cancel_at_period_end=False
        )
        logger.info(f"Reactivated subscription {subscription_id}")
        return subscription

    except stripe.error.StripeError as e:
        logger.error(f"Failed to reactivate subscription {subscription_id}: {str(e)}")
        raise StripeServiceError(f"Failed to reactivate subscription: {str(e)}")


def retrieve_subscription(subscription_id: str) -> stripe.Subscription:
    """
    Retrieve a Stripe subscription.

    Args:
        subscription_id: Stripe subscription ID

    Returns:
        Stripe subscription object

    Raises:
        StripeServiceError: If retrieval fails
    """
    try:
        subscription = stripe.Subscription.retrieve(subscription_id)
        return subscription

    except stripe.error.StripeError as e:
        logger.error(f"Failed to retrieve subscription {subscription_id}: {str(e)}")
        raise StripeServiceError(f"Failed to retrieve subscription: {str(e)}")


def verify_webhook_signature(
    payload: bytes,
    signature: str,
    webhook_secret: str
) -> stripe.Event:
    """
    Verify Stripe webhook signature and construct event.

    Args:
        payload: Raw request body bytes
        signature: Stripe signature header
        webhook_secret: Stripe webhook secret

    Returns:
        Verified Stripe event object

    Raises:
        StripeServiceError: If signature verification fails
    """
    try:
        event = stripe.Webhook.construct_event(
            payload, signature, webhook_secret
        )
        return event

    except ValueError as e:
        logger.error(f"Invalid webhook payload: {str(e)}")
        raise StripeServiceError("Invalid payload")

    except stripe.error.SignatureVerificationError as e:
        logger.error(f"Invalid webhook signature: {str(e)}")
        raise StripeServiceError("Invalid signature")


def sync_subscription_from_stripe(stripe_subscription: stripe.Subscription, user) -> Subscription:
    """
    Sync or create a local Subscription from Stripe subscription data.

    Args:
        stripe_subscription: Stripe subscription object
        user: User instance

    Returns:
        Local Subscription instance
    """
    from django.utils.dateformat import format as date_format

    subscription_data = {
        'user': user,
        'stripe_subscription_id': stripe_subscription.id,
        'status': stripe_subscription.status,
        'current_period_start': timezone.datetime.fromtimestamp(
            stripe_subscription.current_period_start,
            tz=timezone.get_current_timezone()
        ),
        'current_period_end': timezone.datetime.fromtimestamp(
            stripe_subscription.current_period_end,
            tz=timezone.get_current_timezone()
        ),
        'cancel_at_period_end': stripe_subscription.cancel_at_period_end,
    }

    # Add optional fields
    if stripe_subscription.canceled_at:
        subscription_data['canceled_at'] = timezone.datetime.fromtimestamp(
            stripe_subscription.canceled_at,
            tz=timezone.get_current_timezone()
        )

    if stripe_subscription.trial_start:
        subscription_data['trial_start'] = timezone.datetime.fromtimestamp(
            stripe_subscription.trial_start,
            tz=timezone.get_current_timezone()
        )

    if stripe_subscription.trial_end:
        subscription_data['trial_end'] = timezone.datetime.fromtimestamp(
            stripe_subscription.trial_end,
            tz=timezone.get_current_timezone()
        )

    # Update or create subscription
    subscription, created = Subscription.objects.update_or_create(
        stripe_subscription_id=stripe_subscription.id,
        defaults=subscription_data
    )

    action = "Created" if created else "Updated"
    logger.info(f"{action} subscription {subscription.id} for user {user.email}")

    # Update user's Pro status based on subscription status
    if subscription.is_active:
        user.activate_pro()
    else:
        # Only deactivate if user has no other active purchases
        has_active_purchase = user.in_app_purchases.filter(is_active=True).exists()
        if not has_active_purchase:
            user.deactivate_pro()

    return subscription


def create_payment_history_from_invoice(
    invoice: stripe.Invoice,
    user
) -> Optional[PaymentHistory]:
    """
    Create a PaymentHistory record from a Stripe invoice.

    Args:
        invoice: Stripe invoice object
        user: User instance

    Returns:
        PaymentHistory instance or None if payment intent is missing
    """
    if not invoice.payment_intent:
        logger.warning(f"Invoice {invoice.id} has no payment intent")
        return None

    # Get subscription if exists
    subscription = None
    if invoice.subscription:
        try:
            subscription = Subscription.objects.get(stripe_subscription_id=invoice.subscription)
        except Subscription.DoesNotExist:
            logger.warning(f"Subscription {invoice.subscription} not found in database")

    payment_data = {
        'user': user,
        'stripe_payment_intent_id': invoice.payment_intent,
        'stripe_invoice_id': invoice.id,
        'subscription': subscription,
        'amount': invoice.amount_paid / 100,  # Convert from cents
        'currency': invoice.currency.upper(),
        'status': 'succeeded' if invoice.paid else 'failed',
    }

    if not invoice.paid and invoice.last_finalization_error:
        payment_data['failure_message'] = invoice.last_finalization_error.get('message', '')

    payment, created = PaymentHistory.objects.update_or_create(
        stripe_payment_intent_id=invoice.payment_intent,
        defaults=payment_data
    )

    action = "Created" if created else "Updated"
    logger.info(f"{action} payment history {payment.id} for user {user.email}")

    return payment


def get_customer_portal_url(customer_id: str, return_url: str) -> str:
    """
    Create a Stripe customer portal session URL.
    This allows customers to manage their subscription and payment methods.

    Args:
        customer_id: Stripe customer ID
        return_url: URL to return to after managing subscription

    Returns:
        Customer portal URL

    Raises:
        StripeServiceError: If portal session creation fails
    """
    try:
        session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=return_url,
        )
        return session.url

    except stripe.error.StripeError as e:
        logger.error(f"Failed to create customer portal session: {str(e)}")
        raise StripeServiceError(f"Failed to create portal session: {str(e)}")
