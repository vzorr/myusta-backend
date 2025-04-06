const { createLogger, format, transports } = require('winston');

// Create a logger instance
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.errors({ stack: true }), // Include stack trace in error logs
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message, stack }) => {
      // If there's a stack trace, include it in the log
      return stack 
        ? `[${timestamp}] ${level.toUpperCase()}: ${message} - ${stack}`
        : `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [new transports.Console()],
});

// Log HTTP requests
const logHttp = (req) => {
  logger.info(`HTTP ${req.method} ${req.originalUrl}`);
};

// Log validation errors
const logValidationError = (error) => {
  logger.warn(`Validation Error: ${error}`);
};

// Log application errors with full stack trace
const logError = (error) => {
  // If error is an object with a stack trace, log it
  if (error instanceof Error) {
    logger.error(`${error.message}`, { stack: error.stack });
  } else {
    // Log plain text or non-error objects
    logger.error(`Error: ${error}`);
  }
};

module.exports = {
  logger,
  logHttp,
  logValidationError,
  logError
};
