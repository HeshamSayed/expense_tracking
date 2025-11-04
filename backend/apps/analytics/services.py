"""
Analytics and Export services.
Business logic layer.
"""
import csv
import io
from decimal import Decimal
from datetime import datetime
from django.db.models import Sum, Count
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill
from apps.expenses.models import Expense, Income


class AnalyticsService:
    """
    Service for analytics calculations and insights.
    """

    @staticmethod
    def calculate_savings_rate(user, start_date, end_date):
        """Calculate savings rate for a period."""
        total_income = Income.objects.filter(
            user=user,
            date__gte=start_date,
            date__lte=end_date,
            is_deleted=False
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        total_expenses = Expense.objects.filter(
            user=user,
            date__gte=start_date,
            date__lte=end_date,
            is_deleted=False
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        if total_income == 0:
            return 0

        savings = total_income - total_expenses
        savings_rate = (savings / total_income) * 100

        return float(savings_rate)

    @staticmethod
    def get_top_spending_categories(user, start_date, end_date, limit=5):
        """Get top spending categories."""
        return Expense.objects.filter(
            user=user,
            date__gte=start_date,
            date__lte=end_date,
            is_deleted=False
        ).values(
            'category__name', 'category__color'
        ).annotate(
            total=Sum('amount'),
            count=Count('id')
        ).order_by('-total')[:limit]

    @staticmethod
    def get_spending_insights(user, start_date, end_date):
        """Generate spending insights."""
        expenses = Expense.objects.filter(
            user=user,
            date__gte=start_date,
            date__lte=end_date,
            is_deleted=False
        )

        insights = {
            'total_transactions': expenses.count(),
            'total_amount': expenses.aggregate(total=Sum('amount'))['total'] or Decimal('0.00'),
            'average_transaction': expenses.aggregate(avg=Sum('amount'))['avg'] or Decimal('0.00'),
            'largest_expense': expenses.order_by('-amount').first(),
            'most_used_payment_method': expenses.values('payment_method').annotate(
                count=Count('id')
            ).order_by('-count').first(),
        }

        return insights


class ExportService:
    """
    Service for exporting data to various formats.
    """

    def export_expenses_to_csv(self, expenses):
        """Export expenses to CSV format."""
        output = io.StringIO()
        writer = csv.writer(output)

        # Header
        writer.writerow([
            'Date', 'Category', 'Description', 'Amount',
            'Currency', 'Payment Method', 'Location', 'Tags'
        ])

        # Data
        for expense in expenses:
            tags = ', '.join([tag.name for tag in expense.tags.all()])
            writer.writerow([
                expense.date,
                expense.category.name,
                expense.description or '',
                expense.amount,
                expense.currency.code,
                expense.payment_method,
                expense.location or '',
                tags
            ])

        return output.getvalue()

    def export_expenses_to_excel(self, expenses):
        """Export expenses to Excel format."""
        wb = Workbook()
        ws = wb.active
        ws.title = "Expenses"

        # Header style
        header_font = Font(bold=True, color="FFFFFF")
        header_fill = PatternFill(start_color="4472C4", end_color="4472C4", fill_type="solid")
        header_alignment = Alignment(horizontal="center", vertical="center")

        # Headers
        headers = [
            'Date', 'Category', 'Description', 'Amount',
            'Currency', 'Payment Method', 'Location', 'Tags'
        ]

        for col, header in enumerate(headers, start=1):
            cell = ws.cell(row=1, column=col, value=header)
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = header_alignment

        # Data
        for row, expense in enumerate(expenses, start=2):
            tags = ', '.join([tag.name for tag in expense.tags.all()])

            ws.cell(row=row, column=1, value=expense.date.strftime('%Y-%m-%d'))
            ws.cell(row=row, column=2, value=expense.category.name)
            ws.cell(row=row, column=3, value=expense.description or '')
            ws.cell(row=row, column=4, value=float(expense.amount))
            ws.cell(row=row, column=5, value=expense.currency.code)
            ws.cell(row=row, column=6, value=expense.payment_method)
            ws.cell(row=row, column=7, value=expense.location or '')
            ws.cell(row=row, column=8, value=tags)

        # Adjust column widths
        for column in ws.columns:
            max_length = 0
            column_letter = column[0].column_letter
            for cell in column:
                try:
                    if len(str(cell.value)) > max_length:
                        max_length = len(cell.value)
                except:
                    pass
            adjusted_width = min(max_length + 2, 50)
            ws.column_dimensions[column_letter].width = adjusted_width

        # Save to bytes
        output = io.BytesIO()
        wb.save(output)
        output.seek(0)

        return output.getvalue()

    def generate_financial_report_pdf(self, user, start_date, end_date):
        """Generate comprehensive financial report in PDF format."""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []
        styles = getSampleStyleSheet()

        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=30,
            alignment=1  # Center
        )

        title = Paragraph(f"Financial Report", title_style)
        elements.append(title)

        # Period
        period_text = f"Period: {start_date} to {end_date}"
        period = Paragraph(period_text, styles['Normal'])
        elements.append(period)
        elements.append(Spacer(1, 0.3 * inch))

        # Summary section
        expenses = Expense.objects.filter(
            user=user,
            date__gte=start_date,
            date__lte=end_date,
            is_deleted=False
        )

        incomes = Income.objects.filter(
            user=user,
            date__gte=start_date,
            date__lte=end_date,
            is_deleted=False
        )

        total_expenses = expenses.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        total_income = incomes.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        net_balance = total_income - total_expenses

        summary_data = [
            ['Metric', 'Amount'],
            ['Total Income', f'${total_income:,.2f}'],
            ['Total Expenses', f'${total_expenses:,.2f}'],
            ['Net Balance', f'${net_balance:,.2f}'],
        ]

        summary_table = Table(summary_data, colWidths=[3 * inch, 2 * inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4472C4')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))

        elements.append(summary_table)
        elements.append(Spacer(1, 0.5 * inch))

        # Category breakdown
        heading = Paragraph("Expenses by Category", styles['Heading2'])
        elements.append(heading)
        elements.append(Spacer(1, 0.2 * inch))

        category_data = [['Category', 'Amount', 'Percentage']]

        by_category = expenses.values('category__name').annotate(
            total=Sum('amount')
        ).order_by('-total')

        for item in by_category:
            percentage = (item['total'] / total_expenses * 100) if total_expenses > 0 else 0
            category_data.append([
                item['category__name'],
                f"${item['total']:,.2f}",
                f"{percentage:.1f}%"
            ])

        category_table = Table(category_data, colWidths=[2.5 * inch, 1.5 * inch, 1.5 * inch])
        category_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4472C4')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))

        elements.append(category_table)

        # Build PDF
        doc.build(elements)
        buffer.seek(0)

        return buffer.getvalue()
