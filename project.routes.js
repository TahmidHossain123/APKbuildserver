const express = require('express');
const router = express.Router();
const uploadMiddleware = require('../middleware/upload.middleware');
const projectController = require('../controllers/project.controller');

router.post('/', uploadMiddleware.single('file'), projectController.createProject);
router.get('/:id', projectController.getProject);
router.delete('/:id', projectController.deleteProject);

module.exports = router;
