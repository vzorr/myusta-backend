// src/controllers/usta.controller.js (Updated)
const ustaService = require('../services/usta.service');
const { successResponse, errorResponse } = require('../utils/response');
const { logger } = require('../utils/logger');

// Search and filter Ustas
exports.searchUstas = async (req, res, next) => {
  try {
    const { 
      search, category, latitude, longitude, 
      maxDistance, minRating, availability,
      page, limit 
    } = req.query;

    const result = await ustaService.searchUstas({
      search, category, latitude, longitude,
      maxDistance, minRating, availability,
      page, limit
    });

    if (!result.success) {
      return errorResponse(res, result.message, result.errors, 400);
    }

    return successResponse(res, 'Ustas retrieved successfully', result.data);
  } catch (error) {
    logger.error(`Error in searchUstas: ${error.message}`);
    return next({ statusCode: 500, message: 'Internal server error' });
  }
};

// Get top-rated or popular Ustas
exports.getTopUstas = async (req, res, next) => {
  try {
    const { type = 'top-rated', category, limit = 10 } = req.query;
    
    const result = await ustaService.getTopUstas(type, category, limit);
    
    if (!result.success) {
      return errorResponse(res, result.message, result.errors, 400);
    }
    
    return successResponse(res, `${type} Ustas retrieved successfully`, result.data);
  } catch (error) {
    logger.error(`Error in getTopUstas: ${error.message}`);
    return next({ statusCode: 500, message: 'Internal server error' });
  }
};

// Get pending invitations for a Usta
exports.getUstaInvitations = async (req, res, next) => {
  try {
    const ustaId = req.user.id;
    const { status } = req.query;
    
    const result = await ustaService.getUstaInvitations(ustaId, status);
    
    if (!result.success) {
      return errorResponse(res, result.message, result.errors, 400);
    }
    
    return successResponse(res, 'Invitations retrieved successfully', result.data);
  } catch (error) {
    logger.error(`Error in getUstaInvitations: ${error.message}`);
    return next({ statusCode: 500, message: 'Internal server error' });
  }
};

// Respond to an invitation (accept/reject)
exports.respondToInvitation = async (req, res, next) => {
  try {
    const invitationId = req.params.id;
    const ustaId = req.user.id;
    const { status, message, alternativeTime } = req.body;
    
    const result = await ustaService.respondToInvitation(invitationId, ustaId, {
      status,
      message,
      alternativeTime
    });
    
    if (!result.success) {
      return errorResponse(res, result.message, result.errors, result.statusCode || 400);
    }
    
    return successResponse(res, `Invitation ${status}`, result.data);
  } catch (error) {
    logger.error(`Error in respondToInvitation: ${error.message}`);
    return next({ statusCode: 500, message: 'Internal server error' });
  }
};

// Get Usta profile (accessible by both customers and ustas)
exports.getUstaProfile = async (req, res, next) => {
  try {
    const ustaId = req.params.id;
    const userId = req.user.id;
    
    const result = await ustaService.getUstaProfile(ustaId, userId);
    
    if (!result.success) {
      return errorResponse(res, result.message, result.errors, result.statusCode || 404);
    }
    
    return successResponse(res, 'Usta profile fetched successfully', result.data);
  } catch (error) {
    logger.error(`Error in getUstaProfile: ${error.message}`);
    return next({ statusCode: 500, message: 'Internal server error' });
  }
};