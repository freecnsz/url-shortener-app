import { Request, Response } from 'express';

export interface CreateShortUrlRequestDto {
  originalUrl: string;
}

export interface CreateShortUrlRequest extends Request {
  body: CreateShortUrlRequestDto;
}


export interface CreateShortUrlResponseDto {
  shortUrl: string;
  message: string;
}

export interface CreateShortUrlResponse extends Response {
  body: CreateShortUrlResponseDto;
}

