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


// Get completed jobs for customer
exports.getCustomerCompletedJobs = async (customerId, query) => {
  try {
    const { page, limit, offset } = getPaginationParams(query);

    const { count, rows } = await Job.findAndCountAll({
      where: { 
        userId: customerId,
        status: 'completed'
      },
      include: [
        {
          model: Location,
          as: 'location'
        },
        {
          model: Rating,
          as: 'rating',
          required: false,
          include: [{
            model: User,
            as: 'usta',
            attributes: ['id', 'firstName', 'lastName']
          }]
        },
        {
          model: Contract,
          as: 'contract',
          required: false,
          include: [{
            model: User,
            as: 'usta',
            attributes: ['id', 'firstName', 'lastName', 'profilePicture']
          }]
        }
      ],
      order: [['endDate', 'DESC']],
      limit,
      offset
    });

    // Format the jobs with additional fields
    const formattedJobs = rows.map(job => ({
      id: job.id,
      title: job.title,
      description: job.description,
      budget: job.budget,
      currency: 'ALL', // Default currency
      rating: job.rating?.rating || null,
      startDate: job.startDate,
      endDate: job.endDate,
      category: job.category,
      paymentMethod: job.paymentMethod,
      location: job.location,
      images: job.images,
      // Additional fields
      usta: job.contract?.usta || null,
      hasRating: !!job.rating,
      ratingId: job.rating?.id || null
    }));

    return { 
      success: true, 
      data: formatPaginatedResponse({ rows: formattedJobs, count }, page, limit) 
    };
  } catch (error) {
    logger.error(`Error fetching customer completed jobs: ${error.message}`);
    return { 
      success: false, 
      message: 'Failed to fetch completed jobs', 
      errors: [error.message] 
    };
  }
};

// Get active jobs for customer
exports.getCustomerActiveJobs = async (customerId, query) => {
  try {
    const { page, limit, offset } = getPaginationParams(query);

    const { count, rows } = await Job.findAndCountAll({
      where: { 
        userId: customerId,
        status: 'active'
      },
      include: [
        {
          model: Location,
          as: 'location'
        },
        {
          model: Contract,
          as: 'contract',
          required: false,
          where: { status: 'accepted' },
          include: [{
            model: User,
            as: 'usta',
            attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'phone']
          }]
        },
        {
          model: JobProposal,
          as: 'proposals',
          where: { status: 'accepted' },
          required: false
        }
      ],
      order: [['startDate', 'ASC']],
      limit,
      offset
    });

    // Format the jobs
    const formattedJobs = rows.map(job => ({
      id: job.id,
      title: job.title,
      description: job.description,
      budget: job.budget,
      currency: 'ALL',
      startDate: job.startDate,
      endDate: job.endDate,
      category: job.category,
      paymentMethod: job.paymentMethod,
      location: job.location,
      images: job.images,
      // Additional fields for active jobs
      usta: job.contract?.usta || null,
      contractId: job.contract?.id || null,
      progress: calculateJobProgress(job), // Helper function to calculate progress
      daysRemaining: calculateDaysRemaining(job.endDate)
    }));

    return { 
      success: true, 
      data: formatPaginatedResponse({ rows: formattedJobs, count }, page, limit) 
    };
  } catch (error) {
    logger.error(`Error fetching customer active jobs: ${error.message}`);
    return { 
      success: false, 
      message: 'Failed to fetch active jobs', 
      errors: [error.message] 
    };
  }
};

// Get completed jobs for usta
exports.getUstaCompletedJobs = async (ustaId, query) => {
  try {
    const { page, limit, offset } = getPaginationParams(query);

    const { count, rows } = await Contract.findAndCountAll({
      where: { 
        ustaId,
        status: 'accepted'
      },
      include: [{
        model: Job,
        as: 'job',
        where: { status: 'completed' },
        include: [
          {
            model: User,
            as: 'customer',
            attributes: ['id', 'firstName', 'lastName', 'profilePicture']
          },
          {
            model: Location,
            as: 'location'
          },
          {
            model: Rating,
            as: 'rating',
            required: false,
            where: { ustaId }
          }
        ]
      }],
      order: [[{ model: Job, as: 'job' }, 'endDate', 'DESC']],
      limit,
      offset
    });

    // Format the jobs
    const formattedJobs = rows.map(contract => ({
      id: contract.job.id,
      title: contract.job.title,
      description: contract.job.description,
      budget: contract.totalCost,
      currency: 'ALL',
      rating: contract.job.rating?.rating || null,
      startDate: contract.startDate,
      endDate: contract.endDate,
      customer: contract.job.customer,
      location: contract.job.location,
      hasRating: !!contract.job.rating,
      earnings: calculateEarnings(contract.totalCost) // After service fee deduction
    }));

    return { 
      success: true, 
      data: formatPaginatedResponse({ rows: formattedJobs, count }, page, limit) 
    };
  } catch (error) {
    logger.error(`Error fetching usta completed jobs: ${error.message}`);
    return { 
      success: false, 
      message: 'Failed to fetch completed jobs', 
      errors: [error.message] 
    };
  }
};

// Get active jobs for usta
exports.getUstaActiveJobs = async (ustaId, query) => {
  try {
    const { page, limit, offset } = getPaginationParams(query);

    const { count, rows } = await Contract.findAndCountAll({
      where: { 
        ustaId,
        status: 'accepted'
      },
      include: [{
        model: Job,
        as: 'job',
        where: { status: 'active' },
        include: [
          {
            model: User,
            as: 'customer',
            attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'phone']
          },
          {
            model: Location,
            as: 'location'
          }
        ]
      }],
      order: [[{ model: Job, as: 'job' }, 'startDate', 'ASC']],
      limit,
      offset
    });

    // Format the jobs
    const formattedJobs = rows.map(contract => ({
      id: contract.job.id,
      title: contract.job.title,
      description: contract.job.description,
      budget: contract.totalCost,
      currency: 'ALL',
      startDate: contract.startDate,
      endDate: contract.endDate,
      customer: contract.job.customer,
      location: contract.job.location,
      contractId: contract.id,
      progress: calculateJobProgress(contract.job),
      daysRemaining: calculateDaysRemaining(contract.endDate),
      estimatedEarnings: calculateEarnings(contract.totalCost)
    }));

    return { 
      success: true, 
      data: formatPaginatedResponse({ rows: formattedJobs, count }, page, limit) 
    };
  } catch (error) {
    logger.error(`Error fetching usta active jobs: ${error.message}`);
    return { 
      success: false, 
      message: 'Failed to fetch active jobs', 
      errors: [error.message] 
    };
  }
};

// Helper functions
function calculateJobProgress(job) {
  const now = new Date();
  const start = new Date(job.startDate);
  const end = new Date(job.endDate);
  
  if (now < start) return 0;
  if (now > end) return 100;
  
  const total = end - start;
  const elapsed = now - start;
  return Math.round((elapsed / total) * 100);
}

function calculateDaysRemaining(endDate) {
  const now = new Date();
  const end = new Date(endDate);
  const diff = end - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function calculateEarnings(totalCost) {
  const serviceFeePercentage = 0.1; // 10% service fee
  return totalCost * (1 - serviceFeePercentage);
}

