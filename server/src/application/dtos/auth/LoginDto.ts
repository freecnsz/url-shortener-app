import { Request } from 'express';

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginRequest extends Request {
  body: LoginRequestDto;
}

/** 
 * LoginResponseDto is used to return user data and token after successful login.
 */
export interface LoginResponseDto {
  user: {
    email: string;
    username: string;
  };
  accessToken: string;
  refreshToken?: string;
}

export class LoginResponseDto {
  user: {
    email: string;
    username: string;
  };  
  accessToken: string;
  refreshToken?: string;

  constructor(user: any, accessToken: string, refreshToken?: string) {
    this.user = {
      email: user.email,
      username: user.username,
    };
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  // Static factory method - this can be used to create an instance from user and token
  static fromUserAndToken(user: any, accessToken: string, refreshToken?: string): LoginResponseDto {
    return new LoginResponseDto(user, accessToken, refreshToken);
  }
}