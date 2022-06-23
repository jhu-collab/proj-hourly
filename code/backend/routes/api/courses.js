const express = require('express');
const { body } = require('express-validator');
const validator = require('../../middleware/courseValidator');
const controller = require('../../controllers/courseController');
const accountValidator = require('../../middleware/accountValidator');

const router = express.Router();

router.post(
  '/',
  body('title', 'Course title is required').notEmpty(),
  body('number', 'Course number is required').notEmpty(),
  body('semester', 'Semester is required').isIn([
    'Spring',
    'Summer',
    'Fall',
    'Winter',
  ]),
  body('year', 'A valid year is required').isInt({
    min: new Date().getFullYear(),
  }),
  validator.isUniqueCourse,
  controller.create,
);

router.post(
  '/signup',
  body('code', 'Course code is required').isAlphanumeric(),
  body('id', 'Account id is required').isInt(),
  accountValidator.isAccountIdValid,
  validator.isCourseCode,
  controller.register,
);

module.exports = router;
