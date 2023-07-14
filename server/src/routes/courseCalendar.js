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

router.post(
  "/create",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  body("courseId", "Course ID is required").notEmpty().isInt(),
  body("begDate", "Please specify the start day of this event").notEmpty(),
  body("endDate", "Please specify the end day of this event").notEmpty(),
  body("daysOfWeek", "Please specify the days of the week where this course occurs").notEmpty().isArray(),
  body("location", "Please specify location").notEmpty().isString(),
  // body("date", "Please specify the day of this event").notEmpty(),
  // body("agendaDescrip", "Please specify topic of the course event").notEmpty().isString(),
  // body("additionalInfo", "Please include additional information as a string").optional().isString(),
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseId,
  validator.endAfterStart,
  validator.doesCourseBeginOnDay,
  validator.isCourseInstructor,
  validator.areValidDOW,
  validator.startDateIsValidDOW,
  validator.doesNotHaveCourseEvents,
  validator.isUTCTwo,
  controller.create
);

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
  validator.isUTC0,
  controller.changeCancellation
);

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
  validator.isUTC0,
  controller.changeRemote
);

router.post(
  "/edit",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  body("courseId", "Course ID is required").notEmpty().isInt(),
  body("date", "Please specify the day of this event").notEmpty(),
  body("newDate", "Please specify the day of this event").notEmpty(),
  body("agendaDescrip", "Agenda is required").notEmpty().isString(),
  body("additionalInfo", "Please specify additionalInfo").optional().isString(),
  body("isCancelled", "Please specify whether cancelled or not").notEmpty().isBoolean(),
  body("isRemote", "Please specify whether remote or not").notEmpty().isBoolean(),
  body("location", "Please specify location").notEmpty().isString(),
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseId,
  validator.doesEventExist,
  validator.isEventNotCancelled,
  validator.isCourseInstructor,
  validator.isEventInFuture,
  validator.NewDateNotOldDate,
  validator.isUTCTwo,
  controller.editEvent
)

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
)

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
)

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
)

router.post(
  "/createEvent",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  body("courseId", "Course ID is required").notEmpty().isInt(),
  body("date", "Please specify the day of this event").notEmpty(),
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseId,
  validator.doesEventNotExist,
  validator.isCourseInstructor,
  validator.isUTC0,
  controller.addCourseEvent
)

router.post(
  "/createRecurringEvent",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  body("courseId", "Course ID is required").notEmpty().isInt(),
  body("begDate", "Please specify the start day of this event").notEmpty(),
  body("endDate", "Please specify the end day of this event").notEmpty(),
  body("daysOfWeek", "Please specify the days of the week where this course occurs").notEmpty().isArray(),
  body("location", "Please specify location").notEmpty().isString(),
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseId,
  validator.endAfterStart,
  validator.doesEventExistRecurring,
  validator.isCourseInstructor,
  validator.areValidDOW,
  validator.startDateIsValidDOW,
  validator.isUTCTwo,
  controller.addRecurringCourseEvent
)

// router.post(
//   "/editAllEventsForCourse",
//   async (req, res, next) => {
//     debug(`${req.method} ${req.path} called...`);
//     next();
//   },
//   body("courseId", "Course ID is required").notEmpty().isInt(),
//   body("agendaDescrip", "Agenda is required").notEmpty().isString(),
//   body("additionalInfo", "Please specify additionalInfo").optional().isString(),
//   body("isCancelled", "Please specify whether cancelled or not").notEmpty().isBoolean(),
//   body("isRemote", "Please specify whether remote or not").notEmpty().isBoolean(),
//   body("location", "Please specify location").notEmpty().isString(),
//   accountValidator.isAccountValidHeader,
//   courseValidator.isCourseId,
//   validator.doesEventExist,
//   validator.isEventNotCancelled,
//   validator.isCourseInstructor,
//   controller.editAllEvents
// )

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
  validator.isUTC0,
  controller.getEventOnDay
)

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
)

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
  validator.isEventInFutureByIdParams,
  validator.isUTC0,
  controller.deleteCourseOnDay
)

export default router;