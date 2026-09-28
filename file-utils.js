const fs = require('fs-extra');
const path = require('path');
const logger = require('./logger');

const fileUtils = {
  ensureDir: async (dirPath) => {
    try {
      await fs.ensureDir(dirPath);
    } catch (error) {
      logger.error(`Failed to ensure directory exists: ${dirPath}`, error);
      throw error;
    }
  },

  pathExists: async (targetPath) => {
    try {
      return await fs.pathExists(targetPath);
    } catch {
      return false;
    }
  },

  removeSafe: async (targetPath) => {
    try {
      if (await fs.pathExists(targetPath)) {
        await fs.remove(targetPath);
        logger.debug(`Safely removed path: ${targetPath}`);
      }
    } catch (error) {
      logger.warn(`Failed to cleanly remove path: ${targetPath}`, error.message);
    }
  },

  findFileRecursively: async (dir, targetFileName) => {
    let results = [];
    
    if (!(await fs.pathExists(dir))) {
      return results;
    }

    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        const nestedResults = await fileUtils.findFileRecursively(fullPath, targetFileName);
        results = results.concat(nestedResults);
      } else if (entry.isFile() && entry.name === targetFileName) {
        results.push(fullPath);
      }
    }

    return results;
  },

  copyDir: async (srcDir, destDir) => {
    try {
      await fs.copy(srcDir, destDir, { overwrite: true });
    } catch (error) {
      logger.error(`Failed to copy directory from ${srcDir} to ${destDir}`, error);
      throw error;
    }
  },

  getFileStats: async (filePath) => {
    try {
      const stats = await fs.stat(filePath);
      return {
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        isFile: stats.isFile()
      };
    } catch (error) {
      logger.error(`Failed to get file stats for: ${filePath}`, error);
      throw error;
    }
  }
};

module.exports = fileUtils;
