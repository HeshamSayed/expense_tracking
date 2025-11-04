"""
Budget serializers.
"""
from rest_framework import serializers
from apps.categories.serializers import CategorySerializer
from apps.expenses.serializers import CurrencySerializer
from .models import Budget, BudgetAlert


class BudgetSerializer(serializers.ModelSerializer):
    """Serializer for Budget model."""
    category_detail = CategorySerializer(source='category', read_only=True)
    currency_detail = CurrencySerializer(source='currency', read_only=True)
    spent_amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True
    )
    remaining_amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True
    )
    percentage_used = serializers.FloatField(read_only=True)
    is_exceeded = serializers.BooleanField(read_only=True)
    is_alert_threshold_reached = serializers.BooleanField(read_only=True)

    class Meta:
        model = Budget
        fields = [
            'id', 'name', 'amount', 'currency', 'currency_detail',
            'period', 'start_date', 'end_date', 'category',
            'category_detail', 'alert_threshold', 'is_active',
            'spent_amount', 'remaining_amount', 'percentage_used',
            'is_exceeded', 'is_alert_threshold_reached',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, attrs):
        """Validate budget data."""
        user = self.context['request'].user
        category = attrs.get('category')
        end_date = attrs.get('end_date')
        start_date = attrs.get('start_date')

        # Validate category belongs to user
        if category and category.user != user and not category.is_system_default:
            raise serializers.ValidationError({
                'category': 'Invalid category.'
            })

        # Validate category type
        if category and category.type not in ['expense', 'both']:
            raise serializers.ValidationError({
                'category': 'Budget category must be of type expense or both.'
            })

        # Validate date range
        if end_date and start_date and end_date < start_date:
            raise serializers.ValidationError({
                'end_date': 'End date must be after start date.'
            })

        return attrs

    def create(self, validated_data):
        """Create budget with user."""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class BudgetAlertSerializer(serializers.ModelSerializer):
    """Serializer for BudgetAlert model."""
    budget_name = serializers.CharField(source='budget.name', read_only=True)
    budget_amount = serializers.DecimalField(
        source='budget.amount',
        max_digits=12,
        decimal_places=2,
        read_only=True
    )

    class Meta:
        model = BudgetAlert
        fields = [
            'id', 'budget', 'budget_name', 'budget_amount',
            'alert_type', 'message', 'percentage_at_alert',
            'is_read', 'read_at', 'created_at'
        ]
        read_only_fields = [
            'id', 'budget', 'alert_type', 'message',
            'percentage_at_alert', 'created_at'
        ]


class BudgetSummarySerializer(serializers.Serializer):
    """Serializer for budget summary."""
    total_budgets = serializers.IntegerField()
    active_budgets = serializers.IntegerField()
    exceeded_budgets = serializers.IntegerField()
    total_budget_amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_spent = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_remaining = serializers.DecimalField(max_digits=15, decimal_places=2)
    average_usage_percentage = serializers.FloatField()
