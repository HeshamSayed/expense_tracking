"""
Serializers for notifications app.
"""
from rest_framework import serializers
from .models import NotificationPreference


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    """
    Serializer for NotificationPreference model.
    """
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = NotificationPreference
        fields = [
            'user_email',
            'daily_summary',
            'weekly_summary',
            'budget_alerts',
            'recurring_transaction_alerts',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['user_email', 'created_at', 'updated_at']

    def validate(self, attrs):
        """
        Validate notification preferences.
        At least one notification type should be enabled.
        """
        # Get current values or use new values
        daily = attrs.get('daily_summary', self.instance.daily_summary if self.instance else True)
        weekly = attrs.get('weekly_summary', self.instance.weekly_summary if self.instance else True)
        budget = attrs.get('budget_alerts', self.instance.budget_alerts if self.instance else True)
        recurring = attrs.get('recurring_transaction_alerts', self.instance.recurring_transaction_alerts if self.instance else True)

        # Check if at least one is enabled (optional validation)
        # You can remove this if you want to allow all notifications to be disabled
        # if not any([daily, weekly, budget, recurring]):
        #     raise serializers.ValidationError(
        #         "At least one notification type must be enabled."
        #     )

        return attrs
