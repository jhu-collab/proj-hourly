import express from "express";
import * as express_validator from "express-validator";
import * as validator from "../util/courseCalendarValidator.js";
import * as controller from "../controllers/courseCalendarController.js";
import * as courseValidator from "../util/courseValidator.js";
import * as accountValidator from "../util/accountValidator.js";
import * as officeHourValidator from "../util/officeHourValidator.js";
import { checkToken } from "../util/middleware.js";
import { factory } from "../util/debug.js";
import { off } from "process";

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
  body("begDate", "Please specify the start day of this event").notEmpty().isDate(),
  body("endDate", "Please specify the end day of this event").notEmpty().isDate(),
  body("daysOfWeek", "Please specify the days of the week where this course occurs").notEmpty().isArray(),
  // body("date", "Please specify the day of this event").notEmpty().isDate(),
  // body("agendaDescrip", "Please specify topic of the course event").notEmpty().isString(),
  // body("additionalInfo", "Please include additional information as a string").optional().isString(),
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseId,
  validator.endAfterStart,
  validator.doesCourseBeginOnDay,
  validator.isCourseInstructor,
  officeHourValidator.areValidDOW,
  officeHourValidator.startDateIsValidDOW,
  controller.create
);

router.post(
  "/changeCancellation",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  body("courseId", "Course ID is required").notEmpty().isInt(),
  body("date", "Please specify the day of this event").notEmpty().isDate(),
  body("isCancelled", "Please specify whether cancelled as boolean").notEmpty().isBoolean(),
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseId,
  validator.doesEventExist,
  validator.isCourseInstructor,
  controller.changeCancellation
);

router.post(
  "/changeRemote",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  body("courseId", "Course ID is required").notEmpty().isInt(),
  body("date", "Please specify the day of this event").notEmpty().isDate(),
  body("isRemote", "Please specify whether remote as boolean").notEmpty().isBoolean(),
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseId,
  validator.doesEventExist,
  validator.isCourseInstructor,
  controller.changeRemote
);

router.post(
  "/edit",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  body("courseId", "Course ID is required").notEmpty().isInt(),
  body("date", "Please specify the day of this event").notEmpty().isDate(),
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseId,
  validator.doesEventExist,
  validator.isEventNotCancelled,
  validator.isCourseInstructor,
  controller.editEvent
)

router.get(
  "/getAllEventsForCourse",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  params("courseId", "Course ID is required").notEmpty().isInt(),
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseIdParams,
  controller.getAllEventsForCourse
)

router.get(
  "/getAllNotCancelledEventsForCourse",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  params("courseId", "Course ID is required").notEmpty().isInt(),
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseIdParams,
  validator.isEventNotCancelled,
  controller.getAllEventsForCourse
)

router.get(
  "/getAllCancelledEventsForCourse",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  params("courseId", "Course ID is required").notEmpty().isInt(),
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseIdParams,
  validator.isEventCancelled,
  controller.getAllCancelledEventsForCourse
)

router.post(
  "/createEvent",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  body("courseId", "Course ID is required").notEmpty().isInt(),
  body("date", "Please specify the day of this event").notEmpty().isDate(),
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseId,
  validator.doesEventNotExist,
  validator.isCourseInstructor,
  officeHourValidator.areValidDOW,
  officeHourValidator.startDateIsValidDOW,
  controller.addCourseEvent
)

router.post(
  "/createRecurringEvent",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  body("courseId", "Course ID is required").notEmpty().isInt(),
  body("begDate", "Please specify the start day of this event").notEmpty().isDate(),
  body("endDate", "Please specify the end day of this event").notEmpty().isDate(),
  body("newDaysOfWeek", "Please specify the days of the week where this course occurs").notEmpty().isArray(),
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseId,
  validator.endAfterStart,
  validator.doesEventExistRecurring,
  validator.isCourseInstructor,
  officeHourValidator.areValidDOW,
  officeHourValidator.startDateIsValidDOW,
  controller.addRecurringCourseEvent
)