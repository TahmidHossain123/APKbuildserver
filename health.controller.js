const fs = require('fs-extra');
const { execSync } = require('child_process');
const androidConfig = require('../config/android.config');

const healthController = {
  checkHealth: async (req, res) => {
    let sdkStatus = 'NOT_FOUND';
    let javaStatus = 'NOT_FOUND';

    try {
      if (await fs.pathExists(androidConfig.sdkPath)) {
        sdkStatus = 'AVAILABLE';
      }
    } catch {
      sdkStatus = 'ERROR';
    }

    try {
      execSync('java -version', { stdio: 'ignore' });
      javaStatus = 'AVAILABLE';
    } catch {
      javaStatus = 'UNAVAILABLE';
    }

    res.status(200).json({
      success: true,
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      toolchain: {
        androidSdk: sdkStatus,
        java: javaStatus
      }
    });
  }
};

module.exports = healthController;
