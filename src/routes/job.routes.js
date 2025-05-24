// src/routes/job.routes.js - Enhanced version
const express = require('express');
const router = express.Router();
const jobController = require('../controllers/job.controller');
const authenticate = require('../middlewares/authentication');
const authorized = require('../middlewares/authorized');
const validate = require('../middlewares/validate');
const { ROLES } = require('../utils/constant');
const { 
  createJobSchema, 
  jobIdSchema, 
  jobApplicationsForCustomerSchema, 
  getUstaAppliedJobsSchema,
  paginationSchema 
} = require('../validators/job.validator');

// Fetch a specific job by ID
router.get('/:id', authenticate, validate(jobIdSchema, 'params'), jobController.getJobById);

// Create a new job (only for customers)
router.post('/', authenticate, authorized(ROLES.CUSTOMER), validate(createJobSchema), jobController.createJob);

// List all jobs posted by the authenticated user (customer)
router.get('/user/jobs', authenticate, authorized(ROLES.CUSTOMER), validate(paginationSchema, 'query'), jobController.getUserJobs);

// ========== NEW ENDPOINTS ==========
// Get completed jobs for authenticated user
router.get('/user/completed', authenticate, validate(paginationSchema, 'query'), jobController.getUserCompletedJobs);

// Get active jobs for authenticated user
router.get('/user/active', authenticate, validate(paginationSchema, 'query'), jobController.getUserActiveJobs);
// ===================================

// List all job applications for a specific job (for customer)
router.get('/:id/applications', authenticate, authorized(ROLES.CUSTOMER), validate(jobApplicationsForCustomerSchema, 'query'), jobController.getJobApplications);

// Get details for a specific job proposal
router.get('/proposals/:proposalId', authenticate, jobController.getJobProposalDetails);

// Save a job
router.post('/:id/save', authenticate, authorized(ROLES.USTA), jobController.saveJob);

// List relevant jobs listings for Usta (recommended or most recent or saved)
router.get('/usta/jobs', authenticate, authorized(ROLES.USTA), jobController.getUstaJobs);

// Create a new job proposal for a job (only for Usta)
router.post('/proposals', authenticate, authorized(ROLES.USTA), jobController.createJobProposal);

// List applied jobs for Usta (proposals)
router.get('/usta/applied-jobs', authenticate, authorized(ROLES.USTA), validate(getUstaAppliedJobsSchema, 'query'), jobController.getUstaAppliedJobs);

module.exports = router;