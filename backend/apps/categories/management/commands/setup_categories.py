"""
Management command to setup default categories.
"""
from django.core.management.base import BaseCommand
from apps.categories.models import Category


class Command(BaseCommand):
    help = 'Setup default categories'

    def handle(self, *args, **kwargs):
        categories = [
            # Expense categories
            {"name": "Food & Dining", "type": "expense", "icon": "🍔", "color": "#EF4444", "is_system_default": True, "description": "Restaurants, groceries, and food delivery"},
            {"name": "Transportation", "type": "expense", "icon": "🚗", "color": "#F59E0B", "is_system_default": True, "description": "Gas, public transport, parking"},
            {"name": "Shopping", "type": "expense", "icon": "🛍️", "color": "#EC4899", "is_system_default": True, "description": "Clothing, electronics, and shopping"},
            {"name": "Entertainment", "type": "expense", "icon": "🎬", "color": "#8B5CF6", "is_system_default": True, "description": "Movies, games, hobbies"},
            {"name": "Healthcare", "type": "expense", "icon": "🏥", "color": "#10B981", "is_system_default": True, "description": "Doctor visits, pharmacy, insurance"},
            {"name": "Bills & Utilities", "type": "expense", "icon": "💡", "color": "#6366F1", "is_system_default": True, "description": "Electricity, water, internet, phone"},
            {"name": "Education", "type": "expense", "icon": "📚", "color": "#3B82F6", "is_system_default": True, "description": "Tuition, books, courses"},
            {"name": "Housing", "type": "expense", "icon": "🏠", "color": "#F97316", "is_system_default": True, "description": "Rent, mortgage, maintenance"},
            {"name": "Personal Care", "type": "expense", "icon": "💇", "color": "#EC4899", "is_system_default": True, "description": "Haircuts, salon, beauty products"},
            {"name": "Travel", "type": "expense", "icon": "✈️", "color": "#14B8A6", "is_system_default": True, "description": "Flights, hotels, vacations"},
            {"name": "Insurance", "type": "expense", "icon": "🛡️", "color": "#6366F1", "is_system_default": True, "description": "Life, health, car insurance"},
            {"name": "Gifts & Donations", "type": "expense", "icon": "🎁", "color": "#F43F5E", "is_system_default": True, "description": "Presents, charity, donations"},
            {"name": "Fitness", "type": "expense", "icon": "💪", "color": "#10B981", "is_system_default": True, "description": "Gym, sports equipment, activities"},
            {"name": "Pets", "type": "expense", "icon": "🐾", "color": "#F59E0B", "is_system_default": True, "description": "Pet food, vet visits, pet care"},
            {"name": "Other Expenses", "type": "expense", "icon": "📝", "color": "#6B7280", "is_system_default": True, "description": "Miscellaneous expenses"},

            # Income categories
            {"name": "Salary", "type": "income", "icon": "💰", "color": "#10B981", "is_system_default": True, "description": "Monthly salary or wages"},
            {"name": "Freelance", "type": "income", "icon": "💼", "color": "#14B8A6", "is_system_default": True, "description": "Freelance work and projects"},
            {"name": "Business", "type": "income", "icon": "🏢", "color": "#3B82F6", "is_system_default": True, "description": "Business income and profits"},
            {"name": "Investments", "type": "income", "icon": "📈", "color": "#8B5CF6", "is_system_default": True, "description": "Stocks, dividends, returns"},
            {"name": "Rental Income", "type": "income", "icon": "🏡", "color": "#F97316", "is_system_default": True, "description": "Property rental income"},
            {"name": "Gifts Received", "type": "income", "icon": "🎁", "color": "#EC4899", "is_system_default": True, "description": "Monetary gifts received"},
            {"name": "Refunds", "type": "income", "icon": "💵", "color": "#10B981", "is_system_default": True, "description": "Tax refunds, returns"},
            {"name": "Other Income", "type": "income", "icon": "💸", "color": "#6B7280", "is_system_default": True, "description": "Miscellaneous income"},
        ]

        created_count = 0
        for cat_data in categories:
            category, created = Category.objects.get_or_create(
                name=cat_data['name'],
                type=cat_data['type'],
                is_system_default=True,
                user=None,
                defaults=cat_data
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created category: {category.name} ({category.type})')
                )
            else:
                self.stdout.write(f'Category already exists: {category.name}')

        self.stdout.write(
            self.style.SUCCESS(f'\nSuccessfully created {created_count} categories')
        )
