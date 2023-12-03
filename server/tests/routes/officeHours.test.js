import supertest from "supertest";
import { it, expect, beforeAll, describe, afterAll, afterEach } from "vitest";
import app from "../../src/index.js";
import prisma from "../../prisma/client.js";
import {
  stringToTimeObj,
  weekday,
} from "../../src/util/officeHourValidator.js";
import { Role } from "@prisma/client";
import { createToken } from "../../src/util/helpers.js";
import { editLocationSingleDay } from "../../src/controllers/officeHourController.js";

const request = supertest(app);
const endpoint = "/api/officeHour";

// CHANGE DISABLE_EMAIL_SENDING=true to DISABLE_EMAIL_SENDING=false IN .env.test SERVER FILE BEFORE RUNNING THESE TESTS

let ids = {
  users: [],
  course: 0,
  timeOption: 0,
  topics: [],
  officeHours: [],
  registration: [],
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
  } else if (field === "registration") {
    ids.registration = ids.users.concat(createdIds);
  }
}

function resetIds() {
  ids = {
    users: [],
    courses: [],
    topics: [],
    officeHours: [],
    registration: [],
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
  await prisma.officeHourTimeOptions.create({
    data: {
      course: {
        connect: {
          id: course.id,
        },
      },
      duration: 10,
      title: "test option",
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
      isOnDayOfWeek: true,
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
  const timeOption = await prisma.officeHourTimeOptions.findFirst({
    where: {
      courseId: course.id,
      duration: 10,
    },
  });
  const registration = await prisma.registration.create({
    data: {
      startTime: startDate,
      endTime: regEndTime, // 10 minutes
      date: startDate,
      officeHour: { connect: { id: officeHour.id } },
      account: { connect: { id: students[0].id } },
      officeHourTimeOptions: {
        connect: {
          id: timeOption.id,
        },
      },
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
  updateIds("registration", [registration.id]);

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
  await prisma.registration.deleteMany({});
  await prisma.topic.deleteMany({});
  await prisma.officeHour.deleteMany({});
  await prisma.officeHourTimeOptions.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.account.deleteMany({});

  await prisma.$disconnect();

  resetIds();
  // Tear down the test database by `yarn docker:down`
}

describe(`Test endpoint ${endpoint}`, () => {
  // describe(`Test POST: ${endpoint}/create`, async () => {
  //   let staff = [];
  //   let instructor = {};
  //   let course = {};
  //   let students = [];

  //   let baseAttributes = {
  //     // startTime: "10:30:00",
  //     // endTime: "11:30:00",
  //     recurringEvent: true,
  //     timeInterval: 10,
  //     location: "zoom",
  //     remote: true,
  //   };

  //   beforeAll(async () => {
  //     const params = await setup();
  //     staff = params.staff;
  //     instructor = params.instructor;
  //     course = params.course;
  //     students = params.students;

  //     const today = new Date();
  //     const tomorrow = new Date(today);
  //     tomorrow.setDate(tomorrow.getDate() + 1);
  //     const nextMonth = new Date(today);
  //     nextMonth.setMonth(nextMonth.getMonth() + 1);

  //     baseAttributes = {
  //       ...baseAttributes,
  //       startDate: tomorrow,
  //       endDate: nextMonth,
  //       courseId: course.id,
  //       daysOfWeek: [
  //         weekday[tomorrow.getDay()],
  //         weekday[(tomorrow.getDay() + 1) % 7],
  //       ],
  //       hosts: staff.map((user) => user.id),
  //     };
  //   });

  //   afterAll(async () => {
  //     await teardown();
  //   });

  //   it("Return 201 with all valid parameters", async () => {
  //     const attributes = { ...baseAttributes };
  //     const response = await request
  //       .post(`${endpoint}/create`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(201);
  //     const id = response.body.officeHour.id;
  //     updateIds("officeHours", [id]);
  //     const officeHour = prisma.officeHour.findUniqueOrThrow({ where: { id } });
  //     expect(officeHour).toBeDefined();
  //   });

  //   it("Return 400 when course ID is invalid and nonzero", async () => {
  //     const attributes = { ...baseAttributes, courseId: course.id * 2 };
  //     const response = await request
  //       .post(`${endpoint}/create`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when course ID is 0", async () => {
  //     const attributes = { ...baseAttributes, courseId: 0 };
  //     const response = await request
  //       .post(`${endpoint}/create`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when Course ID < 0", async () => {
  //     const attributes = { ...baseAttributes, courseId: -course.id };
  //     const response = await request
  //       .post(`${endpoint}/create`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 202 when course successfully archived", async () => {
  //     const attributes = { ...baseAttributes, endTime: "Hello World" };
  //     const response = await request
  //       .post(`/api/course/${attributes.courseId}/archiveCourse`)
  //       .set("Authorization", "bearer " + instructor.token);
  //     expect(response.status).toBe(202);
  //   });

  //   it("Return 400 when recurringEvent is false of archivec course", async () => {
  //     const attributes = { ...baseAttributes, recurringEvent: false };
  //     const response = await request
  //       .post(`${endpoint}/create`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 202 when course successfully unarchived", async () => {
  //     const attributes = { ...baseAttributes, endTime: "Hello World" };
  //     const response = await request
  //       .post(`/api/course/${attributes.courseId}/archiveCourse`)
  //       .set("Authorization", "bearer " + instructor.token);
  //     expect(response.status).toBe(202);
  //   });

  //   it("Return 201 when recurringEvent is false", async () => {
  //     const attributes = { ...baseAttributes, recurringEvent: false };
  //     const response = await request
  //       .post(`${endpoint}/create`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(201);
  //     const id = response.body.officeHour.id;
  //     updateIds("officeHours", [id]);
  //     const officeHour = await prisma.officeHour.findUniqueOrThrow({
  //       where: { id },
  //     });
  //     expect(officeHour).toBeDefined();
  //   });

  //   it("Return 400 or 201 when start date is now (current time, depends on multiple of 5)", async () => {
  //     const attributes = {
  //       ...baseAttributes,
  //       startDate: new Date(Date.now()).toISOString(),
  //     };
  //     const response = await request
  //       .post(`${endpoint}/create`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + instructor.token);
  //     if (
  //       (Math.floor(attributes.endDate - attributes.startDate) / 60000) % 5 !=
  //       0
  //     ) {
  //       expect(response.status).toBe(400);
  //     } else {
  //       expect(response.status).toBe(201);
  //       const id = response.body.officeHour.id;
  //       updateIds("officeHours", [id]);
  //       const officeHour = await prisma.officeHour.findUniqueOrThrow({
  //         where: { id },
  //       });
  //       expect(officeHour).toBeDefined();
  //     }
  //   });

  //   // NOTE: test should work and is needed for complete coverage but is getting stuck in course validator isCourseArchived
  //   // the following lines are not returning anything and the test will not timeout
  //   // const course = await prisma.course.findUnique({
  //   //   where: {
  //   //     id: courseId,
  //   //   },
  //   // });
  //   // it("Return 201 when start date is a valid date in the past", async () => {
  //   //   const yesterday = new Date(baseAttributes.startDate);
  //   //   yesterday.setDate(yesterday.getDate() - 2);
  //   //   const attributes = { ...baseAttributes, startDate: yesterday };
  //   //   const response = await request
  //   //     .post(`${endpoint}/create`)
  //   //     .send(attributes)
  //   //     .set("Authorization", "Bearer " + instructor.token);
  //   //   expect(response.status).toBe(201);
  //   //   const id = response.body.officeHour.id;
  //   //   updateIds("officeHours", [id]);
  //   //   const officeHour = await prisma.officeHour.findUniqueOrThrow({
  //   //     where: { id },
  //   //   });
  //   //   expect(officeHour).toBeDefined();
  //   // });

  //   it("Return 400 when endDate is a date now", async () => {
  //     const attributes = {
  //       ...baseAttributes,
  //       endDate: new Date(Date.now()).toISOString(),
  //     };
  //     const response = await request
  //       .post(`${endpoint}/create`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when endDate is a date in the past", async () => {
  //     const attributes = {
  //       ...baseAttributes,
  //       endDate: "2002-11-05T04:00:00.000",
  //     };
  //     const response = await request
  //       .post(`${endpoint}/create`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 201 when there is only one host", async () => {
  //     const attributes = { ...baseAttributes, hosts: [staff[0].id] };
  //     const response = await request
  //       .post(`${endpoint}/create`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(201);
  //     const id = response.body.officeHour.id;
  //     updateIds("officeHours", [id]);
  //     const officeHour = prisma.officeHour.findUniqueOrThrow({ where: { id } });
  //     expect(officeHour).toBeDefined();
  //   });

  //   it("Return 400 when there are no hosts", async () => {
  //     const attributes = { ...baseAttributes, hosts: [] };
  //     const response = await request
  //       .post(`${endpoint}/create`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 403 when there hosts are not in course", async () => {
  //     const attributes = { ...baseAttributes, hosts: [-1] };
  //     const response = await request
  //       .post(`${endpoint}/create`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(403);
  //   });

  //   it("Return 403 when not staff or instructor", async () => {
  //     const attributes = { ...baseAttributes, hosts: [students[0].id] };
  //     const response = await request
  //       .post(`${endpoint}/create`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(403);
  //   });

  //   it("Return 201 when daysOfWeek is a singleton", async () => {
  //     const today = new Date();
  //     const tomorrow = new Date(today);
  //     tomorrow.setDate(tomorrow.getDate() + 1);
  //     const attributes = {
  //       ...baseAttributes,
  //       daysOfWeek: [weekday[tomorrow.getDay()]],
  //     };
  //     const response = await request
  //       .post(`${endpoint}/create`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(201);
  //     const id = response.body.officeHour.id;
  //     updateIds("officeHours", [id]);
  //     const officeHour = prisma.officeHour.findUniqueOrThrow({ where: { id } });
  //     expect(officeHour).toBeDefined();
  //   });

  //   it("Return 400 when daysOfWeek is empty", async () => {
  //     const attributes = { ...baseAttributes, daysOfWeek: [] };
  //     const response = await request
  //       .post(`${endpoint}/create`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when location is empty", async () => {
  //     const attributes = { ...baseAttributes, location: "" };
  //     const response = await request
  //       .post(`${endpoint}/create`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(400);
  //   });
  // });

  // describe(`Test POST: ${endpoint}/register`, async () => {
  //   let students = [];
  //   let instructor = {};
  //   let officeHour = {};
  //   let topics = [];
  //   let timeOption = {};
  //   let baseAttributes = {
  //     startTime: "12:40:00",
  //     endTime: "12:50:00",
  //     question: "Test Question",
  //   };
  //   let studentNotInCourse = {};

  //   beforeAll(async () => {
  //     const params = await setup();
  //     instructor = params.instructor;
  //     students = params.students;
  //     officeHour = params.officeHour;
  //     topics = params.topics;
  //     const mdy = new Date(officeHour.startDate)
  //       .toLocaleString("en-US", { hour12: false })
  //       .split(" ")[0]
  //       .split("/");

  //     timeOption = await prisma.officeHourTimeOptions.findFirst({
  //       where: {
  //         duration: 10,
  //         courseId: officeHour.courseId,
  //       },
  //     });
  //     studentNotInCourse = await prisma.account.create({
  //       data: {
  //         userName: "Test Student Bad",
  //         email: "student_bad@test.io",
  //         role: Role.User,
  //       },
  //     });
  //     studentNotInCourse = {
  //       ...studentNotInCourse,
  //       token: createToken({ user: studentNotInCourse }),
  //     };

  //     baseAttributes = {
  //       ...baseAttributes,
  //       officeHourId: officeHour.id,
  //       TopicIds: topics.map((topic) => topic.id),
  //       date: mdy[0] + "-" + mdy[1] + "-" + mdy[2].replace(",", ""),
  //       timeOptionId: timeOption.id,
  //     };
  //   });

  //   afterAll(async () => {
  //     await teardown();
  //   });

  //   it("Return 202 when course successfully archived", async () => {
  //     const officeHourId = baseAttributes.officeHourId;
  //     const officeHour = await prisma.officeHour.findUnique({
  //       where: {
  //         id: officeHourId,
  //       },
  //     });
  //     const response = await request
  //       .post(`/api/course/${officeHour.courseId}/archiveCourse`)
  //       .set("Authorization", "bearer " + instructor.token);
  //     expect(response.status).toBe(202);
  //   });

  //   it("Return 202 when all parameters are valid", async () => {
  //     const attributes = { ...baseAttributes };
  //     const response = await request
  //       .post(`${endpoint}/register`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + students[1].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 202 when course successfully unarchived", async () => {
  //     const officeHourId = baseAttributes.officeHourId;
  //     const officeHour = await prisma.officeHour.findUnique({
  //       where: {
  //         id: officeHourId,
  //       },
  //     });
  //     const response = await request
  //       .post(`/api/course/${officeHour.courseId}/archiveCourse`)
  //       .set("Authorization", "bearer " + instructor.token);
  //     expect(response.status).toBe(202);
  //   });
  //   it("Return 403 when all parameters are valid but is not within registration constraint", async () => {
  //     const date = new Date(officeHour.startDate);
  //     date.setUTCDate(date.getUTCDate() + 7);
  //     const mdy = date
  //       .toLocaleString("en-US", { hour12: false })
  //       .split(" ")[0]
  //       .split("/");
  //     const attributes = {
  //       ...baseAttributes,
  //       date: mdy[0] + "-" + mdy[1] + "-" + mdy[2].replace(",", ""),
  //     };
  //     const response = await request
  //       .post(`${endpoint}/register`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + students[1].token);
  //     expect(response.status).toBe(403);
  //   });

  //   it("Return 202 when course successfully paused", async () => {
  //     const officeHourId = baseAttributes.officeHourId;
  //     const officeHour = await prisma.officeHour.findUnique({
  //       where: {
  //         id: officeHourId,
  //       },
  //     });
  //     const response = await request
  //       .post(`/api/course/${officeHour.courseId}/pauseCourse`)
  //       .set("Authorization", "bearer " + instructor.token);
  //     expect(response.status).toBe(202);
  //   });

  //   it("Return 400 when all parameters are valid for paused course", async () => {
  //     const attributes = { ...baseAttributes };
  //     const response = await request
  //       .post(`${endpoint}/register`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + students[1].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 202 when course successfully unpaused", async () => {
  //     const officeHourId = baseAttributes.officeHourId;
  //     const officeHour = await prisma.officeHour.findUnique({
  //       where: {
  //         id: officeHourId,
  //       },
  //     });
  //     const response = await request
  //       .post(`/api/course/${officeHour.courseId}/pauseCourse`)
  //       .set("Authorization", "bearer " + instructor.token);
  //     expect(response.status).toBe(202);
  //   });

  //   it("Return 202 when all parameters are valid", async () => {
  //     const attributes = { ...baseAttributes };
  //     const response = await request
  //       .post(`${endpoint}/register`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + students[1].token);
  //     expect(response.status).toBe(202);
  //     const id = response.body.registration.id;
  //     const registration = await prisma.registration.findUniqueOrThrow({
  //       where: { id },
  //     });
  //     updateIds("registration", registration.id);
  //     expect(registration).toBeDefined();
  //     expect(registration.accountId).toEqual(students[1].id);
  //     expect(registration.officeHourId).toEqual(officeHour.id);
  //     await prisma.registration.delete({
  //       where: {
  //         id: registration.id,
  //       },
  //     });
  //   });

  //   it("Return 400 when officeHourId is a positive integer but the officeHour does not exist", async () => {
  //     const attributes = { ...baseAttributes, officeHourId: officeHour.id * 2 };
  //     const response = await request
  //       .post(`${endpoint}/register`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + students[1].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when officeHourId is 0", async () => {
  //     const attributes = { ...baseAttributes, officeHourId: 0 };
  //     const response = await request
  //       .post(`${endpoint}/register`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + students[1].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when officeHourId is less than 0", async () => {
  //     const attributes = { ...baseAttributes, officeHourId: -officeHour.id };
  //     const response = await request
  //       .post(`${endpoint}/register`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + students[1].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when student is not in course", async () => {
  //     const attributes = { ...baseAttributes };
  //     const response = await request
  //       .post(`${endpoint}/register`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + studentNotInCourse.token);
  //     expect(response.status).toBe(403);
  //   });

  //   it("Return 202 when startTime and endTime are PM", async () => {
  //     const attributes = {
  //       ...baseAttributes,
  //       startTime: "13:00:00",
  //       endTime: "13:10:00",
  //     };
  //     const response = await request
  //       .post(`${endpoint}/register`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + students[1].token);
  //     expect(response.status).toBe(202);
  //     const id = response.body.registration.id;
  //     const registration = await prisma.registration.findUniqueOrThrow({
  //       where: { id },
  //     });
  //     updateIds("registration", registration.id);
  //     expect(registration).toBeDefined();
  //     expect(registration.accountId).toEqual(students[1].id);
  //     expect(registration.officeHourId).toEqual(officeHour.id);
  //     await prisma.registration.delete({ where: { id: id } });
  //   });

  //   it("Return 409 when startTime is empty", async () => {
  //     const attributes = { ...baseAttributes, startTime: "" };
  //     const response = await request
  //       .post(`${endpoint}/register`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + students[1].token);
  //     expect(response.status).toBe(409);
  //   });

  //   it("Return 409 when startTime is not a time string", async () => {
  //     const attributes = { ...baseAttributes, startTime: "Hello World" };
  //     const response = await request
  //       .post(`${endpoint}/register`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + students[1].token);
  //     expect(response.status).toBe(409);
  //   });

  //   it("Return 409 when endTime is empty", async () => {
  //     const attributes = { ...baseAttributes, endTime: "" };
  //     const response = await request
  //       .post(`${endpoint}/register`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + students[1].token);
  //     expect(response.status).toBe(409);
  //   });

  //   it("Return 409 when endTime is not a time string", async () => {
  //     const attributes = { ...baseAttributes, endTime: "Hello World" };
  //     const response = await request
  //       .post(`${endpoint}/register`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + students[1].token);
  //     expect(response.status).toBe(409);
  //   });

  //   it("Return 409 when date is today", async () => {
  //     const curr = new Date();
  //     if (curr.getUTCHours() < Math.abs(curr.getTimezoneOffset() / 60)) {
  //       curr.setDate(curr.getDate() - 1);
  //     }
  //     const attributes = {
  //       ...baseAttributes,
  //       date: curr.toISOString().split("T")[0],
  //     };
  //     const response = await request
  //       .post(`${endpoint}/register`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + students[1].token);
  //     expect(response.status).toBe(400); // will always be outside of range of the scheduled office hour
  //   });

  //   it("Return 400 when date is in the past", async () => {
  //     const attributes = { ...baseAttributes, date: "2002-11-05T04:00:00.000" };
  //     const response = await request
  //       .post(`${endpoint}/register`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + students[1].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 202 when question is empty", async () => {
  //     const attributes = {
  //       ...baseAttributes,
  //       startTime: "12:50:00",
  //       endTime: "13:00:00",
  //       question: "",
  //     };
  //     const response = await request
  //       .post(`${endpoint}/register`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + students[2].token);
  //     expect(response.status).toBe(202);
  //     const id = response.body.registration.id;
  //     const registration = await prisma.registration.findUniqueOrThrow({
  //       where: { id },
  //     });
  //     updateIds("registration", registration.id);
  //     expect(registration).toBeDefined();
  //     expect(registration.accountId).toEqual(students[2].id);
  //     expect(registration.officeHourId).toEqual(officeHour.id);
  //   });

  //   it("Return 202 when TopicIds is a singleton", async () => {
  //     const attributes = {
  //       ...baseAttributes,
  //       startTime: "13:00:00",
  //       endTime: "13:10:00",
  //       TopicIds: [topics[0].id],
  //     };
  //     const response = await request
  //       .post(`${endpoint}/register`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + students[1].token);
  //     expect(response.status).toBe(202);
  //     const id = response.body.registration.id;
  //     const registration = await prisma.registration.findUniqueOrThrow({
  //       where: { id },
  //     });
  //     updateIds("registration", registration.id);
  //     expect(registration).toBeDefined();
  //     expect(registration.accountId).toEqual(students[1].id);
  //     expect(registration.officeHourId).toEqual(officeHour.id);
  //   });

  //   it("Return 202 when TopicIds is empty", async () => {
  //     await prisma.registration.deleteMany({
  //       where: {
  //         accountId: students[1].id,
  //       },
  //     });
  //     const attributes = {
  //       ...baseAttributes,
  //       startTime: "13:10:00",
  //       endTime: "13:20:00",
  //       TopicIds: [],
  //     };
  //     const response = await request
  //       .post(`${endpoint}/register`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + students[1].token);
  //     expect(response.status).toBe(202);
  //     const id = response.body.registration.id;
  //     const registration = await prisma.registration.findUniqueOrThrow({
  //       where: { id },
  //     });
  //     updateIds("registration", registration.id);
  //     expect(registration).toBeDefined();
  //     expect(registration.accountId).toEqual(students[1].id);
  //     expect(registration.officeHourId).toEqual(officeHour.id);
  //   });

  //   it("Return 202 when TopicIds is empty", async () => {
  //     await prisma.registration.deleteMany({
  //       where: {
  //         accountId: students[1].id,
  //       },
  //     });
  //     const attributes = {
  //       ...baseAttributes,
  //       startTime: "13:10:00",
  //       endTime: "13:20:00",
  //     };
  //     delete attributes.TopicIds;
  //     const response = await request
  //       .post(`${endpoint}/register`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + students[1].token);
  //     expect(response.status).toBe(202);
  //     const id = response.body.registration.id;
  //     const registration = await prisma.registration.findUniqueOrThrow({
  //       where: { id },
  //     });
  //     updateIds("registration", registration.id);
  //     expect(registration).toBeDefined();
  //     expect(registration.accountId).toEqual(students[1].id);
  //     expect(registration.officeHourId).toEqual(officeHour.id);
  //   });

  //   it("Return 403 when a TopicId is invalid", async () => {
  //     await prisma.registration.deleteMany({
  //       where: {
  //         accountId: students[1].id,
  //       },
  //     });
  //     const attributes = {
  //       ...baseAttributes,
  //       startTime: "13:10:00",
  //       endTime: "13:20:00",
  //       TopicIds: [topics[0].id, -1],
  //     };
  //     const response = await request
  //       .post(`${endpoint}/register`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + students[1].token);
  //     expect(response.status).toBe(403);
  //   });
  // });

  // describe(`Test POST: ${endpoint}/cancelOnDate`, async () => {
  //   let officeHour = {};
  //   let staff = [];
  //   let baseAttributes = {};
  //   let instructor = {};

  //   beforeAll(async () => {
  //     const params = await setup();
  //     instructor = params.instructor;
  //     officeHour = params.officeHour;
  //     staff = params.staff;
  //     const mdy = new Date(officeHour.startDate)
  //       .toLocaleString("en-US", { hour12: false })
  //       .split(" ")[0]
  //       .split("/");

  //     baseAttributes = {
  //       ...baseAttributes,
  //       officeHourId: officeHour.id,
  //       date: mdy[0] + "-" + mdy[1] + "-" + mdy[2].replace(",", ""),
  //     };
  //   });

  //   afterAll(async () => {
  //     await teardown();
  //   });

  //   afterEach(async () => {
  //     await prisma.officeHour.update({
  //       where: {
  //         id: officeHour.id,
  //       },
  //       data: {
  //         isCancelledOn: [],
  //         isDeleted: false,
  //       },
  //     });
  //   });

  //   it("Return 202 when course successfully archived", async () => {
  //     const officeHourId = baseAttributes.officeHourId;
  //     const officeHour = await prisma.officeHour.findUnique({
  //       where: {
  //         id: officeHourId,
  //       },
  //     });
  //     const response = await request
  //       .post(`/api/course/${officeHour.courseId}/archiveCourse`)
  //       .set("Authorization", "bearer " + instructor.token);
  //     expect(response.status).toBe(202);
  //   });

  //   it("Return 400 with all valid parameters of archived course", async () => {
  //     const attributes = { ...baseAttributes };
  //     const response = await request
  //       .post(`${endpoint}/cancelOnDate`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 202 when course successfully unarchived", async () => {
  //     const officeHourId = baseAttributes.officeHourId;
  //     const officeHour = await prisma.officeHour.findUnique({
  //       where: {
  //         id: officeHourId,
  //       },
  //     });
  //     const response = await request
  //       .post(`/api/course/${officeHour.courseId}/archiveCourse`)
  //       .set("Authorization", "bearer " + instructor.token);
  //     expect(response.status).toBe(202);
  //   });

  //   it("Return 202 with all valid parameters", async () => {
  //     const attributes = { ...baseAttributes };
  //     const response = await request
  //       .post(`${endpoint}/cancelOnDate`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(202);
  //     const id = response.body.officeHourUpdate.id;
  //     const officeHour = await prisma.officeHour.findUniqueOrThrow({
  //       where: { id },
  //     });
  //     expect(officeHour).toBeDefined();
  //     expect(officeHour.isCancelledOn.length).toEqual(1);
  //   });

  //   it("Return 400 when officeHourId is positive but does not exist", async () => {
  //     const attributes = { ...baseAttributes, officeHourId: officeHour.id * 2 };
  //     const response = await request
  //       .post(`${endpoint}/cancelOnDate`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when officeHourId is 0", async () => {
  //     const attributes = { ...baseAttributes, officeHourId: 0 };
  //     const response = await request
  //       .post(`${endpoint}/cancelOnDate`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when officeHourId is negative", async () => {
  //     const attributes = { ...baseAttributes, officeHourId: -officeHour.id };
  //     const response = await request
  //       .post(`${endpoint}/cancelOnDate`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when date is now", async () => {
  //     const mdy = new Date(Date.now())
  //       .toLocaleString("en-US", { hour12: false })
  //       .split(" ")[0]
  //       .split("/");
  //     const attributes = {
  //       ...baseAttributes,
  //       date: mdy[0] + "-" + mdy[1] + "-" + mdy[2],
  //     };
  //     const response = await request
  //       .post(`${endpoint}/cancelOnDate`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when date is in the past", async () => {
  //     const attributes = { ...baseAttributes, date: "01-01-2002" };
  //     const response = await request
  //       .post(`${endpoint}/cancelOnDate`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   });
  // });

  // describe(`Test POST: ${endpoint}/cancelAll`, async () => {
  //   let course = {};
  //   let instructor = {};
  //   let officeHour = {};
  //   let staff = [];
  //   let baseAttributes = {};
  //   // recreate test
  //   beforeAll(async () => {
  //     const params = await setup();
  //     officeHour = params.officeHour;
  //     staff = params.staff;
  //     course = params.course;
  //     instructor = params.instructor;
  //     const date = new Date(officeHour.startDate);
  //     date.setDate(date.getDate() + 14); // should cancel 2 office hours
  //     const dateString = date
  //       .toLocaleDateString("en-US", { hour12: false })
  //       .replaceAll("/", "-");
  //     baseAttributes = {
  //       ...baseAttributes,
  //       officeHourId: officeHour.id,
  //       date: dateString,
  //     };
  //   });

  //   afterAll(async () => {
  //     await teardown();
  //   });

  //   afterEach(async () => {
  //     await prisma.officeHour.updateMany({
  //       data: {
  //         isCancelledOn: [],
  //         isDeleted: false,
  //       },
  //     });
  //   });

  //   it("Return 202 when course successfully archived", async () => {
  //     const officeHourId = baseAttributes.officeHourId;
  //     const officeHour = await prisma.officeHour.findUnique({
  //       where: {
  //         id: officeHourId,
  //       },
  //     });
  //     const response = await request
  //       .post(`/api/course/${officeHour.courseId}/archiveCourse`)
  //       .set("Authorization", "bearer " + instructor.token);
  //     expect(response.status).toBe(202);
  //   });

  //   it("Return 400 when all parameters are valid of archived course", async () => {
  //     const attributes = { ...baseAttributes };
  //     const response = await request
  //       .post(`${endpoint}/cancelAll`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token)
  //       .set("id", staff[0].id);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 202 when course successfully unarchived", async () => {
  //     const officeHourId = baseAttributes.officeHourId;
  //     const officeHour = await prisma.officeHour.findUnique({
  //       where: {
  //         id: officeHourId,
  //       },
  //     });
  //     const response = await request
  //       .post(`/api/course/${officeHour.courseId}/archiveCourse`)
  //       .set("Authorization", "bearer " + instructor.token);
  //     expect(response.status).toBe(202);
  //   });

  //   it("Return 202 when all parameters are valid - date after start date", async () => {
  //     const attributes = { ...baseAttributes };
  //     const response = await request
  //       .post(`${endpoint}/cancelAll`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token)
  //       .set("id", staff[0].id);
  //     expect(response.status).toBe(202);
  //     const id = response.body.officeHourUpdate.id;
  //     const officeHour = await prisma.officeHour.findUnique({
  //       where: { id },
  //     });
  //     expect(officeHour).toBeNull();
  //   });

  //   it("Return 400 when officeHourId is a positive integer but the officeHour does not exist", async () => {
  //     const attributes = { ...baseAttributes, officeHourId: officeHour.id * 2 };
  //     const response = await request
  //       .post(`${endpoint}/cancelAll`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when officeHourId is 0", async () => {
  //     const attributes = { ...baseAttributes, officeHourId: 0 };
  //     const response = await request
  //       .post(`${endpoint}/cancelAll`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when officeHourId is less than 0", async () => {
  //     const attributes = { ...baseAttributes, officeHourId: -officeHour.id };
  //     const response = await request
  //       .post(`${endpoint}/cancelAll`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 409 when date is now", async () => {
  //     const mdy = new Date(Date.now())
  //       .toLocaleString("en-US", { hour12: false })
  //       .split(" ")[0]
  //       .split("/");
  //     const attributes = {
  //       ...baseAttributes,
  //       date: mdy[0] + "-" + mdy[1] + "-" + mdy[2],
  //     };
  //     const response = await request
  //       .post(`${endpoint}/cancelAll`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);

  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 409 when date is in the past", async () => {
  //     const attributes = { ...baseAttributes, date: "01-01-2002" };
  //     const response = await request
  //       .post(`${endpoint}/cancelAll`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   });
  // });

  // describe(`Test POST: ${endpoint}/:officeHourId/editForDate/:date`, async () => {
  //   let course = {};
  //   let officeHour = {};
  //   let staff = [];
  //   let baseAttributes = {};
  //   let instructor = {};

  //   beforeAll(async () => {
  //     const params = await setup();
  //     instructor = params.instructor;
  //     officeHour = params.officeHour;
  //     staff = params.staff;
  //     course = params.course;
  //     const newStartDate = new Date(officeHour.startDate);
  //     newStartDate.setHours(9);
  //     const newEndDate = new Date(officeHour.endDate);
  //     newEndDate.setHours(11);
  //     baseAttributes = {
  //       ...baseAttributes,
  //       officeHourId: officeHour.id,
  //       startDate: newStartDate,
  //       endDate: newEndDate,
  //       location: "zoom",
  //     };
  //     await prisma.officeHour.update({
  //       where: {
  //         id: officeHour.id,
  //       },
  //       data: {
  //         isCancelledOn: [],
  //       },
  //     });
  //   });

  //   afterAll(async () => {
  //     await teardown();
  //   });

  //   afterEach(async () => {
  //     await prisma.officeHour.update({
  //       where: {
  //         id: officeHour.id,
  //       },
  //       data: {
  //         startDate: officeHour.startDate,
  //         endDate: officeHour.endDate,
  //         location: officeHour.location,
  //         isCancelledOn: [],
  //         isDeleted: false,
  //         isRecurring: officeHour.isRecurring,
  //       },
  //     });
  //   });

  //   it("Return 202 when course successfully archived", async () => {
  //     const officeHourId = baseAttributes.officeHourId;
  //     const officeHour = await prisma.officeHour.findUnique({
  //       where: {
  //         id: officeHourId,
  //       },
  //     });
  //     const response = await request
  //       .post(`/api/course/${officeHour.courseId}/archiveCourse`)
  //       .set("Authorization", "bearer " + instructor.token);
  //     expect(response.status).toBe(202);
  //   });

  //   it("Return 400 when all parameters are valid of archived course", async () => {
  //     const mdy = new Date(officeHour.startDate)
  //       .toLocaleString("en-US", { hour12: false })
  //       .split(" ")[0]
  //       .split("/");
  //     const date = mdy[0] + "-" + mdy[1] + "-" + mdy[2].replace(",", "");
  //     const attributes = { ...baseAttributes };
  //     const response = await request
  //       .post(`${endpoint}/${officeHour.id}/editForDate/${date}`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 202 when course successfully archived", async () => {
  //     const officeHourId = baseAttributes.officeHourId;
  //     const officeHour = await prisma.officeHour.findUnique({
  //       where: {
  //         id: officeHourId,
  //       },
  //     });
  //     const response = await request
  //       .post(`/api/course/${officeHour.courseId}/archiveCourse`)
  //       .set("Authorization", "bearer " + instructor.token);
  //     expect(response.status).toBe(202);
  //   });

  //   it("Return 202 when all parameters are valid", async () => {
  //     const mdy = new Date(officeHour.startDate)
  //       .toLocaleString("en-US", { hour12: false })
  //       .split(" ")[0]
  //       .split("/");
  //     const date = mdy[0] + "-" + mdy[1] + "-" + mdy[2].replace(",", "");
  //     const attributes = { ...baseAttributes };
  //     const response = await request
  //       .post(`${endpoint}/${officeHour.id}/editForDate/${date}`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(202);
  //     const editedOH = await prisma.officeHour.findFirst({
  //       where: { id: officeHour.id },
  //     });
  //     expect(editedOH).toBeDefined();
  //     expect(editedOH);
  //   });

  //   it("Return 202 when all parameters are valid - non recurring office hour", async () => {
  //     const newOH = await prisma.officeHour.update({
  //       where: {
  //         id: officeHour.id,
  //       },
  //       data: {
  //         isRecurring: false,
  //       },
  //     });
  //     const mdy = new Date(newOH.startDate)
  //       .toLocaleString("en-US", { hour12: false })
  //       .split(" ")[0]
  //       .split("/");
  //     const date = mdy[0] + "-" + mdy[1] + "-" + mdy[2].replace(",", "");
  //     const attributes = {
  //       ...baseAttributes,
  //       officeHourId: newOH.id,
  //       location: "non recurring test",
  //     };
  //     const response = await request
  //       .post(`${endpoint}/${officeHour.id}/editForDate/${date}`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(202);
  //     const editedOH = await prisma.officeHour.findFirst({
  //       where: { id: officeHour.id, location: "non recurring test" },
  //     });
  //     expect(editedOH).toBeDefined();
  //     expect(editedOH);
  //   });

  //   it("Return 400 when officeHourId is a positive integer but the officeHour does not exist", async () => {
  //     const mdy = new Date(officeHour.startDate)
  //       .toLocaleString("en-US", { hour12: false })
  //       .split(" ")[0]
  //       .split("/");
  //     const date = mdy[0] + "-" + mdy[1] + "-" + mdy[2].replace(",", "");
  //     const attributes = { ...baseAttributes };
  //     const response = await request
  //       .post(`${endpoint}/${officeHour.id * 2}/editForDate/${date}`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   }, 1000);

  //   it("Return 400 when officeHourId is 0", async () => {
  //     const mdy = new Date(officeHour.startDate)
  //       .toLocaleString("en-US", { hour12: false })
  //       .split(" ")[0]
  //       .split("/");
  //     const date = mdy[0] + "-" + mdy[1] + "-" + mdy[2].replace(",", "");
  //     const attributes = { ...baseAttributes };
  //     const response = await request
  //       .post(`${endpoint}/0/editForDate/${date}`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   }, 1000);

  //   it("Return 400 when officeHourId is less than 0", async () => {
  //     const mdy = new Date(officeHour.startDate)
  //       .toLocaleString("en-US", { hour12: false })
  //       .split(" ")[0]
  //       .split("/");
  //     const date = mdy[0] + "-" + mdy[1] + "-" + mdy[2].replace(",", "");
  //     const attributes = { ...baseAttributes };
  //     const response = await request
  //       .post(`${endpoint}/${-officeHour.id}/editForDate/${date}`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   }, 1000);

  //   it("Return 400 when date is now", async () => {
  //     const mdy = new Date(Date.now())
  //       .toLocaleString("en-US", { hour12: false })
  //       .split(" ")[0]
  //       .split("/");
  //     const date = mdy[0] + "-" + mdy[1] + "-" + mdy[2].replace(",", "");
  //     const attributes = { ...baseAttributes };
  //     const response = await request
  //       .post(`${endpoint}/${-officeHour.id}/editForDate/${date}`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when date is in the past", async () => {
  //     const date = "01-01-2002";
  //     const attributes = { ...baseAttributes };
  //     const response = await request
  //       .post(`${endpoint}/${-officeHour.id}/editForDate/${date}`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return either 202 or 400 when date is now (depends on 5 minute interval)", async () => {
  //     const now = new Date(Date.now());
  //     const end = new Date(baseAttributes.endDate);
  //     const mdy = new Date(officeHour.startDate)
  //       .toLocaleString("en-US", { hour12: false })
  //       .split(" ")[0]
  //       .split("/");
  //     const date = mdy[0] + "-" + mdy[1] + "-" + mdy[2].replace(",", "");
  //     const attributes = { ...baseAttributes, startDate: new Date(Date.now) };
  //     const response = await request
  //       .post(`${endpoint}/${officeHour.id}/editForDate/${date}`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     if ((now.minutes - end.minutes) % 5 == 0) {
  //       expect(response.status).toBe(202);
  //     } else {
  //       expect(response.status).toBe(400);
  //     }
  //   });

  //   it("Return 202 when startDate is in the past", async () => {
  //     const mdy = new Date(officeHour.startDate)
  //       .toLocaleString("en-US", { hour12: false })
  //       .split(" ")[0]
  //       .split("/");
  //     const date = mdy[0] + "-" + mdy[1] + "-" + mdy[2].replace(",", "");
  //     const attributes = {
  //       ...baseAttributes,
  //       startDate: "2003-04-15T15:00:00.000Z",
  //     };
  //     const response = await request
  //       .post(`${endpoint}/${officeHour.id}/editForDate/${date}`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(202);
  //   });

  //   it("Return 400 when endDate is now", async () => {
  //     const mdy = new Date(officeHour.startDate)
  //       .toLocaleString("en-US", { hour12: false })
  //       .split(" ")[0]
  //       .split("/");
  //     const date = mdy[0] + "-" + mdy[1] + "-" + mdy[2].replace(",", "");
  //     const attributes = { ...baseAttributes, startDate: new Date(Date.now) };
  //     const response = await request
  //       .post(`${endpoint}/${officeHour.id}/editForDate/${date}`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when endDate is in the past", async () => {
  //     const mdy = new Date(officeHour.startDate)
  //       .toLocaleString("en-US", { hour12: false })
  //       .split(" ")[0]
  //       .split("/");
  //     const date = mdy[0] + "-" + mdy[1] + "-" + mdy[2].replace(",", "");
  //     const attributes = {
  //       ...baseAttributes,
  //       endDate: "2003-04-15T15:00:00.000Z",
  //     };
  //     const response = await request
  //       .post(`${endpoint}/${officeHour.id}/editForDate/${date}`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when location is empty", async () => {
  //     const mdy = new Date(officeHour.startDate)
  //       .toLocaleString("en-US", { hour12: false })
  //       .split(" ")[0]
  //       .split("/");
  //     const date = mdy[0] + "-" + mdy[1] + "-" + mdy[2].replace(",", "");
  //     const attributes = { ...baseAttributes, location: "" };
  //     const response = await request
  //       .post(`${endpoint}/${officeHour.id}/editForDate/${date}`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   });
  // });

  // describe(`Test POST: ${endpoint}/:officeHourId/editAll`, async () => {
  //   let course = {};
  //   let officeHour = {};
  //   let staff = [];
  //   let instructor = {};
  //   let baseAttributes = {
  //     location: "zoom",
  //     daysOfWeek: [
  //       "Monday",
  //       "Tuesday",
  //       "Wednesday",
  //       "Thursday",
  //       "Friday",
  //       "Saturday",
  //       "Sunday",
  //     ],
  //     editAfterDate: true,
  //   };

  //   beforeAll(async () => {
  //     const params = await setup();
  //     instructor = params.instructor;
  //     officeHour = params.officeHour;
  //     staff = params.staff;
  //     course = params.course;
  //     const newStartDate = new Date(officeHour.startDate);
  //     newStartDate.setHours(9);
  //     const newEndDate = new Date(officeHour.endDate);
  //     newEndDate.setHours(11);
  //     baseAttributes = {
  //       ...baseAttributes,
  //       officeHourId: officeHour.id,
  //       startDate: newStartDate,
  //       endDate: newEndDate,
  //       endDateOldOfficeHour: officeHour.endDate,
  //     };
  //   });

  //   afterAll(async () => {
  //     await teardown();
  //   });

  //   afterEach(async () => {
  //     await prisma.officeHour.update({
  //       where: {
  //         id: officeHour.id,
  //       },
  //       data: {
  //         startDate: officeHour.startDate,
  //         endDate: officeHour.endDate,
  //         location: officeHour.location,
  //       },
  //     });
  //   });

  //   it("Return 202 when course successfully archived", async () => {
  //     const officeHourId = baseAttributes.officeHourId;
  //     const officeHour = await prisma.officeHour.findUnique({
  //       where: {
  //         id: officeHourId,
  //       },
  //     });
  //     const response = await request
  //       .post(`/api/course/${officeHour.courseId}/archiveCourse`)
  //       .set("Authorization", "bearer " + instructor.token);
  //     expect(response.status).toBe(202);
  //   });

  //   it("Return 400 with all valid parameters of archived course", async () => {
  //     const attributes = { ...baseAttributes };
  //     const response = await request
  //       .post(`${endpoint}/${officeHour.id}/editAll`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toEqual(400);
  //   });

  //   it("Return 202 when course successfully unarchived", async () => {
  //     const officeHourId = baseAttributes.officeHourId;
  //     const officeHour = await prisma.officeHour.findUnique({
  //       where: {
  //         id: officeHourId,
  //       },
  //     });
  //     const response = await request
  //       .post(`/api/course/${officeHour.courseId}/archiveCourse`)
  //       .set("Authorization", "bearer " + instructor.token);
  //     expect(response.status).toBe(202);
  //   });

  //   it("Return 201 with all valid parameters", async () => {
  //     const attributes = { ...baseAttributes };
  //     const response = await request
  //       .post(`${endpoint}/${officeHour.id}/editAll`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toEqual(202);
  //   });

  //   it("Return 400 when officeHourId is a positive integer but the officeHour does not exist", async () => {
  //     const attributes = { ...baseAttributes };
  //     const response = await request
  //       .post(`${endpoint}/${officeHour.id * 2}/editAll`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toEqual(400);
  //   });

  //   it("Return 400 when officeHourId is 0", async () => {
  //     const attributes = { ...baseAttributes };
  //     const response = await request
  //       .post(`${endpoint}/${0}/editAll`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toEqual(400);
  //   });

  //   it("Return 400 when officeHourId is less than 0", async () => {
  //     const attributes = { ...baseAttributes };
  //     const response = await request
  //       .post(`${endpoint}/${-officeHour.id}/editAll`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toEqual(400);
  //   });

  //   it("Return either 202 or 400 when date is now (depends on 5 minute interval)", async () => {
  //     const now = new Date(Date.now());
  //     const end = new Date(baseAttributes.endDate);
  //     const attributes = { ...baseAttributes, startDate: now.toISOString };
  //     const response = await request
  //       .post(`${endpoint}/${officeHour.id}/editAll`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     if ((now.minutes - end.minutes) % 5 == 0) {
  //       expect(response.status).toBe(202);
  //     } else {
  //       expect(response.status).toBe(400);
  //     }
  //   });

  //   it("Return 202 when startDate is in the past", async () => {
  //     const attributes = {
  //       ...baseAttributes,
  //       startDate: "2003-04-15T19:00:00.000Z",
  //     };
  //     const response = await request
  //       .post(`${endpoint}/${officeHour.id}/editAll`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(202);
  //   }, 10000);

  //   it("Return 400 when endDate is now", async () => {
  //     const now = new Date(Date.now());
  //     const attributes = { ...baseAttributes, endDate: now.toISOString };
  //     const response = await request
  //       .post(`${endpoint}/${officeHour.id}/editAll`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when endDate is in the past", async () => {
  //     const attributes = {
  //       ...baseAttributes,
  //       endDate: "2003-04-15T19:00:00.000Z",
  //     };
  //     const response = await request
  //       .post(`${endpoint}/${officeHour.id}/editAll`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when location is an empty string", async () => {
  //     const attributes = { ...baseAttributes, location: "" };
  //     const response = await request
  //       .post(`${endpoint}/${officeHour.id}/editAll`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 202 when daysOfWeek is a singleton", async () => {
  //     const startDay = new Date(baseAttributes.startDate).getDay();
  //     const attributes = {
  //       ...baseAttributes,
  //       daysOfWeek: [weekday[startDay % 7]],
  //     };
  //     const response = await request
  //       .post(`${endpoint}/${officeHour.id}/editAll`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(202);
  //   }, 10000);

  //   it("Return 400 when daysOfWeek is empty", async () => {
  //     const attributes = { ...baseAttributes, daysOfWeek: [] };
  //     const response = await request
  //       .post(`${endpoint}/${officeHour.id}/editAll`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 202 or 400 when endDateOldOfficeHour is now", async () => {
  //     const attributes = {
  //       ...baseAttributes,
  //       endDateOldOfficeHour: new Date(Date.now()).toISOString(),
  //     };
  //     const response = await request
  //       .post(`${endpoint}/${officeHour.id}/editAll`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     if (
  //       new Date(baseAttributes.startDate).getTime() <
  //       new Date(baseAttributes.endDateOldOfficeHour).getTime()
  //     ) {
  //       expect(response.status).toBe(202);
  //     } else {
  //       expect(response.status).toBe(400);
  //     }
  //   }, 10000);

  //   it("Return 202 or 400 when endDateOldOfficeHour is in the past", async () => {
  //     const attributes = {
  //       ...baseAttributes,
  //       endDateOldOfficeHour: "2003-04-15T19:00:00.000Z",
  //     };
  //     const response = await request
  //       .post(`${endpoint}/${officeHour.id}/editAll`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     if (
  //       new Date(baseAttributes.startDate).getTime() <
  //       new Date(baseAttributes.endDateOldOfficeHour).getTime()
  //     ) {
  //       expect(response.status).toBe(202);
  //     } else {
  //       expect(response.status).toBe(400);
  //     }
  //   }, 10000);

  //   it("Return 202 when editAfterDate is false", async () => {
  //     const attributes = { ...baseAttributes, editAfterDate: false };
  //     const response = await request
  //       .post(`${endpoint}/${officeHour.id}/editAll`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     if (
  //       new Date(baseAttributes.startDate).getTime() <
  //       new Date(baseAttributes.endDateOldOfficeHour).getTime()
  //     ) {
  //       expect(response.status).toBe(202);
  //     } else {
  //       expect(response.status).toBe(400);
  //     }
  //   }, 10000);
  // });

  // describe(`Test POST: ${endpoint}/cancelRegistration/:registrationId`, async () => {
  //   let course = {};
  //   let registration = {};
  //   let students = [];
  //   let instructor = {};

  //   beforeAll(async () => {
  //     const params = await setup();
  //     instructor = params.instructor;
  //     course = params.course;
  //     registration = params.registration;
  //     students = params.students;
  //   });

  //   afterAll(async () => {
  //     await teardown();
  //   });

  //   afterEach(async () => {
  //     await prisma.registration.update({
  //       where: {
  //         id: registration.id,
  //       },
  //       data: {
  //         isCancelled: false,
  //         isCancelledStaff: false,
  //       },
  //     });
  //   });

  //   it("Return 202 when course successfully unarchived", async () => {
  //     const response = await request
  //       .post(`/api/course/${course.id}/archiveCourse`)
  //       .set("Authorization", "bearer " + instructor.token);
  //     expect(response.status).toBe(202);
  //   });

  //   it("Return 202 when all parameters are valid", async () => {
  //     const response = await request
  //       .post(`${endpoint}/cancelRegistration/${registration.id}`)
  //       .set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 202 when course successfully unarchived", async () => {
  //     const response = await request
  //       .post(`/api/course/${course.id}/archiveCourse`)
  //       .set("Authorization", "bearer " + instructor.token);
  //     expect(response.status).toBe(202);
  //   });

  //   it("Return 202 when all parameters are valid", async () => {
  //     const response = await request
  //       .post(`${endpoint}/cancelRegistration/${registration.id}`)
  //       .set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(202);
  //     expect(response.body.registration.isCancelled).toBeTruthy();
  //   });

  //   it("Return 400 when registrationId is a positive integer but the registration does not exist", async () => {
  //     const response = await request
  //       .post(`${endpoint}/cancelRegistration/${registration.id * 2}`)
  //       .set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when registrationId is 0", async () => {
  //     const response = await request
  //       .post(`${endpoint}/cancelRegistration/${0}`)
  //       .set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when registrationId is negative", async () => {
  //     const response = await request
  //       .post(`${endpoint}/cancelRegistration/${-registration.id}`)
  //       .set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(400);
  //   });
  // });

  // describe(`Test POST: ${endpoint}/editRegistration/:registrationId`, async () => {
  //   let registration = {};
  //   let officeHour = {};
  //   let topics = [];
  //   let students = [];
  //   let instructor = {};
  //   let baseAttributes = {
  //     question: "Test Question",
  //   };

  //   beforeAll(async () => {
  //     const params = await setup();
  //     instructor = params.instructor;
  //     registration = params.registration;
  //     officeHour = params.officeHour;
  //     topics = params.topics;
  //     students = params.students;
  //     baseAttributes = {
  //       ...baseAttributes,
  //       registrationId: registration.id,
  //       officeHourId: officeHour.id,
  //       startTime: new Date(registration.startTime)
  //         .toTimeString()
  //         .split(" ")[0],
  //       endTime: new Date(registration.endTime).toTimeString().split(" ")[0],
  //       date: new Date(officeHour.startDate)
  //         .toLocaleString("en-US", { hour12: false })
  //         .split(",")[0]
  //         .replaceAll("/", "-"),
  //       TopicIds: topics.map((topic) => topic.id),
  //     };
  //   });

  //   afterAll(async () => {
  //     await teardown();
  //   });

  //   afterEach(async () => {
  //     await prisma.registration.update({
  //       where: {
  //         id: registration.id,
  //       },
  //       data: {
  //         startTime: registration.startTime,
  //         endTime: registration.endTime,
  //         date: registration.date,
  //         TopicIds: registration.TopicIds,
  //         isCancelled: false,
  //         isCancelledStaff: false,
  //       },
  //     });
  //   });

  //   it("Return 202 when course successfully archived", async () => {
  //     const officeHourId = baseAttributes.officeHourId;
  //     const officeHour = await prisma.officeHour.findUnique({
  //       where: {
  //         id: officeHourId,
  //       },
  //     });
  //     const response = await request
  //       .post(`/api/course/${officeHour.courseId}/archiveCourse`)
  //       .set("Authorization", "bearer " + instructor.token);
  //     expect(response.status).toBe(202);
  //   });

  //   it("Return 400 when all parameters are valid of archived course", async () => {
  //     const attributes = { ...baseAttributes };
  //     const response = await request
  //       .post(`${endpoint}/editRegistration/${registration.id}`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 202 when course successfully archived", async () => {
  //     const officeHourId = baseAttributes.officeHourId;
  //     const officeHour = await prisma.officeHour.findUnique({
  //       where: {
  //         id: officeHourId,
  //       },
  //     });
  //     const response = await request
  //       .post(`/api/course/${officeHour.courseId}/archiveCourse`)
  //       .set("Authorization", "bearer " + instructor.token);
  //     expect(response.status).toBe(202);
  //   });

  //   it("Return 202 when all parameters are valid", async () => {
  //     const attributes = { ...baseAttributes };
  //     const response = await request
  //       .post(`${endpoint}/editRegistration/${registration.id}`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(202);
  //   });

  //   it("Return 400 when registrationId is a positive integer but the registration does not exist", async () => {
  //     const attributes = { ...baseAttributes };
  //     const response = await request
  //       .post(`${endpoint}/editRegistration/${registration.id * 2}`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when registrationId is 0", async () => {
  //     const attributes = { ...baseAttributes };
  //     const response = await request
  //       .post(`${endpoint}/editRegistration/${0}`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when registrationId is negative", async () => {
  //     const attributes = { ...baseAttributes };
  //     const response = await request
  //       .post(`${endpoint}/editRegistration/${-registration.id}`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when officeHourId is a positive integer but the officeHour does not exist", async () => {
  //     const attributes = { ...baseAttributes, officeHourId: officeHour.id * 2 };
  //     const response = await request
  //       .post(`${endpoint}/editRegistration/${registration.id}`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when officeHourId is 0", async () => {
  //     const attributes = { ...baseAttributes, officeHourId: 0 };
  //     const response = await request
  //       .post(`${endpoint}/editRegistration/${registration.id}`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when officeHourId is less than 0", async () => {
  //     const attributes = { ...baseAttributes, officeHourId: -officeHour.id };
  //     const response = await request
  //       .post(`${endpoint}/editRegistration/${registration.id}`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 202 when startTime and endTime are PM", async () => {
  //     const attributes = {
  //       ...baseAttributes,
  //       startTime: "12:00:00",
  //       endTime: "12:10:00",
  //     };
  //     const response = await request
  //       .post(`${endpoint}/editRegistration/${registration.id}`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(202);
  //   });

  //   it("Return 409 when startTime is empty", async () => {
  //     const attributes = { ...baseAttributes, startTime: "" };
  //     const response = await request
  //       .post(`${endpoint}/editRegistration/${registration.id}`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(409);
  //   });

  //   it("Return 409 when startTime is not a time string", async () => {
  //     const attributes = { ...baseAttributes, startTime: "Hello World" };
  //     const response = await request
  //       .post(`${endpoint}/editRegistration/${registration.id}`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(409);
  //   });

  //   it("Return 409 when endTime is empty", async () => {
  //     const attributes = { ...baseAttributes, endTime: "" };
  //     const response = await request
  //       .post(`${endpoint}/editRegistration/${registration.id}`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(409);
  //   });

  //   it("Return 409 when endTime is not a time string", async () => {
  //     const attributes = { ...baseAttributes, endTime: "Hello World" };
  //     const response = await request
  //       .post(`${endpoint}/editRegistration/${registration.id}`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(409);
  //   });

  //   it("Return 400 when date is now", async () => {
  //     const attributes = {
  //       ...baseAttributes,
  //       date: new Date()
  //         .toLocaleString("en-US", { hour12: false })
  //         .split(",")[0]
  //         .replaceAll("/", "-"),
  //     };
  //     const response = await request
  //       .post(`${endpoint}/editRegistration/${registration.id}`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when date is in the past", async () => {
  //     const attributes = { ...baseAttributes, date: "2002-01-01" };
  //     const response = await request
  //       .post(`${endpoint}/editRegistration/${registration.id}`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 202 when question is empty", async () => {
  //     const attributes = { ...baseAttributes, question: "" };
  //     const response = await request
  //       .post(`${endpoint}/editRegistration/${registration.id}`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(202);
  //   });

  //   it("Return 202 when TopicIds is a singleton", async () => {
  //     const attributes = { ...baseAttributes, TopicIds: [topics[0].id] };
  //     const response = await request
  //       .post(`${endpoint}/editRegistration/${registration.id}`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(202);
  //   });

  //   it("Return 202 when TopicIds is empty", async () => {
  //     const attributes = { ...baseAttributes, TopicIds: [] };
  //     const response = await request
  //       .post(`${endpoint}/editRegistration/${registration.id}`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(202);
  //   });

  //   it("Return 403 when a TopicId is invalid", async () => {
  //     const attributes = { ...baseAttributes, TopicIds: [topics[0].id, -1] };
  //     const response = await request
  //       .post(`${endpoint}/editRegistration/${registration.id}`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(403);
  //   });
  // });

  // describe(`Test POST: ${endpoint}/editLocationSingleDay`, async () => {
  //   let course = {};
  //   let officeHour = {};
  //   let staff = [];
  //   let students = [];
  //   let baseAttributes = {};
  //   let instructor = {};

  //   beforeAll(async () => {
  //     const params = await setup();
  //     instructor = params.instructor;
  //     officeHour = params.officeHour;
  //     staff = params.staff;
  //     students = params.students;
  //     course = params.course;
  //     baseAttributes = {
  //       ...baseAttributes,
  //       officeHourId: officeHour.id,
  //       location: "NEW LOCATION",
  //       isRemote: officeHour.isRemote,
  //     };
  //   });

  //   afterAll(async () => {
  //     await teardown();
  //   });

  //   afterEach(async () => {
  //     await prisma.officeHour.update({
  //       where: {
  //         id: officeHour.id,
  //       },
  //       data: {
  //         location: officeHour.location,
  //         remote: officeHour.remote,
  //       },
  //     });
  //   });

  //   it("Return 202 when course successfully archived", async () => {
  //     const officeHourId = baseAttributes.officeHourId;
  //     const officeHour = await prisma.officeHour.findUnique({
  //       where: {
  //         id: officeHourId,
  //       },
  //     });
  //     const response = await request
  //       .post(`/api/course/${officeHour.courseId}/archiveCourse`)
  //       .set("Authorization", "bearer " + instructor.token);
  //     expect(response.status).toBe(202);
  //   });

  //   it("Return 400 when all parameters are valid of archived course", async () => {
  //     const attributes = { ...baseAttributes };
  //     const response = await request
  //       .post(`${endpoint}/editLocationSingleDay`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 202 when course successfully archived", async () => {
  //     const officeHourId = baseAttributes.officeHourId;
  //     const officeHour = await prisma.officeHour.findUnique({
  //       where: {
  //         id: officeHourId,
  //       },
  //     });
  //     const response = await request
  //       .post(`/api/course/${officeHour.courseId}/archiveCourse`)
  //       .set("Authorization", "bearer " + instructor.token);
  //     expect(response.status).toBe(202);
  //   });

  //   it("Return 403 when user is not host or instructor", async () => {
  //     const attributes = { ...baseAttributes };
  //     const response = await request
  //       .post(`${endpoint}/editLocationSingleDay`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(403);
  //   });

  //   it("Return 202 when all parameters are valid", async () => {
  //     const attributes = { ...baseAttributes };
  //     const response = await request
  //       .post(`${endpoint}/editLocationSingleDay`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(202);
  //     const editedOH = await prisma.officeHour.findFirst({
  //       where: { id: officeHour.id },
  //     });
  //     expect(editedOH.location).toBe(attributes.location);
  //   });

  //   it("Return 400 when officeHourId is a positive integer but the officeHour does not exist", async () => {
  //     const attributes = { ...baseAttributes, officeHourId: officeHour.id * 2 };
  //     const response = await request
  //       .post(`${endpoint}/editLocationSingleDay`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   }, 1000);

  //   it("Return 400 when officeHourId is 0", async () => {
  //     const attributes = { ...baseAttributes, officeHourId: 0 };
  //     const response = await request
  //       .post(`${endpoint}/editLocationSingleDay`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   }, 1000);

  //   it("Return 400 when officeHourId is less than 0", async () => {
  //     const attributes = { ...baseAttributes, officeHourId: -1 };
  //     const response = await request
  //       .post(`${endpoint}/editLocationSingleDay`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   }, 1000);

  //   it("Return 400 when location is empty", async () => {
  //     const attributes = {
  //       officeHourId: officeHour.id,
  //       isRemote: officeHour.isRemote,
  //     };
  //     const response = await request
  //       .post(`${endpoint}/editLocationSingleDay`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when isRemote is empty", async () => {
  //     const attributes = {
  //       officeHourId: officeHour.id,
  //       location: "NEW LOCATION",
  //     };
  //     const response = await request
  //       .post(`${endpoint}/editLocationSingleDay`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   });
  // });

  // describe(`Test POST: ${endpoint}/editLocationRecurringDay`, async () => {
  //   let course = {};
  //   let officeHour = {};
  //   let staff = [];
  //   let students = [];
  //   let baseAttributes = {};
  //   let instructor = {};

  //   beforeAll(async () => {
  //     const params = await setup();
  //     instructor = params.instructor;
  //     officeHour = params.officeHour;
  //     staff = params.staff;
  //     students = params.students;
  //     course = params.course;
  //     const mdy = new Date(officeHour.startDate)
  //       .toLocaleString("en-US", { hour12: false })
  //       .split(" ")[0]
  //       .split("/");
  //     baseAttributes = {
  //       ...baseAttributes,
  //       officeHourId: officeHour.id,
  //       location: "NEW RECURRING LOCATION",
  //       isRemote: officeHour.isRemote,
  //       date: mdy[0] + "-" + mdy[1] + "-" + mdy[2].replace(",", ""),
  //     };
  //   });

  //   afterAll(async () => {
  //     await teardown();
  //   });

  //   afterEach(async () => {
  //     await prisma.officeHour.update({
  //       where: {
  //         id: officeHour.id,
  //       },
  //       data: {
  //         location: officeHour.location,
  //         remote: officeHour.remote,
  //       },
  //     });
  //   });

  //   it("Return 202 when course successfully archived", async () => {
  //     const officeHourId = baseAttributes.officeHourId;
  //     const officeHour = await prisma.officeHour.findUnique({
  //       where: {
  //         id: officeHourId,
  //       },
  //     });
  //     const response = await request
  //       .post(`/api/course/${officeHour.courseId}/archiveCourse`)
  //       .set("Authorization", "bearer " + instructor.token);
  //     expect(response.status).toBe(202);
  //   });

  //   it("Return 400 when all parameters are valid of archived course", async () => {
  //     const attributes = { ...baseAttributes };
  //     const response = await request
  //       .post(`${endpoint}/editLocationRecurringDay`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 202 when course successfully archived", async () => {
  //     const officeHourId = baseAttributes.officeHourId;
  //     const officeHour = await prisma.officeHour.findUnique({
  //       where: {
  //         id: officeHourId,
  //       },
  //     });
  //     const response = await request
  //       .post(`/api/course/${officeHour.courseId}/archiveCourse`)
  //       .set("Authorization", "bearer " + instructor.token);
  //     expect(response.status).toBe(202);
  //   });

  //   it("Return 403 when user is not host or instructor", async () => {
  //     const attributes = { ...baseAttributes };
  //     const response = await request
  //       .post(`${endpoint}/editLocationRecurringDay`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(403);
  //   });

  //   it("Return 202 when all parameters are valid", async () => {
  //     const attributes = { ...baseAttributes };
  //     const response = await request
  //       .post(`${endpoint}/editLocationRecurringDay`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(202);
  //     const editedOH = await prisma.officeHour.findFirst({
  //       where: { id: officeHour.id + 1 },
  //       // officeHour.id + 1 because /editLocationRecurringDay makes a new officeHour with the new location
  //       // and in the tests it is just the id after the current id
  //     });
  //     expect(editedOH.location).toBe(attributes.location);
  //   });

  //   it("Return 400 when officeHourId is a positive integer but the officeHour does not exist", async () => {
  //     const attributes = { ...baseAttributes, officeHourId: officeHour.id * 2 };
  //     const response = await request
  //       .post(`${endpoint}/editLocationRecurringDay`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   }, 1000);

  //   it("Return 400 when officeHourId is 0", async () => {
  //     const attributes = { ...baseAttributes, officeHourId: 0 };
  //     const response = await request
  //       .post(`${endpoint}/editLocationRecurringDay`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   }, 1000);

  //   it("Return 400 when officeHourId is less than 0", async () => {
  //     const attributes = { ...baseAttributes, officeHourId: -1 };
  //     const response = await request
  //       .post(`${endpoint}/editLocationRecurringDay`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   }, 1000);

  //   it("Return 400 when location is empty", async () => {
  //     const attributes = {
  //       officeHourId: officeHour.id,
  //       isRemote: officeHour.isRemote,
  //     };
  //     const response = await request
  //       .post(`${endpoint}/editLocationRecurringDay`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when isRemote is empty", async () => {
  //     const attributes = {
  //       officeHourId: officeHour.id,
  //       location: "NEW LOCATION",
  //     };
  //     const response = await request
  //       .post(`${endpoint}/editLocationRecurringDay`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   });
  // });

  // describe(`Test POST: ${endpoint}/editRegistrationNoShow`, async () => {
  //   let course = {};
  //   let officeHour = {};
  //   let staff = [];
  //   let students = [];
  //   let baseAttributes = {};
  //   let instructor = {};
  //   let oHID = {};
  //   let registration = [];

  //   beforeAll(async () => {
  //     const params = await setup();
  //     instructor = params.instructor;
  //     officeHour = params.officeHour;
  //     registration = params.registration;
  //     staff = params.staff;
  //     students = params.students;
  //     course = params.course;
  //     oHID = { officeHourId: officeHour.id };
  //     await prisma.officeHour.update({
  //       where: {
  //         id: officeHour.id,
  //       },
  //       data: {
  //         startDate: stringToTimeObj("01-01-2002"),
  //       },
  //     });
  //     await prisma.registration.update({
  //       where: {
  //         id: registration.id,
  //       },
  //       data: {
  //         date: stringToTimeObj("01-01-2002"),
  //       },
  //     });
  //     baseAttributes = { registrationId: registration.id };
  //   });

  //   afterAll(async () => {
  //     await teardown();
  //   });

  //   afterEach(async () => {
  //     await prisma.officeHour.update({
  //       where: {
  //         id: officeHour.id,
  //       },
  //       data: {
  //         startDate: stringToTimeObj("01-01-2002"),
  //       },
  //     });
  //     await prisma.registration.update({
  //       where: {
  //         id: registration.id,
  //       },
  //       data: {
  //         date: stringToTimeObj("01-01-2002"),
  //       },
  //     });
  //   });

  //   it("Return 202 when course successfully archived", async () => {
  //     const officeHourId = oHID.officeHourId;
  //     const officeHour = await prisma.officeHour.findUnique({
  //       where: {
  //         id: officeHourId,
  //       },
  //     });
  //     const response = await request
  //       .post(`/api/course/${officeHour.courseId}/archiveCourse`)
  //       .set("Authorization", "bearer " + instructor.token);
  //     expect(response.status).toBe(202);
  //   });

  //   it("Return 400 when all parameters are valid of archived course", async () => {
  //     const attributes = { ...baseAttributes };
  //     const response = await request
  //       .post(`${endpoint}/editRegistrationNoShow`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 202 when course successfully archived", async () => {
  //     const officeHourId = oHID.officeHourId;
  //     const officeHour = await prisma.officeHour.findUnique({
  //       where: {
  //         id: officeHourId,
  //       },
  //     });
  //     const response = await request
  //       .post(`/api/course/${officeHour.courseId}/archiveCourse`)
  //       .set("Authorization", "bearer " + instructor.token);
  //     expect(response.status).toBe(202);
  //   });

  //   it("Return 403 when user is not host or instructor", async () => {
  //     const attributes = { ...baseAttributes };
  //     const response = await request
  //       .post(`${endpoint}/editRegistrationNoShow`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(403);
  //   });

  //   it("Return 202 when all parameters are valid", async () => {
  //     const attributes = { ...baseAttributes };
  //     const firstReg = await prisma.registration.findFirst({
  //       where: { id: registration.id },
  //     });
  //     const response = await request
  //       .post(`${endpoint}/editRegistrationNoShow`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(202);
  //     const secondReg = await prisma.registration.findFirst({
  //       where: { id: registration.id },
  //     });
  //     expect(firstReg.isNoShow).toBe(!secondReg.isNoShow);
  //   });

  //   it("Return 400 when registrationId is a positive integer but the registration does not exist", async () => {
  //     const attributes = {
  //       ...baseAttributes,
  //       registrationId: registration.id * 2,
  //     };
  //     const response = await request
  //       .post(`${endpoint}/editRegistrationNoShow`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when registrationId is 0", async () => {
  //     const attributes = { ...baseAttributes, registrationId: 0 };
  //     const response = await request
  //       .post(`${endpoint}/editRegistrationNoShow`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when registrationId is less than 0", async () => {
  //     const attributes = { ...baseAttributes, registrationId: -1 };
  //     const response = await request
  //       .post(`${endpoint}/editRegistrationNoShow`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   });
  // });

  // describe(`Test POST: ${endpoint}/editLocationSingleDay`, async () => {
  //   let course = {};
  //   let officeHour = {};
  //   let staff = [];
  //   let students = [];
  //   let baseAttributes = {};
  //   let instructor = {};

  //   beforeAll(async () => {
  //     const params = await setup();
  //     instructor = params.instructor;
  //     officeHour = params.officeHour;
  //     staff = params.staff;
  //     students = params.students;
  //     course = params.course;
  //     baseAttributes = {
  //       ...baseAttributes,
  //       officeHourId: officeHour.id,
  //       location: "NEW LOCATION",
  //       isRemote: officeHour.isRemote,
  //     };
  //   });

  //   afterAll(async () => {
  //     await teardown();
  //   });

  //   afterEach(async () => {
  //     await prisma.officeHour.update({
  //       where: {
  //         id: officeHour.id,
  //       },
  //       data: {
  //         location: officeHour.location,
  //         remote: officeHour.remote,
  //       },
  //     });
  //   });

  //   it("Return 202 when course successfully archived", async () => {
  //     const officeHourId = baseAttributes.officeHourId;
  //     const officeHour = await prisma.officeHour.findUnique({
  //       where: {
  //         id: officeHourId,
  //       },
  //     });
  //     const response = await request
  //       .post(`/api/course/${officeHour.courseId}/archiveCourse`)
  //       .set("Authorization", "bearer " + instructor.token);
  //     expect(response.status).toBe(202);
  //   });

  //   it("Return 400 when all parameters are valid of archived course", async () => {
  //     const attributes = { ...baseAttributes };
  //     const response = await request
  //       .post(`${endpoint}/editLocationSingleDay`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 202 when course successfully archived", async () => {
  //     const officeHourId = baseAttributes.officeHourId;
  //     const officeHour = await prisma.officeHour.findUnique({
  //       where: {
  //         id: officeHourId,
  //       },
  //     });
  //     const response = await request
  //       .post(`/api/course/${officeHour.courseId}/archiveCourse`)
  //       .set("Authorization", "bearer " + instructor.token);
  //     expect(response.status).toBe(202);
  //   });

  //   it("Return 403 when user is not host or instructor", async () => {
  //     const attributes = { ...baseAttributes };
  //     const response = await request
  //       .post(`${endpoint}/editLocationSingleDay`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(403);
  //   });

  //   it("Return 202 when all parameters are valid", async () => {
  //     const attributes = { ...baseAttributes };
  //     const response = await request
  //       .post(`${endpoint}/editLocationSingleDay`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(202);
  //     const editedOH = await prisma.officeHour.findFirst({
  //       where: { id: officeHour.id },
  //     });
  //     expect(editedOH.location).toBe(attributes.location);
  //   });

  //   it("Return 400 when officeHourId is a positive integer but the officeHour does not exist", async () => {
  //     const attributes = { ...baseAttributes, officeHourId: officeHour.id * 2 };
  //     const response = await request
  //       .post(`${endpoint}/editLocationSingleDay`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   }, 1000);

  //   it("Return 400 when officeHourId is 0", async () => {
  //     const attributes = { ...baseAttributes, officeHourId: 0 };
  //     const response = await request
  //       .post(`${endpoint}/editLocationSingleDay`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   }, 1000);

  //   it("Return 400 when officeHourId is less than 0", async () => {
  //     const attributes = { ...baseAttributes, officeHourId: -1 };
  //     const response = await request
  //       .post(`${endpoint}/editLocationSingleDay`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   }, 1000);

  //   it("Return 400 when location is empty", async () => {
  //     const attributes = {
  //       officeHourId: officeHour.id,
  //       isRemote: officeHour.isRemote,
  //     };
  //     const response = await request
  //       .post(`${endpoint}/editLocationSingleDay`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when isRemote is empty", async () => {
  //     const attributes = {
  //       officeHourId: officeHour.id,
  //       location: "NEW LOCATION",
  //     };
  //     const response = await request
  //       .post(`${endpoint}/editLocationSingleDay`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   });
  // });

  // describe(`Test POST: ${endpoint}/editLocationRecurringDay`, async () => {
  //   let course = {};
  //   let officeHour = {};
  //   let staff = [];
  //   let students = [];
  //   let baseAttributes = {};
  //   let instructor = {};

  //   beforeAll(async () => {
  //     const params = await setup();
  //     instructor = params.instructor;
  //     officeHour = params.officeHour;
  //     staff = params.staff;
  //     students = params.students;
  //     course = params.course;
  //     const mdy = new Date(officeHour.startDate)
  //       .toLocaleString("en-US", { hour12: false })
  //       .split(" ")[0]
  //       .split("/");
  //     baseAttributes = {
  //       ...baseAttributes,
  //       officeHourId: officeHour.id,
  //       location: "NEW RECURRING LOCATION",
  //       isRemote: officeHour.isRemote,
  //       date: mdy[0] + "-" + mdy[1] + "-" + mdy[2].replace(",", ""),
  //     };
  //   });

  //   afterAll(async () => {
  //     await teardown();
  //   });

  //   afterEach(async () => {
  //     await prisma.officeHour.update({
  //       where: {
  //         id: officeHour.id,
  //       },
  //       data: {
  //         location: officeHour.location,
  //         remote: officeHour.remote,
  //       },
  //     });
  //   });

  //   it("Return 202 when course successfully archived", async () => {
  //     const officeHourId = baseAttributes.officeHourId;
  //     const officeHour = await prisma.officeHour.findUnique({
  //       where: {
  //         id: officeHourId,
  //       },
  //     });
  //     const response = await request
  //       .post(`/api/course/${officeHour.courseId}/archiveCourse`)
  //       .set("Authorization", "bearer " + instructor.token);
  //     expect(response.status).toBe(202);
  //   });

  //   it("Return 400 when all parameters are valid of archived course", async () => {
  //     const attributes = { ...baseAttributes };
  //     const response = await request
  //       .post(`${endpoint}/editLocationRecurringDay`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 202 when course successfully archived", async () => {
  //     const officeHourId = baseAttributes.officeHourId;
  //     const officeHour = await prisma.officeHour.findUnique({
  //       where: {
  //         id: officeHourId,
  //       },
  //     });
  //     const response = await request
  //       .post(`/api/course/${officeHour.courseId}/archiveCourse`)
  //       .set("Authorization", "bearer " + instructor.token);
  //     expect(response.status).toBe(202);
  //   });

  //   it("Return 403 when user is not host or instructor", async () => {
  //     const attributes = { ...baseAttributes };
  //     const response = await request
  //       .post(`${endpoint}/editLocationRecurringDay`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(403);
  //   });

  //   it("Return 202 when all parameters are valid", async () => {
  //     const attributes = { ...baseAttributes };
  //     const response = await request
  //       .post(`${endpoint}/editLocationRecurringDay`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(202);
  //     const editedOH = await prisma.officeHour.findFirst({
  //       where: { id: officeHour.id + 1 },
  //       // officeHour.id + 1 because /editLocationRecurringDay makes a new officeHour with the new location
  //       // and in the tests it is just the id after the current id
  //     });
  //     expect(editedOH.location).toBe(attributes.location);
  //   });

  //   it("Return 400 when officeHourId is a positive integer but the officeHour does not exist", async () => {
  //     const attributes = { ...baseAttributes, officeHourId: officeHour.id * 2 };
  //     const response = await request
  //       .post(`${endpoint}/editLocationRecurringDay`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   }, 1000);

  //   it("Return 400 when officeHourId is 0", async () => {
  //     const attributes = { ...baseAttributes, officeHourId: 0 };
  //     const response = await request
  //       .post(`${endpoint}/editLocationRecurringDay`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   }, 1000);

  //   it("Return 400 when officeHourId is less than 0", async () => {
  //     const attributes = { ...baseAttributes, officeHourId: -1 };
  //     const response = await request
  //       .post(`${endpoint}/editLocationRecurringDay`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   }, 1000);

  //   it("Return 400 when location is empty", async () => {
  //     const attributes = {
  //       officeHourId: officeHour.id,
  //       isRemote: officeHour.isRemote,
  //     };
  //     const response = await request
  //       .post(`${endpoint}/editLocationRecurringDay`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when isRemote is empty", async () => {
  //     const attributes = {
  //       officeHourId: officeHour.id,
  //       location: "NEW LOCATION",
  //     };
  //     const response = await request
  //       .post(`${endpoint}/editLocationRecurringDay`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   });
  // });

  describe(`Test POST: ${endpoint}/editRegistrationNoShow`, async () => {
    let course = {};
    let officeHour = {};
    let staff = [];
    let students = [];
    let baseAttributes = {};
    let instructor = {};
    let oHID = {};
    let registration = [];

    beforeAll(async () => {
      const params = await setup();
      instructor = params.instructor;
      officeHour = params.officeHour;
      registration = params.registration;
      staff = params.staff;
      students = params.students;
      course = params.course;
      oHID = { officeHourId: officeHour.id };
      await prisma.officeHour.update({
        where: {
          id: officeHour.id,
        },
        data: {
          startDate: stringToTimeObj("01-01-2002"),
        },
      });
      await prisma.registration.update({
        where: {
          id: registration.id,
        },
        data: {
          date: stringToTimeObj("01-01-2002"),
        },
      });
      baseAttributes = { registrationId: registration.id };
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
          startDate: stringToTimeObj("01-01-2002"),
        },
      });
      await prisma.registration.update({
        where: {
          id: registration.id,
        },
        data: {
          date: stringToTimeObj("01-01-2002"),
        },
      });
    });

    it("Return 202 when course successfully archived", async () => {
      const officeHourId = oHID.officeHourId;
      const officeHour = await prisma.officeHour.findUnique({
        where: {
          id: officeHourId,
        },
      });
      const response = await request
        .post(`/api/course/${officeHour.courseId}/archiveCourse`)
        .set("Authorization", "bearer " + instructor.token);
      expect(response.status).toBe(202);
    });

    it("Return 400 when all parameters are valid of archived course", async () => {
      const attributes = { ...baseAttributes };
      const response = await request
        .post(`${endpoint}/editRegistrationNoShow`)
        .send(attributes)
        .set("Authorization", "Bearer " + staff[0].token);
      expect(response.status).toBe(400);
    });

    it("Return 202 when course successfully archived", async () => {
      const officeHourId = oHID.officeHourId;
      const officeHour = await prisma.officeHour.findUnique({
        where: {
          id: officeHourId,
        },
      });
      const response = await request
        .post(`/api/course/${officeHour.courseId}/archiveCourse`)
        .set("Authorization", "bearer " + instructor.token);
      expect(response.status).toBe(202);
    });

    it("Return 403 when user is not host or instructor", async () => {
      const attributes = { ...baseAttributes };
      const response = await request
        .post(`${endpoint}/editRegistrationNoShow`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(403);
    });

    it("Return 202 when all parameters are valid", async () => {
      const attributes = { ...baseAttributes };
      const firstReg = await prisma.registration.findFirst({
        where: { id: registration.id },
      });
      const response = await request
        .post(`${endpoint}/editRegistrationNoShow`)
        .send(attributes)
        .set("Authorization", "Bearer " + staff[0].token);
      expect(response.status).toBe(202);
      const secondReg = await prisma.registration.findFirst({
        where: { id: registration.id },
      });
      expect(firstReg.isNoShow).toBe(!secondReg.isNoShow);
    });

    it("Return 400 when registrationId is a positive integer but the registration does not exist", async () => {
      const attributes = {
        ...baseAttributes,
        registrationId: registration.id * 2,
      };
      const response = await request
        .post(`${endpoint}/editRegistrationNoShow`)
        .send(attributes)
        .set("Authorization", "Bearer " + staff[0].token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when registrationId is 0", async () => {
      const attributes = { ...baseAttributes, registrationId: 0 };
      const response = await request
        .post(`${endpoint}/editRegistrationNoShow`)
        .send(attributes)
        .set("Authorization", "Bearer " + staff[0].token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when registrationId is less than 0", async () => {
      const attributes = { ...baseAttributes, registrationId: -1 };
      const response = await request
        .post(`${endpoint}/editRegistrationNoShow`)
        .send(attributes)
        .set("Authorization", "Bearer " + staff[0].token);
      expect(response.status).toBe(400);
    });
  });

  describe(`Test POST: ${endpoint}/addRegistrationFeedback`, async () => {
    let course = {};
    let registration = {};
    let students = [];
    let instructor = {};
    let officeHour = {};
    let baseAttributes = {};

    beforeAll(async () => {
      const params = await setup();
      instructor = params.instructor;
      course = params.course;
      registration = params.registration;
      students = params.students;
      officeHour = params.officeHour;
      await prisma.course.update({
        where: {
          id: course.id,
        },
        data: {
          startRegConstraint: 30,
        },
      });

      const newStartDate = new Date(officeHour.startDate);
      newStartDate.setDate(newStartDate.getDate() - 1);
      await prisma.officeHour.update({
        where: {
          id: officeHour.id,
        },
        data: {
          startDate: newStartDate,
        },
      });
      await prisma.registration.update({
        where: {
          id: registration.id,
        },
        data: {
          date: newStartDate,
        },
      });
      baseAttributes = {
        registrationId: registration.id,
        feedbackRating: 5,
        feedbackComment: "mid",
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
          hasFeedback: false,
          isCancelled: false,
          isCancelledStaff: false,
        },
      });
      await prisma.feedback.deleteMany({});
      const newStartDate = new Date(officeHour.startDate);
      newStartDate.setDate(newStartDate.getDate() - 1);
      await prisma.officeHour.update({
        where: {
          id: officeHour.id,
        },
        data: {
          startDate: newStartDate,
        },
      });
      await prisma.registration.update({
        where: {
          id: registration.id,
        },
        data: {
          date: newStartDate,
        },
      });
    });

    it("Return 202 when course successfully archived", async () => {
      const response = await request
        .post(`/api/course/${course.id}/archiveCourse`)
        .set("Authorization", "bearer " + instructor.token);
      expect(response.status).toBe(202);
    });

    it("Return 400 when course is archived", async () => {
      const attributes = { ...baseAttributes };
      const response = await request
        .post(`${endpoint}/addRegistrationFeedback`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });

    it("Return 202 when course successfully unarchived", async () => {
      const response = await request
        .post(`/api/course/${course.id}/archiveCourse`)
        .set("Authorization", "bearer " + instructor.token);
      expect(response.status).toBe(202);
    });

    it("Return 400 when user is not a student", async () => {
      const attributes = { ...baseAttributes };
      const response = await request
        .post(`${endpoint}/addRegistrationFeedback`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 409 when registration is cancelled", async () => {
      await prisma.registration.update({
        where: {
          id: registration.id,
        },
        data: {
          isCancelled: true,
          isCancelledStaff: true,
        },
      });
      const attributes = { ...baseAttributes };
      const response = await request
        .post(`${endpoint}/addRegistrationFeedback`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(409);
    });

    it("Return 202 when all parameters are valid", async () => {
      const attributes = { ...baseAttributes };
      const response = await request
        .post(`${endpoint}/addRegistrationFeedback`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(202);
    });

    it("Return 400 when registrationId is a positive integer but the registration does not exist", async () => {
      const attributes = {
        ...baseAttributes,
        registrationId: registration.id * 2,
      };
      const response = await request
        .post(`${endpoint}/addRegistrationFeedback`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when registrationId is 0", async () => {
      const attributes = { ...baseAttributes, registrationId: 0 };
      const response = await request
        .post(`${endpoint}/addRegistrationFeedback`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when registrationId is negative", async () => {
      const attributes = {
        ...baseAttributes,
        registrationId: -registration.id,
      };
      const response = await request
        .post(`${endpoint}/addRegistrationFeedback`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });

    it("Return 409 when feedbackRating < 1", async () => {
      const attributes = { ...baseAttributes, feedbackRating: 0 };
      const response = await request
        .post(`${endpoint}/addRegistrationFeedback`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(409);
    });

    it("Return 409 when feedbackRating > 10", async () => {
      const attributes = { ...baseAttributes, feedbackRating: 11 };
      const response = await request
        .post(`${endpoint}/addRegistrationFeedback`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(409);
    });

    it("Return 202 when no feedback comment", async () => {
      const attributes = { registrationId: registration.id, feedbackRating: 8 };
      const response = await request
        .post(`${endpoint}/addRegistrationFeedback`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(202);
    });

    it("Return 400 when feedback already exists", async () => {
      const attributes = { ...baseAttributes };
      const response = await request
        .post(`${endpoint}/addRegistrationFeedback`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(202);
      const secondResponse = await request
        .post(`${endpoint}/addRegistrationFeedback`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[0].token);
      expect(secondResponse.status).toBe(400);
    });

    it("Return 400 when feedback not within constraints", async () => {
      await prisma.officeHour.update({
        where: {
          id: officeHour.id,
        },
        data: {
          startDate: stringToTimeObj("01-01-2002"),
        },
      });
      await prisma.registration.update({
        where: {
          id: registration.id,
        },
        data: {
          date: stringToTimeObj("01-01-2002"),
        },
      });
      const attributes = { ...baseAttributes };
      const response = await request
        .post(`${endpoint}/addRegistrationFeedback`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });
  });

  // /* The remaining tests are for the GET methods and thus we will not use equivalence partitioning */
  // describe(`Test GET: ${endpoint}/:officeHourId/getRemainingTimeSlots/:date`, async () => {
  //   let course = {};
  //   let officeHour = {};
  //   let students = [];
  //   let studentNotInCourse = {};

  //   beforeAll(async () => {
  //     const params = await setup();
  //     course = params.course;
  //     officeHour = params.officeHour;
  //     students = params.students;
  //     studentNotInCourse = await prisma.account.create({
  //       data: {
  //         userName: "Test Student Bad",
  //         email: "student_bad@test.io",
  //         role: Role.User,
  //       },
  //     });
  //     studentNotInCourse = {
  //       ...studentNotInCourse,
  //       token: createToken({ user: studentNotInCourse }),
  //     };
  //   });

  //   afterAll(async () => {
  //     await teardown();
  //   });

  //   it("Return 202 for valid date", async () => {
  //     const date = new Date(officeHour.startDate)
  //       .toLocaleDateString("en-us")
  //       .replaceAll("/", "-");
  //     const response = await request
  //       .get(`${endpoint}/${officeHour.id}/getRemainingTimeSlots/${date}`)
  //       .set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(202);
  //     expect(response.body.timeSlotsPerType).toBeDefined();
  //   });

  //   it("Return 403 when student is not in course", async () => {
  //     const date = new Date(officeHour.startDate)
  //       .toLocaleDateString("en-us")
  //       .replaceAll("/", "-");
  //     const response = await request
  //       .get(`${endpoint}/${officeHour.id}/getRemainingTimeSlots/${date}`)
  //       .set("Authorization", "Bearer " + studentNotInCourse.token);
  //     expect(response.status).toBe(403);
  //   });

  //   it("Return 400 for invalid date", async () => {
  //     const date = new Date(officeHour.startDate);
  //     date.setDate(date.getDate() + 1);
  //     const dateString = date.toLocaleDateString("en-us").replaceAll("/", "-");
  //     const response = await request
  //       .get(`${endpoint}/${officeHour.id}/getRemainingTimeSlots/${dateString}`)
  //       .set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when officeHourId is invalid", async () => {
  //     const date = new Date(officeHour.startDate);
  //     date.setDate(date.getDate() + 1);
  //     const dateString = date.toLocaleDateString("en-us").replaceAll("/", "-");
  //     const response = await request
  //       .get(
  //         `${endpoint}/${officeHour.id * 2}/getRemainingTimeSlots/${dateString}`
  //       )
  //       .set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(400);
  //   });
  // });

  // describe(`Test GET: ${endpoint}/:officeHourId`, async () => {
  //   let officeHour = {};
  //   let students = [];

  //   beforeAll(async () => {
  //     const params = await setup();
  //     officeHour = params.officeHour;
  //     students = params.students;
  //   });

  //   afterAll(async () => {
  //     await teardown();
  //   });

  //   it("Return 202 when ID is valid", async () => {
  //     const response = await request
  //       .get(`${endpoint}/${officeHour.id}`)
  //       .set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(202);
  //     expect(response.body.officeHour.id).toEqual(officeHour.id);
  //   });

  //   it("Return 400 when ID is invalid", async () => {
  //     const response = await request
  //       .get(`${endpoint}/${officeHour.id * 2}`)
  //       .set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(400);
  //   });
  // });

  // describe(`Test GET: ${endpoint}/:officeHourId/date/:date/registrationStatus`, async () => {
  //   let course = {};
  //   let officeHour = {};
  //   let students = [];
  //   let instructor = {};
  //   let staff = [];

  //   beforeAll(async () => {
  //     const params = await setup();
  //     course = params.course;
  //     officeHour = params.officeHour;
  //     students = params.students;
  //     instructor = params.instructor;
  //     staff = params.staff;
  //   });

  //   afterEach(async () => {
  //     await prisma.registration.updateMany({
  //       data: {
  //         isCancelled: false,
  //         isCancelledStaff: false,
  //       },
  //     });
  //     await prisma.officeHour.updateMany({
  //       data: {
  //         isCancelledOn: [],
  //       },
  //     });
  //   });

  //   afterAll(async () => {
  //     await prisma.registration.updateMany({
  //       data: {
  //         isCancelled: false,
  //         isCancelledStaff: false,
  //       },
  //     });
  //     await prisma.officeHour.updateMany({
  //       data: {
  //         isCancelledOn: [],
  //       },
  //     });
  //     await teardown();
  //   });

  //   it("Return 202 for valid date", async () => {
  //     const date = new Date(officeHour.startDate)
  //       .toLocaleDateString("en-us")
  //       .replaceAll("/", "-");
  //     const response = await request
  //       .get(`${endpoint}/${officeHour.id}/date/${date}/registrationStatus`)
  //       .set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(202);
  //   });

  //   it("Return 400 for invalid date", async () => {
  //     const date = new Date(officeHour.startDate);
  //     date.setDate(date.getDate() + 1);
  //     const dateString = date.toLocaleDateString("en-us").replaceAll("/", "-");
  //     const response = await request
  //       .get(`${endpoint}/${officeHour.id}/date/${date}/registrationStatus`)
  //       .set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when officeHourId is invalid", async () => {
  //     const date = new Date(officeHour.startDate);
  //     date.setDate(date.getDate() + 1);
  //     const dateString = date.toLocaleDateString("en-us").replaceAll("/", "-");
  //     const response = await request
  //       .get(`${endpoint}/${officeHour.id * 2}/date/${date}/registrationStatus`)
  //       .set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 202 with all valid parameters - cancel office hour", async () => {
  //     const date = new Date(officeHour.startDate)
  //       .toLocaleDateString("en-us")
  //       .replaceAll("/", "-");
  //     const attributes = { date: date, officeHourId: officeHour.id };
  //     const response = await request
  //       .post(`${endpoint}/cancelOnDate`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(202);
  //   });

  //   it("Return 403 for cancelled office hour", async () => {
  //     const date = new Date(officeHour.startDate)
  //       .toLocaleDateString("en-us")
  //       .replaceAll("/", "-");
  //     const response = await request
  //       .get(`${endpoint}/${officeHour.id}/date/${date}/registrationStatus`)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(403);
  //   });

  //   it("Return 202 for student without office hours", async () => {
  //     const date = new Date(officeHour.startDate)
  //       .toLocaleDateString("en-us")
  //       .replaceAll("/", "-");
  //     const response = await request
  //       .get(`${endpoint}/${officeHour.id}/date/${date}/registrationStatus`)
  //       .set("Authorization", "Bearer " + students[2].token);
  //     expect(response.status).toBe(202);
  //   });
  // });

  // describe(`Test GET: ${endpoint}/:officeHourId/date/:date/registrationsOnDate`, async () => {
  //   let course = {};
  //   let officeHour = {};
  //   let staff = [];
  //   let instructor = {};

  //   beforeAll(async () => {
  //     const params = await setup();
  //     course = params.course;
  //     officeHour = params.officeHour;
  //     staff = params.staff;
  //     instructor = params.instructor;
  //   });

  //   afterEach(async () => {
  //     await prisma.registration.updateMany({
  //       data: {
  //         isCancelled: false,
  //         isCancelledStaff: false,
  //       },
  //     });
  //     await prisma.officeHour.updateMany({
  //       data: {
  //         isCancelledOn: [],
  //       },
  //     });
  //   });

  //   afterAll(async () => {
  //     await prisma.registration.updateMany({
  //       data: {
  //         isCancelled: false,
  //         isCancelledStaff: false,
  //       },
  //     });
  //     await prisma.officeHour.updateMany({
  //       data: {
  //         isCancelledOn: [],
  //       },
  //     });
  //     await teardown();
  //   });

  //   it("Return 202 for valid date", async () => {
  //     const date = new Date(officeHour.startDate)
  //       .toLocaleDateString("en-us")
  //       .replaceAll("/", "-");
  //     const response = await request
  //       .get(`${endpoint}/${officeHour.id}/date/${date}/registrationsOnDate`)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(202);
  //   });

  //   it("Return 202 with all valid parameters - cancel office hour", async () => {
  //     const date = new Date(officeHour.startDate)
  //       .toLocaleDateString("en-us")
  //       .replaceAll("/", "-");
  //     const attributes = { date: date, officeHourId: officeHour.id };
  //     const response = await request
  //       .post(`${endpoint}/cancelOnDate`)
  //       .send(attributes)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(202);
  //   });

  //   it("Return 202 for cancelled registration", async () => {
  //     const date = new Date(officeHour.startDate)
  //       .toLocaleDateString("en-us")
  //       .replaceAll("/", "-");
  //     const response = await request
  //       .get(`${endpoint}/${officeHour.id}/date/${date}/registrationsOnDate`)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(202);
  //   });

  //   it("Return 202 for instructor without office hours", async () => {
  //     const date = new Date(officeHour.startDate)
  //       .toLocaleDateString("en-us")
  //       .replaceAll("/", "-");
  //     const response = await request
  //       .get(`${endpoint}/${officeHour.id}/date/${date}/registrationsOnDate`)
  //       .set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(202);
  //   });

  //   it("Return 400 for invalid date", async () => {
  //     const date = new Date(officeHour.startDate);
  //     date.setDate(date.getDate() + 1);
  //     const dateString = date.toLocaleDateString("en-us").replaceAll("/", "-");
  //     const response = await request
  //       .get(`${endpoint}/${officeHour.id}/date/${date}/registrationsOnDate`)
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when officeHourId is invalid", async () => {
  //     const date = new Date(officeHour.startDate);
  //     date.setDate(date.getDate() + 1);
  //     const dateString = date.toLocaleDateString("en-us").replaceAll("/", "-");
  //     const response = await request
  //       .get(
  //         `${endpoint}/${officeHour.id * 2}/date/${date}/registrationsOnDate`
  //       )
  //       .set("Authorization", "Bearer " + staff[0].token);
  //     expect(response.status).toBe(400);
  //   });
  // });
});
