import 'package:shared_preferences/shared_preferences.dart';

class LocalStorage {
  final SharedPreferences _prefs;

  LocalStorage(this._prefs);

  // Keys
  static const String _keyAccessToken = 'access_token';
  static const String _keyRefreshToken = 'refresh_token';
  static const String _keyUserId = 'user_id';
  static const String _keyUserEmail = 'user_email';

  // Token operations
  Future<void> saveTokens(String accessToken, String refreshToken) async {
    await _prefs.setString(_keyAccessToken, accessToken);
    await _prefs.setString(_keyRefreshToken, refreshToken);
  }

  String? getAccessToken() => _prefs.getString(_keyAccessToken);
  String? getRefreshToken() => _prefs.getString(_keyRefreshToken);

  Future<void> clearTokens() async {
    await _prefs.remove(_keyAccessToken);
    await _prefs.remove(_keyRefreshToken);
  }

  // User operations
  Future<void> saveUserId(int userId) async {
    await _prefs.setInt(_keyUserId, userId);
  }

  int? getUserId() => _prefs.getInt(_keyUserId);

  Future<void> saveUserEmail(String email) async {
    await _prefs.setString(_keyUserEmail, email);
  }

  String? getUserEmail() => _prefs.getString(_keyUserEmail);

  Future<void> clearUserData() async {
    await _prefs.remove(_keyUserId);
    await _prefs.remove(_keyUserEmail);
  }

  // Clear all data
  Future<void> clearAll() async {
    await clearTokens();
    await clearUserData();
  }
}
