import express from 'express';
import helmet from 'helmet';
import { setupRoutes } from '../presentation/routes';
import { setupMiddleware } from '../presentation/middleware';
import { QueueManager } from '../infrastructure/queues/QueueManager';
import { FullShortCodePoolJobHandler } from '../infrastructure/queues/handlers/FullShortCodePoolJobHandler';
import { ProcessClickJobHandler } from '../infrastructure/queues/handlers/ProcessClickJobHandler';
import { QueueNames } from '../infrastructure/queues/QueueNames';
import { ProcessUserLoginJobHandler } from '../infrastructure/queues/handlers/ProcessUserLoginJobHandler';

export const createServer = async (): Promise<express.Application> => {
  const app = express();
  console.log('🚀 Initializing server...');

  // CORS - Manuel olarak tüm istekleri kabul et
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    // Preflight requests için
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });
  console.log('🌍 CORS middleware applied - All origins allowed');

  // Security
  app.use(helmet());
  console.log('🔒 Security middleware (Helmet) applied');

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  console.log('📦 Body parsing middleware applied');



  // Routes
  setupRoutes(app);
  console.log('🛣️ Routes setup completed');

  // Middleware (error handling)
  setupMiddleware(app);
  console.log('⚙️ Middleware setup completed');

  // Initialize queues
  await setupQueues();
  console.log('🎯 Queue manager initialized');

  return app;
};

export async function setupQueues() {
  // Initialize queue manager
  QueueManager.initialize();

  // 3. Short Code Pool Refill Queue - Pool doldurma işlemleri
  QueueManager.createQueue(QueueNames.FullShortCodePool, new FullShortCodePoolJobHandler(), {
    concurrency: 1, // Tek seferde bir tane çalışsın, concurrent pool filling olmasın
    attempts: 2,
    backoff: {
      type: 'fixed',
      delay: 5000
    }
  });
  console.log('✅ Short Code Pool Queue registered');

  // 4. Process Click Queue - Background click processing (En yüksek öncelik)
  QueueManager.createQueue(QueueNames.ProcessClick, new ProcessClickJobHandler(), {
    concurrency: 15, // Click processing hızlı olsun
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    }
  });
  console.log('✅ Process Click Queue registered');

  // 5. Process Login Update Queue - Background login update işlemleri
  QueueManager.createQueue(QueueNames.ProcessLoginUpdate, new ProcessUserLoginJobHandler(), {
    concurrency: 5, // Login update işlemleri için yeterli concurrency
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    }
  });

  // 5. İlk pool fill job'ını tetikle (server start'ta)
  await triggerInitialPoolFill();

  console.log('🎯 All queues registered successfully');
}

/**
 * Server başlangıcında pool'u doldur
 */
async function triggerInitialPoolFill(): Promise<void> {
  try {
    // İlk pool durumunu kontrol et
    const { ShortCodePoolMonitor } = await import('../infrastructure/redis/redisServices/ShortCodePoolMonitor');
    const monitor = ShortCodePoolMonitor.getInstance();
    const stats = await monitor.getPoolStats();
    
    console.log(`📊 Initial pool stats: ${stats.currentSize}/${stats.maxSize}`);
    
    if (stats.isLow) {
      console.log('🔄 Triggering initial pool fill...');
      await QueueManager.addJob(QueueNames.FullShortCodePool, {});
    } else {
      console.log('✅ Pool is already sufficient');
    }
  } catch (error) {
    console.error('❌ Failed to check initial pool status:', error);
    // Hata olsa bile pool fill job'ını tetikle
    await QueueManager.addJob(QueueNames.FullShortCodePool, {});
  }
}
