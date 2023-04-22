import prisma from "../../prisma/client.js";
import { StatusCodes } from "http-status-codes";
import { decodeToken } from "./token.js";
import { body } from "express-validator";
import { handleUTCDateChange } from "./helpers.js";
import { equalDates } from "./icalHelpers.js";
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

export const stringToTimeObj = (timeStr) => {
  const timeArray = timeStr.split(":");
  const time = new Date();
  time.setUTCHours(timeArray[0]);
  time.setUTCMinutes(timeArray[1]);
  time.setUTCSeconds(timeArray[2]);
  time.setUTCMilliseconds(0);
  time.setUTCDate(1);
  time.setUTCMonth(0);
  time.setUTCFullYear(1970);
  return time;
};

//TODO: check conflicts with host and fix query
export const noConflictsWithHosts = async (req, res, next) => {
  debug("checking confilcts with hosts");
  const { hosts, startTime, endTime, startDate, endDate, daysOfWeek } =
    req.body;
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);
  const startTimeObj = stringToTimeObj(startTime);
  const endTimeObj = stringToTimeObj(endTime);
  hosts.forEach(async (id) => {
    daysOfWeek.forEach(async (dow) => {
      const officeHour = await prisma.officeHour.findFirst({
        where: {
          AND: [
            {
              OR: [
                {
                  // existing office hour begins within request OH and ends after
                  startTime: {
                    gte: startTimeObj,
                    lte: endTimeObj,
                  },
                },
                {
                  // existing office hour begins before request and ends after
                  startTime: {
                    lte: startTimeObj,
                    lt: endTimeObj,
                  },
                },
                {
                  // exiting office hour begins before request and ends during
                  endTime: {
                    gt: startTimeObj,
                    lte: endTimeObj,
                  },
                },
              ],
            },
            {
              OR: [
                {
                  startDate: {
                    gte: startDateObj,
                    lte: endDateObj,
                  },
                },
                {
                  startDate: {
                    lte: startDateObj,
                    lt: endDateObj,
                  },
                },
                {
                  endDate: {
                    gt: startDateObj,
                    lte: endDateObj,
                  },
                },
              ],
            },
          ],
        },
        include: {
          hosts: {
            where: {
              id,
            },
          },
          isOnDayOfWeek: {
            where: {
              dayOfWeek: dow,
            },
          },
        },
      });
      if (officeHour !== null) {
        debug("conflict with host");
        return res
          .status(StatusCodes.CONFLICT)
          .json({ msg: "ERROR: office hour conflicts with one of the hosts " });
      }
    });
  });
  if (!res.headersSent) {
    debug("no conflicts with hosts");
    next();
  }
};

export const isOfficeHourOnDay = async (req, res, next) => {
  debug("checking if office hour is on day");
  const { officeHourId } = req.body;
  let officeHour = await prisma.officeHour.findFirst({
    where: {
      id: officeHourId,
    },
  });
  const dateObj = spacetime(req.targetDate);
  dateObj.goto("America/New_York");
  const dow = weekday[dateObj.day()];
  debug("getting office hour...");
  officeHour = await prisma.officeHour.findFirst({
    where: {
      id: officeHourId,
      isOnDayOfWeek: {
        some: {
          dayOfWeek: dow,
        },
      },
    },
  });
  debug("got office hour");
  let isCancelled = false;
  if (officeHour !== null) {
    officeHour.isCancelledOn.forEach((cancelledDate) => {
      if (cancelledDate.toDateString() === dateObj.toDateString()) {
        isCancelled = true;
      }
    });
  }
  if (officeHour === null || isCancelled) {
    debug("office hour is not on day");
    return res
      .status(StatusCodes.CONFLICT)
      .json({ msg: "ERROR: office hours is not available on day" });
  } else {
    debug("office hour is on day");
    next();
  }
};

export const isOfficeHourOnDayParam = async (req, res, next) => {
  debug("checking if office hour is on day");
  const officeHourId = parseInt(req.params.officeHourId, 10);
  const date = req.params.date;
  debug("getting office hour...");
  let officeHour = await prisma.officeHour.findFirst({
    where: {
      id: officeHourId,
    },
  });
  debug("got office hour");
  const dateObj = new Date(req.targetDate);
  dateObj.setUTCHours(dateObj.getUTCHours() - dateObj.getTimezoneOffset() / 60);
  if (
    new Date(officeHour.startDate).getTimezoneOffset() !=
    dateObj.getTimezoneOffset()
  ) {
    dateObj.setUTCHours(
      dateObj.getUTCHours() -
        (new Date(officeHour.startDate).getTimezoneOffset() -
          dateObj.getTimezoneOffset()) /
          60
    );
  }
  const dow = weekday[dateObj.getUTCDay()];
  officeHour = await prisma.officeHour.findFirst({
    where: {
      id: officeHourId,
      isOnDayOfWeek: {
        some: {
          dayOfWeek: dow,
        },
      },
    },
  });
  let isCancelled = false;
  if (officeHour !== null) {
    officeHour.isCancelledOn.forEach((cancelledDate) => {
      if (cancelledDate.toDateString() === dateObj.toDateString()) {
        isCancelled = true;
      }
    });
  }
  if (officeHour === null || isCancelled) {
    debug("office hour is not on day");
    return res
      .status(StatusCodes.CONFLICT)
      .json({ msg: "ERROR: office hours is not available on day" });
  } else {
    debug("office hour is on day");
    next();
  }
};

export const isWithinTimeOffering = async (req, res, next) => {
  debug("checking if time is within range of office hour");
  const { startTime, endTime, officeHourId } = req.body;
  const startTimeObj = stringToTimeObj(startTime);
  const endTimeObj = stringToTimeObj(endTime);
  const officeHour = await prisma.officeHour.findUnique({
    where: {
      id: officeHourId,
    },
  });
  if (
    officeHour.startTime > officeHour.endTime &&
    startTimeObj < officeHour.endTime &&
    endTimeObj <= officeHour.endTime
  ) {
    next();
  } else if (
    officeHour.startTime > startTimeObj ||
    officeHour.endTime <= startTimeObj ||
    officeHour.startTime >= endTimeObj ||
    officeHour.endTime < endTime
  ) {
    debug("time is not within range of office hour");
    return res
      .status(StatusCodes.CONFLICT)
      .json({ msg: "ERROR: time is not within range of office hour" });
  } else {
    debug("time is within range of office hour");
    next();
  }
};

export const isTimeCorrectInterval = async (req, res, next) => {
  debug("checking if time is correct interval");
  const { startTime, endTime, officeHourId } = req.body;
  const startTimeObj = stringToTimeObj(startTime);
  const endTimeObj = stringToTimeObj(endTime);
  if (startTimeObj > endTimeObj) {
    endTimeObj.setUTCDate(endTimeObj.getUTCDate() + 1);
  }
  debug("getting office hour...");
  const officeHour = await prisma.officeHour.findFirst({
    where: {
      id: officeHourId,
    },
  });
  debug("got office hour");
  debug("getting time options...");
  const timeOptions = await prisma.OfficeHourTimeOptions.findMany({
    where: {
      courseId: officeHour.courseId,
    },
  });
  debug("got time options");
  let valid = false;
  timeOptions.forEach((timeOption) => {
    const timeInterval = timeOption.duration * 1000 * 60;
    const diff = endTimeObj - startTimeObj;
    if (diff === timeInterval) {
      valid = true;
    }
  });

  if (!valid) {
    debug("time is not correct interval");
    return res
      .status(StatusCodes.CONFLICT)
      .json({ msg: "ERROR: time interval is not the correct length" });
  } else {
    debug("time is correct interval");
    next();
  }
};

export const isTimeAvailable = async (req, res, next) => {
  debug("checking if time is available");
  const { startTime, officeHourId, date, endTime } = req.body;
  const registrationDate = new Date(date);
  const startTimeObj = stringToTimeObj(startTime);
  const endTimeObj = stringToTimeObj(endTime);
  if (startTimeObj > endTimeObj) {
    endTimeObj.setUTCDate(endTimeObj.getUTCDate() + 1);
  }
  debug("getting registrations...");
  const officeHour = await prisma.officeHour.findUnique({
    where: {
      id: officeHourId,
    },
  });
  const registrations = await prisma.registration.findMany({
    where: {
      officeHourId,
      date: registrationDate,
      isCancelled: false,
      isCancelledStaff: false,
    },
  });
  const dateObj = new Date(date);
  debug("got registrations");
  let valid = true;
  if (officeHour.startDate.getTimezoneOffset() != dateObj.getTimezoneOffset()) {
    startTimeObj.setUTCHours(
      startTimeObj.getUTCHours() -
        (officeHour.startDate.getTimezoneOffset() -
          dateObj.getTimezoneOffset()) /
          60
    );
    endTimeObj.setUTCHours(
      endTimeObj.getUTCHours() -
        (officeHour.startDate.getTimezoneOffset() -
          dateObj.getTimezoneOffset()) /
          60
    );
  }
  registrations.forEach((registration) => {
    if (registration.startTime.getTime() === startTimeObj.getTime()) {
      valid = false;
    } else if (registration.endTime.getTime() === endTimeObj.getTime()) {
      valid = false;
    } else if (
      registration.startTime.getTime() < startTimeObj.getTime() &&
      registration.endTime.getTime() > endTimeObj.getTime()
    ) {
      valid = false;
    } else if (
      registration.startTime.getTime() < startTimeObj.getTime() &&
      registration.endTime.getTime() > startTimeObj.getTime()
    ) {
      valid = false;
    } else if (
      registration.endTime.getTime() > endTimeObj.getTime() &&
      registration.startTime.getTime() < endTimeObj.getTime()
    ) {
      valid = false;
    } else if (
      startTimeObj.getTime() < registration.startTime.getTime() &&
      endTimeObj.getTime() > registration.startTime.getTime()
    ) {
      valid = false;
    }
  });

  if (!valid) {
    debug("time is not available");
    return res.status(StatusCodes.CONFLICT).json({
      msg: "ERROR: time interval is already taken",
    });
  } else {
    debug("time is available");
    next();
  }
};

export const isOfficeHourHost = async (req, res, next) => {
  debug("checking if user is host of office hour");
  const { officeHourId } = req.body;
  const id = req.id;
  debug("getting office hour...");
  const officeHour = await prisma.officeHour.findFirst({
    where: {
      id: officeHourId,
    },
    include: {
      hosts: {
        where: {
          id,
        },
      },
    },
  });
  debug("got office hour");
  if (officeHour.hosts.length === 0) {
    debug("user is not host of office hour");
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "ERROR: must be host to cancel office hours" });
  } else {
    debug("user is host of office hour");
    next();
  }
};

export const isOfficeHourHostParams = async (req, res, next) => {
  debug("checking if user is host of office hour");
  const officeHourId = parseInt(req.params.officeHourId, 10);
  const id = req.id;
  debug("getting office hour...");
  const officeHour = await prisma.officeHour.findFirst({
    where: {
      id: officeHourId,
    },
    include: {
      hosts: {
        where: {
          id,
        },
      },
    },
  });
  debug("got office hour");
  if (officeHour === null) {
    debug("office hour does not exist");
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "ERROR: must be host to cancel office hours" });
  } else {
    debug("user is host of office hour");
    next();
  }
};

export const isInFuture = async (req, res, next) => {
  debug("checking if office hour is in future");
  const { date } = req.params;
  const officeHourId = parseInt(req.params.officeHourId, 10);
  const dateObj = new Date(date);
  const current = new Date();
  if (dateObj < current) {
    return res
      .status(StatusCodes.CONFLICT)
      .json({ msg: "ERROR: office hour date is before current date" });
  }
  debug("getting office hour...");
  const officeHour = await prisma.officeHour.findUnique({
    where: {
      id: officeHourId,
    },
  });
  debug("got office hour");
  const officehourstart = officeHour.startDate;
  officehourstart.setMonth(dateObj.getMonth());
  officehourstart.setDate(dateObj.getDate());
  officehourstart.setFullYear(dateObj.getFullYear());
  if (current >= officehourstart) {
    debug("office hour has already started");
    return res
      .status(StatusCodes.CONFLICT)
      .json({ msg: "ERROR: office hour has already started" });
  } else {
    debug("office hour is in future");
    next();
  }
};

export const isUserNotRegistered = async (req, res, next) => {
  debug("checking if user is not registered");
  const { officeHourId } = req.body;
  const date = new Date(req.body.date);
  const id = req.id;
  debug("getting registration...");
  const registration = await prisma.registration.findFirst({
    where: {
      officeHourId,
      date,
      accountId: id,
    },
  });
  debug("got registration");
  if (
    registration !== null &&
    registration !== undefined &&
    !registration.isCancelled &&
    !registration.isCancelledStaff
  ) {
    debug("user is already registered");
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "User is already registered" });
  } else {
    debug("user is not registered");
    next();
  }
};

export const doesOfficeHourExist = async (req, res, next) => {
  debug("checking if office hour exists");
  const { officeHourId } = req.body;
  debug("getting office hour...");
  const officeHour = await prisma.officeHour.findFirst({
    where: {
      id: officeHourId,
      isDeleted: false,
    },
  });
  debug("got office hour");
  if (officeHour === null || officeHour === undefined) {
    debug("office hour does not exist");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: office hour does not exist" });
  } else {
    debug("office hour exists");
    next();
  }
};

export const doesOfficeHourExistParams = async (req, res, next) => {
  debug("checking if office hour exists");
  const officeHourId = parseInt(req.params.officeHourId, 10);
  debug("getting office hour...");
  const officeHour = await prisma.officeHour.findFirst({
    where: {
      id: officeHourId,
      isDeleted: false,
    },
  });
  debug("got office hour");
  if (officeHour === null || officeHour === undefined) {
    debug("office hour does not exist");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: office hour does not exist" });
  } else {
    debug("office hour exists");
    next();
  }
};

export const isDateInFuture = async (req, res, next) => {
  debug("checking if date is in future");
  const date = spacetime(req.targetDate);
  const curr = spacetime.now();
  curr.hour(0);
  curr.minute(0);
  curr.second(0);
  curr.millisecond(0);
  if (curr.isAfter(date)) {
    debug("date has already passed");
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "Date has already passed" });
  } else {
    debug("date is in future");
    next();
  }
};

export const isStudentRegistered = async (req, res, next) => {
  debug("checking if student is registered");
  const registrationId = parseInt(req.params.registrationId, 10);
  const id = parseInt(req.get("id"), 10);
  debug("getting registration...");
  const registration = await prisma.registration.findFirst({
    where: {
      id: registrationId,
    },
  });
  debug("got registration");
  if (registration.accountId !== id) {
    debug("student is not registered");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: You are not registered" });
  }
  debug("student is registered");
  next();
};

export const isStudentRegisteredBody = async (req, res, next) => {
  debug("checking if student is registered");
  const registrationId = parseInt(req.params.registrationId, 10);
  const id = req.id;
  debug("getting registration...");
  const registration = await prisma.registration.findFirst({
    where: {
      id: registrationId,
    },
  });
  debug("got registration");
  if (registration.accountId !== id) {
    debug("student is not registered");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: You are not registered" });
  }
  debug("student is registered");
  next();
};

export const isRegisteredOrIsStaffBody = async (req, res, next) => {
  debug("checking if student is registered or is staff");
  const registrationId = parseInt(req.params.registrationId, 10);
  const id = req.id;
  debug("getting registration...");
  const registration = await prisma.registration.findFirst({
    where: {
      id: registrationId,
    },
    include: {
      officeHour: true,
    },
  });
  debug("got registration");
  debug("getting course...");
  const course = await prisma.course.findUnique({
    where: {
      id: registration.officeHour.courseId,
    },
    include: {
      courseStaff: true,
      instructors: true,
    },
  });
  debug("got course");
  const courseStaff = course.courseStaff.map((account) => account.id);
  const instructors = course.instructors.map((account) => account.id);
  if (
    registration.accountId !== id &&
    !courseStaff.includes(id) &&
    !instructors.includes(id)
  ) {
    debug("student is not registered or is not staff");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: You are not allowed to cancel registration" });
  } else {
    debug("student is registered or is staff");
    next();
  }
};

export const doesRegistrationExistParams = async (req, res, next) => {
  debug("checking if registration exists");
  const registrationId = parseInt(req.params.registrationId, 10);
  debug("getting registration...");
  const registration = await prisma.registration.findFirst({
    where: {
      id: registrationId,
    },
  });
  debug("got registration");
  if (registration === null) {
    debug("registration does not exist");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: Registration does not exist" });
  }
  debug("registration exists");
  next();
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
  const { daysOfWeek, startDate } = req.body;
  const start = new Date(startDate);
  const startDOW = weekday[start.getUTCDay()];
  if (daysOfWeek.includes(startDOW)) {
    debug("start date is valid day of week");
    next();
  } else {
    debug("start date is not valid day of week");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: startDate must be one of the selected DOWs" });
  }
};

export const checkOptionalDateBody = async (req, res, next) => {
  debug("checking if date is valid");
  const { date } = req.body;
  debug("getting office hour...");
  const officeHour = await prisma.officeHour.findUnique({
    where: {
      id: req.body.officeHourId,
    },
    include: {
      isOnDayOfWeek: true,
    },
  });
  debug("got office hour");
  if (date === undefined || date === null) {
    if (officeHour.isRecurring) {
      const today = new Date();
      //TODO: increment office hour dates until it reaches a date past today
      const indexes = [];
      officeHour.isOnDayOfWeek.forEach((dow) => {
        indexes.push(weekday.indexOf(dow.dayOfWeek));
      });
      indexes.sort();
      let i = indexes.indexOf(officeHour.startDate.getDay());
      let start = new Date(
        new Date(officeHour.startDate).toLocaleString("en-US", {
          timezone: "America/New_York",
        })
      );
      const end = new Date(
        new Date(officeHour.endDate).toLocaleString("en-US", {
          timezone: "America/New_York",
        })
      );
      const now = new Date();
      while (start < end && now > start) {
        let diff =
          indexes[(i + 1) % indexes.length] - indexes[i % indexes.length];
        if (diff === 0) {
          diff = 7;
        } else if (diff < 0) {
          diff += 7;
        }
        start.setDate(start.getDate() + diff);
        i = (i + 1) % indexes.length;
      }
      if (now > start) {
        return res.status(StatusCodes.FORBIDDEN).json({
          msg: "ERROR: cannot cancel office hours that have already occured",
        });
      } else {
        start.setUTCHours(officeHour.endDate.getUTCHours());
        start.setUTCMinutes(officeHour.endDate.getUTCMinutes());
        start.setUTCDate(start.getUTCDate() - 1);
        req.body.date = start.toISOString();
        next();
      }
    } else {
      const newEnd = new Date();
      //newEnd.setUTCHours(newEnd.getUTCHours() - newEnd.getTimezoneOffset() / 60);
      newEnd.setUTCHours(officeHour.endDate.getUTCHours());
      newEnd.setUTCMinutes(officeHour.endDate.getUTCMinutes());
      newEnd.setUTCSeconds(0);
      req.body.date = newEnd.toISOString();
      next();
    }
  } else {
    const { officeHourId, date } = req.body;
    const dateObj = new Date(date);
    let officeHour = await prisma.officeHour.findFirst({
      where: {
        id: officeHourId,
      },
    });
    if (start.getUTCHours() < dateObj.getTimezoneOffset() / 60) {
      dateObj.setDate(dateObj.getDate() + 1);
    }
    dateObj.setUTCHours(
      new Date(officeHour.startDate).getUTCHours() -
        dateObj.getTimezoneOffset() / 60
    );
    const dow = weekday[dateObj.getUTCDay()];
    officeHour = await prisma.officeHour.findFirst({
      where: {
        id: officeHourId,
        isOnDayOfWeek: {
          some: {
            dayOfWeek: dow,
          },
        },
      },
    });
    let isCancelled = false;
    if (officeHour !== null) {
      officeHour.isCancelledOn.forEach((cancelledDate) => {
        if (cancelledDate.toDateString() === dateObj.toDateString()) {
          isCancelled = true;
        }
      });
    }
    if (officeHour === null || isCancelled) {
      debug("office hour is not available on day");
      return res
        .status(StatusCodes.CONFLICT)
        .json({ msg: "ERROR: office hours is not available on day" });
    } else {
      debug("office hour is available on day");
      const newEnd = new Date(date);
      newEnd.setUTCHours(0 - dateObj.getTimezoneOffset() / 60);
      newEnd.setUTCHours(officeHour.endDate.getUTCHours());
      newEnd.setUTCMinutes(officeHour.endDate.getUTCMinutes());
      newEnd.setUTCSeconds(0);
      req.body.date = newEnd.toISOString();
      next();
    }
  }
};

export const isRegistrationInFutureByIdParams = async (req, res, next) => {
  debug("checking if registration is in future");
  const registrationId = parseInt(req.params.registrationId, 10);
  debug("getting registration...");
  const registration = await prisma.registration.findUnique({
    where: {
      id: registrationId,
    },
    include: {
      officeHour: true,
    },
  });
  debug("got registration");
  const startTimeObj = new Date(registration.startTime);
  const dateObj = new Date(registration.date);
  dateObj.setUTCHours(startTimeObj.getUTCHours());
  dateObj.setUTCMinutes(startTimeObj.getUTCMinutes());
  if (dateObj > new Date()) {
    debug("registration is in future");
    next();
  } else {
    debug("registration is not in future");
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "ERROR: office hours has already passed" });
  }
};

export const isRegistrationInFuture = async (req, res, next) => {
  debug("checking if registration is in future");
  const { startTime, date, officeHourId } = req.body;
  debug("getting office hour...");
  const officeHour = await prisma.officeHour.findUnique({
    where: {
      id: officeHourId,
    },
  });
  debug("got office hour");
  const startTimeObj = stringToTimeObj(startTime);
  const dateObj = new Date(date);
  dateObj.setUTCHours(startTimeObj.getUTCHours());
  dateObj.setUTCMinutes(startTimeObj.getUTCMinutes());
  if (dateObj > new Date()) {
    debug("registration is in future");
    next();
  } else {
    debug("registration is not in future");
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "ERROR: office hours has already passed" });
  }
};

export const officeHoursHasNotBegun = async (req, res, next) => {
  debug("checking if office hours has not begun");
  const { date, officeHourId } = req.body;
  debug("getting office hour...");
  const officeHour = await prisma.officeHour.findUnique({
    where: {
      id: officeHourId,
    },
  });
  debug("got office hour");
  if (!officeHour.isRecurring) {
    if (new Date() < officeHour.startDate) {
      debug("office hours has not begun");
      next();
    } else {
      debug("office hours has begun");
      return res.status(StatusCodes.FORBIDDEN).json({
        msg: "ERROR: office hours cannot be cancelled after their start date",
      });
    }
  } else {
    const dateObj = handleUTCDateChange(new Date(date), officeHour);
    if (dateObj <= new Date()) {
      debug("office hours has begun");
      return res.status(StatusCodes.FORBIDDEN).json({
        msg: "ERROR: office hours cannot be cancelled after their start date",
      });
    } else {
      debug("office hours has not begun");
      next();
    }
  }
};

export const officeHoursHasNotBegunCancelAll = async (req, res, next) => {
  debug("checking if office hours has not begun");
  const { date, officeHourId } = req.body;
  debug("getting office hour...");
  const officeHour = await prisma.officeHour.findUnique({
    where: {
      id: officeHourId,
    },
  });
  debug("got office hour");
  if (!officeHour.isRecurring) {
    if (new Date() < officeHour.startDate) {
      debug("office hours has not begun");
      next();
    } else {
      debug("office hours has begun");
      return res.status(StatusCodes.FORBIDDEN).json({
        msg: "ERROR: office hours cannot be cancelled after their start date",
      });
    }
  } else {
    next();
  }
};

export const durationIsMultipleof5 = async (req, res, next) => {
  debug("checking if duration is multiple of 5");
  const { startDate, endDate } = req.body;
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setFullYear(start.getFullYear());
  end.setMonth(start.getMonth());
  end.setDate(start.getDate());
  const duration = Math.floor((end - start) / 60000);
  if (duration % 5 !== 0) {
    debug("duration is not multiple of 5");
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: office hour duration is not a multiple of 5" });
  } else {
    debug("duration is multiple of 5");
    next();
  }
};

export const getDatesForOfficeHour = async (req, res, next) => {
  debug("getting dates for office hour");
  let { date, officeHourId, startTime } = req.body;
  if (officeHourId === undefined) {
    officeHourId = parseInt(req.params.officeHourId);
  }
  if (date === undefined) {
    date = req.params.date;
  }
  debug("getting office hour...");
  const officeHour = await prisma.officeHour.findUnique({
    where: {
      id: officeHourId,
    },
    include: {
      course: true,
      hosts: true,
      isOnDayOfWeek: true,
    },
  });
  const dateObj = spacetime(date);
  debug("got office hour");
  if (officeHour.isRecurring) {
    const indexes = [];
    officeHour.isOnDayOfWeek.forEach((dow) => {
      indexes.push(weekday.indexOf(dow.dayOfWeek));
    });
    indexes.sort();
    const entries = [];
    let i = indexes.indexOf(officeHour.startDate.getDay());
    let start = spacetime(officeHour.startDate).goto("America/New_York");
    const end = spacetime(officeHour.endDate).goto("America/New_York");
    let targetDate;
    while (start < end) {
      let notCancelled = true;
      for (const date of officeHour.isCancelledOn) {
        if (equalDates(date, start.toNativeDate())) {
          notCancelled = false;
          break;
        }
      }
      if (notCancelled) {
        const currEnd = start.clone();
        currEnd.hour(end.hour());
        currEnd.minute(end.minute());
        currEnd.second(end.second());
        if (end.timezone().current.offset !== start.timezone().current.offset) {
          currEnd.hour(
            currEnd.hour() +
              (-end.timezone().current.offset +
                start.timezone().current.offset) /
                60 //handles daylight savings
          );
        }
        if (currEnd < start) {
          currEnd.date(currEnd.date() + 1);
        }
        if (equalDates(start.toNativeDate(), dateObj.toNativeDate())) {
          targetDate = start.clone();
          break;
        }
      }
      let diff =
        indexes[(i + 1) % indexes.length] - indexes[i % indexes.length];
      if (diff === 0) {
        diff = 7;
      } else if (diff < 0) {
        diff += 7;
      }
      start.date(start.date() + diff);
      i = (i + 1) % indexes.length;
    }
    if (targetDate !== null && targetDate !== undefined) {
      debug("got target date");
      req.targetDate = targetDate.toNativeDate();
      next();
    } else {
      debug("office hour is not available on this date");
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "EROR: not availablem date!" });
    }
  } else {
    if (equalDates(new Date(officeHour.startDate), dateObj.toNativeDate())) {
      debug("got target date");
      req.targetDate = spacetime(officeHour.startDate).toNativeDate();
      next();
    } else {
      debug("office hour is not available on this date");
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "EROR: not availablem date!" });
    }
  }
};
