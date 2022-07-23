import express from "express";
import * as express_validator from "express-validator";
import * as validator from "../util/accountValidator.js";
import * as controller from "../controllers/accountController.js";

const router = express.Router();
const body = express_validator.body;

router.post(
  "/signup",
  body("email", "Email is required").isEmail(),
  body("name", "Name is required").notEmpty(),
  body("phoneNumber").optional().isMobilePhone(),
  validator.isUniqueEmail,
  validator.isUniquePhone,
  controller.create
);

router.post(
  "/login",
  body("email", "Email is required").isEmail(),
  validator.emailExists,
  controller.login
);

router.delete("/:id", controller.deleteAccount);

export default router;
