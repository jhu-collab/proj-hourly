import prisma from "../../prisma/client.js";
import { StatusCodes } from "http-status-codes";
import ical from "ical-generator";
import { generateCourseCalendar } from "../util/icalHelpers.js";
import { factory } from "../util/debug.js";
import spacetime from "spacetime";
import checkValidation from "../util/checkValidation.js";

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

/**
 * Controller function to create calendar events for a course based on the provided details.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
export const create = async (req, res) => {
  const {
    courseId,
    begDate,
    endDate,
    daysOfWeek,
    location,
    title,
    additionalInfo,
    isRemote,
  } = req.body;
  debug("creating calendar events for course...");
  let thisEnd = new Date(endDate);
  let thisBeg = new Date(begDate);
  let end = spacetime(thisEnd);
  end = end.add(23 - end.toNativeDate().getUTCHours(), "hours");
  let beg = spacetime(thisBeg);
  beg = beg.add(23 - beg.toNativeDate().getUTCHours(), "hours");
  let indices = [];
  daysOfWeek.forEach((dow) => {
    indices.push(weekday.indexOf(dow));
  });
  indices.sort();
  const calendarEvents = [];
  let i = indices.indexOf(beg.toNativeDate().getDay());
  while (!beg.isAfter(end)) {
    let courseInfo = {
      courseId,
      title: title,
      additionalInfo: additionalInfo,
      location: location,
      date: beg.toNativeDate(),
      isRemote: isRemote,
    };
    calendarEvents.push(courseInfo);
    let diff = indices[(i + 1) % indices.length] - indices[i % indices.length];
    i++;
    if (diff <= 0) {
      diff += 7;
    }
    beg = beg.add(diff, "day");
  }
  const createdEvents = await prisma.calendarEvent.createMany({
    data: calendarEvents,
  });
  const eventJSon = await generateCourseCalendar(courseId);
  debug("calendar events are created");
  return res.status(StatusCodes.CREATED).json({ eventJSon });
};
// pass in list of topics? assign those to dates until list runs out?

/**
 * Controller function to change the cancellation status of a calendar event for a course based on the provided details.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
export const changeCancellation = async (req, res) => {
  if (checkValidation(req, res)) {
    return res;
  }
  const { courseId, date } = req.body;
  let thisDate = new Date(date);
  let dateObj = spacetime(thisDate);
  dateObj = dateObj.add(23 - dateObj.toNativeDate().getUTCHours(), "hours");
  debug("cancelling or uncancelling calendar event...");
  const calendarEvent = await prisma.calendarEvent.findUnique({
    where: {
      courseId_date: {
        courseId: courseId,
        date: dateObj.toNativeDate(),
      },
    },
  });
  const newEvent = await prisma.calendarEvent.update({
    where: {
      courseId_date: {
        courseId: courseId,
        date: dateObj.toNativeDate(),
      },
    },
    data: {
      isCancelled: !calendarEvent.isCancelled,
    },
  });
  const eventJSon = await generateCourseCalendar(courseId);
  debug("calendar event cancellation is changed");
  return res.status(StatusCodes.ACCEPTED).json({ eventJSon });
};

/**
 * Controller function to change the remote status of a calendar event for a course based on the provided details.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
export const changeRemote = async (req, res) => {
  if (checkValidation(req, res)) {
    return res;
  }
  const { courseId, date } = req.body;
  let thisDate = new Date(date);
  let dateObj = spacetime(thisDate);
  dateObj = dateObj.add(23 - dateObj.toNativeDate().getUTCHours(), "hours");
  debug("making calendar event remote or in person calendar event...");
  const calendarEvent = await prisma.calendarEvent.findUnique({
    where: {
      courseId_date: {
        courseId: courseId,
        date: dateObj.toNativeDate(),
      },
    },
  });
  const newEvent = await prisma.calendarEvent.update({
    where: {
      courseId_date: {
        courseId: courseId,
        date: dateObj.toNativeDate(),
      },
    },
    data: {
      isRemote: !calendarEvent.isRemote,
    },
  });
  const eventJSon = await generateCourseCalendar(courseId);
  debug("made calendar event remote or in person calendar event...");
  return res.status(StatusCodes.ACCEPTED).json({ eventJSon });
};

/**
 * Controller function to edit a calendar event for a course based on the provided details.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
export const editEvent = async (req, res) => {
  if (checkValidation(req, res)) {
    return res;
  }
  const {
    date,
    title,
    additionalInfo,
    newDate,
    location,
    isCancelled,
    isRemote,
    courseId,
  } = req.body;
  let thisNew = new Date(newDate);
  let newDateObj = spacetime(thisNew);
  newDateObj = newDateObj.add(
    23 - newDateObj.toNativeDate().getUTCHours(),
    "hours"
  );
  let thisDate = new Date(date);
  let dateObj = spacetime(thisDate);
  dateObj = dateObj.add(23 - dateObj.toNativeDate().getUTCHours(), "hours");
  debug("updating calendar event");
  const edited = await prisma.calendarEvent.update({
    where: {
      courseId_date: {
        courseId: courseId,
        date: dateObj.toNativeDate(),
      },
    },
    data: {
      date: newDateObj.toNativeDate(),
      title: title,
      additionalInfo: additionalInfo,
      isCancelled: isCancelled,
      isRemote: isRemote,
      location: location,
      allDay: true,
    },
  });
  debug("calendar event is updated");
  const eventJSon = await generateCourseCalendar(courseId);
  return res.status(StatusCodes.ACCEPTED).json({ eventJSon });
};

/**
 * Controller function to edit the title of a calendar event for a course based on the provided details.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
export const editEventTitle = async (req, res) => {
  if (checkValidation(req, res)) {
    return res;
  }
  const { date, title, courseId } = req.body;
  let thisDate = new Date(date);
  let dateObj = spacetime(thisDate);
  dateObj = dateObj.add(23 - dateObj.toNativeDate().getUTCHours(), "hours");
  debug("updating calendar event");
  const edited = await prisma.calendarEvent.update({
    where: {
      courseId_date: {
        courseId: courseId,
        date: dateObj.toNativeDate(),
      },
    },
    data: {
      title: title,
    },
  });
  debug("calendar event is updated");
  const eventJSon = await generateCourseCalendar(courseId);
  return res.status(StatusCodes.ACCEPTED).json({ eventJSon });
};

/**
 * Controller function to edit the location of a calendar event for a course based on the provided details.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
export const editEventLocation = async (req, res) => {
  if (checkValidation(req, res)) {
    return res;
  }
  const { date, location, courseId, isRemote } = req.body;
  let thisDate = new Date(date);
  let dateObj = spacetime(thisDate);
  dateObj = dateObj.add(23 - dateObj.toNativeDate().getUTCHours(), "hours");
  debug("updating calendar event");
  const edited = await prisma.calendarEvent.update({
    where: {
      courseId_date: {
        courseId: courseId,
        date: dateObj.toNativeDate(),
      },
    },
    data: {
      location: location,
      isRemote: isRemote,
    },
  });
  debug("calendar event is updated");
  const eventJSon = await generateCourseCalendar(courseId);
  return res.status(StatusCodes.ACCEPTED).json({ eventJSon });
};

/**
 * Controller function to get the calendar events of a course based on the provided details.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
export const getAllEventsForCourse = async (req, res) => {
  if (checkValidation(req, res)) {
    return res;
  }
  const courseId = parseInt(req.params.courseId, 10);
  debug("finding events");
  const calendarEvents = await prisma.calendarEvent.findMany({
    where: {
      courseId: courseId,
    },
    orderBy: {
      date: "asc",
    },
  });
  debug("calendar events for course found");
  return res.status(StatusCodes.ACCEPTED).json({ calendarEvents });
};

/**
 * Controller function to get the non-cancelled calendar events of a course based on the provided details.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
export const getAllNotCancelledEventsForCourse = async (req, res) => {
  if (checkValidation(req, res)) {
    return res;
  }
  const courseId = parseInt(req.params.courseId, 10);
  debug("finding events");
  const calendarEvents = await prisma.calendarEvent.findMany({
    where: {
      courseId: courseId,
      isCancelled: false,
    },
    orderBy: {
      date: "asc",
    },
  });
  debug("non-cancelled calendar events for course found");
  return res.status(StatusCodes.ACCEPTED).json({ calendarEvents });
};

/**
 * Controller function to get the cancelled calendar events of a course based on the provided details.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
export const getAllCancelledEventsForCourse = async (req, res) => {
  if (checkValidation(req, res)) {
    return res;
  }
  const courseId = parseInt(req.params.courseId, 10);
  debug("finding events");
  const calendarEvents = await prisma.calendarEvent.findMany({
    where: {
      courseId: courseId,
      isCancelled: true,
    },
    orderBy: {
      date: "asc",
    },
  });
  debug("cancelled calendar events for course found");
  return res.status(StatusCodes.ACCEPTED).json({ calendarEvents });
};

/**
 * Controller function to add a single calendar event to a course based on the provided details.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
export const addCourseEvent = async (req, res) => {
  if (checkValidation(req, res)) {
    return res;
  }
  const { courseId, date, title, additionalInfo, location, isRemote } =
    req.body;
  let thisDate = new Date(date);
  let dateObj = spacetime(thisDate);
  dateObj = dateObj.add(23 - dateObj.toNativeDate().getUTCHours(), "hours");
  debug("adding new calendar event");
  const calendarEvent = await prisma.calendarEvent.create({
    data: {
      courseId,
      date: dateObj.toNativeDate(),
      title: title,
      additionalInfo: additionalInfo,
      location: location,
      isCancelled: false,
      isRemote: isRemote,
      allDay: true,
    },
  });
  const eventJSon = await generateCourseCalendar(courseId);
  debug("made new calendar event...");
  return res.status(StatusCodes.CREATED).json({ eventJSon });
};

/**
 * Controller function to add recurring calendar events to a course based on the provided details.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
export const addRecurringCourseEvent = async (req, res) => {
  const {
    courseId,
    begDate,
    endDate,
    daysOfWeek,
    location,
    title,
    additionalInfo,
    isRemote,
  } = req.body;
  debug("creating calendar events for course...");
  let thisEnd = new Date(endDate);
  let end = spacetime(thisEnd);
  end = end.hour(23 - end.toNativeDate().getUTCHours());
  let thisBeg = new Date(begDate);
  let beg = spacetime(thisBeg);
  beg = beg.hour(23 - beg.toNativeDate().getUTCHours());
  let indices = [];
  daysOfWeek.forEach((dow) => {
    indices.push(weekday.indexOf(dow));
  });
  indices.sort();
  const calendarEvents = [];
  let i = indices.indexOf(beg.toNativeDate().getDay());
  while (!beg.isAfter(end)) {
    let courseInfo = {
      courseId,
      title: title,
      additionalInfo: additionalInfo,
      location: location,
      date: beg.toNativeDate(),
      isRemote: isRemote,
    };
    calendarEvents.push(courseInfo);
    let diff = indices[(i + 1) % indices.length] - indices[i % indices.length];
    i++;
    if (diff <= 0) {
      diff += 7;
    }
    beg = beg.add(diff, "day");
  }
  const createdEvents = await prisma.calendarEvent.createMany({
    data: calendarEvents,
  });
  const eventJSon = await generateCourseCalendar(courseId);
  debug("calendar events are created");
  return res.status(StatusCodes.CREATED).json({ eventJSon });
};

/**
 * Controller function to get a calendar event for a course on a specific day based on the provided details.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
export const getEventOnDay = async (req, res) => {
  if (checkValidation(req, res)) {
    return res;
  }
  const courseId = parseInt(req.params.courseId, 10);
  const date = req.params.date;
  let thisDate = new Date(date);
  let dateObj = spacetime(thisDate);
  dateObj = dateObj.add(23 - dateObj.toNativeDate().getUTCHours(), "hours");
  debug("finding event");
  const calendarEvents = await prisma.calendarEvent.findUnique({
    where: {
      courseId_date: {
        courseId: courseId,
        date: dateObj.toNativeDate(),
      },
    },
  });
  debug("calendar event for course found");
  return res.status(StatusCodes.ACCEPTED).json({ calendarEvents });
};

/**
 * Controller function to delete all events for a course based on the provided details.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
export const deleteCourse = async (req, res) => {
  if (checkValidation(req, res)) {
    return res;
  }
  const courseId = parseInt(req.params.courseId, 10);
  debug("deleting all events for course");
  const calendarEvents = await prisma.calendarEvent.deleteMany({
    where: {
      courseId: courseId,
    },
  });
  debug("course events deleted");
  const eventJSon = await generateCourseCalendar(courseId);
  return res.status(StatusCodes.ACCEPTED).json({ eventJSon });
};

/**
 * Controller function to delete a calendar event for a course on a specific day based on the provided details.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
export const deleteCourseOnDay = async (req, res) => {
  if (checkValidation(req, res)) {
    return res;
  }
  const courseId = parseInt(req.params.courseId, 10);
  const date = req.params.date;
  let thisDate = new Date(date);
  let dateObj = spacetime(thisDate);
  dateObj = dateObj.add(23 - dateObj.toNativeDate().getUTCHours(), "hours");
  debug("deleting all events for course on date");
  const calendarEvents = await prisma.calendarEvent.delete({
    where: {
      courseId_date: {
        courseId: courseId,
        date: dateObj.toNativeDate(),
      },
    },
  });
  debug("course event deleted");
  const eventJSon = await generateCourseCalendar(courseId);
  return res.status(StatusCodes.ACCEPTED).json({ eventJSon });
};
