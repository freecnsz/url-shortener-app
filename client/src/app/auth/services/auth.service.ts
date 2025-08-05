import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3000/api/auth'; // API URL'nizi buraya ekleyin
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user_info';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = this.getToken();
    const user = this.getStoredUser();

    if (token && user && !this.isTokenExpired()) {
      this.setCurrentUser(user);
      this.setAuthenticationState(true);
    } else {
      this.clearAuthData();
    }
  }

  // Login methods
  login(email: string, password: string, rememberMe: boolean = false): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, {
      email,
      password,
      rememberMe
    }).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => this.handleAuthError(error))
    );
  }

  register(userData: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/register`, userData).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => this.handleAuthError(error))
    );
  }

  loginWithGoogle(): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/google`, {}).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => this.handleAuthError(error))
    );
  }

  loginWithGithub(): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/github`, {}).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => this.handleAuthError(error))
    );
  }

  // Logout
  logout(): void {
    this.http.post(`${this.API_URL}/logout`, {}).subscribe({
      complete: () => this.handleLogout()
    });
  }

  private handleLogout(): void {
    this.clearAuthData();
    this.setCurrentUser(null);
    this.setAuthenticationState(false);
    this.router.navigate(['/auth/login']);
  }

  // Token management
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY) || sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  private setTokens(token: string, refreshToken: string, rememberMe: boolean = false): void {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(this.TOKEN_KEY, token);
    storage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  // Token refresh
  refreshToken(): Observable<LoginResponse> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<LoginResponse>(`${this.API_URL}/refresh`, {
      refreshToken
    }).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => {
        this.handleLogout();
        return throwError(() => error);
      })
    );
  }

  // User management
  private setCurrentUser(user: User | null): void {
    this.currentUserSubject.next(user);
    if (user) {
      const storage = localStorage.getItem(this.TOKEN_KEY) ? localStorage : sessionStorage;
      storage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  private getStoredUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY) || sessionStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Authentication state
  private setAuthenticationState(isAuthenticated: boolean): void {
    this.isAuthenticatedSubject.next(isAuthenticated);
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  // Password operations
  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/reset-password`, {
      token,
      newPassword
    });
  }

  changePassword(currentPassword: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/change-password`, {
      currentPassword,
      newPassword
    });
  }

  // Email verification
  sendVerificationEmail(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/send-verification`, {});
  }

  verifyEmail(token: string): Observable<User> {
    return this.http.post<User>(`${this.API_URL}/verify-email`, { token }).pipe(
      tap(user => this.setCurrentUser(user))
    );
  }

  // Helper methods
  private handleAuthSuccess(response: LoginResponse): void {
    const { user, token, refreshToken } = response;
    const rememberMe = localStorage.getItem(this.TOKEN_KEY) !== null;
    
    this.setTokens(token, refreshToken, rememberMe);
    this.setCurrentUser(user);
    this.setAuthenticationState(true);
  }

  private handleAuthError(error: any): Observable<never> {
    let errorMessage = 'An error occurred during authentication';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return throwError(() => ({ ...error, message: errorMessage }));
  }

  private clearAuthData(): void {
    // Clear from both localStorage and sessionStorage
    [localStorage, sessionStorage].forEach(storage => {
      storage.removeItem(this.TOKEN_KEY);
      storage.removeItem(this.REFRESH_TOKEN_KEY);
      storage.removeItem(this.USER_KEY);
    });
  }

  private isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000; // Convert to milliseconds
      return Date.now() > expiry;
    } catch {
      return true;
    }
  }

  // Profile operations
  updateProfile(profileData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/profile`, profileData).pipe(
      tap(user => this.setCurrentUser(user))
    );
  }

  deleteAccount(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/account`).pipe(
      tap(() => this.handleLogout())
    );
  }
}