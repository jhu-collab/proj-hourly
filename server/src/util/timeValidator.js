/* c8 ignore start */
import { StatusCodes } from "http-status-codes";
import { factory } from "./debug.js";

const debug = factory(import.meta.url);
export const isTime = async (req, res, next) => {
  debug("isTime called!");
  const { startTime, endTime } = req.body;
  const start = startTime.split(":");
  const end = endTime.split(":");
  if (start.length !== 3 || end.length !== 3) {
    debug("Time object does not have right number of elements...");
    return res.status(StatusCodes.BAD_REQUEST).json({
      msg: "ERROR: time objects are not formatted properly as HH:MM:SS",
    });
  }
  if (start[0] < 0 || start[0] > 23 || end[0] < 0 || end[0] > 23) {
    debug("Hours are not within bounds...");
    return res.status(StatusCodes.BAD_REQUEST).json({
      msg: "ERROR: hours are out of bound",
    });
  }
  if (start[1] < 0 || start[1] > 59 || end[1] < 0 || end[1] > 59) {
    debug("minutes are not within bounds...");
    return res.status(StatusCodes.BAD_REQUEST).json({
      msg: "ERROR: minutes are out of bound",
    });
  }
  if (start[2] < 0 || start[2] > 59 || end[2] < 0 || end[2] > 59) {
    debug("seconds are not within bounds...");
    return res.status(StatusCodes.BAD_REQUEST).json({
      msg: "ERROR: seconds are out of bound",
    });
  }
  if (!res.headersSent) {
    debug("isTime done!");
    next();
  }
};
/* c8 ignore end */