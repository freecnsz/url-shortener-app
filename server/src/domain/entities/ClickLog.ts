import { Url } from "url";
import { BrowserType } from "../enums/BrowserType";
import { DeviceType } from "../enums/DeviceType";
import { OSType } from "../enums/OSType";

export class ClickLog {
  constructor(
    public readonly id: number,
    public urlId: string,
    public clickedAt: Date = new Date(),
    public ipAddress?: string,
    public userAgent?: string,
    public referrer?: string,
    public country?: string,
    public city?: string,
    public device: DeviceType = DeviceType.UNKNOWN,
    public browser: BrowserType = BrowserType.UNKNOWN,
    public os: OSType = OSType.UNKNOWN,
    
    // Navigation Properties
    public url?: Url
  ) {}
}