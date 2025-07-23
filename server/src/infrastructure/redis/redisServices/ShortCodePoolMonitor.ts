// infrastructure/redis/redisServices/ShortCodePoolMonitor.ts
import { RedisClient } from '../RedisClient';
import { QueueManager } from '../../queues/QueueManager';
import { QueueNames } from '../../queues/QueueNames';

interface PoolConfig {
  minThreshold: number;    // Pool bu seviyenin altına düşünce refill tetikle
  maxSize: number;         // Pool maksimum boyutu
  refillSize: number;      // Her defasında kaç kod eklensin
}

export class ShortCodePoolMonitor {
  private static instance: ShortCodePoolMonitor;
  private readonly poolKey = 'shortcode_pool';
  private readonly refillLockKey = 'shortcode_pool_refill_lock';
  
  private readonly config: PoolConfig = {
    minThreshold: 100,
    maxSize: 1000,
    refillSize: 500
  };

  private constructor() {}

  public static getInstance(): ShortCodePoolMonitor {
    if (!ShortCodePoolMonitor.instance) {
      ShortCodePoolMonitor.instance = new ShortCodePoolMonitor();
    }
    return ShortCodePoolMonitor.instance;
  }

  // Pool'dan kod al ve gerekirse refill tetikle
  public async getShortCode(): Promise<string | null> {
    const client = RedisClient.getInstance();
    
    // Pool'dan kod al
    const code = await client.lpop(this.poolKey);
    
    // Pool seviyesini kontrol et
    await this.checkAndTriggerRefill();
    
    return code;
  }

  // Pool seviyesini kontrol et, gerekirse refill job'ı tetikle
  private async checkAndTriggerRefill(): Promise<void> {
    try {
      const currentSize = await this.getPoolSize();
      
      if (currentSize <= this.config.minThreshold) {
        console.log(`⚠️ Pool size is low: ${currentSize}/${this.config.maxSize}`);
        
        // Eş zamanlı refill'i önlemek için lock kullan
        const isLocked = await this.acquireRefillLock();
        if (isLocked) {
          console.log('🔄 Triggering pool refill...');
          await QueueManager.addJob(QueueNames.FullShortCodePool, {});
        }
      }
    } catch (error) {
      console.error('❌ Failed to check pool level:', error);
    }
  }

  // Refill lock sistemi
  private async acquireRefillLock(): Promise<boolean> {
    const client = RedisClient.getInstance();
    const lockDuration = 300; // 5 dakika lock
    
    const result = await client.set(this.refillLockKey, '1', 'EX', lockDuration, 'NX');
    return result === 'OK';
  }

  // Pool istatistikleri
  public async getPoolStats(): Promise<{
    currentSize: number;
    maxSize: number;
    minThreshold: number;
    isLow: boolean;
  }> {
    const currentSize = await this.getPoolSize();
    
    return {
      currentSize,
      maxSize: this.config.maxSize,
      minThreshold: this.config.minThreshold,
      isLow: currentSize <= this.config.minThreshold
    };
  }

  private async getPoolSize(): Promise<number> {
    return await RedisClient.getInstance().llen(this.poolKey);
  }

  // Pool'a manuel kod ekleme (ihtiyaç halinde)
  public async addCodes(codes: string[]): Promise<void> {
    if (codes.length === 0) return;
    const client = RedisClient.getInstance();
    await client.rpush(this.poolKey, ...codes);
    console.log(`📦 Added ${codes.length} codes to pool`);
  }
}