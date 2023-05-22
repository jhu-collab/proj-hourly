import supertest from "supertest";
import { it, expect, beforeAll, describe, afterAll, afterEach } from "vitest";
import app from "../../src/index.js";
import prisma from "../../prisma/client.js";
import { weekday } from "../../src/util/officeHourValidator.js";
import { Role } from "@prisma/client";
import { createToken } from "../../src/util/helpers.js";

const request = supertest(app);
const endpoint = "/api/officeHour";

/** Tests written by: William Tong, Mark Tiavises, Aryaman Shohdan
 *  These tests were written using Equivalence Partitioning (EP). You can read about it here: https://jhu-st.github.io/cs422_sp23/slides/lecture6.pdf
 *  The test names are based on the EP Test Requirements for Base Choice Coverage (BCC).
 *    - The base choices are meant to represent partitions that are valid and common for those who use the app.
 *  EP Spreadsheet: https://docs.google.com/spreadsheets/d/1GSCA7QCj_J6x4iDSIZAxy5DT8Pi0Y_PxVI0NmHzaHSc/edit?usp=sharing
 */
let ids = {
  users: [],
  course: 0,
  timeOption: 0,
  topics: [],
  officeHours: [],
  registrations: [],
};

function updateIds(field, createdIds) {
  if (field === "users") {
    ids.users = ids.users.concat(createdIds);
  } else if (field === "courses") {
    ids.course = createdIds[0];
  } else if (field === "topics") {
    ids.topics = ids.users.concat(createdIds);
  } else if (field === "officeHours") {
    ids.officeHours = ids.users.concat(createdIds);
  } else if (field === "registrations") {
    ids.registrations = ids.users.concat(createdIds);
  }
}

function resetIds() {
  ids = {
    users: [],
    courses: [],
    topics: [],
    officeHours: [],
    registrations: [],
  };
}

async function setup() {
  /*** Create
   *  3 student accounts (user)
   *  3 staff accounts (user)
   *  1 instructor account (admin)
   ***/

  await prisma.account.createMany({
    data: [
      {
        userName: "Test Student I",
        email: "student1@test.io",
        role: Role.User,
      },
      {
        userName: "Test Student II",
        email: "student2@test.io",
        role: Role.User,
      },
      {
        userName: "Test Student III",
        email: "student3@test.io",
        role: Role.User,
      },
      {
        userName: "Test Student IV",
        email: "student4@test.io",
        role: Role.User,
      },
      {
        userName: "Test Student V",
        email: "student5@test.io",
        role: Role.User,
      },
      {
        userName: "Test Staff I",
        hashedPassword: "Test Password I",
        email: "staff1@test.io",
        firstName: "Test First Name IV",
        lastName: "Test Last Name IV",
        role: Role.User,
      },
      {
        userName: "Test Staff II",
        email: "staff2@test.io",
        role: Role.User,
      },
      {
        userName: "Test Staff III",
        email: "staff3@test.io",
        role: Role.User,
      },
      {
        userName: "Test Instructor",
        email: "instructor@test.io",
        role: Role.Admin,
      },
    ],
  });

  // Generate and add auth tokens to each user
  const students = (
    await prisma.account.findMany({
      where: { userName: { contains: "Student" } },
    })
  ).map((user) => ({
    ...user,
    token: createToken({ user }),
  }));

  const staff = (
    await prisma.account.findMany({
      where: { userName: { contains: "Staff" } },
    })
  ).map((user) => ({
    ...user,
    token: createToken({ user }),
  }));

  const user = await prisma.account.findFirst({
    where: { userName: "Test Instructor" },
  });
  const instructor = {
    ...user,
    token: createToken({ user }),
  };

  // Create a course with the related students, staff, and instructor
  const course = await prisma.Course.create({
    data: {
      title: "Test Course",
      courseNumber: "1.1.1.1",
      semester: "Fall",
      calendarYear: 2023,
      code: "ABCXYZ",
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
      courseStaff: {
        connect: [
          { id: staff[0].id },
          { id: staff[1].id },
          { id: staff[2].id },
        ],
      },
    },
    include: {
      courseStaff: true,
      instructors: true,
    },
  });

  // Create topics
  await prisma.topic.createMany({
    data: [
      {
        value: "Test Topic I",
        courseId: course.id,
      },
      {
        value: "Test Topic II",
        courseId: course.id,
      },
      {
        value: "Test Topic III",
        courseId: course.id,
      },
    ],
  });
  const topics = await prisma.topic.findMany({
    where: { value: { contains: "Test" } },
  });

  // Create office hours
  const startDate = new Date(); // tomorrow at 10am
  startDate.setDate(startDate.getDate() + 1);
  startDate.setHours(10);
  startDate.setMinutes(0);
  startDate.setSeconds(0);

  const endDate = new Date(); // next month at 1pm
  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setHours(13);
  endDate.setMinutes(0);
  endDate.setSeconds(0);
  const officeHour = await prisma.officeHour.create({
    data: {
      startDate: startDate, // + 1 day
      endDate: endDate,
      course: { connect: { id: course.id } },
      location: "test",
      isRecurring: true,
      hosts: { connect: { id: staff[0].id } },
      isOnDayOfWeek: {
        connect: {
          dayNumber: startDate.getDay() === 0 ? 7 : startDate.getDay(),
        },
      },
    },
    include: {
      registrations: true,
    },
  });

  // Create office hour time options
  await prisma.officeHourTimeOptions.create({
    data: {
      // default duration is 10 minutes
      title: "Test Office Hour Time Option",
      course: {
        connect: { id: course.id },
      },
    },
  });

  // Create registrations
  const regEndTime = new Date(startDate);
  regEndTime.setMinutes(10);
  const registration = await prisma.registration.create({
    data: {
      startTime: startDate,
      endTime: regEndTime, // 10 minutes
      date: startDate,
      officeHour: { connect: { id: officeHour.id } },
      account: { connect: { id: students[0].id } },
    },
  });

  updateIds(
    "users",
    students.map((user) => user.id)
  );
  updateIds(
    "users",
    staff.map((user) => user.id)
  );
  updateIds("users", [instructor.id]);
  updateIds("courses", [course.id]);
  updateIds(
    "topics",
    topics.map((topic) => topic.id)
  );
  updateIds("officeHours", [officeHour.id]);
  updateIds("registrations", [registration.id]);

  return {
    students: students,
    staff: staff,
    instructor: instructor,
    course: course,
    topics: topics,
    officeHour: officeHour,
    registration: registration,
  };
}

async function teardown() {
  // Delete all objects generated for testing
  await prisma.registration.deleteMany({
    where: {
      OR: [
        { id: { in: ids.registrations } },
        { officeHourId: { in: ids.officeHours } },
        { accountId: { in: ids.users } },
      ],
    },
  });
  await prisma.topic.deleteMany({
    where: {
      OR: [{ id: { in: ids.topics } }, { courseId: ids.course }],
    },
  });
  await prisma.officeHour.deleteMany({
    where: {
      courseId: ids.course,
    },
  });
  await prisma.officeHourTimeOptions.deleteMany({
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
  // Tear down the test database by `yarn docker:down`
}

describe(`Test endpoint ${endpoint}`, () => {
  describe(`Test POST: ${endpoint}/create`, async () => {
    let staff = [];
    let instructor = {};
    let course = {};

    let baseAttributes = {
      startTime: "10:30:00",
      endTime: "11:30:00",
      recurringEvent: true,
      timeInterval: 10,
      location: "zoom",
    };

    beforeAll(async () => {
      const params = await setup();
      staff = params.staff;
      instructor = params.instructor;
      course = params.course;

      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      baseAttributes = {
        ...baseAttributes,
        startDate: tomorrow,
        endDate: nextMonth,
        courseId: course.id,
        daysOfWeek: [
          weekday[tomorrow.getDay()],
          weekday[(tomorrow.getDay() + 1) % 7],
        ],
        hosts: staff.map((user) => user.id),
      };
    });

    afterAll(async () => {
      await teardown();
    });

    // Row 1
    it("Return 201 with all valid parameters", async () => {
      const attributes = { ...baseAttributes };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      console.log(response.text);
      expect(response.status).toBe(201);
      const id = response.body.officeHour.id;
      updateIds("officeHours", [id]);
      const officeHour = prisma.officeHour.findUniqueOrThrow({ where: { id } });
      expect(officeHour).toBeDefined();
    });

    // Row 2
    it("Return 400 when course ID is invalid and nonzero", async () => {
      const attributes = { ...baseAttributes, courseId: course.id * 2 };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    // Row 3
    it("Return 400 when course ID is 0", async () => {
      const attributes = { ...baseAttributes, courseId: 0 };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    // Row 4
    it("Return 400 when Course ID < 0", async () => {
      const attributes = { ...baseAttributes, courseId: -course.id };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    // Row 5
    it.skip("start time is a valid PM time", async () => {
      const attributes = { ...baseAttributes, startTime: "18:30:00" };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(201);
      const id = response.body.officeHour.id;
      const officeHour = prisma.officeHour.findUniqueOrThrow({ where: { id } });
      expect(officeHour).toBeDefined();
    });

    // Row 6
    it.skip("start time is an empty string", async () => {
      const attributes = { ...baseAttributes, startTime: "" };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    // Row 7
    it.skip("start time is invalid and non-empty (not a time)", async () => {
      const attributes = { ...baseAttributes, startTime: "Hello World" };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    // Row 8
    it.skip("end time is a valid PM time", async () => {
      const attributes = { ...baseAttributes, endTime: "18:30:00" };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(201);
      const id = response.body.officeHour.id;
      const officeHour = prisma.officeHour.findUniqueOrThrow({ where: { id } });
      expect(officeHour).toBeDefined();
    });

    // Row 9
    it.skip("Return 400 when endTime is empty", async () => {
      const attributes = { ...baseAttributes, endTime: "" };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    // Row 10
    it.skip("Return 400 when endTime is not a time string", async () => {
      const attributes = { ...baseAttributes, endTime: "Hello World" };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    // Row 11
    it("Return 201 when recurringEvent is false", async () => {
      const attributes = { ...baseAttributes, recurringEvent: false };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(201);
      const id = response.body.officeHour.id;
      updateIds("officeHours", [id]);
      const officeHour = await prisma.officeHour.findUniqueOrThrow({
        where: { id },
      });
      expect(officeHour).toBeDefined();
    });

    // Row 12
    it("Return 400 or 201 when start date is now (current time, depends on multiple of 5)", async () => {
      const attributes = {
        ...baseAttributes,
        startDate: new Date(Date.now()).toISOString(),
      };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      if (
        (Math.floor(attributes.endDate - attributes.startDate) / 60000) % 5 !=
        0
      ) {
        expect(response.status).toBe(400);
      } else {
        expect(response.status).toBe(201);
        const id = response.body.officeHour.id;
        updateIds("officeHours", [id]);
        const officeHour = await prisma.officeHour.findUniqueOrThrow({
          where: { id },
        });
        expect(officeHour).toBeDefined();
      }
    });

    // Row 13
    it("Return 201 when start date is a valid date in the past", async () => {
      const yesterday = new Date(baseAttributes.startDate);
      yesterday.setDate(yesterday.getDate() - 2);
      const attributes = { ...baseAttributes, startDate: yesterday };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(201);
      const id = response.body.officeHour.id;
      updateIds("officeHours", [id]);
      const officeHour = await prisma.officeHour.findUniqueOrThrow({
        where: { id },
      });
      expect(officeHour).toBeDefined();
    });

    // Row 14
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

    // Row 15
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

    // Row 16
    // it("Return 400 when timeInterval is 0", async () => {
    //   const attributes = { ...baseAttributes, timeInterval: 0 };
    //   const response = await request
    //     .post(`${endpoint}/create`)
    //     .send(attributes)
    //     .set("Authorization", "Bearer " + instructor.token);
    //   expect(response.status).toBe(400);
    // });

    // // Row 17
    // it("Return 400 when timeInterval is less than 0", async () => {
    //   const attributes = { ...baseAttributes, timeInterval: -5 };
    //   const response = await request
    //     .post(`${endpoint}/create`)
    //     .send(attributes)
    //     .set("Authorization", "Bearer " + instructor.token);
    //   expect(response.status).toBe(409);
    // });

    // Row 18
    it("Return 201 when there is only one host", async () => {
      const attributes = { ...baseAttributes, hosts: [staff[0].id] };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(201);
      const id = response.body.officeHour.id;
      updateIds("officeHours", [id]);
      const officeHour = prisma.officeHour.findUniqueOrThrow({ where: { id } });
      expect(officeHour).toBeDefined();
    });

    // Row 19
    it("Return 400 when there are no hosts", async () => {
      const attributes = { ...baseAttributes, hosts: [] };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    // Row 20
    it("Return 201 when daysOfWeek is a singleton", async () => {
      const attributes = { ...baseAttributes, daysOfWeek: ["Monday"] };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(201);
      const id = response.body.officeHour.id;
      updateIds("officeHours", [id]);
      const officeHour = prisma.officeHour.findUniqueOrThrow({ where: { id } });
      expect(officeHour).toBeDefined();
    });

    // Row 21
    it("Return 400 when daysOfWeek is empty", async () => {
      const attributes = { ...baseAttributes, daysOfWeek: [] };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    // Row 22
    it("Return 400 when location is empty", async () => {
      const attributes = { ...baseAttributes, location: "" };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });
  });

  describe(`Test POST: ${endpoint}/register`, async () => {
    let students = [];
    let officeHour = {};
    let topics = [];
    let baseAttributes = {
      startTime: "12:40:00",
      endTime: "12:50:00",
      question: "Test Question",
    };

    beforeAll(async () => {
      const params = await setup();
      students = params.students;
      officeHour = params.officeHour;
      topics = params.topics;
      const mdy = new Date(officeHour.startDate)
        .toLocaleString("en-US", { hour12: false })
        .split(" ")[0]
        .split("/");

      baseAttributes = {
        ...baseAttributes,
        officeHourId: officeHour.id,
        TopicIds: topics.map((topic) => topic.id),
        date: mdy[0] + "-" + mdy[1] + "-" + mdy[2].replace(",", ""),
      };
    });

    afterAll(async () => {
      await teardown();
    });

    // Row 1
    it("Return 202 when all parameters are valid", async () => {
      const attributes = { ...baseAttributes };
      const response = await request
        .post(`${endpoint}/register`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[1].token);
      expect(response.status).toBe(202);
      const id = response.body.registration.id;
      const registration = await prisma.registration.findUniqueOrThrow({
        where: { id },
      });
      updateIds("registrations", registration.id);
      expect(registration).toBeDefined();
      expect(registration.accountId).toEqual(students[1].id);
      expect(registration.officeHourId).toEqual(officeHour.id);
      await prisma.registration.delete({
        where: {
          id: registration.id,
        },
      });
    });

    // Row 2
    it("Return 400 when officeHourId is a positive integer but the officeHour does not exist", async () => {
      const attributes = { ...baseAttributes, officeHourId: officeHour.id * 2 };
      const response = await request
        .post(`${endpoint}/register`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[1].token);
      expect(response.status).toBe(400);
    });

    // Row 3
    it("Return 400 when officeHourId is 0", async () => {
      const attributes = { ...baseAttributes, officeHourId: 0 };
      const response = await request
        .post(`${endpoint}/register`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[1].token);
      expect(response.status).toBe(400);
    });

    // Row 4
    it("Return 400 when officeHourId is less than 0", async () => {
      const attributes = { ...baseAttributes, officeHourId: -officeHour.id };
      const response = await request
        .post(`${endpoint}/register`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[1].token);
      expect(response.status).toBe(400);
    });

    // Row 5
    it("Return 202 when startTime and endTime are PM", async () => {
      const attributes = {
        ...baseAttributes,
        startTime: "13:00:00",
        endTime: "13:10:00",
      };
      const response = await request
        .post(`${endpoint}/register`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[1].token);
      expect(response.status).toBe(202);
      const id = response.body.registration.id;
      const registration = await prisma.registration.findUniqueOrThrow({
        where: { id },
      });
      updateIds("registrations", registration.id);
      expect(registration).toBeDefined();
      expect(registration.accountId).toEqual(students[1].id);
      expect(registration.officeHourId).toEqual(officeHour.id);
      await prisma.registration.delete({ where: { id: id } });
    });

    // Row 6
    it("Return 409 when startTime is empty", async () => {
      const attributes = { ...baseAttributes, startTime: "" };
      const response = await request
        .post(`${endpoint}/register`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[1].token);
      expect(response.status).toBe(409);
    });

    // Row 7
    it("Return 409 when startTime is not a time string", async () => {
      const attributes = { ...baseAttributes, startTime: "Hello World" };
      const response = await request
        .post(`${endpoint}/register`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[1].token);
      expect(response.status).toBe(409);
    });

    // Row 8
    it("Return 409 when endTime is empty", async () => {
      const attributes = { ...baseAttributes, endTime: "" };
      const response = await request
        .post(`${endpoint}/register`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[1].token);
      expect(response.status).toBe(409);
    });

    // Row 9
    it("Return 409 when endTime is not a time string", async () => {
      const attributes = { ...baseAttributes, endTime: "Hello World" };
      const response = await request
        .post(`${endpoint}/register`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[1].token);
      expect(response.status).toBe(409);
    });

    // Row 10
    it("Return 409 when date is today", async () => {
      const attributes = {
        ...baseAttributes,
        date: new Date(Date.now()).toISOString(),
      };
      const response = await request
        .post(`${endpoint}/register`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[1].token);
      expect(response.status).toBe(400); // will always be outside of range of the scheduled office hour
    });

    // Row 11
    it("Return 403 when date is in the past", async () => {
      const attributes = { ...baseAttributes, date: "2002-11-05T04:00:00.000" };
      const response = await request
        .post(`${endpoint}/register`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[1].token);
      expect(response.status).toBe(400);
    });

    // Row 12
    it("Return 202 when question is empty", async () => {
      const attributes = {
        ...baseAttributes,
        startTime: "12:50:00",
        endTime: "13:00:00",
        question: "",
      };
      const response = await request
        .post(`${endpoint}/register`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[2].token);
      expect(response.status).toBe(202);
      const id = response.body.registration.id;
      const registration = await prisma.registration.findUniqueOrThrow({
        where: { id },
      });
      updateIds("registrations", registration.id);
      expect(registration).toBeDefined();
      expect(registration.accountId).toEqual(students[2].id);
      expect(registration.officeHourId).toEqual(officeHour.id);
    });

    // Row 13
    it("Return 202 when TopicIds is a singleton", async () => {
      const attributes = {
        ...baseAttributes,
        startTime: "13:00:00",
        endTime: "13:10:00",
        TopicIds: [topics[0].id],
      };
      const response = await request
        .post(`${endpoint}/register`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[3].token);
      expect(response.status).toBe(202);
      const id = response.body.registration.id;
      const registration = await prisma.registration.findUniqueOrThrow({
        where: { id },
      });
      updateIds("registrations", registration.id);
      expect(registration).toBeDefined();
      expect(registration.accountId).toEqual(students[3].id);
      expect(registration.officeHourId).toEqual(officeHour.id);
    });

    // Row 14
    it("Return 202 when TopicIds is empty", async () => {
      const attributes = {
        ...baseAttributes,
        startTime: "13:10:00",
        endTime: "13:20:00",
        TopicIds: [],
      };
      const response = await request
        .post(`${endpoint}/register`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[4].token);
      expect(response.status).toBe(202);
      const id = response.body.registration.id;
      const registration = await prisma.registration.findUniqueOrThrow({
        where: { id },
      });
      updateIds("registrations", registration.id);
      expect(registration).toBeDefined();
      expect(registration.accountId).toEqual(students[4].id);
      expect(registration.officeHourId).toEqual(officeHour.id);
    });
  });

  describe(`Test POST: ${endpoint}/cancelOnDate`, async () => {
    let officeHour = {};
    let staff = [];
    let baseAttributes = {};

    beforeAll(async () => {
      const params = await setup();
      officeHour = params.officeHour;
      staff = params.staff;
      const mdy = new Date(officeHour.startDate)
        .toLocaleString("en-US", { hour12: false })
        .split(" ")[0]
        .split("/");

      baseAttributes = {
        ...baseAttributes,
        officeHourId: officeHour.id,
        date: mdy[0] + "-" + mdy[1] + "-" + mdy[2].replace(",", ""),
      };
    });

    afterAll(async () => {
      await teardown();
    });

    afterEach(async () => {
      await prisma.officeHour.update({
        where: {
          id: officeHour.id,
        },
        data: {
          isCancelledOn: [],
        },
      });
    });

    // Row 1
    it("Return 202 with all valid parameters", async () => {
      const attributes = { ...baseAttributes };
      const response = await request
        .post(`${endpoint}/cancelOnDate`)
        .send(attributes)
        .set("Authorization", "Bearer " + staff[0].token);
      expect(response.status).toBe(202);
      const id = response.body.officeHourUpdate.id;
      const officeHour = await prisma.officeHour.findUniqueOrThrow({
        where: { id },
      });
      expect(officeHour).toBeDefined();
      expect(officeHour.isCancelledOn.length).toEqual(1);
    });

    // Row 2
    it("Return 400 when officeHourId is positive but does not exist", async () => {
      const attributes = { ...baseAttributes, officeHourId: officeHour.id * 2 };
      const response = await request
        .post(`${endpoint}/cancelOnDate`)
        .send(attributes)
        .set("Authorization", "Bearer " + staff[0].token);
      expect(response.status).toBe(400);
    });

    // Row 3
    it("Return 400 when officeHourId is 0", async () => {
      const attributes = { ...baseAttributes, officeHourId: 0 };
      const response = await request
        .post(`${endpoint}/cancelOnDate`)
        .send(attributes)
        .set("Authorization", "Bearer " + staff[0].token);
      expect(response.status).toBe(400);
    });

    // Row 4
    it("Return 400 when officeHourId is negative", async () => {
      const attributes = { ...baseAttributes, officeHourId: -officeHour.id };
      const response = await request
        .post(`${endpoint}/cancelOnDate`)
        .send(attributes)
        .set("Authorization", "Bearer " + staff[0].token);
      expect(response.status).toBe(400);
    });

    // Row 5
    it("Return 400 when date is now", async () => {
      const mdy = new Date(Date.now())
        .toLocaleString("en-US", { hour12: false })
        .split(" ")[0]
        .split("/");
      const attributes = {
        ...baseAttributes,
        date: mdy[0] + "-" + mdy[1] + "-" + mdy[2],
      };
      const response = await request
        .post(`${endpoint}/cancelOnDate`)
        .send(attributes)
        .set("Authorization", "Bearer " + staff[0].token);
      expect(response.status).toBe(400);
    });

    // Row 6
    it("Return 400 when date is in the past", async () => {
      const attributes = { ...baseAttributes, date: "01-01-2002" };
      const response = await request
        .post(`${endpoint}/cancelOnDate`)
        .send(attributes)
        .set("Authorization", "Bearer " + staff[0].token);
      expect(response.status).toBe(400);
    });
  });

  describe(`Test POST: ${endpoint}/cancelAll`, async () => {
    let course = {};
    let officeHour = {};
    let staff = [];
    let baseAttributes = {};

    beforeAll(async () => {
      const params = await setup();
      officeHour = params.officeHour;
      staff = params.staff;
      course = params.course;
      const date = new Date(officeHour.startDate);
      date.setDate(date.getDate() + 9); // should cancel 2 office hours
      const dateString = date
        .toLocaleDateString("en-US", { hour12: false })
        .replaceAll("/", "-");
      baseAttributes = {
        ...baseAttributes,
        officeHourId: officeHour.id,
        date: dateString,
      };
    });

    afterAll(async () => {
      await teardown();
    });

    afterEach(async () => {
      await prisma.officeHour.update({
        where: {
          id: officeHour.id,
        },
        data: {
          isCancelledOn: [],
        },
      });
    });

    // Row 1
    it("Return 202 when all parameters are valid", async () => {
      const attributes = { ...baseAttributes };
      const response = await request
        .post(`${endpoint}/cancelAll`)
        .send(attributes)
        .set("Authorization", "Bearer " + staff[0].token)
        .set("id", staff[0].id);
      console.log(response.text);
      expect(response.status).toBe(202);
      const id = response.body.officeHourUpdate.id;
      const officeHour = await prisma.officeHour.findUniqueOrThrow({
        where: { id },
      });
      expect(officeHour).toBeDefined();
      expect(officeHour.isCancelledOn.length).toEqual(2);
    });

    // Row 2
    it("Return 400 when officeHourId is a positive integer but the officeHour does not exist", async () => {
      const attributes = { ...baseAttributes, officeHourId: officeHour.id * 2 };
      const response = await request
        .post(`${endpoint}/cancelAll`)
        .send(attributes)
        .set("Authorization", "Bearer " + staff[0].token);
      expect(response.status).toBe(400);
    });

    // Row 3
    it("Return 400 when officeHourId is 0", async () => {
      const attributes = { ...baseAttributes, officeHourId: 0 };
      const response = await request
        .post(`${endpoint}/cancelAll`)
        .send(attributes)
        .set("Authorization", "Bearer " + staff[0].token);
      expect(response.status).toBe(400);
    });

    // Row 4
    it("Return 400 when officeHourId is less than 0", async () => {
      const attributes = { ...baseAttributes, officeHourId: -officeHour.id };
      const response = await request
        .post(`${endpoint}/cancelAll`)
        .send(attributes)
        .set("Authorization", "Bearer " + staff[0].token);
      expect(response.status).toBe(400);
    });

    // Row 5
    it("Return 409 when date is now", async () => {
      const mdy = new Date(Date.now())
        .toLocaleString("en-US", { hour12: false })
        .split(" ")[0]
        .split("/");
      const attributes = {
        ...baseAttributes,
        date: mdy[0] + "-" + mdy[1] + "-" + mdy[2],
      };
      const response = await request
        .post(`${endpoint}/cancelAll`)
        .send(attributes)
        .set("Authorization", "Bearer " + staff[0].token);
      expect(response.status).toBe(409);
    });

    // Row 6
    it("Return 409 when date is in the past", async () => {
      const attributes = { ...baseAttributes, date: "01-01-2002" };
      const response = await request
        .post(`${endpoint}/cancelAll`)
        .send(attributes)
        .set("Authorization", "Bearer " + staff[0].token);
      expect(response.status).toBe(409);
    });
  });

  describe(`Test POST: ${endpoint}/:officeHourId/editForDate/:date`, async () => {
    let course = {};
    let officeHour = {};
    let staff = [];
    let baseAttributes = {};

    beforeAll(async () => {
      const params = await setup();
      officeHour = params.officeHour;
      staff = params.staff;
      course = params.course;
      const newStartDate = new Date(officeHour.startDate);
      newStartDate.setHours(9);
      const newEndDate = new Date(officeHour.endDate);
      newEndDate.setHours(11);
      baseAttributes = {
        ...baseAttributes,
        startDate: newStartDate,
        endDate: newEndDate,
        location: "zoom",
      };
    });

    afterAll(async () => {
      await teardown();
    });

    afterEach(async () => {
      await prisma.officeHour.update({
        where: {
          id: officeHour.id,
        },
        data: {
          startDate: officeHour.startDate,
          endDate: officeHour.endDate,
          location: officeHour.location,
        },
      });
    });

    // Row 1
    it("Return 202 when all parameters are valid", async () => {
      const mdy = new Date(officeHour.startDate)
        .toLocaleString("en-US", { hour12: false })
        .split(" ")[0]
        .split("/");
      const date = mdy[0] + "-" + mdy[1] + "-" + mdy[2].replace(",", "");
      const attributes = { ...baseAttributes };
      const response = await request
        .post(`${endpoint}/${officeHour.id}/editForDate/${date}`)
        .send(attributes)
        .set("Authorization", "Bearer " + staff[0].token);
      expect(response.status).toBe(202);
      const editedOH = await prisma.officeHour.findFirst({
        where: { id: officeHour.id },
      });
      expect(editedOH).toBeDefined();
      expect(editedOH);
    });

    // Row 2
    it("Return 400 when officeHourId is a positive integer but the officeHour does not exist", async () => {
      const mdy = new Date(officeHour.startDate)
        .toLocaleString("en-US", { hour12: false })
        .split(" ")[0]
        .split("/");
      const date = mdy[0] + "-" + mdy[1] + "-" + mdy[2].replace(",", "");
      const attributes = { ...baseAttributes };
      const response = await request
        .post(`${endpoint}/${officeHour.id * 2}/editForDate/${date}`)
        .send(attributes)
        .set("Authorization", "Bearer " + staff[0].token);
      expect(response.status).toBe(400);
    }, 1000);

    // Row 3
    it("Return 400 when officeHourId is 0", async () => {
      const mdy = new Date(officeHour.startDate)
        .toLocaleString("en-US", { hour12: false })
        .split(" ")[0]
        .split("/");
      const date = mdy[0] + "-" + mdy[1] + "-" + mdy[2].replace(",", "");
      const attributes = { ...baseAttributes };
      const response = await request
        .post(`${endpoint}/0/editForDate/${date}`)
        .send(attributes)
        .set("Authorization", "Bearer " + staff[0].token);
      expect(response.status).toBe(400);
    }, 1000);

    // Row 4
    it("Return 400 when officeHourId is less than 0", async () => {
      const mdy = new Date(officeHour.startDate)
        .toLocaleString("en-US", { hour12: false })
        .split(" ")[0]
        .split("/");
      const date = mdy[0] + "-" + mdy[1] + "-" + mdy[2].replace(",", "");
      const attributes = { ...baseAttributes };
      const response = await request
        .post(`${endpoint}/${-officeHour.id}/editForDate/${date}`)
        .send(attributes)
        .set("Authorization", "Bearer " + staff[0].token);
      expect(response.status).toBe(400);
    }, 1000);

    // Row 5
    it("Return 400 when date is now", async () => {
      const mdy = new Date(Date.now())
        .toLocaleString("en-US", { hour12: false })
        .split(" ")[0]
        .split("/");
      const date = mdy[0] + "-" + mdy[1] + "-" + mdy[2].replace(",", "");
      const attributes = { ...baseAttributes };
      const response = await request
        .post(`${endpoint}/${-officeHour.id}/editForDate/${date}`)
        .send(attributes)
        .set("Authorization", "Bearer " + staff[0].token);
      expect(response.status).toBe(400);
    });

    // Row 6
    it("Return 400 when date is in the past", async () => {
      const date = "01-01-2002";
      const attributes = { ...baseAttributes };
      const response = await request
        .post(`${endpoint}/${-officeHour.id}/editForDate/${date}`)
        .send(attributes)
        .set("Authorization", "Bearer " + staff[0].token);
      expect(response.status).toBe(400);
    });

    // Row 7
    it("Return either 202 or 400 when date is now (depends on 5 minute interval)", async () => {
      const now = new Date(Date.now());
      const end = new Date(baseAttributes.endDate);
      const mdy = new Date(officeHour.startDate)
        .toLocaleString("en-US", { hour12: false })
        .split(" ")[0]
        .split("/");
      const date = mdy[0] + "-" + mdy[1] + "-" + mdy[2].replace(",", "");
      const attributes = { ...baseAttributes, startDate: new Date(Date.now) };
      const response = await request
        .post(`${endpoint}/${officeHour.id}/editForDate/${date}`)
        .send(attributes)
        .set("Authorization", "Bearer " + staff[0].token);
      if ((now.minutes - end.minutes) % 5 == 0) {
        expect(response.status).toBe(202);
      } else {
        expect(response.status).toBe(400);
      }
    });

    // Row 8
    it("Return 202 when startDate is in the past", async () => {
      const mdy = new Date(officeHour.startDate)
        .toLocaleString("en-US", { hour12: false })
        .split(" ")[0]
        .split("/");
      const date = mdy[0] + "-" + mdy[1] + "-" + mdy[2].replace(",", "");
      const attributes = {
        ...baseAttributes,
        startDate: "2003-04-15T15:00:00.000Z",
      };
      const response = await request
        .post(`${endpoint}/${officeHour.id}/editForDate/${date}`)
        .send(attributes)
        .set("Authorization", "Bearer " + staff[0].token);
      expect(response.status).toBe(202);
    });

    // Row 9
    it("Return 400 when endDate is now", async () => {
      const mdy = new Date(officeHour.startDate)
        .toLocaleString("en-US", { hour12: false })
        .split(" ")[0]
        .split("/");
      const date = mdy[0] + "-" + mdy[1] + "-" + mdy[2].replace(",", "");
      const attributes = { ...baseAttributes, startDate: new Date(Date.now) };
      const response = await request
        .post(`${endpoint}/${officeHour.id}/editForDate/${date}`)
        .send(attributes)
        .set("Authorization", "Bearer " + staff[0].token);
      expect(response.status).toBe(400);
    });

    // Row 10
    it("Return 400 when endDate is in the past", async () => {
      const mdy = new Date(officeHour.startDate)
        .toLocaleString("en-US", { hour12: false })
        .split(" ")[0]
        .split("/");
      const date = mdy[0] + "-" + mdy[1] + "-" + mdy[2].replace(",", "");
      const attributes = {
        ...baseAttributes,
        endDate: "2003-04-15T15:00:00.000Z",
      };
      const response = await request
        .post(`${endpoint}/${officeHour.id}/editForDate/${date}`)
        .send(attributes)
        .set("Authorization", "Bearer " + staff[0].token);
      expect(response.status).toBe(400);
    });

    // Row 11
    it("Return 400 when location is empty", async () => {
      const mdy = new Date(officeHour.startDate)
        .toLocaleString("en-US", { hour12: false })
        .split(" ")[0]
        .split("/");
      const date = mdy[0] + "-" + mdy[1] + "-" + mdy[2].replace(",", "");
      const attributes = { ...baseAttributes, location: "" };
      const response = await request
        .post(`${endpoint}/${officeHour.id}/editForDate/${date}`)
        .send(attributes)
        .set("Authorization", "Bearer " + staff[0].token);
      expect(response.status).toBe(400);
    });
  });

  describe(`Test POST: ${endpoint}/:officeHourId/editAll`, async () => {
    let course = {};
    let officeHour = {};
    let staff = [];
    let baseAttributes = {
      location: "zoom",
      daysOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      editAfterDate: true,
    };

    beforeAll(async () => {
      const params = await setup();
      officeHour = params.officeHour;
      staff = params.staff;
      course = params.course;
      const newStartDate = new Date(officeHour.startDate);
      newStartDate.setHours(9);
      const newEndDate = new Date(officeHour.endDate);
      newEndDate.setHours(11);
      baseAttributes = {
        ...baseAttributes,
        startDate: newStartDate,
        endDate: newEndDate,
        endDateOldOfficeHour: officeHour.endDate,
      };
    });

    afterAll(async () => {
      await teardown();
    });

    afterEach(async () => {
      await prisma.officeHour.update({
        where: {
          id: officeHour.id,
        },
        data: {
          startDate: officeHour.startDate,
          endDate: officeHour.endDate,
          location: officeHour.location,
        },
      });
    });

    // Row 1
    it("Return 201 with all valid parameters", async () => {
      const attributes = { ...baseAttributes };
      const response = await request
        .post(`${endpoint}/${officeHour.id}/editAll`)
        .send(attributes)
        .set("Authorization", "Bearer " + staff[0].token);
      expect(response.status).toEqual(202);
    });

    // Row 2
    it("Return 400 when officeHourId is a positive integer but the officeHour does not exist", async () => {
      const attributes = { ...baseAttributes };
      const response = await request
        .post(`${endpoint}/${officeHour.id * 2}/editAll`)
        .send(attributes)
        .set("Authorization", "Bearer " + staff[0].token);
      expect(response.status).toEqual(400);
    });

    // Row 3
    it("Return 400 when officeHourId is 0", async () => {
      const attributes = { ...baseAttributes };
      const response = await request
        .post(`${endpoint}/${0}/editAll`)
        .send(attributes)
        .set("Authorization", "Bearer " + staff[0].token);
      expect(response.status).toEqual(400);
    });

    // Row 4
    it("Return 400 when officeHourId is less than 0", async () => {
      const attributes = { ...baseAttributes };
      const response = await request
        .post(`${endpoint}/${-officeHour.id}/editAll`)
        .send(attributes)
        .set("Authorization", "Bearer " + staff[0].token);
      expect(response.status).toEqual(400);
    });

    // Row 5
    it("Return either 202 or 400 when date is now (depends on 5 minute interval)", async () => {
      const now = new Date(Date.now());
      const end = new Date(baseAttributes.endDate);
      const attributes = { ...baseAttributes, startDate: now.toISOString };
      const response = await request
        .post(`${endpoint}/${officeHour.id}/editAll`)
        .send(attributes)
        .set("Authorization", "Bearer " + staff[0].token);
      if ((now.minutes - end.minutes) % 5 == 0) {
        expect(response.status).toBe(202);
      } else {
        expect(response.status).toBe(400);
      }
    });

    // Row 6
    it("Return 202 when startDate is in the past", async () => {
      const attributes = {
        ...baseAttributes,
        startDate: "2003-04-15T19:00:00.000Z",
      };
      const response = await request
        .post(`${endpoint}/${officeHour.id}/editAll`)
        .send(attributes)
        .set("Authorization", "Bearer " + staff[0].token);
      expect(response.status).toBe(202);
    });

    // Row 7
    it("Return 400 when endDate is now", async () => {
      const now = new Date(Date.now());
      const attributes = { ...baseAttributes, endDate: now.toISOString };
      const response = await request
        .post(`${endpoint}/${officeHour.id}/editAll`)
        .send(attributes)
        .set("Authorization", "Bearer " + staff[0].token);
      expect(response.status).toBe(400);
    });

    // Row 8
    it("Return 400 when endDate is in the past", async () => {
      const attributes = {
        ...baseAttributes,
        endDate: "2003-04-15T19:00:00.000Z",
      };
      const response = await request
        .post(`${endpoint}/${officeHour.id}/editAll`)
        .send(attributes)
        .set("Authorization", "Bearer " + staff[0].token);
      expect(response.status).toBe(400);
    });

    // Row 9
    it("Return 400 when location is an empty string", async () => {
      const attributes = { ...baseAttributes, location: "" };
      const response = await request
        .post(`${endpoint}/${officeHour.id}/editAll`)
        .send(attributes)
        .set("Authorization", "Bearer " + staff[0].token);
      expect(response.status).toBe(400);
    });

    // Row 10
    it("Return 202 when daysOfWeek is a singleton", async () => {
      const startDay = new Date(baseAttributes.startDate).getDay();
      const attributes = {
        ...baseAttributes,
        daysOfWeek: [weekday[startDay % 7]],
      };
      const response = await request
        .post(`${endpoint}/${officeHour.id}/editAll`)
        .send(attributes)
        .set("Authorization", "Bearer " + staff[0].token);
      expect(response.status).toBe(202);
    }, 2000);

    // Row 11
    it("Return 400 when daysOfWeek is empty", async () => {
      const attributes = { ...baseAttributes, daysOfWeek: [] };
      const response = await request
        .post(`${endpoint}/${officeHour.id}/editAll`)
        .send(attributes)
        .set("Authorization", "Bearer " + staff[0].token);
      expect(response.status).toBe(400);
    });

    // Row 12
    it("Return 202 when endDateOldOfficeHour is now", async () => {
      const attributes = {
        ...baseAttributes,
        endDateOldOfficeHour: new Date(Date.now()).toISOString(),
      };
      const response = await request
        .post(`${endpoint}/${officeHour.id}/editAll`)
        .send(attributes)
        .set("Authorization", "Bearer " + staff[0].token);
      expect(response.status).toBe(202);
    });

    // Row 13
    it("Return 202 when endDateOldOfficeHour is in the past", async () => {
      const attributes = {
        ...baseAttributes,
        endDateOldOfficeHour: "2003-04-15T19:00:00.000Z",
      };
      const response = await request
        .post(`${endpoint}/${officeHour.id}/editAll`)
        .send(attributes)
        .set("Authorization", "Bearer " + staff[0].token);
      expect(response.status).toBe(202);
    });

    // Row 14
    it("Return 202 when editAfterDate is false", async () => {
      const attributes = { ...baseAttributes, editAfterDate: false };
      const response = await request
        .post(`${endpoint}/${officeHour.id}/editAll`)
        .send(attributes)
        .set("Authorization", "Bearer " + staff[0].token);
      expect(response.status).toBe(202);
    });
  });

  describe(`Test POST: ${endpoint}/cancelRegistration/:registrationId`, async () => {
    let course = {};
    let registration = {};
    let students = [];

    beforeAll(async () => {
      const params = await setup();
      course = params.course;
      registration = params.registration;
      students = params.students;
    });

    afterAll(async () => {
      await teardown();
    });

    afterEach(async () => {
      await prisma.registration.update({
        where: {
          id: registration.id,
        },
        data: {
          isCancelled: false,
        },
      });
    });

    // Row 1
    it("Return 202 when all parameters are valid", async () => {
      const response = await request
        .post(`${endpoint}/cancelRegistration/${registration.id}`)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(202);
      expect(response.body.registration.isCancelled).toBeTruthy();
    });

    // Row 2
    it("Return 400 when registrationId is a positive integer but the registration does not exist", async () => {
      const response = await request
        .post(`${endpoint}/cancelRegistration/${registration.id * 2}`)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });

    // Row 3
    it("Return 400 when registrationId is 0", async () => {
      const response = await request
        .post(`${endpoint}/cancelRegistration/${0}`)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });

    // Row 4
    it("Return 400 when registrationId is negative", async () => {
      const response = await request
        .post(`${endpoint}/cancelRegistration/${-registration.id}`)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });
  });

  describe(`Test POST: ${endpoint}/editRegistration/:registrationId`, async () => {
    let registration = {};
    let officeHour = {};
    let topics = [];
    let students = [];
    let baseAttributes = {
      question: "Test Question",
    };

    beforeAll(async () => {
      const params = await setup();
      registration = params.registration;
      officeHour = params.officeHour;
      topics = params.topics;
      students = params.students;
      baseAttributes = {
        ...baseAttributes,
        registrationId: registration.id,
        officeHourId: officeHour.id,
        startTime: new Date(registration.startTime)
          .toTimeString()
          .split(" ")[0],
        endTime: new Date(registration.endTime).toTimeString().split(" ")[0],
        date: new Date(officeHour.startDate)
          .toLocaleString("en-US", { hour12: false })
          .split(",")[0]
          .replaceAll("/", "-"),
        TopicIds: topics.map((topic) => topic.id),
      };
    });

    afterAll(async () => {
      await teardown();
    });

    afterEach(async () => {
      await prisma.registration.update({
        where: {
          id: registration.id,
        },
        data: {
          startTime: registration.startTime,
          endTime: registration.endTime,
          date: registration.date,
          TopicIds: registration.TopicIds,
        },
      });
    });

    // Row 1
    it("Return 202 when all parameters are valid", async () => {
      const attributes = { ...baseAttributes };
      const response = await request
        .post(`${endpoint}/editRegistration/${registration.id}`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(202);
    });

    // Row 2
    it("Return 400 when registrationId is a positive integer but the registration does not exist", async () => {
      const attributes = { ...baseAttributes };
      const response = await request
        .post(`${endpoint}/editRegistration/${registration.id * 2}`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });

    // Row 3
    it("Return 400 when registrationId is 0", async () => {
      const attributes = { ...baseAttributes };
      const response = await request
        .post(`${endpoint}/editRegistration/${0}`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });

    // Row 4
    it("Return 400 when registrationId is negative", async () => {
      const attributes = { ...baseAttributes };
      const response = await request
        .post(`${endpoint}/editRegistration/${-registration.id}`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });

    // Row 5
    it("Return 400 when officeHourId is a positive integer but the officeHour does not exist", async () => {
      const attributes = { ...baseAttributes, officeHourId: officeHour.id * 2 };
      const response = await request
        .post(`${endpoint}/editRegistration/${registration.id}`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });

    // Row 6
    it("Return 400 when officeHourId is 0", async () => {
      const attributes = { ...baseAttributes, officeHourId: 0 };
      const response = await request
        .post(`${endpoint}/editRegistration/${registration.id}`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });

    // Row 7
    it("Return 400 when officeHourId is less than 0", async () => {
      const attributes = { ...baseAttributes, officeHourId: -officeHour.id };
      const response = await request
        .post(`${endpoint}/editRegistration/${registration.id}`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });

    // Row 8
    it("Return 202 when startTime and endTime are PM", async () => {
      const attributes = {
        ...baseAttributes,
        startTime: "12:00:00",
        endTime: "12:10:00",
      };
      const response = await request
        .post(`${endpoint}/editRegistration/${registration.id}`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(202);
    });

    // Row 9
    it("Return 409 when startTime is empty", async () => {
      const attributes = { ...baseAttributes, startTime: "" };
      const response = await request
        .post(`${endpoint}/editRegistration/${registration.id}`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(409);
    });

    // Row 10
    it("Return 409 when startTime is not a time string", async () => {
      const attributes = { ...baseAttributes, startTime: "Hello World" };
      const response = await request
        .post(`${endpoint}/editRegistration/${registration.id}`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(409);
    });

    // Row 11
    it("Return 409 when endTime is empty", async () => {
      const attributes = { ...baseAttributes, endTime: "" };
      const response = await request
        .post(`${endpoint}/editRegistration/${registration.id}`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(409);
    });

    // Row 12
    it("Return 409 when endTime is not a time string", async () => {
      const attributes = { ...baseAttributes, endTime: "Hello World" };
      const response = await request
        .post(`${endpoint}/editRegistration/${registration.id}`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(409);
    });

    // Row 13
    it("Return 400 when date is now", async () => {
      const attributes = {
        ...baseAttributes,
        date: new Date()
          .toLocaleString("en-US", { hour12: false })
          .split(",")[0]
          .replaceAll("/", "-"),
      };
      const response = await request
        .post(`${endpoint}/editRegistration/${registration.id}`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });

    // Row 14
    it("Return 400 when date is in the past", async () => {
      const attributes = { ...baseAttributes, date: "2002-01-01" };
      const response = await request
        .post(`${endpoint}/editRegistration/${registration.id}`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });

    // Row 15
    it("Return 202 when question is empty", async () => {
      const attributes = { ...baseAttributes, question: "" };
      const response = await request
        .post(`${endpoint}/editRegistration/${registration.id}`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(202);
    });

    // Row 16
    it("Return 202 when TopicIds is a singleton", async () => {
      const attributes = { ...baseAttributes, TopicIds: [topics[0].id] };
      const response = await request
        .post(`${endpoint}/editRegistration/${registration.id}`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(202);
    });

    // Row 17
    it("Return 202 when TopicIds is empty", async () => {
      const attributes = { ...baseAttributes, TopicIds: [] };
      const response = await request
        .post(`${endpoint}/editRegistration/${registration.id}`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(202);
    });
  });

  /* The remaining tests are for the GET methods and thus we will not use equivalence partitioning */
  describe(`Test GET: ${endpoint}/:officeHourId/getRemainingTimeSlots/:date`, async () => {
    let course = {};
    let officeHour = {};
    let students = [];

    beforeAll(async () => {
      const params = await setup();
      course = params.course;
      officeHour = params.officeHour;
      students = params.students;
    });

    afterAll(async () => {
      await teardown();
    });

    it("Return 202 for valid date", async () => {
      const date = new Date(officeHour.startDate)
        .toLocaleDateString("en-us")
        .replaceAll("/", "-");
      const response = await request
        .get(`${endpoint}/${officeHour.id}/getRemainingTimeSlots/${date}`)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(202);
      expect(response.body.timeSlotsPerType).toBeDefined();
    });

    it("Return 400 for invalid date", async () => {
      const date = new Date(officeHour.startDate);
      date.setDate(date.getDate() + 1);
      const dateString = date.toLocaleDateString("en-us").replaceAll("/", "-");
      const response = await request
        .get(`${endpoint}/${officeHour.id}/getRemainingTimeSlots/${dateString}`)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when officeHourId is invalid", async () => {
      const date = new Date(officeHour.startDate);
      date.setDate(date.getDate() + 1);
      const dateString = date.toLocaleDateString("en-us").replaceAll("/", "-");
      const response = await request
        .get(
          `${endpoint}/${officeHour.id * 2}/getRemainingTimeSlots/${dateString}`
        )
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });
  });

  describe(`Test GET: ${endpoint}/:officeHourId`, async () => {
    let officeHour = {};
    let students = [];

    beforeAll(async () => {
      const params = await setup();
      officeHour = params.officeHour;
      students = params.students;
    });

    afterAll(async () => {
      await teardown();
    });

    it("Return 202 when ID is valid", async () => {
      const response = await request
        .get(`${endpoint}/${officeHour.id}`)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(202);
      expect(response.body.officeHour.id).toEqual(officeHour.id);
    });

    it("Return 400 when ID is invalid", async () => {
      const response = await request
        .get(`${endpoint}/${officeHour.id * 2}`)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });
  });
});
