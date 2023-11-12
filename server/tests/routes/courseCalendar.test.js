import supertest from "supertest";
import { it, expect, beforeAll, describe, afterAll, afterEach } from "vitest";
import app from "../../src/index.js";
import prisma from "../../prisma/client.js";
import { weekday } from "../../src/util/courseCalendarValidator.js";
import { Role } from "@prisma/client";
import { createToken } from "../../src/util/helpers.js";

const request = supertest(app);
const endpoint = "/api/calendarEvent";

describe(`Test endpoint ${endpoint}`, () => {
  let students = [];
  let instructor = {};
  let course = {};
  let calendarEvents = [];

  beforeAll(async () => {
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

    // users auth tokens

    let noTokenStud = await prisma.account.findMany({
      orderBy: {
        id: "asc",
      },
      where: { userName: { contains: "Test Student" } },
    });
    students = noTokenStud.map((user) => ({
      ...user,
      token: createToken({ user }),
      expiredToken: createToken({ user, expiresIn: "0" }),
    }));

    const noTokenInst = await prisma.account.findFirst({
      where: { userName: { contains: "Test Instructor" } },
    });

    instructor = {
      ...noTokenInst,
      token: createToken({ user: noTokenInst }),
      expiredToken: createToken({ user: noTokenInst, expiresIn: "0" }),
    };

    course = await prisma.course.create({
      data: {
        title: "Test Course",
        courseNumber: "0",
        semester: "Fall",
        calendarYear: 2023,
        code: "AAAAAZ",
        iCalJson: undefined,
        startRegConstraint: 72,
        endRegConstraint: 0,
        students: {
          connect: [{ id: students[0].id }, { id: students[1].id }],
        },
        instructors: {
          connect: {
            id: instructor.id,
          },
        },
      },
    });
  });

  describe(`Test POST: ${endpoint}/create`, async () => {
    it("Return 401 when no body is included", async () => {
      const attributes = {};
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes);
      expect(response.status).toBe(401);
    });

    it("Return 401 when no authorization token is provided", async () => {
      let courseDate = new Date();
      courseDate.setMonth(courseDate.getMonth() + 3);
      if (courseDate.getMonth() == 2 || courseDate.getMonth() == 10) {
        courseDate.setMonth(courseDate.getMonth() + 2);
      } else if (courseDate.getMonth() == 3 || courseDate.getMonth() == 11) {
        courseDate.setMonth(courseDate.getMonth() + 1);
      }
      let secondCourseDate = new Date(courseDate);
      secondCourseDate.setMonth(courseDate.getMonth() + 1);
      var tzoffset = courseDate.getTimezoneOffset() * 60000;
      var tzoffset2 = secondCourseDate.getTimezoneOffset() * 60000;
      const attributes = {
        title: "Calendar Event I",
        courseId: course.id,
        begDate: new Date(courseDate - tzoffset).toISOString().split("T")[0],
        endDate: new Date(secondCourseDate - tzoffset2)
          .toISOString()
          .split("T")[0],
        daysOfWeek: [weekday[courseDate.getDay()]],
        location: "zoom",
        isRemote: true,
      };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes);
      expect(response.status).toBe(401);
    });

    it("Return 401 when authorization token is expired", async () => {
      let courseDate = new Date();
      courseDate.setMonth(courseDate.getMonth() + 3);
      if (courseDate.getMonth() == 2 || courseDate.getMonth() == 10) {
        courseDate.setMonth(courseDate.getMonth() + 2);
      } else if (courseDate.getMonth() == 3 || courseDate.getMonth() == 11) {
        courseDate.setMonth(courseDate.getMonth() + 1);
      }
      let secondCourseDate = new Date(courseDate);
      secondCourseDate.setMonth(courseDate.getMonth() + 1);
      var tzoffset = courseDate.getTimezoneOffset() * 60000;
      var tzoffset2 = secondCourseDate.getTimezoneOffset() * 60000;
      const attributes = {
        title: "Calendar Event I",
        courseId: course.id,
        begDate: new Date(courseDate - tzoffset).toISOString().split("T")[0],
        endDate: new Date(secondCourseDate - tzoffset2)
          .toISOString()
          .split("T")[0],
        daysOfWeek: [weekday[courseDate.getDay()]],
        location: "zoom",
        isRemote: true,
      };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.expiredToken);
      expect(response.status).toBe(401);
    });

    it("Return 403 when invalid user", async () => {
      let courseDate = new Date();
      courseDate.setMonth(courseDate.getMonth() + 3);
      if (courseDate.getMonth() == 2 || courseDate.getMonth() == 10) {
        courseDate.setMonth(courseDate.getMonth() + 2);
      } else if (courseDate.getMonth() == 3 || courseDate.getMonth() == 11) {
        courseDate.setMonth(courseDate.getMonth() + 1);
      }
      let secondCourseDate = new Date(courseDate);
      secondCourseDate.setMonth(courseDate.getMonth() + 1);
      var tzoffset = courseDate.getTimezoneOffset() * 60000;
      var tzoffset2 = secondCourseDate.getTimezoneOffset() * 60000;
      const attributes = {
        title: "Calendar Event I",
        courseId: course.id,
        begDate: new Date(courseDate - tzoffset).toISOString().split("T")[0],
        endDate: new Date(secondCourseDate - tzoffset2)
          .toISOString()
          .split("T")[0],
        daysOfWeek: [weekday[courseDate.getDay()]],
        location: "zoom",
        isRemote: true,
      };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(403);
    });

    it("Return 400 when course ID is invalid and nonzero", async () => {
      let courseDate = new Date();
      courseDate.setMonth(courseDate.getMonth() + 3);
      if (courseDate.getMonth() == 2 || courseDate.getMonth() == 10) {
        courseDate.setMonth(courseDate.getMonth() + 2);
      } else if (courseDate.getMonth() == 3 || courseDate.getMonth() == 11) {
        courseDate.setMonth(courseDate.getMonth() + 1);
      }
      let secondCourseDate = new Date(courseDate);
      secondCourseDate.setMonth(courseDate.getMonth() + 1);
      var tzoffset = courseDate.getTimezoneOffset() * 60000;
      var tzoffset2 = secondCourseDate.getTimezoneOffset() * 60000;
      const attributes = {
        title: "Calendar Event I",
        courseId: course.id * 2,
        begDate: new Date(courseDate - tzoffset).toISOString().split("T")[0],
        endDate: new Date(secondCourseDate - tzoffset2)
          .toISOString()
          .split("T")[0],
        daysOfWeek: [weekday[courseDate.getDay()]],
        location: "zoom",
        isRemote: true,
      };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when course ID is 0", async () => {
      let courseDate = new Date();
      courseDate.setMonth(courseDate.getMonth() + 3);
      if (courseDate.getMonth() == 2 || courseDate.getMonth() == 10) {
        courseDate.setMonth(courseDate.getMonth() + 2);
      } else if (courseDate.getMonth() == 3 || courseDate.getMonth() == 11) {
        courseDate.setMonth(courseDate.getMonth() + 1);
      }
      let secondCourseDate = new Date(courseDate);
      secondCourseDate.setMonth(courseDate.getMonth() + 1);
      var tzoffset = courseDate.getTimezoneOffset() * 60000;
      var tzoffset2 = secondCourseDate.getTimezoneOffset() * 60000;
      const attributes = {
        title: "Calendar Event I",
        courseId: 0,
        begDate: new Date(courseDate - tzoffset).toISOString().split("T")[0],
        endDate: new Date(secondCourseDate - tzoffset2)
          .toISOString()
          .split("T")[0],
        daysOfWeek: [weekday[courseDate.getDay()]],
        location: "zoom",
        isRemote: true,
      };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when Course ID < 0", async () => {
      let courseDate = new Date();
      courseDate.setMonth(courseDate.getMonth() + 3);
      if (courseDate.getMonth() == 2 || courseDate.getMonth() == 10) {
        courseDate.setMonth(courseDate.getMonth() + 2);
      } else if (courseDate.getMonth() == 3 || courseDate.getMonth() == 11) {
        courseDate.setMonth(courseDate.getMonth() + 1);
      }
      let secondCourseDate = new Date(courseDate);
      secondCourseDate.setMonth(courseDate.getMonth() + 1);
      var tzoffset = courseDate.getTimezoneOffset() * 60000;
      var tzoffset2 = secondCourseDate.getTimezoneOffset() * 60000;
      const attributes = {
        title: "Calendar Event I",
        courseId: -course.id,
        begDate: new Date(courseDate - tzoffset).toISOString().split("T")[0],
        endDate: new Date(secondCourseDate - tzoffset2)
          .toISOString()
          .split("T")[0],
        daysOfWeek: [weekday[courseDate.getDay()]],
        location: "zoom",
        isRemote: true,
      };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    // it("Return 400 when begDate is a date now", async () => {
    //   let courseDate = new Date();
    //   courseDate.setMonth(courseDate.getMonth() + 3);
    // while (courseDate.getMonth() == 2 || courseDate.getMonth() == 3 || courseDate.getMonth() == 10 || courseDate.getMonth() == 11) {
    //   courseDate.setMonth(courseDate.getMonth() + 1);
    // }
    //   let secondCourseDate = new Date(courseDate);
    //   secondCourseDate.setMonth(courseDate.getMonth() + 1);
    //   var tzoffset = courseDate.getTimezoneOffset() * 60000;
    //   var tzoffset2 = new Date().getTimezoneOffset() * 60000;
    //   const attributes = {
    //     title: "Calendar Event I",
    //     courseId: course.id,
    //     begDate: new Date(new Date() - tzoffset2).toISOString().split("T")[0],
    //     endDate: new Date(secondCourseDate - tzoffset)
    //       .toISOString()
    //       .split("T")[0],
    //     daysOfWeek: [weekday[courseDate.getDay()]],
    //     location: "zoom",
    //     isRemote: true,
    //   };
    //   const response = await request
    //     .post(`${endpoint}/create`)
    //     .send(attributes)
    //     .set("Authorization", "Bearer " + instructor.token);
    //   expect(response.status).toBe(400);
    // });

    // it("Return 400 when begDate is a date in the past", async () => {
    //   let courseDate = new Date();
    //   courseDate.setMonth(courseDate.getMonth() + 3);
    //   while (courseDate.getMonth() == 2 || courseDate.getMonth() == 3 || courseDate.getMonth() == 10 || courseDate.getMonth() == 11) {
    //    courseDate.setMonth(courseDate.getMonth() + 1);
    //   }
    //   let secondCourseDate = new Date(courseDate);
    //   secondCourseDate.setMonth(courseDate.getMonth() + 1);
    //   let pastDate = new Date();
    //   pastDate.setMonth(pastDate.getMonth() - 3);
    //   var tzoffset = secondCourseDate.getTimezoneOffset() * 60000;
    //   var tzoffset2 = pastDate.getTimezoneOffset() * 60000;
    //   const attributes = {
    //     title: "Calendar Event I",
    //     courseId: course.id,
    //     begDate: new Date(pastDate - tzoffset2).toISOString().split("T")[0],
    //     endDate: new Date(secondCourseDate - tzoffset)
    //       .toISOString()
    //       .split("T")[0],
    //     daysOfWeek: [weekday[courseDate.getDay()]],
    //     location: "zoom",
    //     isRemote: true,
    //   };
    //   const response = await request
    //     .post(`${endpoint}/create`)
    //     .send(attributes)
    //     .set("Authorization", "Bearer " + instructor.token);
    //   expect(response.status).toBe(400);
    // });

    it("Return 400 when endDate is a date now", async () => {
      let courseDate = new Date();
      courseDate.setMonth(courseDate.getMonth() + 3);
      if (courseDate.getMonth() == 2 || courseDate.getMonth() == 10) {
        courseDate.setMonth(courseDate.getMonth() + 2);
      } else if (courseDate.getMonth() == 3 || courseDate.getMonth() == 11) {
        courseDate.setMonth(courseDate.getMonth() + 1);
      }
      let secondCourseDate = new Date(courseDate);
      secondCourseDate.setMonth(courseDate.getMonth() + 1);
      var tzoffset = courseDate.getTimezoneOffset() * 60000;
      var tzoffset2 = new Date().getTimezoneOffset() * 60000;
      const attributes = {
        title: "Calendar Event I",
        courseId: course.id,
        begDate: new Date(courseDate - tzoffset).toISOString().split("T")[0],
        endDate: new Date(new Date() - tzoffset2).toISOString().split("T")[0],
        daysOfWeek: [weekday[courseDate.getDay()]],
        location: "zoom",
        isRemote: true,
      };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when endDate is a date in the past", async () => {
      let courseDate = new Date();
      courseDate.setMonth(courseDate.getMonth() + 3);
      if (courseDate.getMonth() == 2 || courseDate.getMonth() == 10) {
        courseDate.setMonth(courseDate.getMonth() + 2);
      } else if (courseDate.getMonth() == 3 || courseDate.getMonth() == 11) {
        courseDate.setMonth(courseDate.getMonth() + 1);
      }
      let secondCourseDate = new Date(courseDate);
      secondCourseDate.setMonth(courseDate.getMonth() + 1);
      let pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 3);
      var tzoffset = courseDate.getTimezoneOffset() * 60000;
      var tzoffset2 = pastDate.getTimezoneOffset() * 60000;
      const attributes = {
        title: "Calendar Event I",
        courseId: course.id,
        begDate: new Date(courseDate - tzoffset).toISOString().split("T")[0],
        endDate: new Date(pastDate - tzoffset2).toISOString().split("T")[0],
        daysOfWeek: [weekday[courseDate.getDay()]],
        location: "zoom",
        isRemote: true,
      };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when title is empty", async () => {
      let courseDate = new Date();
      courseDate.setMonth(courseDate.getMonth() + 3);
      if (courseDate.getMonth() == 2 || courseDate.getMonth() == 10) {
        courseDate.setMonth(courseDate.getMonth() + 2);
      } else if (courseDate.getMonth() == 3 || courseDate.getMonth() == 11) {
        courseDate.setMonth(courseDate.getMonth() + 1);
      }
      let secondCourseDate = new Date(courseDate);
      secondCourseDate.setMonth(courseDate.getMonth() + 1);
      var tzoffset = courseDate.getTimezoneOffset() * 60000;
      var tzoffset2 = secondCourseDate.getTimezoneOffset() * 60000;
      const attributes = {
        title: "",
        courseId: course.id,
        begDate: new Date(courseDate - tzoffset).toISOString().split("T")[0],
        endDate: new Date(secondCourseDate - tzoffset2)
          .toISOString()
          .split("T")[0],
        daysOfWeek: [weekday[courseDate.getDay()]],
        location: "zoom",
        isRemote: true,
      };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    // it("Return 400 when location is empty", async () => {
    //   let courseDate = new Date();
    //   courseDate.setMonth(courseDate.getMonth() + 3);
    // while (courseDate.getMonth() == 2 || courseDate.getMonth() == 3 || courseDate.getMonth() == 10 || courseDate.getMonth() == 11) {
    //   courseDate.setMonth(courseDate.getMonth() + 1);
    // }
    //   let secondCourseDate = new Date(courseDate);
    //   secondCourseDate.setMonth(courseDate.getMonth() + 1);
    //   var tzoffset = courseDate.getTimezoneOffset() * 60000;
    //   var tzoffset2 = secondCourseDate.getTimezoneOffset() * 60000;
    //   const attributes = {
    //     title: "Calendar Event I",
    //     courseId: course.id,
    //     begDate: new Date(courseDate - tzoffset).toISOString().split("T")[0],
    //     endDate: new Date(secondCourseDate - tzoffset2)
    //       .toISOString()
    //       .split("T")[0],
    //     daysOfWeek: [weekday[courseDate.getDay()]],
    //     location: "",
    //     isRemote: true,
    //   };
    //   const response = await request
    //     .post(`${endpoint}/create`)
    //     .send(attributes)
    //     .set("Authorization", "Bearer " + instructor.token);
    //   expect(response.status).toBe(400);
    // });

    it("Return 400 when daysOfWeek is empty", async () => {
      let courseDate = new Date();
      courseDate.setMonth(courseDate.getMonth() + 3);
      if (courseDate.getMonth() == 2 || courseDate.getMonth() == 10) {
        courseDate.setMonth(courseDate.getMonth() + 2);
      } else if (courseDate.getMonth() == 3 || courseDate.getMonth() == 11) {
        courseDate.setMonth(courseDate.getMonth() + 1);
      }
      let secondCourseDate = new Date(courseDate);
      secondCourseDate.setMonth(courseDate.getMonth() + 1);
      var tzoffset = courseDate.getTimezoneOffset() * 60000;
      var tzoffset2 = secondCourseDate.getTimezoneOffset() * 60000;
      const attributes = {
        title: "Calendar Event I",
        courseId: course.id,
        begDate: new Date(courseDate - tzoffset).toISOString().split("T")[0],
        endDate: new Date(secondCourseDate - tzoffset2)
          .toISOString()
          .split("T")[0],
        daysOfWeek: [],
        location: "zoom",
        isRemote: true,
      };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when daysOfWeek is invalid", async () => {
      let courseDate = new Date();
      courseDate.setMonth(courseDate.getMonth() + 3);
      if (courseDate.getMonth() == 2 || courseDate.getMonth() == 10) {
        courseDate.setMonth(courseDate.getMonth() + 2);
      } else if (courseDate.getMonth() == 3 || courseDate.getMonth() == 11) {
        courseDate.setMonth(courseDate.getMonth() + 1);
      }
      let secondCourseDate = new Date(courseDate);
      secondCourseDate.setMonth(courseDate.getMonth() + 1);
      var tzoffset = courseDate.getTimezoneOffset() * 60000;
      var tzoffset2 = secondCourseDate.getTimezoneOffset() * 60000;
      const attributes = {
        title: "Calendar Event I",
        courseId: course.id,
        begDate: new Date(courseDate - tzoffset).toISOString().split("T")[0],
        endDate: new Date(secondCourseDate - tzoffset2)
          .toISOString()
          .split("T")[0],
        daysOfWeek: [weekday[courseDate.getDay()], "Jamie"],
        location: "zoom",
        isRemote: true,
      };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when beginning date is not on day in daysOfWeek", async () => {
      let courseDate = new Date();
      courseDate.setMonth(courseDate.getMonth() + 3);
      if (courseDate.getMonth() == 2 || courseDate.getMonth() == 10) {
        courseDate.setMonth(courseDate.getMonth() + 2);
      } else if (courseDate.getMonth() == 3 || courseDate.getMonth() == 11) {
        courseDate.setMonth(courseDate.getMonth() + 1);
      }
      let secondCourseDate = new Date(courseDate);
      secondCourseDate.setMonth(courseDate.getMonth() + 1);
      var tzoffset = courseDate.getTimezoneOffset() * 60000;
      var tzoffset2 = secondCourseDate.getTimezoneOffset() * 60000;
      const attributes = {
        title: "Calendar Event I",
        courseId: course.id,
        begDate: new Date(courseDate - tzoffset).toISOString().split("T")[0],
        endDate: new Date(secondCourseDate - tzoffset2)
          .toISOString()
          .split("T")[0],
        daysOfWeek: [weekday[(courseDate.getDay() + 1) % 7]],
        location: "zoom",
        isRemote: true,
      };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 201 when event is created", async () => {
      let courseDate = new Date();
      courseDate.setMonth(courseDate.getMonth() + 3);
      if (courseDate.getMonth() == 1 || courseDate.getMonth() == 9) {
        courseDate.setMonth(courseDate.getMonth() + 2);
      } else if (courseDate.getMonth() == 2 || courseDate.getMonth() == 10) {
        courseDate.setMonth(courseDate.getMonth() + 1);
      }
      let secondCourseDate = new Date(courseDate);
      secondCourseDate.setMonth(courseDate.getMonth() + 1);
      var tzoffset = courseDate.getTimezoneOffset() * 60000;
      var tzoffset2 = secondCourseDate.getTimezoneOffset() * 60000;
      const attributes = {
        title: "Calendar Event",
        courseId: course.id,
        begDate: new Date(courseDate - tzoffset).toISOString().split("T")[0],
        endDate: new Date(secondCourseDate - tzoffset2)
          .toISOString()
          .split("T")[0],
        daysOfWeek: [weekday[courseDate.getDay()]],
        location: "zoom",
        isRemote: true,
      };
      const response = await request
        .post(`${endpoint}/create`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      calendarEvents = await prisma.calendarEvent.findMany({
        where: {
          courseId: course.id,
        },
        orderBy: {
          date: "asc",
        },
      });
      expect(response.status).toBe(201);

      let dates = [];
      for (let i in calendarEvents) {
        dates.push(calendarEvents[i].date);
      }

      const calendarJSON = response.body.eventJSon;
      calendarEvents = [];
      for (let i in calendarJSON) {
        calendarEvents.push(calendarJSON[i]);
      }
      const createdEvents = await prisma.calendarEvent.findMany({
        where: {
          courseId: attributes.courseId,
        },
        orderBy: {
          date: "asc",
        },
      });
      expect(createdEvents).toBeDefined();
      for (let i in createdEvents) {
        expect(createdEvents[i].title).toBe(attributes.title);
        expect(createdEvents[i].date).toStrictEqual(dates[i]);
        expect(createdEvents[i].location).toBe(attributes.location);
        expect(createdEvents[i].allDay).toBe(true);
        expect(createdEvents[i].isCancelled).toBe(false);
        expect(createdEvents[i].isRemote).toBe(attributes.isRemote);
        expect(createdEvents[i].courseId).toBe(attributes.courseId);
        expect(response.status).toBe(201);
      }
    });
  });

  describe(`Test POST: ${endpoint}/changeCancellation`, async () => {
    it("Return 401 when no body is included", async () => {
      const attributes = {};
      const response = await request
        .post(`${endpoint}/changeCancellation`)
        .send(attributes);
      expect(response.status).toBe(401);
    });

    it("Return 401 when no authorization token is provided", async () => {
      const attributes = {
        date: new Date(calendarEvents[0].start),
        courseId: course.id,
      };
      const response = await request
        .post(`${endpoint}/changeCancellation`)
        .send(attributes);
      expect(response.status).toBe(401);
    });

    it("Return 401 when authorization token is expired", async () => {
      const attributes = {
        date: new Date(calendarEvents[0].start),
        courseId: course.id,
      };
      const response = await request
        .post(`${endpoint}/changeCancellation`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.expiredToken);
      expect(response.status).toBe(401);
    });

    it("Return 403 when invalid user", async () => {
      const attributes = {
        date: new Date(calendarEvents[0].start),
        courseId: course.id,
      };
      const response = await request
        .post(`${endpoint}/changeCancellation`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(403);
    });

    it("Return 400 when course ID is invalid and nonzero", async () => {
      const attributes = {
        date: new Date(calendarEvents[0].start),
        courseId: course.id * 2,
      };
      const response = await request
        .post(`${endpoint}/changeCancellation`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when course ID is 0", async () => {
      const attributes = {
        date: new Date(calendarEvents[0].start),
        courseId: 0,
      };
      const response = await request
        .post(`${endpoint}/changeCancellation`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when Course ID < 0", async () => {
      const attributes = {
        date: new Date(calendarEvents[0].start),
        courseId: -course.id,
      };
      const response = await request
        .post(`${endpoint}/changeCancellation`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when course is not on date", async () => {
      let newDate = new Date(calendarEvents[0].start);
      newDate.setFullYear(newDate.getFullYear() + 10);
      var tzoffset = newDate.getTimezoneOffset() * 60000;
      const attributes = {
        courseId: course.id,
        date: new Date(newDate - tzoffset).toISOString().split("T")[0],
      };
      const response = await request
        .post(`${endpoint}/changeCancellation`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when date is a date now", async () => {
      var tzoffset = new Date().getTimezoneOffset() * 60000;
      const attributes = {
        courseId: course.id,
        date: new Date(new Date() - tzoffset).toISOString().split("T")[0],
      };
      const response = await request
        .post(`${endpoint}/changeCancellation`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when date is a date in the past", async () => {
      let pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 3);
      var tzoffset = pastDate.getTimezoneOffset() * 60000;
      const attributes = {
        courseId: course.id,
        date: new Date(pastDate - tzoffset).toISOString().split("T")[0],
      };
      const response = await request
        .post(`${endpoint}/changeCancellation`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 202 with all valid parameters", async () => {
      const attributes = {
        date: new Date(calendarEvents[0].start),
        courseId: course.id,
      };
      const targetDate = new Date(attributes.date);
      targetDate.setUTCHours(23);
      const event = await prisma.calendarEvent.findUnique({
        where: {
          courseId_date: {
            date: targetDate,
            courseId: attributes.courseId,
          },
        },
      });
      const response = await request
        .post(`${endpoint}/changeCancellation`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(202);

      const calendarJSON = response.body.eventJSon;
      calendarEvents = [];
      for (let i in calendarJSON) {
        calendarEvents.push(calendarJSON[i]);
      }
      const changedEvent = await prisma.calendarEvent.findUnique({
        where: {
          courseId_date: {
            date: targetDate,
            courseId: attributes.courseId,
          },
        },
      });
      expect(changedEvent).toBeDefined();
      expect(changedEvent.title).toBe(event.title);
      expect(changedEvent.date).toStrictEqual(targetDate);
      expect(changedEvent.location).toBe(event.location);
      expect(changedEvent.allDay).toBe(true);
      expect(changedEvent.isCancelled).toBe(!event.isCancelled);
      expect(changedEvent.isRemote).toBe(event.isRemote);
      expect(changedEvent.courseId).toBe(event.courseId);
    });
  });

  describe(`Test POST: ${endpoint}/changeRemote`, async () => {
    it("Return 401 when no body is included", async () => {
      const attributes = {};
      const response = await request
        .post(`${endpoint}/changeRemote`)
        .send(attributes);
      expect(response.status).toBe(401);
    });

    it("Return 401 when no authorization token is provided", async () => {
      const attributes = {
        date: new Date(calendarEvents[0].start),
        courseId: course.id,
      };
      const response = await request
        .post(`${endpoint}/changeRemote`)
        .send(attributes);
      expect(response.status).toBe(401);
    });

    it("Return 401 when authorization token is expired", async () => {
      const attributes = {
        date: new Date(calendarEvents[0].start),
        courseId: course.id,
      };
      const response = await request
        .post(`${endpoint}/changeRemote`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.expiredToken);
      expect(response.status).toBe(401);
    });

    it("Return 403 when invalid user", async () => {
      const attributes = {
        date: new Date(calendarEvents[0].start),
        courseId: course.id,
      };
      const response = await request
        .post(`${endpoint}/changeRemote`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(403);
    });

    it("Return 400 when course ID is invalid and nonzero", async () => {
      const attributes = {
        date: new Date(calendarEvents[0].start),
        courseId: course.id * 2,
      };
      const response = await request
        .post(`${endpoint}/changeRemote`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when course ID is 0", async () => {
      const attributes = {
        date: new Date(calendarEvents[0].start),
        courseId: 0,
      };
      const response = await request
        .post(`${endpoint}/changeRemote`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when Course ID < 0", async () => {
      const attributes = {
        date: new Date(calendarEvents[0].start),
        courseId: -course.id,
      };
      const response = await request
        .post(`${endpoint}/changeRemote`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when course is not on date", async () => {
      let newDate = new Date(calendarEvents[0].start);
      newDate.setFullYear(newDate.getFullYear() + 10);
      var tzoffset = newDate.getTimezoneOffset() * 60000;
      const attributes = {
        courseId: course.id,
        date: new Date(newDate - tzoffset).toISOString().split("T")[0],
      };
      const response = await request
        .post(`${endpoint}/changeRemote`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when date is a date now", async () => {
      var tzoffset = new Date().getTimezoneOffset() * 60000;
      const attributes = {
        courseId: course.id,
        date: new Date(new Date() - tzoffset).toISOString().split("T")[0],
      };
      const response = await request
        .post(`${endpoint}/changeRemote`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when date is a date in the past", async () => {
      let pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 3);
      var tzoffset = pastDate.getTimezoneOffset() * 60000;
      const attributes = {
        courseId: course.id,
        date: new Date(pastDate - tzoffset).toISOString().split("T")[0],
      };
      const response = await request
        .post(`${endpoint}/changeRemote`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 202 with all valid parameters", async () => {
      const attributes = {
        date: new Date(calendarEvents[0].start),
        courseId: course.id,
      };
      const targetDate = new Date(attributes.date);
      targetDate.setUTCHours(23);

      const event = await prisma.calendarEvent.findUnique({
        where: {
          courseId_date: {
            date: targetDate,
            courseId: attributes.courseId,
          },
        },
      });

      const response = await request
        .post(`${endpoint}/changeRemote`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(202);

      const calendarJSON = response.body.eventJSon;
      calendarEvents = [];
      for (let i in calendarJSON) {
        calendarEvents.push(calendarJSON[i]);
      }
      const changedEvent = await prisma.calendarEvent.findUnique({
        where: {
          courseId_date: {
            date: targetDate,
            courseId: attributes.courseId,
          },
        },
      });
      expect(changedEvent).toBeDefined();
      expect(changedEvent.title).toBe(event.title);
      expect(changedEvent.date).toStrictEqual(targetDate);
      expect(changedEvent.location).toBe(event.location);
      expect(changedEvent.allDay).toBe(true);
      expect(changedEvent.isCancelled).toBe(event.isCancelled);
      expect(changedEvent.isRemote).toBe(!event.isRemote);
      expect(changedEvent.courseId).toBe(event.courseId);
    });
  });

  describe(`Test POST: ${endpoint}/edit`, async () => {
    it("Return 400 when no body is included", async () => {
      const attributes = {};
      const response = await request
        .post(`${endpoint}/edit`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 401 when no authorization token is provided", async () => {
      const date = new Date(calendarEvents[1].start);
      let newDate = new Date(date);
      newDate.setDate(newDate.getDate() + 1);
      var tzoffset2 = newDate.getTimezoneOffset() * 60000;
      let attributes = {
        title: "title",
        additionalInfo: "description",
        isCancelled: false,
        isRemote: true,
        location: "zoom",
        newDate: new Date(newDate - tzoffset2).toISOString().split("T")[0],
        date: date,
        courseId: course.id,
      };
      const response = await request.post(`${endpoint}/edit`).send(attributes);
      expect(response.status).toBe(401);
    });

    it("Return 401 when authorization token is expired", async () => {
      const date = new Date(calendarEvents[1].start);
      let newDate = new Date(date);
      newDate.setDate(newDate.getDate() + 1);
      var tzoffset2 = newDate.getTimezoneOffset() * 60000;
      let attributes = {
        title: "title",
        additionalInfo: "description",
        isCancelled: false,
        isRemote: true,
        location: "zoom",
        newDate: new Date(newDate - tzoffset2).toISOString().split("T")[0],
        date: date,
        courseId: course.id,
      };
      const response = await request
        .post(`${endpoint}/edit`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.expiredToken);
      expect(response.status).toBe(401);
    });

    it("Return 403 when invalid user", async () => {
      const date = new Date(calendarEvents[1].start);
      let newDate = new Date(date);
      newDate.setDate(newDate.getDate() + 1);
      var tzoffset2 = newDate.getTimezoneOffset() * 60000;
      let attributes = {
        title: "title",
        additionalInfo: "description",
        isCancelled: false,
        isRemote: true,
        location: "zoom",
        newDate: new Date(newDate - tzoffset2).toISOString().split("T")[0],
        date: date,
        courseId: course.id,
      };
      const response = await request
        .post(`${endpoint}/edit`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(403);
    });

    it("Return 400 when course ID is invalid and nonzero", async () => {
      const date = new Date(calendarEvents[1].start);
      let newDate = new Date(date);
      newDate.setDate(newDate.getDate() + 1);
      var tzoffset2 = newDate.getTimezoneOffset() * 60000;
      let attributes = {
        title: "title",
        additionalInfo: "description",
        isCancelled: false,
        isRemote: true,
        location: "zoom",
        newDate: new Date(newDate - tzoffset2).toISOString().split("T")[0],
        date: date,
        courseId: course.id * 2,
      };
      const response = await request
        .post(`${endpoint}/edit`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when course ID is 0", async () => {
      const date = new Date(calendarEvents[1].start);
      let newDate = new Date(date);
      newDate.setDate(newDate.getDate() + 1);
      var tzoffset2 = newDate.getTimezoneOffset() * 60000;
      let attributes = {
        title: "title",
        additionalInfo: "description",
        isCancelled: false,
        isRemote: true,
        location: "zoom",
        newDate: new Date(newDate - tzoffset2).toISOString().split("T")[0],
        date: date,
        courseId: 0,
      };
      const response = await request
        .post(`${endpoint}/edit`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when Course ID < 0", async () => {
      const date = new Date(calendarEvents[1].start);
      let newDate = new Date(date);
      newDate.setDate(newDate.getDate() + 1);
      var tzoffset2 = newDate.getTimezoneOffset() * 60000;
      let attributes = {
        title: "title",
        additionalInfo: "description",
        isCancelled: false,
        isRemote: true,
        location: "zoom",
        newDate: new Date(newDate - tzoffset2).toISOString().split("T")[0],
        date: date,
        courseId: -course.id,
      };
      const response = await request
        .post(`${endpoint}/edit`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when course is not on date", async () => {
      let date = new Date(calendarEvents[1].start);
      date.setFullYear(date.getFullYear() + 10);
      let newDate = new Date(date);
      var tzoffset1 = date.getTimezoneOffset() * 60000;
      var tzoffset2 = newDate.getTimezoneOffset() * 60000;
      newDate.setDate(newDate.getDate() + 1);
      let attributes = {
        title: "title",
        additionalInfo: "description",
        isCancelled: false,
        isRemote: true,
        location: "zoom",
        newDate: new Date(newDate - tzoffset2).toISOString().split("T")[0],
        date: new Date(date - tzoffset1).toISOString().split("T")[0],
        courseId: course.id,
      };
      const response = await request
        .post(`${endpoint}/edit`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when date is a date now", async () => {
      const date = new Date(calendarEvents[1].start);
      let newDate = new Date(date);
      var tzoffset1 = new Date().getTimezoneOffset() * 60000;
      var tzoffset2 = newDate.getTimezoneOffset() * 60000;
      newDate.setDate(newDate.getDate() + 1);
      let attributes = {
        title: "title",
        additionalInfo: "description",
        isCancelled: false,
        isRemote: true,
        location: "zoom",
        newDate: new Date(newDate - tzoffset2).toISOString().split("T")[0],
        date: new Date(new Date() - tzoffset1).toISOString().split("T")[0],
        courseId: course.id,
      };
      const response = await request
        .post(`${endpoint}/edit`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when date is a date in the past", async () => {
      let pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 3);
      const date = new Date(calendarEvents[1].start);
      let newDate = new Date(date);
      newDate.setDate(newDate.getDate() + 1);
      var tzoffset1 = pastDate.getTimezoneOffset() * 60000;
      var tzoffset2 = newDate.getTimezoneOffset() * 60000;
      let attributes = {
        title: "title",
        additionalInfo: "description",
        isCancelled: false,
        isRemote: true,
        location: "zoom",
        newDate: new Date(newDate - tzoffset2).toISOString().split("T")[0],
        date: new Date(pastDate - tzoffset1).toISOString().split("T")[0],
        courseId: course.id,
      };
      const response = await request
        .post(`${endpoint}/edit`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when newDate is a date now", async () => {
      const date = new Date(calendarEvents[1].start);
      let newDate = new Date();
      var tzoffset2 = newDate.getTimezoneOffset() * 60000;
      let attributes = {
        title: "title",
        additionalInfo: "description",
        isCancelled: false,
        isRemote: true,
        location: "zoom",
        newDate: new Date(newDate - tzoffset2).toISOString().split("T")[0],
        date: date,
        courseId: course.id,
      };
      const response = await request
        .post(`${endpoint}/edit`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when newDate is a date in the past", async () => {
      const date = new Date(calendarEvents[1].start);
      let pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 5);
      var tzoffset2 = pastDate.getTimezoneOffset() * 60000;
      let attributes = {
        title: "title",
        additionalInfo: "description",
        isCancelled: false,
        isRemote: true,
        location: "zoom",
        newDate: new Date(pastDate - tzoffset2).toISOString().split("T")[0],
        date: date,
        courseId: course.id,
      };
      const response = await request
        .post(`${endpoint}/edit`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when title is empty", async () => {
      const date = new Date(calendarEvents[1].start);
      let newDate = new Date(date);
      newDate.setDate(newDate.getDate() + 1);
      var tzoffset2 = newDate.getTimezoneOffset() * 60000;
      let attributes = {
        title: "",
        additionalInfo: "description",
        isCancelled: false,
        isRemote: true,
        location: "zoom",
        newDate: new Date(newDate - tzoffset2).toISOString().split("T")[0],
        date: date,
        courseId: course.id,
      };
      const response = await request
        .post(`${endpoint}/edit`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    // it("Return 400 when location is empty", async () => {
    //   const date = new Date(calendarEvents[1].start);
    //   let newDate = new Date(date);
    //   newDate.setDate(newDate.getDate() + 1);
    //   var tzoffset2 = newDate.getTimezoneOffset() * 60000;
    //   let attributes = {
    //     title: "title",
    //     additionalInfo: "description",
    //     isCancelled: false,
    //     isRemote: true,
    //     location: "",
    //     newDate: new Date(newDate - tzoffset2).toISOString().split("T")[0],
    //     date: date,
    //     courseId: course.id,
    //   };
    //   const response = await request
    //     .post(`${endpoint}/edit`)
    //     .send(attributes)
    //     .set("Authorization", "Bearer " + instructor.token);
    //   expect(response.status).toBe(400);
    // });

    it("Return 202 with all valid parameters: new date", async () => {
      const date = new Date(calendarEvents[1].start);
      let newDate = new Date(date);
      newDate.setMonth(newDate.getMonth() + 5);
      var tzoffset2 = newDate.getTimezoneOffset() * 60000;
      let attributes = {
        title: "title",
        additionalInfo: "description",
        isCancelled: false,
        isRemote: true,
        location: "zoom",
        newDate: new Date(newDate - tzoffset2).toISOString().split("T")[0],
        date: date.toISOString().split("T")[0],
        courseId: course.id,
      };

      const targetDate = new Date(attributes.newDate);
      targetDate.setUTCHours(23);

      const response = await request
        .post(`${endpoint}/edit`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(202);

      const calendarJSON = response.body.eventJSon;
      calendarEvents = [];
      for (let i in calendarJSON) {
        calendarEvents.push(calendarJSON[i]);
      }
      const createdEvents = await prisma.calendarEvent.findUnique({
        where: {
          courseId_date: {
            courseId: attributes.courseId,
            date: targetDate,
          },
        },
      });
      expect(createdEvents).toBeDefined();
      expect(createdEvents.title).toBe(attributes.title);
      expect(createdEvents.date).toStrictEqual(targetDate);
      expect(createdEvents.location).toBe(attributes.location);
      expect(createdEvents.allDay).toBe(true);
      expect(createdEvents.isCancelled).toBe(false);
      expect(createdEvents.isRemote).toBe(attributes.isRemote);
      expect(createdEvents.courseId).toBe(attributes.courseId);
      expect(response.status).toBe(202);
    });

    it("Return 202 with all valid parameters: same date", async () => {
      const date = new Date(calendarEvents[1].start);
      let attributes = {
        title: "title",
        additionalInfo: "this is the new edited description",
        isCancelled: false,
        isRemote: true,
        location: "zoom",
        newDate: date.toISOString().split("T")[0],
        date: date.toISOString().split("T")[0],
        courseId: course.id,
      };

      const targetDate = new Date(attributes.date);
      targetDate.setUTCHours(23);

      const response = await request
        .post(`${endpoint}/edit`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(202);

      const calendarJSON = response.body.eventJSon;
      calendarEvents = [];
      for (let i in calendarJSON) {
        calendarEvents.push(calendarJSON[i]);
      }
      const createdEvents = await prisma.calendarEvent.findUnique({
        where: {
          courseId_date: {
            courseId: attributes.courseId,
            date: targetDate,
          },
        },
      });
      expect(createdEvents).toBeDefined();
      expect(createdEvents.title).toBe(attributes.title);
      expect(createdEvents.date).toStrictEqual(targetDate);
      expect(createdEvents.location).toBe(attributes.location);
      expect(createdEvents.allDay).toBe(true);
      expect(createdEvents.isCancelled).toBe(false);
      expect(createdEvents.isRemote).toBe(attributes.isRemote);
      expect(createdEvents.courseId).toBe(attributes.courseId);
      expect(response.status).toBe(202);
    });
  });

  describe(`Test POST: ${endpoint}/editTitle`, async () => {
    it("Return 400 when no body is included", async () => {
      const attributes = {};
      const response = await request
        .post(`${endpoint}/editTitle`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 401 when no authorization token is provided", async () => {
      const dateObj = new Date(calendarEvents[1].start);
      let attributes = {
        title: "title",
        date: dateObj,
        courseId: course.id,
      };

      const response = await request
        .post(`${endpoint}/editTitle`)
        .send(attributes);
      expect(response.status).toBe(401);
    });

    it("Return 401 when authorization token is expired", async () => {
      const dateObj = new Date(calendarEvents[1].start);
      let attributes = {
        title: "title",
        date: dateObj,
        courseId: course.id,
      };

      const response = await request
        .post(`${endpoint}/editTitle`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.expiredToken);
      expect(response.status).toBe(401);
    });

    it("Return 403 when invalid user", async () => {
      const dateObj = new Date(calendarEvents[1].start);
      let attributes = {
        title: "title",
        date: dateObj,
        courseId: course.id,
      };

      const response = await request
        .post(`${endpoint}/editTitle`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(403);
    });

    it("Return 400 when course ID is invalid and nonzero", async () => {
      const dateObj = new Date(calendarEvents[1].start);
      let attributes = {
        title: "title",
        date: dateObj,
        courseId: course.id * 2,
      };

      const response = await request
        .post(`${endpoint}/editTitle`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when course ID is 0", async () => {
      const dateObj = new Date(calendarEvents[1].start);
      let attributes = {
        title: "title",
        date: dateObj,
        courseId: 0,
      };

      const response = await request
        .post(`${endpoint}/editTitle`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when Course ID < 0", async () => {
      const dateObj = new Date(calendarEvents[1].start);
      let attributes = {
        title: "title",
        date: dateObj,
        courseId: -course.id,
      };

      const response = await request
        .post(`${endpoint}/editTitle`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when course is not on date", async () => {
      let date = new Date(calendarEvents[1].start);
      date.setFullYear(date.getFullYear() + 10);
      var tzoffset = date.getTimezoneOffset() * 60000;
      let attributes = {
        title: "title",
        date: new Date(date - tzoffset).toISOString().split("T")[0],
        courseId: course.id,
      };
      const response = await request
        .post(`${endpoint}/editTitle`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when date is a date now", async () => {
      const date = new Date();
      var tzoffset = date.getTimezoneOffset() * 60000;
      let attributes = {
        title: "title",
        date: new Date(date - tzoffset).toISOString().split("T")[0],
        courseId: course.id,
      };
      const response = await request
        .post(`${endpoint}/editTitle`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when date is a date in the past", async () => {
      let pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 3);
      var tzoffset = pastDate.getTimezoneOffset() * 60000;
      let attributes = {
        title: "title",
        date: new Date(pastDate - tzoffset).toISOString().split("T")[0],
        courseId: course.id,
      };
      const response = await request
        .post(`${endpoint}/editTitle`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when title is empty", async () => {
      const dateObj = new Date(calendarEvents[1].start);
      let attributes = {
        title: "",
        date: dateObj,
        courseId: course.id,
      };

      const response = await request
        .post(`${endpoint}/editTitle`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 202 with all valid parameters", async () => {
      const dateObj = new Date(calendarEvents[1].start);
      let attributes = {
        title: "title",
        date: dateObj,
        courseId: course.id,
      };

      const targetDate = new Date(attributes.date);
      targetDate.setUTCHours(23);

      const event = await prisma.calendarEvent.findUnique({
        where: {
          courseId_date: {
            courseId: attributes.courseId,
            date: targetDate,
          },
        },
      });

      const response = await request
        .post(`${endpoint}/editTitle`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(202);

      const calendarJSON = response.body.eventJSon;
      calendarEvents = [];
      for (let i in calendarJSON) {
        calendarEvents.push(calendarJSON[i]);
      }

      const createdEvents = await prisma.calendarEvent.findUnique({
        where: {
          courseId_date: {
            courseId: attributes.courseId,
            date: targetDate,
          },
        },
      });
      expect(createdEvents).toBeDefined();
      expect(createdEvents.title).toBe(attributes.title);
      expect(createdEvents.date).toStrictEqual(targetDate);
      expect(createdEvents.location).toBe(event.location);
      expect(createdEvents.allDay).toBe(event.allDay);
      expect(createdEvents.isCancelled).toBe(event.isCancelled);
      expect(createdEvents.isRemote).toBe(event.isRemote);
      expect(createdEvents.courseId).toBe(event.courseId);
      expect(response.status).toBe(202);
    });
  });

  describe(`Test POST: ${endpoint}/editLocation`, async () => {
    it("Return 400 when no body is included", async () => {
      const attributes = {};
      const response = await request
        .post(`${endpoint}/editLocation`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 401 when no authorization token is provided", async () => {
      const dateObj = new Date(calendarEvents[1].start);
      let attributes = {
        location: "location",
        isRemote: true,
        date: dateObj,
        courseId: course.id,
      };
      const response = await request
        .post(`${endpoint}/editLocation`)
        .send(attributes);
      expect(response.status).toBe(401);
    });

    it("Return 401 when authorization token is expired", async () => {
      const dateObj = new Date(calendarEvents[1].start);
      let attributes = {
        location: "location",
        isRemote: true,
        date: dateObj,
        courseId: course.id,
      };
      const response = await request
        .post(`${endpoint}/editLocation`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.expiredToken);
      expect(response.status).toBe(401);
    });

    it("Return 403 when invalid user", async () => {
      const dateObj = new Date(calendarEvents[1].start);
      let attributes = {
        location: "location",
        isRemote: true,
        date: dateObj,
        courseId: course.id,
      };
      const response = await request
        .post(`${endpoint}/editLocation`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(403);
    });

    it("Return 400 when course ID is invalid and nonzero", async () => {
      const dateObj = new Date(calendarEvents[1].start);
      let attributes = {
        location: "location",
        isRemote: true,
        date: dateObj,
        courseId: -course.id,
      };
      const response = await request
        .post(`${endpoint}/editLocation`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when course ID is 0", async () => {
      const dateObj = new Date(calendarEvents[1].start);
      let attributes = {
        location: "location",
        isRemote: true,
        date: dateObj,
        courseId: 0,
      };
      const response = await request
        .post(`${endpoint}/editLocation`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when Course ID < 0", async () => {
      const dateObj = new Date(calendarEvents[1].start);
      let attributes = {
        location: "location",
        isRemote: true,
        date: dateObj,
        courseId: -course.id,
      };
      const response = await request
        .post(`${endpoint}/editLocation`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when date is a date now", async () => {
      const date = new Date();
      var tzoffset = date.getTimezoneOffset() * 60000;
      let attributes = {
        location: "location",
        isRemote: true,
        date: new Date(date - tzoffset).toISOString().split("T")[0],
        courseId: course.id,
      };
      const response = await request
        .post(`${endpoint}/editLocation`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when course is not on date", async () => {
      const date = new Date(calendarEvents[1].start);
      date.setFullYear(date.getFullYear() + 10);
      var tzoffset = date.getTimezoneOffset() * 60000;
      let attributes = {
        location: "location",
        isRemote: true,
        date: new Date(date - tzoffset).toISOString().split("T")[0],
        courseId: course.id,
      };
      const response = await request
        .post(`${endpoint}/editLocation`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when date is a date in the past", async () => {
      let pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 3);
      var tzoffset = pastDate.getTimezoneOffset() * 60000;
      let attributes = {
        location: "location",
        isRemote: true,
        date: new Date(pastDate - tzoffset).toISOString().split("T")[0],
        courseId: course.id,
      };
      const response = await request
        .post(`${endpoint}/editLocation`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    // it("Return 400 when location is empty", async () => {
    //   const dateObj = new Date(calendarEvents[1].start);
    //   let attributes = {
    //     location: "",
    //     isRemote: true,
    //     date: dateObj,
    //     courseId: course.id,
    //   };
    //   const response = await request
    //     .post(`${endpoint}/editLocation`)
    //     .send(attributes)
    //     .set("Authorization", "Bearer " + instructor.token);
    //   expect(response.status).toBe(400);
    // });

    it("Return 202 with all valid parameters", async () => {
      const dateObj = new Date(calendarEvents[1].start);
      let attributes = {
        location: "location",
        isRemote: true,
        date: dateObj,
        courseId: course.id,
      };

      const targetDate = new Date(attributes.date);
      targetDate.setUTCHours(23);

      const event = await prisma.calendarEvent.findUnique({
        where: {
          courseId_date: {
            courseId: attributes.courseId,
            date: targetDate,
          },
        },
      });

      const response = await request
        .post(`${endpoint}/editLocation`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);

      expect(response.status).toBe(202);

      const calendarJSON = response.body.eventJSon;
      calendarEvents = [];
      for (let i in calendarJSON) {
        calendarEvents.push(calendarJSON[i]);
      }

      const createdEvents = await prisma.calendarEvent.findUnique({
        where: {
          courseId_date: {
            courseId: attributes.courseId,
            date: targetDate,
          },
        },
      });
      expect(createdEvents).toBeDefined();
      expect(createdEvents.title).toBe(event.title);
      expect(createdEvents.date).toStrictEqual(targetDate);
      expect(createdEvents.location).toBe(attributes.location);
      expect(createdEvents.allDay).toBe(event.allDay);
      expect(createdEvents.isCancelled).toBe(event.isCancelled);
      expect(createdEvents.isRemote).toBe(attributes.isRemote);
      expect(createdEvents.courseId).toBe(event.courseId);
      expect(response.status).toBe(202);
    });
  });

  describe(`Test POST: ${endpoint}/createEvent`, async () => {
    it("Return 401 when no body is included", async () => {
      const attributes = {};
      const response = await request
        .post(`${endpoint}/createEvent`)
        .send(attributes);
      expect(response.status).toBe(401);
    });

    it("Return 401 when no authorization token is provided", async () => {
      const date = new Date(calendarEvents[0].start);
      let newDate = new Date(date);
      newDate.setFullYear(newDate.getFullYear() + 1);
      var tzoffset2 = newDate.getTimezoneOffset() * 60000;
      const attributes = {
        title: "Calendar Event II",
        courseId: course.id,
        date: new Date(newDate - tzoffset2).toISOString().split("T")[0],
        location: "zoom",
        isRemote: true,
      };
      const response = await request
        .post(`${endpoint}/createEvent`)
        .send(attributes);
      expect(response.status).toBe(401);
    });

    it("Return 401 when authorization token is expired", async () => {
      const date = new Date(calendarEvents[0].start);
      let newDate = new Date(date);
      newDate.setFullYear(newDate.getFullYear() + 1);
      var tzoffset2 = newDate.getTimezoneOffset() * 60000;
      const attributes = {
        title: "Calendar Event II",
        courseId: course.id,
        date: new Date(newDate - tzoffset2).toISOString().split("T")[0],
        location: "zoom",
        isRemote: true,
      };
      const response = await request
        .post(`${endpoint}/createEvent`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.expiredToken);
      expect(response.status).toBe(401);
    });

    it("Return 403 when invalid user", async () => {
      const date = new Date(calendarEvents[0].start);
      let newDate = new Date(date);
      newDate.setFullYear(newDate.getFullYear() + 1);
      var tzoffset2 = newDate.getTimezoneOffset() * 60000;
      const attributes = {
        title: "Calendar Event II",
        courseId: course.id,
        date: new Date(newDate - tzoffset2).toISOString().split("T")[0],
        location: "zoom",
        isRemote: true,
      };
      const response = await request
        .post(`${endpoint}/createEvent`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(403);
    });

    it("Return 400 when course ID is invalid and nonzero", async () => {
      const date = new Date(calendarEvents[0].start);
      let newDate = new Date(date);
      newDate.setFullYear(newDate.getFullYear() + 1);
      var tzoffset2 = newDate.getTimezoneOffset() * 60000;
      const attributes = {
        title: "Calendar Event II",
        courseId: course.id * 2,
        date: new Date(newDate - tzoffset2).toISOString().split("T")[0],
        location: "zoom",
        isRemote: true,
      };
      const response = await request
        .post(`${endpoint}/createEvent`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when course ID is 0", async () => {
      const date = new Date(calendarEvents[0].start);
      let newDate = new Date(date);
      newDate.setFullYear(newDate.getFullYear() + 1);
      var tzoffset2 = newDate.getTimezoneOffset() * 60000;
      const attributes = {
        title: "Calendar Event II",
        courseId: 0,
        date: new Date(newDate - tzoffset2).toISOString().split("T")[0],
        location: "zoom",
        isRemote: true,
      };
      const response = await request
        .post(`${endpoint}/createEvent`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when Course ID < 0", async () => {
      const date = new Date(calendarEvents[0].start);
      let newDate = new Date(date);
      newDate.setFullYear(newDate.getFullYear() + 1);
      var tzoffset2 = newDate.getTimezoneOffset() * 60000;
      const attributes = {
        title: "Calendar Event II",
        courseId: -course.id,
        date: new Date(newDate - tzoffset2).toISOString().split("T")[0],
        location: "zoom",
        isRemote: true,
      };
      const response = await request
        .post(`${endpoint}/createEvent`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when course event already exists", async () => {
      const date = new Date(calendarEvents[0].start);
      const attributes = {
        title: "Calendar Event II",
        courseId: course.id,
        date: date,
        location: "zoom",
        isRemote: true,
      };
      const response = await request
        .post(`${endpoint}/createEvent`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    // it("Return 400 when date is a date now", async () => {
    //   var tzoffset2 = new Date().getTimezoneOffset() * 60000;
    //   const attributes = {
    //     title: "Calendar Event II",
    //     courseId: course.id,
    //     date: new Date(new Date() - tzoffset2).toISOString().split("T")[0],
    //     location: "zoom",
    //     isRemote: true,
    //   };
    //   const response = await request
    //     .post(`${endpoint}/createEvent`)
    //     .send(attributes)
    //     .set("Authorization", "Bearer " + instructor.token);
    //   expect(response.status).toBe(400);
    // });

    // it("Return 400 when date is a date in the past", async () => {
    //   let pastDate = new Date();
    //   pastDate.setMonth(pastDate.getMonth() - 3);
    //   var tzoffset2 = pastDate.getTimezoneOffset() * 60000;
    //   const attributes = {
    //     title: "Calendar Event II",
    //     courseId: course.id,
    //     date: new Date(pastDate - tzoffset2).toISOString().split("T")[0],
    //     location: "zoom",
    //     isRemote: true,
    //   };
    //   const response = await request
    //     .post(`${endpoint}/createEvent`)
    //     .send(attributes)
    //     .set("Authorization", "Bearer " + instructor.token);
    //   expect(response.status).toBe(400);
    // });

    it("Return 400 when title is empty", async () => {
      const date = new Date(calendarEvents[0].start);
      let newDate = new Date(date);
      newDate.setFullYear(newDate.getFullYear() + 1);
      var tzoffset2 = newDate.getTimezoneOffset() * 60000;
      const attributes = {
        title: "",
        courseId: course.id,
        date: new Date(newDate - tzoffset2).toISOString().split("T")[0],
        location: "zoom",
        isRemote: true,
      };
      const response = await request
        .post(`${endpoint}/createEvent`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    // it("Return 400 when location is empty", async () => {
    //   const date = new Date(calendarEvents[0].start);
    //   let newDate = new Date(date);
    //   newDate.setFullYear(newDate.getFullYear() + 1);
    //   var tzoffset2 = newDate.getTimezoneOffset() * 60000;
    //   const attributes = {
    //     title: "Calendar Event II",
    //     courseId: course.id,
    //     date: new Date(newDate - tzoffset2).toISOString().split("T")[0],
    //     location: "",
    //     isRemote: true,
    //   };
    //   const response = await request
    //     .post(`${endpoint}/createEvent`)
    //     .send(attributes)
    //     .set("Authorization", "Bearer " + instructor.token);
    //   expect(response.status).toBe(400);
    // });

    it("Return 201 with all valid parameters", async () => {
      const date = new Date(calendarEvents[0].start);
      let newDate = new Date(date);
      newDate.setFullYear(newDate.getFullYear() + 1);
      var tzoffset2 = newDate.getTimezoneOffset() * 60000;
      const attributes = {
        title: "Calendar Event II",
        courseId: course.id,
        date: new Date(newDate - tzoffset2).toISOString().split("T")[0],
        location: "zoom",
        isRemote: true,
      };
      const targetDate = new Date(attributes.date);
      targetDate.setUTCHours(23);
      const response = await request
        .post(`${endpoint}/createEvent`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(201);

      const calendarJSON = response.body.eventJSon;
      calendarEvents = [];
      for (let i in calendarJSON) {
        calendarEvents.push(calendarJSON[i]);
      }
      const createdEvents = await prisma.calendarEvent.findUnique({
        where: {
          courseId_date: {
            courseId: attributes.courseId,
            date: new Date(targetDate),
          },
        },
      });
      expect(createdEvents).toBeDefined();
      expect(createdEvents.title).toBe(attributes.title);
      expect(createdEvents.date).toStrictEqual(targetDate);
      expect(createdEvents.location).toBe(attributes.location);
      expect(createdEvents.allDay).toBe(true);
      expect(createdEvents.isCancelled).toBe(false);
      expect(createdEvents.isRemote).toBe(attributes.isRemote);
      expect(createdEvents.courseId).toBe(attributes.courseId);
      expect(response.status).toBe(201);
    });
  });

  describe(`Test POST: ${endpoint}/createRecurringEvent`, async () => {
    it("Return 401 when no body is included", async () => {
      const attributes = {};
      const response = await request
        .post(`${endpoint}/createRecurringEvent`)
        .send(attributes);
      expect(response.status).toBe(401);
    });

    it("Return 401 when no authorization token is provided", async () => {
      let courseDate = new Date();
      courseDate.setMonth(courseDate.getMonth() + 3);
      if (courseDate.getMonth() == 2 || courseDate.getMonth() == 10) {
        courseDate.setMonth(courseDate.getMonth() + 2);
      } else if (courseDate.getMonth() == 3 || courseDate.getMonth() == 11) {
        courseDate.setMonth(courseDate.getMonth() + 1);
      }
      courseDate.setDate(courseDate.getDate() + 1);
      let secondCourseDate = new Date(courseDate);
      secondCourseDate.setMonth(courseDate.getMonth() + 1);
      var tzoffset = courseDate.getTimezoneOffset() * 60000;
      var tzoffset2 = secondCourseDate.getTimezoneOffset() * 60000;
      const attributes = {
        title: "Calendar Event III",
        courseId: course.id,
        begDate: new Date(courseDate - tzoffset).toISOString().split("T")[0],
        endDate: new Date(secondCourseDate - tzoffset2)
          .toISOString()
          .split("T")[0],
        location: "zoom",
        isRemote: true,
        daysOfWeek: [weekday[courseDate.getDay()]],
      };
      const response = await request
        .post(`${endpoint}/createRecurringEvent`)
        .send(attributes);
      expect(response.status).toBe(401);
    });

    it("Return 401 when authorization token is expired", async () => {
      let courseDate = new Date();
      courseDate.setMonth(courseDate.getMonth() + 3);
      if (courseDate.getMonth() == 2 || courseDate.getMonth() == 10) {
        courseDate.setMonth(courseDate.getMonth() + 2);
      } else if (courseDate.getMonth() == 3 || courseDate.getMonth() == 11) {
        courseDate.setMonth(courseDate.getMonth() + 1);
      }
      courseDate.setDate(courseDate.getDate() + 1);
      let secondCourseDate = new Date(courseDate);
      secondCourseDate.setMonth(courseDate.getMonth() + 1);
      var tzoffset = courseDate.getTimezoneOffset() * 60000;
      var tzoffset2 = secondCourseDate.getTimezoneOffset() * 60000;

      const attributes = {
        title: "Calendar Event III",
        courseId: course.id,
        begDate: new Date(courseDate - tzoffset).toISOString().split("T")[0],
        endDate: new Date(secondCourseDate - tzoffset2)
          .toISOString()
          .split("T")[0],
        location: "zoom",
        isRemote: true,
        daysOfWeek: [weekday[courseDate.getDay()]],
      };
      const response = await request
        .post(`${endpoint}/createRecurringEvent`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.expiredToken);
      expect(response.status).toBe(401);
    });

    it("Return 403 when invalid user", async () => {
      let courseDate = new Date();
      courseDate.setMonth(courseDate.getMonth() + 3);
      if (courseDate.getMonth() == 2 || courseDate.getMonth() == 10) {
        courseDate.setMonth(courseDate.getMonth() + 2);
      } else if (courseDate.getMonth() == 3 || courseDate.getMonth() == 11) {
        courseDate.setMonth(courseDate.getMonth() + 1);
      }
      courseDate.setDate(courseDate.getDate() + 1);
      let secondCourseDate = new Date(courseDate);
      secondCourseDate.setMonth(courseDate.getMonth() + 1);
      var tzoffset = courseDate.getTimezoneOffset() * 60000;
      var tzoffset2 = secondCourseDate.getTimezoneOffset() * 60000;

      const attributes = {
        title: "Calendar Event III",
        courseId: course.id,
        begDate: new Date(courseDate - tzoffset).toISOString().split("T")[0],
        endDate: new Date(secondCourseDate - tzoffset2)
          .toISOString()
          .split("T")[0],
        location: "zoom",
        isRemote: true,
        daysOfWeek: [weekday[courseDate.getDay()]],
      };
      const response = await request
        .post(`${endpoint}/createRecurringEvent`)
        .send(attributes)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(403);
    });

    it("Return 400 when course ID is invalid and nonzero", async () => {
      let courseDate = new Date();
      courseDate.setMonth(courseDate.getMonth() + 3);
      if (courseDate.getMonth() == 2 || courseDate.getMonth() == 10) {
        courseDate.setMonth(courseDate.getMonth() + 2);
      } else if (courseDate.getMonth() == 3 || courseDate.getMonth() == 11) {
        courseDate.setMonth(courseDate.getMonth() + 1);
      }
      courseDate.setDate(courseDate.getDate() + 1);
      let secondCourseDate = new Date(courseDate);
      secondCourseDate.setMonth(courseDate.getMonth() + 1);
      var tzoffset = courseDate.getTimezoneOffset() * 60000;
      var tzoffset2 = secondCourseDate.getTimezoneOffset() * 60000;

      const attributes = {
        title: "Calendar Event III",
        courseId: course.id * 2,
        begDate: new Date(courseDate - tzoffset).toISOString().split("T")[0],
        endDate: new Date(secondCourseDate - tzoffset2)
          .toISOString()
          .split("T")[0],
        location: "zoom",
        isRemote: true,
        daysOfWeek: [weekday[courseDate.getDay()]],
      };
      const response = await request
        .post(`${endpoint}/createRecurringEvent`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when course ID is 0", async () => {
      let courseDate = new Date();
      courseDate.setMonth(courseDate.getMonth() + 3);
      if (courseDate.getMonth() == 2 || courseDate.getMonth() == 10) {
        courseDate.setMonth(courseDate.getMonth() + 2);
      } else if (courseDate.getMonth() == 3 || courseDate.getMonth() == 11) {
        courseDate.setMonth(courseDate.getMonth() + 1);
      }
      courseDate.setDate(courseDate.getDate() + 1);
      let secondCourseDate = new Date(courseDate);
      secondCourseDate.setMonth(courseDate.getMonth() + 1);
      var tzoffset = courseDate.getTimezoneOffset() * 60000;
      var tzoffset2 = secondCourseDate.getTimezoneOffset() * 60000;

      const attributes = {
        title: "Calendar Event III",
        courseId: 0,
        begDate: new Date(courseDate - tzoffset).toISOString().split("T")[0],
        endDate: new Date(secondCourseDate - tzoffset2)
          .toISOString()
          .split("T")[0],
        location: "zoom",
        isRemote: true,
        daysOfWeek: [weekday[courseDate.getDay()]],
      };
      const response = await request
        .post(`${endpoint}/createRecurringEvent`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when Course ID < 0", async () => {
      let courseDate = new Date();
      courseDate.setMonth(courseDate.getMonth() + 3);
      if (courseDate.getMonth() == 2 || courseDate.getMonth() == 10) {
        courseDate.setMonth(courseDate.getMonth() + 2);
      } else if (courseDate.getMonth() == 3 || courseDate.getMonth() == 11) {
        courseDate.setMonth(courseDate.getMonth() + 1);
      }
      courseDate.setDate(courseDate.getDate() + 1);
      let secondCourseDate = new Date(courseDate);
      secondCourseDate.setMonth(courseDate.getMonth() + 1);
      var tzoffset = courseDate.getTimezoneOffset() * 60000;
      var tzoffset2 = secondCourseDate.getTimezoneOffset() * 60000;

      const attributes = {
        title: "Calendar Event III",
        courseId: -course.id,
        begDate: new Date(courseDate - tzoffset).toISOString().split("T")[0],
        endDate: new Date(secondCourseDate - tzoffset2)
          .toISOString()
          .split("T")[0],
        location: "zoom",
        isRemote: true,
        daysOfWeek: [weekday[courseDate.getDay()]],
      };
      const response = await request
        .post(`${endpoint}/createRecurringEvent`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when course event already exists", async () => {
      let courseDate = new Date(calendarEvents[0].start);
      let secondCourseDate = new Date(courseDate);
      secondCourseDate.setMonth(courseDate.getMonth() + 2);
      var tzoffset = courseDate.getTimezoneOffset() * 60000;
      var tzoffset2 = secondCourseDate.getTimezoneOffset() * 60000;
      const attributes = {
        title: "Calendar Event III",
        courseId: course.id,
        begDate: courseDate,
        endDate: new Date(secondCourseDate - tzoffset2)
          .toISOString()
          .split("T")[0],
        location: "zoom",
        isRemote: true,
        daysOfWeek: [weekday[courseDate.getDay()]],
      };
      const response = await request
        .post(`${endpoint}/createRecurringEvent`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    // it("Return 400 when begDate is a date now", async () => {
    //   let courseDate = new Date();
    //   courseDate.setMonth(courseDate.getMonth() + 3);
    // while (courseDate.getMonth() == 2 || courseDate.getMonth() == 3 || courseDate.getMonth() == 10 || courseDate.getMonth() == 11) {
    //   courseDate.setMonth(courseDate.getMonth() + 1);
    // }
    //   courseDate.setDate(courseDate.getDate() + 1);
    //   let secondCourseDate = new Date(courseDate);
    //   secondCourseDate.setMonth(courseDate.getMonth() + 1);
    //   var tzoffset3 = new Date().getTimezoneOffset() * 60000;
    //   var tzoffset2 = secondCourseDate.getTimezoneOffset() * 60000;
    //   const attributes = {
    //     title: "Calendar Event III",
    //     courseId: course.id,
    //     begDate: new Date(new Date() - tzoffset3).toISOString().split("T")[0],
    //     endDate: new Date(secondCourseDate - tzoffset2)
    //       .toISOString()
    //       .split("T")[0],
    //     location: "zoom",
    //     isRemote: true,
    //     daysOfWeek: [weekday[courseDate.getDay()]],
    //   };
    //   const response = await request
    //     .post(`${endpoint}/createRecurringEvent`)
    //     .send(attributes)
    //     .set("Authorization", "Bearer " + instructor.token);
    //   expect(response.status).toBe(400);
    // });

    // it("Return 400 when begDate is a date in the past", async () => {
    //   let courseDate = new Date();
    //   courseDate.setMonth(courseDate.getMonth() + 3);
    // while (courseDate.getMonth() == 2 || courseDate.getMonth() == 3 || courseDate.getMonth() == 10 || courseDate.getMonth() == 11) {
    //   courseDate.setMonth(courseDate.getMonth() + 1);
    // }
    //   courseDate.setDate(courseDate.getDate() + 1);
    //   let secondCourseDate = new Date(courseDate);
    //   secondCourseDate.setMonth(courseDate.getMonth() + 1);
    //   let pastDate = new Date();
    //   pastDate.setMonth(pastDate.getMonth() - 3);
    //   var tzoffset3 = pastDate.getTimezoneOffset() * 60000;
    //   var tzoffset2 = secondCourseDate.getTimezoneOffset() * 60000;

    //   const attributes = {
    //     title: "Calendar Event III",
    //     courseId: course.id,
    //     begDate: new Date(pastDate - tzoffset3).toISOString().split("T")[0],
    //     endDate: new Date(secondCourseDate - tzoffset2)
    //       .toISOString()
    //       .split("T")[0],
    //     location: "zoom",
    //     isRemote: true,
    //     daysOfWeek: [weekday[courseDate.getDay()]],
    //   };
    //   const response = await request
    //     .post(`${endpoint}/createRecurringEvent`)
    //     .send(attributes)
    //     .set("Authorization", "Bearer " + instructor.token);
    //   expect(response.status).toBe(400);
    // });

    // it("Return 400 when endDate is a date now", async () => {
    //   let courseDate = new Date();
    //   courseDate.setMonth(courseDate.getMonth() + 3);
    // while (courseDate.getMonth() == 2 || courseDate.getMonth() == 3 || courseDate.getMonth() == 10 || courseDate.getMonth() == 11) {
    //   courseDate.setMonth(courseDate.getMonth() + 1);
    // }
    //   courseDate.setDate(courseDate.getDate() + 1);
    //   var tzoffset = courseDate.getTimezoneOffset() * 60000;
    //   var tzoffset3 = new Date().getTimezoneOffset() * 60000;

    //   const attributes = {
    //     title: "Calendar Event III",
    //     courseId: course.id,
    //     begDate: new Date(courseDate - tzoffset).toISOString().split("T")[0],
    //     endDate: new Date(new Date() - tzoffset3).toISOString().split("T")[0],
    //     location: "zoom",
    //     isRemote: true,
    //     daysOfWeek: [weekday[courseDate.getDay()]],
    //   };
    //   const response = await request
    //     .post(`${endpoint}/createRecurringEvent`)
    //     .send(attributes)
    //     .set("Authorization", "Bearer " + instructor.token);
    //   expect(response.status).toBe(400);
    // });

    // it("Return 400 when endDate is a date in the past", async () => {
    //   let courseDate = new Date();
    //   courseDate.setMonth(courseDate.getMonth() + 3);
    // while (courseDate.getMonth() == 2 || courseDate.getMonth() == 3 || courseDate.getMonth() == 10 || courseDate.getMonth() == 11) {
    //   courseDate.setMonth(courseDate.getMonth() + 1);
    // }
    //   courseDate.setDate(courseDate.getDate() + 1);
    //   let pastDate = new Date();
    //   pastDate.setMonth(pastDate.getMonth() - 3);
    //   var tzoffset = courseDate.getTimezoneOffset() * 60000;
    //   var tzoffset3 = pastDate.getTimezoneOffset() * 60000;
    //   const attributes = {
    //     title: "Calendar Event III",
    //     courseId: course.id,
    //     begDate: new Date(courseDate - tzoffset).toISOString().split("T")[0],
    //     endDate: new Date(pastDate - tzoffset3).toISOString().split("T")[0],
    //     location: "zoom",
    //     isRemote: true,
    //     daysOfWeek: [weekday[courseDate.getDay()]],
    //   };
    //   const response = await request
    //     .post(`${endpoint}/createRecurringEvent`)
    //     .send(attributes)
    //     .set("Authorization", "Bearer " + instructor.token);
    //   expect(response.status).toBe(400);
    // });

    it("Return 400 when title is empty", async () => {
      let courseDate = new Date();
      courseDate.setMonth(courseDate.getMonth() + 3);
      if (courseDate.getMonth() == 2 || courseDate.getMonth() == 10) {
        courseDate.setMonth(courseDate.getMonth() + 2);
      } else if (courseDate.getMonth() == 3 || courseDate.getMonth() == 11) {
        courseDate.setMonth(courseDate.getMonth() + 1);
      }
      courseDate.setDate(courseDate.getDate() + 1);
      let secondCourseDate = new Date(courseDate);
      secondCourseDate.setMonth(courseDate.getMonth() + 1);
      var tzoffset = courseDate.getTimezoneOffset() * 60000;
      var tzoffset2 = secondCourseDate.getTimezoneOffset() * 60000;

      const attributes = {
        title: "",
        courseId: course.id,
        begDate: new Date(courseDate - tzoffset).toISOString().split("T")[0],
        endDate: new Date(secondCourseDate - tzoffset2)
          .toISOString()
          .split("T")[0],
        location: "zoom",
        isRemote: true,
        daysOfWeek: [weekday[courseDate.getDay()]],
      };
      const response = await request
        .post(`${endpoint}/createRecurringEvent`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    // it("Return 400 when location is empty", async () => {
    //   let courseDate = new Date();
    //   courseDate.setMonth(courseDate.getMonth() + 3);
    // while (courseDate.getMonth() == 2 || courseDate.getMonth() == 3 || courseDate.getMonth() == 10 || courseDate.getMonth() == 11) {
    //   courseDate.setMonth(courseDate.getMonth() + 1);
    // }
    //   courseDate.setDate(courseDate.getDate() + 1);
    //   let secondCourseDate = new Date(courseDate);
    //   secondCourseDate.setMonth(courseDate.getMonth() + 1);
    //   var tzoffset = courseDate.getTimezoneOffset() * 60000;
    //   var tzoffset2 = secondCourseDate.getTimezoneOffset() * 60000;

    //   const attributes = {
    //     title: "Calendar Event III",
    //     courseId: course.id,
    //     begDate: new Date(courseDate - tzoffset).toISOString().split("T")[0],
    //     endDate: new Date(secondCourseDate - tzoffset2)
    //       .toISOString()
    //       .split("T")[0],
    //     location: "",
    //     isRemote: true,
    //     daysOfWeek: [weekday[courseDate.getDay()]],
    //   };
    //   const response = await request
    //     .post(`${endpoint}/createRecurringEvent`)
    //     .send(attributes)
    //     .set("Authorization", "Bearer " + instructor.token);
    //   expect(response.status).toBe(400);
    // });

    it("Return 400 when daysOfWeek is empty", async () => {
      let courseDate = new Date();
      courseDate.setMonth(courseDate.getMonth() + 3);
      if (courseDate.getMonth() == 2 || courseDate.getMonth() == 10) {
        courseDate.setMonth(courseDate.getMonth() + 2);
      } else if (courseDate.getMonth() == 3 || courseDate.getMonth() == 11) {
        courseDate.setMonth(courseDate.getMonth() + 1);
      }
      courseDate.setDate(courseDate.getDate() + 1);
      let secondCourseDate = new Date(courseDate);
      secondCourseDate.setMonth(courseDate.getMonth() + 1);
      var tzoffset = courseDate.getTimezoneOffset() * 60000;
      var tzoffset2 = secondCourseDate.getTimezoneOffset() * 60000;

      const attributes = {
        title: "Calendar Event III",
        courseId: course.id,
        begDate: new Date(courseDate - tzoffset).toISOString().split("T")[0],
        endDate: new Date(secondCourseDate - tzoffset2)
          .toISOString()
          .split("T")[0],
        location: "zoom",
        isRemote: true,
        daysOfWeek: [],
      };
      const response = await request
        .post(`${endpoint}/createRecurringEvent`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when daysOfWeek is invalid", async () => {
      let courseDate = new Date();
      courseDate.setMonth(courseDate.getMonth() + 3);
      if (courseDate.getMonth() == 2 || courseDate.getMonth() == 10) {
        courseDate.setMonth(courseDate.getMonth() + 2);
      } else if (courseDate.getMonth() == 3 || courseDate.getMonth() == 11) {
        courseDate.setMonth(courseDate.getMonth() + 1);
      }
      courseDate.setDate(courseDate.getDate() + 1);
      let secondCourseDate = new Date(courseDate);
      secondCourseDate.setMonth(courseDate.getMonth() + 1);
      var tzoffset = courseDate.getTimezoneOffset() * 60000;
      var tzoffset2 = secondCourseDate.getTimezoneOffset() * 60000;

      const attributes = {
        title: "Calendar Event III",
        courseId: course.id,
        begDate: new Date(courseDate - tzoffset).toISOString().split("T")[0],
        endDate: new Date(secondCourseDate - tzoffset2)
          .toISOString()
          .split("T")[0],
        location: "zoom",
        isRemote: true,
        daysOfWeek: [weekday[courseDate.getDay()], "Jamie"],
      };
      const response = await request
        .post(`${endpoint}/createRecurringEvent`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when beginning date is not on day in daysOfWeek", async () => {
      let courseDate = new Date();
      courseDate.setMonth(courseDate.getMonth() + 3);
      if (courseDate.getMonth() == 2 || courseDate.getMonth() == 10) {
        courseDate.setMonth(courseDate.getMonth() + 2);
      } else if (courseDate.getMonth() == 3 || courseDate.getMonth() == 11) {
        courseDate.setMonth(courseDate.getMonth() + 1);
      }
      courseDate.setDate(courseDate.getDate() + 1);
      let secondCourseDate = new Date(courseDate);
      secondCourseDate.setMonth(courseDate.getMonth() + 1);
      var tzoffset = courseDate.getTimezoneOffset() * 60000;
      var tzoffset2 = secondCourseDate.getTimezoneOffset() * 60000;

      const attributes = {
        title: "Calendar Event III",
        courseId: course.id,
        begDate: new Date(courseDate - tzoffset).toISOString().split("T")[0],
        endDate: new Date(secondCourseDate - tzoffset2)
          .toISOString()
          .split("T")[0],
        location: "zoom",
        isRemote: true,
        daysOfWeek: [weekday[(courseDate.getDay() + 1) % 7]],
      };
      const response = await request
        .post(`${endpoint}/createRecurringEvent`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 201 with all valid parameters", async () => {
      let courseDate = new Date();
      courseDate.setFullYear(courseDate.getFullYear() + 2);
      let secondCourseDate = new Date(courseDate);
      secondCourseDate.setMonth(courseDate.getMonth() + 2);
      var tzoffset = courseDate.getTimezoneOffset() * 60000;
      var tzoffset2 = secondCourseDate.getTimezoneOffset() * 60000;
      const attributes = {
        title: "Calendar Event III",
        courseId: course.id,
        begDate: new Date(courseDate - tzoffset).toISOString().split("T")[0],
        endDate: new Date(secondCourseDate - tzoffset2)
          .toISOString()
          .split("T")[0],
        location: "zoom",
        isRemote: true,
        daysOfWeek: [weekday[courseDate.getDay()]],
      };
      const response = await request
        .post(`${endpoint}/createRecurringEvent`)
        .send(attributes)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(201);

      const calendarJSON = response.body.eventJSon;
      calendarEvents = [];
      for (let i in calendarJSON) {
        calendarEvents.push(calendarJSON[i]);
      }
      const createdEvents = await prisma.calendarEvent.findMany({
        where: {
          courseId: attributes.courseId,
          title: attributes.title,
        },
        orderBy: {
          date: "asc",
        },
      });

      let dates = [];
      for (let i in createdEvents) {
        dates.push(createdEvents[i].date);
      }

      expect(createdEvents).toBeDefined();
      for (let i in createdEvents) {
        expect(createdEvents[i].title).toBe(attributes.title);
        expect(createdEvents[i].date).toStrictEqual(dates[i]);
        expect(createdEvents[i].location).toBe(attributes.location);
        expect(createdEvents[i].allDay).toBe(true);
        expect(createdEvents[i].isCancelled).toBe(false);
        expect(createdEvents[i].isRemote).toBe(attributes.isRemote);
        expect(createdEvents[i].courseId).toBe(attributes.courseId);
        expect(response.status).toBe(201);
      }
    });
  });

  describe(`Test GET: ${endpoint}/getAllEventsForCourse/:courseId`, async () => {
    it("Return 401 when no authorization token is provided", async () => {
      const response = await request.get(
        `${endpoint}/getAllEventsForCourse/${course.id}`
      );
      expect(response.status).toBe(401);
    });

    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .get(`${endpoint}/getAllEventsForCourse/${course.id}`)
        .set("Authorization", "Bearer " + students[0].expiredToken);
      expect(response.status).toBe(401);
    });

    it("Return 400 when invalid, nonzero course id is provided", async () => {
      const response = await request
        .get(`${endpoint}/getAllEventsForCourse/${course.id * 2}`)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when course id = 0 is provided", async () => {
      const response = await request
        .get(`${endpoint}/getAllEventsForCourse/${0}`)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when course id < 0 is provided", async () => {
      const response = await request
        .get(`${endpoint}/getAllEventsForCourse/-${course.id}`)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });

    it("Return 403 when user is not in course", async () => {
      const response = await request
        .get(`${endpoint}/getAllEventsForCourse/${course.id}`)
        .set("Authorization", "Bearer " + students[2].token);
      expect(response.status).toBe(403);
    });

    it("Return 202 with all valid parameters", async () => {
      const events = await prisma.calendarEvent.findMany({
        where: {
          courseId: course.id,
        },
        orderBy: {
          date: "asc",
        },
      });

      const response = await request
        .get(`${endpoint}/getAllEventsForCourse/${course.id}`)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(202);

      const calendarJSON = response.body.eventJSon;
      let gottenEvents = [];
      for (let i in calendarJSON) {
        gottenEvents.push(calendarJSON[i]);
      }
      expect(gottenEvents).toBeDefined();
      for (let i in gottenEvents) {
        expect(gottenEvents[i].title).toBe(events[i].title);
        expect(gottenEvents[i].start).toStrictEqual(events[i].date);
        expect(gottenEvents[i].location).toBe(events[i].location);
        expect(gottenEvents[i].allDay).toBe(events[i].allDay);
        expect(gottenEvents[i].isCancelled).toBe(events[i].isCancelled);
        expect(gottenEvents[i].isRemote).toBe(events[i].isRemote);
        expect(gottenEvents[i].courseId).toBe(events[i].courseId);
        expect(response.status).toBe(202);
      }
    });
  });

  describe(`Test GET: ${endpoint}/getAllNotCancelledEventsForCourse/:courseId`, async () => {
    it("Return 401 when no authorization token is provided", async () => {
      const response = await request.get(
        `${endpoint}/getAllNotCancelledEventsForCourse/${course.id}`
      );
      expect(response.status).toBe(401);
    });

    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .get(`${endpoint}/getAllNotCancelledEventsForCourse/${course.id}`)
        .set("Authorization", "Bearer " + students[0].expiredToken);
      expect(response.status).toBe(401);
    });

    it("Return 400 when invalid, nonzero course id is provided", async () => {
      const response = await request
        .get(`${endpoint}/getAllNotCancelledEventsForCourse/${course.id * 2}`)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when course id = 0 is provided", async () => {
      const response = await request
        .get(`${endpoint}/getAllNotCancelledEventsForCourse/${0}`)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when course id < 0 is provided", async () => {
      const response = await request
        .get(`${endpoint}/getAllNotCancelledEventsForCourse/-${course.id}`)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });

    it("Return 403 when user is not in course", async () => {
      const response = await request
        .get(`${endpoint}/getAllNotCancelledEventsForCourse/${course.id}`)
        .set("Authorization", "Bearer " + students[2].token);
      expect(response.status).toBe(403);
    });

    it("Return 202 with all valid parameters", async () => {
      const events = await prisma.calendarEvent.findMany({
        where: {
          courseId: course.id,
          isCancelled: false,
        },
        orderBy: {
          date: "asc",
        },
      });

      const response = await request
        .get(`${endpoint}/getAllNotCancelledEventsForCourse/${course.id}`)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(202);

      const calendarJSON = response.body.eventJSon;
      let gottenEvents = [];
      for (let i in calendarJSON) {
        gottenEvents.push(calendarJSON[i]);
      }
      expect(gottenEvents).toBeDefined();
      for (let i in gottenEvents) {
        expect(gottenEvents[i].title).toBe(events[i].title);
        expect(gottenEvents[i].start).toStrictEqual(events[i].date);
        expect(gottenEvents[i].location).toBe(events[i].location);
        expect(gottenEvents[i].allDay).toBe(events[i].allDay);
        expect(gottenEvents[i].isCancelled).toBe(events[i].isCancelled);
        expect(gottenEvents[i].isRemote).toBe(events[i].isRemote);
        expect(gottenEvents[i].courseId).toBe(events[i].courseId);
        expect(response.status).toBe(202);
      }
    });
  });

  describe(`Test GET: ${endpoint}/getAllCancelledEventsForCourse/:courseId`, async () => {
    it("Return 401 when no authorization token is provided", async () => {
      const response = await request.get(
        `${endpoint}/getAllCancelledEventsForCourse/${course.id}`
      );
      expect(response.status).toBe(401);
    });

    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .get(`${endpoint}/getAllCancelledEventsForCourse/${course.id}`)
        .set("Authorization", "Bearer " + students[0].expiredToken);
      expect(response.status).toBe(401);
    });

    it("Return 400 when invalid, nonzero course id is provided", async () => {
      const response = await request
        .get(`${endpoint}/getAllCancelledEventsForCourse/${course.id * 2}`)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when course id = 0 is provided", async () => {
      const response = await request
        .get(`${endpoint}/getAllCancelledEventsForCourse/${0}`)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when course id < 0 is provided", async () => {
      const response = await request
        .get(`${endpoint}/getAllCancelledEventsForCourse/-${course.id}`)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });

    it("Return 403 when user is not in course", async () => {
      const response = await request
        .get(`${endpoint}/getAllCancelledEventsForCourse/${course.id}`)
        .set("Authorization", "Bearer " + students[2].token);
      expect(response.status).toBe(403);
    });

    it("Return 202 with all valid parameters", async () => {
      const events = await prisma.calendarEvent.findMany({
        where: {
          courseId: course.id,
          isCancelled: true,
        },
        orderBy: {
          date: "asc",
        },
      });

      const response = await request
        .get(`${endpoint}/getAllCancelledEventsForCourse/${course.id}`)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(202);

      const calendarJSON = response.body.eventJSon;
      let gottenEvents = [];
      for (let i in calendarJSON) {
        gottenEvents.push(calendarJSON[i]);
      }
      expect(gottenEvents).toBeDefined();
      for (let i in gottenEvents) {
        expect(gottenEvents[i].title).toBe(events[i].title);
        expect(gottenEvents[i].start).toStrictEqual(events[i].date);
        expect(gottenEvents[i].location).toBe(events[i].location);
        expect(gottenEvents[i].allDay).toBe(events[i].allDay);
        expect(gottenEvents[i].isCancelled).toBe(events[i].isCancelled);
        expect(gottenEvents[i].isRemote).toBe(events[i].isRemote);
        expect(gottenEvents[i].courseId).toBe(events[i].courseId);
        expect(response.status).toBe(202);
      }
    });
  });

  describe(`Test GET: ${endpoint}/getEventOnDay/:courseId/date/:date`, async () => {
    it("Return 401 when no authorization token is provided", async () => {
      const dateObj = new Date(calendarEvents[0].start);
      const response = await request.get(
        `${endpoint}/getEventOnDay/${course.id}/date/${dateObj}`
      );
      expect(response.status).toBe(401);
    });

    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .get(
          `${endpoint}/getEventOnDay/${course.id}/date/${
            new Date(calendarEvents[0].start).toISOString().split("T")[0]
          }`
        )
        .set("Authorization", "Bearer " + students[0].expiredToken);
      expect(response.status).toBe(401);
    });

    it("Return 400 when invalid, nonzero course id is provided", async () => {
      const response = await request
        .get(
          `${endpoint}/getEventOnDay/${course.id * 2}/date/${
            new Date(calendarEvents[0].start).toISOString().split("T")[0]
          }`
        )
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when course id = 0 is provided", async () => {
      const response = await request
        .get(
          `${endpoint}/getEventOnDay/${0}/date/${
            new Date(calendarEvents[0].start).toISOString().split("T")[0]
          }`
        )
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when course id < 0 is provided", async () => {
      const response = await request
        .get(
          `${endpoint}/getEventOnDay/-${course.id}/date/${
            new Date(calendarEvents[0].start).toISOString().split("T")[0]
          }`
        )
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });

    // it("Return 400 when date is a date now", async () => {
    //   const response = await request
    //     .get(`${endpoint}/getEventOnDay/${course.id}/date/${new Date()}`)
    //     .set("Authorization", "Bearer " + students[0].token);
    //   expect(response.status).toBe(400);
    // });

    // it("Return 400 when date is a date in the past", async () => {
    //   let date = new Date();
    //   date.setMonth(date.getMonth() - 3);
    //   const response = await request
    //     .get(
    //       `${endpoint}/getEventOnDay/${course.id}/date/${
    //         date.toISOString().split("T")[0]
    //       }`
    //     )
    //     .set("Authorization", "Bearer " + students[0].token);
    //   expect(response.status).toBe(400);
    // });

    it("Return 403 when user is not in course", async () => {
      const response = await request
        .get(
          `${endpoint}/getEventOnDay/${course.id}/date/${
            new Date(calendarEvents[0].start).toISOString().split("T")[0]
          }`
        )
        .set("Authorization", "Bearer " + students[2].token);
      expect(response.status).toBe(403);
    });

    it("Return 202 with all valid parameters: course event not on day", async () => {
      let dateObj = new Date(calendarEvents[0].start);
      dateObj.setDate(dateObj.getDate() + 1);
      const response = await request
        .get(
          `${endpoint}/getEventOnDay/${course.id}/date/${
            dateObj.toISOString().split("T")[0]
          }`
        )
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(202);

      const calendarJSON = response.body.eventJSon;
      let gottenEvents = [];
      for (let i in calendarJSON) {
        gottenEvents.push(calendarJSON[i]);
      }
      expect(gottenEvents).toStrictEqual([]);
    });

    it("Return 202 with all valid parameters", async () => {
      const events = await prisma.calendarEvent.findUnique({
        where: {
          courseId_date: {
            courseId: course.id,
            date: new Date(calendarEvents[0].start),
          },
        },
      });

      const response = await request
        .get(
          `${endpoint}/getEventOnDay/${course.id}/date/${
            new Date(calendarEvents[0].start).toISOString().split("T")[0]
          }`
        )
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(202);

      const calendarJSON = response.body.eventJSon;
      let gottenEvents = [];
      for (let i in calendarJSON) {
        gottenEvents.push(calendarJSON[i]);
      }
      expect(gottenEvents).toBeDefined();
      for (let i in gottenEvents) {
        expect(gottenEvents[i].title).toBe(events[i].title);
        expect(gottenEvents[i].start).toStrictEqual(events[i].date);
        expect(gottenEvents[i].location).toBe(events[i].location);
        expect(gottenEvents[i].allDay).toBe(events[i].allDay);
        expect(gottenEvents[i].isCancelled).toBe(events[i].isCancelled);
        expect(gottenEvents[i].isRemote).toBe(events[i].isRemote);
        expect(gottenEvents[i].courseId).toBe(events[i].courseId);
        expect(response.status).toBe(202);
      }
    });
  });

  describe(`Test DELETE: ${endpoint}/deleteCourse/:courseId/date/:date`, async () => {
    it("Return 401 when no authorization token is provided", async () => {
      const response = await request.delete(
        `${endpoint}/deleteCourse/${course.id}/date/${
          new Date(calendarEvents[0].start).toISOString().split("T")[0]
        }`
      );
      expect(response.status).toBe(401);
    });

    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .delete(
          `${endpoint}/deleteCourse/${course.id}/date/${
            new Date(calendarEvents[0].start).toISOString().split("T")[0]
          }`
        )
        .set("Authorization", "Bearer " + instructor.expiredToken);
      expect(response.status).toBe(401);
    });

    it("Return 403 when invalid user", async () => {
      const response = await request
        .delete(
          `${endpoint}/deleteCourse/${course.id}/date/${
            new Date(calendarEvents[0].start).toISOString().split("T")[0]
          }`
        )
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(403);
    });

    it("Return 400 when invalid course id is provided", async () => {
      const response = await request
        .delete(
          `${endpoint}/deleteCourse/${course.id * 2}/date/${
            new Date(calendarEvents[0].start).toISOString().split("T")[0]
          }`
        )
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when course id < 0 is provided", async () => {
      const response = await request
        .delete(
          `${endpoint}/deleteCourse/${-course.id}/date/${
            new Date(calendarEvents[0].start).toISOString().split("T")[0]
          }`
        )
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when course id = 0 is provided", async () => {
      const response = await request
        .delete(
          `${endpoint}/deleteCourse/${0}/date/${
            new Date(calendarEvents[0].start).toISOString().split("T")[0]
          }`
        )
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when date is in the past", async () => {
      let pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 3);
      let response = await request
        .delete(
          `${endpoint}/deleteCourse/${course.id}/date/${
            pastDate.toISOString().split("T")[0]
          }`
        )
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when date is now", async () => {
      let response = await request
        .delete(
          `${endpoint}/deleteCourse/${course.id}/date/${
            new Date().toISOString().split("T")[0]
          }`
        )
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when event doesn't exist", async () => {
      let pastDate = new Date(calendarEvents[0].start);
      pastDate.setDate(pastDate.getDate() - 1);
      let response = await request
        .delete(
          `${endpoint}/deleteCourse/${course.id}/date/${
            pastDate.toISOString().split("T")[0]
          }`
        )
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 202 when course event is deleted", async () => {
      const dateObj = new Date(calendarEvents[0].start)
        .toISOString()
        .split("T")[0];
      let response = await request
        .delete(`${endpoint}/deleteCourse/${course.id}/date/${dateObj}`)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(202);
      const event = await prisma.calendarEvent.findUnique({
        where: {
          courseId_date: {
            courseId: course.id,
            date: new Date(dateObj),
          },
        },
      });
      expect(event).toStrictEqual(null);
    });
  });

  describe(`Test DELETE: ${endpoint}/deleteCourse/:courseId`, async () => {
    it("Return 401 when no authorization token is provided", async () => {
      const response = await request.delete(
        `${endpoint}/deleteCourse/${course.id}`
      );
      expect(response.status).toBe(401);
    });

    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .delete(`${endpoint}/deleteCourse/${course.id}`)
        .set("Authorization", "Bearer " + instructor.expiredToken);
      expect(response.status).toBe(401);
    });

    it("Return 403 when invalid user", async () => {
      const response = await request
        .delete(`${endpoint}/deleteCourse/${course.id}`)
        .set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(403);
    });

    it("Return 400 when invalid course id is provided", async () => {
      const response = await request
        .delete(`${endpoint}/deleteCourse/${-course.id}`)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 202 when course events are deleted", async () => {
      let response = await request
        .delete(`${endpoint}/deleteCourse/${course.id}`)
        .set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(202);
      const events = await prisma.calendarEvent.findMany({
        where: {
          courseId: course.id,
        },
        orderBy: {
          date: "asc",
        },
      });
      expect(events).toStrictEqual([]);
    });
  });

  afterAll(async () => {
    const studentIds = students.map((user) => user.id);
    const instructorId = instructor.id;
    const courseId = course.id;
    const deleteEvents = await prisma.calendarEvent.deleteMany({
      where: {
        courseId: courseId,
      },
    });
    const deleteAccounts = await prisma.account.deleteMany({
      where: {
        OR: [{ id: { in: studentIds } }, { id: { in: instructorId } }],
      },
    });
    const deleteCourse = await prisma.course.delete({
      where: {
        id: courseId,
      },
    });

    // await prisma.$transaction([deleteEvents]);
    // await prisma.$transaction([deleteAccounts]);
    // await prisma.$transaction([deleteCourse]);

    await prisma.$disconnect();
  });
});
