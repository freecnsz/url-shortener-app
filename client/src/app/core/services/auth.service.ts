import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GoogleAuthService } from './google-auth.service';
import { ApiService } from './api';
import { ApiResponse, ApiResponseHelper } from '../models/api-response';
import { CryptoService } from './crypto.service';

export interface User {
  id: string;
  email: string;
  name: string;
  imageUrl?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  acceptTerms: boolean;
  acceptMarketing?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private googleAuthService: GoogleAuthService,
    private api: ApiService,
    private cryptoService: CryptoService
  ) {
    this.checkStoredUser();
  }

  private checkStoredUser(): void {
    const storedUser = this.cryptoService.getItem('user');
    const storedToken = this.cryptoService.getItem('token');
    
    if (storedUser && storedToken) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
      } catch (error) {
        this.clearStorage();
      }
    }
  }

  private clearStorage(): void {
    this.cryptoService.removeItem('user');
    this.cryptoService.removeItem('token');
    this.cryptoService.removeItem('refreshToken');
  }

  // Email/Password ile giriş
  async login(email: string, password: string, rememberMe: boolean = false): Promise<LoginResponse> {
    try {
      const response = await firstValueFrom(
        this.api.post<ApiResponse<LoginResponse>>(this.api.endpoints.AUTH.LOGIN, {
          email,
          password,
          rememberMe
        })
      );

      if (!ApiResponseHelper.isSuccess(response)) {
        const error = ApiResponseHelper.getError(response);
        throw new Error(error || 'Login failed');
      }

      const data = ApiResponseHelper.getData(response);
      if (!data) {
        throw new Error('No data received from server');
      }

      this.setUserData(data);
      return data;
    } catch (error: any) {
      // HttpErrorResponse kontrolü
      if (error instanceof HttpErrorResponse) {
        // HTTP hata durumları için daha kullanıcı dostu mesajlar
        if (error.status === 401) {
          throw new Error('Invalid email or password');
        } else if (error.status === 403) {
          throw new Error('Account is blocked. Please contact support');
        } else if (error.status === 429) {
          throw new Error('Too many login attempts. Please try again later');
        } else if (error.status >= 500) {
          throw new Error('Server error. Please try again later');
        } else if (error.status === 0) {
          throw new Error('Please check your internet connection');
        } else {
          // Server'dan gelen error message'ı kontrol et
          const serverError = error.error?.error || error.error?.message;
          throw new Error(serverError || 'Login failed');
        }
      } else if (error.name === 'TimeoutError') {
        throw new Error('Connection timeout. Please try again');
      } else if (!navigator.onLine) {
        throw new Error('Please check your internet connection');
      }
      
      console.error('Login error:', error);
      throw error;
    }
  }

  // Email/Password ile kayıt
  async register(data: RegisterData): Promise<LoginResponse> {
    try {
      const response = await firstValueFrom(
        this.api.post<ApiResponse<LoginResponse>>(this.api.endpoints.AUTH.REGISTER, data)
      );

      if (!ApiResponseHelper.isSuccess(response)) {
        const error = ApiResponseHelper.getError(response);
        throw new Error(error || 'Registration failed');
      }

      const userData = ApiResponseHelper.getData(response);
      if (!userData) {
        throw new Error('No data received from server');
      }

      // For registration, don't automatically log in - user needs to verify email
      // this.setUserData(userData);
      return userData;
    } catch (error: any) {
      // HttpErrorResponse kontrolü
      if (error instanceof HttpErrorResponse) {
        // HTTP hata durumları için daha kullanıcı dostu mesajlar
        if (error.status === 409) {
          throw new Error('Email address is already in use');
        } else if (error.status === 400) {
          // Server'dan gelen spesifik error message'ı kontrol et
          const serverError = error.error?.error || error.error?.message;
          throw new Error(serverError || 'Invalid data provided. Please check your information');
        } else if (error.status === 422) {
          throw new Error('Invalid email format');
        } else if (error.status === 429) {
          throw new Error('Too many registration attempts. Please try again later');
        } else if (error.status >= 500) {
          throw new Error('Server error. Please try again later');
        } else if (error.status === 0) {
          throw new Error('Please check your internet connection');
        } else {
          const serverError = error.error?.error || error.error?.message;
          throw new Error(serverError || 'Registration failed');
        }
      } else if (error.name === 'TimeoutError') {
        throw new Error('Connection timeout. Please try again');
      } else if (!navigator.onLine) {
        throw new Error('Please check your internet connection');
      }
      
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Google ile giriş
  async loginWithGoogle(): Promise<LoginResponse> {
    try {
      const googleUser = await this.googleAuthService.signIn();
      
      // Backend'e sadece token gönder, backend token'ı verify edip profil bilgilerini alır
      const response = await firstValueFrom(
        this.api.post<ApiResponse<LoginResponse>>(this.api.endpoints.AUTH.GOOGLE, {
          idToken: googleUser.idToken
        })
      );

      if (!ApiResponseHelper.isSuccess(response)) {
        const error = ApiResponseHelper.getError(response);
        throw new Error(error || 'Google login failed');
      }

      const data = ApiResponseHelper.getData(response);
      if (!data) {
        throw new Error('No data received from server');
      }

      this.setUserData(data);
      return data;
    } catch (error: any) {
      // HttpErrorResponse kontrolü
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401) {
          throw new Error('Google authentication failed');
        } else if (error.status === 403) {
          throw new Error('Google account is blocked');
        } else if (error.status >= 500) {
          throw new Error('Server error. Please try again later');
        } else if (error.status === 0) {
          throw new Error('Please check your internet connection');
        } else {
          const serverError = error.error?.error || error.error?.message;
          throw new Error(serverError || 'Google login failed');
        }
      }
      
      console.error('Google login error:', error);
      throw error;
    }
  }

  // Register with Google (same endpoint is used)
  async registerWithGoogle(): Promise<LoginResponse> {
    return this.loginWithGoogle();
  }

  // Logout
  async logout(): Promise<void> {
    try {
      // Logout from Google if signed in
      if (this.googleAuthService.isSignedIn()) {
        await this.googleAuthService.signOut();
      }

      // Send logout request to backend
      try {
        const response = await firstValueFrom(
          this.api.post<ApiResponse<any>>(this.api.endpoints.AUTH.LOGOUT, {})
        );
        
        if (!ApiResponseHelper.isSuccess(response)) {
          console.warn('Logout warning:', ApiResponseHelper.getError(response));
        }
      } catch (error) {
        console.error('Backend logout error:', error);
        // Continue with local logout even if backend fails
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      this.clearStorage();
      this.currentUserSubject.next(null);
    }
  }

  // Reset Password
  async resetPassword(email: string): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.api.post<ApiResponse<{ message: string }>>(this.api.endpoints.AUTH.RESET_PASSWORD, { email })
      );

      if (!ApiResponseHelper.isSuccess(response)) {
        const error = ApiResponseHelper.getError(response);
        throw new Error(error || 'Password reset failed');
      }

      const data = ApiResponseHelper.getData(response);
      return data?.message || 'Password reset email sent successfully';
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  // Refresh Token
  async refreshToken(): Promise<LoginResponse> {
    try {
      const refreshToken = this.cryptoService.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await firstValueFrom(
        this.api.post<ApiResponse<LoginResponse>>(this.api.endpoints.AUTH.REFRESH_TOKEN, {
          refreshToken
        })
      );

      if (!ApiResponseHelper.isSuccess(response)) {
        const error = ApiResponseHelper.getError(response);
        throw new Error(error || 'Token refresh failed');
      }

      const data = ApiResponseHelper.getData(response);
      if (!data) {
        throw new Error('No data received from server');
      }

      this.setUserData(data);
      return data;
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, logout user
      this.clearStorage();
      this.currentUserSubject.next(null);
      throw error;
    }
  }

  // Set user data in local storage and current user subject
  private setUserData(response: LoginResponse): void {
    this.cryptoService.setItem('user', JSON.stringify(response.user));
    this.cryptoService.setItem('token', response.token);
    
    if (response.refreshToken) {
      this.cryptoService.setItem('refreshToken', response.refreshToken);
    }
    
    this.currentUserSubject.next(response.user);
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Check login status
  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  // Get token
  getToken(): string | null {
    return this.cryptoService.getItem('token');
  }
}
