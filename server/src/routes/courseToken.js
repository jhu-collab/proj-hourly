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

router.use(checkToken);

//checks if the instructor has opted in to use course tokens
router.post(
  "/:courseId/optIn",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseIdParams,
  accountValidator.isAccountInstructor,
  courseValidator.isCourseStaffOrInstructor,
  controller.optIn
);

//handles creating a course token
router.post(
  "/:courseId/createToken",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  body("title", "Please enter a title for this course token").notEmpty(),
  body(
    "description",
    "Please enter a description for this course token"
  ).notEmpty(),
  body(
    "tokenLimit",
    "Please enter a token limit for this course token"
  ).isInt(),
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseIdParams,
  accountValidator.isAccountInstructor,
  courseValidator.isCourseStaffOrInstructor,
  validator.isCourseUsingTokens,
  controller.createToken
);

router.get(
  "/:courseId",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseIdParams,
  courseValidator.isInCourseFromHeader,
  controller.getTokens
);

router.post(
  "/:courseId/editCourseToken/:courseTokenId",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  body(
    "title",
    "Please indicate what the title should be changed to."
  ).notEmpty(),
  body(
    "description",
    "Please indicate what the description should be changed to."
  ).notEmpty(),
  body("tokenLimit", "Please indicate the new token limit.").notEmpty().isInt(),
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseIdParams,
  accountValidator.isAccountInstructor,
  courseValidator.isCourseStaffOrInstructor,
  validator.isCourseToken,
  controller.editCourseToken
);

//allows instructor to remove a token from a student when they use one
router.post(
  "/:courseId/usedToken/:courseTokenId/student/:studentId",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  body("date", "Please specify when this token was used").notEmpty(),
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseIdParams,
  accountValidator.isAccountInstructor,
  courseValidator.isCourseStaffOrInstructor,
  validator.isCourseToken,
  validator.tokenLimitReached,
  controller.usedToken
);

//allows instructor to undo the action of removing token from student
router.post(
  "/:courseId/undoUsedToken/:courseTokenId/student/:studentId",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  body("date", "Please specify when this token was used").notEmpty(),
  accountValidator.isAccountValidHeader,
  courseValidator.isCourseIdParams,
  accountValidator.isAccountInstructor,
  courseValidator.isCourseStaffOrInstructor,
  validator.isCourseToken,
  controller.undoUsedToken
);

//allows student to check how many tokens they've used
router.get(
  "/:courseId/tokensUsed/:courseTokenId",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
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
  courseValidator.isCourseIdParams,
  accountValidator.isAccountInstructor,
  courseValidator.isCourseStaffOrInstructor,
  validator.isCourseToken,
  controller.deleteSingle
);

//allows instructor to delete all course tokens
router.delete(
  "/:courseId/deleteAll",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  courseValidator.isCourseIdParams,
  accountValidator.isAccountInstructor,
  courseValidator.isCourseStaffOrInstructor,
  controller.deleteAll
);

export default router;
