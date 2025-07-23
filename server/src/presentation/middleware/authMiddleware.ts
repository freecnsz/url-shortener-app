import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { responseHelper } from '../../utils/responseHelper';

// Extended Request interface to include user data
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role?: string;
  };
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    // Check for the Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return responseHelper.unauthorized(res, 'Access token is required');
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return responseHelper.unauthorized(res, 'Access token is required');
    }

    // Verify the token
    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
      return responseHelper.internalError(res, 'JWT secret not configured');
    }

    const decoded = jwt.verify(token, secret) as any;
    
    // Attach user information to the request object
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };

    next();
    
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return responseHelper.unauthorized(res, 'Token has expired');
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return responseHelper.unauthorized(res, 'Invalid token');
    }
    
    return responseHelper.unauthorized(res, 'Authentication failed');
  }
};