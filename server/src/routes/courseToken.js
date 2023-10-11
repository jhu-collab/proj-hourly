import express from "express";
import * as express_validator from "express-validator";
import * as accountValidator from "../util/accountValidator.js";
import * as courseValidator from "../util/courseValidator.js";
import { checkToken } from "../util/middleware.js";
import { factory } from "../util/debug.js";
import * as validator from "../util/courseTokenValidator.js";
import * as controller from "../controllers/courseTokenController.js";

//what create, read, update, and delete methods should there be?
const debug = factory(import.meta.url);
const router = express.Router();
const body = express_validator.body;
const param = express_validator.param;

router.use(checkToken);

//checks if the instructor has opted in to use course tokens
router.post(
  "/:courseId/optIn",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  param("courseId", "Please enter a valid course id").isInt(),
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseIdParams,
  accountValidator.isAccountInstructor,
  courseValidator.isCourseArchived,
  controller.optIn
);

router.get(
  "/:courseId",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  param("courseId", "Course Id is required to be an int").isInt(),
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseIdParams,
  courseValidator.isInCourseFromHeader,
  validator.isCourseUsingTokens,
  controller.getTokens
);

router.get(
  "/:courseId/tokensRemainingForStudent/:accountId",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseIdParams,
  courseValidator.isCourseStaffOrInstructor,
  courseValidator.isAccountStudentParams,
  validator.isCourseUsingTokens,
  controller.getTokensForStudent
);

router.get(
  "/:courseId/tokensRemaining",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseIdParams,
  //   accountValidator.isAccountStudent,
  courseValidator.isCourseIdParams,
  courseValidator.isInCourseFromHeader,
  validator.isCourseUsingTokens,
  controller.getAllRemainingTokens
);

//handles creating a course token
router.post(
  "/:courseId/createToken",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  param("courseId", "Please enter a valid course id").isInt(),
  body("title", "Please enter a title for this course token").notEmpty(),
  body("description", "Please enter a description for this course token")
    .optional()
    .isString(),
  body(
    "tokenLimit",
    "Please enter a token limit for this course token"
  ).isInt(),
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseIdParams,
  accountValidator.isAccountInstructor,
  validator.isCourseUsingTokens,
  courseValidator.isCourseArchived,
  controller.createToken
);

router.post(
  "/:courseId/editCourseToken/:courseTokenId",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  param("courseId", "Please enter a valid course id").isInt(),
  param("courseTokenId", "Please enter a valid course token id").isInt(),
  body(
    "title",
    "Please indicate what the title should be changed to."
  ).notEmpty(),
  body(
    "description",
    "Please indicate what the description should be changed to."
  )
    .optional()
    .isString(),
  body("tokenLimit", "Please indicate the new token limit.").notEmpty().isInt(),
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseIdParams,
  accountValidator.isAccountInstructor,
  validator.isCourseToken,
  courseValidator.isCourseArchived,
  validator.isCourseUsingTokens,
  controller.editCourseToken
);

//allows instructor to remove a token from a student when they use one
router.post(
  "/:courseId/usedToken/:courseTokenId/student/:studentId",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  param("courseId", "Please enter a valid course id").isInt(),
  param("courseTokenId", "Please enter a valid course token id").isInt(),
  param("studentId", "Please enter a valid student id").isInt(),
  body("date", "Please specify when this token was used").notEmpty(),
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseIdParams,
  courseValidator.isCourseStaffOrInstructor,
  validator.isCourseToken,
  validator.tokenLimitReached,
  courseValidator.isCoursePaused,
  courseValidator.isCourseArchived,
  validator.isCourseUsingTokens,
  controller.usedToken
);

//allows instructor to undo the action of removing token from student
router.post(
  "/:courseId/undoUsedToken/:courseTokenId/student/:studentId",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  param("courseId", "Please enter a valid course id").isInt(),
  param("courseTokenId", "Please enter a valid course token id").isInt(),
  param("studentId", "Please enter a valid student id").isInt(),
  body("date", "Please specify when this token was used").notEmpty(),
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseIdParams,
  courseValidator.isCourseStaffOrInstructor,
  validator.isCourseToken,
  courseValidator.isCoursePaused,
  courseValidator.isCourseArchived,
  validator.isCourseUsingTokens,
  controller.undoUsedToken
);

//allows student to check how many tokens they've used
router.get(
  "/:courseId/tokensUsed/:courseTokenId",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  param("courseId", "Please enter a valid course id").isInt(),
  param("courseTokenId", "Please enter a valid course token id").isInt(),
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseIdParams,
  accountValidator.isAccountStudent,
  courseValidator.isCourseIdParams,
  courseValidator.isInCourseFromHeader,
  validator.isCourseUsingTokens,
  validator.isCourseToken,
  controller.getUsedTokens
);

//allows student to check how many tokens they have remaining
router.get(
  "/:courseId/tokensRemaining/:courseTokenId",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  param("courseId", "Please enter a valid course id").isInt(),
  param("courseTokenId", "Please enter a valid course token id").isInt(),
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseIdParams,
  accountValidator.isAccountStudent,
  courseValidator.isCourseIdParams,
  courseValidator.isInCourseFromHeader,
  validator.isCourseUsingTokens,
  validator.isCourseToken,
  controller.getRemainingTokens
);

//allows instructor to delete a single course token
router.delete(
  "/:courseId/deleteSingle/:courseTokenId",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  param("courseId", "Please enter a valid course id").isInt(),
  param("courseTokenId", "Please enter a valid course token id").isInt(),
  courseValidator.isCourseIdParams,
  accountValidator.isAccountInstructor,
  validator.isCourseToken,
  courseValidator.isCourseArchived,
  validator.isCourseUsingTokens,
  controller.deleteSingle
);

//allows instructor to delete all course tokens
router.delete(
  "/:courseId/deleteAll",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  param("courseId", "Please enter a valid course id").isInt(),
  courseValidator.isCourseIdParams,
  accountValidator.isAccountInstructor,
  courseValidator.isCourseArchived,
  validator.isCourseUsingTokens,
  controller.deleteAll
);

//allow instructor to add override limit to student's issue token
router.post(
  "/:courseId/editOverrideAmount/:courseTokenId/student/:studentId",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  param("courseId", "Please enter a valid course id").isInt(),
  param("courseTokenId", "Please enter a valid course token id").isInt(),
  param("studentId", "Please enter a valid student id").isInt(),
  body("overrideAmount", "Please enter valid overrideAmount").isInt(),
  courseValidator.isCourseIdParams,
  accountValidator.isAccountValidHeader,
  accountValidator.isAccountInstructor,
  courseValidator.isCourseArchived,
  validator.isCourseUsingTokens,
  validator.isCourseToken,
  courseValidator.isCoursePaused,
  validator.tokenLessThanOverride,
  controller.editOverride
);

//allow instructor to remove override limit to student's issue token
router.post(
  "/:courseId/deleteOverrideAmount/:courseTokenId/student/:studentId",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  param("courseId", "Please enter a valid course id").isInt(),
  param("courseTokenId", "Please enter a valid course token id").isInt(),
  param("studentId", "Please enter a valid student id").isInt(),
  courseValidator.isCourseIdParams,
  accountValidator.isAccountValidHeader,
  accountValidator.isAccountInstructor,
  courseValidator.isCourseArchived,
  validator.isCourseUsingTokens,
  validator.isCourseToken,
  courseValidator.isCoursePaused,
  controller.deleteOverride
);
export default router;
