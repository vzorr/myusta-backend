// src/services/job.service.js
const { Job, User } = require('../models');
const { logger } = require('../utils/logger');

const createJob = async (jobData) => {
  try {
    logger.info('Creating a new job in the database');
    const newJob = await Job.create(jobData);
    
    // Optionally fetch the job with associated user data
    const jobWithUser = await Job.findByPk(newJob.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }]
    });

    return { success: true, data: jobWithUser };
  } catch (error) {
    logger.error(`Error creating job: ${error.message}`);
    return { 
      success: false, 
      message: 'Database error while creating job', 
      errors: [error.message] 
    };
  }
};

const getJobById = async (id) => {
  try {
    logger.info(`Fetching job with ID: ${id}`);
    const job = await Job.findByPk(id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }]
    });

    if (!job) {
      logger.warn(`Job not found with ID: ${id}`);
      return { success: false, statusCode: 404, message: 'Job not found' };
    }

    return { success: true, data: job };
  } catch (error) {
    logger.error(`Error fetching job by ID: ${error.message}`);
    return { 
      success: false, 
      message: 'Database error while fetching job', 
      errors: [error.message] 
    };
  }
};

const getUserJobs = async (userId) => {
  try {
    logger.info(`Fetching jobs for user ID: ${userId}`);
    const jobs = await Job.findAll({
      where: { userId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }]
    });

    return { success: true, data: jobs };
  } catch (error) {
    logger.error(`Error fetching user jobs: ${error.message}`);
    return { 
      success: false, 
      message: 'Database error while fetching user jobs', 
      errors: [error.message] 
    };
  }
};

module.exports = {
  createJob,
  getJobById,
  getUserJobs
};