const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs-extra');
const appConfig = require('../config/app.config');
const zipExtractor = require('../utils/zip-extractor');
const projectDetectorService = require('../services/project-detector.service');
const fileUtils = require('../utils/file-utils');

const projectsRegistry = new Map();

const projectController = {
  createProject: async (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'A valid ZIP file is required.' });
    }

    const projectId = uuidv4();
    const uploadedZipPath = req.file.path;
    const projectWorkspaceDir = path.join(appConfig.paths.workspaces, projectId);

    try {
      await fs.ensureDir(projectWorkspaceDir);
      await zipExtractor.extractSafe(uploadedZipPath, projectWorkspaceDir);

      const detection = await projectDetectorService.detectProjectType(projectWorkspaceDir);

      if (detection.type === 'UNKNOWN') {
        await fileUtils.removeSafe(projectWorkspaceDir);
        await fileUtils.removeSafe(uploadedZipPath);
        return res.status(400).json({
          success: false,
          error: 'Unrecognized project structure. Project must contain an Android Gradle structure or an index.html file.'
        });
      }

      const projectData = {
        projectId,
        type: detection.type,
        workspaceDir: projectWorkspaceDir,
        rootDir: detection.rootDir,
        appName: req.body.appName || 'Generated App',
        packageName: req.body.packageName || 'com.apkbuilder.generatedapp',
        createdAt: new Date().toISOString()
      };

      projectsRegistry.set(projectId, projectData);
      await fileUtils.removeSafe(uploadedZipPath);

      res.status(201).json({
        success: true,
        projectId,
        type: detection.type,
        message: 'Project uploaded and ready for build.'
      });
    } catch (err) {
      await fileUtils.removeSafe(projectWorkspaceDir);
      await fileUtils.removeSafe(uploadedZipPath);
      next(err);
    }
  },

  getProject: (req, res) => {
    const { id } = req.params;
    const project = projectsRegistry.get(id);

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    res.status(200).json({
      success: true,
      project: {
        projectId: project.projectId,
        type: project.type,
        appName: project.appName,
        packageName: project.packageName,
        createdAt: project.createdAt
      }
    });
  },

  deleteProject: async (req, res, next) => {
    const { id } = req.params;
    const project = projectsRegistry.get(id);

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    try {
      await fileUtils.removeSafe(project.workspaceDir);
      projectsRegistry.delete(id);

      res.status(200).json({
        success: true,
        message: `Project ${id} and workspace cleaned successfully.`
      });
    } catch (err) {
      next(err);
    }
  },

  getProjectInstance: (id) => projectsRegistry.get(id)
};

module.exports = projectController;
