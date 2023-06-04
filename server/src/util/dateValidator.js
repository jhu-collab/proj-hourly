import { StatusCodes } from "http-status-codes";
import { factory } from "./debug.js";

const debug = factory(import.meta.url);
export const officeHourDateCheck = (req, res, next) => {
  debug("officeHourDateCheck called!");
  const { recurringEvent, startDate, endDate } = req.body;
  const startObj = new Date(startDate);
  const endObj = new Date(endDate);
  if (
    !(startObj instanceof Date && !isNaN(startObj)) ||
    !(endObj instanceof Date && !isNaN(endObj))
  ) {
    debug("Start or end date is invalid...");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: start or end date is invalid" });
  } else if (recurringEvent && startObj > endObj) {
    debug("Start date is after end date...");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: Start date is after end date" });
  }
  // } else if (!recurringEvent && startDate !== endDate) {
  //   return res.status(StatusCodes.BAD_REQUEST).json({
  //     msg: "ERROR: Start Date and End Date must match for single events",
  //   });
  // }
  else {
    debug("officeHourDateCheck done!");
    next();
  }
};

export const endIsAfterStart = (req, res, next) => {
  debug("endIsAfterStart called!");
  const { startDate, endDate } = req.body;
  const startObj = spacetime(startDate);
  const endObj = spacetime(endDate);
  if (!endObj.isAfter(startObj)) {
    debug("end is before start...");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: Start date is after end date" });
  } else {
    debug("endIsAfterStart done!");
    next();
  }
};
