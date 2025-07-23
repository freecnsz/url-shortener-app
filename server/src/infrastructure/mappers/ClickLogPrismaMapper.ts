import { ClickLog } from "../../domain/entities/ClickLog";
import { ClickLog as PrismaClickLog } from "@prisma/client";
import { DeviceType } from "../../domain/enums/DeviceType";
import { BrowserType } from "../../domain/enums/BrowserType";
import { OSType } from "../../domain/enums/OSType";
import { ReferrerType } from "../../domain/enums/ReferrerType";
import { SocialPlatform } from "../../domain/enums/SocialPlatform";

export function mapClickLogToPrisma(clickLog: ClickLog): Omit<PrismaClickLog, "updatedAt"> {
  return {
    id: clickLog.id,
    urlId: clickLog.urlId,
    clickedAt: clickLog.clickedAt,
    ipAddress: clickLog.ipAddress,
    country: clickLog.country ?? null,
    city: clickLog.city ?? null,
    userAgent: clickLog.userAgent,
    device: clickLog.device ?? DeviceType.UNKNOWN,
    browser: clickLog.browser ?? BrowserType.UNKNOWN,
    os: clickLog.os ?? OSType.UNKNOWN,
    referrer: clickLog.referrer ?? null,
    referrerType: clickLog.referrerType ?? ReferrerType.UNKNOWN,
    utmSource: clickLog.utmSource ?? null,
    utmMedium: clickLog.utmMedium ?? null,
    utmCampaign: clickLog.utmCampaign ?? null,
    socialPlatform: clickLog.socialPlatform ?? SocialPlatform.UNKNOWN,
    fbclid: clickLog.fbclid ?? null,
    gclid: clickLog.gclid ?? null,
    isBot: clickLog.isBot ?? false,
    isUniqueVisitor: clickLog.isUniqueVisitor ?? false,
    sessionId: clickLog.sessionId ?? null
  };
}

export function mapPrismaToClickLog(data: PrismaClickLog): ClickLog {
  return new ClickLog(
    data.id,
    data.urlId,
    data.clickedAt,
    data.ipAddress ?? 'unknown',
    data.country ?? undefined,
    data.city ?? undefined,
    data.userAgent ?? '',
    data.device as DeviceType,
    data.browser as BrowserType,
    data.os as OSType,
    data.referrer ?? undefined,
    data.referrerType as ReferrerType,
    data.utmSource ?? undefined,
    data.utmMedium ?? undefined,
    data.utmCampaign ?? undefined,
    data.socialPlatform as SocialPlatform,
    data.fbclid ?? undefined,
    data.gclid ?? undefined,
    data.isBot ?? undefined,
    data.isUniqueVisitor ?? undefined,
    data.sessionId ?? undefined
  );
}