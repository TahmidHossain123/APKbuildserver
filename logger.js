const formatTimestamp = () => {
  return new Date().toISOString();
};

const logger = {
  info: (message, meta = '') => {
    const metaStr = meta ? ` | ${typeof meta === 'object' ? JSON.stringify(meta) : meta}` : '';
    console.log(`[${formatTimestamp()}] [INFO] ${message}${metaStr}`);
  },

  warn: (message, meta = '') => {
    const metaStr = meta ? ` | ${typeof meta === 'object' ? JSON.stringify(meta) : meta}` : '';
    console.warn(`[${formatTimestamp()}] [WARN] ${message}${metaStr}`);
  },

  error: (message, error = null) => {
    let errorDetails = '';
    if (error instanceof Error) {
      errorDetails = ` | ${error.message}\n${error.stack}`;
    } else if (error) {
      errorDetails = ` | ${typeof error === 'object' ? JSON.stringify(error) : error}`;
    }
    console.error(`[${formatTimestamp()}] [ERROR] ${message}${errorDetails}`);
  },

  debug: (message, meta = '') => {
    if (process.env.NODE_ENV !== 'production') {
      const metaStr = meta ? ` | ${typeof meta === 'object' ? JSON.stringify(meta) : meta}` : '';
      console.debug(`[${formatTimestamp()}] [DEBUG] ${message}${metaStr}`);
    }
  }
};

module.exports = logger;
