import supertest from "supertest";
import { it, expect, beforeAll, describe, afterAll, afterEach } from "vitest";
import prisma from "../prisma/client.js";
import app from "../src/index.js";
import { Role } from "@prisma/client";
import { createToken } from "../src/util/helpers.js";

/**
 * Per request from Ali, this file attempts to test situations relating to daylight savings (hopefully it's outlawed soon so
 * we don't have to deal with any of this).
 *
 * Daylight Savings: https://www.timeanddate.com/time/dst/transition.html
 * Coordinated Universal Time (UTC): https://www.timeanddate.com/time/aboututc.html
 *
 * Summary:
 *  - There are two different ways of measuring time:
 *    - Daylight Savings Time (DST)
 *    - Standard Time
 *  - DST -> Standard Time (spring forward)
 *    - 2nd Sunday of March 01:59:59 -> 03:00:00
 *  - Standard Time -> DST (fall back)
 *    - 1st Sunday of November 01:59:59 -> 01:00:00
 */

const request = supertest(app);

const endpoint = "/api/officeHour";

let student = {};
let staff = {};
let instructor = {};
let topic = {};
let course = {};
let officeHourTimeOptions = {};
let springForwardDate = new Date();
let springForwardOH = {};
let fallBackDate = new Date();
let fallBackOH = {};

beforeAll(async () => {
  /* Initialize Users */
  student = await prisma.account.create({
    data: {
      userName: "Daylight Savings Student",
      email: "daylightStudent@test.io",
      role: Role.User,
    },
  });
  student = { ...student, token: createToken({ user: student }) };
  staff = await prisma.account.create({
    data: {
      userName: "Daylight Savings Staff",
      email: "daylightStaff@test.io",
      role: Role.User,
    },
  });
  staff = { ...staff, token: createToken({ user: staff }) };
  instructor = await prisma.account.create({
    data: {
      userName: "Daylight Savings Instructor",
      email: "daylightInstructor@test.io",
      role: Role.Admin,
    },
  });
  instructor = { ...instructor, token: createToken({ user: instructor }) };

  /* Initialize Course */
  course = await prisma.course.create({
    data: {
      title: "Daylight Savings",
      courseNumber: "0.0.0.0",
      semester: "Spring",
      calendarYear: 2023,
      code: "XYZABC",
      students: {
        connect: {
          id: student.id,
        },
      },
      instructors: {
        connect: {
          id: instructor.id,
        },
      },
      courseStaff: {
        connect: {
          id: staff.id,
        },
      },
    },
  });

  topic = await prisma.topic.create({
    data: {
      value: "Sunshine Protection Act",
      course: {
        connect: {
          id: course.id,
        },
      },
    },
  });

  await prisma.officeHourTimeOptions.create({
    data: {
      title: "Office Hour Title",
      course: {
        connect: {
          id: course.id,
        },
      },
      duration: 30,
    },
  });

  /* Initialize spring forward */
  springForwardDate.setHours(0);
  springForwardDate.setMinutes(0);
  springForwardDate.setSeconds(0);

  springForwardDate.setMonth(2); // March
  springForwardDate.setDate(1); // March 1
  const springForwardDateDayOfWeek = springForwardDate.getDay(); // day of week of the first day
  const secondSunday = 14 - springForwardDateDayOfWeek; // # of days from March 1 to second Sunday of March
  springForwardDate.setDate(secondSunday + 1); // set the date (of the month) to the second Sunday of March

  const springForwardStartDate = new Date(springForwardDate);
  springForwardStartDate.setDate(springForwardStartDate.getDate() - 7);
  const springForwardEndDate = new Date(springForwardDate);
  springForwardEndDate.setDate(springForwardEndDate.getDate() + 28);
  springForwardOH = await prisma.officeHour.create({
    data: {
      startDate: springForwardStartDate,
      endDate: springForwardEndDate,
      course: {
        connect: {
          id: course.id,
        },
      },
      location: "The Sun",
      isRecurring: true,
      hosts: {
        connect: {
          id: staff.id,
        },
      },
      isOnDayOfWeek: {
        connect: {
          dayNumber: 7, // Sunday
        },
      },
    },
  });

  /* Initialize fall back */
  fallBackDate.setHours(0);
  fallBackDate.setMinutes(0);
  fallBackDate.setSeconds(0);

  fallBackDate.setMonth(10); // November
  fallBackDate.setDate(1); // November 1
  const fallBackDateDayOfWeek = fallBackDate.getDay(); // day of week of the first day
  const firstSunday = 7 - fallBackDateDayOfWeek; // # of days from March 1 to first Sunday of November
  fallBackDate.setDate(firstSunday + 1); // set the date (of the month) to the second Sunday of November

  const fallBackStartDate = new Date(fallBackDate);
  fallBackStartDate.setDate(fallBackStartDate.getDate() - 7);
  const fallBackEndDate = new Date(fallBackDate);
  fallBackEndDate.setDate(fallBackEndDate.getDate() + 28);

  fallBackOH = await prisma.officeHour.create({
    data: {
      startDate: fallBackStartDate,
      endDate: fallBackEndDate,
      course: {
        connect: {
          id: course.id,
        },
      },
      location: "The Sun",
      isRecurring: true,
      hosts: {
        connect: {
          id: staff.id,
        },
      },
      isOnDayOfWeek: {
        connect: {
          dayNumber: 7, // Sunday
        },
      },
    },
  });
});

afterAll(async () => {
  await prisma.topic.deleteMany({
    where: {
      id: topic.id,
    },
  });
  await prisma.registration.deleteMany({
    where: {
      accountId: {
        in: [student.id, staff.id, instructor.id],
      },
    },
  });
  await prisma.officeHour.deleteMany({
    where: {
      id: {
        in: [springForwardOH.id, fallBackOH.id],
      },
    },
  });
  await prisma.officeHourTimeOptions.deleteMany({
    where: {
      courseId: course.id,
    },
  });
  await prisma.course.delete({
    where: {
      id: course.id,
    },
  });
  await prisma.account.deleteMany({
    where: {
      id: {
        in: [student.id, staff.id, instructor.id],
      },
    },
  });
});

describe(`Test office hour creation and registration for daylight savings`, () => {
  it("202 - Register for spring forward day before it springs forward", async () => {
    const attributes = {
      startTime: "05:00:00",
      endTime: "05:30:00",
      question: "Why do we still have daylight savings?",
      officeHourId: springForwardOH.id,
      TopicIds: [topic.id],
      date: springForwardDate.toISOString(),
    };
    const response = await request
      .post(`${endpoint}/register`)
      .send(attributes)
      .set("Authorization", "Bearer " + student.token);
    expect(response.status).toBe(202);
    const id = response.body.id;
    await prisma.registration.delete({
      where: {
        id,
      },
    });
  });
});
