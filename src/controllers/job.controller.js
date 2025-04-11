// src/controllers/job.controller.js
const jobService = require('../services/job.service');
const { successResponse, errorResponse } = require('../utils/response');
const { logger } = require('../utils/logger');

// Create a new job (POST /)
exports.createJob = async (req, res, next) => {
  try {
    const jobData = { ...req.body, userId: req.user.id };
    const result = await jobService.createJob(jobData);

    if (!result.success) {
      logger.warn(`Failed to create job: ${result.message}`);
      return errorResponse(res, result.message, result.errors, 500);
    }

    logger.info(`Job created successfully with ID: ${result.data.id}`);
    return successResponse(res, 'Job created successfully', result.data, 201);
  } catch (error) {
    logger.error(`Unexpected error in createJob: ${error.message}`);
    return next({ statusCode: 500, message: 'Internal server error' });
  }
};

// Get job by ID (GET /:id)
exports.getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await jobService.getJobById(id);

    if (!result.success) {
      logger.warn(`Job not found with ID: ${id}`);
      return errorResponse(res, result.message, [], result.statusCode || 404);
    }

    logger.info(`Job details fetched for ID: ${id}`);
    return successResponse(res, 'Job fetched successfully', result.data);
  } catch (error) {
    logger.error(`Unexpected error in getJobById: ${error.message}`);
    return next({ statusCode: 500, message: 'Internal server error' });
  }
};

// Get jobs for authenticated customer (GET /user/jobs)
exports.getUserJobs = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await jobService.getUserJobs(userId);

    if (!result.success) {
      logger.warn(`Failed to fetch jobs for user ID: ${userId}`);
      return errorResponse(res, result.message, result.errors, 500);
    }

    logger.info(`Jobs fetched successfully for user ID: ${userId}`);
    return successResponse(res, 'User jobs fetched successfully', result.data);
  } catch (error) {
    logger.error(`Unexpected error in getUserJobs: ${error.message}`);
    return next({ statusCode: 500, message: 'Internal server error' });
  }
};

// Get jobs for Usta (GET /usta/jobs)
exports.getUstaJobs = async (req, res, next) => {
  try {
    const { filter } = req.query;
    let result;

    switch (filter) {
      case 'recommended':
        result = await jobService.getRecommendedJobs(req.user.id);
        break;
      case 'most_recent':
        result = await jobService.getMostRecentJobs();
        break;
      default:
        logger.warn(`Invalid filter type: ${filter}`);
        return errorResponse(res, 'Invalid filter type. Must be either "recommended" or "most_recent"', [], 400);
    }

    if (!result.success) {
      logger.warn(`Failed to fetch ${filter} jobs for usta ID: ${req.user.id}`);
      return errorResponse(res, result.message, result.errors, 500);
    }

    logger.info(`${filter} jobs fetched successfully for usta ID: ${req.user.id}`);
    return successResponse(res, 'Jobs fetched successfully', result.data);
  } catch (error) {
    logger.error(`Unexpected error in getUstaJobs: ${error.message}`);
    return next({ statusCode: 500, message: 'Internal server error' });
  }
};
