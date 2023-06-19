import prisma from "../../prisma/client.js";
import { StatusCodes } from "http-status-codes";
import validate from "../util/checkValidation.js";
import { factory } from "../util/debug.js";
import { debug } from "console";

export const isCourseOnDay = async (req, res, next) => {
  debug("checking whether course is on entered day");
  const { date } = req.body;
  const dateObj = new Date(date);
  // is this even stored anywhere?
}

export const doesEventExist =  async (req, res, next) => {
  debug("checking whether calendar event exists");
  const {calendarEventId} = req.body;
  debug("getting calendar event...");
  const calendarEvent = await prisma.calendarEvent.findFirst({
    where: {
      id: calendarEventId,
      isCancelled: false,
    },
  });
  debug("got calendar event");
  if (calendarEvent === null || calendarEvent === undefined) {
    debug("calendar event does not exist");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: calendar event does not exist" });
  } else {
    debug("calendar event exists");
    next();
  }
}

// end date after start date

// start date is on the right day of the week

// in office hour?