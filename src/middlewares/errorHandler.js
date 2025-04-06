const { errorResponse } = require('../utils/response');
const { logger, logError, logValidationError } = require('../utils/logger');

// Global Error Handler
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const errors = Array.isArray(err.errors) ? err.errors : [err.message];

  // Log the error in a more readable format
  if (statusCode >= 400 && statusCode < 500) {
    logValidationError(`Client Error: ${message} | Details: ${errors.join(', ')}`);
  } else {
    logError(`Server Error: ${message} | Details: ${errors.join(', ')}`);
  }

  return errorResponse(res, message, errors, statusCode);
};

// Not Found Handler
const notFoundHandler = (req, res) => {
  const message = `Route not found: ${req.originalUrl}`;
  logger.warn(message);
  return errorResponse(res, message, [], 404);
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
