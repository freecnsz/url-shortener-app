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
   * ID generation infrastructure layer'da yapılacak
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
      AuthProvider.LOCAL,
      undefined, // authProviderId
      data.firstName ?? undefined, // firstName
      data.lastName ?? undefined, // lastName
      undefined, // profilePictureUrl
      undefined, // bio
      false, // isEmailVerified
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

  static createOAuth(data: {
    username: null;
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    profilePictureUrl?: string;
    authProvider: AuthProvider;
    authProviderId: string;
  }): User {
    return new User(
      data.id,
      data.username ?? null, // username optional
      data.email,
      undefined, // passwordHash
      data.authProvider,
      data.authProviderId,
      data.firstName ?? undefined,
      data.lastName ?? undefined,
      data.profilePictureUrl,
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