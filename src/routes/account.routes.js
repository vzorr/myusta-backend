const express = require('express');
const router = express.Router();
const accountController = require('../controllers/account.controller');
const authenticate = require('../middlewares/authentication');
const authorized = require('../middlewares/authorized');
const validate = require('../middlewares/validate');
const { ROLES } = require('../utils/constant');
const { customerAccountSchema, ustaAccountSchema } = require('../validators/account.validation');

// Customer and Usta account creation
router.post('/customer-creation', authenticate, authorized(ROLES.CUSTOMER), validate(customerAccountSchema), accountController.customerAccount);
router.post('/usta-creation', authenticate, authorized(ROLES.USTA), validate(ustaAccountSchema), accountController.ustaAccount);

// Profile fetching
router.get('/usta-profile/:id', authenticate, authorized(ROLES.CUSTOMER), accountController.ustaProfile);
router.get('/customer-profile/:id', authenticate, authorized(ROLES.USTA), accountController.customerProfile);

// Portfolio details of an usta
router.get('/portfolio/:id', authenticate, authorized(ROLES.CUSTOMER), accountController.getPortfolioDetails);

module.exports = router;
