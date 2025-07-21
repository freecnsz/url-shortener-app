import { Url } from "url";
import { AuthProvider } from "../enums/AuthProvider";
import { Collection } from "./Colleciton";
import { RefreshToken } from "./RefreshToken";
import { CustomDomain } from "./CustomDomain";

export class User {
  constructor(
    public readonly id: string,
    public username: string | null,
    public email: string,
    public passwordHash?: string,
    public provider: AuthProvider = AuthProvider.LOCAL,
    public providerId?: string,
    public firstName?: string,
    public lastName?: string,
    public profilePictureUrl?: string,
    public bio?: string,
    public isEmailVerified: boolean = false,
    public emailVerificationToken?: string,
    public emailVerificationExpiresAt?: Date,
    public isActive: boolean = true,
    public lastLoginAt?: Date,
    public passwordResetToken?: string,
    public passwordResetExpiresAt?: Date,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    
    // Navigation Properties
    public collections?: Collection[],
    public urls?: Url[],
    public refreshTokens?: RefreshToken[],
    public domains?: CustomDomain[],
  ) {}

  /**
   * Factory method for creating a local user (email/password registration)
   * ID generation should be handled externally (e.g., UUID generation).
   */
  static createLocal(data: {
    id: string;
    username?: string;
    email: string;
    passwordHash: string;
    firstName?: string;
    lastName?: string;   
  }): User {
    return new User(
      data.id,
      data.username ?? null, // username optional
      data.email,
      data.passwordHash,
      AuthProvider.LOCAL, // Default to local provider
      undefined, // providerId
      data.firstName ?? undefined,
      data.lastName ?? undefined,
      undefined, // profilePictureUrl
      undefined, // bio
      true, // for testing purposes, assume email is verified. It will be set to false in production
      undefined, // emailVerificationToken
      undefined, // emailVerificationExpiresAt
      true, // isActive
      undefined, // lastLoginAt
      undefined, // passwordResetToken
      undefined, // passwordResetExpiresAt
      new Date(Date.now()), // createdAt
      new Date(Date.now())  // updatedAt
    );
  }

  static createOAuth(data: {
    id: string;
    email: string;
    authProvider: AuthProvider;
    authProviderId: string;
    firstName?: string;
    lastName?: string;
  }): User {
    return new User(
      data.id,
      null, // username optional
      data.email,
      undefined, // passwordHash
      data.authProvider,
      data.authProviderId,
      data.firstName ?? undefined,
      data.lastName ?? undefined,
      undefined, // profilePictureUrl
      undefined, // bio
      true, // isEmailVerified
      undefined, // emailVerificationToken
      undefined, // emailVerificationTokenExpiry
      true, // isActive
      undefined, // passwordResetToken
      undefined, // passwordResetTokenExpiry
      undefined, // lastLoginAt
      new Date(Date.now()), // createdAt
      new Date(Date.now())  // updatedAt
    );
  }
}