import { Application } from 'express';
import { errorHandler } from './errorHandler';
import { asyncHandler } from './asyncHandler';

export const setupMiddleware = (app: Application): void => {
  app.use(asyncHandler);
  app.use(errorHandler);
};