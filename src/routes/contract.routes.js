const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contract.controller');
const authenticate = require('../middlewares/authentication');
const authorized = require('../middlewares/authorized');
const validate = require('../middlewares/validate');
const { ROLES } = require('../utils/constant');
const { createContractSchema, updateContractStatusSchema } = require('../validators/contract.validator');

// POST /contract - only customers
router.post(
  '/',
  authenticate,
  authorized(ROLES.CUSTOMER),
  validate(createContractSchema),
  contractController.createContract
);

// GET /contracts/:id
router.get(
    '/:id',
    authenticate,
    contractController.getContractDetails
);

// PATCH /contracts/:id/status - only usta
router.patch(
    '/:id/status',
    authenticate,
    authorized(ROLES.USTA),
    validate(updateContractStatusSchema),
    contractController.updateContractStatus
  );

module.exports = router;