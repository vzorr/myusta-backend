// src/services/usta.service.js
const { User, ProfessionalDetail, Location, Availability, Portfolio } = require('../models');
const { Op, Sequelize } = require('sequelize');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');

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
          cos(radians(latitude)) * cos(radians(longitude) - 
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
      ? [['createdAt', 'ASC']] // Simulating oldest users as highest rated
      : [['createdAt', 'DESC']]; // Simulating newest users as most popular
    
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
      experiences: usta.professionalDetail?.experiences || []
      // Add rating info when implemented
    }));
    
    return {
      success: true,
      data: formattedUstas
    };
  } catch (error) {
    return {
      success: false,
      message: `Error fetching ${type} ustas`,
      errors: [error.message]
    };
  }
};

exports.inviteUsta = async (ustaId, customerId, inviteData) => {
  try {
    const { message, jobId, time } = inviteData;
    
    // Check if Usta exists
    const usta = await User.findOne({
      where: { id: ustaId, role: 'usta', status: 'active' }
    });
    
    if (!usta) {
      return {
        success: false,
        message: 'Usta not found or inactive',
        errors: ['Usta not found or inactive']
      };
    }
    
    // Create invitation record
    // Note: You would need to create an Invitation model
    // For now, we'll simulate the invite as successful
    
    return {
      success: true,
      message: 'Invitation sent successfully',
      data: {
        invitationId: 'simulated-id-' + Date.now(),
        ustaId,
        customerId,
        message,
        jobId,
        time,
        status: 'pending'
      }
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error sending invitation',
      errors: [error.message]
    };
  }
};