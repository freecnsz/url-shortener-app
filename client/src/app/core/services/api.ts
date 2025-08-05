import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS, ApiEndpointHelper } from '../config/api-endpoints';

export interface ApiRequestOptions {
  headers?: HttpHeaders | { [header: string]: string | string[] };
  params?: HttpParams | { [param: string]: string | string[] };
  withCredentials?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * GET request
   */
  get<T>(endpoint: string, options?: ApiRequestOptions): Observable<T> {
    return this.http.get<T>(this.buildUrl(endpoint), options);
  }

  /**
   * POST request
   */
  post<T>(endpoint: string, body?: any, options?: ApiRequestOptions): Observable<T> {
    return this.http.post<T>(this.buildUrl(endpoint), body, options);
  }

  /**
   * PUT request
   */
  put<T>(endpoint: string, body?: any, options?: ApiRequestOptions): Observable<T> {
    return this.http.put<T>(this.buildUrl(endpoint), body, options);
  }

  /**
   * PATCH request
   */
  patch<T>(endpoint: string, body?: any, options?: ApiRequestOptions): Observable<T> {
    return this.http.patch<T>(this.buildUrl(endpoint), body, options);
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string, options?: ApiRequestOptions): Observable<T> {
    return this.http.delete<T>(this.buildUrl(endpoint), options);
  }

  /**
   * External API request (full URL)
   */
  external<T>(url: string, options?: ApiRequestOptions): Observable<T> {
    return this.http.get<T>(url, options);
  }

  /**
   * Build full API URL
   */
  private buildUrl(endpoint: string): string {
    // Eğer endpoint zaten tam URL ise (external API) olduğu gibi döndür
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }
    
    // Base URL ile birleştir
    return `${this.baseUrl}${endpoint}`;
  }

  /**
   * API Endpoints'e kolay erişim
   */
  get endpoints() {
    return API_ENDPOINTS;
  }

  /**
   * Endpoint helper'ına kolay erişim
   */
  get helper() {
    return ApiEndpointHelper;
  }
}
