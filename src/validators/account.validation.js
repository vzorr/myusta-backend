const Joi = require('joi');

const userBasicInfoSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'First name is required.',
    'string.min': 'First name should have at least 2 characters.',
    'string.max': 'First name should not exceed 50 characters.',
  }),
  lastName: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'Last name is required.',
    'string.min': 'Last name should have at least 2 characters.',
    'string.max': 'Last name should not exceed 50 characters.',
  }),
  phoneNumber: Joi.string().pattern(/^[0-9]{10,15}$/).required().messages({
    'string.pattern.base': 'Invalid phone number format.',
    'any.required': 'Phone number is required.',
  }),
  password: Joi.string().min(8).optional().messages({
    'string.min': 'Password should be at least 8 characters long.',
  }),
  imageUrl: Joi.string().optional().messages({
    'string.base': 'Image must be a valid string.',
  }),
});

module.exports = { userBasicInfoSchema };
