const { User } = require('../models');
const { logger } = require('../utils/logger');

const getAllUsers = async () => {
  try {
    const users = await User.findAll();
    return { success: true, data: users };
  } catch (error) {
    logger.error(`Error fetching users: ${error.message}`);
    return { success: false, message: 'Database error while fetching users', errors: [error.message] };
  }
};

const createUser = async (userData) => {
  try {
    logger.info('Creating a new user in the database');
    const newUser = await User.create(userData);
    return { success: true, data: newUser };
  } catch (error) {
    logger.error(`Error creating user: ${error.message}`);
    return { success: false, message: 'Database error while creating user', errors: [error.message] };
  }
};

const getUserById = async (id) => {
  try {
    logger.info(`Fetching user with ID: ${id}`);
    const user = await User.findByPk(id);
    if (!user) {
      logger.warn(`User not found with ID: ${id}`);
      return { success: false, statusCode: 404, message: 'User not found' };
    }
    return { success: true, data: user };
  } catch (error) {
    logger.error(`Error fetching user by ID: ${error.message}`);
    return { success: false, message: 'Database error while fetching user', errors: [error.message] };
  }
};

module.exports = {
  getAllUsers,
  createUser,
  getUserById,
};
