const { errorResponse } = require('../utils/response');
const { logger, logError, logValidationError } = require('../utils/logger');

// Global Error Handler
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const errors = err.errors || [];

  // Log the error
  logError(`${message} | Details: ${errors.join(', ')}`);
  
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
