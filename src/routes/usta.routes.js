// src/routes/usta.routes.js
const express = require('express');
const router = express.Router();
const ustaController = require('../controllers/usta.controller');
const authenticate = require('../middlewares/authentication');
const authorized = require('../middlewares/authorized');
const { ROLES } = require('../utils/constant');

// Search and filter Ustas
router.get('/', ustaController.searchUstas);

// Get top-rated or popular Ustas
router.get('/top', ustaController.getTopUstas);

// Send invitation to Usta
router.post(
  '/:id/invite',
  authenticate,
  authorized(ROLES.CUSTOMER),
  ustaController.inviteUsta
);

module.exports = router;

// Then in src/routes/index.js add:
const ustaRoutes = require('./usta.routes');
router.use('/ustas', ustaRoutes);