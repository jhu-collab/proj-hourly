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
  body("email", "Email is required").isEmail(),
  body("name", "Name is required").notEmpty(),
  validator.isUniqueEmail,
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

export default router;
