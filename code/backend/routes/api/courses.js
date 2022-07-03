const express = require('express');
const { body } = require('express-validator');
const validator = require('../../middleware/courseValidator');
const controller = require('../../controllers/courseController');
const accountValidator = require('../../middleware/accountValidator');
const officeHourController = require('../../controllers/officeHourController');

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
  body('code', 'Course code is required').notEmpty(),
  body('id', 'Account id is required').isInt(),
  accountValidator.isAccountIdValid,
  validator.isCourseCode,
  controller.register,
);

router.get(
  '/:courseId/officeHours',
  accountValidator.isAccountValidHeader,
  validator.isCourseIdParams,
  validator.isInCourseFromHeader,
  officeHourController.getForCourse,
);

router.get(
  '/:courseId/topicCounts',
  accountValidator.isAccountValidHeader,
  validator.isCourseIdParams,
  accountValidator.isAccountInstructor,
  controller.getTopicCounts,
);

router.post(
  '/createTopic',
  body('courseId', 'must include courseid for a topic').notEmpty(),
  body('value', 'must include a value for the topic').notEmpty(),
  accountValidator.isAccountValidHeader,
  validator.isCourseId,
  accountValidator.isAccountInstructorBody,
  validator.isNotDuplicateTopic,
  controller.createTopic,
);

router.get(
  '/:courseId/studentRegistrationCounts',
  accountValidator.isAccountValidHeader,
  validator.isCourseIdParams,
  accountValidator.isAccountInstructor,
  controller.getRegistrationStudentCounts,
);

module.exports = router;
