import express from "express";
import * as express_validator from "express-validator";
import * as validator from "../util/courseValidator.js";
import * as controller from "../controllers/courseController.js";
import * as accountValidator from "../util/accountValidator.js";
import * as officeHourController from "../controllers/officeHourController.js";
import * as accountController from "../controllers/accountController.js";
import { checkToken } from "../util/checkToken.js";

const router = express.Router();
const body = express_validator.body;

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
  validator.isUniqueCourse,
  controller.create
);

router.post(
  "/signup",
  body("code", "Course code is required").notEmpty(),
  body("id", "Account id is required").isInt(),
  accountValidator.isAccountIdValid,
  validator.isCourseCode,
  validator.isNotInCourse,
  controller.register
);

router.get("/", accountController.getCourses);

// account id will be stored in header until we get a token
router.delete(
  "/leave/:courseId",
  validator.isCourseIdUrlValid,
  accountValidator.isAccountStudent,
  controller.leaveCourse
);

router.delete(
  "/:courseId/removeStaff/:staffId",
  validator.isCourseIdUrlValid,
  accountValidator.isAccountInstructor,
  accountValidator.isUrlStaff,
  controller.removeStaff
);

router.delete(
  "/:courseId/removeStudent/:studentId",
  validator.isCourseIdUrlValid,
  accountValidator.isAccountInstructor,
  accountValidator.isUrlStudent,
  controller.removeStudent
);

router.get(
  "/:courseId/officeHours",
  accountValidator.isAccountValidHeader,
  validator.isCourseIdParams,
  validator.isInCourseFromHeader,
  officeHourController.getForCourse
);

router.get(
  "/:courseId",
  accountValidator.isAccountValidHeader,
  validator.isCourseIdParams,
  validator.isInCourseFromHeader,
  controller.getCourse
);

router.get(
  "/:courseId/topicCounts",
  accountValidator.isAccountValidHeader,
  validator.isCourseIdParams,
  accountValidator.isAccountInstructor,
  controller.getTopicCounts
);

router.post(
  "/createTopic",
  body("courseId", "must include courseid for a topic").notEmpty(),
  body("value", "must include a value for the topic").notEmpty(),
  accountValidator.isAccountValidHeader,
  validator.isCourseId,
  accountValidator.isAccountInstructorBody,
  validator.isNotDuplicateTopic,
  controller.createTopic
);

router.get(
  "/:courseId/studentRegistrationCounts",
  accountValidator.isAccountValidHeader,
  validator.isCourseIdParams,
  accountValidator.isAccountInstructor,
  controller.getRegistrationStudentCounts
);

router.get(
  "/:courseId/role",
  accountValidator.isAccountValidHeader,
  validator.isCourseIdParams,
  validator.isInCourseFromHeader,
  controller.getRoleInCourse
);

router.get(
  "/:courseId/getRoster",
  accountValidator.isAccountValidHeader,
  validator.isCourseIdParams,
  controller.getRoster
);

export default router;
