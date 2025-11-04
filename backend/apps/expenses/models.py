"""
Expense and Income models.
Domain layer - core business entities.
"""
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from decimal import Decimal
from core.models import TimeStampedModel, SoftDeleteModel
from core.utils import get_file_path


class Currency(TimeStampedModel):
    """
    Currency model for multi-currency support.
    """
    code = models.CharField(
        max_length=3,
        unique=True,
        help_text='ISO 4217 currency code (e.g., USD, EUR)'
    )
    name = models.CharField(max_length=50)
    symbol = models.CharField(max_length=10)
    exchange_rate_to_usd = models.DecimalField(
        max_digits=10,
        decimal_places=6,
        default=1.000000,
        help_text='Exchange rate relative to USD'
    )

    class Meta:
        db_table = 'currencies'
        verbose_name = 'Currency'
        verbose_name_plural = 'Currencies'
        ordering = ['code']

    def __str__(self):
        return f'{self.code} - {self.name}'


class Expense(TimeStampedModel, SoftDeleteModel):
    """
    Expense model for tracking user expenses.
    """
    PAYMENT_METHODS = (
        ('cash', 'Cash'),
        ('credit_card', 'Credit Card'),
        ('debit_card', 'Debit Card'),
        ('bank_transfer', 'Bank Transfer'),
        ('digital_wallet', 'Digital Wallet'),
        ('other', 'Other'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='expenses'
    )
    category = models.ForeignKey(
        'categories.Category',
        on_delete=models.PROTECT,
        related_name='expenses'
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    currency = models.ForeignKey(
        Currency,
        on_delete=models.PROTECT,
        related_name='expenses'
    )
    description = models.TextField(blank=True, null=True)
    date = models.DateField()
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHODS,
        default='cash'
    )
    location = models.CharField(max_length=255, blank=True, null=True)
    tags = models.ManyToManyField(
        'categories.Tag',
        related_name='expenses',
        blank=True
    )
    notes = models.TextField(blank=True, null=True)
    is_recurring = models.BooleanField(default=False)

    class Meta:
        db_table = 'expenses'
        verbose_name = 'Expense'
        verbose_name_plural = 'Expenses'
        ordering = ['-date', '-created_at']
        indexes = [
            models.Index(fields=['user', 'date']),
            models.Index(fields=['category', 'date']),
        ]

    def __str__(self):
        return f'{self.user.email} - {self.amount} {self.currency.code} on {self.date}'

    @property
    def amount_in_usd(self):
        """Convert amount to USD."""
        return self.amount * self.currency.exchange_rate_to_usd


class Income(TimeStampedModel, SoftDeleteModel):
    """
    Income model for tracking user income.
    """
    INCOME_TYPES = (
        ('salary', 'Salary'),
        ('freelance', 'Freelance'),
        ('business', 'Business'),
        ('investment', 'Investment'),
        ('gift', 'Gift'),
        ('other', 'Other'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='incomes'
    )
    category = models.ForeignKey(
        'categories.Category',
        on_delete=models.PROTECT,
        related_name='incomes',
        null=True,
        blank=True
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    currency = models.ForeignKey(
        Currency,
        on_delete=models.PROTECT,
        related_name='incomes'
    )
    description = models.TextField(blank=True, null=True)
    date = models.DateField()
    income_type = models.CharField(
        max_length=20,
        choices=INCOME_TYPES,
        default='other'
    )
    source = models.CharField(max_length=255, blank=True, null=True)
    tags = models.ManyToManyField(
        'categories.Tag',
        related_name='incomes',
        blank=True
    )
    notes = models.TextField(blank=True, null=True)
    is_recurring = models.BooleanField(default=False)

    class Meta:
        db_table = 'incomes'
        verbose_name = 'Income'
        verbose_name_plural = 'Incomes'
        ordering = ['-date', '-created_at']
        indexes = [
            models.Index(fields=['user', 'date']),
        ]

    def __str__(self):
        return f'{self.user.email} - {self.amount} {self.currency.code} on {self.date}'

    @property
    def amount_in_usd(self):
        """Convert amount to USD."""
        return self.amount * self.currency.exchange_rate_to_usd


class Receipt(TimeStampedModel, SoftDeleteModel):
    """
    Receipt model for storing expense receipts.
    """
    expense = models.ForeignKey(
        Expense,
        on_delete=models.CASCADE,
        related_name='receipts'
    )
    image = models.ImageField(upload_to=get_file_path)
    file_name = models.CharField(max_length=255)
    file_size = models.IntegerField(help_text='File size in bytes')
    notes = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'receipts'
        verbose_name = 'Receipt'
        verbose_name_plural = 'Receipts'
        ordering = ['-created_at']

    def __str__(self):
        return f'Receipt for {self.expense}'


class RecurringTransaction(TimeStampedModel, SoftDeleteModel):
    """
    Model for recurring expenses and income.
    """
    TRANSACTION_TYPES = (
        ('expense', 'Expense'),
        ('income', 'Income'),
    )

    FREQUENCY_CHOICES = (
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('biweekly', 'Bi-weekly'),
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('yearly', 'Yearly'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='recurring_transactions'
    )
    transaction_type = models.CharField(
        max_length=10,
        choices=TRANSACTION_TYPES
    )
    category = models.ForeignKey(
        'categories.Category',
        on_delete=models.PROTECT,
        related_name='recurring_transactions'
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    currency = models.ForeignKey(
        Currency,
        on_delete=models.PROTECT,
        related_name='recurring_transactions'
    )
    description = models.TextField()
    frequency = models.CharField(
        max_length=20,
        choices=FREQUENCY_CHOICES
    )
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    next_due_date = models.DateField()
    is_active = models.BooleanField(default=True)
    last_generated_date = models.DateField(null=True, blank=True)

    class Meta:
        db_table = 'recurring_transactions'
        verbose_name = 'Recurring Transaction'
        verbose_name_plural = 'Recurring Transactions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'next_due_date']),
            models.Index(fields=['is_active', 'next_due_date']),
        ]

    def __str__(self):
        return f'{self.transaction_type} - {self.description} ({self.frequency})'


class SharedExpense(TimeStampedModel, SoftDeleteModel):
    """
    Model for expenses shared between multiple users (split bills).
    """
    expense = models.ForeignKey(
        Expense,
        on_delete=models.CASCADE,
        related_name='shares'
    )
    shared_with = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='shared_expenses_received'
    )
    share_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    is_settled = models.BooleanField(default=False)
    settled_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'shared_expenses'
        verbose_name = 'Shared Expense'
        verbose_name_plural = 'Shared Expenses'
        ordering = ['-created_at']
        unique_together = ['expense', 'shared_with']

    def __str__(self):
        return f'{self.expense} shared with {self.shared_with.email}'
