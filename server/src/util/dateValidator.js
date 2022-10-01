import { StatusCodes } from "http-status-codes";

export const officeHourDateCheck = (req, res, next) => {
  const { recurringEvent, startDate, endDate } = req.body;
  const startObj = new Date(startDate);
  const endObj = new Date(endDate);
  if (recurringEvent && startObj > endObj) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: Start date is after end date" });
  } else if (!recurringEvent && startDate !== endDate) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      msg: "ERROR: Start Date and End Date must match for single events",
    });
  } else {
    next();
  }
};

export const endIsAfterStart = (req, res, next) => {
  const { startDate, endDate } = req.body;
  const startObj = new Date(startDate);
  const endObj = new Date(endDate);
  if (startObj > endObj) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: Start date is after end date" });
  } else {
    next();
  }
};
