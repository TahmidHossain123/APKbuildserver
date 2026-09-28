const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs-extra');
const logger = require('./logger');

const zipExtractor = {
  extractSafe: async (zipFilePath, destinationDir) => {
    try {
      await fs.ensureDir(destinationDir);

      const resolvedDestDir = path.resolve(destinationDir);
      const zip = new AdmZip(zipFilePath);
      const zipEntries = zip.getEntries();

      for (const entry of zipEntries) {
        const entryPath = entry.entryName;
        const targetPath = path.resolve(resolvedDestDir, entryPath);

        // Security Check: Zip Slip protection
        if (!targetPath.startsWith(resolvedDestDir + path.sep) && targetPath !== resolvedDestDir) {
          throw new Error(`Security Violation: Zip Slip / Path Traversal detected in entry: "${entryPath}"`);
        }

        if (entry.isDirectory) {
          await fs.ensureDir(targetPath);
        } else {
          const parentDir = path.dirname(targetPath);
          await fs.ensureDir(parentDir);
          await fs.writeFile(targetPath, entry.getData());
        }
      }

      logger.info(`Successfully and securely extracted archive to: ${resolvedDestDir}`);
      return resolvedDestDir;
    } catch (error) {
      logger.error(`Error during ZIP extraction of ${zipFilePath}:`, error);
      throw error;
    }
  }
};

module.exports = zipExtractor;
