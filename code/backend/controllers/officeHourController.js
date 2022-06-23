const { PrismaClient } = require('@prisma/client');
const { StatusCodes } = require('http-status-codes');
const validate = require('../utils/checkValidation');

const prisma = new PrismaClient();

exports.create = async (req, res) => {
  validate(req);
  const {
    startTime,
    endTime,
    recurringEvent,
    startDate,
    endDate,
    location,
    courseId,
    timeInterval,
    hosts,
    daysOfWeek,
  } = req.body;
  const startTimes = startTime.split(':');
  const endTimes = endTime.split(':');
  const startTimeObject = new Date();
  startTimeObject.setHours(startTimes[0]);
  startTimeObject.setMinutes(startTimes[1]);
  startTimeObject.setSeconds(startTimes[2]);
  const endTimeObject = new Date();
  endTimeObject.setHours(endTimes[0]);
  endTimeObject.setMinutes(endTimes[1]);
  endTimeObject.setSeconds(endTimes[2]);
  const officeHour = await prisma.officeHour.create({
    data: {
      startTime: startTimeObject,
      endTime: endTimeObject,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      timePerStudent: timeInterval,
      course: {
        connect: {
          id: courseId,
        },
      },
      location,
      isRecurring: recurringEvent,
      hosts: {
        connect: {
          id: {
            all: {
              hosts,
            },
          },
        },
      },
      isOnDayOfWeek: {
        connect: {
          daysOfWeek,
        },
      },
    },
  });
  return res.status(StatusCodes.CREATED).json({ officeHour });
};
