"""
Category admin configuration.
"""
from django.contrib import admin
from .models import Category, Tag


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """Admin interface for Category model."""
    list_display = [
        'name', 'type', 'user', 'is_system_default',
        'parent', 'color', 'created_at'
    ]
    list_filter = ['type', 'is_system_default', 'created_at']
    search_fields = ['name', 'description', 'user__email']
    ordering = ['name']
    list_per_page = 50

    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'type', 'user')
        }),
        ('Appearance', {
            'fields': ('icon', 'color')
        }),
        ('Hierarchy', {
            'fields': ('parent', 'is_system_default')
        }),
    )


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    """Admin interface for Tag model."""
    list_display = ['name', 'user', 'color', 'created_at']
    search_fields = ['name', 'user__email']
    list_filter = ['created_at']
    ordering = ['name']
