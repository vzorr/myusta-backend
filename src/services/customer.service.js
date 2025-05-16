// src/services/customer.service.js
const { User, Invitation } = require('../models');
const { logError, logger } = require('../utils/logger');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');

exports.inviteUsta = async (ustaId, customerId, inviteData) => {
  try {
    const { message, jobId, time } = inviteData;
    
    // Check if Usta exists
    const usta = await User.findOne({
      where: { id: ustaId, role: 'usta', status: 'active' }
    });
    
    if (!usta) {
      return {
        success: false,
        message: 'Usta not found or inactive',
        errors: ['Usta not found or inactive']
      };
    }

    // Check if customer exists
    const customer = await User.findOne({
      where: { id: customerId, role: 'customer', status: 'active' }
    });

    if (!customer) {
      return {
        success: false,
        message: 'Customer not found or inactive',
        errors: ['Customer not found or inactive']
      };
    }
    
    // Create invitation record
    const invitation = await Invitation.create({
      ustaId,
      customerId,
      jobId,
      message,
      preferredTime: time,
      status: 'pending',
      invitationType: jobId ? 'job-based' : 'direct',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Expires in 7 days
    });
    
    logger.info(`Invitation created: ${invitation.id}`);
    
    return {
      success: true,
      message: 'Invitation sent successfully',
      data: {
        invitationId: invitation.id,
        ustaId,
        customerId,
        message,
        jobId,
        time,
        status: 'pending'
      }
    };
  } catch (error) {
    logError(`Error sending invitation: ${error.message}`);
    return {
      success: false,
      message: 'Error sending invitation',
      errors: [error.message]
    };
  }
};

exports.getCustomerInvitations = async (customerId, query = {}) => {
  try {
    const { page, limit, offset } = getPaginationParams(query);
    
    const { count, rows } = await Invitation.findAndCountAll({
      where: { customerId },
      include: [
        {
          model: User,
          as: 'usta',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
    
    return {
      success: true,
      message: 'Customer invitations fetched successfully',
      data: formatPaginatedResponse({ rows, count }, page, limit)
    };
  } catch (error) {
    logError(`Error fetching customer invitations: ${error.message}`);
    return {
      success: false,
      message: 'Error fetching customer invitations',
      errors: [error.message]
    };
  }
};

//removed viewUstaProfile