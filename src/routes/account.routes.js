const express = require('express');
const router = express.Router();
const accountController = require('../controllers/account.controller');
const authenticate = require('../middlewares/authentication');
const validate = require('../middlewares/validate');
const { customerAccountSchema, ustaAccountSchema  } = require('../validators/account.validation');

// Account Creation/Update Route
router.post('/customer-account', authenticate, validate(customerAccountSchema), accountController.customerAccount);
router.post('/usta-account', authenticate, validate(ustaAccountSchema), accountController.ustaAccount);


module.exports = router;
