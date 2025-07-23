import { Request, Response, NextFunction } from 'express';

// Type definition for async request handler
type asyncRequestHandler = (
  req: Request, 
  res: Response, 
  next: NextFunction
) => Promise<void>;

/**
 * AsyncHandler middleware - Wraps async route handlers to catch errors
 * @param fn - Async route handler function
 * @returns Express middleware function
 */

export const asyncHandler = (fn: asyncRequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};