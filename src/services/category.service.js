const { Category, User, ProfessionalDetail } = require('../models');
const { Op } = require('sequelize');
const { logger } = require('../utils/logger');

// Get all categories with expert count and hierarchy
exports.getAllCategories = async (includeInactive = false) => {
  try {
    const whereClause = includeInactive ? {} : { isActive: true };
    
    const categories = await Category.findAll({
      where: whereClause,
      include: [
        {
          model: Category,
          as: 'subcategories',
          where: includeInactive ? {} : { isActive: true },
          required: false
        },
        {
          model: Category,
          as: 'parent',
          required: false
        }
      ],
      order: [
        ['level', 'ASC'],
        ['displayOrder', 'ASC'],
        ['name', 'ASC'],
        [{ model: Category, as: 'subcategories' }, 'displayOrder', 'ASC']
      ]
    });

    // Add expert count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const expertCount = await getExpertCountForCategory(category.key);
        
        return {
          ...category.toJSON(),
          expertCount
        };
      })
    );

    return {
      success: true,
      data: categoriesWithCount,
      message: 'Categories retrieved successfully'
    };
  } catch (error) {
    logger.error(`Error fetching categories: ${error.message}`);
    return {
      success: false,
      message: 'Failed to fetch categories',
      errors: [error.message]
    };
  }
};

// Get main categories only (for horizontal scroll)
exports.getMainCategories = async () => {
  try {
    const categories = await Category.findAll({
      where: { 
        level: 0,
        isActive: true 
      },
      order: [['displayOrder', 'ASC'], ['name', 'ASC']]
    });

    // Add expert count
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const expertCount = await getExpertCountForCategory(category.key);
        
        return {
          ...category.toJSON(),
          expertCount
        };
      })
    );

    return {
      success: true,
      data: categoriesWithCount,
      message: 'Main categories retrieved successfully'
    };
  } catch (error) {
    logger.error(`Error fetching main categories: ${error.message}`);
    return {
      success: false,
      message: 'Failed to fetch main categories',
      errors: [error.message]
    };
  }
};

// Get category with subcategories
exports.getCategoryById = async (categoryId) => {
  try {
    const category = await Category.findByPk(categoryId, {
      include: [
        {
          model: Category,
          as: 'subcategories',
          where: { isActive: true },
          required: false
        },
        {
          model: Category,
          as: 'parent',
          required: false
        }
      ]
    });

    if (!category) {
      return {
        success: false,
        message: 'Category not found',
        statusCode: 404
      };
    }

    const expertCount = await getExpertCountForCategory(category.key);

    return {
      success: true,
      data: {
        ...category.toJSON(),
        expertCount
      },
      message: 'Category retrieved successfully'
    };
  } catch (error) {
    logger.error(`Error fetching category: ${error.message}`);
    return {
      success: false,
      message: 'Failed to fetch category',
      errors: [error.message]
    };
  }
};

// Get UStas by category
exports.getUstasByCategory = async (categoryId, query = {}) => {
  try {
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return {
        success: false,
        message: 'Category not found',
        statusCode: 404
      };
    }

    // Get all category keys (including subcategories)
    const categoryKeys = await getCategoryKeys(categoryId);
    
    const { page = 1, limit = 10, city, minRating } = query;
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = {
      role: 'usta',
      status: 'active'
    };

    if (minRating) {
      whereConditions.averageRating = { [Op.gte]: parseFloat(minRating) };
    }

    // Include conditions
    const includeConditions = [
      {
        model: ProfessionalDetail,
        as: 'professionalDetail',
        where: {
          experiences: {
            [Op.contains]: categoryKeys.map(key => ({ category: key }))
          }
        },
        required: true
      }
    ];

    // Add location filter if city provided
    if (city) {
      includeConditions.push({
        model: Location,
        as: 'locations',
        where: {
          address: { [Op.iLike]: `%${city}%` }
        },
        required: true
      });
    }

    const { count, rows } = await User.findAndCountAll({
      where: whereConditions,
      include: includeConditions,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['averageRating', 'DESC'], ['totalHires', 'DESC']],
      distinct: true
    });

    return {
      success: true,
      data: {
        ustas: rows,
        category: category,
        pagination: {
          totalCount: count,
          totalPages: Math.ceil(count / limit),
          currentPage: parseInt(page),
          limit: parseInt(limit),
          hasNextPage: page < Math.ceil(count / limit),
          hasPreviousPage: page > 1
        }
      },
      message: 'Ustas retrieved successfully'
    };
  } catch (error) {
    logger.error(`Error fetching ustas by category: ${error.message}`);
    return {
      success: false,
      message: 'Failed to fetch ustas',
      errors: [error.message]
    };
  }
};

// Helper function to get expert count for a category
async function getExpertCountForCategory(categoryKey) {
  try {
    return await User.count({
      where: { role: 'usta', status: 'active' },
      include: [{
        model: ProfessionalDetail,
        as: 'professionalDetail',
        where: {
          experiences: {
            [Op.contains]: [{ category: categoryKey }]
          }
        },
        required: true
      }]
    });
  } catch (error) {
    logger.error(`Error counting experts for category ${categoryKey}: ${error.message}`);
    return 0;
  }
}

// Helper function to get all category keys including subcategories
async function getCategoryKeys(categoryId) {
  try {
    const category = await Category.findByPk(categoryId, {
      include: [{
        model: Category,
        as: 'subcategories',
        where: { isActive: true },
        required: false
      }]
    });

    const keys = [category.key];
    
    if (category.subcategories && category.subcategories.length > 0) {
      category.subcategories.forEach(sub => {
        keys.push(sub.key);
      });
    }

    return keys;
  } catch (error) {
    logger.error(`Error getting category keys: ${error.message}`);
    return [];
  }
}