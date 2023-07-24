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

export const create = async (req, res) => {
  const {courseId, begDate, endDate, daysOfWeek, location } = req.body;
  debug("creating calendar events for course...");
  let end = spacetime(endDate);
  end = end.add(23 - end.toNativeDate().getUTCHours(), "hours");
  let beg = spacetime(begDate);
  beg = beg.add(23 - beg.toNativeDate().getUTCHours(), "hours");
  let indices = [];
  daysOfWeek.forEach((dow) => {
    indices.push(weekday.indexOf(dow));
  });
  indices.sort();
  const calendarEvents = [];
  let i = indices.indexOf(beg.toNativeDate().getDay());
  while (!beg.isAfter(end)) {
    let courseInfo = {courseId, agendaDescrip: "", additionalInfo: "", location: location, date: beg.toNativeDate()};
    calendarEvents.push(courseInfo);
    let diff = indices[(i+1) % indices.length] - indices[i % indices.length];
    i++;
    if (diff <= 0) {
      diff += 7;
    };
    beg = beg.add(diff, 'day');
  }
  const createdEvents = await prisma.calendarEvent.createMany({
    data: calendarEvents,
  });
  const eventJSon = await generateCourseCalendar(courseId);
  debug("calendar events are created");
  return res.status(StatusCodes.ACCEPTED).json({ eventJSon });
};
// pass in list of topics? assign those to dates until list runs out?

export const changeCancellation = async (req, res) => {
  if (checkValidation(req, res)) {
    return res;
  }
  const { courseId, date } = req.body;
  let dateObj = spacetime(date);
  dateObj = dateObj.add(23 - dateObj.toNativeDate().getUTCHours(), "hours");
  debug("cancelling or uncancelling calendar event...");
  const calendarEvent = await prisma.calendarEvent.findUnique({
    where: {
      courseId_date: {
        courseId: courseId,
        date: dateObj.toNativeDate(),
      }
    }
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
    }
  });
  const eventJSon = await generateCourseCalendar(courseId);
  debug("calendar event cancellation is changed")
  return res.status(StatusCodes.ACCEPTED).json({ eventJSon });
};

export const changeRemote = async (req, res) => {
  if (checkValidation(req, res)) {
    return res;
  }
  const { courseId, date, isRemote } = req.body;
  let dateObj = spacetime(date);
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
    }
  });
  const eventJSon = await generateCourseCalendar(courseId);
  debug("made calendar event remote or in person calendar event...");
  return res.status(StatusCodes.ACCEPTED).json({ eventJSon });
};

export const editEvent = async (req, res) => {
  if (checkValidation(req, res)) {
    return res;
  }
  const { date, agendaDescrip, additionalInfo, newDate, location, isCancelled, isRemote, courseId } = req.body;
  let newDateObj = spacetime(newDate);
  newDateObj = newDateObj.add(23 - newDateObj.toNativeDate().getUTCHours(), "hours");
  let dateObj = spacetime(date);
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
      agendaDescrip: agendaDescrip,
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

export const addCourseEvent = async (req, res) => {
  if (checkValidation(req, res)) {
    return res;
  }
  const {courseId, date, agendaDescrip, additionalInfo, location, isRemote } = req.body;
  let dateObj = spacetime(date);
  dateObj = dateObj.add(23 - dateObj.toNativeDate().getUTCHours(), "hours");
  debug("adding new calendar event")
  const calendarEvent = await prisma.calendarEvent.create({
    data: {
      courseId,
      date: dateObj.toNativeDate(),
      agendaDescrip: agendaDescrip,
      additionalInfo: additionalInfo,
      location: location,
      isCancelled: false,
      isRemote: isRemote,
      allDay: true,
    },
  });
  const eventJSon = await generateCourseCalendar(courseId);
  debug("made new calendar event...");
  return res.status(StatusCodes.ACCEPTED).json({ eventJSon });
};

export const addRecurringCourseEvent = async (req, res) => {
  const {courseId, begDate, endDate, daysOfWeek, location } = req.body;
  debug("creating calendar events for course...");
  let end = spacetime(endDate);
  end = end.hour(23 - end.toNativeDate().getUTCHours());
  let beg = spacetime(begDate);
  beg = beg.hour(23 - beg.toNativeDate().getUTCHours());
  let indices = [];
  daysOfWeek.forEach((dow) => {
    indices.push(weekday.indexOf(dow));
  });
  indices.sort();
  const calendarEvents = [];
  let i = indices.indexOf(beg.toNativeDate().getDay());
  while (!beg.isAfter(end)) {
    let courseInfo = {courseId, agendaDescrip: "", additionalInfo: "", location: location, date:beg.toNativeDate()};
    calendarEvents.push(courseInfo);
    let diff = indices[(i+1) % indices.length] - indices[i % indices.length];
    i++;
    if (diff <= 0) {
      diff += 7;
    };
    beg = beg.add(diff, 'day');
  }
  const createdEvents = await prisma.calendarEvent.createMany({
    data: calendarEvents,
  });
  const eventJSon = await generateCourseCalendar(courseId);
  debug("calendar events are created");
  return res.status(StatusCodes.ACCEPTED).json({ eventJSon });
};

export const editAllEvents = async (req, res) => {
  if (checkValidation(req, res)) {
    return res;
  }
  const { agendaDescrip, additionalInfo, location, isCancelled, isRemote, courseId } = req.body;
  debug("updating calendar event");
  const edited = await prisma.calendarEvent.updateMany({
    where: {
      courseId_date: {
        courseId: courseId,
      },
    },
    data: {
      agendaDescrip: agendaDescrip,
      additionalInfo: additionalInfo,
      isCancelled: isCancelled,
      isRemote: isRemote,
      location: location,
    },
  });
  debug("calendar event is updated");
  const eventJSon = await generateCourseCalendar(courseId);
  return res.status(StatusCodes.ACCEPTED).json({ eventJSon });
};

export const getEventOnDay = async (req, res) => {
  if (checkValidation(req, res)) {
    return res;
  }
  const courseId = parseInt(req.params.courseId, 10);
  const date = req.params.date;
  let dateObj = spacetime(date);
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
  debug("course events deleted")
  const eventJSon = await generateCourseCalendar(courseId);
  return res.status(StatusCodes.ACCEPTED).json({ eventJSon });
};

export const deleteCourseOnDay = async (req, res) => {
  if (checkValidation(req, res)) {
    return res;
  }
  const courseId = parseInt(req.params.courseId, 10);
  const date = req.params.date;
  let dateObj = spacetime(date);
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
  debug("course event deleted")
  const eventJSon = await generateCourseCalendar(courseId);
  return res.status(StatusCodes.ACCEPTED).json({ eventJSon });
};