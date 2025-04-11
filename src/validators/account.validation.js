const Joi = require('joi');
const { PREFRENCES } = require('../utils/constant');

const customerAccountSchema = Joi.object({
  basicInfo: Joi.object({
    firstName: Joi.string().required().messages({ 'any.required': 'First name is required.' }),
    lastName: Joi.string().required().messages({ 'any.required': 'Last name is required.' }),
    phoneNumber: Joi.string().pattern(/^[0-9]{10,15}$/).required().messages({
      'string.pattern.base': 'Phone number must be 10-15 digits.',
      'any.required': 'Phone number is required.',
    }),
    password: Joi.string().pattern(
      new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{8,}$")
    ).messages({
      "string.pattern.base": "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
    }).optional(),
    profilePicture: Joi.string().uri().optional(),
  }).required(),

  location: Joi.array().items(
    Joi.object({
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
      address: Joi.string().optional(),
    })
  ).optional(),

  customerPreferences: Joi.array().items(Joi.string().valid(...Object.values(PREFRENCES))).optional().messages({
    'array.base': 'Customer preferences must be an array',
    'any.only': 'Each preference must be one of the predefined categories'
  }),
  notificationViaEmail: Joi.boolean().optional(),
  notificationViaSms: Joi.boolean().optional(),
  notificationViaApp: Joi.boolean().optional(),
  termsAndConditions: Joi.boolean().required().messages({
    'any.required': 'Terms and conditions must be accepted.',
  }),
});

const ustaAccountSchema = Joi.object({
  basicInfo: Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phoneNumber: Joi.string().pattern(/^[0-9]{10,15}$/).required(),
    password: Joi.string().pattern(
      new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{8,}$")
    ).messages({
      "string.pattern.base": "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
    }).optional(),
    profilePicture: Joi.string().uri().optional(),
  }).required(),

  professionalDetail: Joi.object({
    nipt: Joi.string().optional(),
    experiences: Joi.array().items(
      Joi.object({
        category: Joi.string().valid(...Object.values(PREFRENCES)).required().messages({
          'any.only': 'Category must be one of the predefined categories'
        }),
        yearsOfExp: Joi.number().integer().min(0).max(50).required(),
      })
    ).optional(),
    portfolio: Joi.array().items(
      Joi.object({
        title: Joi.string().max(80).required(),
        description: Joi.string().max(600).required(),
        category: Joi.string().valid(...Object.values(PREFRENCES)).required().messages({
          'any.only': 'Category must be one of the predefined categories'
        }),
        media: Joi.array().items(
          Joi.object({
            type: Joi.string().valid('image', 'video').required(),
            url: Joi.string().uri().required(),
          })
        ).optional(),
      })
    ).optional(),
  }).required(),

  availability: Joi.object({
    location: Joi.object({
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
      address: Joi.string().required(),
    }).required(),
    maxDistance: Joi.number().integer().required(),
    budgetAmount: Joi.object({
      min: Joi.number().required(),
      max: Joi.number().required(),
    }).required(),
    preferredJobTypes: Joi.array().items(Joi.string()).optional(),
  }).required(),

  notificationViaEmail: Joi.boolean().optional(),
  notificationViaSms: Joi.boolean().optional(),
  notificationViaApp: Joi.boolean().optional(),
  termsAndConditions: Joi.boolean().required(),
});

module.exports = { customerAccountSchema, ustaAccountSchema };
