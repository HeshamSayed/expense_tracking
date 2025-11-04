"""
Serializers for the exports app.
"""
from rest_framework import serializers
from .models import ExportJob


class ExportJobSerializer(serializers.ModelSerializer):
    """
    Serializer for ExportJob model.
    """
    user_email = serializers.EmailField(source='user.email', read_only=True)
    is_expired = serializers.BooleanField(read_only=True)

    class Meta:
        model = ExportJob
        fields = [
            'id',
            'user',
            'user_email',
            'export_type',
            'status',
            'file_url',
            'params',
            'error_message',
            'file_size',
            'created_at',
            'updated_at',
            'completed_at',
            'is_expired',
        ]
        read_only_fields = [
            'id',
            'user',
            'user_email',
            'status',
            'file_url',
            'error_message',
            'file_size',
            'created_at',
            'updated_at',
            'completed_at',
            'is_expired',
        ]


class CreateExportJobSerializer(serializers.ModelSerializer):
    """
    Serializer for creating export jobs.
    Validates input parameters.
    """
    start_date = serializers.DateField(required=False, help_text='Start date for export (YYYY-MM-DD)')
    end_date = serializers.DateField(required=False, help_text='End date for export (YYYY-MM-DD)')
    account_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        help_text='List of account IDs to include in export'
    )
    category_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        help_text='List of category IDs to include in export'
    )
    transaction_type = serializers.ChoiceField(
        choices=['expense', 'income', 'all'],
        default='all',
        required=False,
        help_text='Filter by transaction type'
    )

    class Meta:
        model = ExportJob
        fields = [
            'export_type',
            'start_date',
            'end_date',
            'account_ids',
            'category_ids',
            'transaction_type',
        ]

    def validate_export_type(self, value):
        """Validate export type."""
        if value not in ['csv', 'pdf']:
            raise serializers.ValidationError("Export type must be 'csv' or 'pdf'")
        return value

    def validate(self, data):
        """
        Validate that start_date is before end_date if both are provided.
        """
        start_date = data.get('start_date')
        end_date = data.get('end_date')

        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError({
                'start_date': 'Start date must be before end date'
            })

        return data

    def create(self, validated_data):
        """
        Create export job with params stored in JSONField.
        """
        export_type = validated_data.pop('export_type')
        user = self.context['request'].user

        # Build params dictionary from remaining fields
        params = {
            'start_date': str(validated_data.get('start_date')) if validated_data.get('start_date') else None,
            'end_date': str(validated_data.get('end_date')) if validated_data.get('end_date') else None,
            'account_ids': validated_data.get('account_ids', []),
            'category_ids': validated_data.get('category_ids', []),
            'transaction_type': validated_data.get('transaction_type', 'all'),
        }

        # Create export job
        export_job = ExportJob.objects.create(
            user=user,
            export_type=export_type,
            params=params
        )

        return export_job
