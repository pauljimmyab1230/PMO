const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

const COLORS = {
  ERROR: '\x1b[31m', // Red
  WARN: '\x1b[33m',  // Yellow
  INFO: '\x1b[36m',  // Cyan
  DEBUG: '\x1b[90m', // Gray
  RESET: '\x1b[0m'
};

const formatMessage = (level, message, meta = null) => {
  const timestamp = new Date().toISOString();
  const color = COLORS[level] || COLORS.RESET;
  let log = `${color}[${timestamp}] ${level}: ${message}${COLORS.RESET}`;
  
  if (meta) {
    log += `\n${JSON.stringify(meta, null, 2)}`;
  }
  
  return log;
};

const logger = {
  error: (message, meta = null) => {
    console.error(formatMessage(LOG_LEVELS.ERROR, message, meta));
  },
  
  warn: (message, meta = null) => {
    console.warn(formatMessage(LOG_LEVELS.WARN, message, meta));
  },
  
  info: (message, meta = null) => {
    console.log(formatMessage(LOG_LEVELS.INFO, message, meta));
  },
  
  debug: (message, meta = null) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(formatMessage(LOG_LEVELS.DEBUG, message, meta));
    }
  }
};

module.exports = logger;
