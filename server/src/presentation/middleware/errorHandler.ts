import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../domain/errors/AppError';
import { UserAlreadyExistsError } from '../../domain/errors/UserAlreadyExistsError';
import { UsernameAlreadyExistsError } from '../../domain/errors/UsernameAlreadyExistsError';
import { ValidationError } from '../../domain/errors/ValidationError';
import { responseHelper } from '../../utils/responseHelper';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', error);

  // Domain specific errors
  if (error instanceof UserAlreadyExistsError || error instanceof UsernameAlreadyExistsError) {
    responseHelper.error(res, error.message, 409);
    return;
  }

  if (error instanceof ValidationError) {
    responseHelper.error(res, error.message, 400);
    return;
  }

  if (error instanceof AppError) {
    responseHelper.error(res, error.message, error.statusCode);
    return;
  }

  // Unexpected errors
  responseHelper.error(res, 'Internal server error', 500);
};