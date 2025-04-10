const accountService = require('../services/account.service');
const { successResponse, errorResponse } = require('../utils/response');

// Account Creation or Update
exports.customerAccount = async (req, res) => {
  try {
    const body = req.body;
    const userId = req.user.id;

    const result = await accountService.customerAccountCreation(userId, {
      ...body
    });

    if (!result.success) {
      return errorResponse(res, result.message, result.errors, 400);
    }

    return successResponse(res, result.message, result.data);
  } catch (error) {
    console.error('Error in customerAccount:', error);
    return errorResponse(res, 'Error during account creation/update', [error.message], 500);
  }
};

exports.ustaAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const body = req.body;

    const result = await accountService.ustaAccountCreation(userId, {
      ...body
    });

    if (!result.success) {
      return errorResponse(res, result.message, result.errors, 400);
    }

    return successResponse(res, result.message, result.data);
  } catch (error) {
    console.error('Error in ustaAccount:', error);
    return errorResponse(res, 'Error during account creation/update', [error.message], 500);
  }
};
