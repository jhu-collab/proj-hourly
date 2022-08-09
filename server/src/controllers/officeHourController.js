import prisma from "../../prisma/client.js";
import { StatusCodes } from "http-status-codes";
import { stringToTimeObj } from "../util/officeHourValidator.js";
import validate from "../util/checkValidation.js";
import { generateCalendar } from "../util/icalHelpers.js";
import { createTimeString } from "../util/helpers.js";
import { weekday } from "../util/officeHourValidator.js";

const connectOfficeHourToDOW = async (officeHourId, daysOfWeek) => {
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
};

const connectOfficeHourToHosts = async (officeHourId, hosts) => {
  let hostIds = [];
  hosts.forEach(async (id) => {
    hostIds.push({ id: id });
  });
  await prisma.officeHour.update({
    where: {
      id: officeHourId,
    },
    data: {
      hosts: {
        connect: hostIds,
      },
    },
  });
};

const createJustTimeObject = (time) => {
  time.setUTCDate(1);
  time.setUTCMonth(0);
  time.setUTCFullYear(1970);
  return time;
};

const createJustDateObject = (date) => {
  date.setUTCHours(0);
  date.setUTCMinutes(0);
  date.setUTCSeconds(0);
  date.setUTCMilliseconds(0);
  return date;
};

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
      isDeleted: false,
    },
  });
  await connectOfficeHourToHosts(officeHour.id, hosts);
  await connectOfficeHourToDOW(officeHour.id, daysOfWeek);
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
      isCancelledStaff: false,
    },
  });
  if (TopicIds !== null && TopicIds !== undefined) {
    let topicIdArr = [];
    TopicIds.forEach(async (topicId) => {
      topicIdArr.push({ id: topicId });
    });
    await prisma.registration.update({
      where: {
        id: registration.id,
      },
      data: {
        topics: {
          connect: topicIdArr,
        },
      },
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
  date.setUTCHours(date.getHours());
  date.setUTCMinutes(date.getMinutes());
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
  const startObj = officeHour.startDate;
  startObj.setUTCHours(officeHour.startTime.getUTCHours() - 2);
  startObj.setUTCMinutes(officeHour.startTime.getUTCMinutes());
  startObj.setUTCSeconds(officeHour.startTime.getUTCSeconds());
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
  } else if (date > startObj) {
    return res.status(StatusCodes.CONFLICT).json({
      msg: "ERROR: office hours already over or too close to start time",
    });
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
  const dateObj = createJustDateObject(new Date(date));
  const dow = weekday[dateObj.getUTCDay()];
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
  officehour.hosts.forEach((account) => {
    hostArr.push({ id: account.id });
  });
  await prisma.officeHour.update({
    where: {
      id: newOfficeHour.id,
    },
    data: {
      hosts: {
        connect: hostArr,
      },
      isOnDayOfWeek: {
        connect: {
          dayOfWeek: dow,
        },
      },
    },
  });
  const calendar = await generateCalendar(officehour.course.id);
  return res.status(StatusCodes.ACCEPTED).json({ newOfficeHour });
};

export const editAll = async (req, res) => {
  const officeHourId = parseInt(req.params.officeHourId, 10);
  const {
    startDate,
    endDate,
    startTime,
    endTime,
    location,
    daysOfWeek,
    timePerStudent,
    endDateOldOfficeHour,
  } = req.body;
  const startTimeObject = stringToTimeObj(startTime);
  const endTimeObject = stringToTimeObj(endTime);
  const update = await prisma.officeHour.update({
    where: {
      id: officeHourId,
    },
    data: {
      endDate: new Date(endDateOldOfficeHour),
    },
    include: {
      hosts: true,
    },
  });
  const newOfficeHour = await prisma.officeHour.create({
    data: {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      startTime: startTimeObject,
      endTime: endTimeObject,
      location: location === undefined ? update.location : location,
      timePerStudent:
        timePerStudent === undefined ? update.timePerStudent : timePerStudent,
      isRecurring: true,
      course: {
        connect: {
          id: update.courseId,
        },
      },
    },
  });
  await connectOfficeHourToDOW(newOfficeHour.id, daysOfWeek);
  await connectOfficeHourToHosts(
    newOfficeHour.id,
    update.hosts.map((hosts) => hosts.id)
  );
  const startTimeObj = createJustTimeObject(new Date());
  const today = createJustDateObject(new Date());
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
          date: today,
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
  return res
    .status(StatusCodes.ACCEPTED)
    .json({ oldOfficeHour: officeHourWithData, newOfficeHour: newOfficeHour });
};

export const getRegistrationStatus = async (req, res) => {
  const officeHourId = parseInt(req.params.officeHourId, 10);
  const date = new Date(req.params.date);
  const id = parseInt(req.get("id"), 10);
  const status = await prisma.registration.findFirst({
    where: {
      officeHourId,
      accountId: id,
      date: date,
    },
  });
  if (status === null || status === undefined) {
    return res.status(StatusCodes.ACCEPTED).json({ status: "Not Registered" });
  }
  return res.status(StatusCodes.ACCEPTED).json({
    status: "Registered",
    registration: status,
  });
};
