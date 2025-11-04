"""
Celery tasks for finance app.
Handles background processing for recurring transactions and budget alerts.
"""
from celery import shared_task
from django.utils import timezone
from django.db import transaction
from django.core.mail import send_mail
from django.conf import settings
from datetime import timedelta
from decimal import Decimal
import logging

from .models import RecurringTransaction, Transaction, Budget, Account

logger = logging.getLogger(__name__)


@shared_task(
    name='finance.process_recurring_transactions',
    bind=True,
    max_retries=3,
    default_retry_delay=300  # 5 minutes
)
def process_recurring_transactions(self):
    """
    Process recurring transactions that are due.

    Checks for active recurring transactions where next_run is today or earlier,
    creates corresponding transactions, and updates next_run date.

    Returns:
        dict: Summary of processed transactions
    """
    today = timezone.now().date()
    processed_count = 0
    error_count = 0
    errors = []

    try:
        # Get all active recurring transactions that are due
        due_recurring = RecurringTransaction.objects.filter(
            is_active=True,
            next_run__lte=today
        ).select_related('user', 'account', 'category')

        logger.info(f"Found {due_recurring.count()} recurring transactions to process")

        for recurring in due_recurring:
            try:
                with transaction.atomic():
                    # Lock the recurring transaction to prevent race conditions
                    recurring_locked = RecurringTransaction.objects.select_for_update().get(
                        pk=recurring.pk
                    )

                    # Verify account still exists and belongs to user
                    try:
                        account = Account.objects.select_for_update().get(
                            pk=recurring_locked.account_id,
                            user=recurring_locked.user
                        )
                    except Account.DoesNotExist:
                        logger.error(
                            f"Account {recurring_locked.account_id} not found for "
                            f"recurring transaction {recurring_locked.id}. Deactivating."
                        )
                        recurring_locked.is_active = False
                        recurring_locked.save(update_fields=['is_active', 'updated_at'])
                        error_count += 1
                        continue

                    # Check if account has sufficient balance for expenses
                    if (recurring_locked.transaction_type == 'expense' and
                        account.balance < recurring_locked.amount):
                        logger.warning(
                            f"Insufficient balance in account {account.id} for "
                            f"recurring transaction {recurring_locked.id}. Skipping."
                        )
                        # Update next_run anyway to avoid repeated attempts
                        recurring_locked.next_run = calculate_next_run_date(
                            recurring_locked.next_run,
                            recurring_locked.frequency
                        )
                        recurring_locked.save(update_fields=['next_run', 'updated_at'])
                        error_count += 1
                        continue

                    # Create the transaction
                    new_transaction = Transaction.objects.create(
                        user=recurring_locked.user,
                        account=recurring_locked.account,
                        category=recurring_locked.category,
                        recurring_transaction=recurring_locked,
                        amount=recurring_locked.amount,
                        currency=recurring_locked.currency,
                        transaction_type=recurring_locked.transaction_type,
                        date=today,
                        notes=f"Auto-generated from recurring transaction: {recurring_locked.description}",
                    )

                    # Update next_run date
                    recurring_locked.next_run = calculate_next_run_date(
                        recurring_locked.next_run,
                        recurring_locked.frequency
                    )
                    recurring_locked.save(update_fields=['next_run', 'updated_at'])

                    processed_count += 1
                    logger.info(
                        f"Created transaction {new_transaction.id} from "
                        f"recurring transaction {recurring_locked.id}"
                    )

            except Exception as e:
                error_count += 1
                error_msg = f"Error processing recurring transaction {recurring.id}: {str(e)}"
                errors.append(error_msg)
                logger.error(error_msg, exc_info=True)
                # Continue processing other transactions

        result = {
            'status': 'completed',
            'processed_count': processed_count,
            'error_count': error_count,
            'errors': errors,
            'timestamp': timezone.now().isoformat()
        }

        logger.info(
            f"Recurring transaction processing completed. "
            f"Processed: {processed_count}, Errors: {error_count}"
        )

        return result

    except Exception as e:
        logger.error(f"Fatal error in process_recurring_transactions: {str(e)}", exc_info=True)
        # Retry the task
        raise self.retry(exc=e)


@shared_task(
    name='finance.calculate_budget_alerts',
    bind=True,
    max_retries=3,
    default_retry_delay=300  # 5 minutes
)
def calculate_budget_alerts(self):
    """
    Check budgets and send alerts if spending threshold is exceeded.

    Checks all active budgets and sends email alerts to users when
    spending reaches or exceeds the configured alert threshold.

    Returns:
        dict: Summary of alerts sent
    """
    alert_count = 0
    error_count = 0
    errors = []

    try:
        # Get all active budgets
        active_budgets = Budget.objects.filter(
            is_active=True
        ).select_related('user', 'category')

        logger.info(f"Checking {active_budgets.count()} active budgets for alerts")

        for budget in active_budgets:
            try:
                # Calculate spending percentage
                percentage_used = budget.get_percentage_used()
                spent_amount = budget.get_spent_amount()

                # Check if threshold is exceeded
                if percentage_used >= budget.alert_threshold:
                    logger.info(
                        f"Budget alert triggered for budget {budget.id}: "
                        f"{percentage_used:.2f}% used (threshold: {budget.alert_threshold}%)"
                    )

                    # Send email alert
                    sent = send_budget_alert_email(
                        budget=budget,
                        spent_amount=spent_amount,
                        percentage_used=percentage_used
                    )

                    if sent:
                        alert_count += 1
                    else:
                        error_count += 1
                        errors.append(f"Failed to send email for budget {budget.id}")

            except Exception as e:
                error_count += 1
                error_msg = f"Error checking budget {budget.id}: {str(e)}"
                errors.append(error_msg)
                logger.error(error_msg, exc_info=True)
                # Continue checking other budgets

        result = {
            'status': 'completed',
            'alert_count': alert_count,
            'error_count': error_count,
            'errors': errors,
            'timestamp': timezone.now().isoformat()
        }

        logger.info(
            f"Budget alert processing completed. "
            f"Alerts sent: {alert_count}, Errors: {error_count}"
        )

        return result

    except Exception as e:
        logger.error(f"Fatal error in calculate_budget_alerts: {str(e)}", exc_info=True)
        # Retry the task
        raise self.retry(exc=e)


def calculate_next_run_date(current_date, frequency):
    """
    Calculate the next run date based on frequency.

    Args:
        current_date: Current next_run date
        frequency: Frequency type (daily, weekly, biweekly, monthly, quarterly, yearly)

    Returns:
        date: Next run date
    """
    if frequency == 'daily':
        return current_date + timedelta(days=1)
    elif frequency == 'weekly':
        return current_date + timedelta(weeks=1)
    elif frequency == 'biweekly':
        return current_date + timedelta(weeks=2)
    elif frequency == 'monthly':
        # Add one month (approximate - handle edge cases)
        next_month = current_date.month + 1
        next_year = current_date.year
        if next_month > 12:
            next_month = 1
            next_year += 1
        try:
            return current_date.replace(year=next_year, month=next_month)
        except ValueError:
            # Handle edge case: e.g., Jan 31 -> Feb 28/29
            # Set to last day of next month
            if next_month == 2:
                # February - check for leap year
                if next_year % 4 == 0 and (next_year % 100 != 0 or next_year % 400 == 0):
                    return current_date.replace(year=next_year, month=2, day=29)
                else:
                    return current_date.replace(year=next_year, month=2, day=28)
            elif next_month in [4, 6, 9, 11]:
                return current_date.replace(year=next_year, month=next_month, day=30)
            else:
                return current_date.replace(year=next_year, month=next_month, day=31)
    elif frequency == 'quarterly':
        # Add 3 months
        next_month = current_date.month + 3
        next_year = current_date.year
        while next_month > 12:
            next_month -= 12
            next_year += 1
        try:
            return current_date.replace(year=next_year, month=next_month)
        except ValueError:
            # Handle edge case
            last_days = {1: 31, 2: 28, 3: 31, 4: 30, 5: 31, 6: 30,
                        7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31}
            if next_month == 2 and next_year % 4 == 0 and (next_year % 100 != 0 or next_year % 400 == 0):
                last_day = 29
            else:
                last_day = last_days[next_month]
            return current_date.replace(year=next_year, month=next_month, day=last_day)
    elif frequency == 'yearly':
        next_year = current_date.year + 1
        try:
            return current_date.replace(year=next_year)
        except ValueError:
            # Handle Feb 29 in non-leap year
            return current_date.replace(year=next_year, day=28)
    else:
        logger.error(f"Unknown frequency: {frequency}")
        return current_date + timedelta(days=1)


def send_budget_alert_email(budget, spent_amount, percentage_used):
    """
    Send budget alert email to user.

    Args:
        budget: Budget instance
        spent_amount: Decimal amount spent
        percentage_used: Float percentage of budget used

    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        user = budget.user
        user_email = getattr(user, 'email', None)

        if not user_email:
            logger.warning(f"User {user.id} has no email address. Cannot send budget alert.")
            return False

        subject = f"Budget Alert: {budget.category.name} budget at {percentage_used:.1f}%"

        message = f"""
Hello {getattr(user, 'first_name', 'User')},

This is an automated alert from MoneyGuard regarding your budget for {budget.category.name}.

Budget Details:
- Category: {budget.category.name}
- Period: {budget.get_period_display()}
- Budget Amount: {budget.amount}
- Spent Amount: {spent_amount}
- Percentage Used: {percentage_used:.2f}%
- Alert Threshold: {budget.alert_threshold}%

You have reached or exceeded your alert threshold for this budget. Consider reviewing your spending in this category.

Best regards,
MoneyGuard Team
        """

        html_message = f"""
<html>
<body>
    <h2>Budget Alert</h2>
    <p>Hello {getattr(user, 'first_name', 'User')},</p>
    <p>This is an automated alert from MoneyGuard regarding your budget for <strong>{budget.category.name}</strong>.</p>

    <h3>Budget Details:</h3>
    <ul>
        <li><strong>Category:</strong> {budget.category.name}</li>
        <li><strong>Period:</strong> {budget.get_period_display()}</li>
        <li><strong>Budget Amount:</strong> {budget.amount}</li>
        <li><strong>Spent Amount:</strong> {spent_amount}</li>
        <li><strong>Percentage Used:</strong> {percentage_used:.2f}%</li>
        <li><strong>Alert Threshold:</strong> {budget.alert_threshold}%</li>
    </ul>

    <p style="color: red; font-weight: bold;">
        You have reached or exceeded your alert threshold for this budget.
        Consider reviewing your spending in this category.
    </p>

    <p>Best regards,<br>MoneyGuard Team</p>
</body>
</html>
        """

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user_email],
            html_message=html_message,
            fail_silently=False,
        )

        logger.info(f"Budget alert email sent to {user_email} for budget {budget.id}")
        return True

    except Exception as e:
        logger.error(f"Error sending budget alert email: {str(e)}", exc_info=True)
        return False


@shared_task(name='finance.cleanup_old_transactions')
def cleanup_old_transactions(days=365):
    """
    Archive or cleanup old transactions (optional maintenance task).

    Args:
        days: Number of days to keep transactions (default: 365)

    Returns:
        dict: Summary of cleanup operation
    """
    try:
        cutoff_date = timezone.now().date() - timedelta(days=days)

        # Get count of old transactions
        old_transactions = Transaction.objects.filter(
            date__lt=cutoff_date,
            imported=True  # Only cleanup imported transactions
        )

        count = old_transactions.count()

        logger.info(f"Found {count} old imported transactions before {cutoff_date}")

        # For now, we'll just log and not delete
        # In production, you might want to archive these to a separate table
        # or mark them as archived rather than deleting

        return {
            'status': 'completed',
            'old_transaction_count': count,
            'cutoff_date': cutoff_date.isoformat(),
            'timestamp': timezone.now().isoformat()
        }

    except Exception as e:
        logger.error(f"Error in cleanup_old_transactions: {str(e)}", exc_info=True)
        return {
            'status': 'error',
            'error': str(e),
            'timestamp': timezone.now().isoformat()
        }
