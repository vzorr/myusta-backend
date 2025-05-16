// src/routes/usta.routes.js (Updated)
const express = require('express');
const router = express.Router();
const ustaController = require('../controllers/usta.controller');
const authenticate = require('../middlewares/authentication');
const authorized = require('../middlewares/authorized');
const validate = require('../middlewares/validate');
const { ROLES } = require('../utils/constant');
const { respondToInvitationSchema } = require('../validators/usta.validator');

// Search and filter Ustas (Public)
router.get('/', ustaController.searchUstas);

// Get top-rated or popular Ustas (Public)
router.get('/top', ustaController.getTopUstas);

// Get Usta invitations (Usta only)
router.get(
  '/invitations',
  authenticate,
  authorized(ROLES.USTA),
  ustaController.getUstaInvitations
);

// Respond to invitation (Usta only)
router.patch(
  '/invitations/:id/respond',
  authenticate,
  authorized(ROLES.USTA),
  validate(respondToInvitationSchema),
  ustaController.respondToInvitation
);

// Get Usta profile by ID (accessible to both customers and ustas)
router.get(
  '/:id/profile',
  authenticate,
  ustaController.getUstaProfile
);

module.exports = router;    