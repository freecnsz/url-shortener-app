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

  // CORS configuration for development. It will change in production.
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // Security middleware
  app.use(helmet());

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Setup routes
  setupRoutes(app);

  // Setup error handling middleware
  setupMiddleware(app);

  // Initialize background queues
  await setupQueues();

  return app;
};

export async function setupQueues() {
  QueueManager.initialize();

  // Short code pool refill queue
  QueueManager.createQueue(QueueNames.FullShortCodePool, new FullShortCodePoolJobHandler(), {
    concurrency: 1,
    attempts: 2,
    backoff: {
      type: 'fixed',
      delay: 5000
    }
  });

  // Click processing queue
  QueueManager.createQueue(QueueNames.ProcessClick, new ProcessClickJobHandler(), {
    concurrency: 15,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    }
  });

  // Login update queue
  QueueManager.createQueue(QueueNames.ProcessLoginUpdate, new ProcessUserLoginJobHandler(), {
    concurrency: 5,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    }
  });

  await triggerInitialPoolFill();
}

/**
 * Initialize short code pool on server startup
 */
async function triggerInitialPoolFill(): Promise<void> {
  try {
    const { ShortCodePoolMonitor } = await import('../infrastructure/redis/redisServices/ShortCodePoolMonitor');
    const monitor = ShortCodePoolMonitor.getInstance();
    const stats = await monitor.getPoolStats();
    
    if (stats.isLow) {
      await QueueManager.addJob(QueueNames.FullShortCodePool, {});
    }
  } catch (error) {
    console.error('Failed to check initial pool status:', error);
    await QueueManager.addJob(QueueNames.FullShortCodePool, {});
  }
}
