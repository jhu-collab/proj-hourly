import prisma from "../../prisma/client.js";
import { StatusCodes } from "http-status-codes";
import { STATUS_CODES } from "http";
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
  next();
};

export const isOfficeHourOnDay = async (req, res, next) => {
  const { officeHourId, date } = req.body;
  const dateObj = new Date(date);
  dateObj.setUTCHours(0);
  const dow = weekday[dateObj.getUTCDay()];
  const officeHour = await prisma.officeHour.findFirst({
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
  }
  next();
};

export const isOfficeHourOnDayParam = async (req, res, next) => {
  const officeHourId = parseInt(req.params.officeHourId, 10);
  const date = req.params.date;
  const dateObj = new Date(date);
  dateObj.setUTCHours(0);
  const dow = weekday[dateObj.getUTCDay()];
  const officeHour = await prisma.officeHour.findFirst({
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
  }
  next();
};

export const isWithinTimeOffering = async (req, res, next) => {
  const { startTime, endTime, officeHourId } = req.body;
  const startTimeObj = stringToTimeObj(startTime);
  const endTimeObj = stringToTimeObj(endTime);
  const officeHour = await prisma.officeHour.findFirst({
    where: {
      AND: {
        id: officeHourId,
        startTime: {
          lte: startTimeObj,
        },
        endTime: {
          gte: endTimeObj,
        },
      },
    },
  });
  if (officeHour === null) {
    return res
      .status(StatusCodes.CONFLICT)
      .json({ msg: "ERROR: time is not within range of office hour" });
  }
  next();
};

export const isTimeCorrectInterval = async (req, res, next) => {
  const { startTime, endTime, officeHourId } = req.body;
  const startTimeObj = stringToTimeObj(startTime);
  const endTimeObj = stringToTimeObj(endTime);
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
  const registrations = await prisma.registration.findMany({
    where: {
      officeHourId,
      //startTime: startTimeObj,
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
  }
  next();
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
  }
  next();
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
  const officehourstart = officeHour.startTime;
  officehourstart.setMonth(dateObj.getMonth());
  officehourstart.setDate(dateObj.getDate());
  officehourstart.setFullYear(dateObj.getFullYear());
  if (current >= officehourstart) {
    return res
      .status(StatusCodes.CONFLICT)
      .json({ msg: "ERROR: office hour has already started" });
  }
  next();
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
  }
  next();
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
  }
  next();
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
  }
  next();
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
