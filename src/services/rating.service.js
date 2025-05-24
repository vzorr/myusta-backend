// src/services/rating.service.js
const { Rating, User, Job } = require('../models');
const { Op } = require('sequelize');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');
const { logger, logError } = require('../utils/logger');

// Get reviews for a specific usta
exports.getUstaReviews = async (ustaId, query) => {
  try {
    const { page, limit, offset } = getPaginationParams(query);
    const { minRating, maxRating, verified, featured } = query;

    // Build where conditions
    const whereConditions = { ustaId };
    
    if (minRating) {
      whereConditions.rating = { ...whereConditions.rating, [Op.gte]: parseFloat(minRating) };
    }
    
    if (maxRating) {
      whereConditions.rating = { ...whereConditions.rating, [Op.lte]: parseFloat(maxRating) };
    }
    
    if (verified !== undefined) {
      whereConditions.isVerified = verified === 'true';
    }
    
    if (featured !== undefined) {
      whereConditions.isFeatured = featured === 'true';
    }

    const { count, rows } = await Rating.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture']
        },
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'title', 'startDate', 'endDate']
        }
      ],
      order: [
        ['isFeatured', 'DESC'],
        ['createdAt', 'DESC']
      ],
      limit,
      offset,
      distinct: true
    });

    // Format the response
    const formattedReviews = rows.map(rating => ({
      id: rating.id,
      rating: rating.rating,
      comment: rating.comment,
      review: rating.comment, // Alias for backward compatibility
      createdAt: rating.createdAt,
      customerName: rating.customer 
        ? `${rating.customer.firstName} ${rating.customer.lastName}` 
        : 'Anonymous',
      customerId: rating.customerId,
      customerProfilePicture: rating.customer?.profilePicture,
      jobTitle: rating.job?.title,
      jobId: rating.jobId,
      // Additional rating dimensions
      serviceSatisfaction: rating.serviceSatisfaction,
      communication: rating.communication,
      timeliness: rating.timeliness,
      valueForMoney: rating.valueForMoney,
      // Meta fields
      isVerified: rating.isVerified,
      isFeatured: rating.isFeatured,
      helpfulCount: rating.helpfulCount,
      // Usta response
      ustaResponse: rating.ustaResponse,
      ustaResponseAt: rating.ustaResponseAt
    }));

    return {
      success: true,
      data: formatPaginatedResponse({ rows: formattedReviews, count }, page, limit)
    };
  } catch (error) {
    logError(`Error fetching usta reviews: ${error.message}`);
    return {
      success: false,
      message: 'Failed to fetch reviews',
      errors: [error.message]
    };
  }
};

// Create a rating
exports.createRating = async (ratingData) => {
  try {
    const { ustaId, customerId, jobId, rating, comment, 
            serviceSatisfaction, communication, timeliness, valueForMoney } = ratingData;

    // Validate that the usta exists and is active
    const usta = await User.findOne({
      where: { id: ustaId, role: 'usta', status: 'active' }
    });

    if (!usta) {
      return {
        success: false,
        message: 'Usta not found or inactive',
        statusCode: 404
      };
    }

    // Validate job if provided
    if (jobId) {
      const job = await Job.findOne({
        where: { 
          id: jobId,
          userId: customerId,
          status: 'completed'
        }
      });

      if (!job) {
        return {
          success: false,
          message: 'Job not found or not completed',
          statusCode: 400
        };
      }

      // Check if rating already exists for this job
      const existingRating = await Rating.findOne({
        where: { jobId, customerId }
      });

      if (existingRating) {
        return {
          success: false,
          message: 'Rating already exists for this job',
          statusCode: 400
        };
      }
    }

    // Create the rating
    const newRating = await Rating.create({
      ustaId,
      customerId,
      jobId,
      rating,
      comment,
      serviceSatisfaction,
      communication,
      timeliness,
      valueForMoney
    });

    // Update usta's average rating
    await this.updateUstaAverageRating(ustaId);

    // Fetch the created rating with associations
    const createdRating = await Rating.findByPk(newRating.id, {
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'title']
        }
      ]
    });

    return {
      success: true,
      data: createdRating
    };
  } catch (error) {
    logError(`Error creating rating: ${error.message}`);
    return {
      success: false,
      message: 'Failed to create rating',
      errors: [error.message]
    };
  }
};

// Update a rating
exports.updateRating = async (ratingId, customerId, updateData) => {
  try {
    const rating = await Rating.findOne({
      where: { id: ratingId, customerId }
    });

    if (!rating) {
      return {
        success: false,
        message: 'Rating not found or unauthorized',
        statusCode: 404
      };
    }

    // Only allow updates within 7 days of creation
    const daysSinceCreation = Math.floor((Date.now() - rating.createdAt) / (1000 * 60 * 60 * 24));
    if (daysSinceCreation > 7) {
      return {
        success: false,
        message: 'Ratings can only be edited within 7 days of creation',
        statusCode: 400
      };
    }

    // Update the rating
    await rating.update(updateData);

    // Update usta's average rating if rating value changed
    if (updateData.rating) {
      await this.updateUstaAverageRating(rating.ustaId);
    }

    return {
      success: true,
      data: rating
    };
  } catch (error) {
    logError(`Error updating rating: ${error.message}`);
    return {
      success: false,
      message: 'Failed to update rating',
      errors: [error.message]
    };
  }
};

// Usta responds to a rating
exports.respondToRating = async (ratingId, ustaId, response) => {
  try {
    const rating = await Rating.findOne({
      where: { id: ratingId, ustaId }
    });

    if (!rating) {
      return {
        success: false,
        message: 'Rating not found or unauthorized',
        statusCode: 404
      };
    }

    if (rating.ustaResponse) {
      return {
        success: false,
        message: 'Response already exists for this rating',
        statusCode: 400
      };
    }

    // Add the response
    await rating.update({
      ustaResponse: response,
      ustaResponseAt: new Date()
    });

    return {
      success: true,
      data: rating
    };
  } catch (error) {
    logError(`Error responding to rating: ${error.message}`);
    return {
      success: false,
      message: 'Failed to respond to rating',
      errors: [error.message]
    };
  }
};

// Get rating statistics for an usta
exports.getUstaRatingStats = async (ustaId) => {
  try {
    const ratings = await Rating.findAll({
      where: { ustaId },
      attributes: ['rating', 'serviceSatisfaction', 'communication', 'timeliness', 'valueForMoney']
    });

    if (ratings.length === 0) {
      return {
        success: true,
        data: {
          averageRating: 0,
          totalRatings: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          dimensionAverages: {
            serviceSatisfaction: 0,
            communication: 0,
            timeliness: 0,
            valueForMoney: 0
          }
        }
      };
    }

    // Calculate overall average
    const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / ratings.length;

    // Calculate rating distribution
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratings.forEach(r => {
      ratingDistribution[Math.floor(r.rating)]++;
    });

    // Calculate dimension averages
    const dimensionSums = {
      serviceSatisfaction: 0,
      communication: 0,
      timeliness: 0,
      valueForMoney: 0
    };
    
    const dimensionCounts = {
      serviceSatisfaction: 0,
      communication: 0,
      timeliness: 0,
      valueForMoney: 0
    };

    ratings.forEach(r => {
      ['serviceSatisfaction', 'communication', 'timeliness', 'valueForMoney'].forEach(dim => {
        if (r[dim] !== null) {
          dimensionSums[dim] += r[dim];
          dimensionCounts[dim]++;
        }
      });
    });

    const dimensionAverages = {};
    Object.keys(dimensionSums).forEach(dim => {
      dimensionAverages[dim] = dimensionCounts[dim] > 0 
        ? dimensionSums[dim] / dimensionCounts[dim] 
        : 0;
    });

    return {
      success: true,
      data: {
        averageRating: parseFloat(averageRating.toFixed(2)),
        totalRatings: ratings.length,
        ratingDistribution,
        dimensionAverages: {
          serviceSatisfaction: parseFloat(dimensionAverages.serviceSatisfaction.toFixed(2)),
          communication: parseFloat(dimensionAverages.communication.toFixed(2)),
          timeliness: parseFloat(dimensionAverages.timeliness.toFixed(2)),
          valueForMoney: parseFloat(dimensionAverages.valueForMoney.toFixed(2))
        }
      }
    };
  } catch (error) {
    logError(`Error fetching rating statistics: ${error.message}`);
    return {
      success: false,
      message: 'Failed to fetch rating statistics',
      errors: [error.message]
    };
  }
};

// Helper method to update usta's average rating
exports.updateUstaAverageRating = async (ustaId) => {
  try {
    const stats = await this.getUstaRatingStats(ustaId);
    
    if (stats.success) {
      await User.update(
        {
          averageRating: stats.data.averageRating,
          totalRatings: stats.data.totalRatings
        },
        { where: { id: ustaId } }
      );
    }
  } catch (error) {
    logError(`Error updating usta average rating: ${error.message}`);
    // Don't throw - this is a secondary operation
  }
};