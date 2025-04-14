// src/services/job.service.js
const { Job, User, Location, ProfessionalDetail, SavedJob } = require('../models');
const { logger } = require('../utils/logger');
const { uploadJobImages } = require('../utils/imageUtils');
const { Op } = require('sequelize');

// Create a new job
exports.createJob = async (jobData) => {
  try {
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
      whoseLocation: 'job',
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

    // Fetch the job with associations
    const jobWithAssociations = await Job.findByPk(newJob.id, {
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Location,
          as: 'jobLocation'
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

// Get job by ID
exports.getJobById = async (id) => {
  try {
    const job = await Job.findByPk(id, {
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Location,
          as: 'jobLocation'
        }
      ]
    });

    if (!job) {
      return {
        success: false,
        message: 'Job not found',
        statusCode: 404
      };
    }

    return { success: true, data: job };
  } catch (error) {
    logger.error(`Error fetching job: ${error.message}`);
    return { success: false, message: 'Database error', errors: [error.message] };
  }
};

// Get jobs for a specific user
exports.getUserJobs = async (userId) => {
  try {
    const jobs = await Job.findAll({
      where: { userId },
      include: [
        {
          model: Location,
          as: 'jobLocation'
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return { success: true, data: jobs };
  } catch (error) {
    logger.error(`Error fetching user jobs: ${error.message}`);
    return { success: false, message: 'Database error', errors: [error.message] };
  }
};

// Get recommended jobs for usta based on preferences
exports.getRecommendedJobs = async (ustaId) => {
  try {

    // first get the usta's professional details experience include category and availability location and maxDistance
    // both of these are optional so we need to check if any record exists in jobs table then fetch those jobs



  } catch (error) {
    logger.error(`Error fetching recommended jobs: ${error.message}`);
    return { success: false, message: 'Database error', errors: [error.message] };
  }
};

// Get most recent jobs
exports.getMostRecentJobs = async () => {
  try {
    const jobs = await Job.findAll({
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Location,
          as: 'jobLocation'
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    return { success: true, data: jobs };
  } catch (error) {
    logger.error(`Error fetching recent jobs: ${error.message}`);
    return { success: false, message: 'Database error', errors: [error.message] };
  }
};


// Get saved jobs for a specific user (Usta)
exports.getSavedJobs = async (userId) => {
  try {
    const savedJobs = await SavedJob.findAll({
      where: { ustaId: userId },
      include: [
        {
          model: Job,
          as: 'job',
          include: [
            {
              model: User,
              as: 'customer',
              attributes: ['id', 'firstName', 'lastName', 'email']
            },
            {
              model: Location,
              as: 'jobLocation'
            }
          ]
        }
      ],
      order: [[{ model: Job, as: 'job' }, 'createdAt', 'DESC']],
      limit: 50
    });

    const jobs = savedJobs.map(entry => entry.job); // Just return the job

    return { success: true, data: jobs };
  } catch (error) {
    logger.error(`Error fetching saved jobs: ${error.message}`);
    return { success: false, message: 'Database error', errors: [error.message] };
  }
};
