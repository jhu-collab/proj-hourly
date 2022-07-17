import ical from "ical-generator";
import prisma from "../../prisma/client.js";
import pkg from "rrule";
const { RRule, RRuleSet } = pkg;

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

export const generateCalendar = async (courseId) => {
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      officeHours: true,
    },
  });
  const calendar = ical({ name: course.title });
  const officeHours = await prisma.officeHour.findMany({
    where: {
      courseId,
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
    },
  });
  officeHours.forEach((officeHour) => {
    const startTime = new Date(
      getExpectedDate(getIsoDate(officeHour.startDate))
    );
    startTime.setHours(officeHour.startTime.getHours() + 1);
    startTime.setMinutes(officeHour.startTime.getMinutes());
    startTime.setSeconds(officeHour.startTime.getSeconds());
    const endTime = new Date(getExpectedDate(getIsoDate(officeHour.endDate)));
    endTime.setHours(officeHour.endTime.getHours() + 1);
    endTime.setMinutes(officeHour.endTime.getMinutes());
    endTime.setSeconds(officeHour.endTime.getSeconds());
    let summary = "";
    if (officeHour.hosts.length > 1) {
      summary = "Office Hours for " + course.title;
    } else if (officeHour.hosts.length === 1) {
      summary = officeHour.hosts[0].userName + "'s Office Hours";
    } else {
      summary = "Office Hours";
    }
    const event = calendar.createEvent({
      start: startTime,
      end: endTime,
      timezone: "UTC",
      summary,
      description: JSON.stringify({
        hosts: officeHour.hosts,
        timePerStudent: officeHour.timePerStudent,
        id: officeHour.id,
      }),
      location: officeHour.location,
    });
    if (officeHour.isRecurring) {
      const rule = generateRRule(officeHour);
      event.repeating(rule);
    }

    console.log(event);
  });

  const jsonCal = calendar.toJSON();
  await prisma.course.update({
    where: {
      id: courseId,
    },
    data: {
      iCalJson: jsonCal,
    },
  });
  return jsonCal;
};

const generateRRule = (officeHour) => {
  const dow = officeHour.isOnDayOfWeek.map((dow) => {
    if (dow.dayOfWeek === "Monday") {
      return RRule.MO;
    } else if (dow.dayOfWeek === "Tuesday") {
      return RRule.TU;
    } else if (dow.dayOfWeek === "Wednesday") {
      return RRule.WE;
    } else if (dow.dayOfWeek === "Thursday") {
      return RRule.TH;
    } else if (dow.dayOfWeek === "Friday") {
      return RRule.FR;
    } else if (dow.dayOfWeek === "Saturday") {
      return RRule.SA;
    } else {
      return RRule.SU;
    }
  });
  const start = new Date(officeHour.startDate);
  start.setHours(officeHour.startTime.getHours() + 1);
  start.setMinutes(officeHour.startTime.getMinutes());
  start.setSeconds(officeHour.startTime.getSeconds());
  const end = new Date(officeHour.endDate);
  end.setHours(officeHour.endTime.getHours() + 1);
  end.setMinutes(officeHour.endTime.getMinutes());
  end.setSeconds(officeHour.endTime.getSeconds());
  const rruleSet = new RRuleSet();
  rruleSet.rrule(
    new RRule({
      freq: RRule.WEEKLY,
      interval: 1,
      byweekday: dow,
      dtstart: start,
      until: end,
    })
  );
  officeHour.isCancelledOn.forEach((date) => {
    rruleSet.exdate(date);
  });
  return rruleSet;
};
