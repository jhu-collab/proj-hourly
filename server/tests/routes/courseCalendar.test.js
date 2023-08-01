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
  course: 0,
  calendarEvents: [],
};

function updateIds(field, createdIds) {
  if (field === "users") {
    ids.users = ids.users.concat(createdIds);
  } else if (field === "course") {
    ids.course = createdIds[0];
  } else if (field === "calendarEvents") {
    ids.calendarEvents = ids.calendarEvents.concat(createdIds);
  }
}

function resetIds() {
  ids = {
    users: [],
    course: {},
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

  let users = await prisma.account.findMany({
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

  let courseDate = new Date();
  courseDate.setMonth(courseDate.getMonth() + 3);
  let secondCourseDate = new Date(courseDate);
  secondCourseDate.setDay(secondCourseDate.getDay() + 2);
  let thirdCourseDate = new Date(secondCourseDate);
  thirdCourseDate.setDay(thirdCourseDate.getDay() + 2);

  // create calendar events
  await prisma.calendarEvent.createMany({
    data: [
      {
        value: "Calendar Event I",
        courseId: course.id,
        date: courseDate,
      },
      {
        value: "Calendar Event II",
        courseId: course.id,
        date: secondCourseDate,
      },
      {
        value: "Calendar Event III",
        courseId: course.id,
        date: thirdCourseDate,
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
  updateIds("course", [course.id]);
  updateIds(
    "calendarEvents",
    calendarEvents.map((calendarEvent) => calendarEvent)
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
      courseId: ids.course,
    },
  });
  await prisma.course.deleteMany({
    where: {
      id: ids.course,
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
    let instructor = {};
    let course = {};

    let baseAttributes = {};

    beforeAll(async () => {
      const params = await setup();
      instructor = params.instructor;
      course = params.course;

      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const twoMonths = new Date(today);
      twoMonths.setMonth(twoMonths.getMonth() + 2);

      baseAttributes = {
        title: "title",
        additionalInfo: "description",
        isCancelled: false,
        isRemote: true,
        location: "zoom",
        begDate: tomorrow,
        endDate: twoMonths,
        daysOfWeek: [
          weekday[tomorrow.getDay()],
          weekday[(tomorrow.getDay() + 2) % 7],
        ],
      };
    });

    afterAll(async() => {
      await teardown();
    });

    it("Return 201 with all valid parameters", async () => {
      const attributes = { ...baseAttributes };
      const response = await request.post(`${endpoint}/create`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(201);
      // const id = response.body.calendarEvent.id;
      // updateIds("calendarEvents", [id]);
      // const calendarEvent = await prisma.calendarEvent.findUniqueOrThrow({ where: { id } });
      // expect(calendarEvent).toBeDefined();
    });

    it("Return 401 when no authorization token is provided", async () => {
      const response = await request.post(`${endpoint}/$create`).send(attributes);
      expect(response.status).toBe(401);
    });

    it("Return 401 when authorization token is expired", async () => {
      const response = await request.post(`${endpoint}/$create`).send(attributes).set("Authorization", "Bearer " + instructor.expiredToken);
      expect(response.status).toBe(401);
    });

    it("Return 400 when course ID is invalid and nonzero", async () => {
      const attributes = { ...baseAttributes, courseId: course.id * 2 };
      const response = await request.post(`${endpoint}/create`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when course ID is 0", async () => {
      const attributes = { ...baseAttributes, courseId: 0 };
      const response = await request.post(`${endpoint}/create`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when Course ID < 0", async () => {
      const attributes = { ...baseAttributes, courseId: -course.id };
      const response = await request.post(`${endpoint}/create`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when begDate is a date now", async () => {
      const attributes = {
        ...baseAttributes,
        begDate: new Date(Date.now()).toISOString(),
      };
      const response = await request.post(`${endpoint}/create`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when begDate is a date in the past", async () => {
      let pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 3);
      const attributes = {
        ...baseAttributes,
        begDate: pastDate,
      };
      const response = await request.post(`${endpoint}/create`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when endDate is a date now", async () => {
      const attributes = {
        ...baseAttributes,
        endDate: new Date(Date.now()).toISOString(),
      };
      const response = await request.post(`${endpoint}/create`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when endDate is a date in the past", async () => {
      let pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 3);
      const attributes = {
        ...baseAttributes,
        endDate: pastDate,
      };
      const response = await request.post(`${endpoint}/create`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when title is empty", async () => {
      const attributes = { ...baseAttributes, title: "", };
      const response = await request.post(`${endpoint}/create`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when location is empty", async () => {
      const attributes = { ...baseAttributes, location: "", };
      const response = await request.post(`${endpoint}/create`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 201 when isCancelled is true", async () => {
      const attributes = { ...baseAttributes, isCancelled: true };
      const response = await request.post(`${endpoint}/create`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(201);
      const id = response.body.calendarEvent.id;
      // updateIds("calendarEvents", [id]);
      // const calendarEvent = await prisma.calendarEvent.findUniqueOrThrow({
      //   where: { id },
      // });
      // expect(calendarEvent).toBeDefined();
    });

    it("Return 400 when daysOfWeek is empty", async () => {
      const attributes = { ...baseAttributes, daysOfWeek: [] };
      const response = await request.post(`${endpoint}/create`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });
  });

  describe(`Test POST: ${endpoint}/changeCancellation`, async () => {
    let instructor = {};
    let course = {};
    let calendarEvents = [];
    let baseAttributes = {};

    beforeAll(async () => {
      const params = await setup();
      course = params.course;
      calendarEvents = params.calendarEvents;

      baseAttributes = {
        date: calendarEvents[0].date,
        courseId: course.id,
      };
    });

    afterAll(async() => {
      await teardown();
    });


    it("Return 201 with all valid parameters", async () => {
      const attributes = { ...baseAttributes };
      const response = await request.post(`${endpoint}/changeCancellation`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(201);
      const event = response.body.calendarEvent;
      updateIds("calendarEvents", [event]);
      const calendarEvent = await prisma.calendarEvent.findUniqueOrThrow(
        { 
          where: { 
            courseId_date: {
              date: event.date,
              course: event.course.id,
            } 
          } 
        });
      expect(calendarEvent).toBeDefined();
    });

    it("Return 401 when no authorization token is provided", async () => {
      const response = await request.post(`${endpoint}/$changeCancellation`).send(attributes);
      expect(response.status).toBe(401);
    });

    it("Return 401 when authorization token is expired", async () => {
      const response = await request.post(`${endpoint}/$changeCancellation`).send(attributes).set("Authorization", "Bearer " + instructor.expiredToken);
      expect(response.status).toBe(401);
    });

    it("Return 400 when course ID is invalid and nonzero", async () => {
      const attributes = { ...baseAttributes, courseId: course.id * 2 };
      const response = await request.post(`${endpoint}/changeCancellation`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when course ID is 0", async () => {
      const attributes = { ...baseAttributes, courseId: 0 };
      const response = await request.post(`${endpoint}/changeCancellation`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when Course ID < 0", async () => {
      const attributes = { ...baseAttributes, courseId: -course.id };
      const response = await request.post(`${endpoint}/changeCancellation`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when date is a date now", async () => {
      const attributes = {
        ...baseAttributes,
        date: new Date(Date.now()).toISOString(),
      };
      const response = await request.post(`${endpoint}/changeCancellation`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when date is a date in the past", async () => {
      let pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 3);
      const attributes = {
        ...baseAttributes,
        date: pastDate,
      };
      const response = await request.post(`${endpoint}/changeCancellation`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });
  });

  describe(`Test POST: ${endpoint}/changeRemote`, async () => {
    let instructor = {};
    let course = {};
    let calendarEvents = [];
    let baseAttributes = {};

    beforeAll(async () => {
      const params = await setup();
      course = params.course;
      calendarEvents = params.calendarEvents;

      baseAttributes = {
        date: calendarEvents[0].date,
        courseId: course.id,
      };
    });

    afterAll(async() => {
      await teardown();
    });


    it("Return 201 with all valid parameters", async () => {
      const attributes = { ...baseAttributes };
      const response = await request.post(`${endpoint}/changeRemote`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(201);
      const event = response.body.calendarEvent;
      updateIds("calendarEvents", [event]);
      const calendarEvent = await prisma.calendarEvent.findUniqueOrThrow(
        { 
          where: { 
            courseId_date: {
              date: event.date,
              course: event.course.id,
            } 
          } 
        });
      expect(calendarEvent).toBeDefined();
    });

    it("Return 401 when no authorization token is provided", async () => {
      const response = await request.post(`${endpoint}/$changeRemote`).send(attributes);
      expect(response.status).toBe(401);
    });

    it("Return 401 when authorization token is expired", async () => {
      const response = await request.post(`${endpoint}/$changeRemote`).send(attributes).set("Authorization", "Bearer " + instructor.expiredToken);
      expect(response.status).toBe(401);
    });

    it("Return 400 when course ID is invalid and nonzero", async () => {
      const attributes = { ...baseAttributes, courseId: course.id * 2 };
      const response = await request.post(`${endpoint}/changeRemote`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when course ID is 0", async () => {
      const attributes = { ...baseAttributes, courseId: 0 };
      const response = await request.post(`${endpoint}/changeRemote`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when Course ID < 0", async () => {
      const attributes = { ...baseAttributes, courseId: -course.id };
      const response = await request.post(`${endpoint}/changeRemote`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when date is a date now", async () => {
      const attributes = {
        ...baseAttributes,
        date: new Date(Date.now()).toISOString(),
      };
      const response = await request.post(`${endpoint}/changeRemote`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when date is a date in the past", async () => {
      let pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 3);
      const attributes = {
        ...baseAttributes,
        date: pastDate,
      };
      const response = await request.post(`${endpoint}/changeRemote`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });
  });

  describe(`Test POST: ${endpoint}/edit`, async () => {
    let instructor = {};
    let course = {};
    let calendarEvent = {};
    let baseAttributes = {};

    beforeAll(async () => {
      const params = await setup();
      instructor = params.instructor;
      course = params.course;
      calendarEvent = params.calendarEvents;

      const newDate = new Date(calendarEvent.date);
      newDate.setDay(newDate.getDay() + 1);
      baseAttributes = {
        title: "title",
        additionalInfo: "description",
        isCancelled: false,
        isRemote: true,
        location: "zoom",
        newDate: newDate,
        date: calendarEvent.date,
      };
    });

    afterAll(async() => {
      await teardown();
    });

    it("Return 201 with all valid parameters", async () => {
      const attributes = { ...baseAttributes };
      const response = await request.post(`${endpoint}/edit`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(201);
      const event = response.body.calendarEvent;
      updateIds("calendarEvents", [event]);
      const calendarEvent = await prisma.calendarEvent.findUniqueOrThrow(
        { 
          where: { 
            courseId_date: {
              date: event.date,
              course: event.course.id,
            } 
          } 
        });
      expect(calendarEvent).toBeDefined();
    });

    it("Return 401 when no authorization token is provided", async () => {
      const response = await request.post(`${endpoint}/$edit`).send(attributes);
      expect(response.status).toBe(401);
    });

    it("Return 401 when authorization token is expired", async () => {
      const response = await request.post(`${endpoint}/$edit`).send(attributes).set("Authorization", "Bearer " + instructor.expiredToken);
      expect(response.status).toBe(401);
    });

    it("Return 400 when course ID is invalid and nonzero", async () => {
      const attributes = { ...baseAttributes, courseId: course.id * 2 };
      const response = await request.post(`${endpoint}/edit`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when course ID is 0", async () => {
      const attributes = { ...baseAttributes, courseId: 0 };
      const response = await request.post(`${endpoint}/edit`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when Course ID < 0", async () => {
      const attributes = { ...baseAttributes, courseId: -course.id };
      const response = await request.post(`${endpoint}/create`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when date is a date now", async () => {
      const attributes = {
        ...baseAttributes,
        date: new Date(Date.now()).toISOString(),
      };
      const response = await request.post(`${endpoint}/edit`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when date is a date in the past", async () => {
      let pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 3);
      const attributes = {
        ...baseAttributes,
        begDate: pastDate,
      };
      const response = await request.post(`${endpoint}/edit`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when newDate is a date now", async () => {
      const attributes = {
        ...baseAttributes,
        newDate: new Date(Date.now()).toISOString(),
      };
      const response = await request.post(`${endpoint}/edit`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when newDate is a date in the past", async () => {
      let pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 3);
      const attributes = {
        ...baseAttributes,
        newDate: pastDate,
      };
      const response = await request.post(`${endpoint}/edit`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when title is empty", async () => {
      const attributes = { ...baseAttributes, title: "", };
      const response = await request.post(`${endpoint}/edit`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when location is empty", async () => {
      const attributes = { ...baseAttributes, location: "", };
      const response = await request.post(`${endpoint}/edit`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });
  });

  describe(`Test POST: ${endpoint}/createEvent`, async () => {
    let instructor = {};
    let course = {};
    let calendarEvent = [];
    let baseAttributes = {};

    beforeAll(async () => {
      const params = await setup();
      instructor = params.instructor;
      course = params.course;
      calendarEvent = params.calendarEvents;

      const tomorrow = new Date(calendarEvent.date);
      tomorrow.setDate(tomorrow.getDate() + 1);

      baseAttributes = {
        title: "title",
        additionalInfo: "description",
        isRemote: true,
        location: "zoom",
        date: tomorrow,
      };
    });

    afterAll(async() => {
      await teardown();
    });

    it("Return 201 with all valid parameters", async () => {
      const attributes = { ...baseAttributes };
      const response = await request.post(`${endpoint}/createEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(201);
      const event = response.body.calendarEvent;
      updateIds("calendarEvents", [event]);
      const calendarEvent = await prisma.calendarEvent.findUniqueOrThrow(
        { 
          where: { 
            courseId_date: {
              date: event.date,
              course: event.course.id,
            } 
          } 
        });
      expect(calendarEvent).toBeDefined();
    });

    it("Return 401 when no authorization token is provided", async () => {
      const response = await request.post(`${endpoint}/$createEvent`).send(attributes);
      expect(response.status).toBe(401);
    });

    it("Return 401 when authorization token is expired", async () => {
      const response = await request.post(`${endpoint}/$createEvent`).send(attributes).set("Authorization", "Bearer " + instructor.expiredToken);
      expect(response.status).toBe(401);
    });

    it("Return 400 when course ID is invalid and nonzero", async () => {
      const attributes = { ...baseAttributes, courseId: course.id * 2 };
      const response = await request.post(`${endpoint}/createEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when course ID is 0", async () => {
      const attributes = { ...baseAttributes, courseId: 0 };
      const response = await request.post(`${endpoint}/createEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when Course ID < 0", async () => {
      const attributes = { ...baseAttributes, courseId: -course.id };
      const response = await request.post(`${endpoint}/createEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when date is a date now", async () => {
      const attributes = {
        ...baseAttributes,
        date: new Date(Date.now()).toISOString(),
      };
      const response = await request.post(`${endpoint}/createEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when date is a date in the past", async () => {
      let pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 3);
      const attributes = {
        ...baseAttributes,
        date: pastDate,
      };
      const response = await request.post(`${endpoint}/createEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when title is empty", async () => {
      const attributes = { ...baseAttributes, title: "", };
      const response = await request.post(`${endpoint}/createEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when location is empty", async () => {
      const attributes = { ...baseAttributes, location: "", };
      const response = await request.post(`${endpoint}/createEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 201 when isCancelled is true", async () => {
      const attributes = { ...baseAttributes, isCancelled: true };
      const response = await request.post(`${endpoint}/createEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(201);
      const event = response.body.calendarEvent;
      updateIds("calendarEvents", [event]);
      const calendarEvent = await prisma.calendarEvent.findUniqueOrThrow(
        { 
          where: { 
            courseId_date: {
              date: event.date,
              course: event.course.id,
            } 
          } 
        });
      expect(calendarEvent).toBeDefined();
    });
  });

  describe(`Test POST: ${endpoint}/createRecurringEvent`, async () => {
    let instructor = {};
    let course = {};
    let calendarEvents = [];
    let baseAttributes = {};

    beforeAll(async () => {
      const params = await setup();
      instructor = params.instructor;
      course = params.course;
      calendarEvents = params.calendarEvents;

      const tomorrow = new Date(calendarEvents.date);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const twoMonths = new Date(tomorrow);
      twoMonths.setMonth(twoMonths.getMonth() + 2);

      baseAttributes = {
        title: "title",
        additionalInfo: "description",
        isRemote: true,
        isCancelled: false,
        location: "zoom",
        begDate: tomorrow,
        endDate: twoMonths,
        daysOfWeek: [
          weekday[tomorrow.getDay()],
          weekday[(tomorrow.getDay() + 2) % 7],
        ],
      };
    });

    afterAll(async() => {
      await teardown();
    });

    it("Return 201 with all valid parameters", async () => {
      const attributes = { ...baseAttributes };
      const response = await request.post(`${endpoint}/createRecurringEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(201);
      const event = response.body.calendarEvent;
      updateIds("calendarEvents", [event]);
      const calendarEvent = await prisma.calendarEvent.findUniqueOrThrow(
        { 
          where: { 
            courseId_date: {
              date: event.date,
              course: event.course.id,
            } 
          } 
        });
      expect(calendarEvent).toBeDefined();
    });

    it("Return 401 when no authorization token is provided", async () => {
      const response = await request.post(`${endpoint}/$createRecurringEvent`).send(attributes);
      expect(response.status).toBe(401);
    });

    it("Return 401 when authorization token is expired", async () => {
      const response = await request.post(`${endpoint}/$createRecurringEvent`).send(attributes).set("Authorization", "Bearer " + instructor.expiredToken);
      expect(response.status).toBe(401);
    });

    it("Return 400 when course ID is invalid and nonzero", async () => {
      const attributes = { ...baseAttributes, courseId: course.id * 2 };
      const response = await request.post(`${endpoint}/createRecurringEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when course ID is 0", async () => {
      const attributes = { ...baseAttributes, courseId: 0 };
      const response = await request.post(`${endpoint}/createRecurringEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when Course ID < 0", async () => {
      const attributes = { ...baseAttributes, courseId: -course.id };
      const response = await request.post(`${endpoint}/createRecurringEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when begDate is a date now", async () => {
      const attributes = {
        ...baseAttributes,
        begDate: new Date(Date.now()).toISOString(),
      };
      const response = await request.post(`${endpoint}/createRecurringEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when begDate is a date in the past", async () => {
      let pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 3);
      const attributes = {
        ...baseAttributes,
        begDate: pastDate,
      };
      const response = await request.post(`${endpoint}/createRecurringEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when endDate is a date now", async () => {
      const attributes = {
        ...baseAttributes,
        endDate: new Date(Date.now()).toISOString(),
      };
      const response = await request.post(`${endpoint}/createRecurringEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when endDate is a date in the past", async () => {
      let pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 3);
      const attributes = {
        ...baseAttributes,
        endDate: pastDate,
      };
      const response = await request.post(`${endpoint}/createRecurringEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when title is empty", async () => {
      const attributes = { ...baseAttributes, title: "", };
      const response = await request.post(`${endpoint}/createRecurringEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when location is empty", async () => {
      const attributes = { ...baseAttributes, location: "", };
      const response = await request.post(`${endpoint}/createRecurringEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 201 when isCancelled is true", async () => {
      const attributes = { ...baseAttributes, isCancelled: true };
      const response = await request.post(`${endpoint}/createRecurringEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(201);
      const event = response.body.calendarEvent;
      updateIds("calendarEvents", [event]);
      const calendarEvent = await prisma.calendarEvent.findUniqueOrThrow(
        { 
          where: { 
            courseId_date: {
              date: event.date,
              course: event.course.id,
            } 
          } 
        });
      expect(calendarEvent).toBeDefined();
    });

    it("Return 400 when daysOfWeek is empty", async () => {
      const attributes = { ...baseAttributes, daysOfWeek: [] };
      const response = await request.post(`${endpoint}/createRecurringEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });
  });

  describe(`Test DELETE: ${endpoint}/deleteCourse/:courseId`, async () => {
    let instructor = {};
    let course = {};
    let calendarEvents = [];

    beforeAll(async () => {
      const params = await setup();
      instructor = params.instructor;
      course = params.course;
      calendarEvents = params.calendarEvents;
    });

    afterAll(async() => {
      await teardown();
    });

    it("Return 401 when no authorization token is provided", async () => {
      const response = await request.delete(`${endpoint}/deleteCourse/${course.id}`);
      expect(response.status).toBe(401);
    });

    it("Return 401 when authorization token is expired", async () => {
      const response = await request.delete(`${endpoint}/deleteCourse/${course.id}`).set("Authorization", "Bearer " + instructor.expiredToken);
      expect(response.status).toBe(401);
    });

    it("Return 400 when invalid course id is provided", async () => {
      const response = await request.delete(`${endpoint}/deleteCourse/${-course.id}`).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 202 when course events are deleted", async () => {
      let response = await request.delete(`${endpoint}/deleteCourse/${course.id}`).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(202);
    });
  });

  describe(`Test DELETE: ${endpoint}/deleteCourse/:courseId/date/:date`, async () => {
    let instructor = {};
    let course = {};
    let calendarEvents = [];

    beforeAll(async () => {
      const params = await setup();
      instructor = params.instructor;
      course = params.course;
      calendarEvents = params.calendarEvents;
    });

    afterAll(async() => {
      await teardown();
    });

    it("Return 401 when no authorization token is provided", async () => {
      const response = await request.delete(`${endpoint}/deleteCourse/${course.id}/date/${calendarEvents[0].date}`);
      expect(response.status).toBe(401);
    });

    it("Return 401 when authorization token is expired", async () => {
      const response = await request.delete(`${endpoint}/deleteCourse/${course.id}/date/${calendarEvents[0].date}`).set("Authorization", "Bearer " + instructor.expiredToken);
      expect(response.status).toBe(401);
    });

    it("Return 400 when invalid course id is provided", async () => {
      const response = await request.delete(`${endpoint}/deleteCourse/${-course.id}/date/${calendarEvents[0].date}`).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 202 when course event is deleted", async () => {
      let response = await request.delete(`${endpoint}/deleteCourse/${course.id}/date/${calendarEvents[0].date}`).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(202);
    });
  });

  describe(`Test GET: ${endpoint}/getAllEventsForCourse/:courseId`, async () => {
    let course = {};
    let calendarEvents = [];
    let students = [];

    beforeAll(async () => {
      const params = await setup();
      course = params.course;
      calendarEvents = params.calendarEvents;
      students = params.students;
    });

    afterAll(async() => {
      await teardown();
    });

    it("Return 201 with all valid parameters", async () => {
      const response = await request.post(`${endpoint}/getAllEventsForCourse/${course.id}`).set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(201);
      const event = response.body.calendarEvent;
      updateIds("calendarEvents", [event]);
      const calendarEvent = await prisma.calendarEvent.findManyOrTrhwo(
        { 
          where: { 
            courseId_date: {
              date: event.date,
              course: event.course.id,
            } 
          } 
        });
      expect(calendarEvent).toBeDefined();
    });

    it("Return 401 when no authorization token is provided", async () => {
      const response = await request.get(`${endpoint}/getAllEventsForCourse/${course.id}`);
      expect(response.status).toBe(401);
    });

    it("Return 401 when authorization token is expired", async () => {
      const response = await request.get(`${endpoint}/getAllEventsForCourse/${course.id}`).set("Authorization", "Bearer " + students[0].expiredToken);
      expect(response.status).toBe(401);
    });

    it("Return 400 when invalid course id is provided", async () => {
      const response = await request.get(`${endpoint}/getAllEventsForCourse/${course.id * 2}`).set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when no course id is provided", async () => {
      const response = await request.get(`${endpoint}/getAllEventsForCourse/-1`).set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });

    it("Return 403 when user is not in course", async () => {
      const response = await request.get(`${endpoint}/getAllEventsForCourse/${course.id}}`).set("Authorization", "Bearer " + students[2].token);
      expect(response.status).toBe(403);
    });

    it("Return 200 when no body is included", async () => {
      const response = await request.get(`${endpoint}/getAllEventsForCourse/${course.id}}`).set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(202);
    });

  });

  describe(`Test GET: ${endpoint}/getAllNotCancelledEventsForCourse/:courseId`, async () => {
    let course = {};
    let calendarEvents = [];
    let students = [];

    beforeAll(async () => {
      const params = await setup();
      course = params.course;
      calendarEvents = params.calendarEvents;
      students = params.students;
    });

    afterAll(async() => {
      await teardown();
    });

    it("Return 201 with all valid parameters", async () => {
      const response = await request.post(`${endpoint}/getAllNotCancelledEventsForCourse/${course.id}`).set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(201);
      const event = response.body.calendarEvent;
      updateIds("calendarEvents", [event]);
      const calendarEvent = await prisma.calendarEvent.findManyOrTrhwo(
        { 
          where: { 
            courseId_date: {
              date: event.date,
              course: event.course.id,
            } 
          } 
        });
      expect(calendarEvent).toBeDefined();
    });

    it("Return 401 when no authorization token is provided", async () => {
      const response = await request.get(`${endpoint}/getAllNotCancelledEventsForCourse/${course.id}`);
      expect(response.status).toBe(401);
    });

    it("Return 401 when authorization token is expired", async () => {
      const response = await request.get(`${endpoint}/getAllNotCancelledEventsForCourse/${course.id}`).set("Authorization", "Bearer " + students[0].expiredToken);
      expect(response.status).toBe(401);
    });

    it("Return 400 when invalid course id is provided", async () => {
      const response = await request.get(`${endpoint}/getAllNotCancelledEventsForCourse/${course.id * 2}`).set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when no course id is provided", async () => {
      const response = await request.get(`${endpoint}/getAllNotCancelledEventsForCourse/-1`).set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });

    it("Return 403 when user is not in course", async () => {
      const response = await request.get(`${endpoint}/getAllNotCancelledEventsForCourse/${course.id}}`).set("Authorization", "Bearer " + students[2].token);
      expect(response.status).toBe(403);
    });

    it("Return 200 when no body is included", async () => {
      const response = await request.get(`${endpoint}/getAllNotCancelledEventsForCourse/${course.id}}`).set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(202);
    });
  });

  describe(`Test GET: ${endpoint}/getAllCancelledEventsForCourse/:courseId`, async () => {
    let course = {};
    let calendarEvents = [];
    let students = [];

    beforeAll(async () => {
      const params = await setup();
      course = params.course;
      calendarEvents = params.calendarEvents;
      students = params.students;
    });

    afterAll(async() => {
      await teardown();
    });

    it("Return 201 with all valid parameters", async () => {
      const response = await request.post(`${endpoint}/getAllCancelledEventsForCourse/${course.id}`).set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(201);
      const event = response.body.calendarEvent;
      updateIds("calendarEvents", [event]);
      const calendarEvent = await prisma.calendarEvent.findManyOrTrhwo(
        { 
          where: { 
            courseId_date: {
              date: event.date,
              course: event.course.id,
            } 
          } 
        });
      expect(calendarEvent).toBeDefined();
    });

    it("Return 401 when no authorization token is provided", async () => {
      const response = await request.get(`${endpoint}/getAllCancelledEventsForCourse/${course.id}`);
      expect(response.status).toBe(401);
    });

    it("Return 401 when authorization token is expired", async () => {
      const response = await request.get(`${endpoint}/getAllCancelledEventsForCourse/${course.id}`).set("Authorization", "Bearer " + students[0].expiredToken);
      expect(response.status).toBe(401);
    });

    it("Return 400 when invalid course id is provided", async () => {
      const response = await request.get(`${endpoint}/getAllCancelledEventsForCourse/${course.id * 2}`).set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when no course id is provided", async () => {
      const response = await request.get(`${endpoint}/getAllCancelledEventsForCourse/-1`).set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });

    it("Return 403 when user is not in course", async () => {
      const response = await request.get(`${endpoint}/getAllCancelledEventsForCourse/${course.id}}`).set("Authorization", "Bearer " + students[2].token);
      expect(response.status).toBe(403);
    });

    it("Return 200 when no body is included", async () => {
      const response = await request.get(`${endpoint}/getAllCancelledEventsForCourse/${course.id}}`).set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(202);
    });
  });

  describe(`Test GET: ${endpoint}/getEventOnDay/:courseId/date/:date`, async () => {
    let course = {};
    let calendarEvents = [];
    let students = [];

    beforeAll(async () => {
      const params = await setup();
      course = params.course;
      calendarEvents = params.calendarEvents;
      students = params.students;
    });

    afterAll(async() => {
      await teardown();
    });

    it("Return 201 with all valid parameters", async () => {
      const response = await request.post(`${endpoint}/getEventOnDay/${course.id}/date/${calendarEvents[0].date}`).set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(201);
      const event = response.body.calendarEvent;
      updateIds("calendarEvents", [event]);
      const calendarEvent = await prisma.calendarEvent.findManyOrTrhwo(
        { 
          where: { 
            courseId_date: {
              date: event.date,
              course: event.course.id,
            } 
          } 
        });
      expect(calendarEvent).toBeDefined();
    });

    it("Return 401 when no authorization token is provided", async () => {
      const response = await request.get(`${endpoint}/getEventOnDay/${course.id}/date/${calendarEvents[0].date}`);
      expect(response.status).toBe(401);
    });

    it("Return 401 when authorization token is expired", async () => {
      const response = await request.get(`${endpoint}/getEventOnDay/${course.id}/date/${calendarEvents[0].date}`).set("Authorization", "Bearer " + students[0].expiredToken);
      expect(response.status).toBe(401);
    });

    it("Return 400 when invalid course id is provided", async () => {
      const response = await request.get(`${endpoint}/getEventOnDay/${course.id * 2}/date/${calendarEvents[0].date}`).set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when no course id is provided", async () => {
      const response = await request.get(`${endpoint}/getEventOnDay/-1/date/${calendarEvents[0].date}`).set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });

    it("Return 403 when user is not in course", async () => {
      const response = await request.get(`${endpoint}/getEventOnDay/${course.id}/date/${calendarEvents[0].date}`).set("Authorization", "Bearer " + students[2].token);
      expect(response.status).toBe(403);
    });

    it("Return 200 when no body is included", async () => {
      const response = await request.get(`${endpoint}/getEventOnDay/${course.id}/date/${calendarEvents[0].date}`).set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(202);
    });
  });

});