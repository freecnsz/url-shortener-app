import { User } from "./User";

export class RefreshToken {
  constructor(
    public readonly id: string,
    public userId: string,
    public token: string,
    public expiresAt: Date,
    public createdAt: Date = new Date(),
    public revokedAt?: Date,
    public replacedByToken?: string,
    public deviceInfo?: string,
    public ipAddress?: string,
    public userAgent?: string,
    
    // Navigation Properties
    public user?: User
  ) {}
}