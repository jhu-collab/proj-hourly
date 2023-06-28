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

describe(`Test endpoint ${endpoint}`, () => {
  let ids = {
    users: [],
    courses: [],
    calendarEvents: [],
  };
  beforeAll(async () => {
    // create users
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

  });
});