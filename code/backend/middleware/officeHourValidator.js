const { PrismaClient } = require('@prisma/client');
const { StatusCodes } = require('http-status-codes');

const weekday = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const prisma = new PrismaClient();

function stringToTimeObj(timeStr) {
  const timeArray = timeStr.split(':');
  const time = new Date();
  time.setHours(timeArray[0]);
  time.setMinutes(timeArray[1]);
  time.setSeconds(timeArray[2]);
  return time;
}

module.exports.noConflictsWithHosts = async (req, res, next) => {
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
          .json({ msg: 'ERROR: office hour conflicts with one of the hosts ' });
      }
    });
  });
  next();
};

module.exports.isOfficeHourOnDay = async (req, res, next) => {
  const { officeHourId, date } = req.body;
  const dateObj = new Date(date);
  const dow = weekday[dateObj.getDay()];
  const officeHour = await prisma.officeHour.findFirst({
    where: {
      id: officeHourId,
      NOT: {
        isCancelledOn: {
          dateObj,
        },
      },
    },
    include: {
      isOnDayOfWeek: {
        dow,
      },
      isCancelledOn: {},
    },
  });
  if (officeHour === null) {
    return res
      .status(StatusCodes.CONFLICT)
      .json({ msg: 'ERROR: office hours is not available on day' });
  }
  next();
};

module.exports.isWithinTimeOffering = async (req, res, next) => {
  const { startTime, endTime, officeHourId } = req.body;
  const startTimeObj = stringToTimeObj(startTime);
  const endTimeObj = stringToTimeObj(endTime);
  const officeHour = prisma.findFirst({
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
      .json({ msg: 'ERROR: time is not within range of office hour' });
  }
  next();
};

module.exports.isTimeCorrectInterval = async (req, res, next) => {
  const { startTime, endTime, officeHourId } = req.body;
  const startTimeObj = stringToTimeObj(startTime);
  const endTimeObj = stringToTimeObj(endTime);
  const officeHour = prisma.findFirst({
    where: {
      id: officeHourId,
    },
  });
  const timeInterval = officeHour.timeInterval * 1000 * 60;
  const diff = endTimeObj - startTimeObj;
  if (diff !== timeInterval) {
    return res
      .status(StatusCodes.CONFLICT)
      .json({ msg: 'ERROR: time interval is not the correct length' });
  }
  next();
};

// module.exports.isTimeAvailable = async (req, res, next) => {};
