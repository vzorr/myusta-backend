// src/services/usta.service.js (Updated)
const { User, ProfessionalDetail, Location, Availability, Portfolio, Invitation } = require('../models');
const { Op, Sequelize } = require('sequelize');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');
const { logError, logger } = require('../utils/logger');

exports.searchUstas = async (params) => {
  try {
    const { 
      search, category, latitude, longitude, 
      maxDistance, minRating, availability,
      page = 1, limit = 10 
    } = params;
    
    const { offset } = getPaginationParams({ page, limit });
    
    // Build the query conditions
    const where = { role: 'usta', status: 'active' };
    const include = [
      {
        model: ProfessionalDetail,
        as: 'professionalDetail',
        required: true
      },
      {
        model: Portfolio,
        as: 'portfolios',
        required: false
      }
    ];
    
    // Add search conditions
    if (search) {
      where[Op.or] = [
        Sequelize.where(
          Sequelize.fn('concat', Sequelize.col('firstName'), ' ', Sequelize.col('lastName')),
          { [Op.iLike]: `%${search}%` }
        ),
        { '$portfolios.title$': { [Op.iLike]: `%${search}%` } },
        { '$portfolios.description$': { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    // Add category filter
    if (category) {
      include[0].where = {
        experiences: { 
          [Op.contains]: [{ category }] 
        }
      };
    }
    
    // Add location filter if coordinates are provided
    if (latitude && longitude) {
      const distance = maxDistance || 50; // Default 50km
      
      include.push({
        model: Location,
        as: 'locations',
        required: true,
        where: Sequelize.literal(`
          (6371 * acos(cos(radians(${latitude})) * 
          cos(radians(latitude)) * cos(radians(longitude)) - 
          radians(${longitude})) + sin(radians(${latitude})) * 
          sin(radians(latitude)))) <= ${distance}
        `)
      });
    }
    
    // Execute the query
    const { count, rows } = await User.findAndCountAll({
      where,
      include,
      distinct: true,
      offset,
      limit,
      order: [['createdAt', 'DESC']]
    });
    
    // Format the results
    const formattedUstas = rows.map(usta => ({
      id: usta.id,
      firstName: usta.firstName,
      lastName: usta.lastName,
      profilePicture: usta.profilePicture,
      experiences: usta.professionalDetail?.experiences || [],
      portfolios: usta.portfolios || [],
      // Add rating info when implemented
    }));
    
    return {
      success: true,
      data: formatPaginatedResponse({ rows: formattedUstas, count }, page, limit)
    };
  } catch (error) {
    logError(`Error searching ustas: ${error.message}`);
    return {
      success: false,
      message: 'Error searching ustas',
      errors: [error.message]
    };
  }
};

exports.getTopUstas = async (type, category, limit) => {
  try {
    const where = { role: 'usta', status: 'active' };
    const include = [
      {
        model: ProfessionalDetail,
        as: 'professionalDetail',
        required: true
      }
    ];
    
    // Add category filter
    if (category) {
      include[0].where = {
        experiences: { 
          [Op.contains]: [{ category }] 
        }
      };
    }
    
    // In a real app, you would order by rating or popularity metrics
    // For now, we'll simulate this with a simple created date ordering
    const order = type === 'top-rated' 
      ? [['averageRating', 'DESC']] // Order by rating if available
      : [['totalViews', 'DESC']]; // Order by views for popularity
    
    // Execute the query
    const ustas = await User.findAll({
      where,
      include,
      limit: Number(limit),
      order
    });
    
    // Format the results
    const formattedUstas = ustas.map(usta => ({
      id: usta.id,
      firstName: usta.firstName,
      lastName: usta.lastName,
      profilePicture: usta.profilePicture,
      averageRating: usta.averageRating,
      totalRatings: usta.totalRatings,
      experiences: usta.professionalDetail?.experiences || []
    }));
    
    return {
      success: true,
      data: formattedUstas
    };
  } catch (error) {
    logError(`Error fetching ${type} ustas: ${error.message}`);
    return {
      success: false,
      message: `Error fetching ${type} ustas`,
      errors: [error.message]
    };
  }
};

exports.getUstaInvitations = async (ustaId, status) => {
  try {
    const where = { ustaId };
    
    // Add status filter if provided
    if (status) {
      where.status = status;
    }
    
    const invitations = await Invitation.findAll({
      where,
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    return {
      success: true,
      message: 'Usta invitations retrieved successfully',
      data: invitations
    };
  } catch (error) {
    logError(`Error fetching usta invitations: ${error.message}`);
    return {
      success: false,
      message: 'Error fetching invitations',
      errors: [error.message]
    };
  }
};

exports.respondToInvitation = async (invitationId, ustaId, responseData) => {
  try {
    const { status, message, alternativeTime } = responseData;
    
    const invitation = await Invitation.findOne({
      where: { id: invitationId, ustaId }
    });
    
    if (!invitation) {
      return {
        success: false,
        message: 'Invitation not found',
        statusCode: 404
      };
    }
    
    if (invitation.status !== 'pending') {
      return {
        success: false,
        message: `Invitation has already been ${invitation.status}`,
        statusCode: 400
      };
    }
    
    // Update invitation
    invitation.status = status;
    invitation.responseMessage = message;
    invitation.alternativeTime = alternativeTime;
    invitation.viewedAt = invitation.viewedAt || new Date();
    
    await invitation.save();
    
    return {
      success: true,
      message: `Invitation ${status} successfully`,
      data: invitation
    };
  } catch (error) {
    logError(`Error responding to invitation: ${error.message}`);
    return {
      success: false,
      message: 'Error responding to invitation',
      errors: [error.message]
    };
  }
};

exports.getUstaProfile = async (ustaId, viewerId) => {
  try {
    const usta = await User.findOne({
      where: { id: ustaId, role: 'usta' },
      include: [
        {
          model: ProfessionalDetail,
          as: 'professionalDetail'
        },
        {
          model: Portfolio,
          as: 'portfolios'
        },
        {
          model: Location,
          as: 'locations',
          where: { whoseLocation: 'usta' },
          required: false
        },
        {
          model: Availability,
          as: 'availability',
          required: false
        }
      ],
    });

    if (!usta) {
      return {
        success: false,
        message: 'Usta not found',
        statusCode: 404
      };
    }

    // Increment view count when a customer views the profile
    const viewer = await User.findByPk(viewerId);
    if (viewer && viewer.role === 'customer' && viewerId !== ustaId) {
      usta.totalViews = (usta.totalViews || 0) + 1;
      await usta.save();
    }

    return {
      success: true,
      message: 'Usta profile fetched successfully',
      data: {
        id: usta.id,
        firstName: usta.firstName,
        lastName: usta.lastName,
        email: usta.email,
        phone: usta.phone,
        profilePicture: usta.profilePicture,
        averageRating: usta.averageRating,
        totalRatings: usta.totalRatings,
        totalHires: usta.totalHires,
        totalViews: usta.totalViews,
        isVerified: usta.isVerified,
        isFeatured: usta.isFeatured,
        professionalDetail: usta.professionalDetail,
        portfolios: usta.portfolios,
        locations: usta.locations,
        availability: usta.availability
      }
    };
  } catch (error) {
    logError(`Error fetching usta profile: ${error.message}`);
    return {
      success: false,
      message: 'Error fetching usta profile',
      errors: [error.message]
    };
  }
};