import express from 'express';
import helmet from 'helmet';
import { setupSwagger } from './swagger';
import { setupRoutes } from '../presentation/routes';
import { setupMiddleware } from '../presentation/middleware';

export const createServer = (): express.Application => {
  const app = express();
  console.log('🚀 Initializing server...');

  // Security
  app.use(helmet());
  console.log('🔒 Security middleware (Helmet) applied');

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  console.log('📦 Body parsing middleware applied');

  // Swagger
  setupSwagger(app);
  console.log('📚 Swagger documentation setup completed');

  // Routes
  setupRoutes(app);
  console.log('🛣️ Routes setup completed');

  // Middleware (error handling)
  setupMiddleware(app);
  console.log('⚙️ Middleware setup completed');

  return app;
};