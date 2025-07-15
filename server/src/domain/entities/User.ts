import { Url } from "url";
import { AuthProvider } from "../enums/AuthProvider";
import { Collection } from "./Colleciton";
import { RefreshToken } from "./RefreshToken";

export class User {
  constructor(
    public readonly id: string,
    public username: string | null,
    public email: string,
    public passwordHash?: string,
    public provider: AuthProvider = AuthProvider.LOCAL,
    public providerId?: string,
    public fullName?: string,
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
    public refreshTokens?: RefreshToken[]
  ) {}

  /**
   * Factory method for creating a local user (email/password registration)
   * ID generation infrastructure layer'da yapılacak
   */
  static createLocal(data: {
    id: string; // ID'yi dışarıdan alıyoruz
    username?: string;
    email: string;
    passwordHash: string;
    fullName?: string;
  }): User {
    return new User(
      data.id,
      data.username ?? null, // username optional
      data.email,
      data.passwordHash,
      AuthProvider.LOCAL,
      undefined, // authProviderId
      data.fullName,
      undefined, // profilePictureUrl
      undefined, // bio
      false, // isEmailVerified
      undefined, // emailVerificationToken
      undefined, // emailVerificationTokenExpiry
      true, // isActive
      undefined, // passwordResetToken
      undefined, // passwordResetTokenExpiry
      undefined, // lastLoginAt
      new Date(), // createdAt
      new Date()  // updatedAt
    );
  }

  static createOAuth(data: {
    username: null;
    id: string; // ID'yi dışarıdan alıyoruz
    email: string;
    fullName?: string;
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
      data.fullName,
      data.profilePictureUrl,
      undefined, // bio
      true, // isEmailVerified
      undefined, // emailVerificationToken
      undefined, // emailVerificationTokenExpiry
      true, // isActive
      undefined, // passwordResetToken
      undefined, // passwordResetTokenExpiry
      undefined, // lastLoginAt
      new Date(), // createdAt
      new Date()  // updatedAt
    );
  }
}