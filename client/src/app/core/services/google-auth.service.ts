import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

declare global {
  interface Window {
    google: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
  private isInitialized = false;

  constructor() {
    this.initializeGoogleAPI();
  }

  private async initializeGoogleAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && window.google) {
        try {
          window.google.accounts.id.initialize({
            client_id: environment.googleClientId,
            callback: this.handleCredentialResponse.bind(this),
            auto_select: false,
            cancel_on_tap_outside: true
          });
          this.isInitialized = true;
          resolve();
        } catch (error) {
          reject(error);
        }
      } else {
        // Google API henüz yüklenmemiş, tekrar dene
        setTimeout(() => {
          this.initializeGoogleAPI().then(resolve).catch(reject);
        }, 100);
      }
    });
  }

  private handleCredentialResponse(response: any): void {
    // Bu callback manuel sign-in için kullanılmayacak
    console.log('Credential response:', response);
  }

  async signIn(): Promise<any> {
    if (!this.isInitialized) {
      await this.initializeGoogleAPI();
    }

    return new Promise((resolve, reject) => {
      try {
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // One Tap görüntülenmedi, manual popup'ı başlat
            this.openPopup().then(resolve).catch(reject);
          }
        });

        // One Tap için alternatif olarak direkt popup'ı başlat
        setTimeout(() => {
          this.openPopup().then(resolve).catch(reject);
        }, 1000);
      } catch (error) {
        this.openPopup().then(resolve).catch(reject);
      }
    });
  }

  private async openPopup(): Promise<any> {
    return new Promise((resolve, reject) => {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: environment.googleClientId,
        scope: 'email profile openid',
        callback: async (response: any) => {
          if (response.access_token) {
            try {
              // Access token ile kullanıcı bilgilerini al
              const userInfo = await this.getUserInfo(response.access_token);
              resolve({
                ...userInfo,
                accessToken: response.access_token,
                idToken: response.id_token || null
              });
            } catch (error) {
              reject(error);
            }
          } else {
            reject(new Error('No access token received'));
          }
        },
        error_callback: (error: any) => {
          reject(error);
        }
      });

      client.requestAccessToken();
    });
  }

  private async getUserInfo(accessToken: string): Promise<any> {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }

      const userInfo = await response.json();
      
      return {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        imageUrl: userInfo.picture,
        verified_email: userInfo.verified_email
      };
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.disableAutoSelect();
      }
    } catch (error) {
      console.error('Google sign out error:', error);
    }
  }

  isSignedIn(): boolean {
    // Google Identity Services ile sign-in durumu kontrol etmek zor
    // Bu bilgiyi AuthService'den alacağız
    return false;
  }
}
