import { Request, Response } from 'express';

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginRequest extends Request {
  body: LoginRequestDto;
}

export interface LoginResponseDto {
  user: {
    email: string;
    username: string;
  };
  accessToken: string;
  refreshToken?: string;
}

export interface LoginResponse extends Response {
  body: LoginResponseDto;
}