import { createServer } from './config/server';
import { container } from './di/Container';

const PORT = process.env.PORT || 3000;

const startApplication = async () => {
  try {
    const prismaClient = container.getPrismaClient();
    await prismaClient.$connect();
    console.log('Database connected successfully');

    const app = await createServer();
    const server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

    const shutdown = async () => {
      console.log('Shutting down server...');
      
      server.close(() => {
        console.log('HTTP server closed');
      });
      
      await container.cleanup();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
};

startApplication();