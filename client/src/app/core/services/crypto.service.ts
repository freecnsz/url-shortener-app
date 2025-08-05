import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  private readonly secretKey = 'url-shortener-secret-key-2025';

  constructor() {}

  // Encrypt data before storing in localStorage
  encrypt(data: string): string {
    try {
      // Simple XOR encryption for demonstration
      // In production, use a more robust encryption method
      let encrypted = '';
      for (let i = 0; i < data.length; i++) {
        encrypted += String.fromCharCode(
          data.charCodeAt(i) ^ this.secretKey.charCodeAt(i % this.secretKey.length)
        );
      }
      return btoa(encrypted); // Base64 encode
    } catch (error) {
      console.error('Encryption error:', error);
      return data; // Return original data if encryption fails
    }
  }

  // Decrypt data retrieved from localStorage
  decrypt(encryptedData: string): string {
    try {
      const decoded = atob(encryptedData); // Base64 decode
      let decrypted = '';
      for (let i = 0; i < decoded.length; i++) {
        decrypted += String.fromCharCode(
          decoded.charCodeAt(i) ^ this.secretKey.charCodeAt(i % this.secretKey.length)
        );
      }
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      return encryptedData; // Return original data if decryption fails
    }
  }

  // Secure localStorage methods
  setItem(key: string, value: string): void {
    try {
      const encrypted = this.encrypt(value);
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Error setting encrypted item:', error);
      localStorage.setItem(key, value); // Fallback to unencrypted
    }
  }

  getItem(key: string): string | null {
    try {
      const encryptedValue = localStorage.getItem(key);
      if (!encryptedValue) return null;
      
      return this.decrypt(encryptedValue);
    } catch (error) {
      console.error('Error getting encrypted item:', error);
      return localStorage.getItem(key); // Fallback to unencrypted
    }
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  clear(): void {
    localStorage.clear();
  }
}
