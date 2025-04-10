const express = require('express');
const router = express.Router();
const userRoutes = require('./user.routes');
const authRoutes = require('./auth.routes');
const accountRoutes = require('./account.routes');
const generalRoutes = require('./general.routes');

router.use('/auth', authRoutes)
router.use('/general', generalRoutes);
router.use('/users', userRoutes);
router.use('/account', accountRoutes);
router.use('/jobs', jobRoutes);


module.exports = router;
