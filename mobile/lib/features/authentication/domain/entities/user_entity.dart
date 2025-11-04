import 'package:equatable/equatable.dart';

class UserEntity extends Equatable {
  final int id;
  final String email;
  final String username;
  final String firstName;
  final String lastName;
  final String? phoneNumber;
  final String? profilePicture;
  final String defaultCurrency;
  final String timezone;

  const UserEntity({
    required this.id,
    required this.email,
    required this.username,
    required this.firstName,
    required this.lastName,
    this.phoneNumber,
    this.profilePicture,
    required this.defaultCurrency,
    required this.timezone,
  });

  String get fullName => '$firstName $lastName'.trim();

  @override
  List<Object?> get props => [
        id,
        email,
        username,
        firstName,
        lastName,
        phoneNumber,
        profilePicture,
        defaultCurrency,
        timezone,
      ];
}
