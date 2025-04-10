const Joi = require("joi");
const { ROLES } = require("../utils/constant"); // Import roles from constants

// Login Validation
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format.",
    "any.required": "Email is required.",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters long.",
    "any.required": "Password is required.",
  }),
  role: Joi.string()
    .valid(ROLES.CUSTOMER, ROLES.USTA)
    .required()
    .messages({
      "any.only": `Role must be either '${ROLES.CUSTOMER}' or '${ROLES.USTA}'.`,
      "any.required": "Role is required.",
    }),
});

// Signup Validation
const signupSchema = Joi.object({
  signupMethod: Joi.string().required().valid("email", "phone", "google", "facebook").messages({
    "any.only": "signupMethod must be either email, phone, google, or facebook.",
    "any.required": "signupMethod is required.",
  }),
  identifier: Joi.string()
    .required()
    .messages({
      "any.required": "Identifier is required.",
    })
    .when("signupMethod", {
      switch: [
        {
          is: "email",
          then: Joi.string().email().messages({
            "string.email": "Identifier must be a valid email.",
          }),
        },
        {
          is: "phone",
          then: Joi.string()
            .pattern(/^[0-9]{10,15}$/)
            .messages({
              "string.pattern.base": "Identifier must be a valid phone number.",
            }),
        },
        {
          is: "google",
          then: Joi.string().messages({
            "string.base": "Identifier must be a valid Google ID.",
          }),
        },
        {
          is: "facebook",
          then: Joi.string().messages({
            "string.base": "Identifier must be a valid Facebook ID.",
          }),
        }
      ],
    }),
  role: Joi.string()
    .valid(ROLES.CUSTOMER, ROLES.USTA)
    .required()
    .messages({
      "any.only": `Role must be either '${ROLES.CUSTOMER}' or '${ROLES.USTA}'.`,
      "any.required": "Role is required.",
    }),
});

// Role Selection Validation
const roleSelectionSchema = Joi.object({
  role: Joi.string()
    .valid(ROLES.CUSTOMER, ROLES.USTA)
    .required()
    .messages({
      "any.only": `Role must be either '${ROLES.CUSTOMER}' or '${ROLES.USTA}'.`,
      "any.required": "Role is required.",
    }),
});

// Forgot Password Validation
const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  role: Joi.string()
    .valid(ROLES.CUSTOMER, ROLES.USTA)
    .required()
    .messages({
      "any.only": `Role must be either '${ROLES.CUSTOMER}' or '${ROLES.USTA}'.`,
      "any.required": "Role is required.",
    }),
});

// Verify OTP Validation
const verifyOTPSchema = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().length(4).required(),
  role: Joi.string()
    .valid(ROLES.CUSTOMER, ROLES.USTA)
    .required()
    .messages({
      "any.only": `Role must be either '${ROLES.CUSTOMER}' or '${ROLES.USTA}'.`,
      "any.required": "Role is required.",
    }),
});

// Resend OTP Validation
const resendOTPSchema = Joi.object({
  email: Joi.string().email().required(),
  role: Joi.string()
    .valid(ROLES.CUSTOMER, ROLES.USTA)
    .required()
    .messages({
      "any.only": `Role must be either '${ROLES.CUSTOMER}' or '${ROLES.USTA}'.`,
      "any.required": "Role is required.",
    }),
});

// Reset Password Validation
const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().length(4).required(),
  newPassword: Joi.string().min(6).required(),
  role: Joi.string()
    .valid(ROLES.CUSTOMER, ROLES.USTA)
    .required()
    .messages({
      "any.only": `Role must be either '${ROLES.CUSTOMER}' or '${ROLES.USTA}'.`,
      "any.required": "Role is required.",
    }),
});

module.exports = {
  signupSchema,
  verifyOTPSchema,
  roleSelectionSchema,
  loginSchema,
  forgotPasswordSchema,
  resendOTPSchema,
  resetPasswordSchema,
};
