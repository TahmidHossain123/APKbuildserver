const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const appConfig = require('../config/app.config');

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.ensureDir(appConfig.paths.uploads);
      cb(null, appConfig.paths.uploads);
    } catch (err) {
      cb(err, appConfig.paths.uploads);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
    cb(null, `upload-${uniqueSuffix}.zip`);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== '.zip') {
    return cb(new Error('Only ZIP files are supported for project upload.'), false);
  }
  cb(null, true);
};

const uploadMiddleware = multer({
  storage: storage,
  limits: {
    fileSize: appConfig.upload.maxFileSize
  },
  fileFilter: fileFilter
});

module.exports = uploadMiddleware;
