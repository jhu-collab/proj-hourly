import express from "express";
import * as express_validator from "express-validator";
import * as validator from "../util/accountValidator.js";
import * as controller from "../controllers/accountController.js";
import { checkToken } from "../util/middleware.js";
import { factory } from "../util/debug.js";

const router = express.Router();
const body = express_validator.body;
const param = express_validator.param;
const debug = factory(import.meta.url);

router.post(
  "/signup",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  body("email", "Email is required").notEmpty().isEmail(),
  body("password", "Password is required")
    .notEmpty()
    .isLength({ min: 8 })
    .withMessage("Password must be 8 or more characters")
    .matches(/^(?=.*[a-z])/, "i")
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/^(?=.*[A-Z])/, "i")
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/^(?=.*\d)/)
    .withMessage("Password must contain at least one number")
    .matches(/^(?=.*[@$!%*?&])/)
    .withMessage("Password must contain at least one special character"),
  body("username", "username is required").notEmpty(),
  body("firstName", "firstName is required").notEmpty(),
  body("lastName", "lastName is required").notEmpty(),
  validator.isUniqueEmail,
  validator.isUniqueUsername,
  controller.create
);

// router.post(
//   "/login",
//   async (req, res, next) => {
//     debug(`${req.method} ${req.path} called...`);
//     next();
//   },
//   body("email", "Email is required").isEmail(),
//   validator.emailExists,
//   controller.login
// );

router.post(
  "/forgotPassword",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  body("username", "username is required").notEmpty(),
  validator.usernameExists,
  validator.doesNotHaveExistingActiveLink,
  controller.forgotPassword
);

router.post(
  "/resetPassword",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  body("id", "id is required").notEmpty(),
  body("email", "email is required").notEmpty(),
  body("newPassword", "new password is required")
    .notEmpty()
    .isLength({ min: 8 })
    .withMessage("Password must be 8 or more characters")
    .matches(/^(?=.*[a-z])/, "i")
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/^(?=.*[A-Z])/, "i")
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/^(?=.*\d)/)
    .withMessage("Password must contain at least one number")
    .matches(/^(?=.*[@$!%*?&])/)
    .withMessage("Password must contain at least one special character"),
  validator.emailExists,
  validator.doesResetPasswordCodeMatch,
  validator.codeNotExpired,
  controller.resetPassword
);

router.use(checkToken);

router.delete(
  "/:id",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  param("id", "Please enter valid id").isInt(),
  controller.deleteAccount
);

router.get(
  "/",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  validator.isAdmin,
  controller.getAll
);

router.post(
  "/changePassword",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  body("oldPassword", "oldPassword is required").notEmpty(),
  body("newPassword", "newPassword is required")
    .notEmpty()
    .isLength({ min: 8 })
    .withMessage("Password must be 8 or more characters")
    .matches(/^(?=.*[a-z])/, "i")
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/^(?=.*[A-Z])/, "i")
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/^(?=.*\d)/)
    .withMessage("Password must contain at least one number")
    .matches(/^(?=.*[@$!%*?&])/)
    .withMessage("Password must contain at least one special character"),
  validator.isAccountValidHeader,
  validator.isOldPasswordAccurate,
  validator.isNewPasswordNew,
  controller.changePassword
);

router.post(
  "/:id",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  param("id", "Please enter valid id").isInt(),
  validator.isAdmin,
  validator.isAccountValidParams,
  controller.promoteToAdmin
);

export default router;
