const { createLogger, format, transports } = require('winston');

// Create a logger instance
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    new transports.Console()
  ],
});

// Log HTTP requests
const logHttp = (req) => {
  logger.info(`HTTP ${req.method} ${req.originalUrl}`);
};

// Log validation errors
const logValidationError = (error) => {
  logger.warn(`Validation Error: ${error}`);
};

// Log application errors
const logError = (message) => {
  logger.error(`Error: ${message}`);
};


module.exports = {
  logger,
  logHttp,
  logValidationError,
  logError
};
