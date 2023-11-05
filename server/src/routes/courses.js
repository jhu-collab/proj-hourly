import express from "express";
import * as express_validator from "express-validator";
import * as validator from "../util/courseValidator.js";
import * as controller from "../controllers/courseController.js";
import * as accountValidator from "../util/accountValidator.js";
import * as officeHourController from "../controllers/officeHourController.js";
import * as accountController from "../controllers/accountController.js";
import { checkToken } from "../util/middleware.js";
import { factory } from "../util/debug.js";

const debug = factory(import.meta.url);
const router = express.Router();
const body = express_validator.body;
const param = express_validator.param;

router.use(checkToken);

router.post(
  "/",
  body("title", "Course title is required").notEmpty(),
  body("number", "Course number is required").notEmpty(),
  body("semester", "Semester is required").isIn([
    "Spring",
    "Summer",
    "Fall",
    "Winter",
  ]),
  body("year", "A valid year is required").isInt({
    min: new Date().getFullYear(),
  }),
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  validator.isUniqueCourse,
  controller.create
);

router.post(
  "/signup",
  body("code", "Course code is required").notEmpty().isString(),
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  accountValidator.isAccountIdValid,
  validator.isCourseCode,
  validator.isNotInCourse,
  validator.isCourseArchivedCourseCode,
  controller.register
);

router.get(
  "/",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  accountController.getCourses
);

router.delete(
  "/leave/:courseId",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  param("courseId", "Please enter a valid course id").isInt(),
  validator.isCourseIdUrlValid,
  accountValidator.isAccountStudent,
  validator.isCourseArchived,
  controller.leaveCourse
);

router.delete(
  "/:courseId/removeStaff/:staffId",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  param("courseId", "Please enter a valid course id").isInt(),
  param("staffId", "Please enter a valid staff id").isInt(),
  validator.isCourseIdUrlValid,
  accountValidator.isAccountInstructor,
  accountValidator.isUrlStaff,
  validator.isCourseArchived,
  controller.removeStaff
);

router.delete(
  "/:courseId/removeStudent/:studentId",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  param("courseId", "Please enter a valid course id").isInt(),
  param("studentId", "Please enter a valid student id").isInt(),
  validator.isCourseIdUrlValid,
  accountValidator.isAccountInstructor,
  accountValidator.isUrlStudent,
  validator.isCourseArchived,
  controller.removeStudent
);

router.get(
  "/:courseId/officeHours",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  param("courseId", "Please enter a valid course id").isInt(),
  accountValidator.isAccountValidHeader,
  validator.isCourseIdParams,
  validator.isInCourseFromHeader,
  officeHourController.getForCourse
);

router.get(
  "/:courseId/officeHours/:filter",
  param("courseId", "Must provide a courseId").notEmpty(),
  param("filter", "Must provide a filter").notEmpty().isIn(["all", "mine"]),
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  accountValidator.isAccountValidHeader,
  validator.isCourseIdParams,
  validator.isCourseStaffOrInstructor,
  officeHourController.getForCourseWithFilter
);

router.get(
  "/:courseId",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  param("courseId", "Please enter a valid course id").isInt(),
  accountValidator.isAccountValidHeader,
  validator.isCourseIdParams,
  validator.isInCourseFromHeader,
  controller.getCourse
);

router.get(
  "/:courseId/topicCounts",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  param("courseId", "Please enter a valid course id").isInt(),
  accountValidator.isAccountValidHeader,
  validator.isCourseIdParams,
  accountValidator.isAccountInstructor,
  controller.getTopicCounts
);

router.post(
  "/createTopic",
  body("courseId", "must include courseid for a topic").notEmpty(),
  body("value", "must include a value for the topic").notEmpty(),
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  accountValidator.isAccountValidHeader,
  validator.isCourseId,
  accountValidator.isAccountInstructorBody,
  validator.isNotDuplicateTopic,
  validator.isCourseArchived,
  controller.createTopic
);

router.post(
  "/editTopic",
  body("courseId", "must include courseid for a topic").notEmpty(),
  body("topicId", "must include a topic id to edit").notEmpty(),
  body("value", "must include a value for the topic").notEmpty(),
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  accountValidator.isAccountValidHeader,
  validator.isCourseId,
  accountValidator.isAccountInstructorBody,
  validator.doesTopicIdExist,
  validator.isNotDuplicateTopic,
  validator.isCourseArchived,
  controller.editTopic
);

router.delete(
  "/topic/:topicId",
  param("topicId", "TopicId must be included").notEmpty(),
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  accountValidator.isAccountValidHeader,
  validator.isAccountInstructorForTopic,
  validator.isCourseArchivedTopicId,
  controller.deleteTopic
);

router.get(
  "/:courseId/topics",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  param("courseId", "Please enter a valid course id").isInt(),
  accountValidator.isAccountValidHeader,
  validator.isCourseIdParams,
  validator.isInCourseFromHeader,
  controller.getTopics
);

router.get(
  "/:courseId/studentRegistrationCounts",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  param("courseId", "Please enter a valid course id").isInt(),
  accountValidator.isAccountValidHeader,
  validator.isCourseIdParams,
  accountValidator.isAccountInstructor,
  controller.getRegistrationStudentCounts
);

router.get(
  "/:courseId/role",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  param("courseId", "Please enter a valid course id").isInt(),
  accountValidator.isAccountValidHeader,
  validator.isCourseIdParams,
  validator.isInCourseFromHeader,
  controller.getRoleInCourse
);

router.get(
  "/:courseId/getRoster",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  param("courseId", "Please enter a valid course id").isInt(),
  accountValidator.isAccountValidHeader,
  validator.isCourseIdParams,
  validator.isInCourseFromHeader,
  controller.getRoster
);

router.get(
  "/:courseId/getAllRegistrations",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  param("courseId", "Please enter a valid course id").isInt(),
  accountValidator.isAccountValidHeader,
  validator.isCourseIdParams,
  validator.isInCourseFromHeader,
  controller.getAllRegistrations
);

router.delete(
  "/:courseId",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  param("courseId", "Please enter a valid course id").isInt(),
  accountValidator.isAccountValidHeader,
  validator.isCourseIdParams,
  accountValidator.isAccountInstructor,
  validator.isCourseArchived,
  controller.deleteCourse
);

router.post(
  "/:courseId/officeHourTimeInterval",
  param("courseId", "Must provide a courseId").notEmpty(),
  body("length", "Body must include time length").notEmpty().isInt({ min: 10 }),
  body("title", "Body must have a title").notEmpty().isString(),
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  accountValidator.isAccountValidHeader,
  validator.isCourseIdParams,
  validator.isLengthMultipleOf5,
  accountValidator.isAccountInstructor,
  validator.isCourseArchived,
  controller.createTimeLength
);

router.get(
  "/:courseId/officeHourTimeInterval",
  param("courseId", "Must provide a courseId").notEmpty(),
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  accountValidator.isAccountValidHeader,
  validator.isCourseIdParams,
  validator.isInCourseFromHeader,
  controller.getTimeLengths
);

router.post(
  "/:courseId/officeHourTimeInterval/:id/update",
  param("courseId", "Must provide a courseId").notEmpty(),
  body("length", "Body must include time length").isInt({ min: 10 }),
  body("title", "Body must have a title").isString(),
  param("id", "Param must have id").isInt(),
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  accountValidator.isAccountValidHeader,
  validator.isCourseIdParams,
  accountValidator.isAccountInstructor,
  //validator.doesTimeLengthExist,
  validator.isLengthMultipleOf5,
  validator.isTimeLengthForCourse,
  validator.isCourseArchived,
  controller.editTimeLength
);

router.delete(
  "/:courseId/officeHourTimeInterval/:id",
  param("courseId", "Please enter a valid course id").isInt(),
  param("id", "Param must have id").isInt(),
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  accountValidator.isAccountValidHeader,
  validator.isCourseIdParams,
  accountValidator.isAccountInstructor,
  validator.doesTimeLengthExist,
  validator.isTimeLengthForCourse,
  validator.isNotOnlyTimeLengthForCourse,
  validator.isCourseArchived,
  controller.deleteTimeLength
);

router.post(
  "/:courseId",
  param("courseId", "Must include course id").notEmpty().isInt(),
  body("studentId", "Must provide id of a student to promote")
    .notEmpty()
    .isInt(),
  body("role", "Must provide a role to promote to")
    .notEmpty()
    .isString()
    .isIn(["Staff", "Instructor"]),
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  accountValidator.isAccountValidHeader,
  validator.checkPromoteRoles,
  validator.isCourseIdParams,
  accountValidator.isAccountInstructor,
  validator.isInCourseBelowRoleForPromotionTo,
  validator.isCourseArchived,
  controller.promote
);

router.post(
  "/:courseId/demote",
  param("courseId", "Must include course id").notEmpty().isInt(),
  body("studentId", "Must provide id of a student to demote")
    .notEmpty()
    .isInt(),
  body("role", "Must provide a role to demote to")
    .notEmpty()
    .isString()
    .isIn(["Student"]),
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  accountValidator.isAccountValidHeader,
  validator.checkDemoteRoles,
  validator.isCourseIdParams,
  accountValidator.isAccountInstructor,
  validator.isInCourseBelowRoleForDemotionTo,
  validator.isCourseArchived,
  controller.demote
);

router.get(
  "/:courseId/:id/getRole",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  param("courseId", "Please enter a valid course id").isInt(),
  param("id", "Please enter a valid id").isInt(),
  accountValidator.isAccountValidHeader,
  accountValidator.isAccountValidParams,
  validator.isCourseIdParams,
  validator.isInCourseFromHeader,
  validator.isCourseStaffOrInstructor,
  controller.getRoleInCourseParams
);

router.post(
  "/:courseId/registrationConstraints",
  param("courseId", "Please enter a valid course id").isInt(),
  body("start", "Please include a start constraint in hoyrs")
    .notEmpty()
    .isInt(),
  body("end", "Please include an end constraint in hours").notEmpty().isInt(),
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  accountValidator.isAccountValidHeader,
  validator.isCourseIdParams,
  accountValidator.isAccountInstructor,
  validator.startAndEndArePositive,
  validator.startIsGreaterThanEnd,
  validator.isCourseArchived,
  controller.updateRegistrationConstraints
);


router.get(
  "/:courseId/getRegistration/:filterType/value/:filterValue",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  param("courseId", "Please enter a valid course id").isInt(),
  param("filterType", "filterType is required").isIn([
    "date",
    "officeHourId",
    "accountId",
    "topics",
    "isNoShow",
    "hosts",
  ]),
  param("filterValue", "filterType is required").isString(),
  accountValidator.isAccountValidHeader,
  validator.isCourseIdParams,
  validator.isInCourseFromHeader,
  validator.isValidFilterForRole,
  validator.isValidFilterValue,
  controller.getRegistrationWithFilter
);

router.post(
  "/:courseId/pauseCourse",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  accountValidator.isAccountValidHeader,
  validator.isCourseIdParams,
  accountValidator.isAccountInstructor,
  controller.pauseCourse
);

router.post(
  "/:courseId/archiveCourse",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  accountValidator.isAccountValidHeader,
  validator.isCourseIdParams,
  accountValidator.isAccountInstructor,
  controller.archiveCourse
);

export default router;
