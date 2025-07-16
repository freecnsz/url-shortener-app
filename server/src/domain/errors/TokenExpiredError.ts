import { AppError } from './AppError';

export class TokenExpiredError extends AppError {
  constructor() {
    super('Token has expired', 401);
    this.name = 'TokenExpiredError';
  }
}