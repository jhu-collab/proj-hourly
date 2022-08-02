import prisma from "../../prisma/client.js";
import { StatusCodes } from "http-status-codes";
import { stringToTimeObj } from "../util/officeHourValidator.js";
import validate from "../util/checkValidation.js";
import { generateCalendar } from "../util/icalHelpers.js";
import { createTimeString } from "../util/helpers.js";

export const create = async (req, res) => {
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
      hosts: {
        select: {
          id: true,
        },
      },
      isOnDayOfWeek: {
        select: {
          dayOfWeek: true,
        },
      },
    },
  });
  const calendar = await generateCalendar(courseId);
  return res
    .status(StatusCodes.CREATED)
    .json({ officeHour: officeHourWithData });
};

export const getForCourse = async (req, res) => {
  validate(req);
  const courseId = parseInt(req.params.courseId, 10);
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
  });
  res.status(StatusCodes.ACCEPTED).json({ calendar: course.iCalJson });
};

export const register = async (req, res) => {
  validate(req);
  const { officeHourId, startTime, endTime, date, question, TopicIds } =
    req.body;
  const id = parseInt(req.get("id"), 10);
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

export const cancelOnDate = async (req, res) => {
  const { officeHourId, date } = req.body;
  const dateObj = new Date(date);
  dateObj.setUTCHours(0);
  const officehour = await prisma.officeHour.findUnique({
    where: {
      id: officeHourId,
    },
    include: {
      course: true,
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
  const calendar = await generateCalendar(officehour.course.id);
  return res.status(StatusCodes.ACCEPTED).json({ officeHourUpdate });
};

export const cancelAll = async (req, res) => {
  const { officeHourId } = req.body;
  const date = new Date();
  const dateObj = new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  );
  const officeHour = await prisma.officeHour.findUnique({
    where: {
      id: officeHourId,
    },
    include: {
      course: true,
    },
  });
  let officeHourUpdate;
  if (officeHour.startDate >= date) {
    officeHourUpdate = await prisma.officeHour.delete({
      where: {
        id: officeHourId,
      },
    });
  } else if (officeHour.endDate > date) {
    officeHourUpdate = await prisma.officeHour.update({
      where: {
        id: officeHourId,
      },
      data: {
        endDate: dateObj,
      },
    });
  } else {
    return res
      .status(StatusCodes.CONFLICT)
      .json({ msg: "ERROR: office hours already over" });
  }
  const calendar = await generateCalendar(officeHour.course.id);
  return res.status(StatusCodes.ACCEPTED).json({ officeHourUpdate });
};

export const getTimeSlotsRemaining = async (req, res) => {
  const date = new Date(req.params.date);
  const officeHourId = parseInt(req.params.officeHourId, 10);
  const timeSlots = [];
  const officeHour = await prisma.officeHour.findUnique({
    where: {
      id: officeHourId,
    },
  });
  let start = officeHour.startTime;
  const end = officeHour.endTime;

  while (start < end) {
    const registration = await prisma.registration.findFirst({
      where: {
        officeHourId,
        date,
        startTime: start,
      },
    });
    if (registration === null || registration === undefined) {
      const startStr = createTimeString(start);
      start.setMinutes(start.getMinutes() + officeHour.timePerStudent);
      const endStr = createTimeString(start);
      timeSlots.push({ start: startStr, end: endStr });
    } else {
      start.setMinutes(start.getMinutes() + officeHour.timePerStudent);
    }
  }
  return res.status(StatusCodes.ACCEPTED).json({ timeSlots });
};

export const rescheduleSingleOfficeHour = async (req, res) => {
  const { date } = req.params;
  const officeHourId = parseInt(req.params.officeHourId, 10);
  const { startTime, endTime, timePerStudent, location } = req.body;
  const dateObj = new Date(date);
  dateObj.setUTCHours(0);
  const officehour = await prisma.officeHour.findUnique({
    where: {
      id: officeHourId,
    },
    include: {
      course: true,
      hosts: true,
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
  await prisma.registration.updateMany({
    where: {
      officeHourId,
      date: dateObj,
    },
    data: {
      isCancelled: true,
    },
  });
  const timeInterval =
    timePerStudent === null || timePerStudent === undefined
      ? officehour.timePerStudent
      : timePerStudent;
  const newLocation =
    location === null || location === undefined
      ? officehour.location
      : location;
  const startTimeObject = stringToTimeObj(startTime);
  const endTimeObject = stringToTimeObj(endTime);
  const newOfficeHour = await prisma.officeHour.create({
    data: {
      startTime: startTimeObject,
      endTime: endTimeObject,
      startDate: new Date(date),
      endDate: new Date(date),
      timePerStudent: timeInterval,
      course: {
        connect: {
          id: officehour.course.id,
        },
      },
      location: newLocation,
      isRecurring: false,
    },
  });
  let hostArr = [];
  officehour.hosts.forEach(async (account) => {
    hostArr.push({ id: account.id });
  });
  await prisma.officeHour.update({
    where: {
      id: officehour.id,
    },
    data: {
      hosts: {
        connect: {
          hostArr,
        },
      },
    },
  });
  const calendar = await generateCalendar(officehour.course.id);
  return res.status(StatusCodes.ACCEPTED).json({ newOfficeHour });
};

export const editAll = async (req, res) => {
  const officeHourId = parseInt(req.params.officeHourId, 10);
  const { startDate, endDate, startTime, endTime, location, daysOfWeek } =
    req.body;
  const startTimeObject = stringToTimeObj(startTime);
  const endTimeObject = stringToTimeObj(endTime);
  const update = await prisma.officeHour.update({
    where: {
      id: officeHourId,
    },
    data: {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      startTime: startTimeObject,
      endTime: endTimeObject,
      location: location,
      isOnDayOfWeek: {
        set: [],
      },
    },
  });
  let dowArr = [];
  daysOfWeek.forEach(async (dayOfWeek) => {
    dowArr.push({ dayOfWeek: dayOfWeek });
  });
  await prisma.officeHour.update({
    where: {
      id: officeHourId,
    },
    data: {
      isOnDayOfWeek: {
        connect: dowArr,
      },
    },
  });
  const startTimeObj = new Date();
  startTimeObj.setFullYear(1970);
  startTimeObj.setUTCDate(1);
  startTimeObj.setUTCMonth(0);
  startTimeObj.setUTCFullYear(1970);
  const today = new Date();
  today.setUTCHours(0);
  today.setUTCMinutes(0);
  today.setUTCSeconds(0);
  today.setUTCMilliseconds(0);
  await prisma.registration.updateMany({
    where: {
      officeHourId,
      OR: [
        {
          date: {
            gt: today,
          },
        },
        {
          date: {
            today,
          },
          startTime: {
            gte: startTimeObj,
          },
        },
      ],
    },
    data: {
      isCancelled: true,
    },
  });
  const officeHourWithData = await prisma.officeHour.findUnique({
    where: {
      id: officeHourId,
    },
    include: {
      hosts: {
        select: {
          id: true,
        },
      },
      isOnDayOfWeek: {
        select: {
          dayOfWeek: true,
        },
      },
      course: true,
    },
  });
  const calendar = await generateCalendar(officeHourWithData.course.id);
  return res.status(StatusCodes.ACCEPTED).json({ officeHourWithData });
};
