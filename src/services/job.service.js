// src/services/job.service.js
const { Job, User, Location } = require('../models');
const { logger } = require('../utils/logger');
const { uploadJobImages } = require('../utils/imageUtils');

const createJob = async (jobData) => {
  try {
    logger.info('Creating a new job in the database');
    
    // Handle image uploads if images are provided
    let imageUrls = [];
    if (jobData.images && jobData.images.length > 0) {
      try {
        imageUrls = await uploadJobImages(jobData.images);
        logger.info(`Successfully uploaded ${imageUrls.length} images for job`);
      } catch (error) {
        logger.error(`Error uploading job images: ${error.message}`);
        return {
          success: false,
          message: 'Failed to upload job images',
          errors: [error.message]
        };
      }
    }

    // Create location first
    const location = await Location.create({
      userId: jobData.userId,
      address: jobData.location.address,
      latitude: jobData.location.latitude,
      longitude: jobData.location.longitude
    });

    // Create job with image URLs and location ID
    const { location: locationData, images: originalImages, ...restJobData } = jobData;
    const newJob = await Job.create({
      ...restJobData,
      images: imageUrls,
      locationId: location.id
    });
    
    // Fetch the job with associated user and location data
    const jobWithAssociations = await Job.findByPk(newJob.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Location,
          as: 'location'
        }
      ]
    });

    return { success: true, data: jobWithAssociations };
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
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Location,
          as: 'location'
        }
      ]
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
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Location,
          as: 'location'
        }
      ]
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