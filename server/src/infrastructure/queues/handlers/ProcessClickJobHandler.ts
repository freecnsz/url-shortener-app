// infrastructure/queues/handlers/ProcessClickJobHandler.ts
import { JobHandler } from '../QueueManager';
import { analyticsExtractor } from '../../../utils/analyticsExtractor';
import { IUrlRepository } from '../../../domain/interfaces/repositories/IUrlRepository';
import { RawRequestDto } from '../../../application/dtos/urls/RawRequest';
import { RedisClient } from '../../redis/RedisClient';
import { container } from '../../../di/Container';
import { ClickLog } from '../../../domain/entities/ClickLog';

interface ProcessClickJobData {
  shortCode: string;
  rawRequest: RawRequestDto;
  urlData: any; // URL verisi redirect'ten geliyor
}

export class ProcessClickJobHandler implements JobHandler {
  private readonly urlRepository: IUrlRepository;

  constructor() {
    this.urlRepository = container.getUrlRepository();
  }

  public async handle(data: ProcessClickJobData): Promise<void> {
    const { shortCode, rawRequest, urlData } = data;
    
    if (!urlData || !urlData.id) {
      console.warn(`⚠️ No URL data for ${shortCode}, skipping processing`);
      return;
    }

    const cacheKey = `url:${shortCode}`;
    const clickCountKey = `clicks:${shortCode}`;
    const lastClickKey = `lastclick:${shortCode}`;

    try {
      // 1. Click sayacını artır
      const newClickCount = await RedisClient.increment(clickCountKey);
      console.log(`📊 Click count for ${shortCode}: ${newClickCount}`);

      // 2. Her 10 tıklamada bir DB sync yap (batch update)
      if (newClickCount % 10 === 0) {
        console.log(`🔄 Syncing to DB: ${shortCode} -> ${newClickCount} clicks`);
        
        // URL'yi güncelle
        urlData.clickCount = newClickCount;
        urlData.lastClickedAt = new Date();
        await this.urlRepository.updateAsync(urlData);
        
        // Cache'i de güncelle
        await RedisClient.setJSON(cacheKey, urlData, 3600);
      }

      // 3. Analytics log oluştur ve kaydet
      const clickLog = analyticsExtractor.extractFromRequest(rawRequest);
      clickLog.urlId = urlData.id;
      clickLog.clickedAt = new Date();
      
      // Analytics'i asenkron kaydet (blocking olmasın)
      await this.urlRepository.createClickLogAsync(clickLog as ClickLog);

      // 4. Last click timestamp güncelle
      await RedisClient.set(lastClickKey, Date.now().toString(), 86400); // 24 saat

      console.log(`✅ Click processed for ${shortCode} (count: ${newClickCount})`);

    } catch (error) {
      console.error(`❌ Failed to process click for ${shortCode}:`, error);
      
      // Hata durumunda da en azından click count'u artır
      try {
        await RedisClient.increment(clickCountKey);
        await RedisClient.set(lastClickKey, Date.now().toString(), 86400);
      } catch (fallbackError) {
        console.error(`❌ Fallback click counting also failed:`, fallbackError);
      }
    }
  }
}