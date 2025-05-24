// src/routes/rating.routes.js
const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/rating.controller');
const authenticate = require('../middlewares/authentication');
const authorized = require('../middlewares/authorized');
const validate = require('../middlewares/validate');
const { ROLES } = require('../utils/constant');
const { 
  createRatingSchema, 
  updateRatingSchema,
  getRatingsQuerySchema 
} = require('../validators/rating.validator');

// Get reviews for authenticated usta
router.get(
  '/user', 
  authenticate, 
  authorized(ROLES.USTA),
  validate(getRatingsQuerySchema, 'query'),
  ratingController.getUserReviews
);

// Get reviews for specific usta (public)
router.get(
  '/usta/:ustaId', 
  authenticate,
  validate(getRatingsQuerySchema, 'query'),
  ratingController.getUstaReviews
);

// Create a review (customer only)
router.post(
  '/',
  authenticate,
  authorized(ROLES.CUSTOMER),
  validate(createRatingSchema),
  ratingController.createRating
);

// Update a review (customer only, own reviews)
router.patch(
  '/:id',
  authenticate,
  authorized(ROLES.CUSTOMER),
  validate(updateRatingSchema),
  ratingController.updateRating
);

// Respond to a review (usta only, own reviews)
router.post(
  '/:id/respond',
  authenticate,
  authorized(ROLES.USTA),
  ratingController.respondToRating
);

// Get rating statistics for an usta
router.get(
  '/usta/:ustaId/stats',
  authenticate,
  ratingController.getUstaRatingStats
);

module.exports = router;