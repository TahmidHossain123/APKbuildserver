const express = require('express');
const router = express.Router();
const buildController = require('../controllers/build.controller');

router.post('/:id', buildController.triggerBuild);
router.get('/:id/status', buildController.getBuildStatus);
router.get('/:id/logs', buildController.getBuildLogs);
router.get('/:id/download', buildController.downloadApk);

module.exports = router;
