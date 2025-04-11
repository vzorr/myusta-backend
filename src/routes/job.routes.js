// src/routes/job.routes.js
const express = require('express');
const router = express.Router();
const jobController = require('../controllers/job.controller');
const authenticate = require('../middlewares/authentication');
const authorized = require('../middlewares/authorized');
const validate = require('../middlewares/validate');
const { ROLES } = require('../utils/constant');
const { createJobSchema, updateJobSchema, jobIdSchema } = require('../validators/job.validator');

router.get('/:id', validate(jobIdSchema, 'params'), jobController.getJobById);
router.post('/', authenticate, authorized(ROLES.USTA), validate(createJobSchema), jobController.createJob);
router.get('/user/jobs', authenticate, jobController.getUserJobs);

module.exports = router;
