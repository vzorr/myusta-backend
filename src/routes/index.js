const express = require('express');
const router = express.Router();
const userRoutes = require('./user.routes');
const authRoutes = require('./auth.routes');
const accountRoutes = require('./account.routes');
const generalRoutes = require('./general.routes');
const jobRoutes = require('./job.routes');
const contractRoutes = require('./contract.routes');
const categoryRoutes  =require('./category.routes');

router.use('/auth', authRoutes)
router.use('/general', generalRoutes);
router.use('/users', userRoutes);
router.use('/account', accountRoutes);
router.use('/jobs', jobRoutes);
router.use('/contracts', contractRoutes);
router.use('/categories', categoryRoutes); // ADD THIS

module.exports = router;
