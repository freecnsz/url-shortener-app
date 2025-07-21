import { CreateUserRequestDto } from "../../dtos/auth/CreateUserDto";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUserRepository";
import { User } from "../../../domain/entities/User";
import { IPasswordHasher } from "../../../domain/interfaces/helpers/IPasswordHasher";
import { UserAlreadyExistsError, UsernameAlreadyExistsError } from "../../../domain/errors";
import { randomUUID } from "crypto";

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher
  ) {}  

  async execute(dto: CreateUserRequestDto): Promise<User> {
    // Email normalization
    const normalizedEmail = dto.email.toLowerCase().trim();
    
    // Check email exists
    const emailExists = await this.userRepository.findByEmailAsync(normalizedEmail);
    if (emailExists) {
      throw new UserAlreadyExistsError(normalizedEmail);
    }

    // Check username exists (if provided)
    if (dto.username) {
      const normalizedUsername = dto.username.trim();
      const usernameExists = await this.userRepository.findByUsernameAsync(normalizedUsername);
      if (usernameExists) {
        throw new UsernameAlreadyExistsError(normalizedUsername);
      }
    }

    // Hash password
    const passwordHash = await this.passwordHasher.hash(dto.password);

    // Create user with factory method
    const user = User.createLocal({
      id: randomUUID(), // Generate a new UUID for the user
      username: dto.username?.trim(),
      email: normalizedEmail,
      passwordHash,
      firstName: dto.firstName?.trim(),
      lastName: dto.lastName?.trim(),
    });

    return await this.userRepository.createAsync(user);
  }
}