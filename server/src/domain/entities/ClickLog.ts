import { BrowserType } from "../enums/BrowserType";
import { ReferrerType } from "../enums/ReferrerType";
import { OSType } from "../enums/OSType";
import { DeviceType } from "../enums/DeviceType";
import { SocialPlatform } from "../enums/SocialPlatform";
import { Url } from "./Url";

export class ClickLog {
  constructor(
    public readonly id: string,
    public urlId: string,
    public clickedAt: Date = new Date(),
    
    // Core
    public ipAddress: string = 'UNKNOWN',
    public country?: string,
    public city?: string,

    // Device & Browser
    public userAgent: string = '',
    public device?: DeviceType,
    public browser?: BrowserType,
    public os?: OSType,
    
    // Referrer
    public referrer?: string,
    public referrerType?: ReferrerType,
    
    // UTM & Campaign
    public utmSource?: string,
    public utmMedium?: string,
    public utmCampaign?: string,
    
    // Social Media
    public socialPlatform?: SocialPlatform,
    public fbclid?: string,
    public gclid?: string,
    
    // Bot Detection
    public isBot?: boolean,

    // Behavioral
    public isUniqueVisitor?: boolean,
    public sessionId?: string,

    // Navigation properties
    public url?: Url
  ) {}
}
