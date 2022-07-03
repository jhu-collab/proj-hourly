const { PrismaClient } = require('@prisma/client');
const { StatusCodes } = require('http-status-codes');
const { stringToTimeObj } = require('../middleware/officeHourValidator');
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
  const startTimeObject = stringToTimeObj(startTime);
  const endTimeObject = stringToTimeObj(endTime);
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
    },
  });
  hosts.forEach(async (id) => {
    await prisma.officeHour.update({
      where: {
        id: officeHour.id,
      },
      data: {
        hosts: {
          connect: {
            id,
          },
        },
      },
    });
  });
  daysOfWeek.forEach(async (dayOfWeek) => {
    await prisma.officeHour.update({
      where: {
        id: officeHour.id,
      },
      data: {
        isOnDayOfWeek: {
          connect: {
            dayOfWeek,
          },
        },
      },
    });
  });
  const officeHourWithData = await prisma.officeHour.findUnique({
    where: {
      id: officeHour.id,
    },
    include: {
      hosts: {},
      isOnDayOfWeek: {},
    },
  });
  return res.status(StatusCodes.CREATED).json({ officeHourWithData });
};

exports.getForCourse = async (req, res) => {
  validate(req);
  const courseId = parseInt(req.params.courseId, 10);
  const officeHours = await prisma.officeHour.findMany({
    where: {
      courseId,
    },
    include: {
      hosts: {},
      isOnDayOfWeek: {},
    },
  });
  res.status(StatusCodes.ACCEPTED).json({ officeHours });
};

exports.register = async (req, res) => {
  validate(req);
  const { officeHourId, startTime, endTime, date, question, TopicIds } =
    req.body;
  const id = parseInt(req.get('id'), 10);
  const dateObj = new Date(date);
  const registration = await prisma.registration.create({
    data: {
      startTime: stringToTimeObj(startTime),
      endTime: stringToTimeObj(endTime),
      date: dateObj,
      isCancelled: false,
      officeHourId,
      accountId: id,
      question,
    },
  });
  if (TopicIds !== null && TopicIds !== undefined) {
    TopicIds.forEach(async (topicId) => {
      await prisma.registration.update({
        where: {
          id: registration.id,
        },
        data: {
          topics: {
            connect: {
              id: topicId,
            },
          },
        },
      });
    });
  }
  return res.status(StatusCodes.ACCEPTED).json({ registration });
};

exports.cancelOnDate = async (req, res) => {
  const { officeHourId, date } = req.body;
  const dateObj = new Date(date);
  dateObj.setUTCHours(0);
  const officehour = await prisma.officeHour.findUnique({
    where: {
      id: officeHourId,
    },
  });
  const officeHourUpdate = await prisma.officeHour.update({
    where: {
      id: officeHourId,
    },
    data: {
      isCancelledOn: [...officehour.isCancelledOn, dateObj],
    },
  });
  return res.status(StatusCodes.ACCEPTED).json(officeHourUpdate);
};
