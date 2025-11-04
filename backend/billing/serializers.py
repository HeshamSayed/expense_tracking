"""
Serializers for billing app.
Handles serialization of subscription and in-app purchase data.
"""
from rest_framework import serializers
from .models import Subscription, InAppPurchase, PaymentHistory


class SubscriptionSerializer(serializers.ModelSerializer):
    """
    Serializer for Subscription model.
    Provides detailed subscription information to clients.
    """

    is_active = serializers.ReadOnlyField()
    is_cancelled = serializers.ReadOnlyField()
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Subscription
        fields = [
            'id',
            'user',
            'user_email',
            'stripe_subscription_id',
            'status',
            'current_period_start',
            'current_period_end',
            'cancel_at_period_end',
            'canceled_at',
            'trial_start',
            'trial_end',
            'is_active',
            'is_cancelled',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'user',
            'stripe_subscription_id',
            'status',
            'current_period_start',
            'current_period_end',
            'cancel_at_period_end',
            'canceled_at',
            'trial_start',
            'trial_end',
            'created_at',
            'updated_at',
        ]


class SubscriptionStatusSerializer(serializers.Serializer):
    """
    Simplified serializer for subscription status.
    Used in the get_subscription_status endpoint.
    """

    is_pro = serializers.BooleanField()
    has_stripe_subscription = serializers.BooleanField()
    has_in_app_purchase = serializers.BooleanField()
    subscription = SubscriptionSerializer(allow_null=True, required=False)
    subscription_status = serializers.CharField(allow_null=True, required=False)
    current_period_end = serializers.DateTimeField(allow_null=True, required=False)
    cancel_at_period_end = serializers.BooleanField(required=False, default=False)


class InAppPurchaseSerializer(serializers.ModelSerializer):
    """
    Serializer for InAppPurchase model.
    Provides in-app purchase information to clients.
    """

    user_email = serializers.EmailField(source='user.email', read_only=True)
    platform_display = serializers.CharField(source='get_platform_display', read_only=True)

    class Meta:
        model = InAppPurchase
        fields = [
            'id',
            'user',
            'user_email',
            'platform',
            'platform_display',
            'purchase_token',
            'product_id',
            'is_verified',
            'verified_at',
            'expires_at',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'user',
            'is_verified',
            'verified_at',
            'is_active',
            'created_at',
            'updated_at',
        ]
        extra_kwargs = {
            'purchase_token': {'write_only': True},  # Don't expose in responses
        }


class VerifyInAppPurchaseSerializer(serializers.Serializer):
    """
    Serializer for verifying in-app purchases.
    Used in the verify_in_app_purchase endpoint.
    """

    platform = serializers.ChoiceField(
        choices=['google', 'apple'],
        help_text="Platform where purchase was made (google or apple)"
    )
    purchase_token = serializers.CharField(
        max_length=4096,
        help_text="Purchase token from Google Play or Apple receipt data"
    )
    product_id = serializers.CharField(
        max_length=255,
        help_text="Product ID from the app store (e.g., pro_monthly)"
    )

    def validate_purchase_token(self, value):
        """Validate purchase token is not empty."""
        if not value or not value.strip():
            raise serializers.ValidationError("Purchase token cannot be empty")
        return value.strip()

    def validate_product_id(self, value):
        """Validate product ID is not empty."""
        if not value or not value.strip():
            raise serializers.ValidationError("Product ID cannot be empty")
        return value.strip()


class CreateCheckoutSessionSerializer(serializers.Serializer):
    """
    Serializer for creating Stripe checkout sessions.
    Used in the create_checkout_session endpoint.
    """

    success_url = serializers.URLField(
        help_text="URL to redirect to after successful payment"
    )
    cancel_url = serializers.URLField(
        help_text="URL to redirect to if user cancels"
    )
    price_id = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Optional: Stripe price ID to use (defaults to settings.STRIPE_PRO_PRICE_ID)"
    )

    def validate_success_url(self, value):
        """Ensure success_url is a valid URL."""
        if not value.startswith(('http://', 'https://')):
            raise serializers.ValidationError("Must be a valid HTTP/HTTPS URL")
        return value

    def validate_cancel_url(self, value):
        """Ensure cancel_url is a valid URL."""
        if not value.startswith(('http://', 'https://')):
            raise serializers.ValidationError("Must be a valid HTTP/HTTPS URL")
        return value


class PaymentHistorySerializer(serializers.ModelSerializer):
    """
    Serializer for PaymentHistory model.
    Provides payment history information to clients.
    """

    user_email = serializers.EmailField(source='user.email', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = PaymentHistory
        fields = [
            'id',
            'user',
            'user_email',
            'stripe_payment_intent_id',
            'stripe_invoice_id',
            'subscription',
            'amount',
            'currency',
            'status',
            'status_display',
            'failure_message',
            'created_at',
            'updated_at',
        ]
        read_only_fields = '__all__'


class CancelSubscriptionSerializer(serializers.Serializer):
    """
    Serializer for canceling subscriptions.
    Used in the cancel_subscription endpoint.
    """

    cancel_immediately = serializers.BooleanField(
        default=False,
        help_text="If true, cancel immediately. If false, cancel at end of billing period."
    )
    reason = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=500,
        help_text="Optional reason for cancellation (for internal tracking)"
    )
