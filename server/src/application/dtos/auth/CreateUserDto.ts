import { Request } from 'express';

/** 
 * CreateUserRequestDto is used to define the structure of the request body for user creation.
 */

export interface CreateUserRequestDto {
  email: string;
  password: string;
  username?: string;
  firstName?: string;
  lastName?: string;
}

export interface CreateUserRequest extends Request {
  body: CreateUserRequestDto;
}

/* *
 * CreateUserResponseDto is used to return user data after creation.
 */
export interface CreateUserResponseDto {
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class CreateUserResponseDto {
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  createdAt: Date;

  constructor(user: any) {
    this.email = user.email;
    this.username = user.username;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.createdAt = user.createdAt;
  }

  // Static factory method - this can be used to create an instance from a user object
  static fromUser(user: any): CreateUserResponseDto {
    return new CreateUserResponseDto(user);
  }
}