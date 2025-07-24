import { Response } from 'express';
import { ApiResponse } from '../domain/responses/ApiResponse';

export class responseHelper {
  
  static success<T>(res: Response, data?: T, message: string = 'Success'): void {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    };
    res.status(200).json(response);
  }

  static created<T>(res: Response, data?: T, message: string = 'Created successfully'): void {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    };
    res.status(201).json(response);
  }

  static noContent(res: Response, message: string = 'No content'): void {
    const response: ApiResponse = {
      success: true,
      message,
      timestamp: new Date().toISOString()
    };
    res.status(204).json(response);
  }

  
  static badRequest(res: Response, error: string, details?: any): void {
    const response: ApiResponse = {
      success: false,
      message: 'Bad Request',
      error,
      details,
      timestamp: new Date().toISOString()
    };
    res.status(400).json(response);
  }

  static unauthorized(res: Response, error: string = 'Unauthorized'): void {
    const response: ApiResponse = {
      success: false,
      message: 'Unauthorized',
      error,
      timestamp: new Date().toISOString()
    };
    res.status(401).json(response);
  }

  static forbidden(res: Response, error: string = 'Forbidden'): void {
    const response: ApiResponse = {
      success: false,
      message: 'Forbidden',
      error,
      timestamp: new Date().toISOString()
    };
    res.status(403).json(response);
  }

  static notFound(res: Response, error: string = 'Resource not found'): void {
    const response: ApiResponse = {
      success: false,
      message: 'Not Found',
      error,
      timestamp: new Date().toISOString()
    };
    res.status(404).json(response);
  }

  static conflict(res: Response, error: string = 'Conflict'): void {
    const response: ApiResponse = {
      success: false,
      message: 'Conflict',
      error,
      timestamp: new Date().toISOString()
    };
    res.status(409).json(response);
  }

  static validationError(res: Response, errors: any[], message: string = 'Validation failed'): void {
    const response: ApiResponse = {
      success: false,
      message,
      error: 'Validation Error',
      details: errors,
      timestamp: new Date().toISOString()
    };
    res.status(422).json(response);
  }

  
  static internalError(res: Response, error: string = 'Internal server error'): void {
    const response: ApiResponse = {
      success: false,
      message: 'Internal Server Error',
      error,
      timestamp: new Date().toISOString()
    };
    res.status(500).json(response);
  }

  static serviceUnavailable(res: Response, error: string = 'Service unavailable'): void {
    const response: ApiResponse = {
      success: false,
      message: 'Service Unavailable',
      error,
      timestamp: new Date().toISOString()
    };
    res.status(503).json(response);
  }

  static error(res: Response, error: string, statusCode: number = 500, details?: any): void {
    const response: ApiResponse = {
      success: false,
      message: this.getStatusMessage(statusCode),
      error,
      details,
      timestamp: new Date().toISOString()
    };
    res.status(statusCode).json(response);
  }

  private static getStatusMessage(statusCode: number): string {
    const messages: { [key: number]: string } = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      409: 'Conflict',
      422: 'Validation Error',
      500: 'Internal Server Error',
      503: 'Service Unavailable'
    };
    return messages[statusCode] || 'Error';
  }

  static paginated<T>(
    res: Response, 
    data: T[], 
    page: number, 
    limit: number, 
    total: number,
    message: string = 'Data retrieved successfully'
  ): void {
    const response: ApiResponse<T[]> = {
      success: true,
      message,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      timestamp: new Date().toISOString()
    };
    res.status(200).json(response);
  }
}