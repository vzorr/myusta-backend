const generalService = require('../services/general.service');
const { successResponse, errorResponse } = require('../utils/response');

// General controller for handling account-related requests

exports.getAllPreferences = async (req, res) => {
  try {
    const { success, data, message, errors } = await generalService.getAllPreferences();
    if (success) {
      return successResponse(res, 'Preferences retrieved successfully', data);
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