"""
Budget models.
Domain layer - budget management entities.
"""
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from decimal import Decimal
from core.models import TimeStampedModel, SoftDeleteModel


class Budget(TimeStampedModel, SoftDeleteModel):
    """
    Budget model for tracking spending limits.
    """
    PERIOD_CHOICES = (
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('yearly', 'Yearly'),
        ('custom', 'Custom'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='budgets'
    )
    name = models.CharField(max_length=200)
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    currency = models.ForeignKey(
        'expenses.Currency',
        on_delete=models.PROTECT,
        related_name='budgets'
    )
    period = models.CharField(
        max_length=20,
        choices=PERIOD_CHOICES,
        default='monthly'
    )
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)

    # Category specific budget (null means overall budget)
    category = models.ForeignKey(
        'categories.Category',
        on_delete=models.CASCADE,
        related_name='budgets',
        null=True,
        blank=True,
        help_text='Leave blank for overall budget'
    )

    # Alert settings
    alert_threshold = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=80.00,
        help_text='Percentage threshold for alerts (e.g., 80 for 80%)',
        validators=[MinValueValidator(Decimal('1.00'))]
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'budgets'
        verbose_name = 'Budget'
        verbose_name_plural = 'Budgets'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'start_date', 'end_date']),
            models.Index(fields=['user', 'is_active']),
        ]

    def __str__(self):
        return f'{self.name} - {self.amount} {self.currency.code} ({self.period})'

    @property
    def spent_amount(self):
        """Calculate total spent for this budget."""
        from apps.expenses.models import Expense
        from django.db.models import Sum, Q

        query = Q(
            user=self.user,
            date__gte=self.start_date,
            is_deleted=False
        )

        if self.end_date:
            query &= Q(date__lte=self.end_date)

        if self.category:
            query &= Q(category=self.category)

        spent = Expense.objects.filter(query).aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')

        return spent

    @property
    def remaining_amount(self):
        """Calculate remaining budget amount."""
        return self.amount - self.spent_amount

    @property
    def percentage_used(self):
        """Calculate percentage of budget used."""
        if self.amount == 0:
            return 0
        return float((self.spent_amount / self.amount) * 100)

    @property
    def is_exceeded(self):
        """Check if budget is exceeded."""
        return self.spent_amount > self.amount

    @property
    def is_alert_threshold_reached(self):
        """Check if alert threshold is reached."""
        return self.percentage_used >= float(self.alert_threshold)


class BudgetAlert(TimeStampedModel):
    """
    Model for tracking budget alerts sent to users.
    """
    ALERT_TYPES = (
        ('threshold', 'Threshold Reached'),
        ('exceeded', 'Budget Exceeded'),
        ('near_end', 'Period Near End'),
    )

    budget = models.ForeignKey(
        Budget,
        on_delete=models.CASCADE,
        related_name='alerts'
    )
    alert_type = models.CharField(
        max_length=20,
        choices=ALERT_TYPES
    )
    message = models.TextField()
    percentage_at_alert = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text='Budget percentage when alert was triggered'
    )
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'budget_alerts'
        verbose_name = 'Budget Alert'
        verbose_name_plural = 'Budget Alerts'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.alert_type} alert for {self.budget.name}'
