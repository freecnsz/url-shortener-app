import { LoginRequestDto, LoginResponseDto } from "../../dtos/auth/LoginDto";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUserRepository";
import { IJwtHelper } from "../../../domain/interfaces/helpers/IJwtHelper";
import { IPasswordHasher } from "../../../domain/interfaces/helpers/IPasswordHasher";
import { InvalidCredentialsError } from "../../../domain/errors";
import { QueueManager } from "../../../infrastructure/queues/QueueManager";
import { QueueNames } from "../../../infrastructure/queues/QueueNames";

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
      username: user.username || null,
    });

    // Update last login time
    this.processUpdateInBackground(
      user.id,
      new Date(Date.now()),
      user.lastLoginAt || new Date(Date.now())
    );

    // Prepare response DTO
    const responseDto: LoginResponseDto = {
      user: {
        email: user.email,
        username: user.username || "",
      },
      accessToken: token,
      refreshToken: user.refreshTokens?.[0]?.token, // Assuming the first refresh token is used
    };

    return responseDto;
  }

  private processUpdateInBackground(
    userId: string,
    updateData: Date,
    lastLoginAt: Date
  ): void {
    QueueManager.addJob(QueueNames.ProcessLoginUpdate, {
      userId,
      updateData,
      lastLoginAt,
    }).catch((error) => {
      console.error(`❌ Failed to add job to queue for user ${userId}:`, error);
    });
  }
}
