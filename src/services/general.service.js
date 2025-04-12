const { User, Category, Verification } = require('../models');
const { logger } = require('../utils/logger');
const { ROLES, STATUS, AUTH_PROVIDERS, PREFERRED_JOB_TYPES, CATEGORY, PAYMENT_METHODS, JOB_STATUS } = require('../utils/constant');


const getAllCategories = async () => {
  try {
    const categories = await Category.findAll();
    return { success: true, data: categories };
  } catch (error) {
    logger.error(`Error fetching categories: ${error.message}`);
    return { success: false, message: 'Database error while fetching categories', errors: [error.message] };
  }
}

const getMetaData = async () => {
  try {
    const metaData = {
      roles: ROLES ? Object.values(ROLES) : [],
      status: STATUS ? Object.values(STATUS) : [],
      authProviders: AUTH_PROVIDERS ? Object.values(AUTH_PROVIDERS) : [],
      preferredJobTypes: PREFERRED_JOB_TYPES,
      categories: CATEGORY,
      paymentMethods: PAYMENT_METHODS ? Object.values(PAYMENT_METHODS) : [],
      jobStatus: JOB_STATUS ? Object.values(JOB_STATUS) : []
    };

    return { success: true, data: metaData };
  } catch (error) {
    logger.error(`Error fetching meta data: ${error.message}`);
    return { success: false, code: 500, message: 'Database error while fetching meta data', errors: [error.message] };
  }
};

const getOtp = async (userId) => {
  try {
    const verification = await Verification.findOne({ where: { userId } });
    if (!verification) {
      return { success: false, statusCode: 404, message: 'User not found' };
    }
    return { success: true, msg: 'OTP fetched successfully', data: verification.code };
  } catch (error) {
    logger.error(`Error fetching user by ID: ${error.message}`);
    return { success: false, message: 'Database error while fetching user', errors: [error.message] };
  }
};


module.exports = {
  getAllCategories,
  getMetaData,
  getOtp
};
