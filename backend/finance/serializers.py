"""
Serializers for finance app.
"""
from rest_framework import serializers
from .models import Account, Transaction, Category, Budget, RecurringTransaction
from decimal import Decimal


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model."""

    class Meta:
        model = Category
        fields = ['id', 'name', 'type', 'icon', 'color', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate(self, attrs):
        """Ensure user-specific categories are unique."""
        user = self.context['request'].user
        name = attrs.get('name')
        type = attrs.get('type')

        # Check if category with same name and type exists for this user
        existing = Category.objects.filter(
            user=user,
            name__iexact=name,
            type=type
        )

        if self.instance:
            existing = existing.exclude(pk=self.instance.pk)

        if existing.exists():
            raise serializers.ValidationError(
                "A category with this name and type already exists."
            )

        return attrs


class AccountSerializer(serializers.ModelSerializer):
    """Serializer for Account model."""
    transaction_count = serializers.SerializerMethodField()

    class Meta:
        model = Account
        fields = [
            'id',
            'name',
            'currency',
            'balance',
            'is_archived',
            'transaction_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'balance', 'created_at', 'updated_at']

    def get_transaction_count(self, obj):
        """Return count of transactions for this account."""
        return obj.transactions.count()

    def validate_name(self, value):
        """Validate account name uniqueness for user."""
        user = self.context['request'].user
        existing = Account.objects.filter(user=user, name__iexact=value)

        if self.instance:
            existing = existing.exclude(pk=self.instance.pk)

        if existing.exists():
            raise serializers.ValidationError(
                "An account with this name already exists."
            )

        return value


class TransactionSerializer(serializers.ModelSerializer):
    """Serializer for Transaction model."""
    category_name = serializers.CharField(source='category.name', read_only=True)
    account_name = serializers.CharField(source='account.name', read_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id',
            'account',
            'account_name',
            'category',
            'category_name',
            'amount',
            'currency',
            'transaction_type',
            'date',
            'notes',
            'attachment_url',
            'imported',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'imported', 'created_at', 'updated_at']

    def validate(self, attrs):
        """Validate transaction data."""
        user = self.context['request'].user
        account = attrs.get('account')
        category = attrs.get('category')
        amount = attrs.get('amount')
        transaction_type = attrs.get('transaction_type')

        # Verify account belongs to user
        if account and account.user != user:
            raise serializers.ValidationError({
                'account': 'Invalid account.'
            })

        # Verify category belongs to user or is global
        if category and category.user and category.user != user:
            raise serializers.ValidationError({
                'category': 'Invalid category.'
            })

        # Verify category type matches transaction type
        if category and category.type != transaction_type:
            raise serializers.ValidationError({
                'category': f'Category must be of type {transaction_type}.'
            })

        # Verify sufficient balance for expenses
        if transaction_type == 'expense' and account:
            if not self.instance:  # New transaction
                if account.balance < amount:
                    raise serializers.ValidationError({
                        'amount': 'Insufficient account balance.'
                    })

        return attrs

    def create(self, validated_data):
        """Create transaction and set user."""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class RecurringTransactionSerializer(serializers.ModelSerializer):
    """Serializer for RecurringTransaction model."""
    category_name = serializers.CharField(source='category.name', read_only=True)
    account_name = serializers.CharField(source='account.name', read_only=True)

    class Meta:
        model = RecurringTransaction
        fields = [
            'id',
            'account',
            'account_name',
            'category',
            'category_name',
            'amount',
            'currency',
            'frequency',
            'transaction_type',
            'description',
            'next_run',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, attrs):
        """Validate recurring transaction data."""
        user = self.context['request'].user
        account = attrs.get('account')
        category = attrs.get('category')

        # Verify account belongs to user
        if account and account.user != user:
            raise serializers.ValidationError({
                'account': 'Invalid account.'
            })

        # Verify category belongs to user or is global
        if category and category.user and category.user != user:
            raise serializers.ValidationError({
                'category': 'Invalid category.'
            })

        return attrs

    def create(self, validated_data):
        """Create recurring transaction and set user."""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class BudgetSerializer(serializers.ModelSerializer):
    """Serializer for Budget model."""
    category_name = serializers.CharField(source='category.name', read_only=True)
    spent_amount = serializers.SerializerMethodField()
    percentage_used = serializers.SerializerMethodField()

    class Meta:
        model = Budget
        fields = [
            'id',
            'category',
            'category_name',
            'amount',
            'period',
            'start_date',
            'alert_threshold',
            'is_active',
            'spent_amount',
            'percentage_used',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_spent_amount(self, obj):
        """Get amount spent in current budget period."""
        return float(obj.get_spent_amount())

    def get_percentage_used(self, obj):
        """Get percentage of budget used."""
        return round(obj.get_percentage_used(), 2)

    def validate(self, attrs):
        """Validate budget data."""
        user = self.context['request'].user
        category = attrs.get('category')

        # Verify category belongs to user or is global
        if category and category.user and category.user != user:
            raise serializers.ValidationError({
                'category': 'Invalid category.'
            })

        # Verify category is expense type
        if category and category.type != 'expense':
            raise serializers.ValidationError({
                'category': 'Budgets can only be set for expense categories.'
            })

        return attrs

    def create(self, validated_data):
        """Create budget and set user."""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
