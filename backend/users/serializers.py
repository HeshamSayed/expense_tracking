"""
Serializers for user authentication and profile management.
Implements secure practices to prevent information disclosure.
"""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import User, UserActivityLog


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    Validates password and creates user account.
    """
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = ['email', 'password', 'password_confirm', 'first_name', 'last_name', 'timezone', 'locale']
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
        }

    def validate_email(self, value):
        """
        Validate email format and check existence.
        Security: Return generic error to prevent user enumeration.
        """
        if User.objects.filter(email__iexact=value).exists():
            # Generic message - don't confirm email exists
            raise serializers.ValidationError("This email address cannot be used.")
        return value.lower()

    def validate(self, attrs):
        """Validate password match and complexity."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                "password": "Passwords do not match."
            })

        # Validate password complexity
        try:
            validate_password(attrs['password'])
        except DjangoValidationError as e:
            raise serializers.ValidationError({
                "password": list(e.messages)
            })

        return attrs

    def create(self, validated_data):
        """Create user account."""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')

        user = User.objects.create_user(
            password=password,
            **validated_data
        )

        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile information.
    Used for GET /api/me/ endpoint.
    """
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'is_pro',
            'timezone',
            'locale',
            'default_currency',
            'ads_consent',
            'created_at',
        ]
        read_only_fields = ['id', 'email', 'is_pro', 'created_at']


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user profile.
    Does not allow changing email or subscription status.
    """

    class Meta:
        model = User
        fields = [
            'first_name',
            'last_name',
            'timezone',
            'locale',
            'default_currency',
            'ads_consent',
        ]

    def validate_timezone(self, value):
        """Validate timezone string."""
        import pytz
        if value not in pytz.all_timezones:
            raise serializers.ValidationError("Invalid timezone.")
        return value

    def validate_default_currency(self, value):
        """Validate currency code (ISO 4217)."""
        # List of common currencies
        valid_currencies = [
            'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'AUD', 'CAD', 'CHF',
            'INR', 'MXN', 'BRL', 'ZAR', 'SEK', 'NOK', 'DKK', 'PLN',
        ]
        if value.upper() not in valid_currencies:
            raise serializers.ValidationError("Unsupported currency code.")
        return value.upper()


class PasswordChangeSerializer(serializers.Serializer):
    """
    Serializer for password change.
    Requires current password for security.
    """
    current_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    new_password_confirm = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )

    def validate_current_password(self, value):
        """Verify current password is correct."""
        user = self.context['request'].user
        if not user.check_password(value):
            # Generic error - don't confirm if password is wrong
            raise serializers.ValidationError("Invalid credentials.")
        return value

    def validate(self, attrs):
        """Validate new password match and complexity."""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                "new_password": "Passwords do not match."
            })

        # Validate password complexity
        try:
            validate_password(attrs['new_password'])
        except DjangoValidationError as e:
            raise serializers.ValidationError({
                "new_password": list(e.messages)
            })

        return attrs

    def save(self):
        """Update user password."""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class PasswordResetRequestSerializer(serializers.Serializer):
    """
    Serializer for password reset request.
    Security: Always returns success to prevent user enumeration.
    """
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        return value.lower()


class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    Serializer for password reset confirmation.
    """
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    new_password_confirm = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )

    def validate(self, attrs):
        """Validate password match and complexity."""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                "new_password": "Passwords do not match."
            })

        try:
            validate_password(attrs['new_password'])
        except DjangoValidationError as e:
            raise serializers.ValidationError({
                "new_password": list(e.messages)
            })

        return attrs


class AdConsentSerializer(serializers.Serializer):
    """
    Serializer for updating ad consent (GDPR compliance).
    """
    ads_consent = serializers.BooleanField(required=True)


class UserActivityLogSerializer(serializers.ModelSerializer):
    """
    Serializer for user activity logs (read-only).
    """

    class Meta:
        model = UserActivityLog
        fields = ['action', 'created_at', 'ip_address']
        read_only_fields = fields
