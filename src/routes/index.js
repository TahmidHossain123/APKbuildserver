const express = require('express');
const router = express.Router();

const healthRoutes = require('./health.routes');
const projectRoutes = require('./project.routes');
const buildRoutes = require('./build.routes');

router.use('/health', healthRoutes);
router.use('/projects', projectRoutes);
router.use('/build', buildRoutes);

module.exports = router;
