import { IUserRepository } from '../domain/interfaces/repositories/IUserRepository';
import { IPasswordHasher } from '../domain/interfaces/helpers/IPasswordHasher';
import { PrismaUserRepository } from '../infrastructure/repositories/PrismaUserRepository';
import { bcryptHasher } from '../utils/bcryptHasher';
import { CreateUserUseCase } from '../application/usecases/auth/CreateUserUseCase';
import { PrismaClient } from '@prisma/client';
import { LoginUseCase } from '../application/usecases/auth/LoginUseCase';
import { IJwtHelper } from '../domain/interfaces/helpers/IJwtHelper';
import { JwtHelper } from '../infrastructure/helpers/JwtHelper';

export class Container {
  private static instance: Container;
  private prismaClient!: PrismaClient;
  private userRepository!: IUserRepository;
  private passwordHasher!: IPasswordHasher;
  private jwtHelper!: IJwtHelper;
  private createUserUseCase!: CreateUserUseCase;
  private loginUseCase!: LoginUseCase;

  private constructor() {
    this.initializeDependencies();
  }

  public static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  private initializeDependencies(): void {
    // 1. Infrastructure dependencies (temel bağımlılıklar önce)
    this.prismaClient = new PrismaClient();
    this.passwordHasher = new bcryptHasher();
    this.jwtHelper = new JwtHelper(); // ÖNEMLİ: Burası önce olmalı
    
    // 2. Repository dependencies
    this.userRepository = new PrismaUserRepository(this.prismaClient);
    
    // 3. Use case dependencies (temel bağımlılıklar hazır olduktan sonra)
    this.createUserUseCase = new CreateUserUseCase(
      this.userRepository,
      this.passwordHasher
    );

    this.loginUseCase = new LoginUseCase(
      this.userRepository,
      this.jwtHelper, // Artık tanımlı
      this.passwordHasher
    );
  }

  // Getter methods for dependencies
  public getPrismaClient(): PrismaClient {
    return this.prismaClient;
  }

  public getUserRepository(): IUserRepository {
    return this.userRepository;
  }

  public getPasswordHasher(): IPasswordHasher {
    return this.passwordHasher;
  }

  public getJwtHelper(): IJwtHelper {
    return this.jwtHelper;
  }

  public getCreateUserUseCase(): CreateUserUseCase {
    return this.createUserUseCase;
  }

  public getLoginUseCase(): LoginUseCase {
    return this.loginUseCase;
  }

  // Cleanup method for graceful shutdown
  public async cleanup(): Promise<void> {
    await this.prismaClient.$disconnect();
  }
}

// Export a singleton instance
export const container = Container.getInstance();