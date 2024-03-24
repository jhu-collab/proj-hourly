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
  body("password", "Password is required").notEmpty(),
  body("username", "username is required").notEmpty(),
  body("firstName", "firstName is required").notEmpty(),
  body("lastName", "lastName is required").notEmpty(),
  validator.isUniqueEmail,
  validator.isUniqueUsername,
  controller.create
);

router.post(
  "/login",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  body("email", "Email is required").isEmail(),
  validator.emailExists,
  controller.login
);

router.post(
  "/forgotPassword",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  body("username", "username is required").isEmail(),
  validator.usernameExists,
  controller.forgotPassword
);

router.post("/resetPassword", controller.resetPassword); // todo 1 hour validator

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

router.post(
  "/changePassword",
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);
    next();
  },
  body("newPassword", "newPassword in required").notEmpty(),
  validator.isAccountValidParams,
  controller.changePassword
);

export default router;
