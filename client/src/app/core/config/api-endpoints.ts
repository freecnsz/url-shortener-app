

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    GOOGLE: '/auth/google',
    LOGOUT: '/auth/logout',
    RESET_PASSWORD: '/auth/reset-password',
    REFRESH_TOKEN: '/auth/refresh-token',
    VERIFY_EMAIL: '/auth/verify-email',
    PROFILE: '/auth/profile'
  },

  URLS: {
    SHORTEN: '/urls/shorten',
    STATS: '/urls/stats',
    USER_URLS: '/urls/user',
    DELETE: '/urls/delete',
    UPDATE: '/urls/update',
    BULK_DELETE: '/urls/bulk-delete'
  },

  DASHBOARD: {
    OVERVIEW: '/dashboard/overview',
    ANALYTICS: '/dashboard/analytics',
    FOLDERS: '/dashboard/folders',
    RECENT_ACTIVITY: '/dashboard/recent-activity'
  },

  USER: {
    PROFILE: '/user/profile',
    SETTINGS: '/user/settings',
    PREFERENCES: '/user/preferences',
    DELETE_ACCOUNT: '/user/delete-account'
  },

  EXTERNAL: {
    QR_CODE: 'https://api.qrserver.com/v1/create-qr-code',
    GOOGLE_OAUTH: 'https://www.googleapis.com/oauth2/v2/userinfo'
  }
} as const;

export class ApiEndpointHelper {

  static withParam(endpoint: string, param: string | number): string {
    return `${endpoint}/${param}`;
  }

  static withQuery(endpoint: string, params: Record<string, string | number>): string {
    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    return `${endpoint}?${queryString}`;
  }

  static withParams(endpoint: string, ...params: (string | number)[]): string {
    return `${endpoint}/${params.join('/')}`;
  }
}

export type AuthEndpoints = keyof typeof API_ENDPOINTS.AUTH;
export type UrlEndpoints = keyof typeof API_ENDPOINTS.URLS;
export type DashboardEndpoints = keyof typeof API_ENDPOINTS.DASHBOARD;
export type UserEndpoints = keyof typeof API_ENDPOINTS.USER;
export type ExternalEndpoints = keyof typeof API_ENDPOINTS.EXTERNAL;
