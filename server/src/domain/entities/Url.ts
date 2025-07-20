import { ClickLog } from "./ClickLog";
import { Collection } from "./Colleciton";
import { CustomDomain } from "./CustomDomain";
import { User } from "./User";

export class Url {
  constructor(
    public readonly id: string,
    public userId: string | null,
    public originalUrl: string,
    public shortCode: string,
    public customAlias?: string,
    public customDomainId?: string,
    public collectionId?: string,
    public name?: string,
    public description?: string,
    public clickCount: number = 0,
    public lastClickedAt?: Date,
    public expiresAt?: Date,
    public maxClicks?: number,
    public isActive: boolean = true,
    public isPasswordProtected: boolean = false,
    public passwordHash?: string,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),

    // Navigation
    public user?: User,
    public collection?: Collection,
    public customDomain?: CustomDomain,
    public clickLogs?: ClickLog[]
  ) {}

}
