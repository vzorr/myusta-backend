// src/controllers/rating.controller.js
const ratingService = require('../services/rating.service');
const { successResponse, errorResponse } = require('../utils/response');
const { logger } = require('../utils/logger');

// Get reviews for authenticated usta
exports.getUserReviews = async (req, res, next) => {
  try {
    const ustaId = req.user.id;
    const queryParams = req.query;
    
    logger.info(`Fetching reviews for authenticated usta: ${ustaId}`);
    const result = await ratingService.getUstaReviews(ustaId, queryParams);

    if (!result.success) {
      logger.warn(`Failed to fetch reviews for usta ${ustaId}: ${result.message}`);
      return errorResponse(res, result.message, result.errors, result.statusCode || 500);
    }

    logger.info(`Successfully fetched ${result.data.totalCount} reviews for usta ${ustaId}`);
    return successResponse(res, 'Reviews fetched successfully', result.data);
  } catch (error) {
    logger.error(`Unexpected error in getUserReviews: ${error.message}`, { stack: error.stack });
    return next({ statusCode: 500, message: 'Internal server error' });
  }
};

// Get reviews for specific usta
exports.getUstaReviews = async (req, res, next) => {
  try {
    const { ustaId } = req.params;
    const queryParams = req.query;
    
    logger.info(`Fetching reviews for usta: ${ustaId}`);
    const result = await ratingService.getUstaReviews(ustaId, queryParams);

    if (!result.success) {
      logger.warn(`Failed to fetch reviews for usta ${ustaId}: ${result.message}`);
      return errorResponse(res, result.message, result.errors, result.statusCode || 500);
    }

    logger.info(`Successfully fetched ${result.data.totalCount} reviews for usta ${ustaId}`);
    return successResponse(res, 'Reviews fetched successfully', result.data);
  } catch (error) {
    logger.error(`Unexpected error in getUstaReviews: ${error.message}`, { stack: error.stack });
    return next({ statusCode: 500, message: 'Internal server error' });
  }
};

// Create a rating
exports.createRating = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const ratingData = { ...req.body, customerId };
    
    logger.info(`Customer ${customerId} creating rating for usta ${ratingData.ustaId}`);
    const result = await ratingService.createRating(ratingData);

    if (!result.success) {
      logger.warn(`Failed to create rating: ${result.message}`);
      return errorResponse(res, result.message, result.errors, result.statusCode || 400);
    }

    logger.info(`Rating created successfully with ID: ${result.data.id}`);
    return successResponse(res, 'Rating created successfully', result.data, 201);
  } catch (error) {
    logger.error(`Unexpected error in createRating: ${error.message}`, { stack: error.stack });
    return next({ statusCode: 500, message: 'Internal server error' });
  }
};

// Update a rating
exports.updateRating = async (req, res, next) => {
  try {
    const { id } = req.params;
    const customerId = req.user.id;
    const updateData = req.body;
    
    logger.info(`Customer ${customerId} updating rating ${id}`);
    const result = await ratingService.updateRating(id, customerId, updateData);

    if (!result.success) {
      logger.warn(`Failed to update rating ${id}: ${result.message}`);
      return errorResponse(res, result.message, result.errors, result.statusCode || 400);
    }

    logger.info(`Rating ${id} updated successfully`);
    return successResponse(res, 'Rating updated successfully', result.data);
  } catch (error) {
    logger.error(`Unexpected error in updateRating: ${error.message}`, { stack: error.stack });
    return next({ statusCode: 500, message: 'Internal server error' });
  }
};

// Respond to a rating (usta only)
exports.respondToRating = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ustaId = req.user.id;
    const { response } = req.body;
    
    logger.info(`Usta ${ustaId} responding to rating ${id}`);
    const result = await ratingService.respondToRating(id, ustaId, response);

    if (!result.success) {
      logger.warn(`Failed to respond to rating ${id}: ${result.message}`);
      return errorResponse(res, result.message, result.errors, result.statusCode || 400);
    }

    logger.info(`Response to rating ${id} added successfully`);
    return successResponse(res, 'Response added successfully', result.data);
  } catch (error) {
    logger.error(`Unexpected error in respondToRating: ${error.message}`, { stack: error.stack });
    return next({ statusCode: 500, message: 'Internal server error' });
  }
};

// Get rating statistics for an usta
exports.getUstaRatingStats = async (req, res, next) => {
  try {
    const { ustaId } = req.params;
    
    logger.info(`Fetching rating statistics for usta: ${ustaId}`);
    const result = await ratingService.getUstaRatingStats(ustaId);

    if (!result.success) {
      logger.warn(`Failed to fetch rating stats for usta ${ustaId}: ${result.message}`);
      return errorResponse(res, result.message, result.errors, result.statusCode || 500);
    }

    logger.info(`Successfully fetched rating stats for usta ${ustaId}`);
    return successResponse(res, 'Rating statistics fetched successfully', result.data);
  } catch (error) {
    logger.error(`Unexpected error in getUstaRatingStats: ${error.message}`, { stack: error.stack });
    return next({ statusCode: 500, message: 'Internal server error' });
  }
};