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
  body("courseId", "Course ID is required").notEmpty.isInt(),
  body("date", "Please specify the day of this event").notEmpty.isDate(),
  body("agendaDescrip", "Please specify topic of the course event").notEmpty().isString(),
  body("additionalInfo", "Please include additional information as a string").optional().isString(),
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseId,
  validator.endAfterStart,
  validator.isCourseOnDay,
  controller.create
);

router.post(
  "/changeCancellation",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  body("courseId", "Course ID is required").notEmpty.isInt(),
  body("date", "Please specify the day of this event").notEmpty.isDate(),
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseId,
  validator.doesEventExist,
  controller.changeCancellation
);

router.post(
  "/edit",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  body("courseId", "Course ID is required").notEmpty.isInt(),
  body("date", "Please specify the day of this event").notEmpty.isDate(),
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseId,
  validator.doesEventExist,
  validator.isEventNotCancelled,
  controller.editEvent
)

router.get(
  "/getAllEventsForCourse",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  body("courseId", "Course ID is required").notEmpty.isInt(),
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseId,
  validator.doesEventExist,
  controller.getAllEventsForCourse
)

router.get(
  "/getAllNotCancelledEventsForCourse",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  body("courseId", "Course ID is required").notEmpty.isInt(),
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseId,
  validator.doesEventExist,
  validator.isEventNotCancelled,
  controller.getAllEventsForCourse
)

router.get(
  "/getAllCancelledEventsForCourse",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  body("courseId", "Course ID is required").notEmpty.isInt(),
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseId,
  validator.doesEventExist,
  validator.isEventCancelled,
  controller.getAllCancelledEventsForCourse
)