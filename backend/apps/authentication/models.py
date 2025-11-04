"""
Authentication models following clean architecture.
Domain layer - contains business entities.
"""
from django.contrib.auth.models import AbstractUser
from django.db import models
from core.models import TimeStampedModel


class User(AbstractUser, TimeStampedModel):
    """
    Custom user model extending Django's AbstractUser.
    """
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    profile_picture = models.ImageField(
        upload_to='profile_pictures/',
        blank=True,
        null=True
    )
    default_currency = models.CharField(
        max_length=3,
        default='USD',
        help_text='ISO 4217 currency code'
    )
    timezone = models.CharField(
        max_length=50,
        default='UTC',
        help_text='User timezone for date calculations'
    )
    is_email_verified = models.BooleanField(default=False)

    # Notification preferences
    enable_budget_alerts = models.BooleanField(default=True)
    enable_recurring_reminders = models.BooleanField(default=True)
    budget_alert_threshold = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=80.00,
        help_text='Percentage threshold for budget alerts'
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return self.email

    @property
    def full_name(self):
        """Return the user's full name."""
        return f'{self.first_name} {self.last_name}'.strip()


class UserProfile(TimeStampedModel):
    """
    Extended user profile information.
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    bio = models.TextField(blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    occupation = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        db_table = 'user_profiles'
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'

    def __str__(self):
        return f'Profile of {self.user.email}'
