import supertest from "supertest";
import { test, expect, beforeAll, describe, afterAll } from "vitest";
import app from "../../src/index.js";
import prisma from "../../prisma/client.js";
import { createToken } from "../../src/util/helpers.js";

const request = supertest(app);
const endpoint = "/api/officeHour";

let students = [];
let staff = [];
let instructors = [];
let prefilledCourse = null;

beforeAll(async () => {
  const deleteUsers = prisma.account.deleteMany();

  await prisma.$transaction([deleteUsers]);

  await prisma.account.createMany({
    data: [
      {
        userName: "Test Student I",
        hashedPassword: "Test Password I",
        email: "student1@test.io",
        firstName: "Test First Name I",
        lastName: "Test Last Name I",
      },
      {
        userName: "Test Student II",
        hashedPassword: "Test Password II",
        email: "student2@test.io",
        firstName: "Test First Name II",
        lastName: "Test Last Name II",
      },
      {
        userName: "Test Student III",
        hashedPassword: "Test Password III",
        email: "student3@test.io",
        firstName: "Test First Name III",
        lastName: "Test Last Name III",
      },
      {
        userName: "Test Staff I",
        hashedPassword: "Test Password I",
        email: "staff1@test.io",
        firstName: "Test First Name IV",
        lastName: "Test Last Name IV",
      },
      {
        userName: "Test Staff II",
        hashedPassword: "Test Password II",
        email: "staff2@test.io",
        firstName: "Test First Name V",
        lastName: "Test Last Name V",
      },
      {
        userName: "Test Staff III",
        hashedPassword: "Test Password II",
        email: "staff3@test.io",
        firstName: "Test First Name V",
        lastName: "Test Last Name V",
      },
      {
        userName: "Test Instructor I",
        hashedPassword: "Test Password I",
        email: "instructor1@test.io",
        firstName: "Test First Name VI",
        lastName: "Test Last Name VI",
      },
      {
        userName: "Test Instructor II",
        hashedPassword: "Test Password II",
        email: "instructor2@test.io",
        firstName: "Test First Name VII",
        lastName: "Test Last Name VII",
      }
    ]
  });

  students = await prisma.account.findMany({ where: { userName: { contains: "Student" } } });
  students = students
    .map((student) => ({
      ...student,
      token: createToken({ student }),
      expiredToken: createToken({ student, expiresIn: "0" }),
    }));

  staff = await prisma.account.findMany({ where: { name: { contains: "Staff" } } });
  staff = staff
    .map((_staff) => ({
      ..._staff,
      token: createToken({ _staff }),
      expiredToken: createToken({ _staff, expiresIn: "0" }),
    }));

  instructors = await prisma.account.findMany({ where: { name: { contains: "Instructor" } } });
  instructors = instructors
    .map((instructor) => ({
      ...instructor,
      token: createToken({ instructor }),
      expiredToken: createToken({ instructor, expiresIn: "0" }),
    }));

  const now = new Date(Date.now());

  await prisma.course.createMany({
    data: [
      {
        id: 100,
        title: "Test Course I",
        courseNumber: "1.1.1.1",
        semester: "Fall",
        calendarYear: 2023,
        code: "abcdef",
        students: students,
        courseStaff: staff,
        instructors: instructors,
        officeHours: [],
        officeHourOptions: [],
        topics: [],
        iCalJson: null,
        startRegConstraint: 48,
        endRegConstraint: 2
      },
      {
        id: 101,
        title: "Test Course II",
        courseNumber: "2.2.2.2",
        semester: "Fall",
        calendarYear: 2023,
        code: "ghijkl",
        students: students,
        courseStaff: staff,
        instructors: instructors,
        officeHours: [],
        officeHourOptions: [],
        topics: [],
        iCalJson: null,
        startRegConstraint: 48,
        endRegConstraint: 2
      }
    ]
  });

  prefilledCourse = await prisma.course.findUnique({ where: { id: 101 } });

  await prisma.officeHour.createMany({
    data: [
      {
        id: 100,
        startDate: new Date(now.getFullYear(), now.getMonth(), now.getDay(), 12), // today at 12PM or 12:00
        endDate: new Date(now.getFullYear(), now.getMonth(), now.getDay(), 13), // today at 1PM or 13:00
        course: prefilledCourse,
        courseId: prefilledCourse.id, // 101
        location: "zoom",
        isRecurring: false,
        hosts: staff,
        isCancelledOn: [],
        isOnDayOfweek: [],
        registrations: [],
        isDeleted: false
      },
      {
        id: 101,
        startDate: new Date(now.getFullYear(), now.getMonth(), now.getDay(), 9), // today at 9AM or 09:00
        endDate: new Date(now.getFullYear(), now.getMonth(), now.getDay(), 11), // today at 11AM or 11:00
        course: prefilledCourse,
        courseId: prefilledCourse.id, // 101
        location: "zoom",
        isRecurring: false,
        hosts: staff,
        isCancelledOn: [],
        isOnDayOfweek: [],
        registrations: [],
        isDeleted: false
      }, 
    ]
  });

  const officeHours = await prisma.officeHour.findMany({
    orderBy: { id: "asc" }
  });

  await prisma.course.update({
    where: {
      id: 101
    },
    data: {
      officeHours: officeHours
    }
  })
});

test (`Test endpoint ${endpoint}`, () => {


  

  describe("create", () => {
    test("test 1", async () => {
      const attributes = {
        id: 100,
        startDate: new Date(now.getFullYear(), now.getMonth(), now.getDay(), 12), // today at 12PM or 12:00
        endDate: new Date(now.getFullYear(), now.getMonth(), now.getDay(), 13), // today at 1PM or 13:00
        courseId: prefilledCourse.id, // 101
        location: "zoom",
        isRecurring: false,
        hosts: staff,
        isCancelledOn: [],
        isOnDayOfweek: [],
        registrations: [],
        isDeleted: false 
      }
      const response = await request.post(`${endpoint}`).body(attributes);
      expect(response.status).toBe(0);
    });
  })

  afterAll(async() => {
    const deleteUsers = prisma.account.deleteMany();

    await prisma.$transaction([deleteUsers]);

    await prisma.$disconnect();
    // Tear down the test database by `yarn docker:down`
  })
})