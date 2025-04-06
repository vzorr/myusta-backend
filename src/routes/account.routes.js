const express = require('express');
const router = express.Router();
const accountController = require('../controllers/account.controller');
const authenticate = require('../middlewares/authentication');
const validate = require('../middlewares/validate');
const { userBasicInfoSchema } = require('../validators/account.validation');

// Account Creation/Update Route
router.post('/creation', authenticate, validate(userBasicInfoSchema), accountController.accountCreation);

module.exports = router;
