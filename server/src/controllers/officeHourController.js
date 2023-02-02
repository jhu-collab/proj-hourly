import prisma from "../../prisma/client.js";
import { StatusCodes } from "http-status-codes";
import { stringToTimeObj } from "../util/officeHourValidator.js";
import checkValidation from "../util/checkValidation.js";
import { combineTimeAndDate, generateCalendar } from "../util/icalHelpers.js";
import { computeDiff } from "../util/helpers.js";
import { weekday } from "../util/officeHourValidator.js";
import {
  sendEmailForEachRegistrationWhenCancelled,
  sendEmailForEachRegistrationWhenChanged,
  sendEmail,
} from "../util/notificationUtil.js";

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

const createOfficeHour = async (
  startDate,
  endDate,
  courseId,
  location,
  isRecurring,
  isDeleted
) => {
  return await prisma.officeHour.create({
    data: {
      startDate,
      endDate,
      course: {
        connect: {
          id: courseId,
        },
      },
      location,
      isRecurring,
      isDeleted,
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
  if (checkValidation(req, res)) {
    return res;
  }
  const {
    recurringEvent,
    startDate,
    endDate,
    location,
    courseId,
    hosts,
    daysOfWeek,
  } = req.body;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const numOfWeek = daysOfWeek.map((dow) => weekday.indexOf(dow));
  if (recurringEvent) {
    while (!numOfWeek.includes(start.getDay())) {
      start.setUTCDate(start.getUTCDate() + 1);
    }
  }
  const officeHour = await createOfficeHour(
    start,
    end,
    courseId,
    location,
    recurringEvent,
    false
  );
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
  if (checkValidation(req, res)) {
    return res;
  }
  const courseId = parseInt(req.params.courseId, 10);
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
  });
  res.status(StatusCodes.ACCEPTED).json({ calendar: course.iCalJson });
};

export const register = async (req, res) => {
  if (checkValidation(req, res)) {
    return res;
  }
  const { officeHourId, startTime, endTime, date, question, TopicIds } =
    req.body;
  const id = req.id;
  const officeHour = await prisma.officeHour.findUnique({
    where: {
      id: officeHourId,
    },
    include: {
      course: true,
      hosts: true,
    },
  });
  const dateObj = new Date(date);
  // if (
  //   officeHour.startTime > officeHour.endTime &&
  //   startTime < officeHour.startTime
  // ) {
  //   dateObj.setDate(dateObj.getDate() + 1);
  // }
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
    include: {
      account: true,
      officeHour: true,
    },
  });
  const userEmail = registration.account.email;
  const fullName =
    registration.account.firstName + " " + registration.account.lastName;
  const courseTitle = officeHour.course.title;
  const courseNumber = officeHour.course.courseNumber;
  const location = registration.officeHour.location;
  const hostFullName =
    officeHour.hosts[0].firstName + " " + officeHour.hosts[0].lastName;
  const today = new Date();
  const emailStartTime =
    ((parseInt(startTime.split(":")[0], 10) - today.getTimezoneOffset() / 60) %
      12) +
    ":" +
    parseInt(startTime.split(":")[1], 10).toString().padStart(2, "0");
  const emailEndTime =
    ((parseInt(endTime.split(":")[0], 10) - today.getTimezoneOffset() / 60) %
      12) +
    ":" +
    parseInt(endTime.split(":")[1], 10).toString().padStart(2, "0");
  const subject =
    "[" +
    courseNumber +
    "] Successfully registered for " +
    hostFullName +
    "'s" +
    " office hours from " +
    emailStartTime +
    " to " +
    emailEndTime +
    "!";
  const emailBody =
    fullName +
    "," +
    "\n" +
    "You have successfully registered for " +
    courseTitle +
    " office hours from " +
    emailStartTime +
    " to " +
    emailEndTime +
    " at " +
    location +
    "!";
  let emailReq = {
    email: userEmail,
    subject: subject,
    text: emailBody,
  };
  console.log(emailBody);
  sendEmail(emailReq);
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
  if (checkValidation(req, res)) {
    return res;
  }
  const { officeHourId, date } = req.body;
  const dateObj = new Date(date);
  const registrations = await prisma.registration.findMany({
    where: {
      officeHourId: officeHourId,
      isCancelled: false,
    },
  });

  dateObj.setUTCHours(0);
  const officehour = await prisma.officeHour.findUnique({
    where: {
      id: officeHourId,
    },
    include: {
      course: true,
    },
  });
  await prisma.registration.updateMany({
    where: {
      officeHourId: officeHourId,
      date: dateObj,
    },
    data: {
      isCancelledStaff: true,
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
  sendEmailForEachRegistrationWhenCancelled(registrations);
  const calendar = await generateCalendar(officehour.course.id);
  return res.status(StatusCodes.ACCEPTED).json({ officeHourUpdate });
};

export const cancelAll = async (req, res) => {
  if (checkValidation(req, res)) {
    return res;
  }
  const { officeHourId } = req.body;
  const registrations = await prisma.registration.findMany({
    where: {
      officeHourId: officeHourId,
      isCancelled: false,
    },
  });
  const dateToEnd = req.body.date;
  const date = new Date(dateToEnd);
  const dateObj = new Date(dateToEnd);
  const officeHour = await prisma.officeHour.findUnique({
    where: {
      id: officeHourId,
    },
    include: {
      course: true,
    },
  });
  // dateObj.setUTCHours(
  //   new Date(officeHour.startDate).getUTCHours() -
  //     dateObj.getTimezoneOffset() / 60
  // );
  // date.setUTCMinutes(new Date(officeHour.startDate).getUTCMinutes());
  const startObj = officeHour.startDate;
  let officeHourUpdate;
  if (officeHour.startDate >= date) {
    await prisma.registration.updateMany({
      where: {
        officeHourId: officeHourId,
        isCancelled: false,
      },
      data: {
        isCancelledStaff: true,
      },
    });
    officeHourUpdate = await prisma.officeHour.update({
      where: {
        id: officeHourId,
      },
      data: {
        isDeleted: true,
      },
    });
    sendEmailForEachRegistrationWhenCancelled(registrations);
  } else if (officeHour.endDate > date) {
    await prisma.registration.updateMany({
      where: {
        officeHourId: officeHourId,
        date: {
          gte: dateObj,
        },
        isCancelled: false,
      },
      data: {
        isCancelledStaff: true,
      },
    });
    officeHourUpdate = await prisma.officeHour.update({
      where: {
        id: officeHourId,
      },
      data: {
        endDate: dateObj,
      },
    });
    sendEmailForEachRegistrationWhenCancelled(registrations);
  } else if (date > startObj) {
    return res.status(StatusCodes.CONFLICT).json({
      msg: "ERROR: office hours already over or too close to start time",
    });
  }
  const calendar = await generateCalendar(officeHour.course.id);
  return res.status(StatusCodes.ACCEPTED).json({ officeHourUpdate });
};

/**
 * This function computes the remaining time slots for a specific
 * office hour and returns them. This will compute time slots for each
 * possible time option picked
 * 5 minute intervals were a design decision to limit the number of options
 * while allowing for every multiple of 5 mins to be a time slot length
 * @param {*} req request to the api
 * @param {*} res response from the api
 * @returns res
 */
export const getTimeSlotsRemaining = async (req, res) => {
  if (checkValidation(req, res)) {
    return res;
  }
  const date = new Date(req.params.date);
  const officeHourId = parseInt(req.params.officeHourId, 10);
  //gets the office hour
  const officeHour = await prisma.officeHour.findUnique({
    where: {
      id: officeHourId,
    },
  });
  //gets the office hour session lengths for the course
  const timeLengths = await prisma.OfficeHourTimeOptions.findMany({
    where: {
      courseId: officeHour.courseId,
    },
  });
  const startDate = new Date(officeHour.startDate);
  const endDate = new Date(officeHour.endDate);
  if (endDate.getTimezoneOffset() !== startDate.getTimezoneOffset()) {
    endDate.setUTCHours(
      endDate.getUTCHours() +
        (-endDate.getTimezoneOffset() + startDate.getTimezoneOffset()) / 60 //handles daylight savings
    );
  }
  let start = new Date(startDate);
  const end = new Date(endDate);
  //gets all registrations for an office hour on a given day
  const registrations = await prisma.registration.findMany({
    where: {
      officeHourId,
      date,
      isCancelled: false,
    },
  });
  //maps a start time to its registration
  const registrationTimes = new Map();
  registrations.forEach((registration) => {
    registrationTimes.set(registration.startTime.getTime(), registration);
  });
  //number of 5 minute intervals in the office hour
  const timeStart = createJustTimeObject(startDate);
  const timeEnd = createJustTimeObject(endDate);
  while (timeEnd <= timeStart) {
    timeEnd.setDate(timeEnd.getDate() + 1);
  }
  let n = Math.abs((timeEnd - timeStart) / (5 * 60000));
  //an array of 5 minute intervals, marking if the interval is occupied
  let timeSlots = Array(n).fill(true);
  let count = 0;
  // loops from start to end and checks if a given interval is taken
  while (start < end) {
    if (registrationTimes.has(start.getTime())) {
      let registration = registrationTimes.get(start.getTime());
      const regEndTime = registration.endTime;
      while (start < regEndTime) {
        timeSlots[count++] = false;
        start.setMinutes(start.getMinutes() + 5);
      }
    } else {
      start.setMinutes(start.getMinutes() + 5);
      count++;
    }
  }
  let timeSlotsPerType = [];
  let sessionStartTime;
  // loops over each time length
  timeLengths.forEach((timeLength) => {
    sessionStartTime = new Date(startDate);
    let times = [];
    const length = timeLength.duration;
    // loops over the number of 5 minute time intervals
    // that could be used as the start of the session
    for (let i = 0; i < (n * 5) / length; i++) {
      let available = true;
      // loops over all 5 minute intervals from the
      // start time till the length has been reached
      // checking if all intervals are available
      for (let j = 0; j < length / 5; j++) {
        if (!timeSlots[i + j]) {
          available = false;
          break;
        }
      }
      // if available, adds to times array
      if (
        available &&
        createJustTimeObject(new Date()) <= new Date(sessionStartTime)
      ) {
        const startTime = new Date(sessionStartTime);
        const endTime = new Date(sessionStartTime);
        endTime.setMinutes(endTime.getMinutes() + length);
        times.push({
          startTime,
          endTime,
        });
      }
      sessionStartTime.setMinutes(sessionStartTime.getMinutes() + length);
    }
    // adds times array and type to the timeSlotsPerType array
    timeSlotsPerType.push({
      type: timeLength.title,
      duration: timeLength.duration,
      times,
    });
  });
  return res.status(StatusCodes.ACCEPTED).json({ timeSlotsPerType });
};

export const rescheduleSingleOfficeHour = async (req, res) => {
  if (checkValidation(req, res)) {
    return res;
  }
  const officeHourId = parseInt(req.params.officeHourId, 10);
  const registrations = await prisma.registration.findMany({
    where: {
      officeHourId: officeHourId,
      isCancelled: false,
    },
  });
  const { startDate, endDate, location } = req.body;
  const dateObj = new Date(startDate);
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

  let officeHourUpdate = {};
  if (officehour.isRecurring) {
    officeHourUpdate = await prisma.officeHour.update({
      where: {
        id: officeHourId,
      },
      data: {
        isCancelledOn: [...officehour.isCancelledOn, dateObj],
      },
    });
  } else {
    officeHourUpdate = await prisma.officeHour.update({
      where: {
        id: officeHourId,
      },
      data: {
        isDeleted: true,
      },
    });
  }
  await prisma.registration.updateMany({
    where: {
      officeHourId,
      date: dateObj,
      isCancelled: false,
    },
    data: {
      isCancelledStaff: true,
    },
  });
  const newLocation =
    location === null || location === undefined
      ? officehour.location
      : location;
  const newOfficeHour = await prisma.officeHour.create({
    data: {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      course: {
        connect: {
          id: officehour.course.id,
        },
      },
      isOnDayOfWeek: {
        connect: {
          dayOfWeek: dow,
        },
      },
      location: newLocation,
      isRecurring: false,
      isDeleted: false,
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
    },
  });
  sendEmailForEachRegistrationWhenChanged(registrations, newOfficeHour);
  const calendar = await generateCalendar(officehour.course.id);
  return res.status(StatusCodes.ACCEPTED).json({ newOfficeHour });
};

export const editAll = async (req, res) => {
  if (checkValidation(req, res)) {
    return res;
  }
  const officeHourId = parseInt(req.params.officeHourId, 10);
  const registrations = await prisma.registration.findMany({
    where: {
      officeHourId: officeHourId,
      isCancelled: false,
    },
  });
  const { startDate, endDate, location, daysOfWeek, endDateOldOfficeHour } =
    req.body;
  const editAfterDate = req.body.editAfterDate ? true : false;
  if (editAfterDate) {
    const oldOH = await prisma.officeHour.findUnique({
      where: { id: officeHourId },
    });
    const endOldOH = new Date(endDateOldOfficeHour);
    endOldOH.setUTCHours(oldOH.endDate.getUTCHours());
    endOldOH.setUTCMinutes(oldOH.endDate.getUTCMinutes());
    endOldOH.setUTCSeconds(oldOH.endDate.getUTCSeconds());
    endOldOH.setDate(endOldOH.getDate() - 1);
    const update = await prisma.officeHour.update({
      where: {
        id: officeHourId,
      },
      data: {
        endDate: endOldOH,
      },
      include: {
        hosts: true,
      },
    });
    const newOfficeHour = await createOfficeHour(
      new Date(startDate),
      new Date(endDate),
      update.courseId,
      location === undefined ? update.location : location,
      true,
      false
    );
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
        isCancelled: false,
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
        isCancelledStaff: true,
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
    sendEmailForEachRegistrationWhenChanged(registrations, newOfficeHour);
    return res.status(StatusCodes.ACCEPTED).json({
      oldOfficeHour: officeHourWithData,
      newOfficeHour: newOfficeHour,
    });
  } else {
    const officeHour = await prisma.officeHour.update({
      where: {
        id: officeHourId,
      },
      data: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location,
      },
      select: {
        isOnDayOfWeek: true,
      },
    });
    await prisma.officeHour.update({
      where: {
        id: officeHourId,
      },
      data: {
        isOnDayOfWeek: {
          disconnect: officeHour.isOnDayOfWeek.map((element) => {
            return { dayNumber: element.dayNumber };
          }),
        },
      },
    });
    await connectOfficeHourToDOW(officeHourId, daysOfWeek);
    const updatedOfficeHour = await prisma.officeHour.findUnique({
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
    const calendar = await generateCalendar(updatedOfficeHour.course.id);
    return res.status(StatusCodes.ACCEPTED).json({
      updatedOfficeHour,
    });
  }
};

export const getRegistrationStatus = async (req, res) => {
  if (checkValidation(req, res)) {
    return res;
  }
  const officeHourId = parseInt(req.params.officeHourId, 10);
  const date = new Date(req.params.date);
  const id = req.id;
  const status = await prisma.registration.findFirst({
    where: {
      officeHourId,
      accountId: id,
      date: date,
      isCancelled: false,
      isCancelledStaff: false,
    },
  });
  if (status === null || status === undefined) {
    return res.status(StatusCodes.ACCEPTED).json({ status: "Not Registered" });
  } else if (status.isCancelledStaff) {
    return res
      .status(StatusCodes.ACCEPTED)
      .json({ status: "Not Registered - Cancelled by staff" });
  }
  return res.status(StatusCodes.ACCEPTED).json({
    status: "Registered",
    registration: status,
  });
};

export const getForCourseWithFilter = async (req, res) => {
  const filter = req.params.filter;
  const courseId = parseInt(req.params.courseId, 10);
  const id = req.id;
  let officeHours = [];
  if (filter === "all") {
    officeHours = await prisma.officeHour.findMany({
      where: {
        courseId,
      },
      include: {
        isOnDayOfWeek: true,
        hosts: true,
      },
    });
  } else if (filter === "mine") {
    officeHours = await prisma.officeHour.findMany({
      where: {
        courseId,
        hosts: {
          some: {
            id,
          },
        },
      },
      include: {
        isOnDayOfWeek: true,
        hosts: true,
      },
    });
  } else {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: Invalid filter" });
  }
  return res.status(StatusCodes.ACCEPTED).json({ officeHours });
};

export const getOfficeHourById = async (req, res) => {
  if (checkValidation(req, res)) {
    return res;
  }
  const officeHourId = parseInt(req.params.officeHourId, 10);
  const officeHour = await prisma.officeHour.findUnique({
    where: {
      id: officeHourId,
    },
    include: {
      hosts: true,
      isOnDayOfWeek: true,
      isCancelledOn: true,
      course: {
        id: true,
      },
    },
  });
  return res.status(StatusCodes.ACCEPTED).json({ officeHour });
};

export const getAllRegistrationsOnDate = async (req, res) => {
  if (checkValidation(req, res)) {
    return res;
  }
  const officeHourId = parseInt(req.params.officeHourId, 10);
  const date = new Date(req.params.date);
  const registrations = await prisma.registration.findMany({
    where: {
      officeHourId,
      date: date,
    },
    include: {
      account: true,
      topics: true,
    },
    orderBy: {
      startTime: "asc",
    },
  });
  return res.status(StatusCodes.ACCEPTED).json({ registrations });
};

export const cancelRegistration = async (req, res) => {
  const registrationId = parseInt(req.params.registrationId, 10);
  const registration = await prisma.registration.update({
    where: {
      id: registrationId,
    },
    data: {
      isCancelled: true,
    },
    include: {
      account: true,
      officeHour: {
        include: {
          hosts: true,
          course: true,
        },
      },
    },
  });
  const userEmail = registration.account.email;
  const date = registration.date;
  var options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const dateStr = date.toLocaleDateString("en-US", options);
  const startTime = registration.startTime;
  let startTimeStr = startTime.toTimeString().split(" ")[0];
  const endTime = registration.endTime;
  let endTimeStr = endTime.toTimeString().split(" ")[0];
  startTimeStr = startTimeStr.substring(0, startTimeStr.length - 3);
  endTimeStr = endTimeStr.substring(0, endTimeStr.length - 3);

  const emailStr =
    "Your registration on " +
    dateStr +
    " from " +
    startTimeStr +
    " to " +
    endTimeStr +
    ", with " +
    registration.officeHour.hosts[0].firstName +
    " " +
    registration.officeHour.hosts[0].lastName +
    " at " +
    registration.officeHour.location +
    " has been cancelled";
  const subject =
    "[" +
    registration.officeHour.course.courseNumber +
    "]" +
    " Registration Cancelled";
  let emailReq = {
    email: userEmail,
    subject: subject,
    text: emailStr,
  };
  sendEmail(emailReq);
  console.log(emailStr);
  return res.status(StatusCodes.ACCEPTED).json({ registration });
};

export const editRegistration = async (req, res) => {
  const registrationId = parseInt(req.params.registrationId, 10);
  const { startTime, endTime, date, question, TopicIds } = req.body;
  const dateObj = new Date(date);
  const registrationTopics = await prisma.registration.findFirst({
    where: {
      id: registrationId,
    },
    include: {
      topics: {
        select: {
          id: true,
        },
      },
    },
  });
  let topicArr = registrationTopics.topics;
  /*
  might do:
  let topicArr = [];
  and not include the top part (lines: 580 - 592) if the request body has the list of all topics
  */
  TopicIds.forEach((topicId) => {
    topicArr.push({ id: topicId });
  });
  const registration = await prisma.registration.update({
    where: {
      id: registrationId,
    },
    data: {
      startTime: stringToTimeObj(startTime),
      endTime: stringToTimeObj(endTime),
      date: dateObj,
      question,
      topics: {
        connect: topicArr,
      },
    },
  });
  return res.status(StatusCodes.ACCEPTED).json({ registration });
};
