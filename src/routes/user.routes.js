const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const validate = require('../middlewares/validate');
const { createUserSchema } = require('../validators/user.validator');

router.get('/', userController.getAllUsers);
router.post('/', validate(createUserSchema), userController.createUser);
router.get('/:id', userController.getUserById);

module.exports = router;
