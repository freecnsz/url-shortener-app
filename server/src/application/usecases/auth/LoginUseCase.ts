import { LoginRequestDto, LoginResponseDto } from "../../dtos/auth/LoginDto";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUserRepository";
import { IJwtHelper } from "../../../domain/interfaces/helpers/IJwtHelper";
import { IPasswordHasher } from "../../../domain/interfaces/helpers/IPasswordHasher";
import { InvalidCredentialsError } from "../../../domain/errors";

export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtHelper: IJwtHelper,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  async execute(dto: LoginRequestDto): Promise<LoginResponseDto> {
    // Email normalization
    const normalizedEmail = dto.email.toLowerCase().trim();
    
    // Find user by email
    const user = await this.userRepository.findByEmailAsync(normalizedEmail);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    // Verify password
    const isPasswordValid = await this.passwordHasher.compare(
      dto.password,
      user.passwordHash!
    );
    
    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    // Generate JWT token
    const token = this.jwtHelper.generateToken({
      userId: user.id,
      email: user.email,
      username: user.username
    });

    // Return response using factory method
    return LoginResponseDto.fromUserAndToken(user, token);
  }
}