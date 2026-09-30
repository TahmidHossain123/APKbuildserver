const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const ROOT_DIR = path.resolve(__dirname, '../../');

const appConfig = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  
  paths: {
    root: ROOT_DIR,
    uploads: path.join(ROOT_DIR, 'uploads'),
    builds: path.join(ROOT_DIR, 'builds'),
    buildOutputs: path.join(ROOT_DIR, 'build-outputs'),
    temp: path.join(ROOT_DIR, 'temp'),
    workspaces: path.join(ROOT_DIR, 'workspaces')
  },

  upload: {
    maxFileSize: (parseInt(process.env.MAX_UPLOAD_SIZE_MB, 10) || 100) * 1024 * 1024,
    allowedMimeTypes: [
      'application/zip',
      'application/x-zip-compressed',
      'multipart/x-zip'
    ]
  },

  build: {
    timeoutMs: parseInt(process.env.BUILD_TIMEOUT_MS, 10) || 600000,
    maxConcurrentBuilds: parseInt(process.env.MAX_CONCURRENT_BUILDS, 10) || 1
  },

  rateLimit: {
    windowMs: 15 * 60 * 1000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100
  }
};

module.exports = appConfig;
