// src/validators/rating.validator.js
const Joi = require('joi');

// Create rating validation
const createRatingSchema = Joi.object({
  ustaId: Joi.string().uuid().required().messages({
    'string.guid': 'Usta ID must be a valid UUID',
    'any.required': 'Usta ID is required'
  }),
  
  jobId: Joi.string().uuid().optional().messages({
    'string.guid': 'Job ID must be a valid UUID'
  }),
  
  rating: Joi.number().min(1).max(5).required().messages({
    'number.base': 'Rating must be a number',
    'number.min': 'Rating must be at least 1',
    'number.max': 'Rating cannot exceed 5',
    'any.required': 'Rating is required'
  }),
  
  comment: Joi.string().min(10).max(1000).required().messages({
    'string.base': 'Comment must be a string',
    'string.min': 'Comment must be at least 10 characters',
    'string.max': 'Comment cannot exceed 1000 characters',
    'any.required': 'Comment is required'
  }),
  
  // Optional rating dimensions
  serviceSatisfaction: Joi.number().min(1).max(5).optional().messages({
    'number.base': 'Service satisfaction must be a number',
    'number.min': 'Service satisfaction must be at least 1',
    'number.max': 'Service satisfaction cannot exceed 5'
  }),
  
  communication: Joi.number().min(1).max(5).optional().messages({
    'number.base': 'Communication rating must be a number',
    'number.min': 'Communication rating must be at least 1',
    'number.max': 'Communication rating cannot exceed 5'
  }),
  
  timeliness: Joi.number().min(1).max(5).optional().messages({
    'number.base': 'Timeliness rating must be a number',
    'number.min': 'Timeliness rating must be at least 1',
    'number.max': 'Timeliness rating cannot exceed 5'
  }),
  
  valueForMoney: Joi.number().min(1).max(5).optional().messages({
    'number.base': 'Value for money rating must be a number',
    'number.min': 'Value for money rating must be at least 1',
    'number.max': 'Value for money rating cannot exceed 5'
  })
});

// Update rating validation
const updateRatingSchema = Joi.object({
  rating: Joi.number().min(1).max(5).optional().messages({
    'number.base': 'Rating must be a number',
    'number.min': 'Rating must be at least 1',
    'number.max': 'Rating cannot exceed 5'
  }),
  
  comment: Joi.string().min(10).max(1000).optional().messages({
    'string.base': 'Comment must be a string',
    'string.min': 'Comment must be at least 10 characters',
    'string.max': 'Comment cannot exceed 1000 characters'
  }),
  
  serviceSatisfaction: Joi.number().min(1).max(5).optional(),
  communication: Joi.number().min(1).max(5).optional(),
  timeliness: Joi.number().min(1).max(5).optional(),
  valueForMoney: Joi.number().min(1).max(5).optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Get ratings query validation
const getRatingsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  minRating: Joi.number().min(1).max(5).optional(),
  maxRating: Joi.number().min(1).max(5).optional(),
  verified: Joi.boolean().truthy('true').falsy('false').optional(),
  featured: Joi.boolean().truthy('true').falsy('false').optional()
});

// Respond to rating validation
const respondToRatingSchema = Joi.object({
  response: Joi.string().min(10).max(500).required().messages({
    'string.base': 'Response must be a string',
    'string.min': 'Response must be at least 10 characters',
    'string.max': 'Response cannot exceed 500 characters',
    'any.required': 'Response is required'
  })
});

module.exports = {
  createRatingSchema,
  updateRatingSchema,
  getRatingsQuerySchema,
  respondToRatingSchema
};