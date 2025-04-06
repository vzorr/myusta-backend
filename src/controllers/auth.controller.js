const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/response');

// User Login
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const result = await authService.login(email, password, role);

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

    const { signupMethod, ...others } = req.body;

    if (signupMethod === 'google') {
      const result = await authService.googleSignup({ signupMethod, ...others });
      if (!result.success) {
        return errorResponse(res, result.message, result.errors, 400);
      }
      return successResponse(res, result.message, result.data, 201);
    }

    const result = await authService.signup({ signupMethod, ...others });
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

// Forgot Password - Request OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email, role } = req.body;
    const result = await authService.forgotPassword(email, role);

    if (!result.success) {
      return errorResponse(res, result.message, result.errors, result.code || 400);
    }

    return successResponse(res, result.message, result.data, result.code || 200);
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    return errorResponse(res, 'Error during password reset', [error.message], 500);
  }
};

// Verify OTP
exports.verifyForgotOTP = async (req, res) => {
  try {
    const { email, code, role } = req.body;
    const result = await authService.verifyForgotOTP(email, code, role);

    if (!result.success) {
      return errorResponse(res, result.message, result.errors, 400);
    }

    return successResponse(res, result.message);
  } catch (error) {
    console.error('Error in verifyForgotOTP:', error);
    return errorResponse(res, 'Error verifying OTP', [error.message], 500);
  }
};

// Resend OTP
exports.resendForgotOTP = async (req, res) => {
  try {
    const { email, role } = req.body;
    const result = await authService.resendForgotOTP(email, role);

    if (!result.success) {
      return errorResponse(res, result.message, result.errors, result.code || 400);
    }

    return successResponse(res, result.message, result.data, result.code || 200);
  } catch (error) {
    console.error('Error in resendForgotOTP:', error);
    return errorResponse(res, 'Error resending OTP', [error.message], 500);
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, role, newPassword } = req.body;
    const result = await authService.resetPassword(email, code, role, newPassword);

    if (!result.success) {
      return errorResponse(res, result.message, result.errors, 400);
    }

    return successResponse(res, result.message);
  } catch (error) {
    console.error('Error in resetPassword:', error);
    return errorResponse(res, 'Error resetting password', [error.message], 500);
  }
};
