const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/response');

// User Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    if (!result.success) {
      return errorResponse(res, result.message, result.errors, 401);
    }

    return successResponse(res, result.message, result.data);
  } catch (error) {
    console.error('Error in login:', error);
    return errorResponse(res, 'Error during login', [error.message], 500);
  }
};

exports.signup = async (req, res) => {
  try {
    const result = await authService.signup(req.body);
    if (!result.success) {
      return errorResponse(res, result.message, result.errors, 400);
    }
    return successResponse(res, result.message, result.data, 201);
  } catch (error) {
    return errorResponse(res, 'Error during sign-up', [error.message], 500);
  }
};


exports.signupResend = async (req, res) => {
  try {
    const currentUser = req.user; // Extracted from authenticated user

    const result = await authService.signupResend(currentUser);

    if (!result.success) {
      return errorResponse(res, result.message, result.errors, result.code || 400);
    }

    return successResponse(res, result.message, result.data);
  } catch (error) {
    console.error('Error in signupResend:', error);
    return errorResponse(res, 'Error during OTP resend', [error.message], 500);
  }
};



exports.signupVerify = async (req, res) => {
  try {
    const { code } = req.body;
    const { id: userId, authProvider } = req.user; // Extracted from the authenticated user

    const result = await authService.signupVerify({userId, code, authProvider});

    if (!result.success) {
      return errorResponse(res, result.message, result.errors, 401);
    }

    return successResponse(res, result.message, result.data);
  } catch (error) {
    return errorResponse(res, 'Error during OTP verification', [error.message], 500);
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const { userId, type } = req.body;
    const result = await authService.resendOTP(userId, type);
    if (!result.success) {
      return errorResponse(res, result.message, result.errors, 400);
    }
    return successResponse(res, 'OTP resent successfully', result.data);
  } catch (error) {
    return errorResponse(res, 'Error during OTP resending', [error.message], 500);
  }
};

exports.selectRole = async (req, res) => {
  try {
    const { role } = req.body;
    const { id: userId } = req.user; // Extracted from the authenticated user
    const result = await authService.selectRole(userId, role);
    if (!result.success) {
      return errorResponse(res, result.message, result.errors, 400);
    }
    return successResponse(res, 'Role selected successfully', result.data);
  } catch (error) {
    return errorResponse(res, 'Error during role selection', [error.message], 500);
  }
};
