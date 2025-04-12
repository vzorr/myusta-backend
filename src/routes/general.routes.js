const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authentication');

const generalController = require('../controllers/general.controller');

// Get all categories
router.get('/categories', generalController.getAllCategories);

// Get meta data
router.get('/meta', generalController.getMetaData);

// Get otp 
router.get('/otp',authenticate,  generalController.getOtp);


module.exports = router;
