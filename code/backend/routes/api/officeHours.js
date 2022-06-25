const express = require('express');
const { body } = require('express-validator');
const accountValidator = require('../../middleware/accountValidator');
const courseValidator = require('../../middleware/courseValidator');
// const validator = require('../../middleware/officeHourValidator');
const timeValidator = require('../../middleware/timeValidator');
const controller = require('../../controllers/officeHourController');

const router = express.Router();

router.post(
  '/create',
  body('courseId', 'Course is required').isInt(),
  body('startTime', 'Please specify what time this event starts').notEmpty(),
  body('endTime', 'Please specify what time this event ends').notEmpty(),
  body(
    'recurringEvent',
    'Please specify if this is a recurring event',
  ).isBoolean(),
  body('startDate', 'Please specify what date this event starts').notEmpty(),
  body('endDate', 'Please specify what date this event ends').notEmpty(),
  body(
    'location',
    'Please specify a location for your office hours',
  ).notEmpty(),
  body(
    'daysOfWeek',
    'Please include which days of the week for the office hours',
  )
    .isArray()
    .notEmpty(),
  body(
    'timeInterval',
    'Please include a positive integer for time interval',
  ).isInt({ min: 1 }),
  body('hosts', 'Please include the staff ID(s) hosting the office hours')
    .isArray()
    .notEmpty(),
  accountValidator.areAccountsIdsValid,
  courseValidator.isCourseId,
  courseValidator.areCourseStaffOrInstructor,
  timeValidator.isTime,
  // validator.noConflictsWithHosts,
  controller.create,
);

module.exports = router;
