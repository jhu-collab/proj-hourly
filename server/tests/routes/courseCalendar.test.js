import supertest from "supertest";
import { it, expect, beforeAll, describe, afterAll, afterEach } from "vitest";
import app from "../../src/index.js";
import prisma from "../../prisma/client.js";
import { weekday } from "../../src/util/courseCalendarValidator.js";
import { Role } from "@prisma/client";
import { createToken } from "../../src/util/helpers.js";
import { create } from "domain";

const request = supertest(app);
const endpoint = "/api/courseCalendar";

let ids = {
  users: [],
  courses: 0,
  calendarEvents: [],
};

function updateIds(field, createdIds) {
  if (field === "users") {
    ids.users = ids.users.concat(createdIds);
  } else if (field === "courses") {
    ids.courses = createdIds[0];
  } else if (field === "calendarEvents") {
    ids.calendarEvents = ids.users.concat(createdIds);
  }
}

function resetIds() {
  ids = {
    users: [],
    courses: [],
    calendarEvents: [],
  };
}

async function setup() {
  await prisma.account.createMany({
    data: [
      {
        // student
        // name: "Test Student I"
        email: "user1@test.io",
        role: Role.User,
        userName: "Test Student I",
      },
      {
        // student
        // name: "Test Student II"
        email: "user2@test.io",
        role: Role.User,
        userName: "Test Student II",
      },
      {
        // student
        // name: "Test Student III"
        email: "user3@test.io",
        role: Role.User,
        userName: "Test Student III",
      },
      {
        // instructor
        // name: "Test Instructor IV"
        email: "user4@test.io",
        role: Role.Admin,
        userName: "Test Instructor I",
      },
    ],
    skipDuplicates: true,
  });

  users = await prisma.account.findMany({
    orderBy: {
      id: "asc",
    },
  });

  // users auth tokens
  const students = (
    await prisma.account.findMany({
      where: {userName: {contains: "Student"}},
    })
    ).map((user) => ({
    ...user,
    token: createToken({user}),
    expiredToken: createToken({user, expiresIn: "0"}),
  }));

  const user = await prisma.account.findMany({
    where: {userName: {contains: "Instructor"}},
  });
  const instructor = {
    ...user,
    token: createToken({ user }),
  };

  const course = await prisma.course.create({
    data: {
      title: "Test Course",
      courseNumber: "0",
      semester: "Fall",
      calendarYear: 2023,
      code: "ABCDEFG",
      iCalJson: undefined,
      startRegConstraint: 48,
      endRegConstraint: 2,
      students: {
        connect: [
          { id: students[0].id },
          { id: students[1].id },
          { id: students[2].id },
        ],
      },
      instructors: {
        connect: {
          id: instructor.id,
        },
      },
    },
    include: {
      instructors: true,
    }
  });

  // create calendar events
  await prisma.calendarEvent.createMany({
    data: [
      {
        value: "Calendar Event I",
        courseId: course.id,
        date: "2023-10-02",
      },
      {
        value: "Calendar Event II",
        courseId: course.id,
        date: "2023-10-04",
      },
      {
        value: "Calendar Event III",
        courseId: course.id,
        date: "2023-10-06",
      },
    ],
  });
  const calendarEvents = await prisma.calendarEvent.findMany({
    where: { value: { contains: "Calendar Event" } },
  });

  updateIds(
    "users",
    students.map((user) => user.id)
  );
  updateIds("users", [instructor.id]);
  updateIds("courses", [course.id]);
  updateIds(
    "calendarEvents",
    calendarEvents.map((calendarEvent) => calendarEvent.id)
  );
  
  return {
    students: students,
    instructor: instructor,
    course: course,
    calendarEvents: calendarEvents,
  };
}

async function teardown() {
  await prisma.calendarEvent.deleteMany({
    where: {
      courseId: ids.courses,
    },
  });
  await prisma.course.deleteMany({
    where: {
      id: ids.courses,
    },
  });
  await prisma.account.deleteMany({
    where: {
      id: {
        in: ids.users,
      },
    },
  });

  await prisma.$disconnect();

  resetIds();
}

describe(`Test endpoint ${endpoint}`, () => {
  describe(`Test POST: ${endpoint}/create`, async () => {
  });

  describe(`Test POST: ${endpoint}/changeRemote`, async () => {
  });

  describe(`Test POST: ${endpoint}/edit`, async () => {
  });

  describe(`Test GET: ${endpoint}/getAllEventsForCourse/:courseId`, async () => {
  });

  describe(`Test GET: ${endpoint}/getAllNotCancelledEventsForCourse/:courseId`, async () => {
  });

  describe(`Test GET: ${endpoint}/getAllCancelledEventsForCourse/:courseId`, async () => {
  });

  describe(`Test POST: ${endpoint}/createEvent`, async () => {
  });

  describe(`Test POST: ${endpoint}/createRecurringEvent`, async () => {
  });

  describe(`Test GET: ${endpoint}/getEventOnDay/:courseId/date/:date`, async () => {
  });

  describe(`Test DELETE: ${endpoint}/deleteCourse/:courseId`, async () => {
  });

  describe(`Test DELETE: ${endpoint}/deleteCourse/:courseId/date/:date`, async () => {
  });
});