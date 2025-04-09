// src/routes/job.routes.js
const express = require('express');
const router = express.Router();
const jobController = require('../controllers/job.controller');
const { authenticate } = require('../middlewares/auth'); // Assuming you have an auth middleware
// const validate = require('../middlewares/validate');
// const { createJobSchema } = require('../validators/job.validator');

// Get job by ID
router.get('/:id', jobController.getJobById);

// Create new job (requires authentication)
router.post('/', authenticate, /* validate(createJobSchema), */ jobController.createJob);

// Get authenticated user's jobs
router.get('/user/jobs', authenticate, jobController.getUserJobs);

module.exports = router;