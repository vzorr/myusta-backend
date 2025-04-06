const Joi = require("joi");


const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Invalid email format.',
    'any.required': 'Email is required.',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long.',
    'any.required': 'Password is required.',
  }),
});


// Custom validation for phone numbers (basic international format)
// const phoneRegex = /^[0-9]{10,15}$/;

const signupSchema = Joi.object({
  // Validate the presence of both fields first
  signupMethod: Joi.string().required().valid("email", "phone").messages({
    "any.only": "signupMethod must be either email or phone.",
    "any.required": "signupMethod is required.",
  }),

  identifier: Joi.string().required().messages({
    "any.required": "identifier is required.",
  })
    .when("signupMethod", {
      switch: [
        {
          is: "email",
          then: Joi.string().email().messages({
            "string.email": "identifier must be a valid email.",
          }),
        },
        {
          is: "phone",
          then: Joi.string()
            .pattern(/^[0-9]{10,15}$/) // Adjust regex as needed for phone validation
            .messages({
              "string.pattern.base": "identifier must be a valid phone number.",
            }),
        },
      ],
    })
});

const verifyOTPSchema = Joi.object({
  code: Joi.string().length(4).required(),
});

const roleSelectionSchema = Joi.object({
  role: Joi.string().valid("usta", "customer").required(),
});

module.exports = { signupSchema, verifyOTPSchema, roleSelectionSchema, loginSchema };
