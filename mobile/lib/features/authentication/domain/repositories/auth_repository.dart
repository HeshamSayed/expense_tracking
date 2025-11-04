import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';
import '../entities/user_entity.dart';

abstract class AuthRepository {
  Future<Either<Failure, Map<String, dynamic>>> login({
    required String email,
    required String password,
  });

  Future<Either<Failure, UserEntity>> register({
    required String email,
    required String username,
    required String password,
    required String passwordConfirm,
    required String firstName,
    required String lastName,
  });

  Future<Either<Failure, UserEntity>> getUser();

  Future<Either<Failure, void>> logout();

  Future<bool> isAuthenticated();
}
