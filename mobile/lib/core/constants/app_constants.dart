class AppConstants {
  // API
  static const String baseUrl = 'http://localhost:8000'; // Change in production

  // App
  static const String appName = 'Expense Tracker';
  static const String appVersion = '1.0.0';

  // Pagination
  static const int pageSize = 20;

  // Date formats
  static const String dateFormat = 'yyyy-MM-dd';
  static const String displayDateFormat = 'MMM dd, yyyy';
  static const String displayDateTimeFormat = 'MMM dd, yyyy hh:mm a';

  // Currency
  static const String defaultCurrency = 'USD';

  // Chart colors
  static const List<String> chartColors = [
    '#6366F1', // Indigo
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#14B8A6', // Teal
    '#F97316', // Orange
  ];
}
