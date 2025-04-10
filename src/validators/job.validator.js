// src/validators/job.validator.js
const Joi = require('joi');
const { PREFRENCES } = require('../utils/constant');

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

  category: Joi.string().valid(...Object.values(PREFRENCES)).required().messages({
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

  startDate: Joi.date().greater('now').required().messages({
    'date.base': 'Start date must be a valid date',
    'date.greater': 'Start date must be in the future',
    'any.required': 'Start date is required',
  }),

  endDate: Joi.date().greater(Joi.ref('start_date')).required().messages({
    'date.base': 'End date must be a valid date',
    'date.greater': 'End date must be after start date',
    'any.required': 'End date is required',
  }),

  materials: Joi.string().allow('').optional().messages({
    'string.base': 'Materials must be a string',
  }),

  location: Joi.string().required().messages({
    'string.base': 'Location must be a string',
    'string.empty': 'Location is required',
    'any.required': 'Location is required',
  }),

  budget: Joi.number().positive().optional().messages({
    'number.base': 'Budget must be a number',
    'number.positive': 'Budget must be a positive number',
  }),

  images: Joi.array().items(Joi.string().base64()).max(10).optional().messages({
    'array.base': 'Images must be an array',
    'array.max': 'Maximum 10 images allowed',
    'string.base64': 'Each image must be a valid base64 string'
  })
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

  category: Joi.string().valid(...Object.values(PREFRENCES)).messages({
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

  startDate: Joi.date().greater('now').messages({
    'date.base': 'Start date must be a valid date',
    'date.greater': 'Start date must be in the future',
  }),

  endDate: Joi.date().greater(Joi.ref('start_date')).messages({
    'date.base': 'End date must be a valid date',
    'date.greater': 'End date must be after start date',
  }),

  materials: Joi.string().allow('').messages({
    'string.base': 'Materials must be a string',
  }),

  location: Joi.string().messages({
    'string.base': 'Location must be a string',
  }),

  budget: Joi.number().positive().messages({
    'number.base': 'Budget must be a number',
    'number.positive': 'Budget must be a positive number',
  }),

  status: Joi.string().valid('pending', 'active', 'completed').messages({
    'string.base': 'Status must be a string',
    'any.only': 'Status must be either "pending", "active", or "completed"',
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