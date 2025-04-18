const { User } = require('../models');
const { logger } = require('../utils/logger');

const getUstaProfile = async (userId) => {
  try {
    const usta = await User.findOne({ where: { id: userId, role: 'usta' } });
    if (!usta) {
      return { success: false, message: 'Usta not found' };
    }
    return { success: true, message: 'Usta profile fetched successfully', data: usta };
  } catch (error) {
    logger.error(`Error fetching usta profile: ${error.message}`);
    return { success: false, message: 'Database error while fetching usta profile', errors: [error.message] };
  }
}


const getCustomerProfile = async (userId) => {
  try {
    const customer = await User.findOne({ where: { id: userId, role: 'customer' } });
    if (!customer) {
      return { success: false, message: 'Customer not found' };
    }
    return { success: true, message: 'Customer profile fetched successfully', data: customer };
  } catch (error) {
    logger.error(`Error fetching customer profile: ${error.message}`);
    return { success: false, message: 'Database error while fetching customer profile', errors: [error.message] };
  }
}

module.exports = {
  getUstaProfile,
  getCustomerProfile
};
