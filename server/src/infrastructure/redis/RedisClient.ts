import { Redis } from 'ioredis';

export class RedisClient {
  private static instance: Redis | null = null;

  public static getInstance(): Redis {
    if (!RedisClient.instance) {
      RedisClient.instance = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || undefined,
        db: parseInt(process.env.REDIS_DB || '0', 10),
        lazyConnect: true,
        maxRetriesPerRequest: null, // BullMQ için gerekli
      });

      // Connection events
      RedisClient.instance.on('connect', () => {
        console.log('✅ Redis connected successfully');
      });

      RedisClient.instance.on('error', (err) => {
        console.error('❌ Redis connection error:', err);
      });
    }

    return RedisClient.instance;
  }

  // Basit cache methods
  public static async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const client = RedisClient.getInstance();
    if (ttlSeconds) {
      await client.setex(key, ttlSeconds, value);
    } else {
      await client.set(key, value);
    }
  }

  public static async get(key: string): Promise<string | null> {
    const client = RedisClient.getInstance();
    return await client.get(key);
  }

  public static async del(key: string): Promise<void> {
    const client = RedisClient.getInstance();
    await client.del(key);
  }

  // Counter için (click sayısı)
  public static async increment(key: string): Promise<number> {
    const client = RedisClient.getInstance();
    return await client.incr(key);
  }

  // JSON objeler için
  public static async setJSON(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const jsonString = JSON.stringify(value);
    await RedisClient.set(key, jsonString, ttlSeconds);
  }

  public static async getJSON<T>(key: string): Promise<T | null> {
    const jsonString = await RedisClient.get(key);
    if (!jsonString) return null;
    try {
      return JSON.parse(jsonString) as T;
    } catch {
      return null;
    }
  }

  public static async disconnect(): Promise<void> {
    if (RedisClient.instance) {
      RedisClient.instance.disconnect();
      RedisClient.instance = null;
    }
  }
}