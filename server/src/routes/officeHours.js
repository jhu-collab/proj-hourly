import express from "express";
import * as express_validator from "express-validator";
import * as accountValidator from "../util/accountValidator.js";
import * as courseValidator from "../util/courseValidator.js";
import * as validator from "../util/officeHourValidator.js";
import * as timeValidator from "../util/timeValidator.js";
import * as controller from "../controllers/officeHourController.js";
import * as dateValidator from "../util/dateValidator.js";
import { checkToken } from "../util/middleware.js";

const router = express.Router();
const body = express_validator.body;

router.use(checkToken);

router.post(
  "/create",
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
  //timeValidator.isTime,
  //validator.areValidDOW,
  //dateValidator.officeHourDateCheck,
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
  validator.isDateInFuture,
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
  validator.doesOfficeHourExistParams,
  courseValidator.isInCourseForOfficeHourParam,
  validator.isOfficeHourOnDayParam,
  controller.getTimeSlotsRemaining
);

router.post(
  "/:officeHourId/editForDate/:date",
  body("startDate", "start date is required").notEmpty(),
  body("endDate", "end date is required").notEmpty(),
  body("location", "location must be a string").optional().isString(),
  accountValidator.isAccountValidHeader,
  validator.doesOfficeHourExistParams,
  courseValidator.isInCourseForOfficeHourParam,
  validator.isOfficeHourHostParams,
  validator.isOfficeHourOnDayParam,
  validator.isInFuture,
  controller.rescheduleSingleOfficeHour
);

router.post(
  "/:officeHourId/editAll",
  body("startDate", "Please specify what date this event starts").notEmpty(),
  body("endDate", "Please specify what date this event ends").notEmpty(),
  body("location", "Please specify a location for your office hours")
    .optional()
    .notEmpty(),
  body(
    "daysOfWeek",
    "Please include which days of the week for the office hours"
  ),
  body(
    "endDateOldOfficeHour",
    "Please specify when the new edited office hours should take effect"
  ).notEmpty(),
  accountValidator.isAccountValidHeader,
  validator.doesOfficeHourExistParams,
  courseValidator.isInCourseForOfficeHourParam,
  validator.isOfficeHourHostParams,
  //timeValidator.isTime,
  dateValidator.endIsAfterStart,
  controller.editAll
);

router.post(
  "/cancelRegistration/:registrationId",
  accountValidator.isAccountValidHeader,
  validator.doesRegistrationExistParams,
  validator.isStudentRegisteredBody,
  controller.cancelRegistration
);

router.get(
  "/:officeHourId/date/:date/registrationStatus",
  accountValidator.isAccountValidHeader,
  validator.doesOfficeHourExistParams,
  courseValidator.isInCourseForOfficeHourParam,
  validator.isOfficeHourOnDayParam,
  controller.getRegistrationStatus
);

router.get(
  "/:officeHourId",
  accountValidator.isAccountValidHeader,
  validator.doesOfficeHourExistParams,
  courseValidator.isInCourseForOfficeHourParam,
  controller.getOfficeHourById
);

router.get(
  "/:officeHourId/:date/registrationsOnDate",
  accountValidator.isAccountValidHeader,
  accountValidator.isAccountStaffOrInstructor,
  validator.doesOfficeHourExistParams,
  courseValidator.isInCourseForOfficeHourParam,
  validator.isOfficeHourOnDayParam,
  controller.getAllRegistrationsOnDate
);

router.post(
  "/editRegistration/:registrationId",
  body("officeHourId", "Office Hour is required").isInt(),
  body("startTime", "Please include a startTime").notEmpty(),
  body("endTime", "Please include an endtime").notEmpty(),
  body("date", "Please include a date").notEmpty(),
  body("question", "Please include questions as a string")
    .optional()
    .isString(),
  body("TopicIds", "Please include topics as an array").optional().isArray(),
  accountValidator.isAccountValidHeader,
  validator.isOfficeHourOnDay,
  validator.doesRegistrationExistParams,
  validator.isStudentRegistered,
  validator.isWithinTimeOffering,
  validator.isTimeCorrectInterval,
  validator.isTimeAvailable,
  courseValidator.areTopicsForCourse,
  controller.editRegistration
);

export default router;
