"""
Finance models for MoneyGuard.
Includes Account, Transaction, Category, Budget, and RecurringTransaction.
"""
from django.db import models, transaction as db_transaction
from django.conf import settings
from django.core.validators import MinValueValidator
from django.utils.translation import gettext_lazy as _
from decimal import Decimal


class Account(models.Model):
    """
    Account/Wallet model for organizing user's finances.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='accounts'
    )
    name = models.CharField(_('name'), max_length=100)
    currency = models.CharField(
        _('currency'),
        max_length=3,
        default='USD',
        help_text=_('ISO 4217 currency code')
    )
    balance = models.DecimalField(
        _('balance'),
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    is_archived = models.BooleanField(_('archived'), default=False)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        verbose_name = _('account')
        verbose_name_plural = _('accounts')
        db_table = 'accounts'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['user', 'is_archived']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'name'],
                name='unique_account_name_per_user'
            )
        ]

    def __str__(self):
        return f"{self.name} ({self.currency} {self.balance})"

    def update_balance(self, amount, operation='add'):
        """
        Update account balance atomically.

        Args:
            amount: Decimal amount to add or subtract
            operation: 'add' or 'subtract'
        """
        if operation == 'add':
            self.balance += amount
        elif operation == 'subtract':
            self.balance -= amount
        else:
            raise ValueError("Operation must be 'add' or 'subtract'")

        if self.balance < 0:
            self.balance = Decimal('0.00')

        self.save(update_fields=['balance', 'updated_at'])


class Category(models.Model):
    """
    Category for organizing transactions.
    Can be user-specific or global (system-defined).
    """
    CATEGORY_TYPE_CHOICES = [
        ('expense', _('Expense')),
        ('income', _('Income')),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='categories',
        null=True,
        blank=True,
        help_text=_('Null for global categories')
    )
    name = models.CharField(_('name'), max_length=100)
    type = models.CharField(
        _('type'),
        max_length=10,
        choices=CATEGORY_TYPE_CHOICES
    )
    icon = models.CharField(
        _('icon'),
        max_length=50,
        blank=True,
        help_text=_('Icon name/emoji for category')
    )
    color = models.CharField(
        _('color'),
        max_length=7,
        blank=True,
        help_text=_('Hex color code (e.g., #FF0000)')
    )
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)

    class Meta:
        verbose_name = _('category')
        verbose_name_plural = _('categories')
        db_table = 'categories'
        ordering = ['name']
        indexes = [
            models.Index(fields=['user', 'type']),
            models.Index(fields=['type']),
        ]

    def __str__(self):
        return f"{self.name} ({self.type})"


class RecurringTransaction(models.Model):
    """
    Template for recurring transactions.
    """
    FREQUENCY_CHOICES = [
        ('daily', _('Daily')),
        ('weekly', _('Weekly')),
        ('biweekly', _('Bi-weekly')),
        ('monthly', _('Monthly')),
        ('quarterly', _('Quarterly')),
        ('yearly', _('Yearly')),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='recurring_transactions'
    )
    account = models.ForeignKey(
        Account,
        on_delete=models.CASCADE,
        related_name='recurring_transactions'
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        related_name='recurring_transactions'
    )
    amount = models.DecimalField(
        _('amount'),
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    currency = models.CharField(_('currency'), max_length=3, default='USD')
    frequency = models.CharField(
        _('frequency'),
        max_length=20,
        choices=FREQUENCY_CHOICES
    )
    transaction_type = models.CharField(
        _('transaction type'),
        max_length=10,
        choices=[('expense', 'Expense'), ('income', 'Income')]
    )
    description = models.TextField(_('description'), blank=True)
    next_run = models.DateField(_('next run date'))
    is_active = models.BooleanField(_('active'), default=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        verbose_name = _('recurring transaction')
        verbose_name_plural = _('recurring transactions')
        db_table = 'recurring_transactions'
        ordering = ['next_run']
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['next_run', 'is_active']),
        ]

    def __str__(self):
        return f"{self.description} - {self.frequency}"


class Transaction(models.Model):
    """
    Transaction model for tracking expenses and income.
    """
    TRANSACTION_TYPE_CHOICES = [
        ('expense', _('Expense')),
        ('income', _('Income')),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='transactions'
    )
    account = models.ForeignKey(
        Account,
        on_delete=models.CASCADE,
        related_name='transactions'
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        related_name='transactions'
    )
    recurring_transaction = models.ForeignKey(
        RecurringTransaction,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='transactions',
        help_text=_('If this transaction was created from a recurring template')
    )
    amount = models.DecimalField(
        _('amount'),
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    currency = models.CharField(_('currency'), max_length=3, default='USD')
    transaction_type = models.CharField(
        _('transaction type'),
        max_length=10,
        choices=TRANSACTION_TYPE_CHOICES
    )
    date = models.DateField(_('transaction date'))
    notes = models.TextField(_('notes'), blank=True)
    attachment_url = models.URLField(
        _('attachment URL'),
        blank=True,
        help_text=_('URL to receipt/attachment')
    )
    imported = models.BooleanField(_('imported'), default=False)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        verbose_name = _('transaction')
        verbose_name_plural = _('transactions')
        db_table = 'transactions'
        ordering = ['-date', '-created_at']
        indexes = [
            models.Index(fields=['user', '-date']),
            models.Index(fields=['account', '-date']),
            models.Index(fields=['category', '-date']),
            models.Index(fields=['user', 'transaction_type', '-date']),
        ]

    def __str__(self):
        return f"{self.transaction_type} - {self.amount} {self.currency} on {self.date}"

    def save(self, *args, **kwargs):
        """
        Override save to update account balance atomically.
        """
        is_new = self.pk is None
        old_transaction = None

        if not is_new:
            # Get old transaction data for updates
            old_transaction = Transaction.objects.get(pk=self.pk)

        with db_transaction.atomic():
            # Lock the account row to prevent race conditions
            account = Account.objects.select_for_update().get(pk=self.account_id)

            if is_new:
                # New transaction - update balance
                if self.transaction_type == 'income':
                    account.update_balance(self.amount, 'add')
                else:  # expense
                    account.update_balance(self.amount, 'subtract')
            else:
                # Updating existing transaction - revert old and apply new
                if old_transaction:
                    # Revert old transaction
                    if old_transaction.transaction_type == 'income':
                        account.update_balance(old_transaction.amount, 'subtract')
                    else:
                        account.update_balance(old_transaction.amount, 'add')

                    # Apply new transaction
                    if self.transaction_type == 'income':
                        account.update_balance(self.amount, 'add')
                    else:
                        account.update_balance(self.amount, 'subtract')

            super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        """
        Override delete to update account balance.
        """
        with db_transaction.atomic():
            # Lock the account row
            account = Account.objects.select_for_update().get(pk=self.account_id)

            # Revert the transaction's effect on balance
            if self.transaction_type == 'income':
                account.update_balance(self.amount, 'subtract')
            else:
                account.update_balance(self.amount, 'add')

            super().delete(*args, **kwargs)


class Budget(models.Model):
    """
    Budget model for tracking spending limits by category.
    """
    PERIOD_CHOICES = [
        ('week', _('Weekly')),
        ('month', _('Monthly')),
        ('quarter', _('Quarterly')),
        ('year', _('Yearly')),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='budgets'
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='budgets'
    )
    amount = models.DecimalField(
        _('budget amount'),
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    period = models.CharField(
        _('period'),
        max_length=10,
        choices=PERIOD_CHOICES,
        default='month'
    )
    start_date = models.DateField(_('start date'))
    alert_threshold = models.IntegerField(
        _('alert threshold (%)'),
        default=80,
        validators=[MinValueValidator(1)],
        help_text=_('Send alert when spending reaches this % of budget')
    )
    is_active = models.BooleanField(_('active'), default=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        verbose_name = _('budget')
        verbose_name_plural = _('budgets')
        db_table = 'budgets'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['user', 'category']),
        ]

    def __str__(self):
        return f"{self.category.name} - {self.amount} ({self.period})"

    def get_spent_amount(self):
        """
        Calculate amount spent in current budget period.
        """
        from datetime import timedelta
        from django.utils import timezone

        # Calculate period end date
        today = timezone.now().date()
        if self.period == 'week':
            period_days = 7
        elif self.period == 'month':
            period_days = 30
        elif self.period == 'quarter':
            period_days = 90
        else:  # year
            period_days = 365

        # Get transactions in current period
        spent = Transaction.objects.filter(
            user=self.user,
            category=self.category,
            transaction_type='expense',
            date__gte=self.start_date,
            date__lte=today
        ).aggregate(total=models.Sum('amount'))['total'] or Decimal('0.00')

        return spent

    def get_percentage_used(self):
        """
        Calculate percentage of budget used.
        """
        spent = self.get_spent_amount()
        if self.amount == 0:
            return 0
        return (spent / self.amount) * 100
