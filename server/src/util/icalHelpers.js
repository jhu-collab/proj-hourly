import ical from "ical-generator";
import prisma from "../../prisma/client.js";
import pkg from "rrule";
const { RRule, RRuleSet } = pkg;
import { weekday } from "./officeHourValidator.js";

/**
 * Javascript Date object will often be one day off if you provide
 * it with the format of yyyy-mm-dd. However, if you pass in
 * yyyy/mm/dd into a the Date constructor, you will get the
 * date in which you expected.
 * @param {*} dateStr - A string in the format of yyyy-mm-dd
 * @returns A string in the format of yyyy/mm/dd
 */
export const getExpectedDate = (dateStr) => {
  return dateStr.replace(/-/g, "/");
};

/**
 * Retrives only the date portion of the Date.toIsoString method.
 * @param {*} dateObj - Java string date object
 * @returns A string in the format of yyyy-mm-dd
 */
export const getIsoDate = (dateObj) => {
  return dateObj.toISOString().split("T")[0];
};

export const generateTitle = (officeHour) => {
  let summary = "";
  if (officeHour.hosts.length > 1) {
    summary = "Office Hours for " + course.title;
  } else if (officeHour.hosts.length === 1) {
    summary = officeHour.hosts[0].userName + "'s Office Hours";
  } else {
    summary = "Office Hours";
  }
  return summary;
};

export const getTimeString = (time) => {
  console.log(time);
  return (
    time.getUTCHours() + ":" + time.getUTCMinutes() + ":" + time.getUTCSeconds()
  );
};

export const getDateStringArray = (arr) => {
  const dates = [];
  arr.forEach((date) => dates.push(getIsoDate(date)));
  return dates;
};

export const combineTimeAndDate = (time, date) => {
  const newDate = new Date();
  newDate.setFullYear(date.getFullYear());
  newDate.setDate(date.getDate() + 1);
  newDate.setMonth(date.getMonth());
  newDate.setHours(time.getHours() + 1);
  newDate.setMinutes(time.getMinutes());
  newDate.setSeconds(time.getSeconds());
  return newDate;
};

export const generateRecurringEventJson = (officeHour) => {
  const indexes = [];
  officeHour.isOnDayOfWeek.forEach((dow) => {
    indexes.push(weekday.indexOf(dow.dayOfWeek));
  });
  return {
    id: officeHour.id,
    startTime: getTimeString(officeHour.startTime),
    endTime: getTimeString(officeHour.endTime),
    title: generateTitle(officeHour),
    daysOfWeek: indexes,
    startRec: getIsoDate(officeHour.startDate),
    endRec: getIsoDate(officeHour.endDate),
    extendedProps: {
      hosts: officeHour.hosts,
      courseId: officeHour.course.id,
    },
    exdate: getDateStringArray(officeHour.isCancelledOn),
  };
};

export const generateSingleEventJson = (officeHour) => {
  return {
    id: officeHour.id,
    title: generateTitle(officeHour),
    start: combineTimeAndDate(
      officeHour.startTime,
      officeHour.startDate
    ).toISOString(),
    end: combineTimeAndDate(
      officeHour.endTime,
      officeHour.endDate
    ).toISOString(),
    extendedProps: {
      hosts: officeHour.hosts,
      courseId: officeHour.course.id,
    },
  };
};

export const generateCalendar = async (courseId) => {
  const events = [];
  const officeHours = await prisma.officeHour.findMany({
    where: {
      courseId,
      isDeleted: false,
    },
    include: {
      hosts: {
        select: {
          id: true,
          userName: true,
          email: true,
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
  officeHours.forEach((officeHour) => {
    if (officeHour.isRecurring) {
      events.push(generateRecurringEventJson(officeHour));
    } else {
      events.push(generateSingleEventJson(officeHour));
    }
  });
  await prisma.course.update({
    where: {
      id: courseId,
    },
    data: {
      iCalJson: events,
    },
  });
  return events;
};

// export const generateCalendar = async (courseId) => {
//   const course = await prisma.course.findUnique({
//     where: {
//       id: courseId,
//     },
//     include: {
//       officeHours: true,
//     },
//   });
//   const calendar = ical({ name: course.title });
//   const officeHours = await prisma.officeHour.findMany({
//     where: {
//       courseId,
//       isDeleted: false,
//     },
//     include: {
//       hosts: {
//         select: {
//           id: true,
//           userName: true,
//           email: true,
//         },
//       },
//       isOnDayOfWeek: {
//         select: {
//           dayOfWeek: true,
//         },
//       },
//     },
//   });
//   officeHours.forEach((officeHour) => {
//     const startTime = new Date(
//       getExpectedDate(getIsoDate(officeHour.startDate))
//     );
//     startTime.setHours(officeHour.startTime.getHours() + 1);
//     startTime.setMinutes(officeHour.startTime.getMinutes());
//     startTime.setSeconds(officeHour.startTime.getSeconds());
//     const endTime = new Date(getExpectedDate(getIsoDate(officeHour.endDate)));
//     endTime.setHours(officeHour.endTime.getHours() + 1);
//     endTime.setMinutes(officeHour.endTime.getMinutes());
//     endTime.setSeconds(officeHour.endTime.getSeconds());
//     let summary = "";
//     if (officeHour.hosts.length > 1) {
//       summary = "Office Hours for " + course.title;
//     } else if (officeHour.hosts.length === 1) {
//       summary = officeHour.hosts[0].userName + "'s Office Hours";
//     } else {
//       summary = "Office Hours";
//     }
//     const event = calendar.createEvent({
//       start: startTime,
//       end: endTime,
//       timezone: "UTC",
//       summary,
//       description: JSON.stringify({
//         hosts: officeHour.hosts,
//         timePerStudent: officeHour.timePerStudent,
//         id: officeHour.id,
//       }),
//       location: officeHour.location,
//     });
//     if (officeHour.isRecurring) {
//       const rule = generateRRule(officeHour);
//       event.repeating(rule);
//     }
//   });

//   const jsonCal = calendar.toJSON();
//   await prisma.course.update({
//     where: {
//       id: courseId,
//     },
//     data: {
//       iCalJson: jsonCal,
//     },
//   });
//   return jsonCal;
// };

// const generateRRule = (officeHour) => {
//   const dow = officeHour.isOnDayOfWeek.map((dow) => {
//     if (dow.dayOfWeek === "Monday") {
//       return RRule.MO;
//     } else if (dow.dayOfWeek === "Tuesday") {
//       return RRule.TU;
//     } else if (dow.dayOfWeek === "Wednesday") {
//       return RRule.WE;
//     } else if (dow.dayOfWeek === "Thursday") {
//       return RRule.TH;
//     } else if (dow.dayOfWeek === "Friday") {
//       return RRule.FR;
//     } else if (dow.dayOfWeek === "Saturday") {
//       return RRule.SA;
//     } else {
//       return RRule.SU;
//     }
//   });
//   const start = new Date(officeHour.startDate);
//   start.setHours(officeHour.startTime.getHours() + 1);
//   start.setMinutes(officeHour.startTime.getMinutes());
//   start.setSeconds(officeHour.startTime.getSeconds());
//   const end = new Date(officeHour.endDate);
//   end.setHours(officeHour.endTime.getHours() + 1);
//   end.setMinutes(officeHour.endTime.getMinutes());
//   end.setSeconds(officeHour.endTime.getSeconds());
//   const rruleSet = new RRuleSet();
//   rruleSet.rrule(
//     new RRule({
//       freq: RRule.WEEKLY,
//       interval: 1,
//       byweekday: dow,
//       dtstart: start,
//       until: end,
//     })
//   );
//   officeHour.isCancelledOn.forEach((date) => {
//     rruleSet.exdate(date);
//   });
//   return rruleSet;
// };
