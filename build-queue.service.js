const EventEmitter = require('events');
const logger = require('../utils/logger');
const appConfig = require('../config/app.config');

class BuildQueueService extends EventEmitter {
  constructor() {
    super();
    this.queue = [];
    this.activeBuilds = new Map();
    this.buildStates = new Map();
    this.maxConcurrent = appConfig.build.maxConcurrentBuilds;
    this.isProcessing = false;
  }

  enqueue(buildId, taskFunction) {
    const buildInfo = {
      buildId,
      status: 'QUEUED',
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      error: null,
      logs: []
    };

    this.buildStates.set(buildId, buildInfo);
    this.queue.push({ buildId, taskFunction });
    logger.info(`Build ${buildId} enqueued. Queue length: ${this.queue.length}`);

    this.processNext();
    return buildInfo;
  }

  appendLog(buildId, message) {
    const state = this.buildStates.get(buildId);
    if (state) {
      state.logs.push(message);
    }
  }

  getBuildStatus(buildId) {
    return this.buildStates.get(buildId) || null;
  }

  async processNext() {
    if (this.activeBuilds.size >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const { buildId, taskFunction } = this.queue.shift();
    const state = this.buildStates.get(buildId);

    if (!state) return;

    state.status = 'BUILDING';
    state.startedAt = new Date().toISOString();
    this.activeBuilds.set(buildId, state);

    logger.info(`Starting execution for Build: ${buildId}. Active builds: ${this.activeBuilds.size}`);

    try {
      const result = await taskFunction((logMsg) => this.appendLog(buildId, logMsg));
      state.status = 'SUCCESS';
      state.completedAt = new Date().toISOString();
      state.result = result;
      logger.info(`Build ${buildId} completed successfully.`);
    } catch (error) {
      state.status = 'FAILED';
      state.completedAt = new Date().toISOString();
      state.error = error.message || 'Build execution failed';
      logger.error(`Build ${buildId} failed: ${error.message}`);
    } finally {
      this.activeBuilds.delete(buildId);
      this.processNext();
    }
  }
}

const buildQueueInstance = new BuildQueueService();
module.exports = buildQueueInstance;
