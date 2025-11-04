"""
Expense serializers.
"""
from rest_framework import serializers
from django.utils import timezone
from apps.categories.serializers import CategorySerializer, TagSerializer
from .models import (
    Expense, Income, Currency, Receipt,
    RecurringTransaction, SharedExpense
)


class CurrencySerializer(serializers.ModelSerializer):
    """Serializer for Currency model."""

    class Meta:
        model = Currency
        fields = [
            'id', 'code', 'name', 'symbol',
            'exchange_rate_to_usd', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ReceiptSerializer(serializers.ModelSerializer):
    """Serializer for Receipt model."""

    class Meta:
        model = Receipt
        fields = [
            'id', 'expense', 'image', 'file_name',
            'file_size', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'file_size', 'created_at']

    def create(self, validated_data):
        """Set file size automatically."""
        image = validated_data.get('image')
        if image:
            validated_data['file_size'] = image.size
            validated_data['file_name'] = image.name
        return super().create(validated_data)


class ExpenseSerializer(serializers.ModelSerializer):
    """Serializer for Expense model."""
    category_detail = CategorySerializer(source='category', read_only=True)
    currency_detail = CurrencySerializer(source='currency', read_only=True)
    tags_detail = TagSerializer(source='tags', many=True, read_only=True)
    receipts = ReceiptSerializer(many=True, read_only=True)
    amount_in_usd = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True
    )

    class Meta:
        model = Expense
        fields = [
            'id', 'category', 'category_detail', 'amount', 'currency',
            'currency_detail', 'description', 'date', 'payment_method',
            'location', 'tags', 'tags_detail', 'notes', 'is_recurring',
            'receipts', 'amount_in_usd', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, attrs):
        """Validate expense data."""
        user = self.context['request'].user
        category = attrs.get('category')

        # Validate category belongs to user or is system default
        if category and category.user != user and not category.is_system_default:
            raise serializers.ValidationError({
                'category': 'Invalid category.'
            })

        # Validate category type
        if category and category.type not in ['expense', 'both']:
            raise serializers.ValidationError({
                'category': 'Category must be of type expense or both.'
            })

        return attrs

    def create(self, validated_data):
        """Create expense with user."""
        tags = validated_data.pop('tags', [])
        validated_data['user'] = self.context['request'].user
        expense = Expense.objects.create(**validated_data)
        expense.tags.set(tags)
        return expense


class IncomeSerializer(serializers.ModelSerializer):
    """Serializer for Income model."""
    category_detail = CategorySerializer(source='category', read_only=True)
    currency_detail = CurrencySerializer(source='currency', read_only=True)
    tags_detail = TagSerializer(source='tags', many=True, read_only=True)
    amount_in_usd = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True
    )

    class Meta:
        model = Income
        fields = [
            'id', 'category', 'category_detail', 'amount', 'currency',
            'currency_detail', 'description', 'date', 'income_type',
            'source', 'tags', 'tags_detail', 'notes', 'is_recurring',
            'amount_in_usd', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, attrs):
        """Validate income data."""
        user = self.context['request'].user
        category = attrs.get('category')

        # Validate category belongs to user or is system default
        if category and category.user != user and not category.is_system_default:
            raise serializers.ValidationError({
                'category': 'Invalid category.'
            })

        # Validate category type
        if category and category.type not in ['income', 'both']:
            raise serializers.ValidationError({
                'category': 'Category must be of type income or both.'
            })

        return attrs

    def create(self, validated_data):
        """Create income with user."""
        tags = validated_data.pop('tags', [])
        validated_data['user'] = self.context['request'].user
        income = Income.objects.create(**validated_data)
        income.tags.set(tags)
        return income


class RecurringTransactionSerializer(serializers.ModelSerializer):
    """Serializer for RecurringTransaction model."""
    category_detail = CategorySerializer(source='category', read_only=True)
    currency_detail = CurrencySerializer(source='currency', read_only=True)

    class Meta:
        model = RecurringTransaction
        fields = [
            'id', 'transaction_type', 'category', 'category_detail',
            'amount', 'currency', 'currency_detail', 'description',
            'frequency', 'start_date', 'end_date', 'next_due_date',
            'is_active', 'last_generated_date', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'last_generated_date', 'created_at', 'updated_at'
        ]

    def validate(self, attrs):
        """Validate recurring transaction data."""
        user = self.context['request'].user
        category = attrs.get('category')
        end_date = attrs.get('end_date')
        start_date = attrs.get('start_date')

        # Validate category
        if category and category.user != user and not category.is_system_default:
            raise serializers.ValidationError({
                'category': 'Invalid category.'
            })

        # Validate date range
        if end_date and start_date and end_date < start_date:
            raise serializers.ValidationError({
                'end_date': 'End date must be after start date.'
            })

        return attrs

    def create(self, validated_data):
        """Create recurring transaction with user."""
        validated_data['user'] = self.context['request'].user
        # Set next_due_date to start_date if not provided
        if 'next_due_date' not in validated_data:
            validated_data['next_due_date'] = validated_data['start_date']
        return super().create(validated_data)


class SharedExpenseSerializer(serializers.ModelSerializer):
    """Serializer for SharedExpense model."""
    expense_detail = ExpenseSerializer(source='expense', read_only=True)
    shared_with_email = serializers.EmailField(
        source='shared_with.email',
        read_only=True
    )

    class Meta:
        model = SharedExpense
        fields = [
            'id', 'expense', 'expense_detail', 'shared_with',
            'shared_with_email', 'share_amount', 'is_settled',
            'settled_date', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, attrs):
        """Validate shared expense data."""
        expense = attrs.get('expense')
        shared_with = attrs.get('shared_with')
        share_amount = attrs.get('share_amount')

        # Validate expense belongs to user
        if expense.user != self.context['request'].user:
            raise serializers.ValidationError({
                'expense': 'You can only share your own expenses.'
            })

        # Validate not sharing with self
        if shared_with == self.context['request'].user:
            raise serializers.ValidationError({
                'shared_with': 'You cannot share an expense with yourself.'
            })

        # Validate share amount doesn't exceed expense amount
        if share_amount > expense.amount:
            raise serializers.ValidationError({
                'share_amount': 'Share amount cannot exceed expense amount.'
            })

        return attrs

    def update(self, instance, validated_data):
        """Update shared expense and set settled date."""
        is_settled = validated_data.get('is_settled', instance.is_settled)

        if is_settled and not instance.is_settled:
            validated_data['settled_date'] = timezone.now().date()
        elif not is_settled and instance.is_settled:
            validated_data['settled_date'] = None

        return super().update(instance, validated_data)
