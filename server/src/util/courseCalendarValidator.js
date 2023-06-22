import prisma from "../../prisma/client.js";
import { StatusCodes } from "http-status-codes";
import { factory } from "../util/debug.js";
const debug = factory(import.meta.url);

export const weekday = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const isCourseOnDayAlready = async (req, res, next) => {
  debug("checking whether course is on entered day");
  const { newDaysOfWeek, daysOfWeek } = req.body;
  const dateObj = new Date(date);
  debug("getting calendar event...");
  daysOfWeek.forEach((dow) => {
    newDaysOfWeek.forEach((newDow) => {
      if (newDow == dow) {
        debug("new day already occurs");
        next();
      }
    });
  });
  return res
    .status(StatusCodes.BAD_REQUEST)
    .json({ msg: "ERROR: course does not occur on this day" });
}

export const doesEventExist =  async (req, res, next) => {
  debug("checking whether calendar event exists");
  const {courseId, date} = req.body;
  debug("getting calendar event...");
  const calendarEvent = await prisma.calendarEvent.findUnique({
    where: {
      courseId: courseId,
      date: new Date(date),
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

export const doesEventNotExist =  async (req, res, next) => {
  debug("checking whether calendar event exists");
  const {courseId, date} = req.body;
  debug("getting calendar event...");
  const calendarEvent = await prisma.calendarEvent.findUnique({
    where: {
      courseId: courseId,
      date: new Date(date),
    },
  });
  debug("got calendar event");
  if (calendarEvent === null || calendarEvent === undefined) {
    debug("calendar event does not exist");
    next();
  } else {
    debug("calendar event exists");
    return res
    .status(StatusCodes.BAD_REQUEST)
    .json({ msg: "ERROR: calendar event exists" });
  }
}


export const isEventNotCancelled =  async (req, res, next) => {
  debug("checking whether calendar event exists");
  const {courseId, date} = req.body;
  debug("getting calendar event...");
  const calendarEvent = await prisma.calendarEvent.findUnique({
    where: {
      courseId: courseId,
      date: new Date(date),
      isCancelled: false,
    },
  });
  debug("got calendar event");
  if (calendarEvent === null || calendarEvent === undefined) {
    debug("calendar event is cancelled");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: calendar event is cancelled" });
  } else {
    debug("calendar event is not cancelled");
    next();
  }
}

export const isEventCancelled =  async (req, res, next) => {
  debug("checking whether calendar event exists");
  const {courseId, date} = req.body;
  debug("getting calendar event...");
  const calendarEvent = await prisma.calendarEvent.findUnique({
    where: {
      courseId: courseId,
      date: new Date(date),
      isCancelled: true,
    },
  });
  debug("got calendar event");
  if (calendarEvent === null || calendarEvent === undefined) {
    debug("calendar event is not cancelled");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: calendar event is not cancelled" });
  } else {
    debug("calendar event is cancelled");
    next();
  }
}

export const endAfterStart = async (req, res, next) => {
  debug("Checking that end date is after start date");
  const {begDate, endDate} = req.body;
  let end = spacetime(endDate);
  let beg = spacetime(begDate);
  if(!beg.isAfter(end)) {
    debug("end date is after beginning date");
    next();
  } else {
    debug("end date is before beginning date");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: end date is before beginning date" });
  }
}

export const doesCourseBeginOnDay = async (req, res, next) => {
  debug("checking whether course begins on beginning day");
  const { begDate, daysOfWeek } = req.body;
  const dateObj = new Date(begDate);
  daysOfWeek.forEach((dow) => {
    if (dateObj.toNativeDate().getDay() == dow) {
      debug("course begins on correct day");
      next();
    }
  });
  return res
    .status(StatusCodes.BAD_REQUEST)
    .json({ msg: "ERROR: course does not occur on this day" });
}

// in office hour?