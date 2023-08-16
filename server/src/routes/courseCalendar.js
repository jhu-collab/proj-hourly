import express from "express";
import * as express_validator from "express-validator";
import * as validator from "../util/courseCalendarValidator.js";
import * as controller from "../controllers/courseCalendarController.js";
import * as courseValidator from "../util/courseValidator.js";
import * as accountValidator from "../util/accountValidator.js";
import { checkToken } from "../util/middleware.js";
import { factory } from "../util/debug.js";

const debug = factory(import.meta.url);
const router = express.Router();
const body = express_validator.body;
const param = express_validator.param;

router.use(checkToken);

/**
 * Route to create a new course event.
 */
router.post(
  "/create",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  body("courseId", "Course ID is required").notEmpty().isInt(),
  body("begDate", "Please specify the start day of this event").notEmpty(),
  body("endDate", "Please specify the end day of this event").notEmpty(),
  body("daysOfWeek", "Please specify the days of the week of this course")
    .notEmpty()
    .isArray(),
  body("location", "Please specify location").notEmpty().isString(),
  body("title", "Please specify topic of the course event")
    .notEmpty()
    .isString(),
  body("additionalInfo", "Please include additional information as a string")
    .optional()
    .isString(),
  body("isRemote", "Please specify whether remote or not")
    .notEmpty()
    .isBoolean(),
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseId,
  validator.endAfterStart,
  validator.doesCourseBeginOnDay,
  validator.isCourseInstructor,
  validator.areValidDOW,
  validator.startDateIsValidDOW,
  validator.doesEventExistRecurring,
  validator.begDateInFuture,
  validator.isUTCTwo,
  controller.create
);

/**
 * Route to change the cancellation status of a course event.
 */
router.post(
  "/changeCancellation",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  body("courseId", "Course ID is required").notEmpty().isInt(),
  body("date", "Please specify the day of this event").notEmpty(),
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseId,
  validator.doesEventExist,
  validator.isCourseInstructor,
  validator.dateInFuture,
  validator.isUTC0,
  controller.changeCancellation
);

/**
 * Route to change the remote status of a course event.
 */
router.post(
  "/changeRemote",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  body("courseId", "Course ID is required").notEmpty().isInt(),
  body("date", "Please specify the day of this event").notEmpty(),
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseId,
  validator.doesEventExist,
  validator.isCourseInstructor,
  validator.dateInFuture,
  validator.isUTC0,
  controller.changeRemote
);

/**
 * Route to edit a course event.
 */
router.post(
  "/edit",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  body("courseId", "Course ID is required").notEmpty().isInt(),
  body("date", "Please specify the day of this event").notEmpty(),
  body("newDate", "Please specify the day of this event").notEmpty(),
  body("title", "Agenda is required").notEmpty().isString(),
  body("additionalInfo", "Please specify additionalInfo").optional().isString(),
  body("isCancelled", "Please specify whether cancelled or not")
    .notEmpty()
    .isBoolean(),
  body("isRemote", "Please specify whether remote or not")
    .notEmpty()
    .isBoolean(),
  body("location", "Please specify location").notEmpty().isString(),
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseId,
  validator.doesEventExist,
  validator.isCourseInstructor,
  validator.dateInFuture,
  validator.newDateNotOldDate,
  validator.newDateInFuture,
  validator.isUTCTwoNewDate,
  controller.editEvent
);

/**
 * Route to edit the title of a course event.
 */
router.post(
  "/editTitle",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  body("courseId", "Course ID is required").notEmpty().isInt(),
  body("date", "Please specify the day of this event").notEmpty(),
  body("title", "Agenda is required").notEmpty().isString(),
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseId,
  validator.doesEventExist,
  validator.isCourseInstructor,
  validator.dateInFuture,
  validator.isUTC0,
  controller.editEventTitle
);

/**
 * Route to edit the location of a course event.
 */
router.post(
  "/editLocation",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  body("courseId", "Course ID is required").notEmpty().isInt(),
  body("date", "Please specify the day of this event").notEmpty(),
  body("location", "Please specify location").notEmpty().isString(),
  body("isRemote", "Please specify whether remote or not")
    .notEmpty()
    .isBoolean(),
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseId,
  validator.doesEventExist,
  validator.isCourseInstructor,
  validator.dateInFuture,
  validator.isUTC0,
  controller.editEventLocation
);

/**
 * Route to get all events for a course.
 */
router.get(
  "/getAllEventsForCourse/:courseId",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  param("courseId", "Course ID is required").notEmpty().isInt(),
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseIdParams,
  validator.isInCourse,
  controller.getAllEventsForCourse
);

/**
 * Route to get all non-cancelled events for a course.
 */
router.get(
  "/getAllNotCancelledEventsForCourse/:courseId",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  param("courseId", "Course ID is required").notEmpty().isInt(),
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseIdParams,
  validator.isInCourse,
  controller.getAllEventsForCourse
);

/**
 * Route to get all cancelled events for a course.
 */
router.get(
  "/getAllCancelledEventsForCourse/:courseId",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  param("courseId", "Course ID is required").notEmpty().isInt(),
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseIdParams,
  validator.isInCourse,
  controller.getAllCancelledEventsForCourse
);

/**
 * Route to create a single event for a course.
 */
router.post(
  "/createEvent",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  body("courseId", "Course ID is required").notEmpty().isInt(),
  body("date", "Please specify the day of this event").notEmpty(),
  body("location", "Please specify location").notEmpty().isString(),
  body("title", "Please specify topic of the course event")
    .notEmpty()
    .isString(),
  body("additionalInfo", "Please include additional information as a string")
    .optional()
    .isString(),
  body("isRemote", "Please specify whether remote or not")
    .notEmpty()
    .isBoolean(),
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseId,
  validator.doesEventNotExist,
  validator.isCourseInstructor,
  validator.dateInFuture,
  validator.isUTC0,
  controller.addCourseEvent
);

/**
 * Route to create new recurring events for a course (which already has course events).
 */
router.post(
  "/createRecurringEvent",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  body("courseId", "Course ID is required").notEmpty().isInt(),
  body("begDate", "Please specify the start day of this event").notEmpty(),
  body("endDate", "Please specify the end day of this event").notEmpty(),
  body("daysOfWeek", "Please specify the days of the week of this course")
    .notEmpty()
    .isArray(),
  body("location", "Please specify location").notEmpty().isString(),
  body("title", "Please specify topic of the course event")
    .notEmpty()
    .isString(),
  body("additionalInfo", "Please include additional information as a string")
    .optional()
    .isString(),
  body("isRemote", "Please specify whether remote or not")
    .notEmpty()
    .isBoolean(),
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseId,
  validator.endAfterStart,
  validator.doesEventExistRecurring,
  validator.isCourseInstructor,
  validator.areValidDOW,
  validator.startDateIsValidDOW,
  validator.begDateInFuture,
  validator.isUTCTwo,
  controller.addRecurringCourseEvent
);

/**
 * Route to get an event on a specific day for a given course.
 */
router.get(
  "/getEventOnDay/:courseId/date/:date",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  param("courseId", "Course ID is required").notEmpty().isInt(),
  param("date", "Date is required").notEmpty(),
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseIdParams,
  validator.isInCourse,
  validator.dateInFutureParams,
  validator.isUTC0Params,
  controller.getEventOnDay
);

/**
 * Route to delete a course event by its ID on a certain date.
 */
router.delete(
  "/deleteCourse/:courseId",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  param("courseId", "Course ID is required").notEmpty().isInt(),
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseIdParams,
  validator.isCourseInstructorParams,
  controller.deleteCourse
);

/**
 * Route to delete all events for a course by its ID.
 */
router.delete(
  "/deleteCourse/:courseId/date/:date",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  param("courseId", "Course ID is required").notEmpty().isInt(),
  param("date", "Date is required").notEmpty(),
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseIdParams,
  validator.isCourseInstructorParams,
  validator.dateInFutureParams,
  validator.doesEventExistParams,
  validator.dateInFutureParams,
  validator.isUTC0Params,
  controller.deleteCourseOnDay
);

export default router;
