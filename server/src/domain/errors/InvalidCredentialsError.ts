import { AppError } from './AppError';

export class InvalidCredentialsError extends AppError {
  constructor() {
    super('Invalid email or password', 401);
    this.name = 'InvalidCredentialsError';
  }
}