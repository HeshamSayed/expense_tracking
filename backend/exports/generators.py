"""
Export generators for CSV and PDF formats.
"""
import csv
import io
import os
from datetime import datetime, date
from decimal import Decimal
from django.conf import settings
from django.utils import timezone
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.pdfgen import canvas
from finance.models import Transaction


def parse_date(date_string):
    """Parse date string to date object."""
    if not date_string or date_string == 'None':
        return None
    if isinstance(date_string, date):
        return date_string
    try:
        return datetime.strptime(date_string, '%Y-%m-%d').date()
    except (ValueError, TypeError):
        return None


def get_filtered_transactions(user, params):
    """
    Get filtered transactions based on export parameters.

    Args:
        user: User object
        params: Dictionary containing filter parameters

    Returns:
        QuerySet of Transaction objects
    """
    # Start with user's transactions
    transactions = Transaction.objects.filter(user=user).select_related(
        'account', 'category'
    )

    # Apply date filters
    start_date = parse_date(params.get('start_date'))
    end_date = parse_date(params.get('end_date'))

    if start_date:
        transactions = transactions.filter(date__gte=start_date)
    if end_date:
        transactions = transactions.filter(date__lte=end_date)

    # Apply account filter
    account_ids = params.get('account_ids', [])
    if account_ids:
        transactions = transactions.filter(account_id__in=account_ids)

    # Apply category filter
    category_ids = params.get('category_ids', [])
    if category_ids:
        transactions = transactions.filter(category_id__in=category_ids)

    # Apply transaction type filter
    transaction_type = params.get('transaction_type', 'all')
    if transaction_type != 'all':
        transactions = transactions.filter(transaction_type=transaction_type)

    # Order by date (newest first)
    transactions = transactions.order_by('-date', '-created_at')

    return transactions


def generate_csv_export(user, params):
    """
    Generate CSV export of user's transactions.

    Args:
        user: User object
        params: Dictionary containing export parameters

    Returns:
        tuple: (file_path, file_size) of generated CSV file
    """
    # Get filtered transactions
    transactions = get_filtered_transactions(user, params)

    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)

    # Write header
    writer.writerow([
        'Date',
        'Type',
        'Account',
        'Category',
        'Amount',
        'Currency',
        'Notes',
        'Created At'
    ])

    # Write transaction data
    for transaction in transactions:
        writer.writerow([
            transaction.date.strftime('%Y-%m-%d'),
            transaction.transaction_type.capitalize(),
            transaction.account.name if transaction.account else '',
            transaction.category.name if transaction.category else 'Uncategorized',
            str(transaction.amount),
            transaction.currency,
            transaction.notes or '',
            transaction.created_at.strftime('%Y-%m-%d %H:%M:%S')
        ])

    # Write summary statistics
    writer.writerow([])  # Empty row
    writer.writerow(['Summary'])
    writer.writerow(['Total Transactions', transactions.count()])

    # Calculate totals by type
    income_total = sum(
        t.amount for t in transactions if t.transaction_type == 'income'
    )
    expense_total = sum(
        t.amount for t in transactions if t.transaction_type == 'expense'
    )
    net_total = income_total - expense_total

    writer.writerow(['Total Income', str(income_total)])
    writer.writerow(['Total Expenses', str(expense_total)])
    writer.writerow(['Net Total', str(net_total)])

    # Save to file
    media_root = settings.MEDIA_ROOT
    exports_dir = os.path.join(media_root, 'exports')
    os.makedirs(exports_dir, exist_ok=True)

    # Generate unique filename
    timestamp = timezone.now().strftime('%Y%m%d_%H%M%S')
    filename = f'export_{user.id}_{timestamp}.csv'
    file_path = os.path.join(exports_dir, filename)

    # Write to file
    with open(file_path, 'w', newline='', encoding='utf-8') as f:
        f.write(output.getvalue())

    # Get file size
    file_size = os.path.getsize(file_path)

    # Return relative path for URL generation
    relative_path = os.path.join('exports', filename)

    return relative_path, file_size


def generate_pdf_export(user, params):
    """
    Generate PDF export of user's transactions.

    Args:
        user: User object
        params: Dictionary containing export parameters

    Returns:
        tuple: (file_path, file_size) of generated PDF file
    """
    # Get filtered transactions
    transactions = get_filtered_transactions(user, params)

    # Prepare file path
    media_root = settings.MEDIA_ROOT
    exports_dir = os.path.join(media_root, 'exports')
    os.makedirs(exports_dir, exist_ok=True)

    # Generate unique filename
    timestamp = timezone.now().strftime('%Y%m%d_%H%M%S')
    filename = f'export_{user.id}_{timestamp}.pdf'
    file_path = os.path.join(exports_dir, filename)

    # Create PDF document
    doc = SimpleDocTemplate(
        file_path,
        pagesize=letter,
        rightMargin=0.5*inch,
        leftMargin=0.5*inch,
        topMargin=0.75*inch,
        bottomMargin=0.75*inch,
    )

    # Container for PDF elements
    elements = []
    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#2C3E50'),
        spaceAfter=30,
        alignment=1,  # Center
    )

    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#34495E'),
        spaceAfter=12,
    )

    # Title
    title = Paragraph(f"MoneyGuard Transaction Export", title_style)
    elements.append(title)

    # User info and date range
    user_info = f"<b>User:</b> {user.email}<br/>"

    start_date = parse_date(params.get('start_date'))
    end_date = parse_date(params.get('end_date'))

    if start_date or end_date:
        date_range = f"<b>Period:</b> "
        if start_date:
            date_range += f"{start_date.strftime('%B %d, %Y')}"
        else:
            date_range += "Beginning"
        date_range += " to "
        if end_date:
            date_range += f"{end_date.strftime('%B %d, %Y')}"
        else:
            date_range += "Present"
        user_info += date_range + "<br/>"

    user_info += f"<b>Generated:</b> {timezone.now().strftime('%B %d, %Y at %I:%M %p')}"

    info_para = Paragraph(user_info, styles['Normal'])
    elements.append(info_para)
    elements.append(Spacer(1, 0.3*inch))

    # Summary statistics
    income_total = sum(
        t.amount for t in transactions if t.transaction_type == 'income'
    )
    expense_total = sum(
        t.amount for t in transactions if t.transaction_type == 'expense'
    )
    net_total = income_total - expense_total

    summary_heading = Paragraph("Summary", heading_style)
    elements.append(summary_heading)

    summary_data = [
        ['Metric', 'Amount'],
        ['Total Transactions', str(transactions.count())],
        ['Total Income', f'${income_total:,.2f}'],
        ['Total Expenses', f'${expense_total:,.2f}'],
        ['Net Total', f'${net_total:,.2f}'],
    ]

    summary_table = Table(summary_data, colWidths=[3*inch, 2*inch])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3498DB')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#ECF0F1')]),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 0.4*inch))

    # Transactions table
    if transactions.count() > 0:
        trans_heading = Paragraph("Transactions", heading_style)
        elements.append(trans_heading)

        # Table header
        table_data = [
            ['Date', 'Type', 'Account', 'Category', 'Amount', 'Notes']
        ]

        # Add transaction rows
        for transaction in transactions:
            # Color code amounts based on type
            if transaction.transaction_type == 'income':
                amount_str = f'+${transaction.amount:,.2f}'
            else:
                amount_str = f'-${transaction.amount:,.2f}'

            table_data.append([
                transaction.date.strftime('%Y-%m-%d'),
                transaction.transaction_type.capitalize(),
                transaction.account.name[:20] if transaction.account else '',
                transaction.category.name[:15] if transaction.category else 'N/A',
                amount_str,
                (transaction.notes[:30] + '...') if len(transaction.notes) > 30 else transaction.notes,
            ])

        # Create table
        transactions_table = Table(
            table_data,
            colWidths=[1*inch, 0.8*inch, 1.3*inch, 1.2*inch, 1*inch, 1.7*inch]
        )

        # Style the table
        table_style = [
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2ECC71')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('ALIGN', (4, 1), (4, -1), 'RIGHT'),  # Align amounts right
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            ('TOPPADDING', (0, 1), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8F9FA')]),
        ]

        # Color code income and expense rows
        for i, transaction in enumerate(transactions, start=1):
            if transaction.transaction_type == 'income':
                table_style.append(('TEXTCOLOR', (4, i), (4, i), colors.HexColor('#27AE60')))
            else:
                table_style.append(('TEXTCOLOR', (4, i), (4, i), colors.HexColor('#E74C3C')))

        transactions_table.setStyle(TableStyle(table_style))
        elements.append(transactions_table)
    else:
        no_data = Paragraph("No transactions found for the selected period.", styles['Normal'])
        elements.append(no_data)

    # Build PDF
    doc.build(elements)

    # Get file size
    file_size = os.path.getsize(file_path)

    # Return relative path for URL generation
    relative_path = os.path.join('exports', filename)

    return relative_path, file_size
