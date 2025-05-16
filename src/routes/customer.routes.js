// src/routes/customer.routes.js
const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const authenticate = require('../middlewares/authentication');
const authorized = require('../middlewares/authorized');
const validate = require('../middlewares/validate');
const { ROLES } = require('../utils/constant');
const { inviteUstaSchema } = require('../validators/customer.validator');

// Send invitation to Usta (Customer only)
router.post(
  '/invite-usta/:id',
  authenticate,
  authorized(ROLES.CUSTOMER),
  validate(inviteUstaSchema),
  customerController.inviteUsta
);

// Get invitations sent by customer (Customer only)
router.get(
  '/invitations',
  authenticate,
  authorized(ROLES.CUSTOMER),
  customerController.getCustomerInvitations
);

//removed viewUstaProfile route

module.exports = router;