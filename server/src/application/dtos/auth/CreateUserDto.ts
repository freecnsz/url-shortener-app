import { Request } from 'express';

/** CreateUserRequestDto is used to define the structure of the request body for user creation.
 * It includes fields that are required for creating a new user.
 * This DTO is used in the AuthController to validate incoming requests.
 */

export interface CreateUserRequestDto {
  email: string;
  password: string;
  username: string;
  fullName?: string; // Optional, can be undefined
}

export interface CreateUserRequest extends Request {
  body: CreateUserRequestDto;
}

/* * CreateUserResponseDto is used to return user data after creation.
 * It includes fields that are safe to expose to the client.
 */
export interface CreateUserResponseDto {
  email: string;
  username: string;
  fullName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class CreateUserResponseDto {
  email: string;
  username: string;
  fullName?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(user: any) {
    this.email = user.email;
    this.username = user.username;
    this.fullName = user.fullName;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }

  // Static factory method - this can be used to create an instance from a user object
  static fromUser(user: any): CreateUserResponseDto {
    return new CreateUserResponseDto(user);
  }
}