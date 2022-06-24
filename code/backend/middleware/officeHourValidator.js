const { PrismaClient } = require('@prisma/client');
const { StatusCodes } = require('http-status-codes');

const prisma = new PrismaClient();

module.exports = async (req, res, next) => {
  const { hosts, startTime, endTime, startDate, endDate, daysOfWeek } =
    req.body;
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);
  const startTimeObj = new Date();
  const starts = startTime.split(':');
  startTimeObj.setHours(starts[0]);
  startTimeObj.setMinutes(starts[1]);
  startTimeObj.setSeconds(starts[2]);
  const ends = endTime.split(':');
  const endTimeObj = new Date();
  endTimeObj.setHours(ends[0]);
  endTimeObj.setMinutes(ends[1]);
  endTimeObj.setSeconds(ends[2]);
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
