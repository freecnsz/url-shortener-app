

// Base API Response
export interface BaseApiResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

// Success Response
export interface ApiSuccessResponse<T = any> extends BaseApiResponse {
  success: true;
  data: T;
}

// Error Response
export interface ApiErrorResponse extends BaseApiResponse {
  success: false;
  error: string;
  details?: any;
  errorCode?: string;
}

// Union type for all responses
export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;


export class ApiResponseHelper {

  static isSuccess<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
    return response.success === true;
  }

  static isError<T>(response: ApiResponse<T>): response is ApiErrorResponse {
    return response.success === false;
  }

  static getData<T>(response: ApiResponse<T>): T | null {
    return this.isSuccess(response) ? response.data : null;
  }

  static getError<T>(response: ApiResponse<T>): string | null {
    return this.isError(response) ? response.error : null;
  }
}
