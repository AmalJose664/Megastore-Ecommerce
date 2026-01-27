import app from './app';
import config from './config/env';
import connectDatabase from './config/database';

const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Start server
    const server = app.listen(config.port, () => {
      console.log(`
        ╔════════════════════════════════════════════╗
        ║ 🚀 E-commerce Backend Server Started       ║
        ╠════════════════════════════════════════════╣
        ║ Environment: ${config.nodeEnv.padEnd(28)}  ║
        ║ Port: ${String(config.port).padEnd(35)}      ║
        ║ API Version: ${config.apiVersion.padEnd(28)} ║
        ║ URL: http://localhost:${config.port.toString().padEnd(20)} ║
        ╚════════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      console.log(`
${signal} received. Starting graceful shutdown...`);

      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle unhandled rejections
    process.on('unhandledRejection', (err: Error) => {
      console.error('Unhandled Rejection:', err);
      gracefulShutdown('UNHANDLED_REJECTION');
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err: Error) => {
      console.error('Uncaught Exception:', err);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();