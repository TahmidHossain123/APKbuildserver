const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  logger.error(`Unhandled Error: ${err.message}`, err);

  const statusCode = err.status || err.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
}

module.exports = errorHandler;
