"""
Management command to setup default currencies.
"""
from django.core.management.base import BaseCommand
from apps.expenses.models import Currency


class Command(BaseCommand):
    help = 'Setup default currencies'

    def handle(self, *args, **kwargs):
        currencies = [
            {"code": "USD", "name": "US Dollar", "symbol": "$", "exchange_rate_to_usd": 1.0},
            {"code": "EUR", "name": "Euro", "symbol": "€", "exchange_rate_to_usd": 1.10},
            {"code": "GBP", "name": "British Pound", "symbol": "£", "exchange_rate_to_usd": 1.27},
            {"code": "JPY", "name": "Japanese Yen", "symbol": "¥", "exchange_rate_to_usd": 0.0091},
            {"code": "INR", "name": "Indian Rupee", "symbol": "₹", "exchange_rate_to_usd": 0.012},
            {"code": "AED", "name": "UAE Dirham", "symbol": "د.إ", "exchange_rate_to_usd": 0.27},
            {"code": "SAR", "name": "Saudi Riyal", "symbol": "ر.س", "exchange_rate_to_usd": 0.27},
            {"code": "EGP", "name": "Egyptian Pound", "symbol": "ج.م", "exchange_rate_to_usd": 0.032},
            {"code": "CAD", "name": "Canadian Dollar", "symbol": "C$", "exchange_rate_to_usd": 0.74},
            {"code": "AUD", "name": "Australian Dollar", "symbol": "A$", "exchange_rate_to_usd": 0.66},
        ]

        created_count = 0
        for curr_data in currencies:
            currency, created = Currency.objects.get_or_create(
                code=curr_data['code'],
                defaults=curr_data
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created currency: {currency.code} - {currency.name}')
                )
            else:
                self.stdout.write(f'Currency already exists: {currency.code}')

        self.stdout.write(
            self.style.SUCCESS(f'\nSuccessfully created {created_count} currencies')
        )
