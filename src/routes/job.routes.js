// src/routes/job.routes.js
const express = require('express');
const router = express.Router();
const jobController = require('../controllers/job.controller');
const authenticate = require('../middlewares/authentication');
const validate = require('../middlewares/validate');
const { createJobSchema, updateJobSchema, jobIdSchema } = require('../validators/job.validator');

router.get('/', jobController.getAllJobs);
router.get('/:id', validate(jobIdSchema, 'params'), jobController.getJobById);
router.post('/', authenticate, validate(createJobSchema), jobController.createJob);
router.put('/:id', authenticate, validate(jobIdSchema, 'params'), validate(updateJobSchema), jobController.updateJob);
router.get('/user/jobs', authenticate, jobController.getUserJobs);

module.exports = router;
