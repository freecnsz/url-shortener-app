# Google OAuth Setup Kılavuzu

## 🔧 Google Cloud Console Kurulumu

### 1. Google Cloud Console'a Git
- [Google Cloud Console](https://console.cloud.google.com/) sayfasına git
- Yeni bir proje oluştur veya mevcut projeyi seç

### 2. APIs & Services'i Etkinleştir
- Sol menüden **APIs & Services** > **Library** seç
- **Google+ API** ve **Google OAuth2 API**'yi ara ve etkinleştir

### 3. OAuth Consent Screen Ayarla
- **APIs & Services** > **OAuth consent screen** git
- **External** seç (test için)
- Gerekli bilgileri doldur:
  - App name: `URL Shortener App`
  - User support email: Email adresin
  - Developer contact: Email adresin

### 4. Credentials Oluştur
- **APIs & Services** > **Credentials** git
- **+ CREATE CREDENTIALS** > **OAuth 2.0 Client IDs** seç
- Application type: **Web application**
- Name: `URL Shortener Web Client`
- **Authorized JavaScript origins** ekle:
  - `http://localhost:4200` (development için)
  - `http://localhost:3000` (production için değiştir)
- **Authorized redirect URIs** ekle:  
  - `http://localhost:4200/auth/callback`
  - `http://localhost:3000/auth/callback`

### 5. Client ID'yi Kopyala
- Oluşturulan credential'dan **Client ID**'yi kopyala
- `src/environments/environment.ts` dosyasında `YOUR_GOOGLE_CLIENT_ID_HERE` yerine yapıştır

## 🔐 Environment Configuration

### Development (environment.ts)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  googleClientId: 'YOUR_ACTUAL_GOOGLE_CLIENT_ID_HERE'
};
```

### Production (environment.prod.ts)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-production-domain.com/api',
  googleClientId: 'YOUR_ACTUAL_GOOGLE_CLIENT_ID_HERE'
};
```

## 🚀 Backend API Endpoints

Backend'inizde bu endpoint'leri oluşturmanız gerekiyor:

### POST /api/auth/google
```json
{
  "idToken": "google_id_token",
  "accessToken": "google_access_token",
  "profile": {
    "id": "google_user_id",
    "email": "user@example.com",
    "name": "User Name",
    "imageUrl": "profile_image_url"
  }
}
```

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "imageUrl": "profile_image_url"
  },
  "token": "jwt_token",
  "refreshToken": "refresh_token"
}
```

### POST /api/auth/logout
```json
{}
```

### POST /api/auth/refresh
```json
{
  "refreshToken": "refresh_token"
}
```

## 🧪 Test Etme

1. `ng serve` ile development server'ı başlat
2. `http://localhost:4200/auth/login` sayfasına git
3. "Continue with Google" butonuna tıkla
4. Google popup'ı açılmalı ve giriş yapabilmelisin

## ⚠️ Önemli Notlar

- **Production'da HTTPS kullan**: Google OAuth production'da sadece HTTPS domain'ler ile çalışır
- **Domain doğrulama**: Production domain'ini Google Console'da doğrula
- **Token güvenliği**: JWT token'ları güvenli sakla
- **Error handling**: Network hataları ve permission redlerini handle et

## 🔍 Troubleshooting

### "Error 400: redirect_uri_mismatch"
- Google Console'da redirect URI'ler doğru tanımlanmış mı kontrol et
- Development için `http://localhost:4200` authorized origins'a eklenmiş mi?

### "Error 403: access_denied"
- OAuth Consent Screen approval bekliyor olabilir
- Test users listesine email adresin eklenmiş mi?

### Google popup açılmıyor
- Browser popup blocker kapalı mı?
- Console'da JavaScript hataları var mı?
- Google API script'leri yüklenmiş mi?
