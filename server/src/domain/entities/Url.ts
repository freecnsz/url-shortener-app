import { ClickLog } from "./ClickLog";
import { Collection } from "./Colleciton";
import { User } from "./User";

export class Url {
  constructor(
    public readonly id: string,
    public userId: string,
    public originalUrl: string,
    public shortCode: string,
    public customPrefix?: string,
    public qrCodeUrl?: string,
    public name?: string,
    public displayText?: string,
    public title?: string,
    public description?: string,
    public collectionId?: string,
    public clickCount: number = 0,
    public lastClickedAt?: Date,
    public expiresAt?: Date,
    public isActive: boolean = true,
    public isPasswordProtected: boolean = false,
    public password?: string,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    
    // Navigation Properties
    public user?: User,
    public collection?: Collection,
    public clickLogs?: ClickLog[]
  ) {}
}