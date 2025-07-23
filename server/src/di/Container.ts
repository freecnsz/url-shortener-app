import { IUserRepository } from '../domain/interfaces/repositories/IUserRepository';
import { IPasswordHasher } from '../domain/interfaces/helpers/IPasswordHasher';
import { PrismaUserRepository } from '../infrastructure/repositories/PrismaUserRepository';
import { bcryptHasher } from '../utils/bcryptHasher';
import { CreateUserUseCase } from '../application/usecases/auth/CreateUserUseCase';
import { PrismaClient } from '@prisma/client';
import { LoginUseCase } from '../application/usecases/auth/LoginUseCase';
import { IJwtHelper } from '../domain/interfaces/helpers/IJwtHelper';
import { JwtHelper } from '../infrastructure/helpers/JwtHelper';
import { CreateShortUrlUseCase } from '../application/usecases/urls/CreateShortUrlUseCase';
import { IShortCodeGeneratorHelper } from '../domain/interfaces/helpers/IShorCodeGeneratorHelper';
import { shortCodeGeneratorHelper } from '../utils/shortCodeGeneratorHelper';
import { PrismaUrlRepository } from '../infrastructure/repositories/PrismaUrlRepository';
import { IUrlRepository } from '../domain/interfaces/repositories/IUrlRepository';
import { RedirectToOriginalUrlUseCase } from '../application/usecases/urls/RedirectToOriginalUrlUseCase';
import { OAuthGoogleRegisterOrLoginUseCase } from '../application/usecases/auth/OAuthGoogleRegisterOrLoginUseCase ';
import { RedisClient } from '../infrastructure/redis/RedisClient';
import { appConfig } from '../config/AppConfig';

export class Container {
  private static instance: Container;
  
  // Infrastructure dependencies
  private prismaClient!: PrismaClient;
  private redisClient!: typeof RedisClient;
  
  // Helper dependencies
  private passwordHasher!: IPasswordHasher;
  private jwtHelper!: IJwtHelper;
  private shortCodeGenerator!: IShortCodeGeneratorHelper;
  
  // Repository dependencies
  private userRepository!: IUserRepository;
  private urlRepository!: IUrlRepository;
  
  // Use case dependencies
  private createUserUseCase!: CreateUserUseCase;
  private loginUseCase!: LoginUseCase;
  private createShortUrlUseCase!: CreateShortUrlUseCase;
  private redirectToOriginalUrlUseCase!: RedirectToOriginalUrlUseCase;
  private oauthGoogleRegisterOrLoginUseCase!: OAuthGoogleRegisterOrLoginUseCase;

  private constructor() {
    try {
      this.initializeDependencies();
    } catch (error) {
      console.error('❌ Failed to initialize DI Container:', error);
      throw error;
    }
  }

  public static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  private initializeDependencies(): void {
    console.log('🔧 Initializing DI Container...');
    
    // 1. Infrastructure dependencies (temel bağımlılıklar önce)
    this.prismaClient = new PrismaClient({
      log: [appConfig.database.logLevel]
    });
    this.redisClient = RedisClient;
    console.log('✅ Infrastructure dependencies initialized');

    // 2. Helper dependencies
    this.passwordHasher = new bcryptHasher();
    this.jwtHelper = new JwtHelper();
    this.shortCodeGenerator = new shortCodeGeneratorHelper();
    console.log('✅ Helper dependencies initialized');

    // 3. Repository dependencies
    this.userRepository = new PrismaUserRepository(this.prismaClient);
    this.urlRepository = new PrismaUrlRepository(this.prismaClient);
    console.log('✅ Repository dependencies initialized');

    // 4. Use case dependencies (temel bağımlılıklar hazır olduktan sonra)
    this.createUserUseCase = new CreateUserUseCase(
      this.userRepository,
      this.passwordHasher
    );

    this.loginUseCase = new LoginUseCase(
      this.userRepository,
      this.jwtHelper,
      this.passwordHasher
    );

    this.createShortUrlUseCase = new CreateShortUrlUseCase(
      this.urlRepository,
      this.shortCodeGenerator
    );

    this.redirectToOriginalUrlUseCase = new RedirectToOriginalUrlUseCase(
      this.urlRepository
    );

    this.oauthGoogleRegisterOrLoginUseCase = new OAuthGoogleRegisterOrLoginUseCase(
      this.userRepository,
      this.jwtHelper
    );
    
    console.log('✅ Use case dependencies initialized');
    console.log('🎉 DI Container initialization completed');
  }

  // Getter methods for dependencies
  public getPrismaClient(): PrismaClient {
    return this.prismaClient;
  }

  public getRedisClient(): typeof RedisClient {
    return this.redisClient;
  }

  public getUserRepository(): IUserRepository {
    return this.userRepository;
  }

  public getUrlRepository(): IUrlRepository {
    return this.urlRepository;
  }

  public getPasswordHasher(): IPasswordHasher {
    return this.passwordHasher;
  }

  public getJwtHelper(): IJwtHelper {
    return this.jwtHelper;
  }

  public getShortCodeGenerator(): IShortCodeGeneratorHelper {
    return this.shortCodeGenerator;
  }

  public getCreateUserUseCase(): CreateUserUseCase {
    return this.createUserUseCase;
  }

  public getLoginUseCase(): LoginUseCase {
    return this.loginUseCase;
  }

  public getCreateShortUrlUseCase(): CreateShortUrlUseCase {
    return this.createShortUrlUseCase;
  }

  public getRedirectToOriginalUrlUseCase(): RedirectToOriginalUrlUseCase {
    return this.redirectToOriginalUrlUseCase;
  }

  public getOAuthGoogleRegisterOrLoginUseCase(): OAuthGoogleRegisterOrLoginUseCase {
    return this.oauthGoogleRegisterOrLoginUseCase;
  }

  // Cleanup method for graceful shutdown
  public async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up DI Container...');
    
    try {
      // Close database connections
      await this.prismaClient.$disconnect();
      console.log('✅ Prisma client disconnected');
      
      // Close Redis connections if needed
      // await this.redisClient.disconnect();
      
      console.log('✅ DI Container cleanup completed');
    } catch (error) {
      console.error('❌ Error during DI Container cleanup:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const container = Container.getInstance();