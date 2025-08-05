import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, retryWhen, concatMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const isApiRequest = req.url.startsWith(environment.apiUrl);
    
    if (!isApiRequest) {
      return next.handle(req);
    }


    const apiReq = req.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    const token = localStorage.getItem('token');
    const finalReq = token ? apiReq.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`
      }
    }) : apiReq;

    return next.handle(finalReq).pipe(
      retryWhen(errors => errors.pipe(
        concatMap((error, count) => {
          if (count < environment.apiConfig.retryAttempts && this.shouldRetry(error)) {
            console.log(`API request retry attempt ${count + 1}/${environment.apiConfig.retryAttempts}`);
            return timer(environment.apiConfig.retryDelay * (count + 1));
          }
          return throwError(error);
        })
      )),
      catchError((error: HttpErrorResponse) => {
        console.error('API Error:', error);
        return throwError(this.handleError(error));
      })
    );
  }

  private shouldRetry(error: HttpErrorResponse): boolean {
    return error.status === 0 || (error.status >= 500 && error.status < 600);
  }

  private handleError(error: HttpErrorResponse): any {
    return {
      success: false,
      message: 'API Error',
      error: this.getErrorMessage(error),
      statusCode: error.status,
      timestamp: new Date().toISOString(),
      details: error.error
    };
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Network error. Please check your internet connection.';
    }
    
    if (error.error?.message) {
      return error.error.message;
    }
    
    if (error.error?.error) {
      return error.error.error;
    }

    switch (error.status) {
      case 400:
        return 'Bad request. Please check your input.';
      case 401:
        return 'Unauthorized. Please login again.';
      case 403:
        return 'Access forbidden.';
      case 404:
        return 'Resource not found.';
      case 422:
        return 'Validation error. Please check your input.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Internal server error. Please try again later.';
      case 503:
        return 'Service unavailable. Please try again later.';
      default:
        return `HTTP ${error.status}: ${error.statusText}`;
    }
  }
}
