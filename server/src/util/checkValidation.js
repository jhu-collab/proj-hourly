import { validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";
import ApiError from "./ApiError.js";

export const checkValidation = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Invalid Request",
      errors.array()
    );
  }
};

export default checkValidation;
