// infrastructure/queues/QueueManager.ts
import { Queue, Worker, Job } from 'bullmq';
import { RedisClient } from '../redis/RedisClient';

// Job handler interface
export interface JobHandler {
  handle(data: any): Promise<void>;
}

// Queue configuration
export interface QueueConfig {
  concurrency?: number;
  attempts?: number;
  backoff?: {
    type: 'exponential' | 'fixed';
    delay: number;
  };
  repeat?: {
    cron?: string;
    every?: number;
  };
}

export class QueueManager {
  private static queues: Map<string, Queue> = new Map();
  private static workers: Map<string, Worker> = new Map();
  private static handlers: Map<string, JobHandler> = new Map();

  // Yeni queue oluştur
  public static createQueue(
    name: string, 
    handler: JobHandler, 
    config: QueueConfig = {}
  ): void {
    const connection = RedisClient.getInstance();

    // Queue oluştur
    const queue = new Queue(name, { connection });
    this.queues.set(name, queue);

    // Handler'ı kaydet
    this.handlers.set(name, handler);

    // Worker oluştur
    const worker = new Worker(name, async (job: Job) => {
      const jobHandler = this.handlers.get(name);
      if (!jobHandler) {
        throw new Error(`No handler found for queue: ${name}`);
      }
      
      console.log(`🔄 Processing ${name} job: ${job.id}`);
      await jobHandler.handle(job.data);
    }, {
      connection,
      concurrency: config.concurrency || 5
    });

    // Worker events
    worker.on('completed', (job) => {
      console.log(`✅ ${name} job completed: ${job.id}`);
    });

    worker.on('failed', (job, err) => {
      console.error(`❌ ${name} job failed: ${job?.id}`, err.message);
    });

    this.workers.set(name, worker);
    console.log(`✅ Queue '${name}' created with handler`);
  }

  // Job ekle
  public static async addJob(
    queueName: string, 
    data: any, 
    options: {
      delay?: number;
      attempts?: number;
      repeat?: { cron?: string; every?: number };
    } = {}
  ): Promise<void> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue '${queueName}' not found`);
    }

    const jobOptions: any = {
      attempts: options.attempts || 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    };

    if (options.delay) jobOptions.delay = options.delay;
    if (options.repeat) jobOptions.repeat = options.repeat;

    await queue.add(`${queueName}-job`, data, jobOptions);
    console.log(`📝 Job added to '${queueName}' queue`);
  }

  // Tüm queue'ları başlat
  public static initialize(): void {
    console.log('🚀 Queue Manager initialized');
  }

  // Queue statistics
  public static async getQueueStats(): Promise<Record<string, any>> {
    const stats: Record<string, any> = {};

    for (const [name, queue] of this.queues.entries()) {
      const waiting = await queue.getWaiting();
      const active = await queue.getActive();
      const completed = await queue.getCompleted();
      const failed = await queue.getFailed();

      stats[name] = {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length
      };
    }

    return stats;
  }

  // Temizlik
  public static async shutdown(): Promise<void> {
    console.log('🛑 Shutting down queues and workers...');
    
    for (const worker of this.workers.values()) {
      await worker.close();
    }
    
    for (const queue of this.queues.values()) {
      await queue.close();
    }
    
    this.queues.clear();
    this.workers.clear();
    this.handlers.clear();
    
    console.log('✅ Queue Manager shut down');
  }
}