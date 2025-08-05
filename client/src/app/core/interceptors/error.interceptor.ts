import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ErrorHandlerService } from '../services/error-handler';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorHandler = inject(ErrorHandlerService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Sadece critical hataları handle et, diğerlerini component'e bırak
      errorHandler.handleCriticalError(error);
      
      return throwError(() => error);
    })
  );
};
