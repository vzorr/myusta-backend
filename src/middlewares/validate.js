const { errorResponse } = require('../utils/response');
const { logValidationError } = require('../utils/logger');

// Joi Validation Middleware
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errors = error.details.map((detail) => {
      // Handle the "not allowed" error separately
      if (detail.type === 'object.unknown') {
      return `${detail.context.key} is not allowed`;
    }
    return detail.message;
    });
    logValidationError(errors.join(', '));
    return errorResponse(res, 'Validation error', errors, 400);
  }

  req.body = value;
  next();
};

module.exports = validate;
