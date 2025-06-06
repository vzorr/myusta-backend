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
    const result = await jobService.getUserJobs(userId, req.query);

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
        result = await jobService.getRecommendedJobs(req.user.id, req.query);
        break;
      case 'most_recent':
        result = await jobService.getMostRecentJobs(req.user.id, req.query);
        break;
      case 'saved':
        result = await jobService.getSavedJobs(req.user.id, req.query);
        break;
      default:
        logger.warn(`Invalid filter type: ${filter}`);
        return errorResponse(res, 'Invalid filter type. Must be either "recommended", "most_recent", or "saved"', [], 400);
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

// Save a job for a usta
exports.saveJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const ustaId = req.user.id;

    const result = await jobService.saveJob(jobId, ustaId);

    if (!result.success) {
      return errorResponse(res, result.message, result.errors);
    }

    return successResponse(res, result.message);
  } catch (error) {
    logger.error(`Error in saveJob controller: ${error.message}`);
    return errorResponse(res, 'Internal server error', [error.message]);
  }
};

// Create a new job proposal for a job
exports.createJobProposal = async (req, res, next) => {
  try {
    const ustaId = req.user.id;
    const proposalData = req.body;

    const result = await jobService.createJobProposal({ ustaId, ...proposalData });

    if (!result.success) {
      return errorResponse(res, result.message, result.errors, 400);
    }
    return successResponse(res, 'Job proposal created successfully', result.data, 201);
  } catch (error) {
    return next({ statusCode: 500, message: 'Internal server error' });
  }
};

// Get applied jobs for a specific usta
exports.getUstaAppliedJobs = async (req, res, next) => {
  try {
    const ustaId = req.user.id;
    const queryParams = req.query;
    const result = await jobService.getUstaAppliedJobs(ustaId, queryParams);

    if (!result.success) {
      return errorResponse(res, result.message, result.errors, 500);
    }

    logger.info(`Applied jobs fetched successfully for usta ID: ${ustaId}`);
    return successResponse(res, 'Applied jobs fetched successfully', result.data);
  } catch (error) {
    logger.error(`Unexpected error in getUstaAppliedJobs: ${error.message}`);
    return next({ statusCode: 500, message: 'Internal server error' });
  }
};

// Get all job applications (proposals) for a specific job (for customer)
exports.getJobApplications = async (req, res, next) => {
  try {
    const jobId = req.params.id;
    const queryParams = req.query;
    const result = await jobService.getJobApplications(jobId, queryParams);

    if (!result.success) {
      return errorResponse(res, result.message, result.errors, result.statusCode || 500);
    }

    logger.info(`Job applications fetched successfully for job ID: ${jobId}`);
    return successResponse(res, 'Job applications fetched successfully', result.data);
  } catch (error) {
    logger.error(`Unexpected error in getJobApplications: ${error.message}`);
    return next({ statusCode: 500, message: 'Internal server error' });
  }
};

// Get details for a specific job proposal
exports.getJobProposalDetails = async (req, res, next) => {
  try {
    const proposalId = req.params.proposalId;
    const result = await jobService.getJobProposalDetails(proposalId);

    if (!result.success) {
      return errorResponse(res, result.message, result.errors, result.statusCode || 500);
    }

    logger.info(`Job proposal details fetched for proposal ID: ${proposalId}`);
    return successResponse(res, 'Job proposal details fetched successfully', result.data);
  } catch (error) {
    logger.error(`Unexpected error in getJobProposalDetails: ${error.message}`);
    return next({ statusCode: 500, message: 'Internal server error' });
  }
};


// Get completed jobs for authenticated user
exports.getUserCompletedJobs = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const queryParams = req.query;
    
    logger.info(`Fetching completed jobs for ${userRole} ID: ${userId}`);
    
    const result = userRole === 'customer' 
      ? await jobService.getCustomerCompletedJobs(userId, queryParams)
      : await jobService.getUstaCompletedJobs(userId, queryParams);

    if (!result.success) {
      logger.warn(`Failed to fetch completed jobs for ${userRole} ${userId}: ${result.message}`);
      return errorResponse(res, result.message, result.errors, 500);
    }

    logger.info(`Completed jobs fetched successfully for ${userRole} ID: ${userId}`);
    return successResponse(res, 'Completed jobs fetched successfully', result.data);
  } catch (error) {
    logger.error(`Unexpected error in getUserCompletedJobs: ${error.message}`, { stack: error.stack });
    return next({ statusCode: 500, message: 'Internal server error' });
  }
};

// Get active jobs for authenticated user
exports.getUserActiveJobs = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const queryParams = req.query;
    
    logger.info(`Fetching active jobs for ${userRole} ID: ${userId}`);
    
    const result = userRole === 'customer' 
      ? await jobService.getCustomerActiveJobs(userId, queryParams)
      : await jobService.getUstaActiveJobs(userId, queryParams);

    if (!result.success) {
      logger.warn(`Failed to fetch active jobs for ${userRole} ${userId}: ${result.message}`);
      return errorResponse(res, result.message, result.errors, 500);
    }

    logger.info(`Active jobs fetched successfully for ${userRole} ID: ${userId}`);
    return successResponse(res, 'Active jobs fetched successfully', result.data);
  } catch (error) {
    logger.error(`Unexpected error in getUserActiveJobs: ${error.message}`, { stack: error.stack });
    return next({ statusCode: 500, message: 'Internal server error' });
  }
};

