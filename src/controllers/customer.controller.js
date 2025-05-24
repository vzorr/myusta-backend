// src/controllers/customer.controller.js
const customerService = require('../services/customer.service');
const { successResponse, errorResponse } = require('../utils/response');
const { logger } = require('../utils/logger');

// Send invitation to Usta
exports.inviteUsta = async (req, res, next) => {
  try {
    const ustaId = req.params.id;
    const customerId = req.user.id;
    const { message, jobId, time } = req.body;
    
    logger.info(`Customer ${customerId} initiating invitation to Usta ${ustaId}`, {
      jobId: jobId || 'direct-invitation',
      hasMessage: !!message,
      preferredTime: time
    });
    
    const result = await customerService.inviteUsta(ustaId, customerId, { message, jobId, time });
    
    if (!result.success) {
      logger.warn(`Failed to send invitation from customer ${customerId} to usta ${ustaId}: ${result.message}`);
      return errorResponse(res, result.message, result.errors, result.statusCode || 400);
    }
    
    logger.info(`Invitation sent successfully from customer ${customerId} to usta ${ustaId}`, {
      invitationId: result.data.invitationId
    });
    
    return successResponse(res, 'Invitation sent successfully', result.data);
  } catch (error) {
    logger.error(`Error in inviteUsta: ${error.message}`, { stack: error.stack });
    return next({ statusCode: 500, message: 'Internal server error' });
  }
};

// Get invitations sent by customer
exports.getCustomerInvitations = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const queryParams = req.query;
    
    logger.info(`Fetching invitations for customer ${customerId}`);
    
    const result = await customerService.getCustomerInvitations(customerId, queryParams);
    
    if (!result.success) {
      logger.warn(`Failed to fetch invitations for customer ${customerId}: ${result.message}`);
      return errorResponse(res, result.message, result.errors, result.statusCode || 400);
    }
    
    logger.info(`Successfully fetched invitations for customer ${customerId}`, {
      totalCount: result.data.totalCount
    });
    
    return successResponse(res, 'Customer invitations fetched successfully', result.data);
  } catch (error) {
    logger.error(`Error in getCustomerInvitations: ${error.message}`, { stack: error.stack });
    return next({ statusCode: 500, message: 'Internal server error' });
  }
};

// Cancel an invitation
exports.cancelInvitation = async (req, res, next) => {
  try {
    const invitationId = req.params.id;
    const customerId = req.user.id;
    const { reason } = req.body;
    
    logger.info(`Customer ${customerId} attempting to cancel invitation ${invitationId}`);
    
    const result = await customerService.cancelInvitation(invitationId, customerId, reason);
    
    if (!result.success) {
      logger.warn(`Failed to cancel invitation ${invitationId}: ${result.message}`);
      return errorResponse(res, result.message, result.errors, result.statusCode || 400);
    }
    
    logger.info(`Invitation ${invitationId} cancelled successfully`);
    return successResponse(res, 'Invitation cancelled successfully', result.data);
  } catch (error) {
    logger.error(`Error in cancelInvitation: ${error.message}`, { stack: error.stack });
    return next({ statusCode: 500, message: 'Internal server error' });
  }
};


// Get customer dashboard statistics
exports.getCustomerStats = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    
    logger.info(`Fetching dashboard statistics for customer ${customerId}`);
    
    const result = await customerService.getCustomerStats(customerId);
    
    if (!result.success) {
      logger.warn(`Failed to fetch stats for customer ${customerId}: ${result.message}`);
      return errorResponse(res, result.message, result.errors, result.statusCode || 400);
    }
    
    logger.info(`Stats fetched successfully for customer ${customerId}`);
    return successResponse(res, 'Customer statistics fetched successfully', result.data);
  } catch (error) {
    logger.error(`Error in getCustomerStats: ${error.message}`, { stack: error.stack });
    return next({ statusCode: 500, message: 'Internal server error' });
  }
};

// Get recommended Ustas
exports.getRecommendedUstas = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const { category, limit = 10, excludeUstaIds } = req.query;
    
    logger.info(`Fetching recommended Ustas for customer ${customerId}`);
    
    const result = await customerService.getRecommendedUstas(customerId, { category, limit, excludeUstaIds });
    
    if (!result.success) {
      logger.warn(`Failed to fetch recommended Ustas: ${result.message}`);
      return errorResponse(res, result.message, result.errors, result.statusCode || 400);
    }
    
    logger.info(`Fetched ${result.data.length} recommended Ustas`);
    return successResponse(res, 'Recommended Ustas fetched successfully', result.data);
  } catch (error) {
    logger.error(`Error in getRecommendedUstas: ${error.message}`, { stack: error.stack });
    return next({ statusCode: 500, message: 'Internal server error' });
  }
};

// Update customer preferences
exports.updatePreferences = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const preferences = req.body;
    
    logger.info(`Updating preferences for customer ${customerId}`);
    
    const result = await customerService.updatePreferences(customerId, preferences);
    
    if (!result.success) {
      logger.warn(`Failed to update preferences: ${result.message}`);
      return errorResponse(res, result.message, result.errors, result.statusCode || 400);
    }
    
    logger.info(`Preferences updated successfully for customer ${customerId}`);
    return successResponse(res, 'Preferences updated successfully', result.data);
  } catch (error) {
    logger.error(`Error in updatePreferences: ${error.message}`, { stack: error.stack });
    return next({ statusCode: 500, message: 'Internal server error' });
  }
};

// Get favorite Ustas
exports.getFavoriteUstas = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    
    logger.info(`Fetching favorite Ustas for customer ${customerId}`);
    
    const result = await customerService.getFavoriteUstas(customerId);
    
    if (!result.success) {
      logger.warn(`Failed to fetch favorites: ${result.message}`);
      return errorResponse(res, result.message, result.errors, result.statusCode || 400);
    }
    
    logger.info(`Fetched ${result.data.length} favorite Ustas`);
    return successResponse(res, 'Favorite Ustas fetched successfully', result.data);
  } catch (error) {
    logger.error(`Error in getFavoriteUstas: ${error.message}`, { stack: error.stack });
    return next({ statusCode: 500, message: 'Internal server error' });
  }
};

// Add Usta to favorites
exports.addToFavorites = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const ustaId = req.params.id;
    
    logger.info(`Customer ${customerId} adding Usta ${ustaId} to favorites`);
    
    const result = await customerService.addToFavorites(customerId, ustaId);
    
    if (!result.success) {
      logger.warn(`Failed to add to favorites: ${result.message}`);
      return errorResponse(res, result.message, result.errors, result.statusCode || 400);
    }
    
    logger.info(`Usta ${ustaId} added to favorites successfully`);
    return successResponse(res, 'Added to favorites successfully', result.data);
  } catch (error) {
    logger.error(`Error in addToFavorites: ${error.message}`, { stack: error.stack });
    return next({ statusCode: 500, message: 'Internal server error' });
  }
};

// Remove Usta from favorites
exports.removeFromFavorites = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const ustaId = req.params.id;
    
    logger.info(`Customer ${customerId} removing Usta ${ustaId} from favorites`);
    
    const result = await customerService.removeFromFavorites(customerId, ustaId);
    
    if (!result.success) {
      logger.warn(`Failed to remove from favorites: ${result.message}`);
      return errorResponse(res, result.message, result.errors, result.statusCode || 400);
    }
    
    logger.info(`Usta ${ustaId} removed from favorites successfully`);
    return successResponse(res, 'Removed from favorites successfully', result.data);
  } catch (error) {
    logger.error(`Error in removeFromFavorites: ${error.message}`, { stack: error.stack });
    return next({ statusCode: 500, message: 'Internal server error' });
  }
};