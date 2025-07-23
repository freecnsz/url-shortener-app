// application/usecases/urls/CreateShortUrlUseCase.ts
import { randomUUID } from "crypto";
import { Url } from "../../../domain/entities/Url";
import { IUrlRepository } from "../../../domain/interfaces/repositories/IUrlRepository";
import {
  CreateShortUrlRequestDto,
  CreateShortUrlResponseDto,
} from "../../dtos/urls/CreateShortUrlDto";
import { UrlMapper } from "../../mappers/UrlMapper";
import { IShortCodeGeneratorHelper } from "../../../domain/interfaces/helpers/IShorCodeGeneratorHelper";
import { ShortCodePoolMonitor } from "../../../infrastructure/redis/redisServices/ShortCodePoolMonitor";
import { RedisClient } from "../../../infrastructure/redis/RedisClient";

export class CreateShortUrlUseCase {
  constructor(
    private readonly urlRepository: IUrlRepository,
    private readonly shortCodeGenerator: IShortCodeGeneratorHelper
  ) {}

  async execute(
    input: CreateShortUrlRequestDto
  ): Promise<CreateShortUrlResponseDto> {
    
    // URL validation
    if (!this.isValidUrl(input.originalUrl)) {
      throw new Error("Invalid URL format");
    }

    // Pool'dan short code al
    const shortCode = await this.getUniqueShortCode();

    // Create the URL entity
    const urlToCreate = new Url(
      randomUUID(),
      null, // userId - optional
      input.originalUrl,
      shortCode,
      undefined, // customAlias
      undefined, // customDomainId
      undefined, // collectionId
      undefined, // name
      undefined, // description
      0, // clickCount
      undefined, // lastClickedAt
      undefined, // expiresAt
      undefined, // maxClicks
      true, // isActive
      false, // isPasswordProtected
      undefined // passwordHash
    );

    // DB'ye kaydet
    const createdUrl = await this.urlRepository.createAsync(urlToCreate);

    // Cache'e de ekle (1 saat TTL)
    const cacheKey = `url:${shortCode}`;
    await RedisClient.setJSON(cacheKey, createdUrl, 3600);

    // Click counter'ı sıfırla
    const clickCountKey = `clicks:${shortCode}`;
    await RedisClient.set(clickCountKey, '0', 3600 * 24); // 24 saat TTL

    console.log(`✅ URL created with short code: ${shortCode}`);
    return UrlMapper.toShortUrlResponse(createdUrl);
  }

  private async getUniqueShortCode(): Promise<string> {
    const poolMonitor = ShortCodePoolMonitor.getInstance();
    
    // Pool'dan kod almaya çalış
    let shortCode = await poolMonitor.getShortCode();
    
    if (shortCode) {
      console.log('📦 Short code from pool:', shortCode);
      return shortCode;
    }

    // Pool boşsa, fallback olarak anlık üret ve unique kontrol yap
    console.warn('⚠️ Pool is empty, generating fallback short code...');
    return await this.generateFallbackShortCode();
  }

  private async generateFallbackShortCode(): Promise<string> {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const code = await this.shortCodeGenerator.generateShortCode();
      
      // DB'de var mı kontrol et
      const existing = await this.urlRepository.findByShortCodeAsync(code);
      if (!existing) {
        console.log(`🎲 Fallback code generated: ${code} (attempt: ${attempts + 1})`);
        return code;
      }
      
      attempts++;
    }

    throw new Error('Failed to generate unique short code after multiple attempts');
  }

  private isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }
}