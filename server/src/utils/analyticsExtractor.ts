import { parse } from 'useragent';
import { RawRequestDto } from "../application/dtos/urls/RawRequest";
import { ClickLog } from "../domain/entities/ClickLog";
import { BrowserType } from "../domain/enums/BrowserType";
import { ReferrerType } from "../domain/enums/ReferrerType";
import { DeviceType } from "../domain/enums/DeviceType";
import { OSType } from "../domain/enums/OSType";
import { SocialPlatform } from "../domain/enums/SocialPlatform";

export class analyticsExtractor {
  private static readonly SOCIAL_PLATFORMS = new Map<string, SocialPlatform>([
    ['facebook.com', SocialPlatform.FACEBOOK],
    ['fb.com', SocialPlatform.FACEBOOK],
    ['m.facebook.com', SocialPlatform.FACEBOOK],
    ['twitter.com', SocialPlatform.TWITTER],
    ['x.com', SocialPlatform.TWITTER],
    ['t.co', SocialPlatform.TWITTER],
    ['instagram.com', SocialPlatform.INSTAGRAM],
    ['linkedin.com', SocialPlatform.LINKEDIN],
    ['youtube.com', SocialPlatform.YOUTUBE],
    ['youtu.be', SocialPlatform.YOUTUBE],
    ['tiktok.com', SocialPlatform.TIKTOK],
    ['pinterest.com', SocialPlatform.PINTEREST],
    ['snapchat.com', SocialPlatform.SNAPCHAT],
    ['reddit.com', SocialPlatform.REDDIT],
    ['discord.com', SocialPlatform.DISCORD],
    ['telegram.org', SocialPlatform.TELEGRAM],
    ['whatsapp.com', SocialPlatform.WHATSAPP],
  ]);

  private static readonly SEARCH_ENGINES = [
    'google', 'bing', 'yahoo', 'yandex', 'duckduckgo', 'baidu', 'ask', 'aol'
  ];

  private static readonly BOT_PATTERNS = [
    /bot/i, /crawler/i, /spider/i, /crawl/i, /slurp/i, /scraper/i,
    /googlebot/i, /bingbot/i, /facebookexternalhit/i, /twitterbot/i,
    /linkedinbot/i, /whatsapp/i, /telegrambot/i, /applebot/i,
    /yandexbot/i, /baiduspider/i, /duckduckbot/i, /slack/i,
    /postman/i, /curl/i, /wget/i, /python/i, /java/i, /node/i,
    /phantom/i, /headless/i, /puppeteer/i, /selenium/i
  ];

  public static extractFromRequest(dto: RawRequestDto): Partial<ClickLog> {
    const {
      headers,
      ip,
      ips,
      query,
      body,
      cookies,
    } = dto;

    // IP Address extraction with fallback chain
    const ipAddress = this.extractIPAddress(ip, ips, headers);
    const userAgent = this.extractUserAgent(headers);

    // Referrer analysis
    const referrer = this.extractReferrer(headers);
    const referrerType = this.extractReferrerType(referrer);
    const socialPlatform = this.getSocialPlatformFromReferrer(referrer);

    // User agent parsing
    const ua = parse(userAgent);
    const device = this.getDeviceType(ua);
    const browser = this.getBrowserType(ua);
    const os = this.getOSType(ua);

    // UTM and tracking parameters
    const utmData = this.extractUTMParameters(query, body, cookies);
    const trackingData = this.extractTrackingParameters(query, body, cookies);

    // Geolocation (placeholder for future implementation)
    const geoData = this.extractGeoData(ipAddress);

    // Bot detection
    const isBot = this.detectBot(userAgent, headers);

    // Session management
    const sessionId = this.extractSessionId(cookies, query, headers);

    return {
      ipAddress,
      userAgent,
      country: geoData.country,
      city: geoData.city,
      device,
      browser,
      os,
      referrer,
      referrerType,
      socialPlatform,
      utmSource: utmData.source,
      utmMedium: utmData.medium,
      utmCampaign: utmData.campaign,
      fbclid: trackingData.fbclid,
      gclid: trackingData.gclid,
      sessionId,
      isBot,
    };
  }

  private static extractIPAddress(
    ip: string, 
    ips: string[], 
    headers: Record<string, string | string[] | undefined>
  ): string {
    // Check for real IP in headers (for reverse proxy scenarios)
    const xRealIP = headers['x-real-ip'] as string;
    const xForwardedFor = headers['x-forwarded-for'] as string;
    const cfConnectingIP = headers['cf-connecting-ip'] as string; // Cloudflare
    const xClientIP = headers['x-client-ip'] as string;

    if (cfConnectingIP) return cfConnectingIP;
    if (xRealIP) return xRealIP;
    if (xForwardedFor) {
      const firstIP = xForwardedFor.split(',')[0].trim();
      if (firstIP) return firstIP;
    }
    if (xClientIP) return xClientIP;
    if (ip) return ip;
    if (ips && ips.length > 0) return ips[0];
    
    return 'UNKNOWN';
  }

  private static extractUserAgent(headers: Record<string, string | string[] | undefined>): string {
    return (headers['user-agent'] as string) || '';
  }

  private static extractReferrer(headers: Record<string, string | string[] | undefined>): string {
    return (headers['referer'] as string) || (headers['referrer'] as string) || '';
  }

  private static extractReferrerType(referrer: string): ReferrerType {
    if (!referrer) return ReferrerType.DIRECT;

    const lowerRef = referrer.toLowerCase();

    // Check if it's from a social platform
    for (const [domain] of this.SOCIAL_PLATFORMS) {
      if (lowerRef.includes(domain)) {
        return ReferrerType.SOCIAL;
      }
    }

    // Check if it's from a search engine
    const isSearchEngine = this.SEARCH_ENGINES.some(engine => 
      lowerRef.includes(engine)
    );
    
    if (isSearchEngine) return ReferrerType.SEARCH;

    // Check for email clients
    if (lowerRef.includes('mail.') || lowerRef.includes('outlook.') || 
        lowerRef.includes('gmail.') || lowerRef.includes('yahoo.')) {
      return ReferrerType.EMAIL;
    }

    return ReferrerType.REFERRAL;
  }

  private static getSocialPlatformFromReferrer(referrer: string): SocialPlatform | undefined {
    if (!referrer) return undefined;

    const lowerRef = referrer.toLowerCase();
    
    for (const [domain, platform] of this.SOCIAL_PLATFORMS) {
      if (lowerRef.includes(domain)) {
        return platform;
      }
    }

    return undefined;
  }

  private static extractUTMParameters(
    query: Record<string, any>, 
    body: any, 
    cookies?: Record<string, any>
  ) {
    return {
      source: query.utm_source || body?.utm_source || cookies?.utm_source,
      medium: query.utm_medium || body?.utm_medium || cookies?.utm_medium,
      campaign: query.utm_campaign || body?.utm_campaign || cookies?.utm_campaign,
      term: query.utm_term || body?.utm_term || cookies?.utm_term,
      content: query.utm_content || body?.utm_content || cookies?.utm_content,
    };
  }

  private static extractTrackingParameters(
    query: Record<string, any>, 
    body: any, 
    cookies?: Record<string, any>
  ) {
    return {
      fbclid: query.fbclid || body?.fbclid || cookies?.fbclid,
      gclid: query.gclid || body?.gclid || cookies?.gclid,
      msclkid: query.msclkid || body?.msclkid || cookies?.msclkid, // Microsoft/Bing
      dclid: query.dclid || body?.dclid || cookies?.dclid, // Display & Video 360
      wbraid: query.wbraid || body?.wbraid || cookies?.wbraid, // Google Web to App
      gbraid: query.gbraid || body?.gbraid || cookies?.gbraid, // Google iOS14+ tracking
    };
  }

  private static extractSessionId(
    cookies?: Record<string, any>, 
    query?: Record<string, any>,
    headers?: Record<string, string | string[] | undefined>
  ): string | undefined {
    // Try various session ID sources
    return cookies?.sessionId || 
           cookies?.session_id || 
           cookies?.sid ||
           query?.sessionId || 
           query?.session_id ||
           (headers?.['x-session-id'] as string);
  }

  private static detectBot(userAgent: string, headers: Record<string, string | string[] | undefined>): boolean {
    if (!userAgent) return true; // No user agent is suspicious

    // Check user agent patterns
    const isUserAgentBot = this.BOT_PATTERNS.some(pattern => pattern.test(userAgent));
    if (isUserAgentBot) return true;

    // Check for headless browser indicators
    if (userAgent.includes('HeadlessChrome') || userAgent.includes('PhantomJS')) {
      return true;
    }

    // Check for automation tools
    const automationHeaders = [
      'x-requested-with',
      'x-automation-tool',
      'x-bot',
      'x-crawler'
    ];

    const hasAutomationHeaders = automationHeaders.some(header => 
      headers[header] !== undefined
    );

    return hasAutomationHeaders;
  }

  private static getDeviceType(ua: any): DeviceType {
    const deviceFamily = ua.device?.family?.toLowerCase() || '';
    const userAgentString = ua.source?.toLowerCase() || '';

    if (!deviceFamily || deviceFamily === 'other' || deviceFamily === 'spider') {
      // Fallback to user agent string analysis
      if (userAgentString.includes('mobile') || userAgentString.includes('android')) {
        return DeviceType.MOBILE;
      }
      if (userAgentString.includes('tablet') || userAgentString.includes('ipad')) {
        return DeviceType.TABLET;
      }
      return DeviceType.UNKNOWN;
    }

    if (deviceFamily.includes('mobile') || 
        deviceFamily.includes('phone') ||
        deviceFamily.includes('android')) {
      return DeviceType.MOBILE;
    }
    
    if (deviceFamily.includes('tablet') || 
        deviceFamily.includes('ipad')) {
      return DeviceType.TABLET;
    }
    
    if (deviceFamily.includes('desktop') || 
        deviceFamily.includes('pc') ||
        deviceFamily === 'other') {
      return DeviceType.DESKTOP;
    }

    return DeviceType.UNKNOWN;
  }

  private static getBrowserType(ua: any): BrowserType {
    const browserFamily = ua.family?.toLowerCase() || '';

    if (browserFamily.includes('chrome') && !browserFamily.includes('edge')) {
      return BrowserType.CHROME;
    }
    if (browserFamily.includes('safari') && !browserFamily.includes('chrome')) {
      // Mobile Safari için özel kontrol
      if (browserFamily.includes('mobile') || ua.os?.family?.toLowerCase().includes('ios')) {
        return BrowserType.MOBILE_SAFARI;
      }
      return BrowserType.SAFARI;
    }
    if (browserFamily.includes('firefox')) {
      return BrowserType.FIREFOX;
    }
    if (browserFamily.includes('edge') || browserFamily.includes('edg')) {
      return BrowserType.EDGE;
    }
    if (browserFamily.includes('opera')) {
      return BrowserType.OPERA;
    }
    if (browserFamily.includes('samsung')) {
      return BrowserType.SAMSUNG_BROWSER;
    }
    if (browserFamily.includes('internet explorer') || browserFamily.includes('ie')) {
      return BrowserType.INTERNET_EXPLORER;
    }
    if (browserFamily.includes('uc browser') || browserFamily.includes('ucbrowser')) {
      return BrowserType.UC_BROWSER;
    }

    return BrowserType.UNKNOWN;
  }

  private static getOSType(ua: any): OSType {
    const osFamily = ua.os?.family?.toLowerCase() || '';

    if (osFamily.includes('windows')) {
      return OSType.WINDOWS;
    }
    if (osFamily.includes('mac') || osFamily.includes('os x')) {
      return OSType.MACOS;
    }
    if (osFamily.includes('linux') && !osFamily.includes('android')) {
      return OSType.LINUX;
    }
    if (osFamily.includes('android')) {
      return OSType.ANDROID;
    }
    if (osFamily.includes('ios') || osFamily.includes('iphone') || osFamily.includes('ipad')) {
      return OSType.IOS;
    }
    if (osFamily.includes('chrome os')) {
      return OSType.CHROME_OS;
    }

    return OSType.UNKNOWN;
  }

  private static extractGeoData(ipAddress: string): { country?: string; city?: string } {
    // TODO: Implement with a geolocation service
    // Options: MaxMind GeoIP2, IP-API, ipinfo.io, etc.
    
    // Placeholder implementation
    if (ipAddress === 'UNKNOWN' || ipAddress.startsWith('127.') || ipAddress.startsWith('192.168.')) {
      return { country: undefined, city: undefined };
    }

    return {
      country: undefined, // await geoService.getCountry(ipAddress)
      city: undefined,    // await geoService.getCity(ipAddress)
    };
  }

  // Utility method for future unique visitor detection
  public static generateFingerprint(clickLog: Partial<ClickLog>): string {
    const components = [
      clickLog.ipAddress,
      clickLog.userAgent,
      clickLog.browser,
      clickLog.os,
      clickLog.device
    ].filter(Boolean);

    return Buffer.from(components.join('|')).toString('base64');
  }
}