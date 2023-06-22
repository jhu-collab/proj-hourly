import prisma from "../../prisma/client.js";
import { StatusCodes } from "http-status-codes";
import ical from "ical-generator";
import { generateCourseCalendar } from "../util/icalHelpers.js";
import { factory } from "../util/debug.js";
import spacetime from "spacetime";

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
  const {courseId, begDate, endDate, daysOfWeek } = req.body;
  debug("creating calendar events for course...");
  let end = spacetime(endDate);
  let beg = spacetime(begDate);
  let indices = [];
  daysOfWeek.forEach((dow) => {
    indices.push(weekday.indexOf(dow));
  });
  indices.sort();
  const calendarEvents = [];
  i = indices.indexOf(begDate.toNativeDate().getDay());
  while (!beg.isAfter(end)) {
    courseInfo = {courseId, agendaDescrip, additionalInfo, location, date:begDate.toNativeDate()};
    calendarEvents.push(courseInfo);
    diff = indices[(i+1) % indices.length] - indices[i % indices.length];
    if (diff <= 0) {
      diff += 7;
    };
    begDate = begDate.add(diff, 'day');
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
  const { courseId, date, isCancelled } = req.body;
  const dateObj = new Date(date);
  debug("cancelling or uncancelling calendar event...");
  const calendarEvent = await prisma.calendarEvent.update({
    where: {
      courseId,
      date: {
        equals: dateObj,
      }
    },
    data: {
      isCancelled: !isCancelled,
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
  const dateObj = new Date(date);
  debug("making calendar event remote or in person calendar event...");
  const calendarEvent = await prisma.calendarEvent.update({
    where: {
      courseId,
      date: {
        equals: dateObj,
      }
    },
    data: {
      isRemote: !isRemote,
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
  const courseId = parseInt(req.params.courseId, 10);
  const { date, agendaDescrip, additionalInfo, newDate, isRemote, location } = req.body;
  debug("updating calendar event");
  const calendarEvent = await prisma.calendarEvent.update({
    where: {
      courseId: courseId,
      date: new Date(date),
    },
    data: {
      date: new Date(newDate),
      agendaDescrip: agendaDescrip,
      additionalInfo: additionalInfo,
      isCancelled: calendarEvents.isCancelled,
      isRemote: isRemote,
      location: location,
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
  debug("finding course");
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
  });
  debug("course is found");
  const calendarEvents = await prisma.calendarEvent.findMany({
    where: {
      courseId: courseId,
    },
    include: {
      course: true,
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
  debug("finding course");
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
  });
  debug("course is found");
  const calendarEvents = await prisma.calendarEvent.findMany({
    where: {
      courseId: courseId,
      isCancelled: false,
    },
    include: {
      course: true,
    },
    orderBy: {
      date: "asc",
    },
  });
  debug("calendar events for course found");
  return res.status(StatusCodes.ACCEPTED).json({ calendarEvents });
};

export const getAllCancelledEventsForCourse = async (req, res) => {
  if (checkValidation(req, res)) {
    return res;
  }
  const courseId = parseInt(req.params.courseId, 10);
  debug("finding course");
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
  });
  debug("course is found");
  const calendarEvents = await prisma.calendarEvent.findMany({
    where: {
      courseId: courseId,
      isCancelled: true,
    },
    include: {
      course: true,
    },
    orderBy: {
      date: "asc",
    },
  });
  debug("calendar events for course found");
  return res.status(StatusCodes.ACCEPTED).json({ calendarEvents });
};

export const addCourseEvent = async (req, res) => {
  if (checkValidation(req, res)) {
    return res;
  }
  const courseId = parseInt(req.params.courseId, 10);
  const {date, agendaDescrip, additionalInfo, location } = req.body;
  const dateObj = new Date(date);
  debug("finding course");
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
  });
  debug("course is found");
  const calendarEvent = await prisma.calendarEvent.create({
    where: {
      courseId,
      date: {
        equals: dateObj,
      }
    },
    data: {
      agendaDescrip: agendaDescrip,
      additionalInfo: additionalInfo,
      location: location,
    },
  });
  const eventJSon = await generateCourseCalendar(courseId);
  debug("made new calendar event...");
  return res.status(StatusCodes.ACCEPTED).json({ eventJSon });
};

export const addRecurringCourseEvent = async (req, res) => {
  const {courseId, begDate, endDate, newDaysOfWeek } = req.body;
  debug("creating calendar events for course...");
  let end = spacetime(endDate);
  let beg = spacetime(begDate);
  let indices = [];
  newDaysOfWeek.forEach((dow) => {
    indices.push(weekday.indexOf(dow));
  });
  indices.sort();
  const calendarEvents = [];
  i = indices.indexOf(begDate.toNativeDate().getDay());
  while (!beg.isAfter(end)) {
    courseInfo = {courseId, agendaDescrip, additionalInfo, location, date:begDate.toNativeDate()};
    calendarEvents.push(courseInfo);
    diff = indices[(i+1) % indices.length] - indices[i % indices.length];
    if (diff <= 0) {
      diff += 7;
    };
    begDate = begDate.add(diff, 'day');
  }
  const createdEvents = await prisma.calendarEvent.createMany({
    data: calendarEvents,
  });
  const eventJSon = await generateCourseCalendar(courseId);
  debug("calendar events are created");
  return res.status(StatusCodes.ACCEPTED).json({ eventJSon });
};


// manually add new recurring date ????
// edit all classes for a course
// cancel class?
// get a specific course day
// delete all events for a course
// remote
// isCancelled
// location