import { AppError } from './AppError';

export class InvalidTokenError extends AppError {
  constructor() {
    super('Invalid token provided', 401);
    this.name = 'InvalidTokenError';
  }
}