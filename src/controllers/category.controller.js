const categoryService = require('../services/category.service');
const { successResponse, errorResponse } = require('../utils/response');

// Get all categories with hierarchy
exports.getAllCategories = async (req, res) => {
  try {
    const { includeInactive = false } = req.query;
    const result = await categoryService.getAllCategories(includeInactive === 'true');
    
    if (!result.success) {
      return errorResponse(res, result.message, result.errors, 500);
    }

    return successResponse(res, result.message, result.data);
  } catch (error) {
    return errorResponse(res, 'Error fetching categories', [error.message], 500);
  }
};

// Get main categories for horizontal scroll
exports.getMainCategories = async (req, res) => {
  try {
    const result = await categoryService.getMainCategories();
    
    if (!result.success) {
      return errorResponse(res, result.message, result.errors, 500);
    }

    return successResponse(res, result.message, result.data);
  } catch (error) {
    return errorResponse(res, 'Error fetching main categories', [error.message], 500);
  }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await categoryService.getCategoryById(id);
    
    if (!result.success) {
      return errorResponse(res, result.message, result.errors, result.statusCode || 500);
    }

    return successResponse(res, result.message, result.data);
  } catch (error) {
    return errorResponse(res, 'Error fetching category', [error.message], 500);
  }
};

// Get ustas by category
exports.getUstasByCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const query = req.query;
    const result = await categoryService.getUstasByCategory(id, query);
    
    if (!result.success) {
      return errorResponse(res, result.message, result.errors, result.statusCode || 500);
    }

    return successResponse(res, result.message, result.data);
  } catch (error) {
    return errorResponse(res, 'Error fetching ustas by category', [error.message], 500);
  }
};