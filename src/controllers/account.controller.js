const accountService = require('../services/account.service');
const { successResponse, errorResponse } = require('../utils/response');

// Account Creation or Update
exports.accountCreation = async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, password, imageUrl } = req.body;
    const userId = req.user.id;

    const result = await accountService.accountCreation(userId, { firstName, lastName, phoneNumber, password, imageUrl });

    if (!result.success) {
      return errorResponse(res, result.message, result.errors, 400);
    }

    return successResponse(res, result.message, result.data);
  } catch (error) {
    console.error('Error in accountCreation:', error);
    return errorResponse(res, 'Error during account creation/update', [error.message], 500);
  }
};
