// src/routes/job.routes.js
const express = require('express');
const router = express.Router();
const jobController = require('../controllers/job.controller');
const authenticate = require('../middlewares/authentication');
const authorized = require('../middlewares/authorized');
const validate = require('../middlewares/validate');
const { ROLES } = require('../utils/constant');
const { createJobSchema, jobIdSchema } = require('../validators/job.validator');

// Fetch a specific job by ID (requires authentication)
router.get('/:id', authenticate, validate(jobIdSchema, 'params'), jobController.getJobById);

// Save a job
router.post('/:id/save', authenticate, authorized(ROLES.USTA), jobController.saveJob);

// Create a new job (only for customers)
router.post('/', authenticate, authorized(ROLES.CUSTOMER), validate(createJobSchema), jobController.createJob);

// List all jobs posted by the authenticated user (customer)
router.get('/user/jobs', authenticate, authorized(ROLES.CUSTOMER), jobController.getUserJobs);

// List relevant jobs listings for Usta (recommended or most recent or saved)
router.get('/usta/jobs', authenticate, authorized(ROLES.USTA), jobController.getUstaJobs);

// Create a new job proposal for a job (only for Usta)
router.post('/proposals', authenticate, authorized(ROLES.USTA), jobController.createJobProposal);

// List applied jobs for Usta (proposals)
router.get('/usta/applied-jobs', authenticate, authorized(ROLES.USTA), jobController.getUstaAppliedJobs);

module.exports = router;
