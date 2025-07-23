import { Request, Response } from 'express';

// Request DTOs (Input)
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

// Response DTOs (Output) - Sadece interface yeterli
export interface CreateUserResponseDto {
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  createdAt: Date;
}

export interface CreateUserResponse extends Response {
  body: CreateUserResponseDto;
}