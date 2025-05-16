// src/controllers/usta.controller.js
const ustaService = require('../services/usta.service');
const { successResponse, errorResponse } = require('../utils/response');

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
    return next({ statusCode: 500, message: 'Internal server error' });
  }
};

// Send invitation to Usta
exports.inviteUsta = async (req, res, next) => {
  try {
    const ustaId = req.params.id;
    const customerId = req.user.id;
    const { message, jobId, time } = req.body;
    
    const result = await ustaService.inviteUsta(ustaId, customerId, { message, jobId, time });
    
    if (!result.success) {
      return errorResponse(res, result.message, result.errors, 400);
    }
    
    return successResponse(res, 'Invitation sent successfully', result.data);
  } catch (error) {
    return next({ statusCode: 500, message: 'Internal server error' });
  }
};