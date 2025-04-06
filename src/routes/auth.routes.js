const express = require('express');
const router = express.Router();
const authController = require('./../controllers/auth.controller');
const validate = require('../middlewares/validate');
const authenticate = require('../middlewares/authentication');
const { loginSchema, signupSchema, roleSelectionSchema, forgotPasswordSchema, verifyOTPSchema, resendOTPSchema, resetPasswordSchema } = require('../validators/auth.validation');

// Login Route
router.post('/login', validate(loginSchema), authController.login);

// Sign-Up Route
router.post('/signup', validate(signupSchema), authController.signup);

// Signup Verification Route
router.post('/signup-verify', authenticate, validate(verifyOTPSchema), authController.signupVerify);

// Signup Resend OTP Route
router.post('/signup-resend', authenticate, authController.signupResend);

// Role Selection Route
router.post('/select-role',authenticate, validate(roleSelectionSchema), authController.selectRole);

// Forgot Password (Request OTP)
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);

// Verify OTP
router.post('/verify-otp', validate(verifyOTPSchema), authController.verifyForgotOTP);

// Resend OTP
router.post('/resend-otp', validate(resendOTPSchema), authController.resendForgotOTP);

// Reset Password
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);



module.exports = router;
