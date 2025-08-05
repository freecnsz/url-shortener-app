import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  constructor(private router: Router) {}

  /**
   * Handle critical errors that require immediate attention (only navigation errors)
   */
  handleCriticalError(error: HttpErrorResponse | Error): void {
    console.error('Critical Application Error:', error);

    if (error instanceof HttpErrorResponse) {
      this.handleCriticalHttpError(error);
    } else {
      // Generic errors - sadece console'a log et
      console.error('Unexpected error:', error);
    }
  }

  /**
   * Handle only critical HTTP errors that require navigation
   */
  private handleCriticalHttpError(error: HttpErrorResponse): void {
    switch (error.status) {
      case 401:
        // Unauthorized - sadece auth sayfalarında değilse login'e yönlendir
        if (!this.router.url.includes('/auth/')) {
          this.router.navigate(['/auth/login']);
        }
        break;
      case 403:
        // Forbidden - sadece çok kritik durumlarda
        if (this.router.url.includes('/admin')) {
          this.router.navigate(['/error/403']);
        }
        break;
      // Diğer hatalar için yönlendirme yapmayalım
      default:
        // Sadece console'a log et
        console.warn('HTTP Error:', error.status, error.message);
        break;
    }
  }

  /**
   * Handle HTTP errors - DEPRECATED (backward compatibility)
   */
  handleError(error: HttpErrorResponse | Error): void {
    console.error('Application Error:', error);
    // Artık otomatik yönlendirme yapmıyoruz
  }

  /**
   * Redirect to maintenance page
   */
  redirectToMaintenance(): void {
    this.router.navigate(['/maintenance']);
  }

  /**
   * Check if the application is in maintenance mode
   */
  checkMaintenanceMode(): Promise<boolean> {
    return Promise.resolve(false);
  }

  /**
   * Navigate to specific error page - sadece manuel çağrılar için
   */
  navigateToError(errorCode: number): void {
    switch (errorCode) {
      case 403:
        this.router.navigate(['/error/403']);
        break;
      case 404:
        this.router.navigate(['/error/404']);
        break;
      case 500:
        this.router.navigate(['/error/500']);
        break;
      default:
        this.router.navigate(['/error/500']);
        break;
    }
  }

  /**
   * Get user-friendly error message
   */
  getErrorMessage(error: HttpErrorResponse): string {
    if (error.error?.message) {
      return error.error.message;
    }

    switch (error.status) {
      case 400:
        return 'Bad request. Please check your input.';
      case 401:
        return 'You are not authorized. Please log in.';
      case 403:
        return 'Access denied. You do not have permission.';
      case 404:
        return 'The requested resource was not found.';
      case 429:
        return 'Too many requests. Please wait and try again.';
      case 500:
        return 'Internal server error. Please try again later.';
      case 502:
        return 'Bad gateway. The server is temporarily unavailable.';
      case 503:
        return 'Service unavailable. Please try again later.';
      case 504:
        return 'Gateway timeout. The request took too long.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  /**
   * Check if error should be shown inline vs redirected
   */
  shouldShowInline(error: HttpErrorResponse): boolean {
    // 401 ve 403 dışında inline göster
    return ![401, 403].includes(error.status);
  }

  /**
   * Get inline error message for components
   */
  getInlineErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 404:
        return 'Data not found';
      case 500:
        return 'Server error occurred';
      case 429:
        return 'Too many requests, please wait';
      default:
        return 'Something went wrong';
    }
  }
}
