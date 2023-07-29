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

// Equivalence Partitioning Map: https://docs.google.com/spreadsheets/d/1RgJwzfZvhTxP1DhYJ5uqjq8Q7btXx3zo1JZutNZkVZQ/edit?usp=sharing

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
    let students = [];
    let instructor = {};
    let courses = {};
    let calendarEvents = [];

    let baseAttributes = {
      title: "title",
      additionalInfo: "description",
      isCancelled: false,
      isRemote: true,
      location: "zoom",
    };

    beforeAll(async () => {
      const params = await setup();
      students = params.students;
      instructor = params.instructor;
      courses = params.course;
      calendarEvents = params.calendarEvents;

      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const twoMonths = new Date(today);
      twoMonths.setMonth(twoMonths.getMonth() + 2);

      baseAttributes = {
        ...baseAttributes,
        begDate: tomorrow,
        endDate: twoMonths,
        daysOfWeek: [
          weekday[tomorrow.getDay()],
          weekday[(tomorrow.getDay() + 1) % 7],
        ],
      };
    });

    afterAll(async() => {
      await teardown();
    });

    it("Return 201 with all valid parameters", async () => {
      const attributes = { ...baseAttributes };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      console.log(response.text);
      expect(response.status).toBe(201);
      const id = response.body.calendarEvent.id;
      updateIds("calendarEvents", [id]);
      const calendarEvent = prisma.calendarEvent.findUniqueOrThrow({ where: { id } });
      expect(calendarEvent).toBeDefined();
    });

    it("Return 400 when course ID is invalid and nonzero", async () => {
      const attributes = { ...baseAttributes, courseId: courses.id * 2 };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when course ID is 0", async () => {
      const attributes = { ...baseAttributes, courseId: 0 };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when Course ID < 0", async () => {
      const attributes = { ...baseAttributes, courseId: -courses.id };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when begDate is a date now", async () => {
      const attributes = {
        ...baseAttributes,
        begDate: new Date(Date.now()).toISOString(),
      };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when begDate is a date in the past", async () => {
      const attributes = {
        ...baseAttributes,
        begDate: "2002-11-05T04:00:00.000",
      };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when endDate is a date now", async () => {
      const attributes = {
        ...baseAttributes,
        endDate: new Date(Date.now()).toISOString(),
      };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when endDate is a date in the past", async () => {
      const attributes = {
        ...baseAttributes,
        endDate: "2002-11-05T04:00:00.000",
      };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when title is empty", async () => {
      const attributes = { ...baseAttributes, title: "", };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when location is empty", async () => {
      const attributes = { ...baseAttributes, location: "", };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 201 when daysOfWeek is a singleton", async () => {
      const attributes = { ...baseAttributes, daysOfWeek: ["Monday"] };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(201);
      const id = response.body.calendarEvent.id;
      updateIds("calendarEvents", [id]);
      const calendarEvent = prisma.calendarEvent.findUniqueOrThrow({ where: { id } });
      expect(calendarEvent).toBeDefined();
    });

    it("Return 400 when daysOfWeek is empty", async () => {
      const attributes = { ...baseAttributes, daysOfWeek: [] };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });
  });

  describe(`Test POST: ${endpoint}/changeCancellation`, async () => {
    let instructor = {};
    let courses = {};
    let calendarEvents = [];

    beforeAll(async () => {
      const params = await setup();
      courses = params.course;
      calendarEvents = params.calendarEvents;

      const mdy = new Date(calendarEvents.begDate)
      .toLocaleString("en-US", { hour12: false })
      .split(" ")[0]
      .split("/");

      baseAttributes = {
        date: mdy[0] + "-" + mdy[1] + "-" + mdy[2].replace(",", ""),
        courseId: courses.id,
      };
    });

    afterAll(async() => {
      await teardown();
    });


    it("Return 201 with all valid parameters", async () => {
      const attributes = { ...baseAttributes };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      console.log(response.text);
      expect(response.status).toBe(201);
      const id = response.body.calendarEvent.id;
      updateIds("calendarEvents", [id]);
      const calendarEvent = prisma.calendarEvent.findUniqueOrThrow({ where: { id } });
      expect(calendarEvent).toBeDefined();
    });

    it("Return 400 when course ID is invalid and nonzero", async () => {
      const attributes = { ...baseAttributes, courseId: courses.id * 2 };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when course ID is 0", async () => {
      const attributes = { ...baseAttributes, courseId: 0 };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when Course ID < 0", async () => {
      const attributes = { ...baseAttributes, courseId: -courses.id };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when date is a date now", async () => {
      const attributes = {
        ...baseAttributes,
        date: new Date(Date.now()).toISOString(),
      };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when date is a date in the past", async () => {
      const attributes = {
        ...baseAttributes,
        date: "2002-11-05T04:00:00.000",
      };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });
  });

  describe(`Test POST: ${endpoint}/changeRemote`, async () => {
    let instructor = {};
    let courses = {};
    let calendarEvents = [];

    beforeAll(async () => {
      const params = await setup();
      courses = params.course;
      calendarEvents = params.calendarEvents;

      const mdy = new Date(calendarEvents.begDate)
      .toLocaleString("en-US", { hour12: false })
      .split(" ")[0]
      .split("/");

      baseAttributes = {
        date: mdy[0] + "-" + mdy[1] + "-" + mdy[2].replace(",", ""),
        courseId: courses.id,
      };
    });

    afterAll(async() => {
      await teardown();
    });


    it("Return 201 with all valid parameters", async () => {
      const attributes = { ...baseAttributes };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      console.log(response.text);
      expect(response.status).toBe(201);
      const id = response.body.calendarEvent.id;
      updateIds("calendarEvents", [id]);
      const calendarEvent = prisma.calendarEvent.findUniqueOrThrow({ where: { id } });
      expect(calendarEvent).toBeDefined();
    });

    it("Return 400 when course ID is invalid and nonzero", async () => {
      const attributes = { ...baseAttributes, courseId: courses.id * 2 };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when course ID is 0", async () => {
      const attributes = { ...baseAttributes, courseId: 0 };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when Course ID < 0", async () => {
      const attributes = { ...baseAttributes, courseId: -courses.id };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when date is a date now", async () => {
      const attributes = {
        ...baseAttributes,
        date: new Date(Date.now()).toISOString(),
      };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when date is a date in the past", async () => {
      const attributes = {
        ...baseAttributes,
        date: "2002-11-05T04:00:00.000",
      };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });
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