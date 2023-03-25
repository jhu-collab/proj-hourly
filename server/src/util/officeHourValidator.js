import prisma from "../../prisma/client.js";
import { StatusCodes } from "http-status-codes";
import { decodeToken } from "./token.js";
import { body } from "express-validator";

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
        return res
          .status(StatusCodes.CONFLICT)
          .json({ msg: "ERROR: office hour conflicts with one of the hosts " });
      }
    });
  });
  if (!res.headersSent) {
    next();
  }
};

export const isOfficeHourOnDay = async (req, res, next) => {
  const { officeHourId, date } = req.body;
  const dateObj = new Date(date);
  let officeHour = await prisma.officeHour.findFirst({
    where: {
      id: officeHourId,
    },
  });
  const start = new Date(officeHour.startDate);
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
    return res
      .status(StatusCodes.CONFLICT)
      .json({ msg: "ERROR: office hours is not available on day" });
  } else {
    next();
  }
};

export const isOfficeHourOnDayParam = async (req, res, next) => {
  const officeHourId = parseInt(req.params.officeHourId, 10);
  const date = req.params.date;
  const dateObj = new Date(date);
  let officeHour = await prisma.officeHour.findFirst({
    where: {
      id: officeHourId,
    },
  });
  dateObj.setUTCHours(0);
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
    return res
      .status(StatusCodes.CONFLICT)
      .json({ msg: "ERROR: office hours is not available on day" });
  } else {
    next();
  }
};

export const isWithinTimeOffering = async (req, res, next) => {
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
    return res
      .status(StatusCodes.CONFLICT)
      .json({ msg: "ERROR: time is not within range of office hour" });
  } else {
    next();
  }
};

export const isTimeCorrectInterval = async (req, res, next) => {
  const { startTime, endTime, officeHourId } = req.body;
  const startTimeObj = stringToTimeObj(startTime);
  const endTimeObj = stringToTimeObj(endTime);
  if (startTimeObj > endTimeObj) {
    endTimeObj.setUTCDate(endTimeObj.getUTCDate() + 1);
  }
  const officeHour = await prisma.officeHour.findFirst({
    where: {
      id: officeHourId,
    },
  });
  const timeOptions = await prisma.OfficeHourTimeOptions.findMany({
    where: {
      courseId: officeHour.courseId,
    },
  });
  let valid = false;
  timeOptions.forEach((timeOption) => {
    const timeInterval = timeOption.duration * 1000 * 60;
    const diff = endTimeObj - startTimeObj;
    if (diff === timeInterval) {
      valid = true;
    }
  });

  if (!valid) {
    return res
      .status(StatusCodes.CONFLICT)
      .json({ msg: "ERROR: time interval is not the correct length" });
  } else {
    next();
  }
};

export const isTimeAvailable = async (req, res, next) => {
  const { startTime, officeHourId, date, endTime } = req.body;
  const registrationDate = new Date(date);
  const startTimeObj = stringToTimeObj(startTime);
  const endTimeObj = stringToTimeObj(endTime);
  if (startTimeObj > endTimeObj) {
    endTimeObj.setUTCDate(endTimeObj.getUTCDate() + 1);
  }
  const registrations = await prisma.registration.findMany({
    where: {
      officeHourId,
      date: registrationDate,
      isCancelled: false,
      isCancelledStaff: false,
    },
  });
  let valid = true;
  registrations.forEach((registration) => {
    if (registration.startTimeObj == startTimeObj) {
      valid = false;
    } else if (registration.endTimeObj == endTimeObj) {
      valid = false;
    } else if (
      registration.startTime < startTimeObj &&
      registration.endTime > endTimeObj
    ) {
      valid = false;
    } else if (
      registration.startTime < startTimeObj &&
      registration.endTime > startTimeObj
    ) {
      valid = false;
    } else if (
      registration.endTime > endTimeObj &&
      registration.startTime < endTimeObj
    ) {
      valid = false;
    } else if (
      startTimeObj < registration.startTime &&
      endTimeObj > registration.startTimeObj
    ) {
      valid = false;
    }
  });

  if (!valid) {
    return res.status(StatusCodes.CONFLICT).json({
      msg: "ERROR: time interval is already taken",
    });
  } else {
    next();
  }
};

export const isOfficeHourHost = async (req, res, next) => {
  const { officeHourId } = req.body;
  const id = req.id;
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
  if (officeHour.hosts.length === 0) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "ERROR: must be host to cancel office hours" });
  } else {
    next();
  }
};

export const isOfficeHourHostParams = async (req, res, next) => {
  const officeHourId = parseInt(req.params.officeHourId, 10);
  const id = req.id;
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
  if (officeHour === null) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "ERROR: must be host to cancel office hours" });
  } else {
    next();
  }
};

export const isInFuture = async (req, res, next) => {
  const { date } = req.params;
  const officeHourId = parseInt(req.params.officeHourId, 10);
  const dateObj = new Date(date);
  const current = new Date();
  if (dateObj < current) {
    return res
      .status(StatusCodes.CONFLICT)
      .json({ msg: "ERROR: office hour date is before current date" });
  }
  const officeHour = await prisma.officeHour.findUnique({
    where: {
      id: officeHourId,
    },
  });
  const officehourstart = officeHour.startDate;
  officehourstart.setMonth(dateObj.getMonth());
  officehourstart.setDate(dateObj.getDate());
  officehourstart.setFullYear(dateObj.getFullYear());
  if (current >= officehourstart) {
    return res
      .status(StatusCodes.CONFLICT)
      .json({ msg: "ERROR: office hour has already started" });
  } else {
    next();
  }
};

export const isUserNotRegistered = async (req, res, next) => {
  const { officeHourId } = req.body;
  const date = new Date(req.body.date);
  const id = req.id;
  const registration = await prisma.registration.findFirst({
    where: {
      officeHourId,
      date,
      accountId: id,
    },
  });
  if (
    registration !== null &&
    registration !== undefined &&
    !registration.isCancelled &&
    !registration.isCancelledStaff
  ) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "User is already registered" });
  } else {
    next();
  }
};

export const doesOfficeHourExist = async (req, res, next) => {
  const { officeHourId } = req.body;
  const officeHour = await prisma.officeHour.findFirst({
    where: {
      id: officeHourId,
      isDeleted: false,
    },
  });
  if (officeHour === null || officeHour === undefined) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: office hour does not exist" });
  } else {
    next();
  }
};

export const doesOfficeHourExistParams = async (req, res, next) => {
  const officeHourId = parseInt(req.params.officeHourId, 10);
  const officeHour = await prisma.officeHour.findFirst({
    where: {
      id: officeHourId,
      isDeleted: false,
    },
  });
  if (officeHour === null || officeHour === undefined) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: office hour does not exist" });
  } else {
    next();
  }
};

export const isDateInFuture = async (req, res, next) => {
  const date = new Date(req.body.date);
  const curr = new Date();
  curr.setUTCHours(0);
  curr.setUTCMinutes(0);
  curr.setUTCSeconds(0);
  curr.setUTCMilliseconds(0);
  if (curr > date) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "Date has already passed" });
  } else {
    next();
  }
};

export const isStudentRegistered = async (req, res, next) => {
  const registrationId = parseInt(req.params.registrationId, 10);
  const id = parseInt(req.get("id"), 10);
  const registration = await prisma.registration.findFirst({
    where: {
      id: registrationId,
    },
  });
  if (registration.accountId !== id) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: You are not registered" });
  }
  next();
};

export const isStudentRegisteredBody = async (req, res, next) => {
  const registrationId = parseInt(req.params.registrationId, 10);
  const id = req.id;
  const registration = await prisma.registration.findFirst({
    where: {
      id: registrationId,
    },
  });
  if (registration.accountId !== id) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: You are not registered" });
  }
  next();
};

export const isRegisteredOrIsStaffBody = async (req, res, next) => {
  const registrationId = parseInt(req.params.registrationId, 10);
  const id = req.id;
  const registration = await prisma.registration.findFirst({
    where: {
      id: registrationId,
    },
    include: {
      officeHour: true,
    },
  });
  const course = await prisma.course.findUnique({
    where: {
      id: registration.officeHour.courseId,
    },
    include: {
      courseStaff: true,
      instructors: true,
    },
  });
  const courseStaff = course.courseStaff.map((account) => account.id);
  const instructors = course.instructors.map((account) => account.id);
  if (
    registration.accountId !== id &&
    !courseStaff.includes(id) &&
    !instructors.includes(id)
  ) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: You are not allowed to cancel registration" });
  } else {
    next();
  }
};

export const doesRegistrationExistParams = async (req, res, next) => {
  const registrationId = parseInt(req.params.registrationId, 10);
  const registration = await prisma.registration.findFirst({
    where: {
      id: registrationId,
    },
  });
  if (registration === null) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: Registration does not exist" });
  }
  next();
};

export const areValidDOW = (req, res, next) => {
  const { daysOfWeek } = req.body;
  if (daysOfWeek === undefined || daysOfWeek.length === 0) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: days of the week not included" });
  }
  daysOfWeek.forEach((dow) => {
    if (!weekday.includes(dow)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "ERROR: invalid days of week" });
    }
  });
  next();
};

export const startDateIsValidDOW = (req, res, next) => {
  const { daysOfWeek, startDate } = req.body;
  const start = new Date(startDate);
  const startDOW = weekday[start.getUTCDay()];
  if (daysOfWeek.includes(startDOW)) {
    next();
  } else {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: startDate must be one of the selected DOWs" });
  }
};

export const checkOptionalDateBody = async (req, res, next) => {
  const { date } = req.body;
  const officeHour = await prisma.officeHour.findUnique({
    where: {
      id: req.body.officeHourId,
    },
    include: {
      isOnDayOfWeek: true,
    },
  });
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
      return res
        .status(StatusCodes.CONFLICT)
        .json({ msg: "ERROR: office hours is not available on day" });
    } else {
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
  const registrationId = parseInt(req.params.registrationId, 10);
  const registration = await prisma.registration.findUnique({
    where: {
      id: registrationId,
    },
    include: {
      officeHour: true,
    },
  });
  const startTimeObj = new Date(registration.startTime);
  const dateObj = new Date(registration.date);
  dateObj.setUTCHours(startTimeObj.getUTCHours());
  dateObj.setUTCMinutes(startTimeObj.getUTCMinutes());
  if (
    registration.officeHour.startDate.getUTCHours() >=
    registration.officeHour.endDate.getUTCHours()
  ) {
    dateObj.setUTCDate(dateObj.getUTCDate() + 1);
  }
  if (dateObj > new Date()) {
    next();
  } else {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "ERROR: office hours has already passed" });
  }
};

export const isRegistrationInFuture = async (req, res, next) => {
  const { startTime, date, officeHourId } = req.body;
  const officeHour = await prisma.officeHour.findUnique({
    where: {
      id: officeHourId,
    },
  });
  const startTimeObj = stringToTimeObj(startTime);
  const dateObj = new Date(date);
  dateObj.setUTCHours(startTimeObj.getUTCHours());
  dateObj.setUTCMinutes(startTimeObj.getUTCMinutes());
  if (officeHour.startDate.getUTCHours() >= officeHour.endDate.getUTCHours()) {
    dateObj.setUTCDate(dateObj.getUTCDate() + 1);
  }
  if (dateObj > new Date()) {
    next();
  } else {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "ERROR: office hours has already passed" });
  }
};

export const officeHoursHasNotBegun = async (req, res, next) => {
  const { date, officeHourId } = req.body;
  const officeHour = await prisma.officeHour.findUnique({
    where: {
      id: officeHourId,
    },
  });
  if (!officeHour.isRecurring) {
    if (new Date() < officeHour.startDate) {
      next();
    } else {
      return res.status(StatusCodes.FORBIDDEN).json({
        msg: "ERROR: office hours cannot be cancelled after their start date",
      });
    }
  } else {
    const dateObj = new Date(date);
    dateObj.setUTCHours(officeHour.startDate.getUTCHours());
    dateObj.setUTCMinutes(officeHour.startDate.getUTCMinutes());
    if (dateObj <= new Date()) {
      return res.status(StatusCodes.FORBIDDEN).json({
        msg: "ERROR: office hours cannot be cancelled after their start date",
      });
    } else {
      next();
    }
  }
};

export const officeHoursHasNotBegunCancelAll = async (req, res, next) => {
  const { date, officeHourId } = req.body;
  const officeHour = await prisma.officeHour.findUnique({
    where: {
      id: officeHourId,
    },
  });
  if (!officeHour.isRecurring) {
    if (new Date() < officeHour.startDate) {
      next();
    } else {
      return res.status(StatusCodes.FORBIDDEN).json({
        msg: "ERROR: office hours cannot be cancelled after their start date",
      });
    }
  } else {
    next();
  }
};

export const durationIsMultipleof5 = async (req, res, next) => {
  const { startDate, endDate } = req.body;
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setFullYear(start.getFullYear());
  end.setMonth(start.getMonth());
  end.setDate(start.getDate());
  const duration = Math.floor((end - start) / 60000);
  if (duration % 5 !== 0) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: office hour duration is not a multiple of 5" });
  } else {
    next();
  }
};
