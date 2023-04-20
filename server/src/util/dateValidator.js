import { StatusCodes } from "http-status-codes";
import { factory } from "./debug.js";

const debug = factory(import.meta.url);
export const officeHourDateCheck = (req, res, next) => {
  debug("officeHourDateCheck called!");
  const { recurringEvent, startDate, endDate } = req.body;
  const startObj = new Date(startDate);
  const endObj = new Date(endDate);
  if (recurringEvent && startObj > endObj) {
    console.log("error1");
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
  const startObj = new Date(startDate);
  const endObj = new Date(endDate);
  if (startObj > endObj) {
    debug("end is before start...");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: Start date is after end date" });
  } else {
    debug("endIsAfterStart done!");
    next();
  }
};
