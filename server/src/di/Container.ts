import { IUserRepository } from '../domain/interfaces/repositories/IUserRepository';
import { IPasswordHasher } from '../domain/interfaces/helpers/IPasswordHasher';
import { PrismaUserRepository } from '../infrastructure/repositories/PrismaUserRepository';
import { bcryptHasher } from '../utils/bcryptHasher';
import { CreateUserUseCase } from '../application/usecases/user/CreateUserUseCase';
import { PrismaClient } from '@prisma/client';

export class Container {
  private static instance: Container;
  private prismaClient!: PrismaClient;
  private userRepository!: IUserRepository;
  private passwordHasher!: IPasswordHasher;
  private createUserUseCase!: CreateUserUseCase;

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
    // Infrastructure dependencies
    this.prismaClient = new PrismaClient();
    this.passwordHasher = new bcryptHasher();
    
    // Repository dependencies
    this.userRepository = new PrismaUserRepository(this.prismaClient);
    
    // Use case dependencies
    this.createUserUseCase = new CreateUserUseCase(
      this.userRepository,
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

  public getCreateUserUseCase(): CreateUserUseCase {
    return this.createUserUseCase;
  }

  // Cleanup method for graceful shutdown
  public async cleanup(): Promise<void> {
    await this.prismaClient.$disconnect();
  }
}

// Export a singleton instance
export const container = Container.getInstance();