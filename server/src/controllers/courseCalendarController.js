import prisma from "../../prisma/client.js";
import { StatusCodes } from "http-status-codes";
import validate from "../util/checkValidation.js";
import ical from "ical-generator";
import { generateCourseCalendar } from "../util/icalHelpers.js";
import { factory } from "../util/debug.js";
import spacetime from "spacetime";
import { empty } from "@prisma/client/runtime/index.js";
import { date } from "zod";

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
    courseInfo = {courseId, agendaDescrip, additionalInfo, date:begDate.toNativeDate()};
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
  const eventJSon = generateCourseCalendar(courseId);
  debug("calendar events are created");
  return res.status(StatusCodes.ACCEPTED).json({ eventJSon });
};
// pass in list of topics? assign those to dates until list runs out?

export const deleteEvent = async (req, res) => {
  if (checkValidation(req, res)) {
    return res;
  }
  const { courseId, date} = req.body;
  const dateObj = new Date(date);
  debug("cancelling calendar event...");
  const calendarEvent = await prisma.calendarEvent.delete({
    where: {
      courseId,
      date: {
        equals: dateObj,
      }
    },
  });
  debug("calendar event is cancelled")
  return res.status(StatusCodes.ACCEPTED).json({ calendarEvent });
};

export const editEvent = async (req, res) => {
  if (checkValidation(req, res)) {
    return res;
  }
  const courseId = parseInt(req.params.courseId, 10);
  const dateObj = req.body.date;
  const calendarEvents = await prisma.calendarEvent.findUnique({
    where: {
      courseId: courseId,
      date: new Date(dateObj),
    },
  });
  debug("calendar event is found");
  const { date, agendaDescrip, additionalInfo } = req.body;
  debug("updating calendar event");
  const calendarEvent = await prisma.officeHour.update({
    where: {
      courseId: courseId,
      date: new Date(dateObj),
    },
    data: {
      date: new Date(date),
      agendaDescrip: agendaDescrip,
      additionalInfo: additionalInfo,
      isCancelled: calendarEvents.isCancelled,
    },
  });
  debug("calendar event is updated");
  return res.status(StatusCodes.ACCEPTED).json({ calendarEvent });
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
      isCancelled: false,
    },
    include: {
      agendaDescrip: true,
    },
    orderBy: {
      date: "asc",
    },
  });
  debug("calendar events for course found");
  return res.status(StatusCodes.ACCEPTED).json({ calendarEvents });
};

// manually add course event
// manually add new recurring date ????
// edit all classes for a course
// cancel class?
// get a specific course day
// delete all events for a course
// remote
// isCancelled
// location