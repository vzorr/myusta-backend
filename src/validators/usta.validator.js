// src/validators/usta.validator.js
const Joi = require('joi');

// Respond to invitation validation
const respondToInvitationSchema = Joi.object({
  status: Joi.string()
    .valid('accepted', 'rejected')
    .required()
    .messages({
      'any.only': 'Status must be either accepted or rejected',
      'any.required': 'Status is required'
    }),
  
  message: Joi.string()
    .min(5)
    .max(500)
    .optional()
    .messages({
      'string.base': 'Message must be a string',
      'string.min': 'Message must be at least 5 characters',
      'string.max': 'Message cannot exceed 500 characters'
    }),
  
  alternativeTime: Joi.date()
    .iso()
    .greater('now')
    .optional()
    .when('status', {
      is: 'rejected',
      then: Joi.optional(),
      otherwise: Joi.forbidden()
    })
    .messages({
      'date.base': 'Alternative time must be a valid date',
      'date.format': 'Alternative time must be in ISO format',
      'date.greater': 'Alternative time must be in the future',
      'any.unknown': 'Alternative time can only be provided when rejecting'
    })
});

// Search Ustas query validation
const searchUstasSchema = Joi.object({
  search: Joi.string()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Search term must be at least 2 characters',
      'string.max': 'Search term cannot exceed 100 characters'
    }),
  
  category: Joi.string()
    .optional()
    .messages({
      'string.base': 'Category must be a string'
    }),
  
  latitude: Joi.number()
    .min(-90)
    .max(90)
    .optional()
    .messages({
      'number.min': 'Latitude must be between -90 and 90',
      'number.max': 'Latitude must be between -90 and 90'
    }),
  
  longitude: Joi.number()
    .min(-180)
    .max(180)
    .optional()
    .messages({
      'number.min': 'Longitude must be between -180 and 180',
      'number.max': 'Longitude must be between -180 and 180'
    }),
  
  maxDistance: Joi.number()
    .positive()
    .max(500)
    .optional()
    .messages({
      'number.positive': 'Max distance must be positive',
      'number.max': 'Max distance cannot exceed 500 km'
    }),
  
  minRating: Joi.number()
    .min(1)
    .max(5)
    .optional()
    .messages({
      'number.min': 'Min rating must be at least 1',
      'number.max': 'Min rating cannot exceed 5'
    }),
  
  availability: Joi.boolean()
    .optional(),
  
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
});

// Get top Ustas query validation
const getTopUstasSchema = Joi.object({
  type: Joi.string()
    .valid('top-rated', 'popular')
    .default('top-rated')
    .messages({
      'any.only': 'Type must be either top-rated or popular'
    }),
  
  category: Joi.string()
    .optional(),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .default(10)
    .messages({
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 50'
    })
});

// Get invitations query validation
const getInvitationsSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'accepted', 'rejected', 'expired', 'canceled')
    .optional()
    .messages({
      'any.only': 'Status must be one of: pending, accepted, rejected, expired, canceled'
    }),
  
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10),
  
  sortBy: Joi.string()
    .valid('createdAt', 'preferredTime', 'status')
    .default('createdAt'),
  
  sortOrder: Joi.string()
    .valid('ASC', 'DESC')
    .default('DESC')
});

// UUID parameter validation
const uuidParamSchema = Joi.object({
  id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'ID must be a valid UUID',
      'any.required': 'ID is required'
    })
});

// Update availability validation
const updateAvailabilitySchema = Joi.object({
  location: Joi.object({
    latitude: Joi.number()
      .min(-90)
      .max(90)
      .required(),
    longitude: Joi.number()
      .min(-180)
      .max(180)
      .required(),
    address: Joi.string()
      .required()
  }).optional(),
  
  maxDistance: Joi.number()
    .positive()
    .max(200)
    .optional()
    .messages({
      'number.positive': 'Max distance must be positive',
      'number.max': 'Max distance cannot exceed 200 km'
    }),
  
  budgetAmount: Joi.object({
    min: Joi.number()
      .positive()
      .required(),
    max: Joi.number()
      .positive()
      .greater(Joi.ref('min'))
      .required()
      .messages({
        'number.greater': 'Max budget must be greater than min budget'
      })
  }).optional(),
  
  preferredJobTypes: Joi.array()
    .items(Joi.string())
    .min(1)
    .optional()
}).min(1)
.messages({
  'object.min': 'At least one field must be provided for update'
});

module.exports = {
  respondToInvitationSchema,
  searchUstasSchema,
  getTopUstasSchema,
  getInvitationsSchema,
  uuidParamSchema,
  updateAvailabilitySchema
};