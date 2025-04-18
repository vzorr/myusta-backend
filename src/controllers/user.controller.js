const userService = require('../services/user.service');
const { successResponse, errorResponse } = require('../utils/response');
const { logger } = require('../utils/logger');

exports.getUstaProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await userService.getUstaProfile(userId);

    if (!result.success) {
      logger.warn(`Failed to fetch Usta profile for user ID: ${userId}`);
      return errorResponse(res, result.message, result.errors, 500);
    }

    logger.info(`Usta profile fetched successfully for user ID: ${userId}`);
    return successResponse(res, 'Usta profile fetched successfully', result.data);
  }
  catch (error) {
    logger.error(`Unexpected error in getUstaProfile: ${error.message}`);
    return next({ statusCode: 500, message: 'Internal server error' });
  }
}

exports.getCustomerProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await userService.getCustomerProfile(userId);

    if (!result.success) {
      logger.warn(`Failed to fetch Customer profile for user ID: ${userId}`);
      return errorResponse(res, result.message, result.errors, 500);
    }

    logger.info(`Customer profile fetched successfully for user ID: ${userId}`);
    return successResponse(res, 'Customer profile fetched successfully', result.data);
  } catch (error) {
    logger.error(`Unexpected error in getCustomerProfile: ${error.message}`);
    return next({ statusCode: 500, message: 'Internal server error' });
  }
};
