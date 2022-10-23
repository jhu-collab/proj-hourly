import { validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";
import ApiError from "./ApiError.js";

export const checkValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(StatusCodes.BAD_REQUEST).json({ msg: errors.array() });
    return true;
  }
};

export default checkValidation;
