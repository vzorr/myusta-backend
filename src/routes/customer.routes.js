// src/routes/customer.routes.js
const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const authenticate = require('../middlewares/authentication');
const authorized = require('../middlewares/authorized');
const validate = require('../middlewares/validate');
const { ROLES } = require('../utils/constant');
const { 
  inviteUstaSchema, 
  cancelInvitationSchema,
  getInvitationsQuerySchema,
  getRecommendedUstasSchema,
  uuidParamSchema,
  updatePreferencesSchema
} = require('../validators/customer.validator');

// Send invitation to Usta (Customer only)
router.post(
  '/invite-usta/:id',
  authenticate,
  authorized(ROLES.CUSTOMER),
  validate(uuidParamSchema, 'params'),
  validate(inviteUstaSchema),
  customerController.inviteUsta
);

// Get invitations sent by customer (Customer only)
router.get(
  '/invitations',
  authenticate,
  authorized(ROLES.CUSTOMER),
  validate(getInvitationsQuerySchema, 'query'),
  customerController.getCustomerInvitations
);

// Cancel an invitation (Customer only)
router.patch(
  '/invitations/:id/cancel',
  authenticate,
  authorized(ROLES.CUSTOMER),
  validate(uuidParamSchema, 'params'),
  validate(cancelInvitationSchema),
  customerController.cancelInvitation
);


// Get customer dashboard statistics (Customer only)
router.get(
  '/stats',
  authenticate,
  authorized(ROLES.CUSTOMER),
  customerController.getCustomerStats
);

// Get recommended Ustas (Customer only)
router.get(
  '/recommended-ustas',
  authenticate,
  authorized(ROLES.CUSTOMER),
  validate(getRecommendedUstasSchema, 'query'),
  customerController.getRecommendedUstas
);

// Update customer preferences (Customer only)
router.patch(
  '/preferences',
  authenticate,
  authorized(ROLES.CUSTOMER),
  validate(updatePreferencesSchema),
  customerController.updatePreferences
);

// Get customer's favorite Ustas (Customer only)
router.get(
  '/favorites',
  authenticate,
  authorized(ROLES.CUSTOMER),
  customerController.getFavoriteUstas
);

// Add Usta to favorites (Customer only)
router.post(
  '/favorites/:id',
  authenticate,
  authorized(ROLES.CUSTOMER),
  validate(uuidParamSchema, 'params'),
  customerController.addToFavorites
);

// Remove Usta from favorites (Customer only)
router.delete(
  '/favorites/:id',
  authenticate,
  authorized(ROLES.CUSTOMER),
  validate(uuidParamSchema, 'params'),
  customerController.removeFromFavorites
);

module.exports = router;