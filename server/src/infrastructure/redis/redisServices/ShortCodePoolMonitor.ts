import { RedisClient } from '../RedisClient';
import { QueueManager } from '../../queues/QueueManager';
import { QueueNames } from '../../queues/QueueNames';

interface PoolConfig {
  minThreshold: number;   // Minimum threshold to trigger refill
  maxSize: number;        // Maximum pool size
  refillSize: number;     // Number of codes to add during refill
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

  // Get a short code from the pool
  public async getShortCode(): Promise<string | null> {
    const client = RedisClient.getInstance();

    // Get a short code from the pool
    const code = await client.lpop(this.poolKey);

    // Check pool level
    await this.checkAndTriggerRefill();
    
    return code;
  }

  // Check pool level and trigger refill job if necessary
  private async checkAndTriggerRefill(): Promise<void> {
    try {
      const currentSize = await this.getPoolSize();
      
      if (currentSize <= this.config.minThreshold) {
        console.log(`Pool size is low: ${currentSize}/${this.config.maxSize}`);
        
        // Acquire lock to prevent multiple refills
        const isLocked = await this.acquireRefillLock();
        if (isLocked) {
          console.log('Triggering pool refill...');
          await QueueManager.addJob(QueueNames.FullShortCodePool, {});
        }
      }
    } catch (error) {
      console.error('Failed to check pool level:', error);
    }
  }

  // Refill lock system
  private async acquireRefillLock(): Promise<boolean> {
    const client = RedisClient.getInstance();
    const lockDuration = 300; // 5 minutes lock

    const result = await client.set(this.refillLockKey, '1', 'EX', lockDuration, 'NX');
    return result === 'OK';
  }

  // Pool statistics
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

  // Manually add codes to the pool (if needed)
  public async addCodes(codes: string[]): Promise<void> {
    if (codes.length === 0) return;
    const client = RedisClient.getInstance();
    await client.rpush(this.poolKey, ...codes);
    console.log(`Added ${codes.length} codes to pool`);
  }
}