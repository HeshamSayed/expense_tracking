"""
Celery tasks for MoneyGuard notifications.
Handles sending email summaries and alerts.
"""
from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from .models import NotificationPreference
from .email_templates import (
    generate_daily_summary_email,
    generate_weekly_summary_email,
    generate_budget_alert_email
)

User = get_user_model()


@shared_task(name='notifications.tasks.send_daily_summaries')
def send_daily_summaries():
    """
    Send daily transaction summary emails to all opted-in users.
    Runs daily at 8 AM (configured in celery beat schedule).
    """
    # Get all users with daily summary enabled
    preferences = NotificationPreference.objects.filter(
        daily_summary=True
    ).select_related('user')

    sent_count = 0
    failed_count = 0

    for preference in preferences:
        user = preference.user

        try:
            # Generate email content
            subject, message, html_message = generate_daily_summary_email(user)

            # Send email
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=html_message,
                fail_silently=False
            )
            sent_count += 1

        except Exception as e:
            failed_count += 1
            print(f"Failed to send daily summary to {user.email}: {str(e)}")

    return f"Daily summaries sent: {sent_count}, failed: {failed_count}"


@shared_task(name='notifications.tasks.send_weekly_summaries')
def send_weekly_summaries():
    """
    Send weekly summary emails with insights to all opted-in users.
    Runs weekly on Monday at 8 AM (configured in celery beat schedule).
    """
    # Get all users with weekly summary enabled
    preferences = NotificationPreference.objects.filter(
        weekly_summary=True
    ).select_related('user')

    sent_count = 0
    failed_count = 0

    for preference in preferences:
        user = preference.user

        try:
            # Generate email content
            subject, message, html_message = generate_weekly_summary_email(user)

            # Send email
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=html_message,
                fail_silently=False
            )
            sent_count += 1

        except Exception as e:
            failed_count += 1
            print(f"Failed to send weekly summary to {user.email}: {str(e)}")

    return f"Weekly summaries sent: {sent_count}, failed: {failed_count}"


@shared_task(name='notifications.tasks.send_budget_alert')
def send_budget_alert(user_id, budget_id):
    """
    Send budget threshold alert to a specific user.

    Args:
        user_id: ID of the user to send alert to
        budget_id: ID of the budget that triggered the alert
    """
    from finance.models import Budget

    try:
        user = User.objects.get(id=user_id)
        budget = Budget.objects.get(id=budget_id)

        # Check if user has budget alerts enabled
        try:
            preference = NotificationPreference.objects.get(user=user)
            if not preference.budget_alerts:
                return f"Budget alerts disabled for user {user.email}"
        except NotificationPreference.DoesNotExist:
            # If no preference exists, don't send alert
            return f"No notification preferences found for user {user.email}"

        # Generate email content
        subject, message, html_message = generate_budget_alert_email(user, budget)

        # Send email
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False
        )

        return f"Budget alert sent to {user.email} for budget {budget.id}"

    except User.DoesNotExist:
        return f"User {user_id} not found"
    except Budget.DoesNotExist:
        return f"Budget {budget_id} not found"
    except Exception as e:
        return f"Failed to send budget alert: {str(e)}"
