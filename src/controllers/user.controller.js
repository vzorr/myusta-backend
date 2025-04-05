const userService = require('../services/user.service');
const { successResponse, errorResponse } = require('../utils/response');
const { logger } = require('../utils/logger');

exports.getAllUsers = async (req, res, next) => {
  try {
    const result = await userService.getAllUsers();
    
    if (!result.success) {
      logger.warn(`Failed to fetch users: ${result.message}`);
      return errorResponse(res, result.message, result.errors, 500);
    }

    logger.info('Users fetched successfully');
    return successResponse(res, 'Users fetched successfully', result.data);
  } catch (error) {
    logger.error(`Unexpected error in getAllUsers: ${error.message}`);
    return next({ statusCode: 500, message: 'Internal server error' });
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const userData = req.body;
    const result = await userService.createUser(userData);

    if (!result.success) {
      logger.warn(`Failed to create user: ${result.message}`);
      return errorResponse(res, result.message, result.errors, 500);
    }

    logger.info(`User created successfully with ID: ${result.data.id}`);
    return successResponse(res, 'User created successfully', result.data, 201);
  } catch (error) {
    logger.error(`Unexpected error in createUser: ${error.message}`);
    return next({ statusCode: 500, message: 'Internal server error' });
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await userService.getUserById(id);

    if (!result.success) {
      logger.warn(`User not found with ID: ${id}`);
      return errorResponse(res, result.message, [], result.statusCode || 404);
    }

    logger.info(`User details fetched for ID: ${id}`);
    return successResponse(res, 'User fetched successfully', result.data);
  } catch (error) {
    logger.error(`Unexpected error in getUserById: ${error.message}`);
    return next({ statusCode: 500, message: 'Internal server error' });
  }
};
