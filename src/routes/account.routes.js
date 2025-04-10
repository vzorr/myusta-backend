const express = require('express');
const router = express.Router();
const accountController = require('../controllers/account.controller');
const authenticate = require('../middlewares/authentication');
const authorized = require('../middlewares/authorized');
const validate = require('../middlewares/validate');
const { ROLES } = require('../utils/constant');
const { customerAccountSchema, ustaAccountSchema  } = require('../validators/account.validation');


// Account Creation/Update Route
router.post('/customer-creation', authenticate, authorized(ROLES.CUSTOMER), validate(customerAccountSchema), accountController.customerAccount);
router.post('/usta-creation', authenticate, authorized(ROLES.USTA), validate(ustaAccountSchema), accountController.ustaAccount);


module.exports = router;
