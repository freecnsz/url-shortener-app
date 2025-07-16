import { Request } from 'express';

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginRequest extends Request {
  body: LoginRequestDto;
}

/** LoginResponseDto is used to return user data and token after successful login.
 * It includes fields that are safe to expose to the client.
 */
export interface LoginResponseDto {
  user: {
    email: string;
    username: string;
    fullName?: string;
  };
  token: string;
}

export class LoginResponseDto {
  user: {
    email: string;
    username: string;
    fullName?: string;
  };
  token: string;

  constructor(user: any, token: string) {
    this.user = {
      email: user.email,
      username: user.username,
      fullName: user.fullName
    };
    this.token = token;
  }

  // Static factory method - this can be used to create an instance from user and token
  static fromUserAndToken(user: any, token: string): LoginResponseDto {
    return new LoginResponseDto(user, token);
  }
}