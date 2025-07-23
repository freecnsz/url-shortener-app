import { config } from 'dotenv';

// Load environment variables
config();

export interface DatabaseConfig {
  url: string;
  logLevel: 'query' | 'info' | 'warn' | 'error';
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshExpiresIn: string;
}

export interface ServerConfig {
  port: number;
  baseUrl: string;
  environment: 'development' | 'production' | 'test';
}

export interface GoogleOAuthConfig {
  clientId: string;
  clientSecret?: string;
}

export interface AppConfig {
  server: ServerConfig;
  database: DatabaseConfig;
  redis: RedisConfig;
  jwt: JwtConfig;
  google: GoogleOAuthConfig;
  shortCodeSecret: string;
}

class ConfigService {
  private static instance: ConfigService;
  private config: AppConfig;

  private constructor() {
    this.config = this.loadConfig();
    this.validateConfig();
  }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  private loadConfig(): AppConfig {
    return {
      server: {
        port: parseInt(process.env.PORT || '3000', 10),
        baseUrl: process.env.BASE_URL || 'http://localhost:3000',
        environment: (process.env.NODE_ENV as any) || 'development'
      },
      database: {
        url: process.env.DATABASE_URL || '',
        logLevel: process.env.NODE_ENV === 'development' ? 'query' : 'error'
      },
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0', 10)
      },
      jwt: {
        secret: process.env.JWT_SECRET || '',
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
      },
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET
      },
      shortCodeSecret: process.env.SHORT_CODE_SECRET || 'default-secret-change-this'
    };
  }

  private validateConfig(): void {
    const requiredFields = [
      'DATABASE_URL',
      'JWT_SECRET',
      'GOOGLE_CLIENT_ID'
    ];

    const missingFields = requiredFields.filter(field => !process.env[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required environment variables: ${missingFields.join(', ')}`);
    }

    if (process.env.NODE_ENV === 'production') {
      const productionRequiredFields = [
        'BASE_URL',
        'REDIS_HOST'
      ];

      const missingProductionFields = productionRequiredFields.filter(field => !process.env[field]);

      if (missingProductionFields.length > 0) {
        console.warn(`⚠️ Missing recommended production environment variables: ${missingProductionFields.join(', ')}`);
      }
    }
  }

  public getConfig(): AppConfig {
    return this.config;
  }

  public isDevelopment(): boolean {
    return this.config.server.environment === 'development';
  }

  public isProduction(): boolean {
    return this.config.server.environment === 'production';
  }

  public isTest(): boolean {
    return this.config.server.environment === 'test';
  }
}

export const appConfig = ConfigService.getInstance().getConfig();
export const configService = ConfigService.getInstance();
