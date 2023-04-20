import prisma from "../../prisma/client.js";
import { StatusCodes } from "http-status-codes";
import { stringToTimeObj } from "../util/officeHourValidator.js";
import checkValidation from "../util/checkValidation.js";
import { combineTimeAndDate, generateCalendar } from "../util/icalHelpers.js";
import { computeDiff, handleUTCDateChange } from "../util/helpers.js";
import { weekday } from "../util/officeHourValidator.js";
import {
  sendEmailForEachRegistrationWhenCancelled,
  sendEmailForEachRegistrationWhenChanged,
  sendEmail,
} from "../util/notificationUtil.js";
import { factory } from "../util/debug.js";

const debug = factory(import.meta.url);

const combineStringTimeAndDate = (timeStr, date) => {
  const timeArray = timeStr.split(":");
  const time = new Date(date);
  time.setUTCHours(timeArray[0]);
  time.setUTCMinutes(timeArray[1]);
  time.setUTCSeconds(timeArray[2]);
  time.setUTCMilliseconds(0);
  return time;
};

const connectOfficeHourToDOW = async (officeHourId, daysOfWeek) => {
  let dowArr = [];
  daysOfWeek.forEach(async (dayOfWeek) => {
    dowArr.push({ dayOfWeek: dayOfWeek });
  });
  debug("updating office hour's days...");
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
  debug("office hour's days are updated");
};

const connectOfficeHourToHosts = async (officeHourId, hosts) => {
  let hostIds = [];
  hosts.forEach(async (id) => {
    hostIds.push({ id: id });
  });
  debug("updating office hour's hosts...");
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
  debug("office hour's hosts are updated");
};

const createOfficeHour = async (
  startDate,
  endDate,
  courseId,
  location,
  isRecurring,
  isDeleted
) => {
  debug("creating office hour...");
  const officeHour = await prisma.officeHour.create({
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
  debug("office hour is created");
  return officeHour;
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
  debug("getting office hour to return...");
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
  debug("generating calendar...");
  const calendar = await generateCalendar(courseId);
  debug("calendar is generated");
  debug("office hour is returned");
  return res
    .status(StatusCodes.CREATED)
    .json({ officeHour: officeHourWithData });
};

export const getForCourse = async (req, res) => {
  if (checkValidation(req, res)) {
    return res;
  }
  const courseId = parseInt(req.params.courseId, 10);
  debug("getting course...");
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
  });
  debug("course is gotten");
  res.status(StatusCodes.ACCEPTED).json({ calendar: course.iCalJson });
};

export const register = async (req, res) => {
  if (checkValidation(req, res)) {
    return res;
  }
  const { officeHourId, startTime, endTime, date, question, TopicIds } =
    req.body;
  const targetDate = req.targetDate;
  const id = req.id;
  debug("getting office hour...");
  const officeHour = await prisma.officeHour.findUnique({
    where: {
      id: officeHourId,
    },
    include: {
      course: true,
      hosts: true,
    },
  });
  debug("office hour is gotten");
  var topicArr = [];
  if (TopicIds !== null && TopicIds !== undefined) {
    TopicIds.map(async (topicId) => {
      topicArr.push({ id: topicId });
    });
  }
  const startTimeObj = combineStringTimeAndDate(startTime, targetDate);
  const endTimeObj = combineStringTimeAndDate(endTime, targetDate);
  if (endTimeObj < startTimeObj) {
    endTimeObj.setUTCDate(endTimeObj.getUTCDate() + 1);
  }
  if (
    officeHour.startDate.getTimezoneOffset() != targetDate.getTimezoneOffset()
  ) {
    startTimeObj.setUTCHours(
      startTimeObj.getUTCHours() -
        (officeHour.startDate.getTimezoneOffset() -
          targetDate.getTimezoneOffset()) /
          60
    );
    endTimeObj.setUTCHours(
      endTimeObj.getUTCHours() -
        (officeHour.startDate.getTimezoneOffset() -
          targetDate.getTimezoneOffset()) /
          60
    );
  }
  debug("creating registration...");
  const registration = await prisma.registration.create({
    data: {
      startTime: startTimeObj,
      endTime: endTimeObj,
      date: targetDate,
      isCancelled: false,
      officeHourId,
      accountId: id,
      question,
      isCancelledStaff: false,
      topics: {
        connect: topicArr,
      },
    },
    include: {
      account: true,
      officeHour: true,
      topics: true,
    },
  });
  debug("registration is created");
  var options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  var topics =
    registration.topics.length > 0
      ? registration.topics.map((topic) => topic.value)
      : "No topics selected.";
  const userEmail = registration.account.email;
  const fullName =
    registration.account.firstName + " " + registration.account.lastName;
  const courseTitle = officeHour.course.title;
  const courseNumber = officeHour.course.courseNumber;
  const location = registration.officeHour.location;
  const hostFullName =
    officeHour.hosts[0].firstName + " " + officeHour.hosts[0].lastName;
  const today = new Date();
  const emailStartTime = startTimeObj.toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
  const emailEndTime = endTimeObj.toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
  targetDate.setUTCMinutes(
    targetDate.getUTCMinutes() - targetDate.getTimezoneOffset()
  );
  const dateStr = targetDate.toLocaleDateString("en-US", options);

  const donotreply = "--- Do not reply to this email ---";
  let subject =
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
  let emailBody =
    donotreply +
    "\n\n" +
    "Dear " +
    fullName +
    "," +
    "\n\n" +
    "You have successfully registered for " +
    courseTitle +
    " office hours from " +
    emailStartTime +
    " to " +
    emailEndTime +
    " on " +
    dateStr +
    " at " +
    location +
    "!" +
    "\n\nTopics: " +
    topics +
    "\n\n" +
    "Thanks,\n" +
    "The Hourly Team\n\n" +
    donotreply;

  let emailReq = {
    email: userEmail,
    subject: subject,
    text: emailBody,
  };
  debug("sending email to student...");
  sendEmail(emailReq);
  debug("email is sent to student");
  officeHour.hosts.forEach((acc) => {
    debug("sending email to host...");
    subject =
      "[" +
      courseNumber +
      "] New Registration for office hours from " +
      emailStartTime +
      " to " +
      emailEndTime +
      "!";
    emailBody =
      hostFullName +
      "," +
      "\n" +
      "You have a new registration for your " +
      courseTitle +
      " office hours from " +
      emailStartTime +
      " to " +
      emailEndTime +
      " on " +
      dateStr +
      " at " +
      location +
      " with student " +
      fullName +
      "!" +
      "\ntopics: " +
      topics;
    emailReq = {
      email: acc.email,
      subject: subject,
      text: emailBody,
    };
    sendEmail(emailReq);
    debug("email is sent to host");
  });
  return res.status(StatusCodes.ACCEPTED).json({ registration });
};

export const cancelOnDate = async (req, res) => {
  if (checkValidation(req, res)) {
    return res;
  }
  const { officeHourId, date } = req.body;
  const dateObj = new Date(date);
  debug("finding registrations...");
  const registrations = await prisma.registration.findMany({
    where: {
      officeHourId: officeHourId,
      isCancelled: false,
      date: dateObj,
    },
  });
  debug("registrations are found");
  dateObj.setUTCHours(0);
  debug("finding office hour...");
  const officehour = await prisma.officeHour.findUnique({
    where: {
      id: officeHourId,
    },
    include: {
      course: true,
    },
  });
  debug("office hour is found");
  debug * "updating registrations...";
  await prisma.registration.updateMany({
    where: {
      officeHourId: officeHourId,
      date: dateObj,
    },
    data: {
      isCancelledStaff: true,
    },
  });
  debug("registrations are updated");
  debug("updating office hour...");
  const officeHourUpdate = await prisma.officeHour.update({
    where: {
      id: officeHourId,
    },
    data: {
      isCancelledOn: [...officehour.isCancelledOn, dateObj],
    },
  });
  debug("office hour is updated");
  debug("sending cancellation emails...");
  sendEmailForEachRegistrationWhenCancelled(registrations);
  debug("cancellation emails are sent");
  const calendar = await generateCalendar(officehour.course.id);
  return res.status(StatusCodes.ACCEPTED).json({ officeHourUpdate });
};

export const cancelAll = async (req, res) => {
  if (checkValidation(req, res)) {
    return res;
  }
  const { officeHourId } = req.body;
  const dateToEnd = req.body.date;
  debug("finding registrations...");
  const registrations = await prisma.registration.findMany({
    where: {
      officeHourId: officeHourId,
      isCancelled: false,
      date: {
        gte: dateToEnd,
      },
    },
  });
  debug("registrations are found");
  const date = new Date(dateToEnd);
  const dateObj = new Date(dateToEnd);
  debug("finding office hour...");
  const officeHour = await prisma.officeHour.findUnique({
    where: {
      id: officeHourId,
    },
    include: {
      course: true,
    },
  });
  debug("office hour is found");
  // dateObj.setUTCHours(
  //   new Date(officeHour.startDate).getUTCHours() -
  //     dateObj.getTimezoneOffset() / 60
  // );
  // date.setUTCMinutes(new Date(officeHour.startDate).getUTCMinutes());
  const startObj = officeHour.startDate;
  let officeHourUpdate;
  if (officeHour.startDate >= date) {
    debug("cancelling registrations...");
    await prisma.registration.deleteMany({
      where: {
        officeHourId: officeHourId,
        isCancelled: false,
      },
    });
    debug("registrations are cancelled");
    debug("updating office hour...");
    officeHourUpdate = await prisma.officeHour.delete({
      where: {
        id: officeHourId,
      },
    });
    debug("office hour is updated");
    debug("sending cancellation emails...");
    sendEmailForEachRegistrationWhenCancelled(registrations);
    debug("cancellation emails are sent");
  } else if (officeHour.endDate > date) {
    debug("cancelling registrations...");
    await prisma.registration.deleteMany({
      where: {
        officeHourId: officeHourId,
        date: {
          gte: dateObj,
        },
        isCancelled: false,
      },
    });
    debug("registrations are cancelled");
    debug("updating office hour...");
    officeHourUpdate = await prisma.officeHour.update({
      where: {
        id: officeHourId,
      },
      data: {
        endDate: dateObj,
      },
    });
    debug("office hour is updated");
    debug("sending cancellation emails...");
    sendEmailForEachRegistrationWhenCancelled(registrations);
    debug("cancellation emails are sent");
  } else if (date > startObj) {
    debug("office hours already over or too close to start time");
    return res.status(StatusCodes.CONFLICT).json({
      msg: "ERROR: office hours already over or too close to start time",
    });
  }
  debug("generating calendar after cancellation...");
  const calendar = await generateCalendar(officeHour.course.id);
  debug("calendar is generated");
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
  let date = req.targetDate;
  const offset = date.getTimezoneOffset();
  const officeHourId = parseInt(req.params.officeHourId, 10);
  //gets the office hour
  debug("finding office hour...");
  const officeHour = await prisma.officeHour.findUnique({
    where: {
      id: officeHourId,
    },
  });
  debug("office hour is found");
  //date = handleUTCDateChange(date, officeHour);
  //gets the office hour session lengths for the course
  debug("finding time lengths...");
  const timeLengths = await prisma.OfficeHourTimeOptions.findMany({
    where: {
      courseId: officeHour.courseId,
    },
  });
  debug("time lengths are found");
  debug("finding course...");
  const course = await prisma.course.findUnique({
    where: { id: officeHour.courseId },
  });
  debug("course is found");
  const startDate = new Date(officeHour.startDate);
  const endDate = new Date(officeHour.endDate);
  let crossesDaylightSavings = false;
  if (endDate.getTimezoneOffset() !== startDate.getTimezoneOffset()) {
    endDate.setUTCHours(
      endDate.getUTCHours() +
        (-endDate.getTimezoneOffset() + startDate.getTimezoneOffset()) / 60 //handles daylight savings
    );
    crossesDaylightSavings = true;
  }
  let start = createJustTimeObject(new Date(startDate));
  const end = createJustTimeObject(new Date(endDate));
  if (start > end) {
    end.setUTCDate(end.getUTCDate() + 1);
  }
  //gets all registrations for an office hour on a given day
  debug("finding registrations...");
  const registrations = await prisma.registration.findMany({
    where: {
      officeHourId,
      date,
      isCancelled: false,
    },
  });
  debug("registrations are found");
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
  const now = new Date();
  start = createJustTimeObject(new Date(startDate));
  timeLengths.forEach((timeLength) => {
    sessionStartTime = new Date(startDate);
    let times = [];
    const length = timeLength.duration;
    // loops over the number of 5 minute time intervals
    // that could be used as the start of the session
    for (let i = 0; i < n; i += length / 5) {
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
      const justDate = new Date(date);
      const beforeConstraint = new Date(justDate);
      beforeConstraint.setUTCMinutes(sessionStartTime.getUTCMinutes());
      beforeConstraint.setUTCHours(
        beforeConstraint.getUTCHours() - course.startRegConstraint
      );
      const endConstraint = new Date(justDate);
      endConstraint.setUTCDate(
        endConstraint.getUTCDate() + sessionStartTime.getUTCDate() - 1
      );
      endConstraint.setUTCMinutes(sessionStartTime.getUTCMinutes());
      endConstraint.setUTCHours(
        endConstraint.getUTCHours() - course.endRegConstraint
      );
      if (
        available &&
        (new Date() < justDate ||
          createJustTimeObject(new Date()) <= new Date(sessionStartTime)) &&
        beforeConstraint < now &&
        endConstraint >= now
      ) {
        const startTime = new Date(sessionStartTime);
        const endTime = new Date(sessionStartTime);
        endTime.setMinutes(endTime.getMinutes() + length);
        times.push({
          startTime,
          endTime,
        });
      }
      sessionStartTime.setUTCMinutes(sessionStartTime.getUTCMinutes() + length);
    }
    // adds times array and type to the timeSlotsPerType array
    if (start.getTimezoneOffset() !== offset && !crossesDaylightSavings) {
      times.forEach((time) => {
        time.startTime.setUTCMonth(6);
        time.endTime.setUTCMonth(6);
      });
    }
    timeSlotsPerType.push({
      type: timeLength.title,
      duration: timeLength.duration,
      times,
    });
  });
  debug("returning time slots");
  return res.status(StatusCodes.ACCEPTED).json({ timeSlotsPerType });
};

export const rescheduleSingleOfficeHour = async (req, res) => {
  if (checkValidation(req, res)) {
    return res;
  }
  const officeHourId = parseInt(req.params.officeHourId, 10);
  debug("finding registrations...");
  const registrations = await prisma.registration.findMany({
    where: {
      officeHourId: officeHourId,
      isCancelled: false,
      isCancelledStaff: false,
    },
    select: {
      account: true,
    },
  });
  debug("registrations are found");
  const { startDate, endDate, location } = req.body;
  const dateObj = new Date(startDate);
  const dow = weekday[dateObj.getUTCDay()];
  debug("updating office hour...");
  const officehour = await prisma.officeHour.findUnique({
    where: {
      id: officeHourId,
    },
    include: {
      course: true,
      hosts: true,
    },
  });
  debug("office hour is found");
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
  debug("updating registrations...");
  await prisma.registration.updateMany({
    where: {
      officeHourId,
      date: dateObj,
      isCancelled: false,
      isCancelledStaff: false,
    },
    data: {
      isCancelledStaff: true,
    },
  });
  debug("registrations are updated");
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
  debug("connecting hosts...");
  officehour.hosts.forEach((account) => {
    hostArr.push({ id: account.id });
  });
  debug("hosts are connected");
  debug("updating office hour...");
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
  debug("office hour is updated");
  debug("sending emails...");
  sendEmailForEachRegistrationWhenChanged(registrations, newOfficeHour);
  debug("emails are sent");
  debug("generating calendar...");
  const calendar = await generateCalendar(officehour.course.id);
  debug("calendar is generated");
  return res.status(StatusCodes.ACCEPTED).json({ newOfficeHour });
};

export const editAll = async (req, res) => {
  if (checkValidation(req, res)) {
    return res;
  }
  const officeHourId = parseInt(req.params.officeHourId, 10);
  debug("finding registrations...");
  const registrations = await prisma.registration.findMany({
    where: {
      officeHourId: officeHourId,
      isCancelled: false,
      isCancelledStaff: false,
    },
    select: {
      account: true,
    },
  });
  debug("registrations are found");
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
    debug("creating new office hour...");
    const newOfficeHour = await createOfficeHour(
      new Date(startDate),
      new Date(endDate),
      update.courseId,
      location === undefined ? update.location : location,
      true,
      false
    );
    debug("new office hour is created");
    await connectOfficeHourToDOW(newOfficeHour.id, daysOfWeek);
    debug("connecting hosts...");
    await connectOfficeHourToHosts(
      newOfficeHour.id,
      update.hosts.map((hosts) => hosts.id)
    );
    debug("hosts are connected");
    const startTimeObj = createJustTimeObject(new Date());
    const today = createJustDateObject(new Date());
    debug("updating registrations...");
    await prisma.registration.updateMany({
      where: {
        officeHourId,
        isCancelled: false,
        isCancelledStaff: false,
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
    debug("registrations are updated");
    debug("getting office hour with data...");
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
    debug("office hour with data is got");
    debug("sending emails...");
    const calendar = await generateCalendar(officeHourWithData.course.id);
    debug("emails are sent");
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
    debug("creating calendat...");
    const calendar = await generateCalendar(updatedOfficeHour.course.id);
    debug("calendar is created");
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
  debug("finding office hour...");
  const officeHour = await prisma.officeHour.findUnique({
    where: {
      id: officeHourId,
    },
  });
  debug("office hour is found");
  let date = req.targetDate;
  const id = req.id;
  debug("finding registration...");
  const status = await prisma.registration.findFirst({
    where: {
      officeHourId,
      accountId: id,
      date: date,
      isCancelled: false,
      isCancelledStaff: false,
    },
  });
  debug("registration is found");
  if (status === null || status === undefined) {
    debug("registration is not found");
    return res.status(StatusCodes.ACCEPTED).json({ status: "Not Registered" });
  } else if (status.isCancelledStaff) {
    debug("registration is cancelled by staff");
    return res
      .status(StatusCodes.ACCEPTED)
      .json({ status: "Not Registered - Cancelled by staff" });
  }
  debug("registration is found");
  return res.status(StatusCodes.ACCEPTED).json({
    status: "Registered",
    registration: status,
  });
};

export const getForCourseWithFilter = async (req, res) => {
  debug("getting office hours with filter...");
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
    debug("invalid filter");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: Invalid filter" });
  }
  debug("office hours with filter are got");
  return res.status(StatusCodes.ACCEPTED).json({ officeHours });
};

export const getOfficeHourById = async (req, res) => {
  if (checkValidation(req, res)) {
    return res;
  }
  debug("getting office hour by id...");
  const officeHourId = parseInt(req.params.officeHourId, 10);
  const officeHour = await prisma.officeHour.findUnique({
    where: {
      id: officeHourId,
    },
    include: {
      hosts: true,
      isOnDayOfWeek: true,
      course: {
        select: {
          id: true,
        },
      },
      hosts: {
        select: {
          id: true,
          userName: true,
          email: true,
          firstName: true,
          lastName: true,
          preferredName: true,
          role: true,
        },
      },
    },
  });
  debug("office hour is got");
  return res.status(StatusCodes.ACCEPTED).json({ officeHour });
};

export const getAllRegistrationsOnDate = async (req, res) => {
  if (checkValidation(req, res)) {
    return res;
  }
  const officeHourId = parseInt(req.params.officeHourId, 10);
  debug("finding office hour...");
  const officehour = await prisma.officeHour.findUnique({
    where: {
      id: officeHourId,
    },
  });
  debug("office hour is found");
  const date = req.targetDate;
  debug("finding registrations...");
  const registrations = await prisma.registration.findMany({
    where: {
      officeHourId,
      date: date,
      isCancelled: false,
      isCancelledStaff: false,
    },
    include: {
      account: true,
      topics: true,
    },
    orderBy: {
      startTime: "asc",
    },
  });
  debug("registrations are found");
  return res.status(StatusCodes.ACCEPTED).json({ registrations });
};

export const cancelRegistration = async (req, res) => {
  const registrationId = parseInt(req.params.registrationId, 10);
  debug("cancelling registration...");
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
  debug("registration is cancelled");
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
  let startTimeStr = startTime.toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
  const endTime = registration.endTime;
  let endTimeStr = endTime.toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

  const donotreply = "--- Do not reply to this email ---";

  let emailStr =
    donotreply +
    "\n\n" +
    "Dear " +
    registration.account.firstName +
    " " +
    registration.account.lastName +
    ",\n\n" +
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
    " has been cancelled.\n\n" +
    +"Thanks,\n" +
    "The Hourly Team, \n" +
    "\n\n" +
    donotreply;
  let subject =
    "[" +
    registration.officeHour.course.courseNumber +
    "] " +
    registration.officeHour.course.title +
    ": Registration Cancelled";
  let emailReq = {
    email: userEmail,
    subject: subject,
    text: emailStr,
  };
  debug("sending email to student...");
  sendEmail(emailReq);
  debug("email is sent to student");
  debug("sending email to hosts...");
  registration.officeHour.hosts.forEach((acc) => {
    emailStr =
      donotreply +
      "\n\n" +
      "Dear " +
      registration.account.firstName +
      " " +
      registration.account.lastName +
      ",\n\n" +
      "Your registration on " +
      dateStr +
      " from " +
      startTimeStr +
      " to " +
      endTimeStr +
      ", with " +
      registration.account.firstName +
      " " +
      registration.account.lastName +
      " at " +
      registration.officeHour.location +
      " has been cancelled.";
    subject =
      "[" +
      registration.officeHour.course.courseNumber +
      "] " +
      registration.officeHour.course.title +
      ": Registration Cancelled";
    emailReq = {
      email: acc.email,
      subject: subject,
      text: emailStr,
    };
    sendEmail(emailReq);
  });
  debug("emails are sent to hosts");
  return res.status(StatusCodes.ACCEPTED).json({ registration });
};

export const editRegistration = async (req, res) => {
  const registrationId = parseInt(req.params.registrationId, 10);
  const { startTime, endTime, date, question, TopicIds } = req.body;
  const dateObj = req.targetDate;
  debug("finding registration with topics...");
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
      officeHour: true,
    },
  });
  debug("registration with topics is found");
  if (
    registrationTopics.officeHour.startTime >
      registrationTopics.officeHour.endTime &&
    startTime < registrationTopics.officeHour.startTime
  ) {
    dateObj.setDate(dateObj.getDate() + 1);
  }
  let topicArr = registrationTopics.topics;
  /*
  might do:
  let topicArr = [];
  and not include the top part (lines: 580 - 592) if the request body has the list of all topics
  */
  TopicIds.forEach((topicId) => {
    topicArr.push({ id: topicId });
  });
  debug("updating registration...");
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
  debug("registration is updated");
  return res.status(StatusCodes.ACCEPTED).json({ registration });
};
