const generalService = require('../services/general.service');
const { successResponse, errorResponse } = require('../utils/response');

// General controller for handling account-related requests

exports.getAllCategories = async (req, res) => {
  try {
    const { success, data, message, errors } = await generalService.getAllCategories();
    if (success) {
      return successResponse(res, 'Categories retrieved successfully', data);
    } else {
      return errorResponse(res, message, errors);
    }
  } catch (error) {
    return errorResponse(res, 'Internal server error', [error.message]);
  }
}


exports.getMetaData = async (req, res) => {
  try {
    const { success, data, message, errors } = await generalService.getMetaData();
    if (success) {
      return successResponse(res, 'Meta data retrieved successfully', data);
    } else {
      return errorResponse(res, message, errors);
    }
  } catch (error) {
    return errorResponse(res, 'Internal server error', [error.message]);
  }
}

exports.getOtp = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('userId', userId);
    const { success, data, message, errors } = await generalService.getOtp(userId);
    if (success) {
      return successResponse(res, 'OTP retrieved successfully', data);
    } else {
      return errorResponse(res, message, errors);
    }
  } catch (error) {
    return errorResponse(res, 'Internal server error', [error.message]);
  }
}