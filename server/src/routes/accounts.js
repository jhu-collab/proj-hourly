import express from "express";
import * as express_validator from "express-validator";
import * as validator from "../util/accountValidator.js";
import * as controller from "../controllers/accountController.js";
import { checkToken } from "../util/checkToken.js";
const router = express.Router();
const body = express_validator.body;

router.post(
  "/signup",
  body("email", "Email is required").isEmail(),
  body("name", "Name is required").notEmpty(),
  body("phoneNumber").optional().isMobilePhone(),
  body("password", "Password is required").notEmpty(),
  validator.isUniqueEmail,
  validator.isUniquePhone,
  controller.create
);

router.post(
  "/login",
  body("email", "Email is required").isEmail(),
  body("password", "Password is required").notEmpty(),
  validator.emailExists,
  validator.emailAndPasswordMatch,
  controller.login
);

router.use(checkToken);

router.delete("/:id", controller.deleteAccount);

export default router;
