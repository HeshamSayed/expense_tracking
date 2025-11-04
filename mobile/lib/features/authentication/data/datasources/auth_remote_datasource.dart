import '../../../../core/network/api_service.dart';
import '../models/user_model.dart';

abstract class AuthRemoteDataSource {
  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  });

  Future<UserModel> register({
    required String email,
    required String username,
    required String password,
    required String passwordConfirm,
    required String firstName,
    required String lastName,
  });

  Future<UserModel> getUser();
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final ApiService apiService;

  AuthRemoteDataSourceImpl(this.apiService);

  @override
  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final response = await apiService.login({
      'email': email,
      'password': password,
    });

    return response.data as Map<String, dynamic>;
  }

  @override
  Future<UserModel> register({
    required String email,
    required String username,
    required String password,
    required String passwordConfirm,
    required String firstName,
    required String lastName,
  }) async {
    final response = await apiService.register({
      'email': email,
      'username': username,
      'password': password,
      'password_confirm': passwordConfirm,
      'first_name': firstName,
      'last_name': lastName,
    });

    final userData = response.data['user'] as Map<String, dynamic>;
    return UserModel.fromJson(userData);
  }

  @override
  Future<UserModel> getUser() async {
    final response = await apiService.getProfile();
    return UserModel.fromJson(response.data as Map<String, dynamic>);
  }
}
