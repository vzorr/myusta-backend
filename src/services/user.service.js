const { not } = require('joi');
const { User, ProfessionalDetail, Portfolio, Location, Availability } = require('../models');
const { logger } = require('../utils/logger');

const getUstaProfile = async (userId) => {
  try {
    const usta = await User.findOne({
      where: { id: userId, role: 'usta' },
      include: [
        {
          model: ProfessionalDetail,
          as: 'professionalDetail'
        },
        {
          model: Portfolio,
          as: 'portfolios'
        },
        {
          model: Availability,
          as: 'availability', 
          attributes: [ 'id', 'budgetAmount ', 'preferredJobTypes', 'maxDistance' ],
          include: [
            {
              model: Location,
              as: 'location',
              attributes: [ 'address', 'description', 'latitude', 'longitude']
            }
          ]
        },
      ],
    })
    if (!usta) {
      return {
        success: false,
        message: 'Usta not found'
      }
    }

    return {
      success: true,
      message: 'Usta profile fetched successfully',
      data: {
        id: usta.id,
        firstName: usta.firstName,
        lastName: usta.lastName,
        phone: usta.phone,
        profilePicture: usta.profilePicture,
        professionalDetail: usta.professionalDetail ? {
          id: usta.professionalDetail.id,
          nipt: usta.professionalDetail.nipt,
          experiences: usta.professionalDetail.experiences,
          portfolios: usta.portfolios ? usta.portfolios.map(item => {
            return {
              id: item.id,
              title: item.title,
              description: item.description,
              category: item.category,
              media: item.media
            }
          }) : [],
        } : {},
        availability: usta.availability ? usta.availability : {},
        termsAndConditions: usta.termsAndConditions,
        notificationViaEmail: usta.notificationViaEmail,
        notificationViaSms: usta.notificationViaSms,
        notificationViaApp: usta.notificationViaApp
      }
    };

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
    const customer = await User.findOne({ 
      where: { id: userId, role: 'customer' },
      attributes: [ 'id', 'firstName', 'lastName', 'phone', 'profilePicture', 'customerPreferences', 'notificationViaEmail', 'notificationViaSms', 'notificationViaApp', 'termsAndConditions' ],
      include: [
        {
          model: Location,
          as: 'locations',
          where: { whoseLocation: 'customer' },
        }
      ],
    });
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
