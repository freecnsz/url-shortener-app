// src/app/features/shortener/services/url.service.ts
import { Injectable } from '@angular/core';

// ========== API RESPONSE INTERFACES ==========
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  details?: any;
  timestamp: string;
}

// ========== URL SHORTENER INTERFACES ==========
export interface ShortenResponseModel {
  shortUrl: string;
  message: string;
}

export interface ShortenUrlResponse {
  shortUrl: string;
  originalUrl: string;
  qrCode?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UrlService {

  constructor() { }

  async shortenUrl(originalUrl: string): Promise<ShortenUrlResponse> {
    const apiResponse = await this.shortenUrlWithAPI(originalUrl);
    
    if (!apiResponse.success || !apiResponse.data) {
      throw new Error(apiResponse.error || 'Failed to shorten URL');
    }

    return {
      shortUrl: apiResponse.data.shortUrl,
      originalUrl,
      qrCode: this.generateQRCodeUrl(apiResponse.data.shortUrl)
    };
  }

  private generateQRCodeUrl(url: string): string {
    // Using QR Server API for QR code generation
    const encodedUrl = encodeURIComponent(url);
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedUrl}`;
  }

  async shortenUrlWithAPI(originalUrl: string): Promise<ApiResponse<ShortenResponseModel>> {
    const response = await fetch('http://localhost:3000/api/urls/shorten', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ originalUrl: originalUrl })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: 'HTTP Error',
        error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        timestamp: new Date().toISOString()
      };
    }
    return response.json();
  }
  
}