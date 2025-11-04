import 'package:json_annotation/json_annotation.dart';

import '../../domain/entities/user_entity.dart';

part 'user_model.g.dart';

@JsonSerializable()
class UserModel extends UserEntity {
  const UserModel({
    required super.id,
    required super.email,
    required super.username,
    required super.firstName,
    required super.lastName,
    super.phoneNumber,
    super.profilePicture,
    required super.defaultCurrency,
    required super.timezone,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) =>
      _$UserModelFromJson(json);

  Map<String, dynamic> toJson() => _$UserModelToJson(this);

  UserEntity toEntity() => UserEntity(
        id: id,
        email: email,
        username: username,
        firstName: firstName,
        lastName: lastName,
        phoneNumber: phoneNumber,
        profilePicture: profilePicture,
        defaultCurrency: defaultCurrency,
        timezone: timezone,
      );
}
