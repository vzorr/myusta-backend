const express = require('express');
const router = express.Router();
const userRoutes = require('./user.routes');
const authRoutes = require('./auth.routes');
const accountRoutes = require('./account.routes');
const generalRoutes = require('./general.routes');
const jobRoutes = require('./job.routes');
const contractRoutes = require('./contract.routes');
const categoryRoutes = require('./category.routes');
const customerRoutes = require('./customer.routes');
const ustaRoutes = require('./usta.routes');
const ratingRoutes = require('./rating.routes'); // NEW

router.use('/auth', authRoutes);
router.use('/general', generalRoutes);
router.use('/users', userRoutes);
router.use('/account', accountRoutes);
router.use('/jobs', jobRoutes);
router.use('/contracts', contractRoutes);
router.use('/categories', categoryRoutes);
router.use('/customers', customerRoutes);
router.use('/ustas', ustaRoutes);
router.use('/reviews', ratingRoutes); // NEW - Using 'reviews' as per your API spec

module.exports = router;