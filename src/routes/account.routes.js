const express = require('express');
const router = express.Router();
const accountController = require('../controllers/account.controller');
const authenticate = require('../middlewares/authentication');
const authorized = require('../middlewares/authorized');
const validate = require('../middlewares/validate');
const upload = require('../middlewares/multer');
const { ROLES } = require('../utils/constant');
const { customerAccountSchema,ustaAccountSchema } = require('../validators/account.validation');


// // Handle multipart/form-data with any files
// router.post(
//     '/customer-creation',
//     authenticate,
//     authorized(ROLES.CUSTOMER),
//     upload.single('profilePicture'), // Assuming the field name is 'profilePicture'
//     validate(customerAccountSchema),
//     accountController.customerAccount
// );
router.post(
    '/customer-creation',
    authenticate,
    authorized(ROLES.CUSTOMER),
    validate(customerAccountSchema),
    accountController.customerAccount
);
router.post('/usta-creation', authenticate, authorized(ROLES.USTA), validate(ustaAccountSchema), accountController.ustaAccount);

// Fetch a specific ustaprofile by ID in customer app
router.get('/usta-profile/:id', authenticate, authorized(ROLES.CUSTOMER), accountController.ustaProfile);
// Fetch a specific customer profile by ID in ustaprofile app
router.get('/customer-profile/:id', authenticate, authorized(ROLES.USTA), accountController.customerProfile);


module.exports = router;
