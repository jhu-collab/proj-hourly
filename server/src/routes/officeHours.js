import express from "express";
import * as express_validator from "express-validator";
import * as accountValidator from "../util/accountValidator.js";
import * as courseValidator from "../util/courseValidator.js";
import * as validator from "../util/officeHourValidator.js";
import * as timeValidator from "../util/timeValidator.js";
import * as controller from "../controllers/officeHourController.js";

const router = express.Router();
const body = express_validator.body;

router.post(
  "/create",
  body("courseId", "Course is required").isInt(),
  body("startTime", "Please specify what time this event starts").notEmpty(),
  body("endTime", "Please specify what time this event ends").notEmpty(),
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
  body(
    "timeInterval",
    "Please include a positive integer for time interval"
  ).isInt({ min: 1 }),
  body("hosts", "Please include the staff ID(s) hosting the office hours")
    .isArray()
    .notEmpty(),
  accountValidator.areAccountsIdsValid,
  courseValidator.isCourseId,
  courseValidator.areCourseStaffOrInstructor,
  timeValidator.isTime,
  // validator.noConflictsWithHosts,
  controller.create
);

router.post(
  "/register",
  body("officeHourId", "Office Hour is required").isInt(),
  body("startTime", "Please include a startTime").notEmpty(),
  body("endTime", "Please include an endtime").notEmpty(),
  body("date", "Please include a date").notEmpty(),
  body("question", "Please include questions as a string")
    .optional()
    .isString(),
  body("TopicIds", "Please include topics as an array").optional().isArray(),
  accountValidator.isAccountValidHeader,
  validator.doesOfficeHourExist,
  courseValidator.isInCourseForOfficeHour,
  validator.isOfficeHourOnDay,
  validator.isWithinTimeOffering,
  validator.isTimeCorrectInterval,
  validator.isTimeAvailable,
  validator.isUserNotRegistered,
  courseValidator.areTopicsForCourse,
  controller.register
);

router.post(
  "/cancelOnDate",
  body("officeHourId", "Office Hour is required").isInt(),
  body("date", "Date is required").notEmpty(),
  accountValidator.isAccountValidHeader,
  validator.doesOfficeHourExist,
  courseValidator.isInCourseForOfficeHour,
  validator.isOfficeHourHost,
  validator.isOfficeHourOnDay,
  controller.cancelOnDate
);

router.post(
  "/cancelAll",
  body("officeHourId", "Office Hour is required").isInt(),
  accountValidator.isAccountValidHeader,
  validator.doesOfficeHourExist,
  courseValidator.isInCourseForOfficeHour,
  validator.isOfficeHourHost,
  controller.cancelAll
);

router.get(
  "/:officeHourId/getRemainingTimeSlots/:date",
  accountValidator.isAccountValidHeader,
  validator.doesOfficeHourExist,
  courseValidator.isInCourseForOfficeHourParam,
  validator.isOfficeHourOnDayParam,
  controller.getTimeSlotsRemaining
);

router.get(
  "/:officeHourId/date/:date/registrationStatus",
  accountValidator.isAccountValidHeader,
  validator.doesOfficeHourExist,
  courseValidator.isInCourseForOfficeHourParam,
  validator.isOfficeHourOnDayParam,
  controller.getRegistrationStatus
);

export default router;
