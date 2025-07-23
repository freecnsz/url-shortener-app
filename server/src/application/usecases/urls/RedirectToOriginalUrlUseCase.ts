// application/usecases/urls/RedirectToOriginalUrlUseCase.ts
import { IUrlRepository } from "../../../domain/interfaces/repositories/IUrlRepository";
import { RawRequestDto } from "../../dtos/urls/RawRequest";
import { RedirectRequestDto } from "../../dtos/urls/RedirectRequestDto";
import { RedisClient } from "../../../infrastructure/redis/RedisClient";
import { QueueManager } from "../../../infrastructure/queues/QueueManager";
import { QueueNames } from "../../../infrastructure/queues/QueueNames";

export class RedirectToOriginalUrlUseCase {
  constructor(
    private readonly urlRepository: IUrlRepository
  ) {}

  public async execute(
    request: RedirectRequestDto,
    rawRequest: RawRequestDto
  ): Promise<string | null> {
    const shortCode = request.shortCode;
    const cacheKey = `url:${shortCode}`;
    const notFoundKey = `notfound:${shortCode}`;

    try {
      // 1. Önce "not found" cache'ini kontrol et (çok hızlı eliminate)
      const isNotFound = await RedisClient.get(notFoundKey);
      if (isNotFound) {
        console.log(`🚫 Known not found: ${shortCode}`);
        return null;
      }

      // 2. Redis cache'den URL'yi al
      let urlData = await RedisClient.getJSON<any>(cacheKey);

      if (urlData) {
        console.log(`🚀 Cache hit for: ${shortCode}`);
        
        // Aktiflik kontrolü
        if (!urlData.isActive) {
          return null;
        }

        // 🔥 HEMEN REDIRECT - Background processing
        this.processClickInBackground(shortCode, rawRequest, urlData);
        
        return urlData.originalUrl;
      }

      // 3. Cache miss - DB'den getir
      console.log(`💾 Cache miss, fetching from DB: ${shortCode}`);
      urlData = await this.urlRepository.findByShortCodeAsync(shortCode);

      if (!urlData || !urlData.isActive) {
        // Not found cache (1 dakika)
        await RedisClient.set(notFoundKey, "1", 60);
        return null;
      }

      // 4. URL'yi cache'le (1 saat)
      await RedisClient.setJSON(cacheKey, urlData, 3600);

      // 5. 🔥 HEMEN REDIRECT - Background processing
      this.processClickInBackground(shortCode, rawRequest, urlData);

      return urlData.originalUrl;

    } catch (error) {
      console.error(`❌ Error in redirect for ${shortCode}:`, error);

      // Fallback: Cache'siz direct DB query
      try {
        const urlData = await this.urlRepository.findByShortCodeAsync(shortCode);
        if (urlData && urlData.isActive) {
          // Hata olsa bile background processing yap
          this.processClickInBackground(shortCode, rawRequest, urlData);
          return urlData.originalUrl;
        }
      } catch (dbError) {
        console.error("❌ Database fallback failed:", dbError);
      }

      return null;
    }
  }

  /**
   * 🔥 Background Click Processing - Non-blocking
   * Redirect response'unu bekletmesin, hemen dönsün
   */
  private processClickInBackground(
    shortCode: string, 
    rawRequest: RawRequestDto, 
    urlData: any
  ): void {
    // Fire and forget - queue'ya at
    QueueManager.addJob(QueueNames.ProcessClick, {
      shortCode,
      rawRequest,
      urlData // URL verisini de gönder, tekrar DB query olmasın
    }).catch(error => {
      console.error(`❌ Failed to queue click processing for ${shortCode}:`, error);
    });

    console.log(`🔄 Click processing queued for: ${shortCode}`);
  }

  /**
   * Click statistics - hızlı Redis'ten al
   */
  public async getClickStats(shortCode: string): Promise<{
    total: number;
    lastClick?: Date;
  }> {
    try {
      const clickCountKey = `clicks:${shortCode}`;
      const lastClickKey = `lastclick:${shortCode}`;

      const [totalClicks, lastClickTimestamp] = await Promise.all([
        RedisClient.get(clickCountKey),
        RedisClient.get(lastClickKey),
      ]);

      return {
        total: parseInt(totalClicks || "0"),
        lastClick: lastClickTimestamp
          ? new Date(parseInt(lastClickTimestamp))
          : undefined,
      };
    } catch (error) {
      console.error("❌ Error getting click stats:", error);
      return { total: 0 };
    }
  }
}