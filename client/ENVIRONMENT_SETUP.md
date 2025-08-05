# Environment Configuration

This file explains how to set up environment variables for the URL Shortener application.

## Client (Angular) Environment Setup

### 1. Copy example environment files

```bash
cd client/src/environments
cp environment.example.ts environment.ts
cp environment.prod.example.ts environment.prod.ts
```

### 2. Configure development environment (environment.ts)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  googleClientId: 'YOUR_GOOGLE_CLIENT_ID_HERE', // Get from Google Cloud Console
  
  // ... other configurations
};
```

### 3. Configure production environment (environment.prod.ts)

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-api-domain.com/api',
  googleClientId: 'YOUR_PRODUCTION_GOOGLE_CLIENT_ID_HERE', // Get from Google Cloud Console
  
  // ... other configurations
};
```

## Required Environment Variables

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add your domain to authorized origins
6. Copy the Client ID to your environment files

### API URLs

- **Development**: Usually `http://localhost:3000/api`
- **Production**: Your deployed backend API URL

## Security Notes

⚠️ **IMPORTANT**: Never commit the actual `environment.ts` and `environment.prod.ts` files to git!

These files are already added to `.gitignore` to prevent accidental commits of sensitive data.

## File Structure

```
src/environments/
├── environment.example.ts      ✅ Safe to commit (template)
├── environment.prod.example.ts ✅ Safe to commit (template)
├── environment.ts              ❌ Do NOT commit (contains secrets)
└── environment.prod.ts         ❌ Do NOT commit (contains secrets)
```

## First Time Setup

1. Clone the repository
2. Copy the example files as shown above
3. Fill in your actual values
4. Start development

```bash
# Client setup
cd client
npm install
cp src/environments/environment.example.ts src/environments/environment.ts
# Edit environment.ts with your values
npm start
```

## Environment Features

The environment configuration includes:

- **API Configuration**: Timeouts, retry settings
- **Feature Flags**: Enable/disable features per environment
- **Theme Settings**: Primary/secondary colors
- **App Metadata**: Name, version info
- **OAuth Settings**: Google Client ID

## Troubleshooting

If you get authentication errors:
1. Check your Google Client ID is correct
2. Verify your domain is in authorized origins
3. Make sure API URL is accessible
4. Check console for detailed error messages

## Production Deployment

When deploying to production:
1. Use `environment.prod.ts` with production values
2. Set up your OAuth credentials for production domain
3. Update API URL to your production backend
4. Test all authentication flows
