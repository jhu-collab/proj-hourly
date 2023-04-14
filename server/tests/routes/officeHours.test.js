import supertest from "supertest";
import { test, expect, beforeAll, describe, afterAll } from "vitest";
import app from "../../src/index.js";
import prisma from "../../prisma/client.js";
import { createToken } from "../../src/util/helpers.js";

const request = supertest(app);
const endpoint = "/api/officeHour";

test (`Test endpoint ${endpoint}`, () => {
  
  beforeAll(async () => {
    await prisma.account.createMany({
      data: [
        {
          name: "Test Student I",
          email: "student1@test.io",
          role: "USER"
        },
        {
          name: "Test Student II",
          email: "student2@test.io",
          role: "USER"
        },
        {
          name: "Test Student III",
          email: "student3@test.io",
          role: "USER"
        },
        {
          name: "Test Staff I",
          email: "staff1@test.io",
          role: "USER"
        },
        {
          name: "Test Staff II",
          email: "staff2@test.io",
          role: "USER"
        },
        {
          name: "Test Staff III",
          email: "staff2@test.io",
          role: "USER"
        },
        {
          name: "Test Instructor I",
          email: "instructor1@test.io",
          role: "ADMIN"
        },
        {
          name: "Test Instructor II",
          email: "instructor2@test.io",
          role: "ADMIN"
        }
      ]
    });

    let students = await prisma.account
      .findMany({ where: { name: { contains: "Student" } } })
      .map((student) => ({
        ...student,
        token: createToken({ student }),
        expiredToken: createToken({ student, expiresIn: "0" }),
      }));

    let staff = await prisma.account
      .findMany({ where: { name: { contains: "Staff" } } })
      .map((_staff) => ({
        ..._staff,
        token: createToken({ _staff }),
        expiredToken: createToken({ _staff, expiresIn: "0" }),
      }));

    let instructors = await prisma.account
      .findMany({ where: { name: { contains: "Instructor" } } })
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

    let prefilledCourse = await prisma.course.findUnique({ where: { id: 101 } });

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
  })
})