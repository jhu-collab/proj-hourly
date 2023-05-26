import express from "express";
import * as express_validator from "express-validator";
import * as accountValidator from "../util/accountValidator.js";
import * as courseValidator from "../util/courseValidator.js";
import * as validator from "../util/officeHourValidator.js";
import * as timeValidator from "../util/timeValidator.js";
import * as controller from "../controllers/officeHourController.js";
import * as dateValidator from "../util/dateValidator.js";
import { checkToken } from "../util/middleware.js";
import { factory } from "../util/debug.js";

const debug = factory(import.meta.url);

const router = express.Router();
const body = express_validator.body;

router.use(checkToken);

router.post(
  "/create",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  body("courseId", "Course is required").isInt(),
  body(
    "recurringEvent",
    "Please specify if this is a recurring event"
  ).isBoolean(),
  body("startDate", "Please specify what date this event starts").notEmpty(),
  body("endDate", "Please specify what date this event ends").notEmpty(),
  body(
    "location",
    "Please specify a location for your office hours"
  ).notEmpty(),
  body(
    "daysOfWeek",
    "Please include which days of the week for the office hours"
  )
    .isArray()
    .notEmpty(),
  body("hosts", "Please include the staff ID(s) hosting the office hours")
    .isArray()
    .notEmpty(),
  accountValidator.areAccountsIdsValid,
  courseValidator.isCourseId,
  courseValidator.areCourseStaffOrInstructor,
  dateValidator.officeHourDateCheck,
  validator.durationIsMultipleof5,
  //timeValidator.isTime,
  //validator.areValidDOW,
  // validator.noConflictsWithHosts,
  controller.create
);

router.post(
  "/register",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  body("officeHourId", "Office Hour is required").isInt(),
  body("startTime", "Please include a startTime").notEmpty(),
  body("endTime", "Please include an endtime").notEmpty(),
  body("date", "Please include a date").notEmpty(),
  body("question", "Please include questions as a string")
    .optional()
    .isString(),
  body("TopicIds", "Please include topics as an array").optional().isArray(),
  body("timeOptionId", "Please include a time option id").notEmpty().isInt(),
  accountValidator.isAccountValidHeader,
  validator.doesOfficeHourExist,
  courseValidator.isInCourseForOfficeHour,
  validator.getDatesForOfficeHour,
  validator.isDateInFuture,
  validator.isOfficeHourOnDay,
  validator.isWithinTimeOffering,
  validator.isTimeAvailable,
  validator.isUserNotRegistered,
  validator.isRegistrationInFuture,
  courseValidator.areTopicsForCourse,
  validator.isTimeLengthForCourse,
  validator.isTimeCorrectInterval,
  courseValidator.isWithinRegisterConstraint,
  controller.register
);

router.post(
  "/cancelOnDate",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  body("officeHourId", "Office Hour is required").isInt(),
  body("date", "Date is required").notEmpty(),
  accountValidator.isAccountValidHeader,
  validator.doesOfficeHourExist,
  courseValidator.isInCourseForOfficeHour,
  validator.isOfficeHourHostOrInstructor,
  validator.getDatesForOfficeHour,
  validator.isOfficeHourOnDay,
  validator.officeHoursHasNotBegun,
  controller.cancelOnDate
);

router.post(
  "/cancelAll",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  body("officeHourId", "Office Hour is required").isInt(),
  body("date", "Date is required").optional(),
  accountValidator.isAccountValidHeader,
  validator.doesOfficeHourExist,
  courseValidator.isInCourseForOfficeHour,
  validator.isOfficeHourHostOrInstructor,
  validator.checkOptionalDateBody,
  //validator.isOfficeHourOnDay,
  validator.officeHoursHasNotBegunCancelAll,
  controller.cancelAll
);

router.get(
  "/:officeHourId/getRemainingTimeSlots/:date",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  accountValidator.isAccountValidHeader,
  validator.doesOfficeHourExistParams,
  courseValidator.isInCourseForOfficeHourParam,
  validator.getDatesForOfficeHour,
  validator.isOfficeHourOnDayParam,
  controller.getTimeSlotsRemaining
);

router.post(
  "/:officeHourId/editForDate/:date",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  body("startDate", "start date is required").notEmpty(),
  body("endDate", "end date is required").notEmpty(),
  body("location", "location must be a string").notEmpty(),
  accountValidator.isAccountValidHeader,
  validator.doesOfficeHourExistParams,
  courseValidator.isInCourseForOfficeHourParam,
  validator.isOfficeHourHostParams,
  validator.isOfficeHourOnDayParam,
  validator.isInFuture,
  dateValidator.endIsAfterStart,
  validator.durationIsMultipleof5,
  controller.rescheduleSingleOfficeHour
);

router.post(
  "/:officeHourId/editAll",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  body("startDate", "Please specify what date this event starts").notEmpty(),
  body("endDate", "Please specify what date this event ends").notEmpty(),
  body(
    "location",
    "Please specify a location for your office hours"
  ).notEmpty(),
  body(
    "daysOfWeek",
    "Please include which days of the week for the office hours"
  ),
  body(
    "endDateOldOfficeHour",
    "Please specify when the new edited office hours should take effect"
  ).notEmpty(),
  body("editAfterDate", "Please include boolean field editAfterDate")
    .notEmpty()
    .isBoolean(),
  accountValidator.isAccountValidHeader,
  validator.doesOfficeHourExistParams,
  courseValidator.isInCourseForOfficeHourParam,
  validator.isOfficeHourHostParams,
  dateValidator.endIsAfterStart,
  validator.startDateIsValidDOW,
  validator.durationIsMultipleof5,
  controller.editAll
);

router.post(
  "/cancelRegistration/:registrationId",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  accountValidator.isAccountValidHeader,
  validator.doesRegistrationExistParams,
  validator.isRegisteredOrIsStaffBody,
  validator.isRegistrationInFutureByIdParams,
  controller.cancelRegistration
);

router.get(
  "/:officeHourId/date/:date/registrationStatus",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  accountValidator.isAccountValidHeader,
  validator.doesOfficeHourExistParams,
  courseValidator.isInCourseForOfficeHourParam,
  validator.getDatesForOfficeHour,
  validator.isOfficeHourOnDayParam,
  controller.getRegistrationStatus
);

router.get(
  "/:officeHourId",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  accountValidator.isAccountValidHeader,
  validator.doesOfficeHourExistParams,
  courseValidator.isInCourseForOfficeHourParam,
  controller.getOfficeHourById
);

router.get(
  "/:officeHourId/:date/registrationsOnDate",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  accountValidator.isAccountValidHeader,
  accountValidator.isAccountStaffOrInstructor,
  validator.doesOfficeHourExistParams,
  courseValidator.isInCourseForOfficeHourParam,
  validator.getDatesForOfficeHour,
  validator.isOfficeHourOnDayParam,
  controller.getAllRegistrationsOnDate
);

router.post(
  "/editRegistration/:registrationId",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  body("officeHourId", "Office Hour is required").isInt(),
  body("startTime", "Please include a startTime").notEmpty(),
  body("endTime", "Please include an endtime").notEmpty(),
  body("date", "Please include a date").notEmpty(),
  body("question", "Please include questions as a string")
    .optional()
    .isString(),
  body("TopicIds", "Please include topics as an array").optional().isArray(),
  body("timeOptionId", "Please include a time option id").notEmpty().isInt(),
  accountValidator.isAccountValidHeader,
  validator.doesOfficeHourExist,
  validator.getDatesForOfficeHour,
  validator.isOfficeHourOnDay,
  validator.doesRegistrationExistParams,
  validator.isStudentRegistered,
  validator.isWithinTimeOffering,
  validator.isTimeAvailable,
  courseValidator.areTopicsForCourse,
  validator.isTimeLengthForCourse,
  validator.isTimeCorrectInterval,
  courseValidator.isWithinRegisterConstraint,
  controller.editRegistration
);

export default router;
