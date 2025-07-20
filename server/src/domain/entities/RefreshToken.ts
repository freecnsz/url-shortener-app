import { User } from "./User";

export class RefreshToken {
 constructor(
   public readonly id: string,
   public userId: string,
   public token: string,
   public expiresAt: Date,
   public createdAt: Date = new Date(),
   public lastUsedAt?: Date,
   public revokedAt?: Date,
   public replacedByToken?: string,
   public ipAddress?: string,
   public userAgent?: string,
   public deviceInfo?: string,
   public deviceFingerprint?: string,
   public isActive: boolean = true,
   public usageCount: number = 0,
   
   // Navigation Property
   public user?: User
 ) {}
}