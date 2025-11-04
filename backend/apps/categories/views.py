"""
Category views.
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db import models
from core.permissions import IsOwner
from .models import Category, Tag
from .serializers import CategorySerializer, TagSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Category CRUD operations.
    """
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['type', 'is_system_default']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    def get_queryset(self):
        """Return categories for the current user and system defaults."""
        user = self.request.user
        return Category.objects.filter(
            models.Q(user=user) | models.Q(is_system_default=True),
            is_deleted=False
        )

    def perform_destroy(self, instance):
        """Soft delete category."""
        if instance.is_system_default:
            return Response(
                {'error': 'Cannot delete system default category.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        instance.soft_delete()

    @action(detail=False, methods=['get'])
    def system_defaults(self, request):
        """Get all system default categories."""
        categories = Category.objects.filter(
            is_system_default=True,
            is_deleted=False
        )
        serializer = self.get_serializer(categories, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def subcategories(self, request, pk=None):
        """Get subcategories of a category."""
        category = self.get_object()
        subcategories = category.subcategories.filter(is_deleted=False)
        serializer = self.get_serializer(subcategories, many=True)
        return Response(serializer.data)


class TagViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Tag CRUD operations.
    """
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    def get_queryset(self):
        """Return tags for the current user."""
        return Tag.objects.filter(
            user=self.request.user,
            is_deleted=False
        )

    def perform_destroy(self, instance):
        """Soft delete tag."""
        instance.soft_delete()
