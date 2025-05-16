// src/controllers/customer.controller.js
const customerService = require('../services/customer.service');
const { successResponse, errorResponse } = require('../utils/response');
const { logger } = require('../utils/logger');

// Send invitation to Usta (moved from usta.controller.js)
exports.inviteUsta = async (req, res, next) => {
  try {
    const ustaId = req.params.id;
    const customerId = req.user.id;
    const { message, jobId, time } = req.body;
    
    const result = await customerService.inviteUsta(ustaId, customerId, { message, jobId, time });
    
    if (!result.success) {
      return errorResponse(res, result.message, result.errors, 400);
    }
    
    return successResponse(res, 'Invitation sent successfully', result.data);
  } catch (error) {
    logger.error(`Error in inviteUsta: ${error.message}`);
    return next({ statusCode: 500, message: 'Internal server error' });
  }
};

// Get invitations sent by customer
exports.getCustomerInvitations = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    
    const result = await customerService.getCustomerInvitations(customerId);
    
    if (!result.success) {
      return errorResponse(res, result.message, result.errors, 400);
    }
    
    return successResponse(res, 'Customer invitations fetched successfully', result.data);
  } catch (error) {
    logger.error(`Error in getCustomerInvitations: ${error.message}`);
    return next({ statusCode: 500, message: 'Internal server error' });
  }
};

//removed viewUstaProfile