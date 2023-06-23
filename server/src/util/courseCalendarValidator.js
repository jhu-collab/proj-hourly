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

// export const isCourseOnDayAlready = async (req, res, next) => {
//   debug("checking whether course is on entered day");
//   const { daysOfWeek, daysOfWeek } = req.body;
//   const dateObj = new Date(date);
//   let isValid = true;
//   debug("getting calendar event...");
//   daysOfWeek.forEach((dow) => {
//     daysOfWeek.forEach((newDow) => {
//       if (!(newDow != dow)) {
//         isValid = false;
//       }
//     });
//   });
//   if (isValid) {
//     debug("course does not occur on this day yet");
//     next();
//   } else {
//     return res
//       .status(StatusCodes.BAD_REQUEST)
//       .json({ msg: "ERROR: course already occurs on this day" });
//   }
// }

export const doesEventExist =  async (req, res, next) => {
  debug("checking whether calendar event exists");
  const {courseId, date} = req.body;
  debug("getting calendar event...");
  const calendarEvent = await prisma.calendarEvent.findUnique({
    where: {
      courseId_date: {
        courseId: courseId,
        date: new Date(date),
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
}

export const doesEventExistRecurring =  async (req, res, next) => {
  debug("checking whether calendar events exist");
  const {courseId, daysOfWeek, begDate, endDate } = req.body;
  debug("getting calendar event...");
  let end = spacetime(endDate);
  let beg = spacetime(begDate);
  let indices = [];
  daysOfWeek.forEach((dow) => {
    indices.push(weekday.indexOf(dow));
  });
  indices.sort();
  const newDays = [];
  let i = indices.indexOf(beg.toNativeDate().getDay());
  while (!beg.isAfter(end)) {
    newDays.push(beg.toNativeDate());
    let diff = indices[(i+1) % indices.length] - indices[i % indices.length];
    if (diff <= 0) {
      diff += 7;
    };
    beg = beg.add(diff, 'day');
  }
  const calendarEvents = await prisma.calendarEvent.findMany({
    where : {
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
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: calendar event exists on days" });
  }
}

export const doesEventNotExist =  async (req, res, next) => {
  debug("checking whether calendar event exists");
  const {courseId, date} = req.body;
  debug("getting calendar event...");
  const calendarEvent = await prisma.calendarEvent.findUnique({
    where: {
      courseId_date: {
        courseId: courseId,
        date: new Date(date),
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
}


export const isEventNotCancelled =  async (req, res, next) => {
  debug("checking whether calendar event exists");
  const {courseId, date} = req.body;
  debug("getting calendar event...");
  const calendarEvent = await prisma.calendarEvent.findUnique({
    where: {
      courseId_date: {
        courseId: courseId,
        date: new Date(date),
      },
    },
  });
  debug("got calendar event");
  if (calendarEvent.isCancelled) {
    debug("calendar event is cancelled");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: calendar event is cancelled" });
  } else {
    debug("calendar event is not cancelled");
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
  const dateObj = spacetime(begDate);
  let isValid = false;
  daysOfWeek.forEach((dow) => {
    if((dateObj.toNativeDate().getDay() == weekday.indexOf(dow))) {
      isValid = true;
    }
  });
  if (isValid) {
    debug("course occurs on this day")
    next(); 
  } else {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: course does not occur on this day" });
  }
}

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
  console.log(course)
  if (course.instructors.length === 0) {
    return res.status(StatusCodes.FORBIDDEN).json({
      msg: "ERROR: must be instructor",
    });
  } else {
    next();
  }
};

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

export const startDateIsValidDOW = (req, res, next) => {
  debug("checking if start date is valid day of week");
  const { daysOfWeek, begDate } = req.body;
  const start = spacetime(begDate);
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

export const doesNotHaveCourseEvents = async (req, res, next) => {
  debug("checkign if course has events");
  const { courseId } = req.body;
  const calendarEvents = await prisma.calendarEvent.findMany({
    where: {
      courseId: courseId,
    }
  });
  if (calendarEvents.length === 0) {
    debug("course has no events");
    next();
  } else {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: course has events" });
  }
};