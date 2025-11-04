import 'package:hive/hive.dart';

import '../../../../core/storage/local_storage.dart';

abstract class AuthLocalDataSource {
  Future<void> saveTokens(String accessToken, String refreshToken);
  String? getAccessToken();
  String? getRefreshToken();
  Future<void> clearTokens();
  Future<bool> isAuthenticated();
}

class AuthLocalDataSourceImpl implements AuthLocalDataSource {
  final LocalStorage localStorage;

  AuthLocalDataSourceImpl(this.localStorage);

  @override
  Future<void> saveTokens(String accessToken, String refreshToken) async {
    await localStorage.saveTokens(accessToken, refreshToken);

    // Also save to Hive for interceptor access
    final box = Hive.box('auth');
    await box.put('access_token', accessToken);
    await box.put('refresh_token', refreshToken);
  }

  @override
  String? getAccessToken() => localStorage.getAccessToken();

  @override
  String? getRefreshToken() => localStorage.getRefreshToken();

  @override
  Future<void> clearTokens() async {
    await localStorage.clearAll();

    final box = Hive.box('auth');
    await box.clear();
  }

  @override
  Future<bool> isAuthenticated() async {
    final token = getAccessToken();
    return token != null && token.isNotEmpty;
  }
}
