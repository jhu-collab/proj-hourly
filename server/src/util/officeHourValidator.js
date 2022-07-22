import prisma from "../../prisma/client.js";
import { StatusCodes } from "http-status-codes";

const weekday = [
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
  const timeInterval = officeHour.timePerStudent * 1000 * 60;
  const diff = endTimeObj - startTimeObj;
  if (diff !== timeInterval) {
    return res
      .status(StatusCodes.CONFLICT)
      .json({ msg: "ERROR: time interval is not the correct length" });
  }
  const diffFromStart = startTimeObj - officeHour.startTime;
  if (diffFromStart % timeInterval !== 0) {
    return res.status(StatusCodes.CONFLICT).json({
      msg: "ERROR: time interval is not at one of the specified start times",
    });
  }
  next();
};

export const isTimeAvailable = async (req, res, next) => {
  const { startTime, officeHourId, date } = req.body;
  const registrationDate = new Date(date);
  const startTimeObj = stringToTimeObj(startTime);
  const registration = await prisma.registration.findFirst({
    where: {
      officeHourId,
      startTime: startTimeObj,
      date: registrationDate,
    },
  });
  if (registration !== null) {
    return res.status(StatusCodes.CONFLICT).json({
      msg: "ERROR: time interval is already taken",
    });
  }
  next();
};

export const isOfficeHourHost = async (req, res, next) => {
  const { officeHourId } = req.body;
  const id = parseInt(req.get("id"), 10);
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
