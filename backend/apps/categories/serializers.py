"""
Category serializers.
"""
from rest_framework import serializers
from .models import Category, Tag


class SubCategorySerializer(serializers.ModelSerializer):
    """Serializer for subcategories."""

    class Meta:
        model = Category
        fields = ['id', 'name', 'icon', 'color', 'type']


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model."""
    subcategories = SubCategorySerializer(many=True, read_only=True)
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'description', 'type', 'icon', 'color',
            'is_system_default', 'parent', 'subcategories',
            'full_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'is_system_default', 'created_at', 'updated_at']

    def validate(self, attrs):
        """Validate category data."""
        user = self.context['request'].user
        name = attrs.get('name')
        category_type = attrs.get('type')
        parent = attrs.get('parent')

        # Check for duplicate category name for the user
        if self.instance is None:  # Creating new category
            if Category.objects.filter(
                user=user,
                name=name,
                type=category_type,
                is_deleted=False
            ).exists():
                raise serializers.ValidationError({
                    'name': 'You already have a category with this name and type.'
                })

        # Validate parent category
        if parent and parent.user != user:
            raise serializers.ValidationError({
                'parent': 'Invalid parent category.'
            })

        return attrs

    def create(self, validated_data):
        """Create category with user."""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class TagSerializer(serializers.ModelSerializer):
    """Serializer for Tag model."""

    class Meta:
        model = Tag
        fields = ['id', 'name', 'color', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_name(self, value):
        """Validate tag name uniqueness for user."""
        user = self.context['request'].user

        if self.instance is None:  # Creating new tag
            if Tag.objects.filter(user=user, name=value, is_deleted=False).exists():
                raise serializers.ValidationError(
                    'You already have a tag with this name.'
                )

        return value

    def create(self, validated_data):
        """Create tag with user."""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
