const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authentication');
const authorized = require('../middlewares/authorized');
const userController = require('../controllers/user.controller');
const validate = require('../middlewares/validate');
const { createUserSchema } = require('../validators/user.validator');
const { ROLES } = require('../utils/constant');

// Get usta profile by token
router.get('/ustaProfile',  authenticate, authorized(ROLES.USTA), userController.getUstaProfile);
// Get customer profile by token
router.get('/customerProfile', authenticate, authorized(ROLES.CUSTOMER), userController.getCustomerProfile);

module.exports = router;
