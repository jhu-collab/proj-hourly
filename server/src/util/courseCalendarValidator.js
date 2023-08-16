import prisma from "../../prisma/client.js";
import { StatusCodes } from "http-status-codes";
import { factory } from "../util/debug.js";
const debug = factory(import.meta.url);
import spacetime from "spacetime";

export const weekday = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/**
 * Middleware function to check whether a calendar event exists for a given course and date.
 * If the event exists, the request is allowed to proceed, otherwise an error response is sent.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
export const doesEventExist = async (req, res, next) => {
  debug("checking whether calendar event exists");
  const { courseId, date } = req.body;
  debug("getting calendar event...");
  let dateObj = new Date(date);
  dateObj.setUTCHours(23);
  const calendarEvent = await prisma.calendarEvent.findUnique({
    where: {
      courseId_date: {
        courseId: courseId,
        date: dateObj,
      },
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
};

/**
 * Middleware function to check whether a calendar event exists for a given course and date in the params.
 * If the event exists, the request is allowed to proceed, otherwise an error response is sent.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
export const doesEventExistParams = async (req, res, next) => {
  debug("checking whether calendar event exists");
  const courseId = parseInt(req.params.courseId, 10);
  const date = req.params.date;
  debug("getting calendar event...");
  let dateObj = new Date(date);
  dateObj.setUTCHours(23);
  const calendarEvent = await prisma.calendarEvent.findUnique({
    where: {
      courseId_date: {
        courseId: courseId,
        date: dateObj,
      },
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
};

/**
 * Middleware function to check whether a calendar event exists for a given course and period of time.
 * If no events exist in the time period, the request is allowed to proceed, otherwise an error response is sent.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
export const doesEventExistRecurring = async (req, res, next) => {
  debug("checking whether calendar events exist");
  const { courseId, daysOfWeek, begDate, endDate } = req.body;
  debug("getting calendar event...");
  let begDateObj = new Date(begDate);
  begDateObj.setUTCHours(23);
  let endDateObj = new Date(endDate);
  endDateObj.setUTCHours(23);
  let end = spacetime(endDateObj);
  let beg = spacetime(begDateObj);
  let indices = [];
  daysOfWeek.forEach((dow) => {
    indices.push(weekday.indexOf(dow));
  });
  indices.sort();
  const newDays = [];
  let i = indices.indexOf(beg.toNativeDate().getDay());
  while (!beg.isAfter(end)) {
    newDays.push(beg.toNativeDate());
    let diff = indices[(i + 1) % indices.length] - indices[i % indices.length];
    i++;
    if (diff <= 0) {
      diff += 7;
    }
    beg = beg.add(diff, "day");
  }
  const calendarEvents = await prisma.calendarEvent.findMany({
    where: {
      courseId: courseId,
      date: {
        in: newDays,
      },
    },
  });
  if (calendarEvents.length === 0) {
    debug("got calendar events");
    debug("calendar event doesn't exist on proposed days");
    next();
  } else {
    debug("calendar events exist on proposed days");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: calendar event exists on days" });
  }
};

/**
 * Middleware function to check whether a calendar event exists for a given course and date.
 * If the event doesn't exist, the request is allowed to proceed, otherwise an error response is sent.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
export const doesEventNotExist = async (req, res, next) => {
  debug("checking whether calendar event exists");
  const { courseId, date } = req.body;
  debug("getting calendar event...");
  let dateObj = new Date(date);
  dateObj.setUTCHours(23);
  const calendarEvent = await prisma.calendarEvent.findUnique({
    where: {
      courseId_date: {
        courseId: courseId,
        date: dateObj,
      },
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
};

/**
 * Middleware function to check whether the end date is after the start date.
 * If the end date is after the start date, the request is allowed to proceed,
 * otherwise an error response is sent.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
export const endAfterStart = async (req, res, next) => {
  debug("Checking that end date is after start date");
  const { begDate, endDate } = req.body;
  let begDateObj = new Date(begDate);
  begDateObj.setUTCHours(23);
  let endDateObj = new Date(endDate);
  endDateObj.setUTCHours(23);
  let end = spacetime(endDateObj);
  let beg = spacetime(begDateObj);
  if (!beg.isAfter(end)) {
    debug("end date is after beginning date");
    next();
  } else {
    debug("end date is before beginning date");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: end date is before beginning date" });
  }
};

/**
 * Middleware function to check whether the course begins on a specified day of the week.
 * If the course begins on the specified day, the request is allowed to proceed,
 * otherwise an error response is sent.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
export const doesCourseBeginOnDay = async (req, res, next) => {
  debug("checking whether course begins on beginning day");
  const { begDate, daysOfWeek } = req.body;
  let begDateObj = new Date(begDate);
  begDateObj.setUTCHours(23);
  const dateObj = spacetime(begDateObj);
  let isValid = false;
  daysOfWeek.forEach((dow) => {
    if (dateObj.toNativeDate().getDay() == weekday.indexOf(dow)) {
      isValid = true;
    }
  });
  if (isValid) {
    debug("course occurs on this day");
    next();
  } else {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: course does not occur on this day" });
  }
};

/**
 * Middleware function to check whether the user is an instructor of the specified course.
 * If the user is an instructor of the course, the request is allowed to proceed,
 * otherwise a forbidden response is sent.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
export const isCourseInstructor = async (req, res, next) => {
  const { courseId } = req.body;
  const id = req.id;
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      instructors: {
        where: {
          id,
        },
      },
    },
  });
  if (course.instructors.length === 0) {
    return res.status(StatusCodes.FORBIDDEN).json({
      msg: "ERROR: must be instructor",
    });
  } else {
    next();
  }
};

/**
 * Middleware function to check whether the user is an instructor of the specified course.
 * If the user is an instructor of the course, the request is allowed to proceed,
 * otherwise a forbidden response is sent.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
export const isCourseInstructorParams = async (req, res, next) => {
  const courseId = parseInt(req.params.courseId, 10);
  const id = req.id;
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      instructors: {
        where: {
          id,
        },
      },
    },
  });
  if (course.instructors.length === 0) {
    return res.status(StatusCodes.FORBIDDEN).json({
      msg: "ERROR: must be instructor",
    });
  } else {
    next();
  }
};

/**
 * Middleware function to check whether the provided days of the week are valid.
 * If the days of the week are valid, the request is allowed to proceed,
 * otherwise an error response is sent.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
export const areValidDOW = (req, res, next) => {
  debug("checking if days of week are valid");
  const { daysOfWeek } = req.body;
  if (daysOfWeek === undefined || daysOfWeek.length === 0) {
    debug("days of week not included");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: days of the week not included" });
  }
  daysOfWeek.forEach((dow) => {
    if (!weekday.includes(dow)) {
      debug("invalid days of week");
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "ERROR: invalid days of week" });
    }
  });
  debug("days of week are valid");
  next();
};

/**
 * Middleware function to check whether the start date falls on a valid day of the week.
 * If the start date falls on a valid day of the week, the request is allowed to proceed,
 * otherwise an error response is sent.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
export const startDateIsValidDOW = (req, res, next) => {
  debug("checking if start date is valid day of week");
  const { daysOfWeek, begDate } = req.body;
  let begDateObj = new Date(begDate);
  begDateObj.setUTCHours(23);
  const start = spacetime(begDateObj);
  const startDOW = weekday[start.day()];
  if (daysOfWeek.includes(startDOW)) {
    debug("beginning date is valid day of week");
    next();
  } else {
    debug("beginning date is not valid day of week");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: begDate must be one of the selected DOWs" });
  }
};

/**
 * Middleware function to check whether the user is a member of the specified course.
 * If the user is a member of the course, the request is allowed to proceed,
 * otherwise a forbidden response is sent.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
export const isInCourse = async (req, res, next) => {
  debug("isInCourse is called!");
  debug("Retrieving course id from url...");
  const courseId = parseInt(req.params.courseId, 10);
  const id = req.id;
  debug("Checking if account is a student...");
  const studentQuery = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      students: {
        where: {
          id,
        },
      },
    },
  });
  debug("Checking if account is in course staff...");
  const staffQuery = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      courseStaff: {
        where: {
          id,
        },
      },
    },
  });
  debug("Checking if account is an instructor...");
  const instructorQuery = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      instructors: {
        where: {
          id,
        },
      },
    },
  });
  if (
    studentQuery.students.length === 0 &&
    staffQuery.courseStaff.length === 0 &&
    instructorQuery.instructors.length === 0
  ) {
    debug("Account is not a course member...");
    debug("Error in isInCourse!");
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "ERROR: User is not in course" });
  } else {
    debug("Account is a course member!");
    debug("isInCourse is done!");
    next();
  }
};

/**
 * Middleware function to check whether the new date is different from the old date
 * and if the course already exists on the new date. If conditions are met, the
 * request is allowed to proceed; otherwise, an error response is sent.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
export const newDateNotOldDate = async (req, res, next) => {
  const { newDate, courseId, date } = req.body;
  const newDateObj = new Date(newDate);
  const oldDateObj = new Date(date);
  oldDateObj.setUTCHours(23);
  const calendarEvent = await prisma.calendarEvent.findUnique({
    where: {
      courseId_date: {
        courseId: courseId,
        date: new Date(newDateObj.setUTCHours(23)),
      },
    },
  });
  if (newDateObj.getTime() === oldDateObj.getTime()) {
    debug("edited course date is not changing");
    next();
  } else if (calendarEvent === null || calendarEvent === undefined) {
    debug("course does not exist on this day");
    next();
  } else {
    debug("Course already occurs on this day");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: Course already exists on this day" });
  }
};

/**
 * Middleware function to check whether both the original date and the new date are in the future.
 * If both dates are in the future, the request is allowed to proceed; otherwise, an error response is sent.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
export const newDateInFuture = async (req, res, next) => {
  const { date, newDate } = req.body;
  let dateObj = new Date(date);
  dateObj.setUTCHours(23);
  let newDateObj = new Date(newDate);
  newDateObj.setUTCHours(23);
  const nowDate = spacetime(new Date().setUTCHours(23));
  let spaceDate = spacetime(dateObj);
  let spaceNewDate = spacetime(newDateObj);
  if (spaceDate.isBefore(nowDate) || spaceNewDate.isBefore(nowDate)) {
    debug("dates are not in the future");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: dates are not in the future" });
  } else {
    debug("dates are in the future");
    next();
  }
};

/**
 * Middleware function to check whether both the beg date and the end date are in the future.
 * If both dates are in the future, the request is allowed to proceed; otherwise, an error response is sent.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
export const begDateInFuture = async (req, res, next) => {
  const { begDate, endDate } = req.body;
  let begDateObj = new Date(begDate);
  begDateObj.setUTCHours(23);
  let endDateObj = new Date(endDate);
  endDateObj.setUTCHours(23);
  const nowDate = spacetime(new Date().setUTCHours(23));
  let spaceBeg = spacetime(begDateObj);
  let spaceEnd = spacetime(endDateObj);
  if (spaceBeg.isBefore(nowDate) || spaceEnd.isBefore(nowDate)) {
    debug("dates are not in the future");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: dates are not in the future" });
  } else {
    debug("dates are in the future");
    next();
  }
};

/**
 * Middleware function to check whether the original date is in the future.
 * If it is in the future, the request is allowed to proceed; otherwise, an error response is sent.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
export const dateInFuture = async (req, res, next) => {
  const { date } = req.body;
  let dateObj = new Date(date);
  dateObj.setUTCHours(23);
  const nowDate = spacetime(new Date().setUTCHours(23));
  let spaceDate = spacetime(dateObj);
  if (spaceDate.isBefore(nowDate)) {
    debug("date is not in the future");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: date is not in the future" });
  } else {
    debug("date is in the future");
    next();
  }
};

/**
 * Middleware function to check whether the original date is in the future.
 * If it is in the future, the request is allowed to proceed; otherwise, an error response is sent.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
export const dateInFutureParams = async (req, res, next) => {
  const date = req.params.date;
  let dateObj = new Date(date);
  dateObj.setUTCHours(23);
  const nowDate = spacetime(new Date().setUTCHours(23));
  let spaceDate = spacetime(dateObj);
  if (spaceDate.isBefore(nowDate)) {
    debug("date is not in the future");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: date is not in the future" });
  } else {
    debug("date is in the future");
    next();
  }
};

/**
 * Middleware function to check whether the provided date is in correct UTC timezone.
 * If the date is in correct UTC timezone, the request is allowed to proceed;
 * otherwise, an error response is sent.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
export const isUTC0 = async (req, res, next) => {
  debug("getting date");
  const { date } = req.body;
  const dateObj = spacetime(date);
  const dateOffset = Math.abs(dateObj.timezone().current.offset);
  const dateHours = dateObj.toNativeDate().getUTCHours();
  if (dateOffset === dateHours) {
    debug("UTC hour is the same");
    next();
  } else {
    debug("UTC hour is not the same");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: UTC hour is not the same" });
  }
};

/**
 * Middleware function to check whether the provided date is in correct UTC timezone.
 * If the date is in correct UTC timezone, the request is allowed to proceed;
 * otherwise, an error response is sent.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
export const isUTC0Params = async (req, res, next) => {
  debug("getting date");
  const date = req.params.date;
  const dateObj = spacetime(date);
  const dateOffset = Math.abs(dateObj.toNativeDate().getTimezoneOffset() / 60);
  const dateHours = dateObj.toNativeDate().getUTCHours();
  if (dateOffset === dateHours) {
    debug("UTC hour is the same");
    next();
  } else {
    debug("UTC hour is not the same");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: UTC hour is not the same" });
  }
};

/**
 * Middleware function to check whether the provided beginning and end dates are in the same UTC timezone.
 * If both dates are in the correct UTC timezone, the request is allowed to proceed;
 * otherwise, an error response is sent.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
export const isUTCTwo = async (req, res, next) => {
  debug("getting dates");
  const { begDate, endDate } = req.body;
  const begDateObj = spacetime(begDate);
  const endDateObj = spacetime(endDate);
  const begOffset = Math.abs(
    begDateObj.toNativeDate().getTimezoneOffset() / 60
  );
  const endOffset = Math.abs(
    endDateObj.toNativeDate().getTimezoneOffset() / 60
  );
  const begHours = begDateObj.toNativeDate().getUTCHours();
  const endHours = endDateObj.toNativeDate().getUTCHours();
  if (begOffset === begHours && endOffset === endHours) {
    debug("UTC hour is the same for both dates");
    next();
  } else {
    debug("UTC hour is not the same for one or both dates");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: UTC hour is not the same for one or both dates" });
  }
};

/**
 * Middleware function to check whether the provided original and new dates are in the same UTC timezone.
 * If both dates are in the correct UTC timezone, the request is allowed to proceed;
 * otherwise, an error response is sent.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
export const isUTCTwoNewDate = async (req, res, next) => {
  debug("getting dates");
  const { date, newDate } = req.body;
  const dateObj = spacetime(date);
  const newDateObj = spacetime(newDate);
  const dateOffset = Math.abs(dateObj.toNativeDate().getTimezoneOffset() / 60);
  const newOffset = Math.abs(
    newDateObj.toNativeDate().getTimezoneOffset() / 60
  );
  const dateHours = dateObj.toNativeDate().getUTCHours();
  const newHours = newDateObj.toNativeDate().getUTCHours();
  if (dateOffset === dateHours && newOffset === newHours) {
    debug("UTC hour is the same");
    next();
  } else {
    debug("UTC hour is not the same");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: UTC hour is not the same for one or both dates" });
  }
};
