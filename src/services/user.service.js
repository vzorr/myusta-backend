// Enhanced version of src/services/user.service.js
const { User, ProfessionalDetail, Portfolio, Location, Availability, Job, Contract, Invitation } = require('../models');
const { logger } = require('../utils/logger');
const { Op } = require('sequelize');

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
          include: [
            {
              model: Location,
              as: 'location'
            }
          ]
        }
      ]
    });
    
    if (!usta) {
      return {
        success: false,
        message: 'Usta not found'
      };
    }

    // Calculate additional metrics
    const totalCompletedJobs = await Contract.count({
      where: { ustaId: userId },
      include: [{
        model: Job,
        as: 'job',
        where: { status: 'completed' }
      }]
    });

    const unreadNotifications = await Invitation.count({
      where: { 
        ustaId: userId,
        viewedAt: null,
        status: 'pending'
      }
    });

    // Extract skills from experiences
    const skills = usta.professionalDetail?.experiences?.map(exp => {
      const categoryNames = {
        'plumber': 'Plumbing',
        'electrician': 'Electrical',
        'carpenter': 'Carpentry',
        'cleaner': 'Cleaning',
        'painter': 'Painting'
      };
      return categoryNames[exp.category] || exp.category;
    }) || [];

    // Calculate years of experience (max from all categories)
    const experience = usta.professionalDetail?.experiences?.reduce((max, exp) => 
      Math.max(max, exp.yearsOfExp || 0), 0) || 0;

    // Format response according to API spec
    return {
      success: true,
      message: 'Usta profile fetched successfully',
      data: {
        id: usta.id,
        firstName: usta.firstName,
        lastName: usta.lastName,
        profilePicture: usta.profilePicture,
        bio: usta.professionalDetail?.nipt || '', // Using NIPT as bio temporarily
        aboutMe: `Professional ${skills.join(', ')} specialist with ${experience} years of experience`, // Generated about me
        experience: experience,
        hourlyRate: usta.availability?.budgetAmount?.min || 50, // Default hourly rate
        rating: usta.averageRating || 0,
        totalJobs: totalCompletedJobs,
        skills: skills,
        locations: usta.availability?.location ? [{
          address: usta.availability.location.address || 'Location not specified'
        }] : [],
        notifications: {
          unread: unreadNotifications
        },
        // Additional data for internal use
        phone: usta.phone,
        professionalDetail: usta.professionalDetail,
        portfolios: usta.portfolios,
        availability: usta.availability,
        termsAndConditions: usta.termsAndConditions,
        notificationViaEmail: usta.notificationViaEmail,
        notificationViaSms: usta.notificationViaSms,
        notificationViaApp: usta.notificationViaApp
      }
    };
  } catch (error) {
    logger.error(`Error fetching usta profile: ${error.message}`);
    return { 
      success: false, 
      message: 'Database error while fetching usta profile', 
      errors: [error.message] 
    };
  }
};

const getCustomerProfile = async (userId) => {
  try {
    const customer = await User.findOne({ 
      where: { id: userId, role: 'customer' },
      attributes: [
        'id', 'firstName', 'lastName', 'phone', 'profilePicture', 
        'customerPreferences', 'notificationViaEmail', 'notificationViaSms', 
        'notificationViaApp', 'termsAndConditions'
      ],
      include: [
        {
          model: Location,
          as: 'locations',
          where: { whoseLocation: 'customer' },
          required: false
        }
      ]
    });
    
    if (!customer) {
      return { 
        success: false, 
        message: 'Customer not found' 
      };
    }

    // Count unread invitations/notifications
    const unreadNotifications = await Invitation.count({
      where: { 
        customerId: userId,
        viewedAt: null
      }
    });

    // Generate aboutMe based on preferences
    const aboutMe = customer.customerPreferences?.length > 0
      ? `Looking for professional services in ${customer.customerPreferences.join(', ')}`
      : 'Customer profile';

    // Format response according to API spec
    return { 
      success: true, 
      message: 'Customer profile fetched successfully', 
      data: {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        profilePicture: customer.profilePicture,
        aboutMe: aboutMe,
        locations: customer.locations?.map(loc => ({
          address: loc.address || 'Location not specified'
        })) || [],
        notifications: {
          unread: unreadNotifications
        },
        // Additional data
        phone: customer.phone,
        customerPreferences: customer.customerPreferences,
        notificationViaEmail: customer.notificationViaEmail,
        notificationViaSms: customer.notificationViaSms,
        notificationViaApp: customer.notificationViaApp,
        termsAndConditions: customer.termsAndConditions
      }
    };
  } catch (error) {
    logger.error(`Error fetching customer profile: ${error.message}`);
    return { 
      success: false, 
      message: 'Database error while fetching customer profile', 
      errors: [error.message] 
    };
  }
};

module.exports = {
  getUstaProfile,
  getCustomerProfile
};