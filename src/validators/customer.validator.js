// src/validators/customer.validator.js
const Joi = require('joi');

// Invite Usta validation
const inviteUstaSchema = Joi.object({
  message: Joi.string()
    .min(10)
    .max(500)
    .optional()
    .messages({
      'string.base': 'Message must be a string',
      'string.min': 'Message must be at least 10 characters',
      'string.max': 'Message cannot exceed 500 characters'
    }),
  
  jobId: Joi.string()
    .uuid()
    .optional()
    .messages({
      'string.guid': 'Job ID must be a valid UUID'
    }),
  
  time: Joi.date()
    .iso()
    .greater('now')
    .optional()
    .messages({
      'date.base': 'Time must be a valid date',
      'date.format': 'Time must be in ISO format',
      'date.greater': 'Preferred time must be in the future'
    })
}).or('message', 'jobId') // At least one of message or jobId must be provided
.messages({
  'object.missing': 'Either message or jobId must be provided'
});

// Cancel invitation validation
const cancelInvitationSchema = Joi.object({
  reason: Joi.string()
    .min(5)
    .max(200)
    .optional()
    .messages({
      'string.base': 'Reason must be a string',
      'string.min': 'Reason must be at least 5 characters',
      'string.max': 'Reason cannot exceed 200 characters'
    })
});

// Get invitations query validation
const getInvitationsQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
  
  status: Joi.string()
    .valid('pending', 'accepted', 'rejected', 'expired', 'canceled')
    .optional()
    .messages({
      'any.only': 'Status must be one of: pending, accepted, rejected, expired, canceled'
    }),
  
  startDate: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.base': 'Start date must be a valid date',
      'date.format': 'Start date must be in ISO format'
    }),
  
  endDate: Joi.date()
    .iso()
    .greater(Joi.ref('startDate'))
    .optional()
    .messages({
      'date.base': 'End date must be a valid date',
      'date.format': 'End date must be in ISO format',
      'date.greater': 'End date must be after start date'
    }),
  
  sortBy: Joi.string()
    .valid('createdAt', 'preferredTime', 'status')
    .default('createdAt')
    .messages({
      'any.only': 'Sort by must be one of: createdAt, preferredTime, status'
    }),
  
  sortOrder: Joi.string()
    .valid('ASC', 'DESC')
    .default('DESC')
    .messages({
      'any.only': 'Sort order must be either ASC or DESC'
    })
});

// Get recommended Ustas query validation
const getRecommendedUstasSchema = Joi.object({
  category: Joi.string()
    .optional()
    .messages({
      'string.base': 'Category must be a string'
    }),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .default(10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 50'
    }),
  
  excludeUstaIds: Joi.array()
    .items(Joi.string().uuid())
    .optional()
    .messages({
      'array.base': 'Exclude Usta IDs must be an array',
      'string.guid': 'Each Usta ID must be a valid UUID'
    })
});

// UUID parameter validation (for path params)
const uuidParamSchema = Joi.object({
  id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'ID must be a valid UUID',
      'any.required': 'ID is required'
    })
});



// Update customer preferences validation
const updatePreferencesSchema = Joi.object({
  categories: Joi.array()
    .items(Joi.string())
    .min(1)
    .optional()
    .messages({
      'array.base': 'Categories must be an array',
      'array.min': 'At least one category must be selected'
    }),
  
  maxDistance: Joi.number()
    .positive()
    .max(100)
    .optional()
    .messages({
      'number.base': 'Max distance must be a number',
      'number.positive': 'Max distance must be positive',
      'number.max': 'Max distance cannot exceed 100 km'
    }),
  
  notificationViaEmail: Joi.boolean()
    .optional(),
  
  notificationViaSms: Joi.boolean()
    .optional(),
  
  notificationViaApp: Joi.boolean()
    .optional()
}).min(1)
.messages({
  'object.min': 'At least one preference must be provided'
});

module.exports = {
  inviteUstaSchema,
  cancelInvitationSchema,
  getInvitationsQuerySchema,
  getRecommendedUstasSchema,
  uuidParamSchema,
  updatePreferencesSchema
};