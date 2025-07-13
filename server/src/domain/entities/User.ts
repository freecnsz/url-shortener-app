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
}