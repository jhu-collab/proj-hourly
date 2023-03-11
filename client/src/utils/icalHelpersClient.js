// import ical from "ical-generator";
// import prisma from "../../prisma/client.js";
// import pkg from "rrule";
// const { RRule } = pkg;


const weekday = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

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
    summary = officeHour.hosts[0].firstName + "'s Office Hours";
  } else {
    summary = "Office Hours";
  }
  return summary;
};

export const getDateStringArray = (arr) => {
  const dates = [];
  arr.forEach((date) => dates.push(date.toISOString()));
  return dates;
};

export const combineTimeAndDate = (time, date) => {
  const newDate = new Date();
  newDate.setFullYear(date.getFullYear());
  newDate.setDate(date.getDate());
  newDate.setMonth(date.getMonth());
  newDate.setHours(time.getHours());
  newDate.setMinutes(time.getMinutes());
  newDate.setSeconds(time.getSeconds());
  return newDate;
};

export const calcDurationString = (startTime, endTime) => {
  if (startTime > endTime) {
    endTime.setDate(endTime.getDate() + 1);
  }
  const diffMilliSeconds = endTime - startTime;
  const diffHours = Math.floor(diffMilliSeconds / 3600000);
  const diffMins = Math.floor((diffMilliSeconds % 3600000) / 60000);
  let timeStr = "";
  if (diffHours < 10) {
    timeStr = timeStr + "0";
  }
  timeStr = timeStr + diffHours + ":";
  if (diffMins < 10) {
    timeStr = timeStr + "0";
  }
  timeStr = timeStr + diffMins;
  return timeStr;
};

export const calcTimeString = (time) => {
  const diffHours = Math.floor(time.getTime() / 3600000);
  const diffMins = Math.floor((time.getTime() % 3600000) / 60000);
  let timeStr = "";
  if (diffHours < 10) {
    timeStr += "0";
  }
  timeStr = timeStr + diffHours + ":";
  if (diffMins < 10) {
    timeStr += "0";
  }
  timeStr = timeStr + diffMins;
  return timeStr;
};

export const convertToDateWithStartTime = (arr, startTime) => {
  let formatted = [];
  arr.forEach((date) => {
    formatted.push(getIsoDate(date) + "T" + calcTimeString(startTime));
  });
  return formatted;
};

export const equalDates = (date1, date2) => {
  return (
    date1.getUTCDate() === date2.getUTCDate() &&
    date1.getUTCMonth() === date2.getUTCMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

export const generateRecurringEventJson = (officeHour) => {
  const indexes = [];
  officeHour.isOnDayOfWeek.forEach((dow) => {
    indexes.push(weekday.indexOf(dow.dayOfWeek));
  });
  indexes.sort();
  const entries = [];
  let i = indexes.indexOf(officeHour.startDate.getDay());
  let start = new Date(
    new Date(officeHour.startDate).toLocaleString("en-US", {
      timezone: "America/New_York",
    })
  );
  const end = new Date(
    new Date(officeHour.endDate).toLocaleString("en-US", {
      timezone: "America/New_York",
    })
  );
  while (start < end) {
    let notCancelled = true;
    for (const date of officeHour.isCancelledOn) {
      if (equalDates(date, start)) {
        notCancelled = false;
        break;
      }
    }
    if (notCancelled) {
      const currEnd = new Date(start);
      currEnd.setUTCHours(end.getUTCHours());
      currEnd.setUTCMinutes(end.getUTCMinutes());
      currEnd.setUTCSeconds(end.getUTCSeconds());
      if (end.getTimezoneOffset() !== start.getTimezoneOffset()) {
        currEnd.setUTCHours(
          currEnd.getUTCHours() +
            (-end.getTimezoneOffset() + start.getTimezoneOffset()) / 60 //handles daylight savings
        );
      }
      if (currEnd < start) {
        currEnd.setUTCDate(currEnd.getUTCDate() + 1);
      }
      entries.push({
        title: generateTitle(officeHour),
        start: start.toISOString(),
        end: currEnd.toISOString(),
        extendedProps: {
          hosts: officeHour.hosts,
          courseId: officeHour.course.id,
          location: officeHour.location,
          id: officeHour.id,
          isRecurring: true,
        },
      });
    }
    let diff = indexes[(i + 1) % indexes.length] - indexes[i % indexes.length];
    if (diff === 0) {
      diff = 7;
    } else if (diff < 0) {
      diff += 7;
    }
    start.setDate(start.getDate() + diff);
    i = (i + 1) % indexes.length;
  }
  return entries;
};

export const generateSingleEventJson = (officeHour) => {
    // console.log(officeHour);
    return {
    id: officeHour.id,
    title: generateTitle(officeHour),
    start: officeHour.startDate,
    end: officeHour.endDate,
    extendedProps: {
      hosts: officeHour.hosts,
      courseId: officeHour.course.id,
      location: officeHour.location,
      id: officeHour.id,
      isRecurring: false,
    },
  };
};



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
//   const end = new Date(officeHour.endDate);
//   return {
//     freq: RRule.WEEKLY,
//     interval: 1,
//     byweekday: dow,
//     dtstart: start,
//     until: end,
//   };
// };
