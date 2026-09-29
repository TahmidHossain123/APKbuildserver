const app = require('./app');
const appConfig = require('./config/app.config');
const fileUtils = require('./utils/file-utils');
const logger = require('./utils/logger');

async function startServer() {
  try {
    await fileUtils.ensureDir(appConfig.paths.uploads);
    await fileUtils.ensureDir(appConfig.paths.builds);
    await fileUtils.ensureDir(appConfig.paths.buildOutputs);
    await fileUtils.ensureDir(appConfig.paths.temp);
    await fileUtils.ensureDir(appConfig.paths.workspaces);

    const server = app.listen(appConfig.port, () => {
      logger.info(`=======================================================`);
      logger.info(`APK Builder Server running on port ${appConfig.port}`);
      logger.info(`Environment: ${appConfig.env}`);
      logger.info(`Android SDK Location: ${process.env.ANDROID_HOME || '/opt/android-sdk'}`);
      logger.info(`Java Home: ${process.env.JAVA_HOME || '/usr/lib/jvm/java-17-openjdk-amd64'}`);
      logger.info(`=======================================================`);
    });

    const shutdown = async (signal) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed. Exiting process.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to initialize server:', error);
    process.exit(1);
  }
}

startServer();
