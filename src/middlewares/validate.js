const { errorResponse } = require('../utils/response');
const { logValidationError } = require('../utils/logger');

// Joi Validation Middleware
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errors = error.details.map((detail) => {
      // Custom handling for "not allowed" errors
      if (detail.type === 'object.unknown') {
        return `${detail.context.key} is not allowed`;
      }
      return detail.message;
    });

    // Log the validation errors
    logValidationError(`Validation Failed: ${errors.join(', ')}`);

    // Return error response
    return errorResponse(res, 'Validation error', errors, 400);
  }

  // Replace request body with validated and sanitized value
  req.body = value;
  next();
};

module.exports = validate;
