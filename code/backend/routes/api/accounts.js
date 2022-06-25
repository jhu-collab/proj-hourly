const express = require('express');
const { body } = require('express-validator');
const validator = require('../../middleware/accountValidator');
const controller = require('../../controllers/accountController');

const router = express.Router();

router.post(
  '/signup',
  body('email', 'Email is required').isEmail(),
  body('name', 'Name is required').notEmpty(),
  body('phoneNumber').optional().isMobilePhone(),
  validator.isUniqueEmail,
  validator.isUniquePhone,
  controller.create,
);

router.post(
  '/login',
  body('email', 'Email is required').isEmail(),
  validator.emailExists,
  controller.login,
);

// requires the id in the header for now, will be replaced with token later
router.get('/me/courses', controller.getCourses);

module.exports = router;
