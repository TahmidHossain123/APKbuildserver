const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const logger = require('../utils/logger');
const androidConfig = require('../config/android.config');
const appConfig = require('../config/app.config');
const fileUtils = require('../utils/file-utils');

const gradleRunnerService = {
  ensureGradleWrapper: async (projectDir, logCallback) => {
    const gradlewPath = path.join(projectDir, 'gradlew');
    const gradlewExists = await fs.pathExists(gradlewPath);

    if (!gradlewExists) {
      logCallback('[STEP] Gradle wrapper missing. Generating wrapper using system Gradle...');
      try {
        execSync('gradle wrapper', {
          cwd: projectDir,
          env: androidConfig.getBuildEnvironment(),
          stdio: 'pipe'
        });
        logCallback('[SUCCESS] Gradle wrapper generated.');
      } catch (err) {
        logCallback(`[WARN] System gradle wrapper fallback: ${err.message}`);
      }
    }

    if (await fs.pathExists(gradlewPath)) {
      await fs.chmod(gradlewPath, '755');
    }
  },

  runAssembleDebug: (projectDir, buildId, logCallback) => {
    return new Promise(async (resolve, reject) => {
      try {
        await gradleRunnerService.ensureGradleWrapper(projectDir, logCallback);

        const gradlewPath = path.join(projectDir, 'gradlew');
        const executable = (await fs.pathExists(gradlewPath)) ? './gradlew' : 'gradle';

        logCallback(`[STEP] Executing command: ${executable} ${androidConfig.gradleArgs.join(' ')}`);

        const child = spawn(executable, androidConfig.gradleArgs, {
          cwd: projectDir,
          env: androidConfig.getBuildEnvironment(),
          shell: true
        });

        let buildTimeoutTimer = setTimeout(() => {
          child.kill('SIGTERM');
          const timeoutErr = new Error(`Build timed out after ${appConfig.build.timeoutMs / 1000} seconds.`);
          logCallback(`[ERROR] ${timeoutErr.message}`);
          reject(timeoutErr);
        }, appConfig.build.timeoutMs);

        child.stdout.on('data', (data) => {
          logCallback(data.toString().trimEnd());
        });

        child.stderr.on('data', (data) => {
          logCallback(`[STDERR] ${data.toString().trimEnd()}`);
        });

        child.on('close', async (exitCode) => {
          clearTimeout(buildTimeoutTimer);

          if (exitCode !== 0) {
            return reject(new Error(`Gradle build failed with exit code ${exitCode}`));
          }

          logCallback('[STEP] Build succeeded. Inspecting build output artifacts...');

          const searchPattern = 'app-debug.apk';
          const foundApks = await fileUtils.findFileRecursively(projectDir, searchPattern);

          if (foundApks.length === 0) {
            return reject(new Error('Exit code 0, but app-debug.apk was not found in outputs!'));
          }

          const rawApkPath = foundApks[0];
          const stats = await fileUtils.getFileStats(rawApkPath);

          if (stats.size === 0) {
            return reject(new Error('Generated APK file is 0 bytes. Build invalid.'));
          }

          const targetBuildOutputDir = path.join(appConfig.paths.buildOutputs, buildId);
          await fs.ensureDir(targetBuildOutputDir);

          const finalApkPath = path.join(targetBuildOutputDir, 'app-debug.apk');
          await fs.copy(rawApkPath, finalApkPath, { overwrite: true });

          logCallback(`[SUCCESS] APK created at: ${finalApkPath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

          resolve({
            apkPath: finalApkPath,
            apkFilename: 'app-debug.apk',
            size: stats.size
          });
        });

        child.on('error', (err) => {
          clearTimeout(buildTimeoutTimer);
          logCallback(`[PROCESS ERROR] Failed to start Gradle: ${err.message}`);
          reject(err);
        });

      } catch (err) {
        logCallback(`[SETUP ERROR] ${err.message}`);
        reject(err);
      }
    });
  }
};

module.exports = gradleRunnerService;
