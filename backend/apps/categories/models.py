"""
Category models.
Domain layer - business entities for categorization.
"""
from django.db import models
from django.conf import settings
from core.models import TimeStampedModel, SoftDeleteModel


class Category(TimeStampedModel, SoftDeleteModel):
    """
    Category model for expenses and income.
    Can be user-defined or system default.
    """
    CATEGORY_TYPES = (
        ('expense', 'Expense'),
        ('income', 'Income'),
        ('both', 'Both'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='categories',
        null=True,
        blank=True,
        help_text='Null for system default categories'
    )
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    type = models.CharField(
        max_length=10,
        choices=CATEGORY_TYPES,
        default='expense'
    )
    icon = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text='Icon identifier (emoji or icon name)'
    )
    color = models.CharField(
        max_length=7,
        default='#6366f1',
        help_text='Hex color code'
    )
    is_system_default = models.BooleanField(
        default=False,
        help_text='System default categories cannot be deleted'
    )
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='subcategories',
        help_text='For creating category hierarchies'
    )

    class Meta:
        db_table = 'categories'
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'
        unique_together = ['user', 'name', 'type']
        ordering = ['name']

    def __str__(self):
        return f'{self.name} ({self.type})'

    @property
    def full_name(self):
        """Return full category name including parent."""
        if self.parent:
            return f'{self.parent.name} > {self.name}'
        return self.name


class Tag(TimeStampedModel, SoftDeleteModel):
    """
    Tag model for additional categorization.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='tags'
    )
    name = models.CharField(max_length=50)
    color = models.CharField(
        max_length=7,
        default='#10b981',
        help_text='Hex color code'
    )

    class Meta:
        db_table = 'tags'
        verbose_name = 'Tag'
        verbose_name_plural = 'Tags'
        unique_together = ['user', 'name']
        ordering = ['name']

    def __str__(self):
        return self.name
