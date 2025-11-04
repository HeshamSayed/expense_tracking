"""
Utility functions and helpers.
"""
import os
import uuid
from decimal import Decimal
from datetime import datetime, timedelta
from typing import Dict, Any


def get_file_path(instance, filename):
    """
    Generate a unique file path for uploaded files.
    """
    ext = filename.split('.')[-1]
    filename = f'{uuid.uuid4()}.{ext}'
    return os.path.join('uploads', filename)


def calculate_percentage(part: Decimal, whole: Decimal) -> float:
    """
    Calculate percentage safely.
    """
    if whole == 0:
        return 0.0
    return float((part / whole) * 100)


def get_date_range(period: str) -> tuple:
    """
    Get date range based on period string.
    Returns (start_date, end_date) tuple.
    """
    today = datetime.now().date()

    if period == 'today':
        start_date = today
        end_date = today
    elif period == 'week':
        start_date = today - timedelta(days=today.weekday())
        end_date = start_date + timedelta(days=6)
    elif period == 'month':
        start_date = today.replace(day=1)
        next_month = today.replace(day=28) + timedelta(days=4)
        end_date = next_month - timedelta(days=next_month.day)
    elif period == 'year':
        start_date = today.replace(month=1, day=1)
        end_date = today.replace(month=12, day=31)
    else:
        # Default to current month
        start_date = today.replace(day=1)
        next_month = today.replace(day=28) + timedelta(days=4)
        end_date = next_month - timedelta(days=next_month.day)

    return start_date, end_date


def format_currency(amount: Decimal, currency_code: str = 'USD') -> str:
    """
    Format currency amount with symbol.
    """
    symbols = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'JPY': '¥',
        'INR': '₹',
        'CAD': 'C$',
        'AUD': 'A$',
    }
    symbol = symbols.get(currency_code, currency_code)
    return f'{symbol}{amount:,.2f}'
