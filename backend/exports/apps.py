"""
App configuration for the exports app.
"""
from django.apps import AppConfig


class ExportsConfig(AppConfig):
    """Configuration for the exports app."""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'exports'
    verbose_name = 'Exports'

    def ready(self):
        """
        Initialize app when Django starts.
        Import signals or perform other initialization here.
        """
        pass
