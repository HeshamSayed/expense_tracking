"""
Custom password validators for MoneyGuard.
"""
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _


class ComplexityPasswordValidator:
    """
    Validate that password contains minimum number of uppercase,
    lowercase, and digit characters.
    """

    def __init__(self, min_uppercase=1, min_lowercase=1, min_digits=1):
        self.min_uppercase = min_uppercase
        self.min_lowercase = min_lowercase
        self.min_digits = min_digits

    def validate(self, password, user=None):
        uppercase_count = sum(1 for c in password if c.isupper())
        lowercase_count = sum(1 for c in password if c.islower())
        digit_count = sum(1 for c in password if c.isdigit())

        errors = []

        if uppercase_count < self.min_uppercase:
            errors.append(
                _('Password must contain at least %(min)d uppercase letter.')
                % {'min': self.min_uppercase}
            )

        if lowercase_count < self.min_lowercase:
            errors.append(
                _('Password must contain at least %(min)d lowercase letter.')
                % {'min': self.min_lowercase}
            )

        if digit_count < self.min_digits:
            errors.append(
                _('Password must contain at least %(min)d digit.')
                % {'min': self.min_digits}
            )

        if errors:
            raise ValidationError(errors)

    def get_help_text(self):
        return _(
            'Your password must contain at least %(uppercase)d uppercase letter, '
            '%(lowercase)d lowercase letter, and %(digits)d digit.'
        ) % {
            'uppercase': self.min_uppercase,
            'lowercase': self.min_lowercase,
            'digits': self.min_digits,
        }
