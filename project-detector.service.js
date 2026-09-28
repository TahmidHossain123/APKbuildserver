const path = require('path');
const fs = require('fs-extra');
const fileUtils = require('../utils/file-utils');
const logger = require('../utils/logger');

const projectDetectorService = {
  detectProjectType: async (projectDir) => {
    logger.info(`Detecting project structure in: ${projectDir}`);

    const gradleFiles = await fileUtils.findFileRecursively(projectDir, 'build.gradle');
    const settingsGradleFiles = await fileUtils.findFileRecursively(projectDir, 'settings.gradle');
    const gradleKtsFiles = await fileUtils.findFileRecursively(projectDir, 'build.gradle.kts');

    if (gradleFiles.length > 0 || settingsGradleFiles.length > 0 || gradleKtsFiles.length > 0) {
      let androidRoot = projectDir;
      if (settingsGradleFiles.length > 0) {
        androidRoot = path.dirname(settingsGradleFiles[0]);
      } else if (gradleFiles.length > 0) {
        androidRoot = path.dirname(gradleFiles[0]);
      }

      logger.info(`Detected native Android project at: ${androidRoot}`);
      return {
        type: 'ANDROID',
        rootDir: androidRoot
      };
    }

    const indexHtmlFiles = await fileUtils.findFileRecursively(projectDir, 'index.html');
    if (indexHtmlFiles.length > 0) {
      const webRoot = path.dirname(indexHtmlFiles[0]);
      logger.info(`Detected HTML/Web project with entry point at: ${indexHtmlFiles[0]}`);
      return {
        type: 'WEB',
        rootDir: webRoot
      };
    }

    logger.warn(`Unable to determine project structure for: ${projectDir}`);
    return {
      type: 'UNKNOWN',
      rootDir: projectDir
    };
  }
};

module.exports = projectDetectorService;
