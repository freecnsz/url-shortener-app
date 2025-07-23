import { User } from "../../domain/entities/User";
import { CreateUserResponseDto } from "../dtos/auth/CreateUserDto";

/**
 * UserMapper handles transformation between User entity and DTOs
 */
export class UserMapper {
  
  /**
   * Convert User entity to CreateUserResponseDto (removes sensitive data)
   */
  static toCreateUserResponse(user: User): CreateUserResponseDto {
    return {
      email: user.email,
      username: user.username || undefined,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      createdAt: user.createdAt,
    };
  }

  /**
   * Convert User entity array to response DTO array
   */
  static toCreateUserResponseArray(users: User[]): CreateUserResponseDto[] {
    return users.map(user => this.toCreateUserResponse(user));
  }
}