const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');

// Get all categories with hierarchy
router.get('/', categoryController.getAllCategories);

// Get main categories (for horizontal scroll)
router.get('/main', categoryController.getMainCategories);

// Get specific category by ID
router.get('/:id', categoryController.getCategoryById);

// Get ustas by category
router.get('/:id/ustas', categoryController.getUstasByCategory);

module.exports = router;