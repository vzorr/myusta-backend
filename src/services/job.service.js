// src/services/job.service.js
const { Job, User, Location, ProfessionalDetail, SavedJob, Availability } = require('../models');
const { logger } = require('../utils/logger');
const { uploadJobImages } = require('../utils/imageUtils');
const { Op } = require('sequelize');
const sequelize = require('../models/index').sequelize;

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

// Get recommended jobs for usta based on preferences and location
exports.getRecommendedJobs = async (ustaId) => {
  try {
    // First get the usta's details with professional details and availability
    const usta = await User.findByPk(ustaId, {
      include: [
        {
          model: ProfessionalDetail,
          as: 'professionalDetail',
          attributes: ['category']
        },
        {
          model: Availability,
          as: 'availability',
          include: [{
            model: Location,
            as: 'location',
            attributes: ['latitude', 'longitude', 'maxDistance']
          }]
        }
      ]
    });

    // If no availability with location, return empty list
    if (!usta.availability?.location) {
      return { success: true, data: [] };
    }

    const ustaLocation = usta.availability.location;
    const maxDistance = ustaLocation.maxDistance || 10000; // Default to 10km if not set
    const ustaCategory = usta.professionalDetail?.category;

    // Haversine formula as a Sequelize literal
    const distanceQuery = `(
      6371 * acos(
        cos(radians(${ustaLocation.latitude})) * 
        cos(radians(locations.latitude)) * 
        cos(radians(locations.longitude) - radians(${ustaLocation.longitude})) + 
        sin(radians(${ustaLocation.latitude})) * 
        sin(radians(locations.latitude))
      )
    )`;

    // Build the where clause
    const whereClause = {};
    if (ustaCategory) {
      whereClause.category = ustaCategory;
    }

    // Get jobs within distance and matching category if specified
    const jobs = await Job.findAll({
      attributes: {
        include: [
          [sequelize.literal(distanceQuery), 'distance']
        ]
      },
      where: whereClause,
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Location,
          as: 'jobLocation',
          required: true,
          where: sequelize.literal(`${distanceQuery} <= ${maxDistance/1000}`) // Convert meters to km
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    return { success: true, data: jobs };
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

// Save a job for a usta
exports.saveJob = async (jobId, ustaId) => {
  try {
    // Check if job exists
    const job = await Job.findByPk(jobId);
    if (!job) {
      return { success: false, message: 'Job not found' };
    }

    // Check if already saved
    const existingSave = await SavedJob.findOne({
      where: {
        jobId,
        ustaId
      }
    });

    if (existingSave) {
      return { success: false, message: 'Job already saved' };
    }

    // Save the job
    await SavedJob.create({
      jobId,
      ustaId
    });

    return { success: true, message: 'Job saved successfully' };
  } catch (error) {
    logger.error(`Error saving job: ${error.message}`);
    return { success: false, message: 'Database error', errors: [error.message] };
  }
};
