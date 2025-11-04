"""
Email template generators for MoneyGuard notifications.
"""
from datetime import datetime, timedelta
from django.utils import timezone
from django.db.models import Sum
from decimal import Decimal


def generate_daily_summary_email(user):
    """
    Generate daily transaction summary email content.

    Args:
        user: User object

    Returns:
        tuple: (subject, plain_text_message, html_message)
    """
    from finance.models import Transaction

    # Get today's date
    today = timezone.now().date()

    # Get today's transactions
    transactions = Transaction.objects.filter(
        user=user,
        date=today
    ).select_related('account', 'category').order_by('-created_at')

    # Calculate totals
    income_total = transactions.filter(
        transaction_type='income'
    ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

    expense_total = transactions.filter(
        transaction_type='expense'
    ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

    net_total = income_total - expense_total

    # Build email subject
    subject = f"MoneyGuard Daily Summary - {today.strftime('%B %d, %Y')}"

    # Build plain text message
    message = f"""
Hello {user.full_name},

Here's your daily transaction summary for {today.strftime('%B %d, %Y')}:

SUMMARY
-------
Income:   ${income_total:.2f}
Expenses: ${expense_total:.2f}
Net:      ${net_total:.2f}

TRANSACTIONS ({transactions.count()})
-------------
"""

    if transactions.exists():
        for txn in transactions:
            txn_type_symbol = "+" if txn.transaction_type == 'income' else "-"
            message += f"\n{txn_type_symbol}${txn.amount:.2f} - {txn.category.name if txn.category else 'Uncategorized'}"
            if txn.notes:
                message += f" ({txn.notes})"
    else:
        message += "\nNo transactions recorded today."

    message += """

---
Best regards,
MoneyGuard Team

To manage your notification preferences, visit your account settings.
"""

    # Build HTML message
    html_message = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }}
        .header {{
            background-color: #4F46E5;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }}
        .content {{
            background-color: #f9f9f9;
            padding: 20px;
            border: 1px solid #ddd;
        }}
        .summary {{
            background-color: white;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
        }}
        .summary-row {{
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }}
        .net-positive {{
            color: #10B981;
            font-weight: bold;
        }}
        .net-negative {{
            color: #EF4444;
            font-weight: bold;
        }}
        .transaction {{
            background-color: white;
            padding: 12px;
            margin: 8px 0;
            border-left: 3px solid #4F46E5;
            border-radius: 3px;
        }}
        .income {{
            border-left-color: #10B981;
        }}
        .expense {{
            border-left-color: #EF4444;
        }}
        .footer {{
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 12px;
        }}
    </style>
</head>
<body>
    <div class="header">
        <h2>MoneyGuard Daily Summary</h2>
        <p>{today.strftime('%B %d, %Y')}</p>
    </div>

    <div class="content">
        <p>Hello {user.full_name},</p>

        <div class="summary">
            <h3>Today's Summary</h3>
            <div class="summary-row">
                <span>Income:</span>
                <span style="color: #10B981;">${income_total:.2f}</span>
            </div>
            <div class="summary-row">
                <span>Expenses:</span>
                <span style="color: #EF4444;">${expense_total:.2f}</span>
            </div>
            <div class="summary-row" style="border-bottom: none; font-weight: bold;">
                <span>Net:</span>
                <span class="{'net-positive' if net_total >= 0 else 'net-negative'}">${net_total:.2f}</span>
            </div>
        </div>

        <h3>Transactions ({transactions.count()})</h3>
"""

    if transactions.exists():
        for txn in transactions:
            txn_class = "income" if txn.transaction_type == 'income' else "expense"
            txn_symbol = "+" if txn.transaction_type == 'income' else "-"
            html_message += f"""
        <div class="transaction {txn_class}">
            <strong>{txn_symbol}${txn.amount:.2f}</strong> - {txn.category.name if txn.category else 'Uncategorized'}
            <br>
            <small>{txn.account.name}</small>
            {f'<br><em>{txn.notes}</em>' if txn.notes else ''}
        </div>
"""
    else:
        html_message += "<p>No transactions recorded today.</p>"

    html_message += """
    </div>

    <div class="footer">
        <p>Best regards,<br>MoneyGuard Team</p>
        <p>To manage your notification preferences, visit your account settings.</p>
    </div>
</body>
</html>
"""

    return subject, message, html_message


def generate_weekly_summary_email(user):
    """
    Generate weekly summary email with insights.

    Args:
        user: User object

    Returns:
        tuple: (subject, plain_text_message, html_message)
    """
    from finance.models import Transaction, Budget

    # Get date range (last 7 days)
    today = timezone.now().date()
    week_ago = today - timedelta(days=7)

    # Get week's transactions
    transactions = Transaction.objects.filter(
        user=user,
        date__gte=week_ago,
        date__lte=today
    ).select_related('account', 'category')

    # Calculate totals
    income_total = transactions.filter(
        transaction_type='income'
    ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

    expense_total = transactions.filter(
        transaction_type='expense'
    ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

    net_total = income_total - expense_total

    # Get top spending categories
    top_categories = transactions.filter(
        transaction_type='expense',
        category__isnull=False
    ).values('category__name').annotate(
        total=Sum('amount')
    ).order_by('-total')[:5]

    # Check budget status
    budgets = Budget.objects.filter(
        user=user,
        is_active=True
    ).select_related('category')

    budget_warnings = []
    for budget in budgets:
        percentage_used = budget.get_percentage_used()
        if percentage_used >= budget.alert_threshold:
            budget_warnings.append({
                'category': budget.category.name,
                'percentage': percentage_used,
                'spent': budget.get_spent_amount(),
                'limit': budget.amount
            })

    # Build email subject
    subject = f"MoneyGuard Weekly Summary - Week of {week_ago.strftime('%b %d')}"

    # Build plain text message
    message = f"""
Hello {user.full_name},

Here's your weekly summary for {week_ago.strftime('%B %d')} - {today.strftime('%B %d, %Y')}:

SUMMARY
-------
Income:   ${income_total:.2f}
Expenses: ${expense_total:.2f}
Net:      ${net_total:.2f}

Total Transactions: {transactions.count()}

TOP SPENDING CATEGORIES
-----------------------
"""

    if top_categories:
        for cat in top_categories:
            message += f"\n{cat['category__name']}: ${cat['total']:.2f}"
    else:
        message += "\nNo expenses this week."

    if budget_warnings:
        message += "\n\nBUDGET ALERTS\n-------------"
        for warning in budget_warnings:
            message += f"\n⚠ {warning['category']}: {warning['percentage']:.0f}% used (${warning['spent']:.2f} / ${warning['limit']:.2f})"

    message += """

---
Best regards,
MoneyGuard Team

To manage your notification preferences, visit your account settings.
"""

    # Build HTML message
    html_message = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }}
        .header {{
            background-color: #4F46E5;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }}
        .content {{
            background-color: #f9f9f9;
            padding: 20px;
            border: 1px solid #ddd;
        }}
        .summary {{
            background-color: white;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
        }}
        .summary-row {{
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }}
        .category-item {{
            background-color: white;
            padding: 10px;
            margin: 5px 0;
            border-radius: 3px;
            display: flex;
            justify-content: space-between;
        }}
        .alert {{
            background-color: #FEF2F2;
            border-left: 3px solid #EF4444;
            padding: 12px;
            margin: 8px 0;
            border-radius: 3px;
        }}
        .footer {{
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 12px;
        }}
    </style>
</head>
<body>
    <div class="header">
        <h2>MoneyGuard Weekly Summary</h2>
        <p>{week_ago.strftime('%B %d')} - {today.strftime('%B %d, %Y')}</p>
    </div>

    <div class="content">
        <p>Hello {user.full_name},</p>

        <div class="summary">
            <h3>This Week's Summary</h3>
            <div class="summary-row">
                <span>Income:</span>
                <span style="color: #10B981;">${income_total:.2f}</span>
            </div>
            <div class="summary-row">
                <span>Expenses:</span>
                <span style="color: #EF4444;">${expense_total:.2f}</span>
            </div>
            <div class="summary-row" style="border-bottom: none; font-weight: bold;">
                <span>Net:</span>
                <span style="color: {'#10B981' if net_total >= 0 else '#EF4444'};">${net_total:.2f}</span>
            </div>
        </div>

        <p><strong>Total Transactions:</strong> {transactions.count()}</p>

        <h3>Top Spending Categories</h3>
"""

    if top_categories:
        for cat in top_categories:
            html_message += f"""
        <div class="category-item">
            <span>{cat['category__name']}</span>
            <strong>${cat['total']:.2f}</strong>
        </div>
"""
    else:
        html_message += "<p>No expenses this week.</p>"

    if budget_warnings:
        html_message += "<h3>Budget Alerts</h3>"
        for warning in budget_warnings:
            html_message += f"""
        <div class="alert">
            <strong>⚠ {warning['category']}</strong>
            <br>
            {warning['percentage']:.0f}% used (${warning['spent']:.2f} of ${warning['limit']:.2f})
        </div>
"""

    html_message += """
    </div>

    <div class="footer">
        <p>Best regards,<br>MoneyGuard Team</p>
        <p>To manage your notification preferences, visit your account settings.</p>
    </div>
</body>
</html>
"""

    return subject, message, html_message


def generate_budget_alert_email(user, budget):
    """
    Generate budget threshold alert email.

    Args:
        user: User object
        budget: Budget object

    Returns:
        tuple: (subject, plain_text_message, html_message)
    """
    spent_amount = budget.get_spent_amount()
    percentage_used = budget.get_percentage_used()
    remaining = budget.amount - spent_amount

    # Build email subject
    subject = f"Budget Alert: {budget.category.name} at {percentage_used:.0f}%"

    # Build plain text message
    message = f"""
Hello {user.full_name},

You've reached {percentage_used:.0f}% of your {budget.category.name} budget!

BUDGET DETAILS
--------------
Category: {budget.category.name}
Period: {budget.period.capitalize()}
Budget Limit: ${budget.amount:.2f}
Spent: ${spent_amount:.2f}
Remaining: ${remaining:.2f}

Alert Threshold: {budget.alert_threshold}%

Consider reviewing your spending in this category to stay within your budget.

---
Best regards,
MoneyGuard Team

To adjust your budget or notification settings, visit your account settings.
"""

    # Build HTML message
    html_message = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }}
        .header {{
            background-color: #EF4444;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }}
        .content {{
            background-color: #f9f9f9;
            padding: 20px;
            border: 1px solid #ddd;
        }}
        .alert-box {{
            background-color: #FEF2F2;
            border: 2px solid #EF4444;
            padding: 20px;
            border-radius: 5px;
            margin: 15px 0;
            text-align: center;
        }}
        .progress-bar {{
            width: 100%;
            height: 30px;
            background-color: #E5E7EB;
            border-radius: 15px;
            overflow: hidden;
            margin: 15px 0;
        }}
        .progress-fill {{
            height: 100%;
            background-color: {'#EF4444' if percentage_used >= 100 else '#F59E0B' if percentage_used >= budget.alert_threshold else '#10B981'};
            transition: width 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
        }}
        .detail-row {{
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #ddd;
        }}
        .footer {{
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 12px;
        }}
    </style>
</head>
<body>
    <div class="header">
        <h2>⚠ Budget Alert</h2>
        <p>{budget.category.name}</p>
    </div>

    <div class="content">
        <p>Hello {user.full_name},</p>

        <div class="alert-box">
            <h3 style="margin: 0; color: #EF4444;">You've reached {percentage_used:.0f}% of your budget!</h3>
        </div>

        <div class="progress-bar">
            <div class="progress-fill" style="width: {min(percentage_used, 100):.0f}%;">
                {percentage_used:.0f}%
            </div>
        </div>

        <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3>Budget Details</h3>
            <div class="detail-row">
                <span>Category:</span>
                <strong>{budget.category.name}</strong>
            </div>
            <div class="detail-row">
                <span>Period:</span>
                <strong>{budget.period.capitalize()}</strong>
            </div>
            <div class="detail-row">
                <span>Budget Limit:</span>
                <strong>${budget.amount:.2f}</strong>
            </div>
            <div class="detail-row">
                <span>Spent:</span>
                <strong style="color: #EF4444;">${spent_amount:.2f}</strong>
            </div>
            <div class="detail-row" style="border-bottom: none;">
                <span>Remaining:</span>
                <strong style="color: {'#EF4444' if remaining < 0 else '#10B981'};">${remaining:.2f}</strong>
            </div>
        </div>

        <p style="background-color: #FEF9C3; padding: 12px; border-radius: 5px; border-left: 3px solid #F59E0B;">
            💡 <strong>Tip:</strong> Consider reviewing your spending in this category to stay within your budget.
        </p>
    </div>

    <div class="footer">
        <p>Best regards,<br>MoneyGuard Team</p>
        <p>To adjust your budget or notification settings, visit your account settings.</p>
    </div>
</body>
</html>
"""

    return subject, message, html_message
