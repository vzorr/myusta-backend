const express = require('express');
const router = express.Router();

const generalController = require('../controllers/general.controller');

// Get all preferences
router.get('/preferences', generalController.getAllPreferences);

// Get meta data
router.get('/meta', generalController.getMetaData);


module.exports = router;
