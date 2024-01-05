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

// gets course tokens for course
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

// gets all remaining issue tokens for student
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

// gets all remaining issue tokens for self
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

// edits course token
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
  "/:courseId/usedToken/:courseTokenId/student/:accountId",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  param("courseId", "Please enter a valid course id").isInt(),
  param("courseTokenId", "Please enter a valid course token id").isInt(),
  param("accountId", "Please enter a valid account id").isInt(),
  body("date", "Please specify when this token was used").notEmpty(),
  body("reason", "Please enter a valid reason").notEmpty().isString(),
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
  "/:courseId/undoUsedToken/:usedTokenId",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  param("courseId", "Please enter a valid course id").isInt(),
  param("usedTokenId", "Please enter a valid used token id").isInt(),
  body("reason", "Please enter a valid reason").notEmpty().isString(),
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseIdParams,
  courseValidator.isCourseStaffOrInstructor,
  validator.isUsedToken,
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
  accountValidator.isAccountValidHeader,
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
  accountValidator.isAccountValidHeader,
  accountValidator.isAccountInstructor,
  courseValidator.isCourseArchived,
  validator.isCourseUsingTokens,
  controller.deleteAll
);

//allow instructor to add override limit to student's issue token
router.post(
  "/:courseId/addOverrideAmount/:courseTokenId/student/:accountId",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  param("courseId", "Please enter a valid course id").isInt(),
  param("courseTokenId", "Please enter a valid course token id").isInt(),
  param("accountId", "Please enter a valid account id").isInt(),
  body("overrideAmount", "Please enter valid overrideAmount").isInt({ min: 0 }),
  courseValidator.isCourseIdParams,
  accountValidator.isAccountValidHeader,
  accountValidator.isAccountInstructor,
  courseValidator.isCourseArchived,
  courseValidator.isAccountStudentParams,
  validator.isCourseUsingTokens,
  validator.isCourseToken,
  courseValidator.isCoursePaused,
  // validator.tokenLessThanOverride,
  controller.addOverride
);

//allow instructor to remove override limit to student's issue token
router.delete(
  "/:courseId/deleteOverrideAmount/:courseTokenId/student/:accountId",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  param("courseId", "Please enter a valid course id").isInt(),
  param("courseTokenId", "Please enter a valid course token id").isInt(),
  param("accountId", "Please enter a valid account id").isInt(),
  courseValidator.isCourseIdParams,
  accountValidator.isAccountValidHeader,
  accountValidator.isAccountInstructor,
  courseValidator.isCourseArchived,
  courseValidator.isAccountStudentParams,
  validator.isCourseUsingTokens,
  validator.isCourseToken,
  courseValidator.isCoursePaused,
  validator.overrideNotNull,
  controller.deleteOverride
);

// edit used token
router.post(
  "/:courseId/editUsedToken/:usedTokenId",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  param("courseId", "Please enter a valid course id").isInt(),
  param("usedTokenId", "Please enter a valid used token id").isInt(),
  body("reason", "Please indicate what reason should be changed to")
    .notEmpty()
    .isString(),
  body("appliedById", "Please enter a valid applied by id").isInt(),
  body("unDoneById", "Please enter a valid undone by id").isInt().optional(),
  body("issueTokenId", "Please enter a valid issue token id").isInt(),
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseIdParams,
  accountValidator.isAccountStaffOrInstructor,
  courseValidator.isCourseArchived,
  validator.isCourseUsingTokens,
  courseValidator.isCoursePaused,
  validator.isUsedToken,
  controller.editUsedToken
);
export default router;
