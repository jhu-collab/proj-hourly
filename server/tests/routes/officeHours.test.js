import supertest from "supertest";
import { test, expect, beforeEach, describe, afterEach } from "vitest";
import app from "../../src/index.js";
import prisma from "../../prisma/client.js";
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

async function setup() {
  /*** Create
     *  3 student accounts (user)
     *  3 staff accounts (user)
     *  1 instructor account (admin)
   ***/
  await prisma.topic.deleteMany();
  await prisma.officeHour.deleteMany();
  await prisma.officeHourTimeOptions.deleteMany();
  await prisma.account.deleteMany();
  await prisma.course.deleteMany();

  await prisma.account.createMany({
    data: [
      {
        userName: "Test Student I",
        hashedPassword: "Test Password I",
        email: "student1@test.io",
        firstName: "Test First Name I",
        lastName: "Test Last Name I",
        role: Role.User
      },
      {
        userName: "Test Student II",
        hashedPassword: "Test Password II",
        email: "student2@test.io",
        firstName: "Test First Name II",
        lastName: "Test Last Name II",
        role: Role.User
      },
      {
        userName: "Test Student III",
        hashedPassword: "Test Password III",
        email: "student3@test.io",
        firstName: "Test First Name III",
        lastName: "Test Last Name III",
        role: Role.User
      },
      {
        userName: "Test Staff I",
        hashedPassword: "Test Password I",
        email: "staff1@test.io",
        firstName: "Test First Name IV",
        lastName: "Test Last Name IV",
        role: Role.User
      },
      {
        userName: "Test Staff II",
        hashedPassword: "Test Password II",
        email: "staff2@test.io",
        firstName: "Test First Name V",
        lastName: "Test Last Name V",
        role: Role.User
      },
      {
        userName: "Test Staff III",
        hashedPassword: "Test Password II",
        email: "staff3@test.io",
        firstName: "Test First Name V",
        lastName: "Test Last Name V",
        role: Role.User
      },
      {
        userName: "Test Instructor",
        hashedPassword: "Test Password",
        email: "instructor@test.io",
        firstName: "Test First Name VI",
        lastName: "Test Last Name VI",
        role: Role.Admin
      }
    ]
  });

  // Generate and add auth tokens to each user
  let students = await prisma.account.findMany({ where: { userName: { contains: "Student" } } });
  students = students
    .map((user) => ({
      ...user,
      token: createToken({ user }),
      expiredToken: createToken({ user, expiresIn: "0" }),
    }));

  let staff = await prisma.account.findMany({ where: { userName: { contains: "Staff" } } });
  staff = staff
    .map((user) => ({
      ...user,
      token: createToken({ user }),
      expiredToken: createToken({ user, expiresIn: "0" }),
    }));

  const user = await prisma.account.findFirst({ where: { userName: "Test Instructor" } });
  let instructor = {
    ...user,
    token: createToken({ user }),
    expiredToken: createToken({ user, expiresIn: "0" }), 
  };

  // Create a course with the related students, staff, and instructor
  await prisma.Course.create({
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
          { id: students[2].id }
        ]
      },
      instructors: {
        connect: {
          id: instructor.id
        },
      },
      courseStaff: {
        connect: [
          { id: staff[0].id },
          { id: staff[1].id },
          { id: staff[2].id }
        ]
      }
    }
  });

  // Retrieve course information for tests
  let course = await prisma.course.findFirst({
    where: {
      title: "Test Course"
    },
    include: {
      courseStaff: true,
      instructors: true
    }
  });
  
  return [ staff, instructor, course ];
}

async function teardown(courseId) {
  // Delete all objects generated for testing
  await prisma.registration.deleteMany();
  await prisma.topic.deleteMany({
    where: {
      courseId: courseId,
    },
  });
  await prisma.officeHour.deleteMany({
    where: {
      courseId: courseId,
    },
  });
  await prisma.officeHourTimeOptions.deleteMany({
    where: {
      courseId: courseId,
    },
  });
  await prisma.course.deleteMany({
    where: {
      id: courseId,
    }
  });
  await prisma.account.deleteMany();

  await prisma.$disconnect();
  // Tear down the test database by `yarn docker:down`
}

describe(`Test endpoint ${endpoint}`, () => {
  // set up database for testing

  describe(`Test endpoint: ${endpoint}/create`, async () => {
    let staff = [];
    let instructor = {};
    let course = {};
    let baseAttributes = {
      startTime: "10:30:00",
      endTime: "11:30:00",
      recurringEvent: true,
      startDate: "3022-11-05T04:00:00.000",
      endDate: "3022-11-25T05:00:00.000",
      timeInterval: 10,
      daysOfWeek: ["Monday", "Tuesday"],
      location: "zoom"
    };

    beforeEach(async () => {
      [staff, instructor, course] = await setup();
      baseAttributes = { ...baseAttributes,
        courseId: course.id,
        hosts: staff.map((user) => user.id)
      };
    });

    afterEach(async () => {
      await teardown(course.id);
    });


    // Row 1
    test("Base Choice Test (all valid parameters)", async () => {
      const attributes = { ...baseAttributes };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + instructor.token
        );
      expect(response.status).toBe(201);
      const id = response.body.officeHour.id;
      const officeHour = prisma.officeHour.findUniqueOrThrow({ where: { id } });
      expect(officeHour).toBeDefined();
    }, 1000);

    // Row 2
    test("Invalid non-zero course ID", async () => {
      const attributes = { ...baseAttributes,
        courseId: course.id * 2
      };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + instructor.token
        );
      expect(response.status).toBe(400);
    }, 1000);

    // Row 3
    test("course ID is 0", async () => {
      const attributes = { ...baseAttributes,
        courseId: 0
      };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + instructor.token
        );
      expect(response.status).toBe(400);
    }, 1000);

    // Row 4
    test("course ID < 0", async () => {
      const attributes = { ...baseAttributes,
        courseId: -course.id
      };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + instructor.token
        );
      expect(response.status).toBe(400);
    }, 1000);

    // Row 5
    test("start time is a valid PM time", async () => {
      const attributes = { ...baseAttributes,
        startTime: "18:30:00"
      };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + instructor.token
        );
      expect(response.status).toBe(201);
      const id = response.body.officeHour.id;
      const officeHour = prisma.officeHour.findUniqueOrThrow({ where: { id } });
      expect(officeHour).toBeDefined();
    }, 1000);

    // Row 6
    test("start time is an empty string", async () => {
      const attributes = { ...baseAttributes,
        startTime: ""
      };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + instructor.token
        );
      expect(response.status).toBe(400);
    }, 1000);

    // Row 7
    test("start time is invalid and non-empty (not a time)", async () => {
      const attributes = { ...baseAttributes,
        startTime: "Hello World"
      };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + instructor.token
        );
      expect(response.status).toBe(400);   
    }, 1000);

    // Row 8
    test("end time is a valid PM time", async () => {
      const attributes = { ...baseAttributes,
        endTime: "18:30:00"
      };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + instructor.token
        );
      expect(response.status).toBe(201);
      const id = response.body.officeHour.id;
      const officeHour = prisma.officeHour.findUniqueOrThrow({ where: { id } });
      expect(officeHour).toBeDefined();
    }, 1000);

    // Row 9 
    test("end time is an empty string", async () => {
      const attributes = { ...baseAttributes,
        endTime: ""
      };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + instructor.token
        );
      expect(response.status).toBe(400);
    }, 1000);

    // Row 10
    test("end time is invalid and non-empty (not a time)", async () => {
      const attributes = { ...baseAttributes,
        endTime: "Hello World"
      };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + instructor.token
        );
      expect(response.status).toBe(400);   
    }, 1000);

    // Row 11
    test("create a non-recurring office hour", async () => {
      const attributes = { ...baseAttributes,
        recurringEvent: false
      };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + instructor.token
        );
      expect(response.status).toBe(201);
      const id = response.body.officeHour.id;
      const officeHour = prisma.officeHour.findUniqueOrThrow({ where: { id } });
      expect(officeHour).toBeDefined();      
    }, 1000);

    // Row 12
    test("start date is a valid date now", async () => {
      const attributes = { ...baseAttributes,
        startDate: new Date(Date.now()).toISOString()
      };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + instructor.token
        );
      expect(response.status).toBe(201);
      const id = response.body.officeHour.id;
      const officeHour = prisma.officeHour.findUniqueOrThrow({ where: { id } });
      expect(officeHour).toBeDefined();
    }, 1000);

    // Row 13
    test("start date is a valid date in the past", async () => {
      const attributes = { ...baseAttributes,
        startDate: "2002-11-05T04:00:00.000"
      };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + instructor.token
        );
      expect(response.status).toBe(400); 
    }, 1000);

    // Row 14
    test("end date is a valid date now", async () => {
      const attributes = { ...baseAttributes,
        endDate: new Date(Date.now()).toISOString()
      };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + instructor.token
        );
      expect(response.status).toBe(201);
      const id = response.body.officeHour.id;
      const officeHour = prisma.officeHour.findUniqueOrThrow({ where: { id } });
      expect(officeHour).toBeDefined();
    }, 1000);

    // Row 15
    test("end date is a valid date in the past", async () => {
      const attributes = { ...baseAttributes,
        endDate: "2002-11-05T04:00:00.000"
      };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + instructor.token
        );
      expect(response.status).toBe(400); 
    }, 1000);

    // Row 16
    test("time interval is 0", async () => {
      const attributes = { ...baseAttributes,
        timeInterval: 0
      };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + instructor.token
        );
      expect(response.status).toBe(400); 
    }, 1000);

    // Row 17
    test("time interval < 0", async () => {
      const attributes = { ...baseAttributes,
        timeInterval: -5
      };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + instructor.token
        );
      expect(response.status).toBe(400);
    }, 1000);
 
    // Row 18
    test("only one host", async () => {
      const attributes = { ...baseAttributes,
        hosts: [staff[0].id]
      };
      console.log("attributes: " + JSON.stringify(attributes));
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + instructor.token
        );
      expect(response.status).toBe(201);
      const id = response.body.officeHour.id;
      const officeHour = prisma.officeHour.findUniqueOrThrow({ where: { id } });
      expect(officeHour).toBeDefined();
    }, 1000); 
 
    // Row 19
    test("no hosts", async () => {
      const attributes = { ...baseAttributes,
        hosts: []
      };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + instructor.token
        );
      expect(response.status).toBe(400);
    }, 1000); 

    // Row 20
    test("days of week is a singleton", async () => {
      const attributes = { ...baseAttributes,
        daysOfWeek: ["Monday"]
      };
      console.log("attributes: " + JSON.stringify(attributes));
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + instructor.token
        );
      expect(response.status).toBe(201);
      const id = response.body.officeHour.id;
      const officeHour = prisma.officeHour.findUniqueOrThrow({ where: { id } });
      expect(officeHour).toBeDefined();
    }, 1000); 
 
    // Row 21
    test("days of week is empty", async () => {
      const attributes = { ...baseAttributes,
        daysOfWeek: []
      };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + instructor.token
        );
      expect(response.status).toBe(400);
    }, 1000); 

    // Row 22
    test("location is empty", async () => {
      const attributes = { ...baseAttributes,
        location: ""
      };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + instructor.token
        );
      expect(response.status).toBe(400);
    }, 1000);
  });
});