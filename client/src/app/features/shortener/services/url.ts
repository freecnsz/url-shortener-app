// src/app/features/shortener/services/url.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../../core/services/api';
import { ApiResponse, ApiResponseHelper } from '../../../core/models/api-response';

export interface ShortenResponseModel {
  shortUrl: string;
  message: string;
}

export interface ShortenUrlResponse {
  shortUrl: string;
  originalUrl: string;
  qrCode?: string;
  id?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UrlService {

  constructor(
    private api: ApiService
  ) { }

  async shortenUrl(originalUrl: string): Promise<ShortenUrlResponse> {
    try {
      const apiResponse = await this.shortenUrlWithAPI(originalUrl);
      
      if (!ApiResponseHelper.isSuccess(apiResponse)) {
        const error = ApiResponseHelper.getError(apiResponse);
        throw new Error(error || 'Failed to shorten URL');
      }

      const data = ApiResponseHelper.getData(apiResponse);
      if (!data) {
        throw new Error('No data received from server');
      }

      return {
        shortUrl: data.shortUrl,
        originalUrl,
        qrCode: this.generateQRCodeUrl(data.shortUrl)
      };
    } catch (error) {
      console.error('URL shortening error:', error);
      throw error;
    }
  }

  private generateQRCodeUrl(url: string): string {
    const encodedUrl = encodeURIComponent(url);
    const qrApiEndpoint = this.api.endpoints.EXTERNAL.QR_CODE;
    return this.api.helper.withQuery(qrApiEndpoint, {
      size: '200x200',
      data: encodedUrl
    });
  }

  async shortenUrlWithAPI(originalUrl: string): Promise<ApiResponse<ShortenResponseModel>> {
    try {
      const response = await firstValueFrom(
        this.api.post<ApiResponse<ShortenResponseModel>>(
          this.api.endpoints.URLS.SHORTEN,
          { originalUrl: originalUrl }
        )
      );
      
      return response;
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        const errorMessage = error.error?.error || error.error?.message || error.message;
        return {
          success: false,
          message: 'HTTP Error',
          error: errorMessage || `HTTP ${error.status}: ${error.statusText}`,
          timestamp: new Date().toISOString()
        } as ApiResponse<ShortenResponseModel>;
      } else {
        return {
          success: false,
          message: 'Network Error',
          error: 'Failed to connect to server. Please check your connection.',
          timestamp: new Date().toISOString()
        } as ApiResponse<ShortenResponseModel>;
      }
    }
  }

  // Get URL statistics
  async getUrlStats(shortUrl: string): Promise<any> {
    try {
      const endpoint = this.api.helper.withParam(this.api.endpoints.URLS.STATS, shortUrl);
      const response = await firstValueFrom(
        this.api.get<ApiResponse>(endpoint)
      );
      
      if (!ApiResponseHelper.isSuccess(response)) {
        const error = ApiResponseHelper.getError(response);
        throw new Error(error || 'Failed to fetch URL stats');
      }
      
      return ApiResponseHelper.getData(response);
    } catch (error) {
      console.error('Error fetching URL stats:', error);
      throw error;
    }
  }

  // Get user's URLs
  async getUserUrls(): Promise<any[]> {
    try {
      const response = await firstValueFrom(
        this.api.get<ApiResponse>(this.api.endpoints.URLS.USER_URLS)
      );
      
      if (!ApiResponseHelper.isSuccess(response)) {
        const error = ApiResponseHelper.getError(response);
        throw new Error(error || 'Failed to fetch user URLs');
      }
      
      return ApiResponseHelper.getData(response) || [];
    } catch (error) {
      console.error('Error fetching user URLs:', error);
      throw error;
    }
  }
}