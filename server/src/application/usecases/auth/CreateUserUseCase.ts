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
    // Normalize all inputs once
    const normalizedEmail = dto.email.toLowerCase().trim();
    const normalizedUsername = dto.username?.trim();
    const normalizedFirstName = dto.firstName?.trim();
    const normalizedLastName = dto.lastName?.trim();
    
    // Check email exists
    const emailExists = await this.userRepository.findByEmailAsync(normalizedEmail);
    if (emailExists) {
      throw new UserAlreadyExistsError(normalizedEmail);
    }

    // Check username exists (if provided)
    if (normalizedUsername) {
      const usernameExists = await this.userRepository.findByUsernameAsync(normalizedUsername);
      if (usernameExists) {
        throw new UsernameAlreadyExistsError(normalizedUsername);
      }
    }

    // Hash password
    const passwordHash = await this.passwordHasher.hash(dto.password);

    // Create user with factory method
    const user = User.createLocal({
      id: randomUUID(),
      username: normalizedUsername,
      email: normalizedEmail,
      passwordHash,
      firstName: normalizedFirstName,
      lastName: normalizedLastName,
    });

    return await this.userRepository.createAsync(user);
  }
}