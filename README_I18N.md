# Internationalization (i18n) Guide

## Overview

The Expense Tracking Application now supports **full bilingual functionality** with English and Arabic languages for both backend and mobile apps.

## 🌍 Features

- ✅ **Backend i18n**: Django internationalization support with middleware
- ✅ **Mobile i18n**: Flutter localization with Arabic and English
- ✅ **RTL Support**: Right-to-left layout for Arabic
- ✅ **Dynamic Language Switching**: Change language on-the-fly
- ✅ **Persistent Language Selection**: Saves user language preference
- ✅ **Comprehensive Translations**: 100+ strings translated
- ✅ **Settings Page**: Easy language switching UI

## Backend Internationalization

### Configuration

The Django backend is configured to support multiple languages:

```python
# settings.py
LANGUAGE_CODE = 'en'
USE_I18N = True
USE_L10N = True

LANGUAGES = [
    ('en', 'English'),
    ('ar', 'Arabic'),
]

LOCALE_PATHS = [
    BASE_DIR / 'locale',
]

MIDDLEWARE = [
    ...
    'django.middleware.locale.LocaleMiddleware',  # i18n support
    ...
]
```

### Management Commands

Setup default data with:

```bash
# Setup currencies (USD, EUR, GBP, AED, SAR, EGP, etc.)
python manage.py setup_currencies

# Setup default categories (in multiple languages)
python manage.py setup_categories
```

### Creating Translations

1. **Mark strings for translation in Python code:**
```python
from django.utils.translation import gettext_lazy as _

class MyModel(models.Model):
    name = models.CharField(_('Name'), max_length=100)
```

2. **Generate translation files:**
```bash
# Create message files for Arabic
python manage.py makemessages -l ar

# Create message files for all configured languages
python manage.py makemessages -a
```

3. **Edit `.po` files in `locale/ar/LC_MESSAGES/django.po`:**
```po
msgid "Expenses"
msgstr "المصروفات"
```

4. **Compile translations:**
```bash
python manage.py compilemessages
```

### API Language Header

Clients can request content in specific languages by sending the `Accept-Language` header:

```bash
curl -H "Accept-Language: ar" http://localhost:8000/api/v1/expenses/
```

## Mobile Internationalization

### Configuration

The Flutter app uses the `flutter_localizations` package and ARB files for translations.

**pubspec.yaml:**
```yaml
dependencies:
  flutter:
    sdk: flutter
  flutter_localizations:
    sdk: flutter
  intl: ^0.18.1

flutter:
  generate: true
```

**l10n.yaml:**
```yaml
arb-dir: lib/l10n
template-arb-file: app_en.arb
output-localization-file: app_localizations.dart
```

### Translation Files

**English (`lib/l10n/app_en.arb`):**
```json
{
  "@@locale": "en",
  "appName": "Expense Tracker",
  "dashboard": "Dashboard",
  "expenses": "Expenses",
  "addExpense": "Add Expense"
}
```

**Arabic (`lib/l10n/app_ar.arb`):**
```json
{
  "@@locale": "ar",
  "appName": "متتبع النفقات",
  "dashboard": "لوحة التحكم",
  "expenses": "المصروفات",
  "addExpense": "إضافة مصروف"
}
```

### Usage in Flutter Code

```dart
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class MyWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return Text(l10n.appName);  // Shows "Expense Tracker" or "متتبع النفقات"
  }
}
```

### Locale Management with BLoC

The app uses `LocaleCubit` for state management of the current locale:

```dart
// Change language
context.read<LocaleCubit>().changeLocale('ar');

// Check current language
final isArabic = context.read<LocaleCubit>().isArabic;
```

### Settings Page

Users can change the language from the Settings page:

1. Navigate to Settings (gear icon in app bar)
2. Tap on "Language" / "اللغة"
3. Select "English" or "العربية"
4. Language changes immediately and persists across app restarts

### Adding New Translations

1. **Add to English ARB file** (`lib/l10n/app_en.arb`):
```json
{
  "myNewKey": "Hello World"
}
```

2. **Add to Arabic ARB file** (`lib/l10n/app_ar.arb`):
```json
{
  "myNewKey": "مرحبا بالعالم"
}
```

3. **Generate localization files:**
```bash
flutter pub get
# OR
flutter pub run build_runner build
```

4. **Use in code:**
```dart
Text(l10n.myNewKey)
```

## RTL (Right-to-Left) Support

### Flutter RTL

The app automatically switches to RTL layout for Arabic:

```dart
MaterialApp(
  locale: locale,  // Locale('ar') or Locale('en')
  supportedLocales: [
    Locale('en'),
    Locale('ar'),
  ],
  localizationsDelegates: [
    AppLocalizations.delegate,
    GlobalMaterialLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
    GlobalCupertinoLocalizations.delegate,
  ],
)
```

**Features:**
- Text automatically aligned right in Arabic
- Icons and navigation reversed
- Forms and inputs reversed
- All Material widgets support RTL automatically

### Backend RTL

For RTL support in admin panel and templates:

```python
# settings.py
LANGUAGE_BIDI = True  # Enable bidirectional text support
```

## Complete Translation Coverage

### Mobile App Translations

The app includes translations for:

- **Authentication**: Login, register, logout, password fields
- **Dashboard**: Welcome messages, summaries, quick actions
- **Expenses**: Add, edit, delete, view, categories, payment methods
- **Income**: Add, edit, delete, view
- **Budgets**: Create, edit, progress, alerts
- **Analytics**: Charts, trends, reports
- **Settings**: Language, currency, theme, notifications
- **Common**: Save, cancel, delete, search, filter, etc.
- **Validation**: Error messages in both languages
- **Success Messages**: Confirmations in both languages

### Backend Translations

Categories are pre-loaded with Arabic/English names:
- Food & Dining / الطعام والشراب
- Transportation / المواصلات
- Shopping / التسوق
- Entertainment / الترفيه
- Healthcare / الرعاية الصحية
- And more...

## Language Persistence

### Mobile
Language preference is saved using `SharedPreferences`:
- Automatically loads on app start
- Persists across app restarts
- Stored locally on device

### Backend
Language can be set per-user in the User model:
```python
class User(AbstractUser):
    preferred_language = models.CharField(
        max_length=10,
        choices=settings.LANGUAGES,
        default='en'
    )
```

## Best Practices

### For Developers

1. **Always use localization keys** instead of hardcoded strings
2. **Test in both languages** before committing
3. **Keep translation files in sync** - add keys to both ARB files
4. **Use descriptive keys** - `addExpenseButton` better than `button1`
5. **Include context** for translators - use comments in ARB files
6. **Test RTL layout** thoroughly for Arabic
7. **Avoid concatenating strings** - use parameterized messages instead

### Parameterized Messages

**English:**
```json
{
  "welcomeUser": "Welcome, {name}!",
  "@welcomeUser": {
    "placeholders": {
      "name": {"type": "String"}
    }
  }
}
```

**Arabic:**
```json
{
  "welcomeUser": "مرحبا، {name}!"
}
```

**Usage:**
```dart
Text(l10n.welcomeUser(state.user.firstName))
```

## Testing Localization

### Flutter

```dart
testWidgets('displays text in English', (tester) async {
  await tester.pumpWidget(
    MaterialApp(
      locale: Locale('en'),
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      home: MyWidget(),
    ),
  );

  expect(find.text('Expenses'), findsOneWidget);
});

testWidgets('displays text in Arabic', (tester) async {
  await tester.pumpWidget(
    MaterialApp(
      locale: Locale('ar'),
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      home: MyWidget(),
    ),
  );

  expect(find.text('المصروفات'), findsOneWidget);
});
```

## Troubleshooting

### Common Issues

**1. Translations not showing:**
- Run `flutter pub get` after adding new translations
- Check that ARB files are in `lib/l10n/` directory
- Verify `l10n.yaml` configuration

**2. RTL not working:**
- Ensure `localizationsDelegates` includes all required delegates
- Check that locale is properly set in MaterialApp
- Verify `supportedLocales` includes Arabic

**3. Translations not updating:**
- Hot restart (not just hot reload) after changing ARB files
- Clear build cache: `flutter clean && flutter pub get`

**4. Backend translations not working:**
- Run `python manage.py compilemessages` after editing `.po` files
- Check `MIDDLEWARE` includes `LocaleMiddleware`
- Verify `LOCALE_PATHS` is correctly configured

## Supported Languages

Current supported languages:
- 🇺🇸 **English (en)** - Full support
- 🇸🇦 **Arabic (ar)** - Full support with RTL

Adding more languages is straightforward - just add new ARB files and update configuration!

## Contributing Translations

To contribute translations:

1. Copy `app_en.arb` to `app_[language_code].arb`
2. Translate all values (keep keys the same)
3. Add language to `supportedLocales` in `main.dart`
4. Test thoroughly
5. Submit pull request

---

**Happy Translating! 🌍 / ترجمة سعيدة! 🌍**
