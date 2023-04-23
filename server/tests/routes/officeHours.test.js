import supertest from "supertest";
import { test, expect, beforeEach, describe, afterEach } from "vitest";
import app from "../../src/index.js";
import prisma from "../../prisma/client.js";
import { Role } from "@prisma/client";
import { createToken } from "../../src/util/helpers.js";
import { weekday } from "../../src/util/officeHourValidator.js";
import { start } from "repl";

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
  const testUser = prisma.account.findFirst({ where: { userName: { contains: "Test "} } });
  if (testUser) {
    await prisma.topic.deleteMany();
    await prisma.registration.deleteMany();
    await prisma.officeHour.deleteMany();
    await prisma.officeHourTimeOptions.deleteMany();
    await prisma.account.deleteMany();
    await prisma.course.deleteMany();
  }

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
  const students = (await prisma.account.findMany({ where: { userName: { contains: "Student" } } }))
    .map((user) => ({
      ...user,
      token: createToken({ user }),
    }));

  const staff = (await prisma.account.findMany({ where: { userName: { contains: "Staff" } } }))
    .map((user) => ({
      ...user,
      token: createToken({ user }),
    }));

  const user = await prisma.account.findFirst({ where: { userName: "Test Instructor" } });
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
    },
    include: {
      courseStaff: true,
      instructors: true
    }
  });

  // Create topics
  await prisma.topic.createMany({
    data: [
      {
        value: "Test Topic I",
        courseId: course.id
      },
      {
        value: "Test Topic II",
        courseId: course.id
      },
      {
        value: "Test Topic III",
        courseId: course.id
      },
    ]
  });
  const topics = await prisma.topic.findMany({ where: { value : { contains: "Test" } } });

  // Create office hours
  const startDate = new Date(); // tomorrow at 10am
  startDate.setDate(startDate.getDate() + 1);
  startDate.setHours(10);
  startDate.setMinutes(0);
  startDate.setSeconds(0);

  const endDate = new Date(); // + 30 days at 1pm
  endDate.setDate(endDate.getDate() + 30);
  endDate.setHours(13);
  endDate.setMinutes(0);
  endDate.setSeconds(0);
  const officeHour = await prisma.officeHour.create({
    data: {
      startDate: startDate, // + 1 day
      endDate: endDate,
      course: { connect: { id: course.id } },
      location: "zoom",
      isRecurring: true,
      hosts: { connect: { id: staff[0].id } },
      isOnDayOfWeek: { connect: {
        dayNumber: startDate.getDay()
      }},
    }
  });

  // Create office hour time options
  const officeHourTimeOption = await prisma.officeHourTimeOptions.create({
    data: { // default duration is 10 minutes
      title: "Test Office Hour Time Option",
      course: {
        connect: { id: course.id }
      }
    }
  })

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
    }
  });

  return {
    students: students,
    staff: staff,
    instructor: instructor,
    course: course,
    topics: topics,
    officeHour: officeHour,
    registration: registration,
    officeHourTimeOption: officeHourTimeOption
  };
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

  describe(`Test: ${endpoint}/create`, async () => {
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
      const params = await setup();
      staff = params.staff;
      instructor = params.instructor;
      course = params.course;
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
    test.skip("start time is a valid PM time", async () => {
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
    test.skip("start time is an empty string", async () => {
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
    test.skip("start time is invalid and non-empty (not a time)", async () => {
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
    test.skip("end time is a valid PM time", async () => {
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
    test.skip("end time is an empty string", async () => {
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
    test.skip("end time is invalid and non-empty (not a time)", async () => {
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
      expect(response.status).toBe(400);
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
      expect(response.status).toBe(400);
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
      expect(response.status).toBe(409);
    }, 1000);
 
    // Row 18
    test("only one host", async () => {
      const attributes = { ...baseAttributes,
        hosts: [staff[0].id]
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

  describe(`Test: ${endpoint}/register`, async () => {
    let students = [];
    let officeHour = {};
    let topics = [];
    let course = {};
    let baseAttributes = {
      startTime: "12:40:00",
      endTime: "12:50:00",
      question: "Test Question",
    }

    beforeEach(async () => {
      const params = await setup();
      students = params.students;
      officeHour = params.officeHour;
      topics = params.topics;
      course = params.course;
      const mdy = (new Date(officeHour.startDate).toLocaleString('en-US',{hour12:false}).split(" "))[0].split('/');

      baseAttributes = { ...baseAttributes,
        officeHourId: officeHour.id,
        TopicIds: topics.map((topic) => topic.id),
        date: mdy[0] + "-" + mdy[1] + "-" + mdy[2].replace(",","")
      };
    });

    afterEach(async () => {
      await teardown(course.id);
    });

    // Row 1
    test("Base Choice Test (all valid parameters)", async () => {
      const attributes = { ...baseAttributes };
      const response = await request
        .post(`${endpoint}/register`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + students[1].token
        );
      expect(response.status).toBe(202);
      const id = response.body.registration.id;
      const registration = await prisma.registration.findUniqueOrThrow({ where: { id } });
      expect(registration).toBeDefined();
      expect(registration.accountId).toEqual(students[1].id);
      expect(registration.officeHourId).toEqual(officeHour.id);
    }, 1000);

    // Row 2
    test("office hour id is positive but invalid (course does not exist)", async () => {
      const attributes = { ...baseAttributes,
        officeHourId: (officeHour.id * 2)
      };
      const response = await request
        .post(`${endpoint}/register`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + students[1].token
        );
      expect(response.status).toBe(400);
    }, 1000);

    // Row 3
    test("office hour id is 0", async () => {
      const attributes = { ...baseAttributes,
        officeHourId: 0
      };
      const response = await request
        .post(`${endpoint}/register`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + students[1].token
        );
      expect(response.status).toBe(400);
    }, 1000);

    // Row 4
    test("office hour id < 0", async () => {
      const attributes = { ...baseAttributes,
        officeHourId: -officeHour.id
      };
      const response = await request
        .post(`${endpoint}/register`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + students[1].token
        );
      expect(response.status).toBe(400);
    }, 1000);

    // Row 5
    test("start and end time is a valid PM time", async () => {
      const attributes = { ...baseAttributes,
        startTime: "13:00:00",
        endTime: "13:10:00",
      };
      const response = await request
        .post(`${endpoint}/register`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + students[1].token
        );
      expect(response.status).toBe(202);
      const id = response.body.registration.id;
      const registration = await prisma.registration.findUniqueOrThrow({ where: { id } });
      expect(registration).toBeDefined();
      expect(registration.accountId).toEqual(students[1].id);
      expect(registration.officeHourId).toEqual(officeHour.id);
    }, 1000);

    // Row 6
    test("start time is an empty string", async () => {
      const attributes = { ...baseAttributes,
        startTime: ""
      };
      const response = await request
        .post(`${endpoint}/register`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + students[1].token
        );
      expect(response.status).toBe(409);
    }, 1000);

    // Row 7
    test("start time is an invalid nonempty string (not a time)", async () => {
      const attributes = { ...baseAttributes,
        startTime: "Hello World"
      };
      const response = await request
        .post(`${endpoint}/register`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + students[1].token
        );
      expect(response.status).toBe(409);
    }, 1000);

    // Row 8
    test("end time is an empty string", async () => {
      const attributes = { ...baseAttributes,
        endTime: ""
      };
      const response = await request
        .post(`${endpoint}/register`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + students[1].token
        );
      expect(response.status).toBe(409);
    }, 1000);

    // Row 9
    test("end time is an invalid nonempty string (not a time)", async () => {
      const attributes = { ...baseAttributes,
        endTime: "Hello World"
      };
      const response = await request
        .post(`${endpoint}/register`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + students[1].token
        );
      expect(response.status).toBe(409);
    }, 1000);

    // Row 10
    test("date is a valid date now", async () => {
      const attributes = { ...baseAttributes,
        date: new Date(Date.now()).toISOString()
      };
      const response = await request
        .post(`${endpoint}/register`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + students[1].token
        );
      expect(response.status).toBe(403); // will always be outside of range of the scheduled office hour
    }, 1000);

    // Row 11
    test("date is valid date in the past", async () => {
      const attributes = { ...baseAttributes,
        date: "2002-11-05T04:00:00.000"
      };
      const response = await request
        .post(`${endpoint}/register`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + students[1].token
        );
      expect(response.status).toBe(403);
    }, 1000);

    // Row 12
    test("question is an empty string", async () => {
      const attributes = { ...baseAttributes,
        question: ""
      };
      const response = await request
        .post(`${endpoint}/register`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + students[1].token
        );
      expect(response.status).toBe(202);
      const id = response.body.registration.id;
      const registration = prisma.registration.findUniqueOrThrow({ where: { id } });
      expect(registration).toBeDefined();
      expect(registration.accountId).toEqual(students[1].id);
      expect(registration.officeHourId).toEqual(officeHour.id);
    }, 1000);

    // Row 13
    test("topic ids is a singleton", async () => {
      const attributes = { ...baseAttributes,
        TopicIds: [topics[0].id]
      };
      const response = await request
        .post(`${endpoint}/register`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + students[1].token
        );
      expect(response.status).toBe(202);
      const id = response.body.registration.id;
      const registration = prisma.registration.findUniqueOrThrow({ where: { id } });
      expect(registration).toBeDefined();
      expect(registration.accountId).toEqual(students[1].id);
      expect(registration.officeHourId).toEqual(officeHour.id);
    }, 1000);

    // Row 14
    test("topic ids is an empty list", async () => {
      const attributes = { ...baseAttributes,
        TopicIds: []
      };
      const response = await request
        .post(`${endpoint}/register`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + students[1].token
        );
      expect(response.status).toBe(202);
      const id = response.body.registration.id;
      const registration = prisma.registration.findUniqueOrThrow({ where: { id } });
      expect(registration).toBeDefined();
      expect(registration.accountId).toEqual(students[1].id);
      expect(registration.officeHourId).toEqual(officeHour.id);
    }, 1000);
  });

  describe(`Test: ${endpoint}/cancelOnDate`, async () => {
    let course = {};
    let officeHour = {};
    let staff = [];
    let baseAttributes = {}

    beforeEach(async () => {
      const params = await setup();
      officeHour = params.officeHour;
      staff = params.staff;
      course = params.course;
      const mdy = (new Date(officeHour.startDate).toLocaleString('en-US',{hour12:false}).split(" "))[0].split('/');

      baseAttributes = { ...baseAttributes,
        officeHourId: officeHour.id,
        date: mdy[0] + "-" + mdy[1] + "-" + mdy[2].replace(",","")
      };
    });

    afterEach(async () => {
      await teardown(course.id);
    });

    // Row 1
    test("Base Choice Test (all valid parameters)", async () => {
      const attributes = { ...baseAttributes };
      const response = await request
        .post(`${endpoint}/cancelOnDate`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + staff[0].token
        );
      expect(response.status).toBe(202);
      const id = response.body.officeHourUpdate.id;
      const officeHour = await prisma.officeHour.findUniqueOrThrow({ where: { id } });
      expect(officeHour).toBeDefined();
      expect(officeHour.isCancelledOn.length).toEqual(1);
    }, 1000);

    // Row 2
    test("office hour id is an invalid positive number (office hour does not exist)", async () => {
      const attributes = { ...baseAttributes,
        officeHourId: officeHour.id * 2
      };
      const response = await request
        .post(`${endpoint}/cancelOnDate`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + staff[0].token
        );
      expect(response.status).toBe(400);
    }, 1000);

    // Row 3 
    test("office hour id is 0", async () => {
      const attributes = { ...baseAttributes,
        officeHourId: 0
      };
      const response = await request
        .post(`${endpoint}/cancelOnDate`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + staff[0].token
        );
      expect(response.status).toBe(400);
    }, 1000);

    // Row 4
    test("office hour id is negative", async () => {
      const attributes = { ...baseAttributes,
        officeHourId: -officeHour.id
      };
      const response = await request
        .post(`${endpoint}/cancelOnDate`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + staff[0].token
        );
      expect(response.status).toBe(400);
    }, 1000);

    // Row 5
    test("date is valid date now", async () => {
      const mdy = (new Date(Date.now()).toLocaleString('en-US',{hour12:false}).split(" "))[0].split('/');
      const attributes = { ...baseAttributes,
        date: mdy[0] + "-" + mdy[1] + "-" + mdy[2]
      };
      const response = await request
        .post(`${endpoint}/cancelOnDate`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + staff[0].token
        );
      expect(response.status).toBe(409);
    }, 1000);

    // Row 6
    test("date is valid date in the past", async () => {
      const attributes = { ...baseAttributes,
        date: "01-01-2002"
      };
      const response = await request
        .post(`${endpoint}/cancelOnDate`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + staff[0].token
        );
      expect(response.status).toBe(409);
    }, 1000);
  });

  describe(`Test: ${endpoint}/cancelAll`, async () => {
    let course = {};
    let officeHour = {};
    let staff = [];
    let baseAttributes = {};

    beforeEach(async () => {
      const params = await setup();
      officeHour = params.officeHour;
      staff = params.staff;
      course = params.course;
      const date = new Date(officeHour.startDate);
      date.setDate(date.getDate() + 9); // should cancel 2 office hours
      const dateString = date.toLocaleDateString('en-US',{hour12:false}).replaceAll("/","-");
      baseAttributes = { ...baseAttributes,
        officeHourId: officeHour.id,
        date: dateString
      };
    });

    afterEach(async () => {
      await teardown(course.id);
    });

    // Row 1
    test("Base Choice Test (all valid parameters)", async () => {
      const attributes = { ...baseAttributes };
      const response = await request
        .post(`${endpoint}/cancelAll`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + staff[0].token
        )
        .set("id", staff[0].id);
      expect(response.status).toBe(202);
      const id = response.body.officeHourUpdate.id;
      const officeHour = await prisma.officeHour.findUniqueOrThrow({ where: { id } });
      expect(officeHour).toBeDefined();
      expect(officeHour.isCancelledOn.length).toEqual(2);
    }, 1000);

    // Row 2
    test("office hour id is an invalid positive number (office hour does not exist)", async () => {
      const attributes = { ...baseAttributes,
        officeHourId: officeHour.id * 2
      };
      const response = await request
        .post(`${endpoint}/cancelAll`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + staff[0].token
        );
      expect(response.status).toBe(400);
    }, 1000);

    // Row 3 
    test("office hour id is 0", async () => {
      const attributes = { ...baseAttributes,
        officeHourId: 0
      };
      const response = await request
        .post(`${endpoint}/cancelAll`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + staff[0].token
        );
      expect(response.status).toBe(400);
    }, 1000);

    // Row 4
    test("office hour id is negative", async () => {
      const attributes = { ...baseAttributes,
        officeHourId: -officeHour.id
      };
      const response = await request
        .post(`${endpoint}/cancelAll`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + staff[0].token
        );
      expect(response.status).toBe(400);
    }, 1000);

    // Row 5
    test("date is valid date now", async () => {
      const mdy = (new Date(Date.now()).toLocaleString('en-US',{hour12:false}).split(" "))[0].split('/');
      const attributes = { ...baseAttributes,
        date: mdy[0] + "-" + mdy[1] + "-" + mdy[2]
      };
      const response = await request
        .post(`${endpoint}/cancelAll`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + staff[0].token
        );
      expect(response.status).toBe(409);
    }, 1000);

    // Row 6
    test("date is valid date in the past", async () => {
      const attributes = { ...baseAttributes,
        date: "01-01-2002"
      };
      const response = await request
        .post(`${endpoint}/cancelAll`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + staff[0].token
        );
      expect(response.status).toBe(409);
    }, 1000);
  });

  describe(`Test: ${endpoint}/:officeHourId/editForDate/:date`, async () => {
    let course = {};
    let officeHour = {};
    let staff = [];
    let baseAttributes = {};

    beforeEach(async () => {
      const params = await setup();
      officeHour = params.officeHour;
      staff = params.staff;
      course = params.course;
      const newStartDate = new Date(officeHour.startDate);
      newStartDate.setHours(9);
      const newEndDate = new Date(officeHour.endDate);
      newEndDate.setHours(11);
      baseAttributes = { ...baseAttributes,
        startDate: newStartDate,
        endDate: newEndDate,
        location: "zoom"
      };
    });

    afterEach(async () => {
      await teardown(course.id);
    });

    // Row 1
    test("base choice test (all valid parameters)", async () => {
      const mdy = (new Date(officeHour.startDate).toLocaleString('en-US',{hour12:false}).split(" "))[0].split('/');
      const date = mdy[0] + "-" + mdy[1] + "-" + mdy[2].replace(",","");
      const attributes = { ...baseAttributes };
      const response = await request
        .post(`${endpoint}/${officeHour.id}/editForDate/${date}`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + staff[0].token
        );
      expect(response.status).toBe(202); 
      const editedOH = await prisma.officeHour.findFirst({ where: { id: officeHour.id } });
      expect(editedOH).toBeDefined();
      expect(editedOH)
    }, 1000);

    // Row 2
    test("office hour id is positive but invalid (does not exist)", async () => {
      const mdy = (new Date(officeHour.startDate).toLocaleString('en-US',{hour12:false}).split(" "))[0].split('/');
      const date = mdy[0] + "-" + mdy[1] + "-" + mdy[2].replace(",","");
      const attributes = { ...baseAttributes };
      const response = await request
        .post(`${endpoint}/${officeHour.id * 2}/editForDate/${date}`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + staff[0].token
        );
      expect(response.status).toBe(400); 
    }, 1000)

    // Row 3
    test("office hour id is 0", async () => {
      const mdy = (new Date(officeHour.startDate).toLocaleString('en-US',{hour12:false}).split(" "))[0].split('/');
      const date = mdy[0] + "-" + mdy[1] + "-" + mdy[2].replace(",","");
      const attributes = { ...baseAttributes };
      const response = await request
        .post(`${endpoint}/0/editForDate/${date}`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + staff[0].token
        );
      expect(response.status).toBe(400); 
    }, 1000)

    // Row 4
    test("office hour id is negative", async () => {
      const mdy = (new Date(officeHour.startDate).toLocaleString('en-US',{hour12:false}).split(" "))[0].split('/');
      const date = mdy[0] + "-" + mdy[1] + "-" + mdy[2].replace(",","");
      const attributes = { ...baseAttributes };
      const response = await request
        .post(`${endpoint}/${-officeHour.id}/editForDate/${date}`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + staff[0].token
        );
      expect(response.status).toBe(400); 
    }, 1000)

    // Row 5
    test("date is valid date now", async () => {
      const mdy = (new Date(Date.now()).toLocaleString('en-US',{hour12:false}).split(" "))[0].split('/');
      const date = mdy[0] + "-" + mdy[1] + "-" + mdy[2].replace(",","");
      const attributes = { ...baseAttributes };
      const response = await request
        .post(`${endpoint}/${-officeHour.id}/editForDate/${date}`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + staff[0].token
        );
      expect(response.status).toBe(400); 
    }, 1000);

    // Row 6
    test("date is valid date past", async () => {
      const date = "01-01-2002"
      const attributes = { ...baseAttributes };
      const response = await request
        .post(`${endpoint}/${-officeHour.id}/editForDate/${date}`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + staff[0].token
        );
      expect(response.status).toBe(400); 
    }, 1000);

    // Row 7
    test("startDate is a valid date now", async () => {
      const now = new Date(Date.now());
      const end = new Date(baseAttributes.endDate);
      const mdy = (new Date(officeHour.startDate).toLocaleString('en-US',{hour12:false}).split(" "))[0].split('/');
      const date = mdy[0] + "-" + mdy[1] + "-" + mdy[2].replace(",","");
      const attributes = { ...baseAttributes,
        startDate: new Date(Date.now)
      };
      const response = await request
        .post(`${endpoint}/${officeHour.id}/editForDate/${date}`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + staff[0].token
        );
      if ((now.minutes - end.minutes) % 5 == 0) {
        expect(response.status).toBe(202);
      } else {
        expect(response.status).toBe(400)
      }
    });

    // Row 8
    test("startDate is a valid date past", async () => {
      const mdy = (new Date(officeHour.startDate).toLocaleString('en-US',{hour12:false}).split(" "))[0].split('/');
      const date = mdy[0] + "-" + mdy[1] + "-" + mdy[2].replace(",","");
      const attributes = { ...baseAttributes,
        startDate: '2003-04-15T15:00:00.000Z'
      };
      const response = await request
        .post(`${endpoint}/${officeHour.id}/editForDate/${date}`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + staff[0].token
        );
      expect(response.status).toBe(400);
    });

    // Row 9
    test("endDate is a valid date now", async () => {
      const mdy = (new Date(officeHour.startDate).toLocaleString('en-US',{hour12:false}).split(" "))[0].split('/');
      const date = mdy[0] + "-" + mdy[1] + "-" + mdy[2].replace(",","");
      const attributes = { ...baseAttributes,
        startDate: new Date(Date.now)
      };
      const response = await request
        .post(`${endpoint}/${officeHour.id}/editForDate/${date}`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + staff[0].token
        );
      expect(response.status).toBe(400)
    });

    // Row 10
    test("endDate is a valid date past", async () => {
      const mdy = (new Date(officeHour.startDate).toLocaleString('en-US',{hour12:false}).split(" "))[0].split('/');
      const date = mdy[0] + "-" + mdy[1] + "-" + mdy[2].replace(",","");
      const attributes = { ...baseAttributes,
        endDate: '2003-04-15T15:00:00.000Z'
      };
      const response = await request
        .post(`${endpoint}/${officeHour.id}/editForDate/${date}`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + staff[0].token
        );
      expect(response.status).toBe(400);
    });

    // Row 11
    test("location is an empty string", async () => {
      const mdy = (new Date(officeHour.startDate).toLocaleString('en-US',{hour12:false}).split(" "))[0].split('/');
      const date = mdy[0] + "-" + mdy[1] + "-" + mdy[2].replace(",","");
      const attributes = { ...baseAttributes,
        location: ""
      };
      const response = await request
        .post(`${endpoint}/${officeHour.id}/editForDate/${date}`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + staff[0].token
        );
      expect(response.status).toBe(400);
    })
  });

  describe(`Test: ${endpoint}/:officeHourId/editAll`, async () => {
    let course = {};
    let officeHour = {};
    let staff = [];
    let baseAttributes = {
      location: "zoom",
      daysOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      editAfterDate: true
    };

    beforeEach(async () => {
      const params = await setup();
      officeHour = params.officeHour;
      staff = params.staff;
      course = params.course;
      const newStartDate = new Date(officeHour.startDate);
      newStartDate.setHours(9);
      const newEndDate = new Date(officeHour.endDate);
      newEndDate.setHours(11);
      baseAttributes = { ...baseAttributes,
        startDate: newStartDate,
        endDate: newEndDate,
        endDateOldOfficeHour: officeHour.endDate
      };
    });

    afterEach(async () => {
      await teardown(course.id);
    });

    // Row 1
    test("base choice test (all valid parameters)", async () => {
      const attributes = { ...baseAttributes };
      const response = await request
        .post(`${endpoint}/${officeHour.id}/editAll`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + staff[0].token
        );
      expect(response.status).toEqual(202);
    }, 1000);

    // Row 2
    test("officeHourId is an invalid positive number (OH does not exist)", async () => {
      const attributes = { ...baseAttributes };
      const response = await request
        .post(`${endpoint}/${officeHour.id * 2}/editAll`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + staff[0].token
        );
      expect(response.status).toEqual(400);
    }, 1000);

    // Row 3
    test("officeHourId is 0", async () => {
      const attributes = { ...baseAttributes };
      const response = await request
        .post(`${endpoint}/${0}/editAll`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + staff[0].token
        );
      expect(response.status).toEqual(400);
    }, 1000);

    // Row 4
    test("officeHourId is negative", async () => {
      const attributes = { ...baseAttributes };
      const response = await request
        .post(`${endpoint}/${-officeHour.id}/editAll`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + staff[0].token
        );
      expect(response.status).toEqual(400);
    }, 1000);

    // Row 5
    test("startDate is a valid date now", async () => {
      const now = new Date(Date.now());
      const end = new Date(baseAttributes.endDate);
      const attributes = { ...baseAttributes,
        startDate: now.toISOString
      };
      const response = await request
        .post(`${endpoint}/${officeHour.id}/editAll`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + staff[0].token
        );
      if ((now.minutes - end.minutes) % 5 == 0) {
        expect(response.status).toBe(202);
      } else {
        expect(response.status).toBe(400)
      }
    }, 1000);

    // Row 6
    test("startDate is a valid date past", async () => {
      const attributes = { ...baseAttributes,
        startDate: "2003-04-15T19:00:00.000Z"
      };
      const response = await request
        .post(`${endpoint}/${officeHour.id}/editAll`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + staff[0].token
        );
      expect(response.status).toBe(400)
    }, 1000);

    // Row 7
    test("endDate is a valid date now", async () => {
      const now = new Date(Date.now());
      const attributes = { ...baseAttributes,
        endDate: now.toISOString
      };
      const response = await request
        .post(`${endpoint}/${officeHour.id}/editAll`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + staff[0].token
        );
      expect(response.status).toBe(400)
    }, 1000);

    // Row 8
    test("endDate is a valid date past", async () => {
      const attributes = { ...baseAttributes,
        endDate: "2003-04-15T19:00:00.000Z"
      };
      const response = await request
        .post(`${endpoint}/${officeHour.id}/editAll`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + staff[0].token
        );
      expect(response.status).toBe(400)
    }, 1000);

    // Row 9
    test("location is an empty string", async () => {
      const attributes = { ...baseAttributes,
        location: ""
      };
      const response = await request
        .post(`${endpoint}/${officeHour.id}/editAll`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + staff[0].token
        );
      expect(response.status).toBe(400)
    }, 1000);

    // Row 10
    test("daysOfWeek is a singleton", async () => {
      const startDay = (new Date(baseAttributes.startDate)).getDay();
      const attributes = { ...baseAttributes,
        daysOfWeek: [weekday[startDay % 7]]
      };
      const response = await request
        .post(`${endpoint}/${officeHour.id}/editAll`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + staff[0].token
        );
      expect(response.status).toBe(202)
    }, 1000);

    // Row 11
    test("daysOfWeek is empty", async () => {
      const attributes = { ...baseAttributes,
        daysOfWeek: []
      };
      const response = await request
        .post(`${endpoint}/${officeHour.id}/editAll`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + staff[0].token
        );
      expect(response.status).toBe(400)
    }, 1000);

    // Row 12
    test("endDateOldOfficeHour is now", async () => {
      const attributes = { ...baseAttributes,
        endDateOldOfficeHour: (new Date(Date.now())).toISOString()
      };
      const response = await request
        .post(`${endpoint}/${officeHour.id}/editAll`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + staff[0].token
        );
      expect(response.status).toBe(202);
    }, 1000);

    // Row 13
    test("endDateOldOfficeHour is in the past", async () => {
      const attributes = { ...baseAttributes,
        endDateOldOfficeHour: "2003-04-15T19:00:00.000Z"
      };
      const response = await request
        .post(`${endpoint}/${officeHour.id}/editAll`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + staff[0].token
        );
      expect(response.status).toBe(202);
    }, 1000);

    // Row 14
    test("edit after date is false", async () => {
      const attributes = { ...baseAttributes,
        editAfterDate: false
      };
      const response = await request
        .post(`${endpoint}/${officeHour.id}/editAll`)
        .send(attributes)
        .set(
          "Authorization",
          "Bearer " + staff[0].token
        );
      expect(response.status).toBe(202);
    }, 1000); 
  });

  describe(`Test: ${endpoint}/cancelRegistration/:registrationId`, async () => {
    let course = {};
    let registration = {};
    let students = []

    beforeEach(async () => {
      const params = await setup();
      course = params.course;
      registration = params.registration;
      students = params.students;
    });

    afterEach(async () => {
      await teardown(course.id);
    });

    // Row 1
    test("base attribute (valid parameter)", async () => {
      const response = await request
      .post(`${endpoint}/cancelRegistration/${registration.id}`)
      .set(
          "Authorization",
          "Bearer " + students[0].token
        );
      expect(response.status).toBe(202);
      expect(response.body.registration.isCancelled).toBeTruthy();
    }, 1000);

    // Row 2
    test("invalid positive registration id (registration does not exist)", async () => {
      const response = await request
      .post(`${endpoint}/cancelRegistration/${registration.id * 2}`)
      .set(
          "Authorization",
          "Bearer " + students[0].token
        );
      expect(response.status).toBe(400);
    }, 1000);

    // Row 3
    test("invalid positive registration id (registration does not exist)", async () => {
      const response = await request
      .post(`${endpoint}/cancelRegistration/${0}`)
      .set(
          "Authorization",
          "Bearer " + students[0].token
        );
      expect(response.status).toBe(400);
    }, 1000);

    // Row 4
    test("invalid positive registration id (registration does not exist)", async () => {
      const response = await request
      .post(`${endpoint}/cancelRegistration/${-registration.id}`)
      .set(
          "Authorization",
          "Bearer " + students[0].token
        );
      expect(response.status).toBe(400);
    }, 1000);
  });

  describe(`Test: ${endpoint}/editRegistration/:registrationId`, async () => {
    let course = {};
    let registration = {};
    let officeHour = {};
    let topics = [];
    let students = [];
    let baseAttributes = {
      question: "Test Question"
    };

    beforeEach(async () => {
      const params = await setup();
      course = params.course;
      registration = params.registration;
      officeHour = params.officeHour;
      topics = params.topics;
      students = params.students;
      baseAttributes = { ...baseAttributes,
        registrationId: registration.id,
        officeHourId: officeHour.id,
        startTime: (new Date(registration.startTime)).toTimeString().split(" ")[0],
        endTime: (new Date(registration.endTime)).toTimeString().split(" ")[0],
        date: (new Date(officeHour.startDate).toLocaleString('en-US',{hour12:false}).split(","))[0].replaceAll("/","-"),
        TopicIds: topics.map((topic) => topic.id)
      }
    });

    afterEach(async () => {
      await teardown(course.id);
    });

    // Row 1
    test("base choice test (all valid parameters)", async () => {
      const attributes = { ...baseAttributes };
      const response = await request
      .post(`${endpoint}/editRegistration/${registration.id}`)
      .send(attributes)
      .set(
          "Authorization",
          "Bearer " + students[0].token
        );
      expect(response.status).toBe(202);
    }, 1000);

    // Row 2
    test("registration id is positive invalid (registration does not exist)", async () => {
      const attributes = { ...baseAttributes };
      const response = await request
      .post(`${endpoint}/editRegistration/${registration.id * 2}`)
      .send(attributes)
      .set(
          "Authorization",
          "Bearer " + students[0].token
        );
      expect(response.status).toBe(400);
    }, 1000);

    // Row 3
    test("registration id is 0", async () => {
      const attributes = { ...baseAttributes };
      const response = await request
      .post(`${endpoint}/editRegistration/${0}`)
      .send(attributes)
      .set(
          "Authorization",
          "Bearer " + students[0].token
        );
      expect(response.status).toBe(400);
    }, 1000);

    // Row 4
    test("registration id is negative", async () => {
      const attributes = { ...baseAttributes };
      const response = await request
      .post(`${endpoint}/editRegistration/${-registration.id}`)
      .send(attributes)
      .set(
          "Authorization",
          "Bearer " + students[0].token
        );
      expect(response.status).toBe(400);
    }, 1000);

    // Row 5
    test("office hour id is positive invalid (office hour does not exist)", async () => {
      const attributes = { ...baseAttributes,
        officeHourId: officeHour.id * 2
      };
      const response = await request
      .post(`${endpoint}/editRegistration/${registration.id}`)
      .send(attributes)
      .set(
          "Authorization",
          "Bearer " + students[0].token
        );
      expect(response.status).toBe(400);
    }, 1000);

    // Row 6
    test("office hour id is 0", async () => {
      const attributes = { ...baseAttributes,
        officeHourId: 0
      };
      const response = await request
      .post(`${endpoint}/editRegistration/${registration.id}`)
      .send(attributes)
      .set(
          "Authorization",
          "Bearer " + students[0].token
        );
      expect(response.status).toBe(400);
    }, 1000);

    // Row 7
    test("office hour id is negative", async () => {
      const attributes = { ...baseAttributes,
        officeHourId: -officeHour.id
      };
      const response = await request
      .post(`${endpoint}/editRegistration/${registration.id}`)
      .send(attributes)
      .set(
          "Authorization",
          "Bearer " + students[0].token
        );
      expect(response.status).toBe(400);
    }, 1000);

    // Row 8
    test("start and end time is a valid PM time", async () => {
      const attributes = { ...baseAttributes,
        startTime: "12:00:00",
        endTime: "12:10:00"
      };
      const response = await request
      .post(`${endpoint}/editRegistration/${registration.id}`)
      .send(attributes)
      .set(
          "Authorization",
          "Bearer " + students[0].token
        );
      expect(response.status).toBe(202);
    }, 1000);

    // Row 9
    test("start time is an empty string", async () => {
      const attributes = { ...baseAttributes,
        startTime: ""
      };
      const response = await request
      .post(`${endpoint}/editRegistration/${registration.id}`)
      .send(attributes)
      .set(
          "Authorization",
          "Bearer " + students[0].token
        );
      expect(response.status).toBe(409);
    }, 1000);

    // Row 10
    test("start time is a non empty string that is not a time", async () => {
      const attributes = { ...baseAttributes,
        startTime: "Hello World"
      };
      const response = await request
      .post(`${endpoint}/editRegistration/${registration.id}`)
      .send(attributes)
      .set(
          "Authorization",
          "Bearer " + students[0].token
        );
      expect(response.status).toBe(409);
    }, 1000);
 
    // Row 11
    test("end time is an empty string", async () => {
      const attributes = { ...baseAttributes,
        endTime: ""
      };
      const response = await request
      .post(`${endpoint}/editRegistration/${registration.id}`)
      .send(attributes)
      .set(
          "Authorization",
          "Bearer " + students[0].token
        );
      expect(response.status).toBe(409);
    }, 1000);

    // Row 12
    test("end time is a non empty string that is not a time", async () => {
      const attributes = { ...baseAttributes,
        endTime: "Hello World"
      };
      const response = await request
      .post(`${endpoint}/editRegistration/${registration.id}`)
      .send(attributes)
      .set(
          "Authorization",
          "Bearer " + students[0].token
        );
      expect(response.status).toBe(409);
    }, 1000);

    // Row 13
    test("date is a valid date now", async () => {
      const attributes = { ...baseAttributes,
        date: (new Date().toLocaleString('en-US',{hour12:false}).split(","))[0].replaceAll("/","-")
      };
      const response = await request
      .post(`${endpoint}/editRegistration/${registration.id}`)
      .send(attributes)
      .set(
          "Authorization",
          "Bearer " + students[0].token
        );
        console.log("response: " + response.text);
      expect(response.status).toBe(409);
    }, 1000);

    // Row 14
    test("date is a valid date in the past", async () => {
      const attributes = { ...baseAttributes,
        date: "2002-01-01"
      };
      const response = await request
      .post(`${endpoint}/editRegistration/${registration.id}`)
      .send(attributes)
      .set(
          "Authorization",
          "Bearer " + students[0].token
        );
      expect(response.status).toBe(409);
    }, 1000);

    // Row 15
    test("question is an empty string", async () => {
      const attributes = { ...baseAttributes,
        question: ""
      };
      const response = await request
      .post(`${endpoint}/editRegistration/${registration.id}`)
      .send(attributes)
      .set(
          "Authorization",
          "Bearer " + students[0].token
        );
      expect(response.status).toBe(202);
    }, 1000); 

    // Row 16
    test("TopicIds is a singleton", async () => {
      const attributes = { ...baseAttributes,
        TopicIds: [topics[0].id]
      };
      const response = await request
      .post(`${endpoint}/editRegistration/${registration.id}`)
      .send(attributes)
      .set(
          "Authorization",
          "Bearer " + students[0].token
        );
      expect(response.status).toBe(202);
    }, 1000); 
 
    // Row 17
    test("TopicIds is empty", async () => {
      const attributes = { ...baseAttributes,
        TopicIds: []
      };
      const response = await request
      .post(`${endpoint}/editRegistration/${registration.id}`)
      .send(attributes)
      .set(
          "Authorization",
          "Bearer " + students[0].token
        );
      expect(response.status).toBe(202);
    }, 1000); 
  });

  /* The remaining tests are for the GET methods and thus we will not use equivalence partitioning */
  describe(`Test: ${endpoint}/:officeHourId/getRemainingTimeSlots/:date`, async () => {
    let course = {};
    let officeHour = {};
    let students = [];

    beforeEach(async () => {
      const params = await setup();
      course = params.course;
      officeHour = params.officeHour;
      students = params.students;
    });

    afterEach(async () => {
      await teardown(course.id);
    });

    test("get time slot for valid date", async () => {
      const date = (new Date(officeHour.startDate)).toLocaleDateString("en-us").replaceAll("/", "-");
      const response = await request
      .get(`${endpoint}/${officeHour.id}/getRemainingTimeSlots/${date}`)
      .set(
        "Authorization",
        "Bearer " + students[0].token
      );
      expect(response.status).toBe(202);
      expect(response.body.timeSlotsPerType).toBeDefined();
    }, 1000);

    test("get time slot for invalid date", async () => {
      const date = new Date(officeHour.startDate);
      date.setDate(date.getDate() + 1);
      const dateString = date.toLocaleDateString("en-us").replaceAll("/", "-");
      const response = await request
      .get(`${endpoint}/${officeHour.id}/getRemainingTimeSlots/${dateString}`)
      .set(
        "Authorization",
        "Bearer " + students[0].token
      );
      expect(response.status).toBe(409);
    }, 1000);

    test("get time slot for invalid office hour id", async () => {
      const date = new Date(officeHour.startDate);
      date.setDate(date.getDate() + 1);
      const dateString = date.toLocaleDateString("en-us").replaceAll("/", "-");
      const response = await request
      .get(`${endpoint}/${officeHour.id * 2}/getRemainingTimeSlots/${dateString}`)
      .set(
        "Authorization",
        "Bearer " + students[0].token
      );
      expect(response.status).toBe(400);
    }, 1000);
  });

  describe(`Test: ${endpoint}/:officeHourId`, async () => {
    let course = {};
    let officeHour = {};
    let students = [];

    beforeEach(async () => {
      const params = await setup();
      course = params.course;
      officeHour = params.officeHour;
      students = params.students;
    });

    afterEach(async () => {
      await teardown(course.id);
    });

    test("get office hour with valid id", async () => {
      const response = await request
      .get(`${endpoint}/${officeHour.id}`)
      .set(
        "Authorization",
        "Bearer " + students[0].token
      );
      expect(response.status).toBe(202); 
      expect(response.body.officeHour.id).toEqual(officeHour.id);
    }, 1000);

    test("get office hour with invalid id", async () => {
      const response = await request
        .get(`${endpoint}/${officeHour.id}`)
        .set(
          "Authorization",
          "Bearer " + students[0].token
        );
      expect(response.status).toBe(400); 
    }, 1000);
  });

  describe.skip(`Test Daylight Savings`, async () => {

  });
});