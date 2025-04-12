// src/validators/job.validator.js
const Joi = require('joi');
const { ALLOWED_CATEGORY_KEYS } = require('../utils/constant');

const locationSchema = Joi.object({
  address: Joi.string().required().messages({
    'string.base': 'Address must be a string',
    'string.empty': 'Address is required',
    'any.required': 'Address is required',
  }),
  latitude: Joi.number().min(-90).max(90).required().messages({
    'number.base': 'Latitude must be a number',
    'number.min': 'Latitude must be between -90 and 90',
    'number.max': 'Latitude must be between -90 and 90',
    'any.required': 'Latitude is required',
  }),
  longitude: Joi.number().min(-180).max(180).required().messages({
    'number.base': 'Longitude must be a number',
    'number.min': 'Longitude must be between -180 and 180',
    'number.max': 'Longitude must be between -180 and 180',
    'any.required': 'Longitude is required',
  }),
});

const createJobSchema = Joi.object({
  title: Joi.string().min(5).max(100).required().messages({
    'string.base': 'Title must be a string',
    'string.empty': 'Title is required',
    'string.min': 'Title must be at least 5 characters',
    'string.max': 'Title cannot exceed 100 characters',
    'any.required': 'Title is required',
  }),

  description: Joi.string().min(20).max(2000).required().messages({
    'string.base': 'Description must be a string',
    'string.empty': 'Description is required',
    'string.min': 'Description must be at least 20 characters',
    'string.max': 'Description cannot exceed 2000 characters',
    'any.required': 'Description is required',
  }),

  paymentMethod: Joi.string().valid('cash', 'card').required().messages({
    'string.base': 'Payment method must be a string',
    'string.empty': 'Payment method is required',
    'any.only': 'Payment method must be either "cash" or "card"',
    'any.required': 'Payment method is required',
  }),

  category: Joi.string().valid(...ALLOWED_CATEGORY_KEYS).required().messages({
    'string.base': 'Category must be a string',
    'string.empty': 'Category is required',
    'any.only': 'Category must be one of the predefined categories',
    'any.required': 'Category is required',
  }),

  areaSize: Joi.number().positive().optional().messages({
    'number.base': 'Area size must be a number',
    'number.positive': 'Area size must be a positive number',
  }),

  areaType: Joi.string().optional().messages({
    'string.base': 'Area type must be a string',
  }),

  startDate: Joi.date().iso().greater('now').required().messages({
    'date.base': 'Start date must be a valid date in ISO format (YYYY-MM-DD)',
    'date.format': 'Start date must be in ISO format (YYYY-MM-DD)',
    'date.greater': 'Start date must be in the future',
    'any.required': 'Start date is required',
  }),

  endDate: Joi.date().iso().greater(Joi.ref('startDate')).required().messages({
    'date.base': 'End date must be a valid date in ISO format (YYYY-MM-DD)',
    'date.format': 'End date must be in ISO format (YYYY-MM-DD)',
    'date.greater': 'End date must be after start date',
    'any.required': 'End date is required',
  }),

  materials: Joi.string().allow('').optional().messages({
    'string.base': 'Materials must be a string',
  }),

  location: locationSchema.required().messages({
    'object.base': 'Location must be an object with address, latitude, and longitude',
    'any.required': 'Location is required',
  }),

  budget: Joi.number().positive().optional().messages({
    'number.base': 'Budget must be a number',
    'number.positive': 'Budget must be a positive number',
  }),

  images: Joi.array().items(
    Joi.string()
      .pattern(/^data:image\/(jpeg|png|jpg);base64,/)
      .messages({
        'string.pattern.base': 'Images must be valid base64 encoded images (JPEG, PNG, or JPG)',
      })
  ).max(10).optional().messages({
    'array.base': 'Images must be an array',
    'array.max': 'Maximum 10 images allowed',
  }),
});

const updateJobSchema = Joi.object({
  title: Joi.string().min(5).max(100).messages({
    'string.base': 'Title must be a string',
    'string.min': 'Title must be at least 5 characters',
    'string.max': 'Title cannot exceed 100 characters',
  }),

  description: Joi.string().min(20).max(2000).messages({
    'string.base': 'Description must be a string',
    'string.min': 'Description must be at least 20 characters',
    'string.max': 'Description cannot exceed 2000 characters',
  }),

  paymentMethod: Joi.string().valid('fixed', 'hourly').messages({
    'string.base': 'Payment method must be a string',
    'any.only': 'Payment method must be either "fixed" or "hourly"',
  }),

  category: Joi.string().valid(...ALLOWED_CATEGORY_KEYS).messages({
    'string.base': 'Category must be a string',
    'any.only': 'Category must be one of the predefined categories',
  }),

  areaSize: Joi.number().positive().messages({
    'number.base': 'Area size must be a number',
    'number.positive': 'Area size must be a positive number',
  }),

  areaType: Joi.string().messages({
    'string.base': 'Area type must be a string',
  }),

  startDate: Joi.date().iso().greater('now').messages({
    'date.base': 'Start date must be a valid date in ISO format (YYYY-MM-DD)',
    'date.format': 'Start date must be in ISO format (YYYY-MM-DD)',
    'date.greater': 'Start date must be in the future',
  }),

  endDate: Joi.date().iso().greater(Joi.ref('startDate')).messages({
    'date.base': 'End date must be a valid date in ISO format (YYYY-MM-DD)',
    'date.format': 'End date must be in ISO format (YYYY-MM-DD)',
    'date.greater': 'End date must be after start date',
  }),

  materials: Joi.string().allow('').messages({
    'string.base': 'Materials must be a string',
  }),

  location: locationSchema.messages({
    'object.base': 'Location must be an object with address, latitude, and longitude',
  }),

  budget: Joi.number().positive().messages({
    'number.base': 'Budget must be a number',
    'number.positive': 'Budget must be a positive number',
  }),

  status: Joi.string().valid('pending', 'active', 'completed').messages({
    'string.base': 'Status must be a string',
    'any.only': 'Status must be either "pending", "active", or "completed"',
  }),

  images: Joi.array().items(
    Joi.string()
      .pattern(/^data:image\/(jpeg|png|jpg);base64,/)
      .messages({
        'string.pattern.base': 'Images must be valid base64 encoded images (JPEG, PNG, or JPG)',
      })
  ).max(10).optional().messages({
    'array.base': 'Images must be an array',
    'array.max': 'Maximum 10 images allowed',
  }),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

const jobIdSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.base': 'Job ID must be a string',
    'string.guid': 'Job ID must be a valid UUID',
    'any.required': 'Job ID is required',
  }),
});

module.exports = {
  createJobSchema,
  updateJobSchema,
  jobIdSchema,
};