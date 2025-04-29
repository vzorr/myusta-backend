// src/services/job.service.js
const { Job, User, Location, SavedJob, Availability, ProfessionalDetail, JobProposal, Milestone, Contract } = require('../models');
const { logger } = require('../utils/logger');
const { uploadJobImages } = require('../utils/imageUtils');
const { Op } = require('sequelize');
const sequelize = require('../models/index').sequelize;
const { CATEGORY } = require('../utils/constant');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');

const ALLOWED_CATEGORY_KEYS = CATEGORY.map(category => category.key);

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
      longitude: jobData.location.longitude,
      description: jobData.location.description
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

    // Count job proposals for this job
    const jobProposalsCount = await JobProposal.count({ where: { jobId: id } });

    // Add the count to the response
    return { success: true, data: { ...job.toJSON(), jobProposalsCount } };
  } catch (error) {
    logger.error(`Error fetching job: ${error.message}`);
    return { success: false, message: 'Database error', errors: [error.message] };
  }
};

// Get jobs for a specific user (customer)
exports.getUserJobs = async (userId, query) => {
  try {
    const { page, limit, offset } = getPaginationParams(query);

    const { count, rows } = await Job.findAndCountAll({
      where: { userId },
      include: [
        {
          model: Location,
          as: 'jobLocation'
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    // Add jobProposalsCount for each job
    const jobsWithProposalCounts = await Promise.all(rows.map(async (job) => {
      const jobProposalsCount = await JobProposal.count({ where: { jobId: job.id } });
      return { ...job.toJSON(), jobProposalsCount };
    }));

    const paginated = formatPaginatedResponse({ rows: jobsWithProposalCounts, count }, page, limit);

    return { success: true, data: paginated };
  } catch (error) {
    logger.error(`Error fetching user jobs: ${error.message}`);
    return { success: false, message: 'Database error', errors: [error.message] };
  }
};

// Get recommended jobs for usta based on preferences and location
exports.getRecommendedJobs = async (ustaId, query) => {
  try {
    const { page, limit, offset } = getPaginationParams(query);

    // Fetch Usta's details, including availability/location and professional experiences
    const usta = await User.findByPk(ustaId, {
      include: [
        {
          model: Availability,
          as: 'availability',
          include: [{
            model: Location,
            as: 'location',
            attributes: ['latitude', 'longitude', 'maxDistance', 'description']
          }]
        },
        {
          model: ProfessionalDetail,
          as: 'professionalDetail',
          attributes: ['experiences']
        }
      ]
    });

    // If no availability with location, return empty list
    if (!usta.availability?.location) {
      return { success: true, data: formatPaginatedResponse({ rows: [], count: 0 }, page, limit) };
    }

    const ustaLocation = usta.availability.location;
    const maxDistance = ustaLocation.maxDistance || 100; // default to 100km

    // Get Usta's skills/categories ('experiences' is an array of objects with 'category')
    const experiences = usta.professionalDetail?.experiences || [];
    const ustaCategories = experiences
      .map(exp => exp.category)
      .filter(cat => ALLOWED_CATEGORY_KEYS.includes(cat));

    // If Usta has no categories, return empty list
    if (ustaCategories.length === 0) {
      return { success: true, data: formatPaginatedResponse({ rows: [], count: 0 }, page, limit) };
    }

    // Haversine formula as a Sequelize literal
    const distanceQuery = `(
      6371 * acos(
        cos(radians(${ustaLocation.latitude})) * 
        cos(radians("jobLocation".latitude)) * 
        cos(radians("jobLocation".longitude) - radians(${ustaLocation.longitude})) + 
        sin(radians(${ustaLocation.latitude})) * 
        sin(radians("jobLocation".latitude))
      )
    )`;

    // Build the category overlap filter for JSONB using the Postgres ?| operator
    const pgArray = "ARRAY[" + ustaCategories.map(cat => `'${cat}'`).join(",") + "]";

    // Query jobs matching both category and distance, paginated
    const { count, rows } = await Job.findAndCountAll({
      attributes: [
        'id',
        'title',
        'description',
        'category',
        'budget',
        'status',
        'createdAt',
        'updatedAt'
      ],
      where: {
        [Op.and]: [
          sequelize.literal(`"Job"."category" ?| ${pgArray}`),
          sequelize.literal(`${distanceQuery} <= ${maxDistance / 1000}`)
        ]
      },
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
          attributes: ['latitude', 'longitude', 'address', 'description']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    // Get all saved job IDs for this Usta
    const savedJobs = await SavedJob.findAll({
      where: { ustaId },
      attributes: ['jobId']
    });
    const savedJobIds = new Set(savedJobs.map(sj => sj.jobId));

    // Add 'saved' flag to each job
    const jobsWithSavedFlag = rows.map(job => ({
      ...job.toJSON(),
      saved: savedJobIds.has(job.id)
    }));

    return { success: true, data: formatPaginatedResponse({ rows: jobsWithSavedFlag, count }, page, limit) };
  } catch (error) {
    logger.error(`Error fetching recommended jobs: ${error.message}`);
    return { success: false, message: 'Database error', errors: [error.message] };
  }
};

// Get most recent jobs
exports.getMostRecentJobs = async (ustaId, query) => {
  try {
    const { page, limit, offset } = getPaginationParams(query);

    const { count, rows } = await Job.findAndCountAll({
      attributes: [
        'id',
        'title',
        'description',
        'category',
        'budget',
        'status',
        'createdAt',
        'updatedAt'
      ],
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
      limit,
      offset
    });

    // Get all saved job IDs for this Usta
    const savedJobs = await SavedJob.findAll({
      where: { ustaId },
      attributes: ['jobId']
    });
    const savedJobIds = new Set(savedJobs.map(sj => sj.jobId));

    // Add 'saved' flag to each job
    const jobsWithSavedFlag = rows.map(job => ({
      ...job.toJSON(),
      saved: savedJobIds.has(job.id)
    }));

    return { success: true, data: formatPaginatedResponse({ rows: jobsWithSavedFlag, count }, page, limit) };
  } catch (error) {
    logger.error(`Error fetching recent jobs: ${error.message}`);
    return { success: false, message: 'Database error', errors: [error.message] };
  }
};


// Get saved jobs for a specific user (Usta)
exports.getSavedJobs = async (userId, query) => {
  try {
    const { page, limit, offset } = getPaginationParams(query);

    const { count, rows } = await SavedJob.findAndCountAll({
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
      limit,
      offset
    });

    // Just return the jobs with saved: true
    const jobs = rows.map(entry => ({
      ...entry.job.toJSON(),
      saved: true
    }));

    return { success: true, data: formatPaginatedResponse({ rows: jobs, count }, page, limit) };
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

exports.createJobProposal = async (proposalData) => {
  try {
    const { jobId, ustaId, milestones, ...rest } = proposalData;
    const jobProposal = await JobProposal.create({
      ...rest,
      jobId,
      createdBy: ustaId
    });

    // If milestones provided, create them
    if (milestones && Array.isArray(milestones)) {
      for (const ms of milestones) {
        await Milestone.create({
          ...ms,
          jobProposalId: jobProposal.id
        });
      }
    }

    // Optionally fetch with milestones (TODO: App v2, not required in v1) 
    // const fullProposal = await JobProposal.findByPk(jobProposal.id, {
    //   include: [{ model: Milestone, as: 'milestones' }]
    // });

    return { success: true, data: jobProposal };
  } catch (error) {
    return { success: false, message: error.message, errors: [error.message] };
  }
};

// Get applied jobs (proposals) for a specific usta
exports.getUstaAppliedJobs = async (ustaId, query) => {
  try {
    const { page, limit, offset } = getPaginationParams(query);

    const { count, rows } = await JobProposal.findAndCountAll({
      where: { createdBy: ustaId },
      include: [{
        model: Job,
        as: 'job',
        attributes: ['id', 'title', 'status']
      }],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    // For each proposal, fetch total proposals for that job
    const appliedJobs = await Promise.all(rows.map(async proposal => {
      let totalProposals = 0;
      if (proposal.job?.id) {
        totalProposals = await JobProposal.count({ where: { jobId: proposal.job.id } });
      }
      return {
        jobId: proposal.job?.id,
        jobTitle: proposal.job?.title,
        jobStatus: proposal.job?.status,
        applicationId: proposal.id,
        applicationStatus: proposal.status,
        applicationDateTime: proposal.createdAt,
        totalProposals
      };
    }));

    return {
      success: true,
      message: 'Applied jobs fetched successfully',
      data: formatPaginatedResponse({ rows: appliedJobs, count }, page, limit)
    };
  } catch (error) {
    logger.error(`Error fetching applied jobs: ${error.message}`);
    return {
      success: false,
      message: 'Database error',
      errors: [error.message]
    };
  }
};

// Get all job applications (proposals) for a specific job (for customer)
exports.getJobApplications = async (jobId, query) => {
  try {
    const { page, limit, offset } = getPaginationParams(query);

    // Fetch the job and its associated customer info
    const job = await Job.findByPk(jobId, {
      include: [{
        model: User,
        as: 'customer',
        attributes: ['id', 'firstName', 'lastName']
      }],
      attributes: ['id', 'createdAt', 'title']
    });

    if (!job) {
      return {
        success: false,
        message: 'Job not found',
        statusCode: 404
      };
    }

    // Paginated fetch of proposals for this job
    const { count, rows } = await JobProposal.findAndCountAll({
      where: { jobId },
      include: [
        {
          model: User,
          as: 'usta',
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    const applications = rows.map(proposal => ({
      proposalId: proposal.id,
      ustaName: proposal.usta
        ? `${proposal.usta.firstName} ${proposal.usta.lastName}`
        : null,
      ustaProfilePic: proposal.usta?.profilePicture || null,
      proposalStartDate: proposal.startDate,
      proposalEndDate: proposal.endDate,
      totalPrice: proposal.totalCost
    }));

    return {
      success: true,
      message: 'Job applications fetched successfully',
      data: {
        totalProposals: count,
        customerName: job.customer
          ? `${job.customer.firstName} ${job.customer.lastName}`
          : null,
        jobCreatedAt: job.createdAt,
        jobTitle: job.title,
        ...formatPaginatedResponse(
          { rows: applications, count },
          page,
          limit
        )
      }
    };
  } catch (error) {
    logger.error(`Error fetching job applications: ${error.message}`);
    return {
      success: false,
      message: 'Database error',
      errors: [error.message]
    };
  }
};

// Get details for a specific job proposal
exports.getJobProposalDetails = async (proposalId) => {
  try {
    const proposal = await JobProposal.findByPk(proposalId, {
      include: [
        {
          model: User,
          as: 'usta',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Job,
          as: 'job',
          include: [
            {
              model: User,
              as: 'customer',
              attributes: ['id', 'firstName', 'lastName']
            }
          ],
          attributes: ['id', 'title', 'createdAt', 'status']
        },
        {
          model: Contract, 
          as: 'contract', 
          attributes: ['id']
        }
      ]
    });

    if (!proposal) {
      return { success: false, message: 'Proposal not found', statusCode: 404 };
    }

    return {
      success: true,
      data: {
        proposalId: proposal.id,
        status: proposal.status,
        proposalType: proposal.proposalType,
        description: proposal.description,
        startDate: proposal.startDate,
        endDate: proposal.endDate,
        totalCost: proposal.totalCost,
        serviceFee: proposal.serviceFee,
        finalPayment: proposal.finalPayment,
        materials: proposal.materials || [],
        createdAt: proposal.createdAt,
        usta: proposal.usta,
        job: proposal.job,
        customer: proposal.job?.customer,
        contractId: proposal.contract ? proposal.contract.id : null
      }
    };
  } catch (error) {
    logger.error(`Error fetching proposal details: ${error.message}`);
    return { success: false, message: 'Database error', errors: [error.message] };
  }
};
