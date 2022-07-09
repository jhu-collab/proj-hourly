import { StatusCodes } from "http-status-codes";

export const isTime = async (req, res, next) => {
  const { startTime, endTime } = req.body;
  const start = startTime.split(":");
  const end = endTime.split(":");
  if (start.length !== 3 || end.length !== 3) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      msg: "ERROR: time objects are not formatted properly as HH:MM:SS",
    });
  }
  if (start[0] < 0 || start[0] > 23 || end[0] < 0 || end[0] > 23) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      msg: "ERROR: hours are out of bound",
    });
  }
  if (start[1] < 0 || start[1] > 59 || end[1] < 0 || end[1] > 59) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      msg: "ERROR: minutes are out of bound",
    });
  }
  if (start[2] < 0 || start[2] > 59 || end[2] < 0 || end[2] > 59) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      msg: "ERROR: seconds are out of bound",
    });
  }
  next();
};
