const { User, Preference } = require('../models');
const { logger } = require('../utils/logger');
const { ROLES, STATUS, AUTH_PROVIDERS, PREFERRED_JOB_TYPES } = require('../utils/constant');


const getAllPreferences = async () => {
  try {
    const preferences = await Preference.findAll();
    return { success: true, data: preferences };
  } catch (error) {
    logger.error(`Error fetching preferences: ${error.message}`);
    return { success: false, message: 'Database error while fetching preferences', errors: [error.message] };
  }
}

const getMetaData = async () => {
  try {
    const metaData = {
      roles: ROLES ? Object.values(ROLES) : [],
      status: STATUS ? Object.values(STATUS) : [],
      authProviders: AUTH_PROVIDERS ? Object.values(AUTH_PROVIDERS) : [],
      preferredJobTypes: PREFERRED_JOB_TYPES ? Object.values(PREFERRED_JOB_TYPES) : [],
    };

    return { success: true, data: metaData };
  } catch (error) {
    logger.error(`Error fetching meta data: ${error.message}`);
    return { success: false, code: 500, message: 'Database error while fetching meta data', errors: [error.message] };
  }
};


module.exports = {
  getAllPreferences,
  getMetaData,
};
