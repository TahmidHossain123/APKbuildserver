const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs-extra');
const appConfig = require('../config/app.config');
const projectController = require('./project.controller');
const buildQueue = require('../services/build-queue.service');
const webviewScaffoldService = require('../services/webview-scaffold.service');
const gradleRunnerService = require('../services/gradle-runner.service');
const fileUtils = require('../utils/file-utils');

const buildController = {
  triggerBuild: async (req, res, next) => {
    const { id: projectId } = req.params;
    const project = projectController.getProjectInstance(projectId);

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const buildId = uuidv4();
    const buildWorkspace = path.join(appConfig.paths.workspaces, `build-${buildId}`);

    const buildTask = async (logCallback) => {
      try {
        await fs.ensureDir(buildWorkspace);
        let runnableAndroidDir = project.rootDir;

        if (project.type === 'WEB') {
          logCallback('[STEP] Web project detected. Starting WebView Android scaffolding...');
          runnableAndroidDir = await webviewScaffoldService.scaffoldProject(
            project.rootDir,
            buildWorkspace,
            { appName: project.appName, packageName: project.packageName }
          );
          logCallback('[SUCCESS] Scaffold successfully generated.');
        }

        logCallback('[STEP] Executing Gradle debug compilation pipeline...');
        const result = await gradleRunnerService.runAssembleDebug(runnableAndroidDir, buildId, logCallback);
        
        return result;
      } finally {
        await fileUtils.removeSafe(buildWorkspace);
      }
    };

    const queuedInfo = buildQueue.enqueue(buildId, buildTask);

    res.status(202).json({
      success: true,
      projectId,
      buildId,
      status: queuedInfo.status,
      message: 'Build triggered and queued.'
    });
  },

  getBuildStatus: (req, res) => {
    const { id: buildId } = req.params;
    const statusInfo = buildQueue.getBuildStatus(buildId);

    if (!statusInfo) {
      return res.status(404).json({ success: false, error: 'Build ID not found' });
    }

    if (statusInfo.status === 'SUCCESS') {
      return res.status(200).json({
        success: true,
        buildId,
        status: statusInfo.status,
        startedAt: statusInfo.startedAt,
        completedAt: statusInfo.completedAt,
        apk: {
          filename: statusInfo.result.apkFilename,
          sizeBytes: statusInfo.result.size,
          downloadUrl: `/api/build/${buildId}/download`
        }
      });
    }

    if (statusInfo.status === 'FAILED') {
      return res.status(200).json({
        success: false,
        buildId,
        status: statusInfo.status,
        error: statusInfo.error,
        startedAt: statusInfo.startedAt,
        completedAt: statusInfo.completedAt
      });
    }

    res.status(200).json({
      success: true,
      buildId,
      status: statusInfo.status,
      startedAt: statusInfo.startedAt
    });
  },

  getBuildLogs: (req, res) => {
    const { id: buildId } = req.params;
    const statusInfo = buildQueue.getBuildStatus(buildId);

    if (!statusInfo) {
      return res.status(404).json({ success: false, error: 'Build ID not found' });
    }

    res.setHeader('Content-Type', 'text/plain');
    res.send(statusInfo.logs.join('\n'));
  },

  downloadApk: async (req, res) => {
    const { id: buildId } = req.params;
    const expectedApkPath = path.join(appConfig.paths.buildOutputs, buildId, 'app-debug.apk');

    if (!(await fs.pathExists(expectedApkPath))) {
      return res.status(404).json({
        success: false,
        error: 'APK not found. Build may have failed or not completed yet.'
      });
    }

    res.download(expectedApkPath, 'app-debug.apk');
  }
};

module.exports = buildController;
