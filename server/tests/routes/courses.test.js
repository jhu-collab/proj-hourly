import supertest from "supertest";
import { it, expect, beforeAll, describe, afterAll } from "vitest";
import app from "../../src/index.js";
import prisma from "../../prisma/client.js";
import { createToken } from "../../src/util/helpers.js";
import { Role } from "@prisma/client";

const request = supertest(app);
const endpoint = "/api/course";

describe(`Test endpoint ${endpoint}`, () => {
  let archivedCourses = [];
  let courses = [];
  let users = [];
  let userInCourse = [];
  let topics = [];
  let archivedTopics = [];
  let tokens = [];
  let officeHoursArray = [];
  let calendarYear = new Date().getFullYear();
  beforeAll(async () => {
    // create the users
    await prisma.account.createMany({
      data: [
        {
          //student
          //name: "Test User I",
          email: "user1@test.io",
          role: Role.User,
          userName: "user1",
        },
        {
          //student
          //name: "Test User II",
          email: "user2@test.io",
          role: Role.User,
          userName: "user2",
        },
        {
          //Instructor
          //name: "Test User III",
          email: "user3@test.io",
          role: Role.Admin,
          userName: "user3",
        },
        {
          //TA
          //name: "Test User IIII",
          email: "user4@test.io",
          role: Role.Admin,
          userName: "user4",
        },
        {
          //student
          //name: "Test User V",
          email: "user5@test.io",
          role: Role.User,
          userName: "user5",
        },
      ],
      skipDuplicates: true,
    });

    users = await prisma.account.findMany({
      orderBy: {
        id: "asc",
      },
    });

    // Augment the users' objects with auth tokens
    users = users.map((user) => ({
      ...user,
      token: createToken({ user }),
      expiredToken: createToken({ user, expiresIn: "0" }),
    }));

    const archivedCourse = await prisma.course.create({
      data: {
        title: "hello",
        semester: "Fall",
        calendarYear: calendarYear,
        courseNumber: "235.631",
        code: "PALWEL",
        isArchived: true,
        instructors: {
          connect: [{ id: users[2].id }, { id: users[3].id }],
        },
        students: {
          connect: {
            id: users[0].id,
          },
        },
        courseStaff: {
          connect: {
            id: users[4].id,
          },
        },
      },
    });
    archivedCourses.push(archivedCourse);

    // const topicArchived = await prisma.topic.create({
    //   data: {
    //     value: "HW9",
    //     course: {
    //       connect: {
    //         id: archivedCourses[0].id,
    //       },
    //     },
    //   },
    // });
    // archivedTopics.push(topicArchived);
  });

  describe("HTTP POST request", () => {
    it("Return 401 when no authorization toke is provided", async () => {
      const response = await request.post(`${endpoint}`);
      expect(response.status).toBe(401);
    });
    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .post(`${endpoint}`)
        .set("Authorization", "bearer " + users[2].expiredToken);
      expect(response.status).toBe(401);
    });
    it("Return 400 when no body is included", async () => {
      const attributes = {};
      const response = await request
        .post(`${endpoint}`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when course title is not included", async () => {
      const attributes = {
        //title: "title",
        number: "601.421",
        semester: "Spring",
        year: calendarYear,
      };
      const response = await request
        .post(`${endpoint}`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when course number is not included", async () => {
      const attributes = {
        title: "title",
        //number: "601.421",
        semester: "Spring",
        year: calendarYear,
      };
      const response = await request
        .post(`${endpoint}`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when course semester is not included", async () => {
      const attributes = {
        title: "title",
        number: "601.421",
        //semester: "Spring",
        year: calendarYear,
      };
      const response = await request
        .post(`${endpoint}`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when course year is not included", async () => {
      const attributes = {
        title: "title",
        number: "601.421",
        semester: "Spring",
        //year: 2023,
      };
      const response = await request
        .post(`${endpoint}`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when course semester is not valid", async () => {
      const attributes = {
        title: "title",
        number: "601.421",
        semester: "not-spring",
        year: calendarYear,
      };
      const response = await request
        .post(`${endpoint}`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 200 when course is created", async () => {
      const attributes = {
        title: "OOSE",
        number: "601.421",
        semester: "Spring",
        year: calendarYear,
      };
      const response = await request
        .post(`${endpoint}`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      let course;
      if (response.status !== 201) {
        course = await prisma.course.findFirst({
          where: {
            title: "OOSE",
          },
        });
      } else {
        course = JSON.parse(response.text).course;
      }
      const token = await prisma.courseToken.create({
        data: {
          title: "test",
          courseId: course.id,
          tokenLimit: 3,
        },
      });
      tokens.push(token);
      courses.push(course);
      expect(response.status).toBe(201);
      expect(course.title).toBe("OOSE");
      expect(course.courseNumber).toBe("601.421");
      expect(course.semester).toBe("Spring");
      expect(course.calendarYear).toBe(calendarYear);
      expect(response.status).toBe(201);
      userInCourse.push(users[2]);
    });
    it("Return 409 when duplicate course is created", async () => {
      const attributes = {
        title: "OOSE",
        number: "601.421",
        semester: "Spring",
        year: calendarYear,
      };
      const response = await request
        .post(`${endpoint}`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(409);
    });
  });

  describe("HTTP POST request signup", () => {
    it("Return 401 when no authorization toke is provided", async () => {
      const response = await request.post(`${endpoint}/signup`);
      expect(response.status).toBe(401);
    });
    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .post(`${endpoint}/signup`)
        .set("Authorization", "bearer " + users[0].expiredToken);
      expect(response.status).toBe(401);
    });
    it("Return 400 when no body is included", async () => {
      const attributes = {};
      const response = await request
        .post(`${endpoint}/signup`)
        .send(attributes)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when invalid code", async () => {
      const courseCode = courses[0].code;
      let code = "AAAAAA";
      if (code === courseCode) {
        code = "BBBBBB";
      }
      const attributes = {
        code: code,
      };
      const response = await request
        .post(`${endpoint}/signup`)
        .send(attributes)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(400);
    });
    it("Return 202 when course successfully archived", async () => {
      const response = await request
        .post(`/api/course/${courses[0].id}/archiveCourse`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
    });
    it("Return 400 when signing up for an archived course", async () => {
      const attributes = {
        code: courses[0].code,
      };
      const response = await request
        .post(`${endpoint}/signup`)
        .send(attributes)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(400);
    });
    it("Return 202 when course successfully unarchive course", async () => {
      const response = await request
        .post(`/api/course/${courses[0].id}/archiveCourse`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
    });
    it("Return 202 when student is registered for course", async () => {
      const attributes = {
        code: courses[0].code,
      };
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
        include: {
          students: true,
          courseStaff: true,
          instructors: true,
        },
      });
      const response = await request
        .post(`${endpoint}/signup`)
        .send(attributes)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(202);
      userInCourse.push(users[0]);
    });
    it("Return 202 when student is registered for course - multiple instructors", async () => {
      const attributes = {
        code: courses[0].code,
      };
      await prisma.account.update({
        where: {
          id: users[0].id,
        },
        data: {
          studentCourses: {
            disconnect: {
              id: courses[0].id,
            },
          },
        },
      });
      await prisma.account.update({
        where: {
          id: users[1].id,
        },
        data: {
          instructorCourses: {
            connect: {
              id: courses[0].id,
            },
          },
        },
      });
      const response = await request
        .post(`${endpoint}/signup`)
        .send(attributes)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(202);
      userInCourse.push(users[0]);
      await prisma.account.update({
        where: {
          id: users[1].id,
        },
        data: {
          instructorCourses: {
            disconnect: {
              id: courses[0].id,
            },
          },
        },
      });
    });
    it("Return 409 when student is already registered for course", async () => {
      const attributes = {
        code: courses[0].code,
      };
      const response = await request
        .post(`${endpoint}/signup`)
        .send(attributes)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(409);
    });
    it("Return 409 when student tries to register for archived course", async () => {
      const attributes = {
        code: archivedCourses[0].code,
      };
      const response = await request
        .post(`${endpoint}/signup`)
        .send(attributes)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(409);
    });
  });

  describe("HTTP Get request", () => {
    it("Return 401 when no authorization toke is provided", async () => {
      const response = await request.get(`${endpoint}`);
      expect(response.status).toBe(401);
    });
    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .get(`${endpoint}`)
        .set("Authorization", "bearer " + users[0].expiredToken);
      expect(response.status).toBe(401);
    });
    it("Return 200 when no body is included", async () => {
      const response = await request
        .get(`${endpoint}`)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(202);
      const { student, staff, instructor } = JSON.parse(response.text);
      expect(student.length).toBe(1);
      expect(staff.length).toBe(0);
      expect(instructor.length).toBe(0);
    });
  });

  describe("HTTP Get request - specific course", () => {
    it("Return 401 when no authorization toke is provided", async () => {
      const response = await request.get(`${endpoint}/${courses[0].id}`);
      expect(response.status).toBe(401);
    });
    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}`)
        .set("Authorization", "bearer " + users[0].expiredToken);
      expect(response.status).toBe(401);
    });
    it("Return 400 when invalid course id is provided", async () => {
      const response = await request
        .get(`${endpoint}/-1`)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(400);
    });
    it("Return 403 when user is not in course", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.userName === "user2").token
        );
      expect(response.status).toBe(403);
    });
    it("Return 200 when no body is included", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}`)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(202);
    });
  });

  describe("HTTP Delete Request - leave course", () => {
    it("Return 401 when no authorization toke is provided", async () => {
      const response = await request.delete(
        `${endpoint}/leave/${courses[0].id}`
      );
      expect(response.status).toBe(401);
    });
    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .delete(`${endpoint}/leave/${courses[0].id}`)
        .set("Authorization", "bearer " + users[0].expiredToken);
      expect(response.status).toBe(401);
    });
    it("Return 400 when invalid course id is provided", async () => {
      const response = await request
        .delete(`${endpoint}/leave/-1`)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(400);
    });
    it("Return 403 when user is not in course", async () => {
      const response = await request
        .delete(`${endpoint}/leave/${courses[0].id}`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.userName === "user2").token
        );
      expect(response.status).toBe(403);
    });
    it("Return 200 when no body is included", async () => {
      const response = await request
        .delete(`${endpoint}/leave/${courses[0].id}`)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(202);
      await prisma.account.update({
        where: {
          id: users[0].id,
        },
        data: {
          studentCourses: {
            connect: {
              id: courses[0].id,
            },
          },
        },
      });
    });
    it("Return 409 user tries to leave archived course", async () => {
      const response = await request
        .delete(`${endpoint}/leave/${archivedCourses[0].id}`)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(400);
    });
  });

  describe("HTTP Delete Request - delete course", () => {
    it("Return 401 when no authorization toke is provided", async () => {
      const response = await request.delete(`${endpoint}/${courses[0].id}`);
      expect(response.status).toBe(401);
    });
    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .delete(`${endpoint}/${courses[0].id}`)
        .set("Authorization", "bearer " + users[2].expiredToken);
      expect(response.status).toBe(401);
    });
    it("Return 400 when invalid course id is provided", async () => {
      const response = await request
        .delete(`${endpoint}/-1`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 403 when user is not in course", async () => {
      const response = await request
        .delete(`${endpoint}/${courses[0].id}`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.userName === "user2").token
        );
      expect(response.status).toBe(403);
    });
    it("Return 202 when course is deleted", async () => {
      const now = new Date();
      const next = new Date();
      next.setUTCHours(next.getUTCHours() + 2);
      await prisma.officeHour.create({
        data: {
          hosts: {
            connect: [{ id: users[2].id }],
          },
          courseId: courses[0].id,
          location: "zoom",
          isRecurring: false,
          startDate: now,
          endDate: next,
        },
      });
      let response = await request
        .delete(`${endpoint}/${courses[0].id}`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const attributes = {
        title: "OOSE",
        number: "601.421",
        semester: "Spring",
        year: calendarYear,
      };
      response = await request
        .post(`${endpoint}`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(201);
      const course = JSON.parse(response.text).course;
      expect(course.title).toBe("OOSE");
      expect(course.courseNumber).toBe("601.421");
      expect(course.semester).toBe("Spring");
      expect(course.calendarYear).toBe(calendarYear);
      courses[0] = course;
      await prisma.account.update({
        where: {
          id: users[0].id,
        },
        data: {
          studentCourses: {
            connect: {
              id: course.id,
            },
          },
        },
      });
    });
    it("Return 400 when archived course is deleted", async () => {
      let response = await request
        .delete(`${endpoint}/${archivedCourses[0].id}`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
  });

  describe("HTTP Delete Request - remove staff from course", () => {
    it("Return 401 when no authorization toke is provided", async () => {
      const user2 = users.find((u) => u.userName === "user2");
      await prisma.account.update({
        where: {
          id: user2.id,
        },
        data: {
          staffCourses: {
            connect: {
              id: courses[0].id,
            },
          },
        },
      });
      const now = new Date();
      const next = new Date();
      next.setUTCHours(next.getUTCHours() + 2);
      const officeHour = await prisma.officeHour.create({
        data: {
          hosts: {
            connect: [{ id: user2.id }],
          },
          courseId: courses[0].id,
          location: "zoom",
          isRecurring: false,
          startDate: now,
          endDate: next,
        },
      });
      officeHoursArray.push(officeHour);
      const response = await request.delete(
        `${endpoint}/${courses[0].id}/removeStaff/${user2.id}`
      );
      expect(response.status).toBe(401);
    });
    it("Return 401 when authorization token is expired", async () => {
      const user2 = users.find((u) => u.userName === "user2");
      const response = await request
        .delete(`${endpoint}/${courses[0].id}/removeStaff/${user2.id}`)
        .set("Authorization", "bearer " + users[2].expiredToken);
      expect(response.status).toBe(401);
    });
    it("Return 400 when invalid course id is provided", async () => {
      const user2 = users.find((u) => u.userName === "user2");
      const response = await request
        .delete(`${endpoint}/-1/removeStaff/${user2.id}`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 403 when user is not instructor", async () => {
      const user2 = users.find((u) => u.userName === "user2");
      const response = await request
        .delete(`${endpoint}/${courses[0].id}/removeStaff/${user2.id}`)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(403);
    });
    it("Return 403 when user id is invalid", async () => {
      const response = await request
        .delete(`${endpoint}/${courses[0].id}/removeStaff/-1`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(403);
    });
    it("Return 403 when user id is not staff", async () => {
      const user = users[3];
      const response = await request
        .delete(`${endpoint}/${courses[0].id}/removeStaff/${user.id}`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(403);
    });
    it("Return 202 when staff is deleted", async () => {
      const user = users.find((u) => u.userName === "user2");
      const response = await request
        .delete(`${endpoint}/${courses[0].id}/removeStaff/${user.id}`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
    });
    it("Return 400 when staff of archived course is deleted", async () => {
      const response = await request
        .delete(
          `${endpoint}/${archivedCourses[0].id}/removeStaff/${users[4].id}`
        )
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
  });

  describe("HTTP Delete Request - remove student from course", () => {
    it("Return 401 when no authorization toke is provided", async () => {
      const user2 = users.find((u) => u.userName === "user2");
      await prisma.account.update({
        where: {
          id: user2.id,
        },
        data: {
          studentCourses: {
            connect: {
              id: courses[0].id,
            },
          },
        },
      });
      const response = await request.delete(
        `${endpoint}/${courses[0].id}/removeStudent/${user2.id}`
      );
      expect(response.status).toBe(401);
    });
    it("Return 401 when authorization token is expired", async () => {
      const user2 = users.find((u) => u.userName === "user2");
      const response = await request
        .delete(`${endpoint}/${courses[0].id}/removeStudent/${user2.id}`)
        .set("Authorization", "bearer " + users[2].expiredToken);
      expect(response.status).toBe(401);
    });
    it("Return 400 when invalid course id is provided", async () => {
      const user2 = users.find((u) => u.userName === "user2");
      const response = await request
        .delete(`${endpoint}/-1/removeStudent/${user2.id}`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 403 when user is not instructor", async () => {
      const user2 = users.find((u) => u.userName === "user2");
      const response = await request
        .delete(`${endpoint}/${courses[0].id}/removeStudent/${user2.id}`)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(403);
    });
    it("Return 403 when user id is invalid", async () => {
      const response = await request
        .delete(`${endpoint}/${courses[0].id}/removeStudent/-1`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(403);
    });
    it("Return 403 when user id is not student", async () => {
      const user = users[3];
      const response = await request
        .delete(`${endpoint}/${courses[0].id}/removeStudent/${user.id}`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(403);
    });
    it("Return 202 when student is deleted", async () => {
      const user = users.find((u) => u.userName === "user2");
      const response = await request
        .delete(`${endpoint}/${courses[0].id}/removeStudent/${user.id}`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
    });
    it("Return 400 when student of archived course is deleted", async () => {
      const response = await request
        .delete(
          `${endpoint}/${archivedCourses[0].id}/removeStudent/${users[0].id}`
        )
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
  });

  describe("HTTP Get request - get office hours for course", () => {
    it("Return 401 when no authorization toke is provided", async () => {
      await prisma.course.update({
        where: {
          id: courses[0].id,
        },
        data: {
          iCalJson: {
            test: "test",
          },
        },
      });

      const response = await request.get(
        `${endpoint}/${courses[0].id}/officeHours`
      );
      expect(response.status).toBe(401);
    });
    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/officeHours`)
        .set("Authorization", "bearer " + users[0].expiredToken);
      expect(response.status).toBe(401);
    });
    it("Return 400 when invalid course id", async () => {
      const response = await request
        .get(`${endpoint}/-1/officeHours`)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when user is not in course", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/officeHours`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.userName === "user2").token
        );
      expect(response.status).toBe(403);
    });
    it("Return 200", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/officeHours`)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(202);
      const officeHours = JSON.parse(response.text).calendar;
      expect(officeHours.test).toBe("test");
    });
  });

  describe("HTTP Get request - get office hours for course filtered", () => {
    it("Return 401 when no authorization toke is provided", async () => {
      const user4 = users[3];
      await prisma.account.update({
        where: {
          id: user4.id,
        },
        data: {
          staffCourses: {
            connect: {
              id: courses[0].id,
            },
          },
        },
      });
      await prisma.officeHour.create({
        data: {
          startDate: new Date(2023, 0, 1, 12),
          endDate: new Date(2023, 0, 1, 14),
          course: {
            connect: {
              id: courses[0].id,
            },
          },
          location: "zoom",
          isRecurring: false,
          isDeleted: false,
          hosts: {
            connect: {
              id: users[2].id,
            },
          },
        },
      });
      await prisma.officeHour.create({
        data: {
          startDate: new Date(2023, 0, 2, 12),
          endDate: new Date(2023, 0, 2, 14),
          course: {
            connect: {
              id: courses[0].id,
            },
          },
          location: "zoom",
          isRecurring: false,
          isDeleted: false,
          hosts: {
            connect: {
              id: user4.id,
            },
          },
        },
      });
      const response = await request.get(
        `${endpoint}/${courses[0].id}/officeHours/mine`
      );
      expect(response.status).toBe(401);
    });
    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/officeHours/mine`)
        .set("Authorization", "bearer " + users[0].expiredToken);
      expect(response.status).toBe(401);
    });
    it("Return 400 when invalid filter", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/officeHours/yours`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when invalid course id", async () => {
      const response = await request
        .get(`${endpoint}/-1/officeHours/mine`)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(400);
    });
    it("Return 403 when user is not in course", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/officeHours/mine`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.userName === "user2").token
        );
      expect(response.status).toBe(403);
    });
    it("Return 403 when user is student", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/officeHours/mine`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.userName === "user1").token
        );
      expect(response.status).toBe(403);
    });
    it("Return 202", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/officeHours/mine`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const officeHours = JSON.parse(response.text).officeHours;
      expect(officeHours.length).toBe(1);
    });
    it("Return 202", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/officeHours/all`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const officeHours = JSON.parse(response.text).officeHours;
      expect(officeHours.length).toBe(2);
    });
  });

  //topic routes
  describe("HTTP POST request - create topic", () => {
    it("Return 401 when no authorization toke is provided", async () => {
      const response = await request.post(`${endpoint}/createTopic`);
      expect(response.status).toBe(401);
    });
    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .post(`${endpoint}/createTopic`)
        .set("Authorization", "bearer " + users[2].expiredToken);
      expect(response.status).toBe(401);
    });
    it("Return 400 when no body is included", async () => {
      const attributes = {};
      const response = await request
        .post(`${endpoint}/createTopic`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when course id is not included", async () => {
      const attributes = {
        value: "Exams",
      };
      const response = await request
        .post(`${endpoint}/createTopic`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when value is not included", async () => {
      const attributes = {
        courseId: courses[0].id,
      };
      const response = await request
        .post(`${endpoint}/createTopic`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when course id is invalid", async () => {
      const attributes = {
        value: "Exam",
        courseId: -1,
      };
      const response = await request
        .post(`${endpoint}/createTopic`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 403 when course id is invalid", async () => {
      const attributes = {
        value: "Exam",
        courseId: courses[0].id,
      };
      const response = await request
        .post(`${endpoint}/createTopic`)
        .send(attributes)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(403);
    });
    it("Return 202 when course is created", async () => {
      const attributes = {
        value: "Exam",
        courseId: courses[0].id,
      };
      const response = await request
        .post(`${endpoint}/createTopic`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const topic = JSON.parse(response.text).topic;
      expect(topic.value).toBe("Exam");
      topics.push(topic);
    });
    it("Return 409 when duplicate topic is created", async () => {
      const attributes = {
        value: "Exam",
        courseId: courses[0].id,
      };
      const response = await request
        .post(`${endpoint}/createTopic`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(409);
    });
    it("Return 400 when topic for archived course is created", async () => {
      const attributes = {
        value: "HW10",
        courseId: archivedCourses[0].id,
      };
      const response = await request
        .post(`${endpoint}/createTopic`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
  });

  describe("HTTP POST request - edit topic", () => {
    it("Return 401 when no authorization toke is provided", async () => {
      const response = await request.post(`${endpoint}/editTopic`);
      expect(response.status).toBe(401);
    });
    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .post(`${endpoint}/editTopic`)
        .set("Authorization", "bearer " + users[2].expiredToken);
      expect(response.status).toBe(401);
    });
    it("Return 400 when no body is included", async () => {
      const attributes = {};
      const response = await request
        .post(`${endpoint}/editTopic`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when course id is not included", async () => {
      const attributes = {
        value: "Midterms",
        topicId: topics[0].id,
      };
      const response = await request
        .post(`${endpoint}/editTopic`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when value is not included", async () => {
      const attributes = {
        courseId: courses[0].id,
        topicId: topics[0].id,
      };
      const response = await request
        .post(`${endpoint}/editTopic`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when topic id is not included", async () => {
      const attributes = {
        courseId: courses[0].id,
        value: "Midterms",
      };
      const response = await request
        .post(`${endpoint}/editTopic`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when course id is invalid", async () => {
      const attributes = {
        value: "Exam",
        courseId: -1,
        topicId: topics[0].id,
      };
      const response = await request
        .post(`${endpoint}/editTopic`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 403 when user is not an instructor", async () => {
      const attributes = {
        value: "Exam",
        courseId: courses[0].id,
        topicId: topics[0].id,
      };
      const response = await request
        .post(`${endpoint}/editTopic`)
        .send(attributes)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(403);
    });
    it("Return 403 when topic id is invalid", async () => {
      const attributes = {
        value: "Midterms",
        courseId: courses[0].id,
        topicId: -1,
      };
      const response = await request
        .post(`${endpoint}/editTopic`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(403);
    });
    it("Return 400 when topic id is null", async () => {
      const attributes = {
        value: "Midterms",
        courseId: courses[0].id,
        topicId: null,
      };
      const response = await request
        .post(`${endpoint}/editTopic`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 403 when topic id for different course", async () => {
      const other_course = await prisma.course.create({
        data: {
          title: "hello2",
          semester: "Fall",
          calendarYear: 2023,
          courseNumber: "235.632",
          code: "GHIKLM",
        },
      });
      courses.push(other_course);
      const other_topic = await prisma.topic.create({
        data: {
          value: "test",
          courseId: other_course.id,
        },
      });
      topics.push(other_topic);
      const attributes = {
        value: "Midterms",
        courseId: courses[0].id,
        topicId: other_topic.id,
      };
      const response = await request
        .post(`${endpoint}/editTopic`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(403);
    });
    it("Return 409 when duplicate topic", async () => {
      const topic = await prisma.topic.create({
        data: {
          value: "Exams2",
          course: {
            connect: {
              id: courses[0].id,
            },
          },
        },
      });
      topics.push(topic);
      const attributes = {
        value: "Exams2",
        courseId: courses[0].id,
        topicId: topics[0].id,
      };
      const response = await request
        .post(`${endpoint}/editTopic`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(409);
    });
    it("Return 202 when course is created", async () => {
      const attributes = {
        value: "Midterms",
        courseId: courses[0].id,
        topicId: topics[0].id,
      };
      const response = await request
        .post(`${endpoint}/editTopic`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const topic = JSON.parse(response.text);
      expect(topic.value).toBe("Midterms");
      topics[0] = topic;
    });
  });

  describe("HTTP Get request - get topics for course", () => {
    it("Return 401 when no authorization toke is provided", async () => {
      const response = await request.get(`${endpoint}/${courses[0].id}/topics`);
      expect(response.status).toBe(401);
    });
    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/topics`)
        .set("Authorization", "bearer " + users[0].expiredToken);
      expect(response.status).toBe(401);
    });
    it("Return 400 when invalid course id", async () => {
      const response = await request
        .get(`${endpoint}/-1/topics`)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when user is not in course", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/topics`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.userName === "user2").token
        );
      expect(response.status).toBe(403);
    });
    it("Return 200", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/topics`)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(202);
      const topics = JSON.parse(response.text);
      expect(topics.length).toBe(2);
    });
  });

  describe("HTTP Delete Request - delete topic", () => {
    it("Return 401 when no authorization toke is provided", async () => {
      const response = await request.delete(
        `${endpoint}/topic/${topics[0].id}`
      );
      expect(response.status).toBe(401);
    });
    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .delete(`${endpoint}/topic/${topics[0].id}`)
        .set("Authorization", "bearer " + users[2].expiredToken);
      expect(response.status).toBe(401);
    });
    it("Return 400 when invalid topic id is provided", async () => {
      const response = await request
        .delete(`${endpoint}/topic/-1`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 403 when topic id is for another course", async () => {
      const other_course = await prisma.course.create({
        data: {
          title: "hello3",
          semester: "Fall",
          calendarYear: 2023,
          courseNumber: "235.633",
          code: "GHIKLP",
        },
      });
      courses.push(other_course);
      const other_topic = await prisma.topic.create({
        data: {
          value: "test",
          courseId: other_course.id,
        },
      });
      topics.push(other_topic);
      const response = await request
        .delete(`${endpoint}/topic/${other_topic.id}`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(403);
    });
    it("Return 403 when user is not in course", async () => {
      const response = await request
        .delete(`${endpoint}/topic/${topics[0].id}`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.userName === "user2").token
        );
      expect(response.status).toBe(403);
    });
    it("Return 403 when user is not instructor", async () => {
      const response = await request
        .delete(`${endpoint}/topic/${topics[0].id}`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.userName === "user1").token
        );
      expect(response.status).toBe(403);
    });
    it("Return 202 when course successfully archived", async () => {
      const response = await request
        .post(`/api/course/${courses[0].id}/archiveCourse`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
    });
    it("Return 400 when deleting a topic of an archived course", async () => {
      const response = await request
        .delete(`${endpoint}/topic/${topics[0].id}`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 202 when course successfully unarchive course", async () => {
      const response = await request
        .post(`/api/course/${courses[0].id}/archiveCourse`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
    });
    it("Return 202 when course is deleted", async () => {
      let response = await request
        .delete(`${endpoint}/topic/${topics[0].id}`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const topic = JSON.parse(response.text);
      expect(topic.value).toBe("Midterms");
    });
  });

  describe("HTTP Get request - get roster for course", () => {
    it("Return 401 when no authorization toke is provided", async () => {
      const response = await request.get(`${endpoint}/${courses[0].id}/role`);
      expect(response.status).toBe(401);
    });
    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/role`)
        .set("Authorization", "bearer " + users[0].expiredToken);
      expect(response.status).toBe(401);
    });
    it("Return 400 when invalid course id", async () => {
      const response = await request
        .get(`${endpoint}/-1/role`)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when user is not in course", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/role`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.userName === "user2").token
        );
      expect(response.status).toBe(403);
    });
    it("Return 200 - student", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/role`)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(202);
      expect(JSON.parse(response.text).role).toBe("Student");
    });
    it("Return 200 - instructor", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/role`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      expect(JSON.parse(response.text).role).toBe("Instructor");
    });
    it("Return 200 - course staff", async () => {
      const user4 = users[3];
      await prisma.account.update({
        where: {
          id: user4.id,
        },
        data: {
          staffCourses: {
            connect: {
              id: courses[0].id,
            },
          },
        },
      });
      const response = await request
        .get(`${endpoint}/${courses[0].id}/role`)
        .set("Authorization", "bearer " + user4.token);
      expect(response.status).toBe(202);
      expect(JSON.parse(response.text).role).toBe("Staff");
    });
  });

  describe("HTTP Get request - get role for course", () => {
    it("Return 401 when no authorization toke is provided", async () => {
      const response = await request.get(
        `${endpoint}/${courses[0].id}/getRoster`
      );
      expect(response.status).toBe(401);
    });
    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/getRoster`)
        .set("Authorization", "bearer " + users[0].expiredToken);
      expect(response.status).toBe(401);
    });
    it("Return 400 when invalid course id", async () => {
      const response = await request
        .get(`${endpoint}/-1/getRoster`)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when user is not in course", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/getRoster`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.userName === "user2").token
        );
      expect(response.status).toBe(403);
    });
    it("Return 200 - gets roster", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/getRoster`)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(202);
      const roster = JSON.parse(response.text);
      expect(roster.instructors.length).toBe(1);
      expect(roster.staff.length).toBe(1);
      expect(roster.students.length).toBe(1);
    });
  });

  describe("HTTP Get request - get role for course given id", () => {
    it("Return 401 when no authorization toke is provided", async () => {
      const response = await request.get(
        `${endpoint}/${courses[0].id}/${users[0].id}/getRole`
      );
      expect(response.status).toBe(401);
    });
    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/${users[0].id}/getRole`)
        .set("Authorization", "bearer " + users[2].expiredToken);
      expect(response.status).toBe(401);
    });
    it("Return 400 when invalid course id", async () => {
      const response = await request
        .get(`${endpoint}/-1/${users[0].id}/getRole`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when invalid user id", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/-1/getRole`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when user is not in course", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/${users[0].id}/getRole`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.userName === "user2").token
        );
      expect(response.status).toBe(403);
    });
    it("Return 400 when user is student in course", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/${users[0].id}/getRole`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.userName === "user1").token
        );
      expect(response.status).toBe(403);
    });
    it("Return 200 - gets role - student", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/${users[0].id}/getRole`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      expect(JSON.parse(response.text).role).toBe("Student");
    });
    it("Return 200 - gets role - staff", async () => {
      const user4 = users[3];
      const response = await request
        .get(`${endpoint}/${courses[0].id}/${user4.id}/getRole`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      expect(JSON.parse(response.text).role).toBe("Staff");
    });
    it("Return 200 - gets role - instructor", async () => {
      const user4 = users[2];
      const response = await request
        .get(`${endpoint}/${courses[0].id}/${user4.id}/getRole`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      expect(JSON.parse(response.text).role).toBe("Instructor");
    });
  });

  // office hour time intervals
  describe("HTTP POST request - create office hour time interval", () => {
    it("Return 401 when no authorization toke is provided", async () => {
      const response = await request.post(
        `${endpoint}/${courses[0].id}/officeHourTimeInterval`
      );
      expect(response.status).toBe(401);
    });
    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .post(`${endpoint}/${courses[0].id}/officeHourTimeInterval`)
        .set("Authorization", "bearer " + users[2].expiredToken);
      expect(response.status).toBe(401);
    });
    it("Return 400 when no body is included", async () => {
      const attributes = {};
      const response = await request
        .post(`${endpoint}/${courses[0].id}/officeHourTimeInterval`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when invalid course id", async () => {
      const attributes = {
        title: "title",
        length: 20,
      };
      const response = await request
        .post(`${endpoint}/-1/officeHourTimeInterval`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when course title is not included", async () => {
      const attributes = {
        //title: "title",
        length: 20,
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}/officeHourTimeInterval`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when length is not included", async () => {
      const attributes = {
        title: "title",
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}/officeHourTimeInterval`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when length is not a multiple of 5", async () => {
      const attributes = {
        title: "title",
        length: 11,
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}/officeHourTimeInterval`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 403 when user is not instructor", async () => {
      const attributes = {
        title: "title",
        length: 20,
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}/officeHourTimeInterval`)
        .send(attributes)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(403);
    });
    it("Return 202 when time length is created", async () => {
      const attributes = {
        title: "title",
        length: 20,
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}/officeHourTimeInterval`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
    });
    it("Return 400 when time length of archived course is created", async () => {
      const attributes = {
        title: "title",
        length: 20,
      };
      const response = await request
        .post(`${endpoint}/${archivedCourses[0].id}/officeHourTimeInterval`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
  });

  describe("HTTP Get request - get office hour time options for a course", () => {
    it("Return 401 when no authorization toke is provided", async () => {
      const response = await request.get(
        `${endpoint}/${courses[0].id}/officeHourTimeInterval`
      );
      expect(response.status).toBe(401);
    });
    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/officeHourTimeInterval`)
        .set("Authorization", "bearer " + users[0].expiredToken);
      expect(response.status).toBe(401);
    });
    it("Return 401 when course id is invalid", async () => {
      const response = await request
        .get(`${endpoint}/-1/officeHourTimeInterval`)
        .set("Authorization", "bearer " + users[0].expiredToken);
      expect(response.status).toBe(401);
    });
    it("Return 403 when user is not in course", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/officeHourTimeInterval`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.userName === "user2").token
        );
      expect(response.status).toBe(403);
    });
    it("Return 200 when no body is included", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/officeHourTimeInterval`)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(202);
      const timeSlots = JSON.parse(response.text).times;
      expect(timeSlots.length).toBe(2);
    });
  });

  describe("HTTP POST request - update office hour time option", () => {
    it("Return 401 when no authorization toke is provided", async () => {
      const response = await request.post(
        `${endpoint}/${courses[0].id}/officeHourTimeInterval/1/update`
      );
      expect(response.status).toBe(401);
    });
    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .post(`${endpoint}/${courses[0].id}/officeHourTimeInterval/1/update`)
        .set("Authorization", "bearer " + users[0].expiredToken);
      expect(response.status).toBe(401);
    });
    it("Return 400 when body is empty", async () => {
      const attributes = {};
      const response = await request
        .post(`${endpoint}/${courses[0].id}/officeHourTimeInterval/1/update`)
        .set("Authorization", "bearer " + users[0].token)
        .send(attributes);
      expect(response.status).toBe(400);
    });
    it("Return 400 when length is not included", async () => {
      const attributes = {
        title: "title",
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}/officeHourTimeInterval/1/update`)
        .set("Authorization", "bearer " + users[0].token)
        .send(attributes);
      expect(response.status).toBe(400);
    });
    it("Return 400 when title is not included", async () => {
      const attributes = {
        length: 10,
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}/officeHourTimeInterval/1/update`)
        .set("Authorization", "bearer " + users[0].token)
        .send(attributes);
      expect(response.status).toBe(400);
    });
    it("Return 400 when length is not at least 10", async () => {
      const attributes = {
        length: 5,
        title: "title",
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}/officeHourTimeInterval/1/update`)
        .set("Authorization", "bearer " + users[0].token)
        .send(attributes);
      expect(response.status).toBe(400);
    });
    it("Return 400 when course id is invalid", async () => {
      const attributes = {
        length: 15,
        title: "title",
      };
      const response = await request
        .post(`${endpoint}/-1/officeHourTimeInterval/1/update`)
        .set("Authorization", "bearer " + users[0].token)
        .send(attributes);
      expect(response.status).toBe(400);
    });
    it("Return 400 when user is not instructor", async () => {
      const attributes = {
        length: 15,
        title: "title",
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}/officeHourTimeInterval/1/update`)
        .set("Authorization", "bearer " + users[0].token)
        .send(attributes);
      expect(response.status).toBe(403);
    });
    it("Return 400 when length is not a multiple of 5", async () => {
      const attributes = {
        length: 6,
        title: "title",
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}/officeHourTimeInterval/1/update`)
        .set("Authorization", "bearer " + users[2].token)
        .send(attributes);
      expect(response.status).toBe(400);
    });
    it("Return 403 when option is not for course", async () => {
      const attributes = {
        length: 15,
        title: "title",
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}/officeHourTimeInterval/-1/update`)
        .set("Authorization", "bearer " + users[2].token)
        .send(attributes);
      expect(response.status).toBe(403);
    });
    it("Return 202 when time option is updated", async () => {
      const attributes = {
        length: 15,
        title: "title",
      };
      const timeOptions = await prisma.officeHourTimeOptions.findFirst({
        where: {
          duration: 20,
        },
      });
      const response = await request
        .post(
          `${endpoint}/${courses[0].id}/officeHourTimeInterval/${timeOptions.id}/update`
        )
        .set("Authorization", "bearer " + users[2].token)
        .send(attributes);
      expect(response.status).toBe(202);
      const timeOption = JSON.parse(response.text).time;
      expect(timeOption.title).toBe("title");
      expect(timeOption.duration).toBe(15);
    });
    it("Return 202 when course successfully archived", async () => {
      const response = await request
        .post(`${endpoint}/${courses[0].id}/archiveCourse`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
    });
    it("Return 400 when time option of archived course is updated", async () => {
      const attributes = {
        length: 15,
        title: "title",
      };
      const timeOptions = await prisma.officeHourTimeOptions.findFirst({
        where: {
          duration: 15,
        },
      });
      const response = await request
        .post(
          `${endpoint}/${courses[0].id}/officeHourTimeInterval/${timeOptions.id}/update`
        )
        .set("Authorization", "bearer " + users[2].token)
        .send(attributes);
      expect(response.status).toBe(400);
    });
    it("Return 202 when course successfully unarchived", async () => {
      const response = await request
        .post(`${endpoint}/${courses[0].id}/archiveCourse`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
    });
  });

  describe("HTTP DELETE request - delete office hour time option for course", () => {
    it("Return 401 when no authorization toke is provided", async () => {
      const response = await request.delete(
        `${endpoint}/${courses[0].id}/officeHourTimeInterval/1`
      );
      expect(response.status).toBe(401);
    });
    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .delete(`${endpoint}/${courses[0].id}/officeHourTimeInterval/1`)
        .set("Authorization", "bearer " + users[0].expiredToken);
      expect(response.status).toBe(401);
    });
    it("Return 400 when course id is invalid", async () => {
      const response = await request
        .delete(`${endpoint}/-1/officeHourTimeInterval/1`)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(400);
    });
    it("Return 403 when user is not instructor", async () => {
      const response = await request
        .delete(`${endpoint}/${courses[0].id}/officeHourTimeInterval/1`)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(403);
    });
    it("Return 409 when option is not for course", async () => {
      const response = await request
        .delete(`${endpoint}/${courses[0].id}/officeHourTimeInterval/-1`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(409);
    });
    it("Return 202 when course successfully archived", async () => {
      const response = await request
        .post(`${endpoint}/${courses[0].id}/archiveCourse`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
    });
    it("Return 400 when time option of archived course is deleted", async () => {
      const timeOptions = await prisma.officeHourTimeOptions.findFirst({
        where: {
          duration: 15,
        },
      });
      const response = await request
        .delete(
          `${endpoint}/${courses[0].id}/officeHourTimeInterval/${timeOptions.id}`
        )
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 202 when course successfully unarchived", async () => {
      const response = await request
        .post(`${endpoint}/${courses[0].id}/archiveCourse`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
    });
    it("Return 202 when time option is updated", async () => {
      const timeOptions = await prisma.officeHourTimeOptions.findFirst({
        where: {
          duration: 15,
        },
      });
      const response = await request
        .delete(
          `${endpoint}/${courses[0].id}/officeHourTimeInterval/${timeOptions.id}`
        )
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const timeOption = JSON.parse(response.text).deletedTime;
      expect(timeOption.id).toBe(timeOptions.id);
      expect(timeOption.title).toBe(timeOptions.title);
      expect(timeOption.duration).toBe(timeOptions.duration);
      expect(timeOption.courseId).toBe(timeOptions.courseId);
    });
    it("Return 400 when it is the only time option remaining", async () => {
      const timeOptions = await prisma.officeHourTimeOptions.findFirst({
        where: {
          duration: 10,
          courseId: courses[0].id,
        },
      });
      const response = await request
        .delete(
          `${endpoint}/${courses[0].id}/officeHourTimeInterval/${timeOptions.id}`
        )
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
  });

  describe("HTTP POST request - edit registration constraints", () => {
    it("Return 401 when no authorization toke is provided", async () => {
      const response = await request.post(
        `${endpoint}/${courses[0].id}/registrationConstraints`
      );
      expect(response.status).toBe(401);
    });
    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .post(`${endpoint}/${courses[0].id}/registrationConstraints`)
        .set("Authorization", "bearer " + users[2].expiredToken);
      expect(response.status).toBe(401);
    });
    it("Return 400 when no body is included", async () => {
      const attributes = {};
      const response = await request
        .post(`${endpoint}/${courses[0].id}/registrationConstraints`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when start is not included", async () => {
      const attributes = {
        end: 0,
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}/registrationConstraints`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when end is not included", async () => {
      const attributes = {
        start: 72,
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}/registrationConstraints`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when course id is invalid", async () => {
      const attributes = {
        start: 72,
        end: 0,
      };
      const response = await request
        .post(`${endpoint}/-1/registrationConstraints`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 403 when it is not an instructor", async () => {
      const attributes = {
        start: 72,
        end: 0,
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}/registrationConstraints`)
        .send(attributes)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(403);
    });
    it("Return 400 when start is negative", async () => {
      const attributes = {
        start: -72,
        end: 0,
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}/registrationConstraints`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when end is negative", async () => {
      const attributes = {
        start: 72,
        end: -1,
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}/registrationConstraints`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when end is greater than start", async () => {
      const attributes = {
        start: 1,
        end: 72,
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}/registrationConstraints`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 202 when course successfully archived", async () => {
      const response = await request
        .post(`${endpoint}/${courses[0].id}/archiveCourse`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
    });
    it("Return 400 when archived course edit registration constraints", async () => {
      const attributes = {
        start: 72,
        end: 0,
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}/registrationConstraints`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 202 when course successfully unarchived", async () => {
      const response = await request
        .post(`${endpoint}/${courses[0].id}/archiveCourse`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
    });
    it("Return 202 when course is created", async () => {
      const attributes = {
        start: 72,
        end: 0,
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}/registrationConstraints`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const course = JSON.parse(response.text).course;
      expect(course.startRegConstraint).toBe(72);
      expect(course.endRegConstraint).toBe(0);
    });
  });

  describe("HTTP POST request - promote route", () => {
    it("Return 401 when no authorization toke is provided", async () => {
      const response = await request.post(`${endpoint}/${courses[0].id}`);
      expect(response.status).toBe(401);
    });
    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .post(`${endpoint}/${courses[0].id}`)
        .set("Authorization", "bearer " + users[2].expiredToken);
      expect(response.status).toBe(401);
    });
    it("Return 400 when no body is included", async () => {
      const attributes = {};
      const response = await request
        .post(`${endpoint}/${courses[0].id}`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when role is not included", async () => {
      const attributes = {
        studentId: users[0].id,
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when studentId is not included", async () => {
      const attributes = {
        role: "Staff",
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when course id is invalid", async () => {
      const attributes = {
        studentId: users[0].id,
        role: "Staff",
      };
      const response = await request
        .post(`${endpoint}/-1`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when student id is invalid", async () => {
      const attributes = {
        studentId: -1,
        role: "Staff",
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 403 when it is not an instructor", async () => {
      const attributes = {
        studentId: users[0].id,
        role: "Staff",
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}`)
        .send(attributes)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(403);
    });
    it("Return 400 when role is not valid", async () => {
      const attributes = {
        studentId: users[0].id,
        role: "stuff",
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 409 when trying to promote an instructor", async () => {
      const attributes = {
        studentId: users[3].id,
        role: "Staff",
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(409);
    });
    it("Return 202 when course successfully archived", async () => {
      const response = await request
        .post(`${endpoint}/${courses[0].id}/archiveCourse`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
    });
    it("Return 400 when student of archived course is promoted", async () => {
      const attributes = {
        studentId: users[0].id,
        role: "Staff",
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 202 when student of archived course is promoted", async () => {
      const attributes = {
        studentId: users[3].id,
        role: "Instructor",
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 202 when course successfully unarchived", async () => {
      const response = await request
        .post(`${endpoint}/${courses[0].id}/archiveCourse`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
    });
    it("Return 202 when student is promoted", async () => {
      const attributes = {
        studentId: users[0].id,
        role: "Staff",
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const account = JSON.parse(response.text);
      expect(account.newRole).toBe("Staff");
      expect(account.oldRole).toBe("Student");
    });
    it("Return 202 when student is promoted Instructor", async () => {
      await prisma.account.update({
        where: {
          id: users[3].id,
        },
        data: {
          staffCourses: {
            disconnect: {
              id: courses[0].id,
            },
          },
          studentCourses: {
            connect: {
              id: courses[0].id,
            },
          },
        },
      });
      const attributes = {
        studentId: users[3].id,
        role: "Instructor",
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const account = JSON.parse(response.text);
      expect(account.newRole).toBe("Instructor");
      expect(account.oldRole).toBe("Student");
    });
    it("Return 202 when staff is promoted Instructor", async () => {
      await prisma.account.update({
        where: {
          id: users[3].id,
        },
        data: {
          staffCourses: {
            connect: {
              id: courses[0].id,
            },
          },
        },
      });
      const attributes = {
        studentId: users[3].id,
        role: "Instructor",
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const account = JSON.parse(response.text);
      expect(account.newRole).toBe("Instructor");
      expect(account.oldRole).toBe("Staff");
    });
  });

  describe("HTTP POST request - demote route", () => {
    it("Return 401 when no authorization toke is provided", async () => {
      const response = await request.post(
        `${endpoint}/${courses[0].id}/demote`
      );
      expect(response.status).toBe(401);
    });
    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .post(`${endpoint}/${courses[0].id}/demote`)
        .set("Authorization", "bearer " + users[2].expiredToken);
      expect(response.status).toBe(401);
    });
    it("Return 400 when no body is included", async () => {
      const attributes = {};
      const response = await request
        .post(`${endpoint}/${courses[0].id}/demote`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when role is not included", async () => {
      const attributes = {
        studentId: users[0].id,
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}/demote`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when studentId is not included", async () => {
      const attributes = {
        role: "Staff",
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}/demote`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when course id is invalid", async () => {
      const attributes = {
        studentId: users[0].id,
        role: "Student",
      };
      const response = await request
        .post(`${endpoint}/-1/demote`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when student id is invalid", async () => {
      const attributes = {
        studentId: -1,
        role: "Student",
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}/demote`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 403 when it is not an instructor", async () => {
      const attributes = {
        studentId: users[0].id,
        role: "Student",
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}/demote`)
        .send(attributes)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(403);
    });
    it("Return 400 when role is not valid", async () => {
      const attributes = {
        studentId: users[0].id,
        role: "stuff",
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}/demote`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 202 when course successfully archived", async () => {
      const response = await request
        .post(`${endpoint}/${courses[0].id}/archiveCourse`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
    });
    it("Return 400 when staff of archived course is demoted", async () => {
      const attributes = {
        studentId: users[0].id,
        role: "Student",
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}/demote`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 202 when course successfully unarchived", async () => {
      const response = await request
        .post(`${endpoint}/${courses[0].id}/archiveCourse`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
    });
    it("Return 202 when staff is demoted", async () => {
      const attributes = {
        studentId: users[0].id,
        role: "Student",
      };
      const now = new Date();
      const next = new Date();
      next.setUTCHours(next.getUTCHours() + 2);
      await prisma.officeHour.create({
        data: {
          hosts: {
            connect: [{ id: users[0].id }],
          },
          courseId: courses[0].id,
          location: "zoom",
          isRecurring: false,
          startDate: now,
          endDate: next,
        },
      });
      const response = await request
        .post(`${endpoint}/${courses[0].id}/demote`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const account = JSON.parse(response.text);
      expect(account.newRole).toBe("Student");
      expect(account.oldRole).toBe("Staff");
    });
    it("Return 409 when student is attempted to be demoted further", async () => {
      const attributes = {
        studentId: users[0].id,
        role: "Student",
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}/demote`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(409);
    });
  });

  describe("HTTP Get request - get topic counts for course", () => {
    it("Return 401 when no authorization toke is provided", async () => {
      await prisma.topic.create({
        data: {
          value: "Homework",
          course: {
            connect: {
              id: courses[0].id,
            },
          },
        },
      });
      const response = await request.get(
        `${endpoint}/${courses[0].id}/topicCounts`
      );
      expect(response.status).toBe(401);
    });
    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/topicCounts`)
        .set("Authorization", "bearer " + users[0].expiredToken);
      expect(response.status).toBe(401);
    });
    it("Return 400 when invalid course id", async () => {
      const response = await request
        .get(`${endpoint}/-1/topicCounts`)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when user is not an instructor", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/topicCounts`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.userName === "user1").token
        );
      expect(response.status).toBe(403);
    });
    it("Return 200 - no registrations", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/topicCounts`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const { counts } = JSON.parse(response.text);
      counts.forEach((count) => {
        expect(count._count.registrations).toBe(0);
      });
    });
    it("Return 200 - one registration", async () => {
      const officeHours = await prisma.officeHour.findMany({
        where: {
          courseId: courses[0].id,
        },
      });
      const topics = await prisma.topic.findMany({
        where: {
          courseId: courses[0].id,
        },
      });
      const timeOption = await prisma.officeHourTimeOptions.findFirst({
        where: {
          courseId: courses[0].id,
          duration: 10,
        },
      });
      await prisma.registration.create({
        data: {
          startTime: new Date(1970, 0, 1, 17),
          endTime: new Date(1970, 0, 1, 17, 10),
          date: new Date(2023, 0, 1),
          officeHour: {
            connect: {
              id: officeHours[0].id,
            },
          },
          account: {
            connect: {
              id: users[0].id,
            },
          },
          topics: {
            connect: {
              id: topics[0].id,
            },
          },
          officeHourTimeOptions: {
            connect: {
              id: timeOption.id,
            },
          },
        },
      });
      const response = await request
        .get(`${endpoint}/${courses[0].id}/topicCounts`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const { counts } = JSON.parse(response.text);
      counts.forEach((count) => {
        if (count.value === topics[0].value) {
          expect(count._count.registrations).toBe(1);
        } else {
          expect(count._count.registrations).toBe(0);
        }
      });
    });
  });

  describe("HTTP Get request - get student registration counts", () => {
    it("Return 401 when no authorization toke is provided", async () => {
      const response = await request.get(
        `${endpoint}/${courses[0].id}/studentRegistrationCounts`
      );
      expect(response.status).toBe(401);
    });
    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/studentRegistrationCounts`)
        .set("Authorization", "bearer " + users[0].expiredToken);
      expect(response.status).toBe(401);
    });
    it("Return 400 when invalid course id", async () => {
      const response = await request
        .get(`${endpoint}/-1/studentRegistrationCounts`)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when user is not an instructor", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/studentRegistrationCounts`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.userName === "user1").token
        );
      expect(response.status).toBe(403);
    });
    it("Return 200 - one registrations", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/studentRegistrationCounts`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const counts = JSON.parse(response.text).countsAndAccount;
      counts.forEach((count) => {
        if (count.id === users[0].id) {
          expect(count.numRegistrations).toBe(1);
        } else {
          expect(count.numRegistrations).toBe(0);
        }
      });
    });
    it("Return 200 - no registration", async () => {
      const officeHours = await prisma.officeHour.findMany({
        where: {
          courseId: courses[0].id,
        },
      });
      await prisma.registration.deleteMany({
        where: {
          officeHourId: officeHours[0].id,
        },
      });
      const response = await request
        .get(`${endpoint}/${courses[0].id}/studentRegistrationCounts`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const counts = JSON.parse(response.text).countsAndAccount;
      counts.forEach((count) => {
        expect(count.numRegistrations).toBe(0);
      });
    });
  });

  describe("HTTP Get request - get all registrations", () => {
    it("Return 401 when no authorization toke is provided", async () => {
      const user4 = users[3];
      await prisma.account.update({
        where: {
          id: user4.id,
        },
        data: {
          instructorCourses: {
            disconnect: {
              id: courses[0].id,
            },
          },
          staffCourses: {
            connect: {
              id: courses[0].id,
            },
          },
        },
      });
      const response = await request.get(
        `${endpoint}/${courses[0].id}/getAllRegistrations`
      );
      expect(response.status).toBe(401);
    });
    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/getAllRegistrations`)
        .set("Authorization", "bearer " + users[0].expiredToken);
      expect(response.status).toBe(401);
    });
    it("Return 400 when invalid course id", async () => {
      const response = await request
        .get(`${endpoint}/-1/getAllRegistrations`)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when user is not in course", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/getAllRegistrations`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.userName === "user2").token
        );
      expect(response.status).toBe(403);
    });
    it("Return 200 - no registrations - instructor", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/getAllRegistrations`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      expect(JSON.parse(response.text).registrations.length).toBe(0);
    });
    it("Return 200 - no registrations - staff", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/getAllRegistrations`)
        .set("Authorization", "bearer " + users[3].token);
      expect(response.status).toBe(202);
      expect(JSON.parse(response.text).registrations.length).toBe(0);
    });
    it("Return 200 - no registrations - student", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/getAllRegistrations`)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(202);
      expect(JSON.parse(response.text).registrations.length).toBe(0);
    });
    it("Return 200 - one registration - instructor", async () => {
      const officeHours = await prisma.officeHour.findMany({
        where: {
          courseId: courses[0].id,
        },
      });
      const topics = await prisma.topic.findMany({
        where: {
          courseId: courses[0].id,
        },
      });
      const timeOption = await prisma.officeHourTimeOptions.findFirst({
        where: {
          courseId: courses[0].id,
          duration: 10,
        },
      });
      await prisma.registration.create({
        data: {
          startTime: new Date(1970, 0, 1, 17),
          endTime: new Date(1970, 0, 1, 17, 10),
          date: new Date(2023, 0, 1),
          officeHour: {
            connect: {
              id: officeHours[0].id,
            },
          },
          account: {
            connect: {
              id: users[0].id,
            },
          },
          topics: {
            connect: {
              id: topics[0].id,
            },
          },
          officeHourTimeOptions: {
            connect: {
              id: timeOption.id,
            },
          },
        },
      });
      const response = await request
        .get(`${endpoint}/${courses[0].id}/getAllRegistrations`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      expect(JSON.parse(response.text).registrations.length).toBe(1);
    });
    it("Return 200 - one registration - staff", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/getAllRegistrations`)
        .set("Authorization", "bearer " + users[3].token);
      expect(response.status).toBe(202);
      expect(JSON.parse(response.text).registrations.length).toBe(0);
    });
    it("Return 200 - one registration - student", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/getAllRegistrations`)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(202);
      expect(JSON.parse(response.text).registrations.length).toBe(1);
    });
  });
  describe("HTTP POST pause course", () => {
    it("Return 401 when no authorization toke is provided", async () => {
      const response = await request.post(
        `${endpoint}/${courses[0].id}/pauseCourse`
      );
      expect(response.status).toBe(401);
    });
    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .post(`${endpoint}/${courses[0].id}/pauseCourse`)
        .set("Authorization", "bearer " + users[2].expiredToken);
      expect(response.status).toBe(401);
    });
    it("Return 400 when course id is invalid", async () => {
      const response = await request
        .post(`${endpoint}/-1/pauseCourse`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 202 when course successfully paused", async () => {
      const response = await request
        .post(`${endpoint}/${courses[0].id}/pauseCourse`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
      });
      expect(course.isPaused).toBe(true);
    });
  });

  describe("HTTP POST archive course", () => {
    it("Return 401 when no authorization toke is provided", async () => {
      const response = await request.post(
        `${endpoint}/${courses[0].id}/archiveCourse`
      );
      expect(response.status).toBe(401);
    });
    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .post(`${endpoint}/${courses[0].id}/archiveCourse`)
        .set("Authorization", "bearer " + users[2].expiredToken);
      expect(response.status).toBe(401);
    });
    it("Return 400 when course id is invalid", async () => {
      const response = await request
        .post(`${endpoint}/-1/archiveCourse`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 202 when course successfully archived", async () => {
      const response = await request
        .post(`${endpoint}/${courses[0].id}/archiveCourse`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
      });
      expect(course.isArchived).toBe(true);
    });
  });

  describe("HTTP Get request registrations by filter", () => {
    it("Return 401 when no authorization toke is provided", async () => {
      const response = await request.get(
        `${endpoint}/${courses[0].id}/getRegistration/date/value/10-01-2023`
      );
      expect(response.status).toBe(401);
    });
    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .get(
          `${endpoint}/${courses[0].id}/getRegistration/date/value/10-01-2023`
        )
        .set("Authorization", "bearer " + users[0].expiredToken);
      expect(response.status).toBe(401);
    });
    it("Return 400 when course id is invalid", async () => {
      const response = await request
        .get(`${endpoint}/-1/getRegistration/date/value/10-01-2023`)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when user is not in course", async () => {
      const response = await request
        .get(`${endpoint}/-1/getRegistration/date/value/10-01-2023`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.userName === "user2").token
        );
      expect(response.status).toBe(400);
    });
    it("Return 400 when filter type is invalid", async () => {
      const response = await request
        .get(
          `${endpoint}/${courses[0].id}/getRegistration/test/value/10-01-2023`
        )
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(400);
      const courseWithRoles = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
        include: {
          students: true,
          courseStaff: true,
          instructors: true,
        },
      });
    });
    it("Return 400 when filter type is not allowed for the given role - student", async () => {
      const response = await request
        .get(
          `${endpoint}/${courses[0].id}/getRegistration/accountId/value/10-01-2023`
        )
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when filter type is not allowed for the given role - staff", async () => {
      const response = await request
        .get(
          `${endpoint}/${courses[0].id}/getRegistration/hosts/value/10-01-2023`
        )
        .set("Authorization", "bearer " + users[3].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when filter value is not valid - date", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/getRegistration/date/value/a`)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when filter value is not valid - office hour id invalid", async () => {
      const response = await request
        .get(
          `${endpoint}/${courses[0].id}/getRegistration/officeHourId/value/a`
        )
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when filter value is not valid - office hour id dne", async () => {
      const response = await request
        .get(
          `${endpoint}/${courses[0].id}/getRegistration/officeHourId/value/-1`
        )
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when filter value is not valid - account id invalid", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/getRegistration/accountId/value/a`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when filter value is not valid - account id dne", async () => {
      const response = await request
        .get(
          `${endpoint}/${courses[0].id}/getRegistration/officeHourId/value/-1`
        )
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when filter value is not valid - hosts invalid", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/getRegistration/hosts/value/a`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when filter value is not valid - hosts dne", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/getRegistration/hosts/value/-1`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when filter value is not valid - topics invalid", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/getRegistration/topics/value/a`)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when filter value is not valid - topic dne", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/getRegistration/topics/value/-1`)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when filter value is not valid - isNoShow invalid", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/getRegistration/isNoShow/value/-1`)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when filter value is not valid - topic dne", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/getRegistration/accountId/value/a`)
        .set("Authorization", "bearer " + users[3].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when filter value is not valid - isNoShow dne", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/getRegistration/accountId/value/-1`)
        .set("Authorization", "bearer " + users[3].token);
      expect(response.status).toBe(400);
    });
    it("Return 202 when filter value is date - student none on date", async () => {
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
        include: {
          students: true,
          courseStaff: true,
          instructors: true,
          topics: true,
        },
      });
      const officehours = await prisma.officeHour.findMany({
        where: {
          courseId: courses[0].id,
        },
        include: {
          hosts: true,
        },
      });
      const response = await request
        .get(
          `${endpoint}/${courses[0].id}/getRegistration/date/value/10-01-2023`
        )
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(202);
      const { registrations } = JSON.parse(response.text);
      expect(registrations.length).toBe(0);
    });
    it("Return 202 when filter value is date - student some on date", async () => {
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
        include: {
          students: true,
          courseStaff: true,
          instructors: true,
          topics: true,
          officeHours: true,
          officeHourOptions: true,
        },
      });
      const registration = await prisma.registration.create({
        data: {
          officeHour: {
            connect: {
              id: course.officeHours[0].id,
            },
          },
          startTime: new Date(0),
          endTime: new Date(10),
          date: new Date("10-01-2023"),
          account: {
            connect: {
              id: users[0].id,
            },
          },
          topics: {
            connect: {
              id: course.topics[0].id,
            },
          },
          officeHourTimeOptions: {
            connect: {
              id: course.officeHourOptions[0].id,
            },
          },
        },
      });
      const response = await request
        .get(
          `${endpoint}/${courses[0].id}/getRegistration/date/value/10-01-2023`
        )
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(202);
      const { registrations } = JSON.parse(response.text);
      expect(registrations.length).toBe(1);
      await prisma.registration.delete({
        where: {
          id: registration.id,
        },
      });
    });
    it("Return 202 when filter value is date - instructor one on date", async () => {
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
        include: {
          students: true,
          courseStaff: true,
          instructors: true,
          topics: true,
          officeHours: true,
          officeHourOptions: true,
        },
      });
      const registration = await prisma.registration.create({
        data: {
          officeHour: {
            connect: {
              id: course.officeHours[1].id,
            },
          },
          startTime: new Date(0),
          endTime: new Date(10),
          date: new Date("10-01-2023"),
          account: {
            connect: {
              id: users[0].id,
            },
          },
          topics: {
            connect: {
              id: course.topics[0].id,
            },
          },
          officeHourTimeOptions: {
            connect: {
              id: course.officeHourOptions[0].id,
            },
          },
        },
      });
      const response = await request
        .get(
          `${endpoint}/${courses[0].id}/getRegistration/date/value/10-01-2023`
        )
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const { registrations } = JSON.parse(response.text);
      expect(registrations.length).toBe(1);
      await prisma.registration.delete({
        where: {
          id: registration.id,
        },
      });
    });
    it("Return 202 when filter value is date - instructor some on date", async () => {
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
        include: {
          students: true,
          courseStaff: true,
          instructors: true,
          topics: true,
          officeHours: true,
          officeHourOptions: true,
        },
      });
      const registration = await prisma.registration.create({
        data: {
          officeHour: {
            connect: {
              id: course.officeHours[0].id,
            },
          },
          startTime: new Date(0),
          endTime: new Date(10),
          date: new Date("10-01-2023"),
          account: {
            connect: {
              id: users[0].id,
            },
          },
          topics: {
            connect: {
              id: course.topics[0].id,
            },
          },
          officeHourTimeOptions: {
            connect: {
              id: course.officeHourOptions[0].id,
            },
          },
        },
      });
      const response = await request
        .get(
          `${endpoint}/${courses[0].id}/getRegistration/date/value/10-01-2023`
        )
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const { registrations } = JSON.parse(response.text);
      expect(registrations.length).toBe(1);
      await prisma.registration.delete({
        where: {
          id: registration.id,
        },
      });
    });
    it("Return 202 when filter value is date - staff none on date", async () => {
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
        include: {
          students: true,
          courseStaff: true,
          instructors: true,
          topics: true,
          officeHours: true,
          officeHourOptions: true,
        },
      });
      const registration = await prisma.registration.create({
        data: {
          officeHour: {
            connect: {
              id: course.officeHours[0].id,
            },
          },
          startTime: new Date(0),
          endTime: new Date(10),
          date: new Date("10-01-2023"),
          account: {
            connect: {
              id: users[0].id,
            },
          },
          topics: {
            connect: {
              id: course.topics[0].id,
            },
          },
          officeHourTimeOptions: {
            connect: {
              id: course.officeHourOptions[0].id,
            },
          },
        },
      });
      const response = await request
        .get(
          `${endpoint}/${courses[0].id}/getRegistration/date/value/10-01-2023`
        )
        .set("Authorization", "bearer " + users[3].token);
      expect(response.status).toBe(202);
      const { registrations } = JSON.parse(response.text);
      expect(registrations.length).toBe(0);
      await prisma.registration.delete({
        where: {
          id: registration.id,
        },
      });
    });
    it("Return 202 when filter value is date - staff some on date", async () => {
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
        include: {
          students: true,
          courseStaff: true,
          instructors: true,
          topics: true,
          officeHours: true,
          officeHourOptions: true,
        },
      });
      const registration = await prisma.registration.create({
        data: {
          officeHour: {
            connect: {
              id: course.officeHours[1].id,
            },
          },
          startTime: new Date(0),
          endTime: new Date(10),
          date: new Date("10-01-2023"),
          account: {
            connect: {
              id: users[0].id,
            },
          },
          topics: {
            connect: {
              id: course.topics[0].id,
            },
          },
          officeHourTimeOptions: {
            connect: {
              id: course.officeHourOptions[0].id,
            },
          },
        },
      });
      const response = await request
        .get(
          `${endpoint}/${courses[0].id}/getRegistration/date/value/10-01-2023`
        )
        .set("Authorization", "bearer " + users[3].token);
      expect(response.status).toBe(202);
      const { registrations } = JSON.parse(response.text);
      expect(registrations.length).toBe(1);
      await prisma.registration.delete({
        where: {
          id: registration.id,
        },
      });
    });
    it("Return 202 when filter value is office hour id - student none for oh", async () => {
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
        include: {
          students: true,
          courseStaff: true,
          instructors: true,
          topics: true,
          officeHours: true,
          officeHourOptions: true,
        },
      });
      const registration = await prisma.registration.create({
        data: {
          officeHour: {
            connect: {
              id: course.officeHours[0].id,
            },
          },
          startTime: new Date(0),
          endTime: new Date(10),
          date: new Date("10-01-2023"),
          account: {
            connect: {
              id: users[0].id,
            },
          },
          topics: {
            connect: {
              id: course.topics[0].id,
            },
          },
          officeHourTimeOptions: {
            connect: {
              id: course.officeHourOptions[0].id,
            },
          },
        },
      });
      const response = await request
        .get(
          `${endpoint}/${courses[0].id}/getRegistration/officeHourId/value/${course.officeHours[1].id}`
        )
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(202);
      const { registrations } = JSON.parse(response.text);
      expect(registrations.length).toBe(0);
      await prisma.registration.delete({
        where: {
          id: registration.id,
        },
      });
    });
    it("Return 202 when filter value is office hour id - student some for oh", async () => {
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
        include: {
          students: true,
          courseStaff: true,
          instructors: true,
          topics: true,
          officeHours: true,
          officeHourOptions: true,
        },
      });
      const registration = await prisma.registration.create({
        data: {
          officeHour: {
            connect: {
              id: course.officeHours[0].id,
            },
          },
          startTime: new Date(0),
          endTime: new Date(10),
          date: new Date("10-01-2023"),
          account: {
            connect: {
              id: users[4].id,
            },
          },
          topics: {
            connect: {
              id: course.topics[0].id,
            },
          },
          officeHourTimeOptions: {
            connect: {
              id: course.officeHourOptions[0].id,
            },
          },
        },
      });
      const response = await request
        .get(
          `${endpoint}/${courses[0].id}/getRegistration/officeHourId/value/${course.officeHours[0].id}`
        )
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(202);
      const { registrations } = JSON.parse(response.text);
      expect(registrations.length).toBe(1);
      await prisma.registration.delete({
        where: {
          id: registration.id,
        },
      });
    });
    it("Return 202 when filter value is office hour id - instructor none for oh", async () => {
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
        include: {
          students: true,
          courseStaff: true,
          instructors: true,
          topics: true,
          officeHours: true,
          officeHourOptions: true,
        },
      });
      const registration = await prisma.registration.create({
        data: {
          officeHour: {
            connect: {
              id: course.officeHours[0].id,
            },
          },
          startTime: new Date(0),
          endTime: new Date(10),
          date: new Date("10-01-2023"),
          account: {
            connect: {
              id: users[0].id,
            },
          },
          topics: {
            connect: {
              id: course.topics[0].id,
            },
          },
          officeHourTimeOptions: {
            connect: {
              id: course.officeHourOptions[0].id,
            },
          },
        },
      });
      const response = await request
        .get(
          `${endpoint}/${courses[0].id}/getRegistration/officeHourId/value/${course.officeHours[1].id}`
        )
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const { registrations } = JSON.parse(response.text);
      expect(registrations.length).toBe(0);
      await prisma.registration.delete({
        where: {
          id: registration.id,
        },
      });
    });
    it("Return 202 when filter value is office hour id - instructor some for oh", async () => {
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
        include: {
          students: true,
          courseStaff: true,
          instructors: true,
          topics: true,
          officeHours: true,
          officeHourOptions: true,
        },
      });
      const registration = await prisma.registration.create({
        data: {
          officeHour: {
            connect: {
              id: course.officeHours[0].id,
            },
          },
          startTime: new Date(0),
          endTime: new Date(10),
          date: new Date("10-01-2023"),
          account: {
            connect: {
              id: users[4].id,
            },
          },
          topics: {
            connect: {
              id: course.topics[0].id,
            },
          },
          officeHourTimeOptions: {
            connect: {
              id: course.officeHourOptions[0].id,
            },
          },
        },
      });
      const response = await request
        .get(
          `${endpoint}/${courses[0].id}/getRegistration/officeHourId/value/${course.officeHours[0].id}`
        )
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const { registrations } = JSON.parse(response.text);
      expect(registrations.length).toBe(2);
      await prisma.registration.delete({
        where: {
          id: registration.id,
        },
      });
    });
    it("Return 202 when filter value is office hour id - staff none for oh", async () => {
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
        include: {
          students: true,
          courseStaff: true,
          instructors: true,
          topics: true,
          officeHours: true,
          officeHourOptions: true,
        },
      });
      const registration = await prisma.registration.create({
        data: {
          officeHour: {
            connect: {
              id: course.officeHours[0].id,
            },
          },
          startTime: new Date(0),
          endTime: new Date(10),
          date: new Date("10-01-2023"),
          account: {
            connect: {
              id: users[0].id,
            },
          },
          topics: {
            connect: {
              id: course.topics[0].id,
            },
          },
          officeHourTimeOptions: {
            connect: {
              id: course.officeHourOptions[0].id,
            },
          },
        },
      });
      const response = await request
        .get(
          `${endpoint}/${courses[0].id}/getRegistration/officeHourId/value/${course.officeHours[1].id}`
        )
        .set("Authorization", "bearer " + users[3].token);
      expect(response.status).toBe(202);
      const { registrations } = JSON.parse(response.text);
      expect(registrations.length).toBe(0);
      await prisma.registration.delete({
        where: {
          id: registration.id,
        },
      });
    });
    it("Return 202 when filter value is office hour id - staff some for oh", async () => {
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
        include: {
          students: true,
          courseStaff: true,
          instructors: true,
          topics: true,
          officeHours: true,
          officeHourOptions: true,
        },
      });
      const registration = await prisma.registration.create({
        data: {
          officeHour: {
            connect: {
              id: course.officeHours[1].id,
            },
          },
          startTime: new Date(0),
          endTime: new Date(10),
          date: new Date("10-01-2023"),
          account: {
            connect: {
              id: users[4].id,
            },
          },
          topics: {
            connect: {
              id: course.topics[0].id,
            },
          },
          officeHourTimeOptions: {
            connect: {
              id: course.officeHourOptions[0].id,
            },
          },
        },
      });
      const response = await request
        .get(
          `${endpoint}/${courses[0].id}/getRegistration/officeHourId/value/${course.officeHours[1].id}`
        )
        .set("Authorization", "bearer " + users[3].token);
      expect(response.status).toBe(202);
      const { registrations } = JSON.parse(response.text);
      expect(registrations.length).toBe(1);
      await prisma.registration.delete({
        where: {
          id: registration.id,
        },
      });
    });
    it("Return 202 when filter value is account id - instructor none for account", async () => {
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
        include: {
          students: true,
          courseStaff: true,
          instructors: true,
          topics: true,
          officeHours: true,
          officeHourOptions: true,
        },
      });
      const registration = await prisma.registration.create({
        data: {
          officeHour: {
            connect: {
              id: course.officeHours[0].id,
            },
          },
          startTime: new Date(0),
          endTime: new Date(10),
          date: new Date("10-01-2023"),
          account: {
            connect: {
              id: users[0].id,
            },
          },
          topics: {
            connect: {
              id: course.topics[0].id,
            },
          },
          officeHourTimeOptions: {
            connect: {
              id: course.officeHourOptions[0].id,
            },
          },
        },
      });
      const response = await request
        .get(
          `${endpoint}/${courses[0].id}/getRegistration/accountId/value/${users[1].id}`
        )
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const { registrations } = JSON.parse(response.text);
      expect(registrations.length).toBe(0);
      await prisma.registration.delete({
        where: {
          id: registration.id,
        },
      });
    });
    it("Return 202 when filter value is account id - instructor some for account", async () => {
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
        include: {
          students: true,
          courseStaff: true,
          instructors: true,
          topics: true,
          officeHours: true,
          officeHourOptions: true,
        },
      });
      const registration = await prisma.registration.create({
        data: {
          officeHour: {
            connect: {
              id: course.officeHours[0].id,
            },
          },
          startTime: new Date(0),
          endTime: new Date(10),
          date: new Date("10-01-2023"),
          account: {
            connect: {
              id: users[4].id,
            },
          },
          topics: {
            connect: {
              id: course.topics[0].id,
            },
          },
          officeHourTimeOptions: {
            connect: {
              id: course.officeHourOptions[0].id,
            },
          },
        },
      });
      const response = await request
        .get(
          `${endpoint}/${courses[0].id}/getRegistration/accountId/value/${users[0].id}`
        )
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const { registrations } = JSON.parse(response.text);
      expect(registrations.length).toBe(1);
      await prisma.registration.delete({
        where: {
          id: registration.id,
        },
      });
    });
    it("Return 202 when filter value is account id - instructor none for account", async () => {
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
        include: {
          students: true,
          courseStaff: true,
          instructors: true,
          topics: true,
          officeHours: true,
          officeHourOptions: true,
        },
      });
      const registration = await prisma.registration.create({
        data: {
          officeHour: {
            connect: {
              id: course.officeHours[0].id,
            },
          },
          startTime: new Date(0),
          endTime: new Date(10),
          date: new Date("10-01-2023"),
          account: {
            connect: {
              id: users[0].id,
            },
          },
          topics: {
            connect: {
              id: course.topics[0].id,
            },
          },
          officeHourTimeOptions: {
            connect: {
              id: course.officeHourOptions[0].id,
            },
          },
        },
      });
      const response = await request
        .get(
          `${endpoint}/${courses[0].id}/getRegistration/accountId/value/${users[0].id}`
        )
        .set("Authorization", "bearer " + users[3].token);
      expect(response.status).toBe(202);
      const { registrations } = JSON.parse(response.text);
      expect(registrations.length).toBe(0);
      await prisma.registration.delete({
        where: {
          id: registration.id,
        },
      });
    });
    it("Return 202 when filter value is account id - staff some for account", async () => {
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
        include: {
          students: true,
          courseStaff: true,
          instructors: true,
          topics: true,
          officeHours: true,
          officeHourOptions: true,
        },
      });
      const registration = await prisma.registration.create({
        data: {
          officeHour: {
            connect: {
              id: course.officeHours[1].id,
            },
          },
          startTime: new Date(0),
          endTime: new Date(10),
          date: new Date("10-01-2023"),
          account: {
            connect: {
              id: users[0].id,
            },
          },
          topics: {
            connect: {
              id: course.topics[0].id,
            },
          },
          officeHourTimeOptions: {
            connect: {
              id: course.officeHourOptions[0].id,
            },
          },
        },
      });
      const response = await request
        .get(
          `${endpoint}/${courses[0].id}/getRegistration/accountId/value/${users[0].id}`
        )
        .set("Authorization", "bearer " + users[3].token);
      expect(response.status).toBe(202);
      const { registrations } = JSON.parse(response.text);
      expect(registrations.length).toBe(1);
      await prisma.registration.delete({
        where: {
          id: registration.id,
        },
      });
    });
    it("Return 202 when filter value is topics - student none for topic", async () => {
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
        include: {
          students: true,
          courseStaff: true,
          instructors: true,
          topics: true,
          officeHours: true,
          officeHourOptions: true,
        },
      });
      const registration = await prisma.registration.create({
        data: {
          officeHour: {
            connect: {
              id: course.officeHours[0].id,
            },
          },
          startTime: new Date(0),
          endTime: new Date(10),
          date: new Date("10-01-2023"),
          account: {
            connect: {
              id: users[0].id,
            },
          },
          topics: {
            connect: {
              id: course.topics[0].id,
            },
          },
          officeHourTimeOptions: {
            connect: {
              id: course.officeHourOptions[0].id,
            },
          },
        },
      });
      const response = await request
        .get(
          `${endpoint}/${courses[0].id}/getRegistration/topics/value/${course.topics[1].id}`
        )
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(202);
      const { registrations } = JSON.parse(response.text);
      expect(registrations.length).toBe(0);
      await prisma.registration.delete({
        where: {
          id: registration.id,
        },
      });
    });
    it("Return 202 when filter value is topics - student some for topic", async () => {
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
        include: {
          students: true,
          courseStaff: true,
          instructors: true,
          topics: true,
          officeHours: true,
          officeHourOptions: true,
        },
      });
      const registration = await prisma.registration.create({
        data: {
          officeHour: {
            connect: {
              id: course.officeHours[0].id,
            },
          },
          startTime: new Date(0),
          endTime: new Date(10),
          date: new Date("10-01-2023"),
          account: {
            connect: {
              id: users[0].id,
            },
          },
          topics: {
            connect: {
              id: course.topics[0].id,
            },
          },
          officeHourTimeOptions: {
            connect: {
              id: course.officeHourOptions[0].id,
            },
          },
        },
      });
      const response = await request
        .get(
          `${endpoint}/${courses[0].id}/getRegistration/topics/value/${course.topics[0].id}`
        )
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(202);
      const { registrations } = JSON.parse(response.text);
      expect(registrations.length).toBe(2);
      await prisma.registration.delete({
        where: {
          id: registration.id,
        },
      });
    });
    it("Return 202 when filter value is topics - instructor none for topic", async () => {
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
        include: {
          students: true,
          courseStaff: true,
          instructors: true,
          topics: true,
          officeHours: true,
          officeHourOptions: true,
        },
      });
      const registration = await prisma.registration.create({
        data: {
          officeHour: {
            connect: {
              id: course.officeHours[0].id,
            },
          },
          startTime: new Date(0),
          endTime: new Date(10),
          date: new Date("10-01-2023"),
          account: {
            connect: {
              id: users[0].id,
            },
          },
          topics: {
            connect: {
              id: course.topics[0].id,
            },
          },
          officeHourTimeOptions: {
            connect: {
              id: course.officeHourOptions[0].id,
            },
          },
        },
      });
      const response = await request
        .get(
          `${endpoint}/${courses[0].id}/getRegistration/topics/value/${course.topics[1].id}`
        )
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const { registrations } = JSON.parse(response.text);
      expect(registrations.length).toBe(0);
      await prisma.registration.delete({
        where: {
          id: registration.id,
        },
      });
    });
    it("Return 202 when filter value is topics - instructor some for topic", async () => {
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
        include: {
          students: true,
          courseStaff: true,
          instructors: true,
          topics: true,
          officeHours: true,
          officeHourOptions: true,
        },
      });
      const registration = await prisma.registration.create({
        data: {
          officeHour: {
            connect: {
              id: course.officeHours[0].id,
            },
          },
          startTime: new Date(0),
          endTime: new Date(10),
          date: new Date("10-01-2023"),
          account: {
            connect: {
              id: users[4].id,
            },
          },
          topics: {
            connect: {
              id: course.topics[0].id,
            },
          },
          officeHourTimeOptions: {
            connect: {
              id: course.officeHourOptions[0].id,
            },
          },
        },
      });
      const response = await request
        .get(
          `${endpoint}/${courses[0].id}/getRegistration/topics/value/${course.topics[0].id}`
        )
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const { registrations } = JSON.parse(response.text);
      expect(registrations.length).toBe(2);
      await prisma.registration.delete({
        where: {
          id: registration.id,
        },
      });
    });
    it("Return 202 when filter value is topics - staff none for topic", async () => {
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
        include: {
          students: true,
          courseStaff: true,
          instructors: true,
          topics: true,
          officeHours: true,
          officeHourOptions: true,
        },
      });
      const registration = await prisma.registration.create({
        data: {
          officeHour: {
            connect: {
              id: course.officeHours[0].id,
            },
          },
          startTime: new Date(0),
          endTime: new Date(10),
          date: new Date("10-01-2023"),
          account: {
            connect: {
              id: users[0].id,
            },
          },
          topics: {
            connect: {
              id: course.topics[0].id,
            },
          },
          officeHourTimeOptions: {
            connect: {
              id: course.officeHourOptions[0].id,
            },
          },
        },
      });
      const response = await request
        .get(
          `${endpoint}/${courses[0].id}/getRegistration/topics/value/${course.topics[0].id}`
        )
        .set("Authorization", "bearer " + users[3].token);
      expect(response.status).toBe(202);
      const { registrations } = JSON.parse(response.text);
      expect(registrations.length).toBe(0);
      await prisma.registration.delete({
        where: {
          id: registration.id,
        },
      });
    });
    it("Return 202 when filter value is topics - staff some for topic", async () => {
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
        include: {
          students: true,
          courseStaff: true,
          instructors: true,
          topics: true,
          officeHours: true,
          officeHourOptions: true,
        },
      });
      const registration = await prisma.registration.create({
        data: {
          officeHour: {
            connect: {
              id: course.officeHours[1].id,
            },
          },
          startTime: new Date(0),
          endTime: new Date(10),
          date: new Date("10-01-2023"),
          account: {
            connect: {
              id: users[4].id,
            },
          },
          topics: {
            connect: {
              id: course.topics[0].id,
            },
          },
          officeHourTimeOptions: {
            connect: {
              id: course.officeHourOptions[0].id,
            },
          },
        },
      });
      const response = await request
        .get(
          `${endpoint}/${courses[0].id}/getRegistration/topics/value/${course.topics[0].id}`
        )
        .set("Authorization", "bearer " + users[3].token);
      expect(response.status).toBe(202);
      const { registrations } = JSON.parse(response.text);
      expect(registrations.length).toBe(1);
      await prisma.registration.delete({
        where: {
          id: registration.id,
        },
      });
    });
    it("Return 202 when filter value is is no show - student none for no show", async () => {
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
        include: {
          students: true,
          courseStaff: true,
          instructors: true,
          topics: true,
          officeHours: true,
          officeHourOptions: true,
        },
      });
      const registration = await prisma.registration.create({
        data: {
          officeHour: {
            connect: {
              id: course.officeHours[0].id,
            },
          },
          startTime: new Date(0),
          endTime: new Date(10),
          date: new Date("10-01-2023"),
          account: {
            connect: {
              id: users[0].id,
            },
          },
          topics: {
            connect: {
              id: course.topics[0].id,
            },
          },
          officeHourTimeOptions: {
            connect: {
              id: course.officeHourOptions[0].id,
            },
          },
        },
      });
      const response = await request
        .get(`${endpoint}/${courses[0].id}/getRegistration/isNoShow/value/true`)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(202);
      const { registrations } = JSON.parse(response.text);
      expect(registrations.length).toBe(0);
      await prisma.registration.delete({
        where: {
          id: registration.id,
        },
      });
    });
    it("Return 202 when filter value is isNoShow - student some for no show", async () => {
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
        include: {
          students: true,
          courseStaff: true,
          instructors: true,
          topics: true,
          officeHours: true,
          officeHourOptions: true,
        },
      });
      const registration = await prisma.registration.create({
        data: {
          officeHour: {
            connect: {
              id: course.officeHours[0].id,
            },
          },
          startTime: new Date(0),
          endTime: new Date(10),
          date: new Date("10-01-2023"),
          account: {
            connect: {
              id: users[0].id,
            },
          },
          topics: {
            connect: {
              id: course.topics[0].id,
            },
          },
          officeHourTimeOptions: {
            connect: {
              id: course.officeHourOptions[0].id,
            },
          },
          isNoShow: true,
        },
      });
      const response = await request
        .get(`${endpoint}/${courses[0].id}/getRegistration/isNoShow/value/true`)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(202);
      const { registrations } = JSON.parse(response.text);
      expect(registrations.length).toBe(1);
      await prisma.registration.delete({
        where: {
          id: registration.id,
        },
      });
    });
    it("Return 202 when filter value is isNoShow - instructor none for no show", async () => {
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
        include: {
          students: true,
          courseStaff: true,
          instructors: true,
          topics: true,
          officeHours: true,
          officeHourOptions: true,
        },
      });
      const registration = await prisma.registration.create({
        data: {
          officeHour: {
            connect: {
              id: course.officeHours[0].id,
            },
          },
          startTime: new Date(0),
          endTime: new Date(10),
          date: new Date("10-01-2023"),
          account: {
            connect: {
              id: users[0].id,
            },
          },
          topics: {
            connect: {
              id: course.topics[0].id,
            },
          },
          officeHourTimeOptions: {
            connect: {
              id: course.officeHourOptions[0].id,
            },
          },
        },
      });
      const response = await request
        .get(`${endpoint}/${courses[0].id}/getRegistration/isNoShow/value/true`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const { registrations } = JSON.parse(response.text);
      expect(registrations.length).toBe(0);
      await prisma.registration.delete({
        where: {
          id: registration.id,
        },
      });
    });
    it("Return 202 when filter value is isNoShow - instructor some for no show", async () => {
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
        include: {
          students: true,
          courseStaff: true,
          instructors: true,
          topics: true,
          officeHours: true,
          officeHourOptions: true,
        },
      });
      const registration = await prisma.registration.create({
        data: {
          officeHour: {
            connect: {
              id: course.officeHours[0].id,
            },
          },
          startTime: new Date(0),
          endTime: new Date(10),
          date: new Date("10-01-2023"),
          account: {
            connect: {
              id: users[4].id,
            },
          },
          topics: {
            connect: {
              id: course.topics[0].id,
            },
          },
          officeHourTimeOptions: {
            connect: {
              id: course.officeHourOptions[0].id,
            },
          },
          isNoShow: true,
        },
      });
      const response = await request
        .get(`${endpoint}/${courses[0].id}/getRegistration/isNoShow/value/true`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const { registrations } = JSON.parse(response.text);
      expect(registrations.length).toBe(1);
      await prisma.registration.delete({
        where: {
          id: registration.id,
        },
      });
    });
    it("Return 202 when filter value is isNoShow - staff none for no show", async () => {
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
        include: {
          students: true,
          courseStaff: true,
          instructors: true,
          topics: true,
          officeHours: true,
          officeHourOptions: true,
        },
      });
      const registration = await prisma.registration.create({
        data: {
          officeHour: {
            connect: {
              id: course.officeHours[0].id,
            },
          },
          startTime: new Date(0),
          endTime: new Date(10),
          date: new Date("10-01-2023"),
          account: {
            connect: {
              id: users[0].id,
            },
          },
          topics: {
            connect: {
              id: course.topics[0].id,
            },
          },
          officeHourTimeOptions: {
            connect: {
              id: course.officeHourOptions[0].id,
            },
          },
          isNoShow: true,
        },
      });
      const response = await request
        .get(`${endpoint}/${courses[0].id}/getRegistration/isNoShow/value/true`)
        .set("Authorization", "bearer " + users[3].token);
      expect(response.status).toBe(202);
      const { registrations } = JSON.parse(response.text);
      expect(registrations.length).toBe(0);
      await prisma.registration.delete({
        where: {
          id: registration.id,
        },
      });
    });
    it("Return 202 when filter value is isNoShow - staff some for no show", async () => {
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
        include: {
          students: true,
          courseStaff: true,
          instructors: true,
          topics: true,
          officeHours: true,
          officeHourOptions: true,
        },
      });
      const registration = await prisma.registration.create({
        data: {
          officeHour: {
            connect: {
              id: course.officeHours[1].id,
            },
          },
          startTime: new Date(0),
          endTime: new Date(10),
          date: new Date("10-01-2023"),
          account: {
            connect: {
              id: users[4].id,
            },
          },
          topics: {
            connect: {
              id: course.topics[0].id,
            },
          },
          officeHourTimeOptions: {
            connect: {
              id: course.officeHourOptions[0].id,
            },
          },
          isNoShow: true,
        },
      });
      const response = await request
        .get(`${endpoint}/${courses[0].id}/getRegistration/isNoShow/value/true`)
        .set("Authorization", "bearer " + users[3].token);
      expect(response.status).toBe(202);
      const { registrations } = JSON.parse(response.text);
      expect(registrations.length).toBe(1);
      await prisma.registration.delete({
        where: {
          id: registration.id,
        },
      });
    });
    it("Return 202 when filter value is hosts - student none for host", async () => {
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
        include: {
          students: true,
          courseStaff: true,
          instructors: true,
          topics: true,
          officeHours: true,
          officeHourOptions: true,
        },
      });
      const registration = await prisma.registration.create({
        data: {
          officeHour: {
            connect: {
              id: course.officeHours[0].id,
            },
          },
          startTime: new Date(0),
          endTime: new Date(10),
          date: new Date("10-01-2023"),
          account: {
            connect: {
              id: users[0].id,
            },
          },
          topics: {
            connect: {
              id: course.topics[0].id,
            },
          },
          officeHourTimeOptions: {
            connect: {
              id: course.officeHourOptions[0].id,
            },
          },
        },
      });
      const response = await request
        .get(
          `${endpoint}/${courses[0].id}/getRegistration/hosts/value/${users[3].id}`
        )
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(202);
      const { registrations } = JSON.parse(response.text);
      expect(registrations.length).toBe(0);
      await prisma.registration.delete({
        where: {
          id: registration.id,
        },
      });
    });
    it("Return 202 when filter value is hosts - student some for host", async () => {
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
        include: {
          students: true,
          courseStaff: true,
          instructors: true,
          topics: true,
          officeHours: true,
          officeHourOptions: true,
        },
      });
      const registration = await prisma.registration.create({
        data: {
          officeHour: {
            connect: {
              id: course.officeHours[0].id,
            },
          },
          startTime: new Date(0),
          endTime: new Date(10),
          date: new Date("10-01-2023"),
          account: {
            connect: {
              id: users[0].id,
            },
          },
          topics: {
            connect: {
              id: course.topics[0].id,
            },
          },
          officeHourTimeOptions: {
            connect: {
              id: course.officeHourOptions[0].id,
            },
          },
          isNoShow: true,
        },
      });
      const response = await request
        .get(
          `${endpoint}/${courses[0].id}/getRegistration/hosts/value/${users[2].id}`
        )
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(202);
      const { registrations } = JSON.parse(response.text);
      expect(registrations.length).toBe(2);
      await prisma.registration.delete({
        where: {
          id: registration.id,
        },
      });
    });
    it("Return 202 when filter value is hosts - instructor none for no host", async () => {
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
        include: {
          students: true,
          courseStaff: true,
          instructors: true,
          topics: true,
          officeHours: true,
          officeHourOptions: true,
        },
      });
      const registration = await prisma.registration.create({
        data: {
          officeHour: {
            connect: {
              id: course.officeHours[0].id,
            },
          },
          startTime: new Date(0),
          endTime: new Date(10),
          date: new Date("10-01-2023"),
          account: {
            connect: {
              id: users[0].id,
            },
          },
          topics: {
            connect: {
              id: course.topics[0].id,
            },
          },
          officeHourTimeOptions: {
            connect: {
              id: course.officeHourOptions[0].id,
            },
          },
        },
      });
      const response = await request
        .get(
          `${endpoint}/${courses[0].id}/getRegistration/hosts/value/${users[3].id}`
        )
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const { registrations } = JSON.parse(response.text);
      expect(registrations.length).toBe(0);
      await prisma.registration.delete({
        where: {
          id: registration.id,
        },
      });
    });
    it("Return 202 when filter value is hosts - instructor some for host", async () => {
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
        include: {
          students: true,
          courseStaff: true,
          instructors: true,
          topics: true,
          officeHours: true,
          officeHourOptions: true,
        },
      });
      const registration = await prisma.registration.create({
        data: {
          officeHour: {
            connect: {
              id: course.officeHours[0].id,
            },
          },
          startTime: new Date(0),
          endTime: new Date(10),
          date: new Date("10-01-2023"),
          account: {
            connect: {
              id: users[4].id,
            },
          },
          topics: {
            connect: {
              id: course.topics[0].id,
            },
          },
          officeHourTimeOptions: {
            connect: {
              id: course.officeHourOptions[0].id,
            },
          },
          isNoShow: true,
        },
      });
      const response = await request
        .get(
          `${endpoint}/${courses[0].id}/getRegistration/hosts/value/${users[2].id}`
        )
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const { registrations } = JSON.parse(response.text);
      expect(registrations.length).toBe(2);
      await prisma.registration.delete({
        where: {
          id: registration.id,
        },
      });
    });
    // it("Return 200 when no body is included", async () => {
    //   const response = await request
    //     .get(
    //       `${endpoint}/${courses[0].id}/getRegistration/date/value/10-01-2023`
    //     )
    //     .set("Authorization", "bearer " + users[0].token);
    //   expect(response.status).toBe(202);
    //   const { student, staff, instructor } = JSON.parse(response.text);
    //   expect(student.length).toBe(1);
    //   expect(staff.length).toBe(0);
    //   expect(instructor.length).toBe(0);
    // });
  });

  afterAll(async () => {
    const tokenIds = tokens.map((token) => token.id);
    const userIds = users.map((user) => user.id);
    const courseIds = courses.map((course) => course.id);
    const topicIds = topics.map((topic) => topic.id);
    const courseArchivedIds = archivedCourses.map((course) => course.id);
    const officeHourIds = officeHoursArray.map((oh) => oh.id);
    // const topicArchivedIds = archivedTopics.map((topic) => topic.id);
    // const archivedCourseId = archivedCourses[0].id;
    // const archivedTopicId = archivedTopics[0].id;
    await prisma.registration.deleteMany({
      where: {
        officeHourId: {
          in: officeHourIds,
        },
      },
    });
    await prisma.officeHour.deleteMany({
      where: {
        id: {
          in: officeHourIds,
        },
      },
    });
    const issueTokensToDelete = await prisma.issueToken.findMany({
      where: {
        courseTokenId: {
          in: tokenIds,
        },
      },
    });
    const issueTokenIds = issueTokensToDelete.map((issue) => issue.id);
    await prisma.usedToken.deleteMany({
      where: {
        issueTokenId: {
          in: issueTokenIds,
        },
      },
    });
    const deleteAllIssueTokens = await prisma.issueToken.deleteMany({
      where: {
        courseTokenId: {
          in: tokenIds,
        },
      },
    });
    const deleteAllCourseTokens = await prisma.courseToken.deleteMany({
      where: {
        id: {
          in: tokenIds,
        },
      },
    });
    const deleteRegistrations = prisma.registration.deleteMany({
      where: {
        accountId: {
          in: userIds,
        },
      },
    });
    const deleteOfficeHours = prisma.officeHour.deleteMany({
      where: {
        courseId: {
          in: courseIds,
        },
      },
    });
    const deleteUsers = prisma.account.deleteMany({
      where: {
        id: {
          in: userIds,
        },
      },
    });
    const deleteTopics = prisma.topic.deleteMany({
      where: {
        OR: [
          {
            id: {
              in: topicIds,
            },
          },
          {
            courseId: {
              in: courseIds,
            },
          },
        ],
      },
    });
    const deleteTimeOptions = prisma.officeHourTimeOptions.deleteMany({
      where: {
        courseId: {
          in: courseIds,
        },
      },
    });
    const deleteCourses = prisma.course.deleteMany({
      where: {
        id: {
          in: courseIds,
        },
      },
    });
    // const deleteArchivedTopic = prisma.topic.deleteMany({
    //   where: {
    //     OR: [
    //       {
    //         id: {
    //           in: topicArchivedIds,
    //         },
    //       },
    //       {
    //         courseId: {
    //           in: courseArchivedIds,
    //         },
    //       },
    //     ],
    //   },
    // });
    const deleteArchivedCourse = prisma.course.deleteMany({
      where: {
        id: {
          in: courseArchivedIds,
        },
      },
    });

    await prisma.$transaction([deleteRegistrations]);
    await prisma.$transaction([deleteOfficeHours]);
    await prisma.$transaction([deleteUsers]);
    await prisma.$transaction([deleteTopics]);
    await prisma.$transaction([deleteTimeOptions]);
    await prisma.$transaction([deleteCourses]);
    await prisma.$transaction([deleteArchivedCourse]);
    // await prisma.$transaction([deleteArchivedTopic]);
    await prisma.$disconnect();
    // Tear down the test database by `yarn docker:down`
  });
});
