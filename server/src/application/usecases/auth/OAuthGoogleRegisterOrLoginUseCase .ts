import { randomUUID } from "crypto";
import { User } from "../../../domain/entities/User";
import { AuthProvider } from "../../../domain/enums/AuthProvider";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUserRepository";
import { GoogleAuthHelper } from "../../../infrastructure/helpers/GoogleAuthHelper";
import { LoginResponseDto } from "../../dtos/auth/LoginDto";
import { IJwtHelper } from "../../../domain/interfaces/helpers/IJwtHelper";
import { QueueManager } from "../../../infrastructure/queues/QueueManager";
import { QueueNames } from "../../../infrastructure/queues/QueueNames";
import {
  OAuthLoginDto,
  OAuthLoginResponseDto,
} from "../../dtos/auth/OAuthLoginDto";

export class OAuthGoogleRegisterOrLoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtHelper: IJwtHelper
  ) {}

  async execute(req: OAuthLoginDto): Promise<OAuthLoginResponseDto> {
    // Verify Google OAuth token
    const googleUser = await GoogleAuthHelper.verifyIdToken(
      req.accessToken
    ).catch((error) => {
      throw new Error(`Google OAuth verification failed: ${error.message}`);
    });

    if (!googleUser) {
      throw new Error("Invalid Google OAuth token");
    }

    // Normalize email
    const email = googleUser.email.toLowerCase().trim();

    // Check if user already exists
    let user = await this.userRepository.findByEmailAsync(email);
    if (!user) {
      // Create a new user
      user = User.createOAuth({
        id: randomUUID(),
        email,
        authProvider: AuthProvider.GOOGLE,
        authProviderId: googleUser.sub,
        firstName: googleUser.given_name?.trim(),
        lastName: googleUser.family_name?.trim(),
      });

      // Save to database
      user = await this.userRepository.createAsync(user);
    }

    // Generate JWT token
    const token = this.jwtHelper.generateToken({
      userId: user.id,
      email: user.email,
      username: user.username || null,
    });

    // Add updated job to queue
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
