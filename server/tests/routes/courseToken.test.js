import supertest from "supertest";
import { it, expect, beforeAll, describe, afterAll, afterEach } from "vitest";
import app from "../../src/index.js";
import prisma from "../../prisma/client.js";
import { Role } from "@prisma/client";
import { createToken } from "../../src/util/helpers.js";

const request = supertest(app);
const endpoint = "/api/courseToken";

describe(`Test endpoint ${endpoint}`, () => {
  let courseTokens = [];
  let courses = [];
  let users = [];

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
          //name: "Test User IV",
          email: "user4@test.io",
          role: Role.Admin,
          userName: "user4",
        },
      ],
      skipDuplicates: true,
    });

    users = await prisma.account.findMany({
      orderBy: {
        id: "asc",
      },
    });

    const course = await prisma.course.create({
      data: {
        title: "chris",
        semester: "Fall",
        calendarYear: 2023,
        courseNumber: "123.456",
        code: "ABCZYX",
        usesTokens: false,
        instructors: {
          connect: {
            id: users[2].id,
          },
        },
        students: {
          connect: {
            id: users[0].id,
          },
        },
      },
    });
    courses.push(course);

    // Augment the users' objects with auth tokens
    users = users.map((user) => ({
      ...user,
      token: createToken({ user }),
      expiredToken: createToken({ user, expiresIn: "0" }),
    }));
  });

  describe("HTTP Post request-  optIn", () => {
    it("Return 401 when no authorization token is provided", async () => {
      const response = await request.post(`${endpoint}/${courses[0].id}/optIn`);
      expect(response.status).toBe(401);
    });
    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .post(`${endpoint}/${courses[0].id}/optIn`)
        .set("Authorization", "bearer " + users[2].expiredToken);
      expect(response.status).toBe(401);
    });
    it("Return 400 when invalid course id is provided", async () => {
      const response = await request
        .post(`${endpoint}/-1/optIn`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 202 when course successfully archived", async () => {
      const response = await request
        .post(`/api/course/${courses[0].id}/archiveCourse`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
    });
    it("Return 400 when archived course opted in", async () => {
      const response = await request
        .post(`${endpoint}/${courses[0].id}/optIn`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 202 when course successfully unarchived", async () => {
      const response = await request
        .post(`/api/course/${courses[0].id}/archiveCourse`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
    });
    it("Return 202 when course successfully opted in", async () => {
      const response = await request
        .post(`${endpoint}/${courses[0].id}/optIn`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
      });
      expect(course.usesTokens).toBe(true);
    });
  });
  describe("HTTP POST request - create token", () => {
    it("Return 202 when course successfully opted out", async () => {
      const response = await request
        .post(`${endpoint}/${courses[0].id}/optIn`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
      });
      expect(course.usesTokens).toBe(false);
    });
    it("Return 400 when course is opted out of tokens", async () => {
      const attributes = {
        title: "title",
        description: "This is a description",
        tokenLimit: 5,
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}/createToken`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 202 when course successfully opted in", async () => {
      const response = await request
        .post(`${endpoint}/${courses[0].id}/optIn`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
      });
      expect(course.usesTokens).toBe(true);
    });
    it("Return 401 when no authorization token is provided", async () => {
      const response = await request.post(
        `${endpoint}/${courses[0].id}/createToken`
      );
      expect(response.status).toBe(401);
    });
    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .post(`${endpoint}/${courses[0].id}/createToken`)
        .set("Authorization", "bearer " + users[2].expiredToken);
      expect(response.status).toBe(401);
    });
    it("Return 400 when no body is included", async () => {
      const attributes = {};
      const response = await request
        .post(`${endpoint}/${courses[0].id}/createToken`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when course token title is not included", async () => {
      const attributes = {
        //title: "title",
        description: "This is a description",
        tokenLimit: 5,
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}/createToken`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    // it("Return 400 when course token description is not included", async () => {
    //   const attributes = {
    //     title: "title",
    //     //description: "This is a description",
    //     tokenLimit: 5,
    //   };
    //   const response = await request
    //     .post(`${endpoint}/${courses[0].id}/createToken`)
    //     .send(attributes)
    //     .set("Authorization", "bearer " + users[2].token);
    //   expect(response.status).toBe(400);
    // });
    it("Return 400 when course token token limit is not included", async () => {
      const attributes = {
        title: "title",
        description: "This is a description",
        //tokenLimit: 5,
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}/createToken`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 202 when course successfully archived", async () => {
      const response = await request
        .post(`/api/course/${courses[0].id}/archiveCourse`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
    });
    it("Return 400 when course token of archived test is created", async () => {
      const attributes = {
        title: "title",
        description: "This is a description",
        tokenLimit: 5,
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}/createToken`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 202 when course successfully unarchived", async () => {
      const response = await request
        .post(`/api/course/${courses[0].id}/archiveCourse`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
    });
    it("Return 201 when course token is created", async () => {
      const attributes = {
        title: "title",
        description: "This is a description",
        tokenLimit: 5,
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}/createToken`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      let courseToken;
      let issueToken;

      courseToken = await prisma.courseToken.findFirst({
        where: {
          title: "title",
        },
      });
      issueToken = await prisma.issueToken.findMany({
        where: {
          CourseToken: {
            courseId: courses[0].id,
          },
        },
      });
      courseTokens.push(courseToken);
      expect(response.status).toBe(201);
      expect(courseToken.title).toBe("title");
      expect(courseToken.description).toBe("This is a description");
      expect(courseToken.tokenLimit).toBe(5);
    });
  });
  describe("HTTP POST request - edit token", () => {
    it("Return 202 when course successfully opted out", async () => {
      const response = await request
        .post(`${endpoint}/${courses[0].id}/optIn`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
      });
      expect(course.usesTokens).toBe(false);
    });
    it("Return 400 when course is opted out of tokens", async () => {
      const attributes = {
        title: "title",
        description: "This is a description",
        tokenLimit: 5,
      };
      const response = await request
        .post(
          `${endpoint}/${courses[0].id}/editCourseToken/${courseTokens[0].id}`
        )
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 202 when course successfully opted in", async () => {
      const response = await request
        .post(`${endpoint}/${courses[0].id}/optIn`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
      });
      expect(course.usesTokens).toBe(true);
    });
    it("Return 401 when no authorization token is provided", async () => {
      const response = await request.post(
        `${endpoint}/${courses[0].id}/editCourseToken/${courseTokens[0].id}`
      );
      expect(response.status).toBe(401);
    });
    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .post(
          `${endpoint}/${courses[0].id}/editCourseToken/${courseTokens[0].id}`
        )
        .set("Authorization", "bearer " + users[2].expiredToken);
      expect(response.status).toBe(401);
    });
    it("Return 400 when course token title is not included", async () => {
      const attributes = {
        //title: "title",
        description: "This is a description",
        tokenLimit: 5,
      };
      const response = await request
        .post(
          `${endpoint}/${courses[0].id}/editCourseToken/${courseTokens[0].id}`
        )
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    // it("Return 400 when course token description is not included", async () => {
    //   const attributes = {
    //     title: "title",
    //     //description: "This is a description",
    //     tokenLimit: 5,
    //   };
    //   const response = await request
    //     .post(
    //       `${endpoint}/${courses[0].id}/editCourseToken/${courseTokens[0].id}`
    //     )
    //     .send(attributes)
    //     .set("Authorization", "bearer " + users[2].token);
    //   expect(response.status).toBe(400);
    // });
    it("Return 400 when course token token limit is not included", async () => {
      const attributes = {
        title: "title",
        description: "This is a description",
        //tokenLimit: 5,
      };
      const response = await request
        .post(
          `${endpoint}/${courses[0].id}/editCourseToken/${courseTokens[0].id}`
        )
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when course token token limit is not integer", async () => {
      const attributes = {
        title: "title",
        description: "This is a description",
        tokenLimit: "hello",
      };
      const response = await request
        .post(
          `${endpoint}/${courses[0].id}/editCourseToken/${courseTokens[0].id}`
        )
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 202 when course successfully archived", async () => {
      const response = await request
        .post(`/api/course/${courses[0].id}/archiveCourse`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
    });
    it("Return 400 when course token of archived course edited", async () => {
      const attributes = {
        title: "not a title",
        description: "not a description",
        tokenLimit: 10,
      };
      const response = await request
        .post(
          `${endpoint}/${courses[0].id}/editCourseToken/${courseTokens[0].id}`
        )
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 202 when course successfully unarchived", async () => {
      const response = await request
        .post(`/api/course/${courses[0].id}/archiveCourse`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
    });
    it("Return 202 when course token successfully edited", async () => {
      const attributes = {
        title: "not a title",
        description: "not a description",
        tokenLimit: 10,
      };
      const response = await request
        .post(
          `${endpoint}/${courses[0].id}/editCourseToken/${courseTokens[0].id}`
        )
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      const courseToken = await prisma.courseToken.findFirst({
        where: {
          id: courseTokens[0].id,
        },
      });
      expect(response.status).toBe(202);
      expect(courseToken.title).toBe("not a title");
      expect(courseToken.description).toBe("not a description");
      expect(courseToken.tokenLimit).toBe(10);
    });
  });
  describe("HTTP POST request - use token", () => {
    it("Return 202 when course successfully opted out", async () => {
      const response = await request
        .post(`${endpoint}/${courses[0].id}/optIn`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
      });
      expect(course.usesTokens).toBe(false);
    });
    it("Return 400 when course is opted out of tokens", async () => {
      const attributes = {
        date: new Date(Date.now()).toISOString(),
      };
      const response = await request
        .post(
          `${endpoint}/${courses[0].id}/usedToken/${courseTokens[0].id}/student/${users[0].id}`
        )
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 202 when course successfully opted in", async () => {
      const response = await request
        .post(`${endpoint}/${courses[0].id}/optIn`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
      });
      expect(course.usesTokens).toBe(true);
    });
    it("Return 401 when no authorization token is provided", async () => {
      const response = await request.post(
        `${endpoint}/${courses[0].id}/usedToken/${courseTokens[0].id}/student/${users[0].id}`
      );
      expect(response.status).toBe(401);
    });
    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .post(
          `${endpoint}/${courses[0].id}/usedToken/${courseTokens[0].id}/student/${users[0].id}`
        )
        .set("Authorization", "bearer " + users[2].expiredToken);
      expect(response.status).toBe(401);
    });
    it("Return 400 when date is not included", async () => {
      const attributes = {};
      const response = await request
        .post(
          `${endpoint}/${courses[0].id}/usedToken/${courseTokens[0].id}/student/${users[0].id}`
        )
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when course id is invalid", async () => {
      const attributes = {
        date: new Date(Date.now()).toISOString(),
      };
      const response = await request
        .post(
          `${endpoint}/-1/usedToken/${courseTokens[0].id}/student/${users[0].id}`
        )
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when student token id is invalid", async () => {
      const attributes = {
        date: new Date(Date.now()).toISOString(),
      };
      const response = await request
        .post(
          `${endpoint}/${courses[0].id}/usedToken/-1/student/${users[0].id}`
        )
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 202 when course successfully archived", async () => {
      const response = await request
        .post(`/api/course/${courses[0].id}/archiveCourse`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
    });
    it("Return 400 when course token of archived course used", async () => {
      const attributes = {
        date: new Date(Date.now()).toISOString(),
      };
      const response = await request
        .post(
          `${endpoint}/${courses[0].id}/usedToken/${courseTokens[0].id}/student/${users[0].id}`
        )
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 202 when course successfully unarchived", async () => {
      const response = await request
        .post(`/api/course/${courses[0].id}/archiveCourse`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
    });
    it("Return 202 when course successfully paused", async () => {
      const response = await request
        .post(`/api/course/${courses[0].id}/pauseCourse`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
    });
    it("Return 400 when course token of paused course used", async () => {
      const attributes = {
        date: new Date(Date.now()).toISOString(),
      };
      const response = await request
        .post(
          `${endpoint}/${courses[0].id}/usedToken/${courseTokens[0].id}/student/${users[0].id}`
        )
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 202 when course successfully unpaused", async () => {
      const response = await request
        .post(`/api/course/${courses[0].id}/pauseCourse`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
    });
    it("Return 202 when course token successfully used", async () => {
      const attributes = {
        date: new Date(Date.now()).toISOString(),
      };
      const response = await request
        .post(
          `${endpoint}/${courses[0].id}/usedToken/${courseTokens[0].id}/student/${users[0].id}`
        )
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      const issueToken = await prisma.issueToken.findFirst({
        where: {
          courseTokenId: courseTokens[0].id,
          accountId: users[0].id,
        },
      });
      const date = new Date(Date.now()).toISOString();
      expect(response.status).toBe(202);
      expect(issueToken.datesUsed.length).toBe(1);
    });
  });
  describe("HTTP POST request - undo use token", () => {
    it("Return 202 when course successfully opted out", async () => {
      const response = await request
        .post(`${endpoint}/${courses[0].id}/optIn`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
      });
      expect(course.usesTokens).toBe(false);
    });
    it("Return 400 when course is opted out of tokens", async () => {
      const attributes = {
        date: new Date(Date.now()).toISOString(),
      };
      const response = await request
        .post(
          `${endpoint}/${courses[0].id}/undoUsedToken/${courseTokens[0].id}/student/${users[0].id}`
        )
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 202 when course successfully opted in", async () => {
      const response = await request
        .post(`${endpoint}/${courses[0].id}/optIn`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
      });
      expect(course.usesTokens).toBe(true);
    });
    it("Return 401 when no authorization token is provided", async () => {
      const response = await request.post(
        `${endpoint}/${courses[0].id}/undoUsedToken/${courseTokens[0].id}/student/${users[0].id}`
      );
      expect(response.status).toBe(401);
    });
    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .post(
          `${endpoint}/${courses[0].id}/undoUsedToken/${courseTokens[0].id}/student/${users[0].id}`
        )
        .set("Authorization", "bearer " + users[2].expiredToken);
      expect(response.status).toBe(401);
    });
    it("Return 400 when date is not included", async () => {
      const attributes = {};
      const response = await request
        .post(
          `${endpoint}/${courses[0].id}/undoUsedToken/${courseTokens[0].id}/student/${users[0].id}`
        )
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when course id is invalid", async () => {
      const attributes = {
        date: new Date(Date.now()).toISOString(),
      };
      const response = await request
        .post(
          `${endpoint}/-1/undoUsedToken/${courseTokens[0].id}/student/${users[0].id}`
        )
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when course token id is invalid", async () => {
      const attributes = {
        date: new Date(Date.now()).toISOString(),
      };
      const response = await request
        .post(
          `${endpoint}/${courses[0].id}/undoUsedToken/-1/student/${users[0].id}`
        )
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 202 when course successfully archived", async () => {
      const response = await request
        .post(`/api/course/${courses[0].id}/archiveCourse`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
    });
    it("Return 400 when course token of archived course removed", async () => {
      const attributes = {
        date: new Date(Date.now()).toISOString(),
      };
      const response = await request
        .post(
          `${endpoint}/${courses[0].id}/undoUsedToken/${courseTokens[0].id}/student/${users[0].id}`
        )
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 202 when course successfully unarchived", async () => {
      const response = await request
        .post(`/api/course/${courses[0].id}/archiveCourse`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
    });
    it("Return 202 when course successfully paused", async () => {
      const response = await request
        .post(`/api/course/${courses[0].id}/pauseCourse`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
    });
    it("Return 400 when course token of paused course removed", async () => {
      const attributes = {
        date: new Date(Date.now()).toISOString(),
      };
      const response = await request
        .post(
          `${endpoint}/${courses[0].id}/undoUsedToken/${courseTokens[0].id}/student/${users[0].id}`
        )
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 202 when course successfully unpaused", async () => {
      const response = await request
        .post(`/api/course/${courses[0].id}/pauseCourse`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
    });
    it("Return 202 when course token successfully removed", async () => {
      const attributes = {
        date: new Date(Date.now()).toISOString(),
      };
      const response = await request
        .post(
          `${endpoint}/${courses[0].id}/undoUsedToken/${courseTokens[0].id}/student/${users[0].id}`
        )
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      const issueToken = await prisma.issueToken.findFirst({
        where: {
          courseTokenId: courseTokens[0].id,
          accountId: users[0].id,
        },
      });
      expect(response.status).toBe(202);
      expect(issueToken.datesUsed.length).toBe(0);
    });
  });
  describe("HTTP POST request - add override amount", () => {
    it("Return 202 when course successfully opted out", async () => {
      const response = await request
        .post(`${endpoint}/${courses[0].id}/optIn`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
      });
      expect(course.usesTokens).toBe(false);
    });
    it("Return 400 when course is opted out of tokens", async () => {
      const attributes = {
        overrideAmount: 15,
      };
      const response = await request
        .post(
          `${endpoint}/${courses[0].id}/addOverrideAmount/${courseTokens[0].id}/student/${users[0].id}`
        )
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 202 when course successfully opted in", async () => {
      const response = await request
        .post(`${endpoint}/${courses[0].id}/optIn`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
      });
      expect(course.usesTokens).toBe(true);
    });
    it("Return 401 when no authorization token is provided", async () => {
      const attributes = {
        overrideAmount: 15,
      };
      const response = await request
        .post(
          `${endpoint}/${courses[0].id}/addOverrideAmount/${courseTokens[0].id}/student/${users[0].id}`
        )
        .send(attributes);
      expect(response.status).toBe(401);
    });
    it("Return 401 when authorization token is expired", async () => {
      const attributes = {
        overrideAmount: 15,
      };
      const response = await request
        .post(
          `${endpoint}/${courses[0].id}/addOverrideAmount/${courseTokens[0].id}/student/${users[0].id}`
        )
        .send(attributes)
        .set("Authorization", "bearer " + users[2].expiredToken);
      expect(response.status).toBe(401);
    });
    it("Return 400 when invalid course id is provided", async () => {
      const attributes = {
        overrideAmount: 15,
      };
      const response = await request
        .post(
          `${endpoint}/-1/addOverrideAmount/${courseTokens[0].id}/student/${users[0].id}`
        )
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when invalid course token id is provided", async () => {
      const attributes = {
        overrideAmount: 15,
      };
      const response = await request
        .post(
          `${endpoint}/${courses[0].id}/addOverrideAmount/-1/student/${users[0].id}`
        )
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when user is not in course", async () => {
      const attributes = {
        overrideAmount: 15,
      };
      const response = await request
        .post(
          `${endpoint}/${courses[0].id}/addOverrideAmount/${
            courseTokens[0].id
          }/student/${-1}`
        )
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when no body is included", async () => {
      const attributes = {};
      const response = await request
        .post(
          `${endpoint}/${courses[0].id}/addOverrideAmount/${courseTokens[0].id}/student/${users[0].id}`
        )
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 202 when course successfully archived", async () => {
      const response = await request
        .post(`/api/course/${courses[0].id}/archiveCourse`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
    });
    it("Return 400 when course token of archived test is created", async () => {
      const attributes = {
        overrideAmount: 15,
      };
      const response = await request
        .post(
          `${endpoint}/${courses[0].id}/addOverrideAmount/${courseTokens[0].id}/student/${users[0].id}`
        )
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 202 when course successfully unarchived", async () => {
      const response = await request
        .post(`/api/course/${courses[0].id}/archiveCourse`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
    });
    it("Return 202 when course successfully paused", async () => {
      const response = await request
        .post(`/api/course/${courses[0].id}/pauseCourse`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
    });
    it("Return 400 when course token of paused test is created", async () => {
      const attributes = {
        overrideAmount: 15,
      };
      const response = await request
        .post(
          `${endpoint}/${courses[0].id}/addOverrideAmount/${courseTokens[0].id}/student/${users[0].id}`
        )
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 202 when course successfully unpaused", async () => {
      const response = await request
        .post(`/api/course/${courses[0].id}/pauseCourse`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
    });
    it("Return 202 when override amount is created", async () => {
      const attributes = {
        overrideAmount: 15,
      };
      const response = await request
        .post(
          `${endpoint}/${courses[0].id}/addOverrideAmount/${courseTokens[0].id}/student/${users[0].id}`
        )
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      let issueToken;

      issueToken = await prisma.issueToken.findFirst({
        where: {
          CourseToken: {
            courseId: courses[0].id,
          },
        },
      });
      expect(response.status).toBe(202);
      expect(issueToken.overrideAmount).toBe(15);
    });
  });
  describe("HTTP GET request - course tokens for course", () => {
    it("Return 202 when course successfully opted out", async () => {
      const response = await request
        .post(`${endpoint}/${courses[0].id}/optIn`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
      });
      expect(course.usesTokens).toBe(false);
    });
    it("Return 400 when course is opted out of tokens", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 202 when course successfully opted in", async () => {
      const response = await request
        .post(`${endpoint}/${courses[0].id}/optIn`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
      });
      expect(course.usesTokens).toBe(true);
    });
    it("Return 401 when no authorization token is provided", async () => {
      const response = await request.get(`${endpoint}/${courses[0].id}`);
      expect(response.status).toBe(401);
    });
    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}`)
        .set("Authorization", "bearer " + users[2].expiredToken);
      expect(response.status).toBe(401);
    });
    it("Return 400 when invalid course id is provided", async () => {
      const response = await request
        .get(`${endpoint}/-1`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 202 when no body is included", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
    });
  });
  describe("HTTP GET request - remaining for self", () => {
    it("Return 202 when course successfully opted out", async () => {
      const response = await request
        .post(`${endpoint}/${courses[0].id}/optIn`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
      });
      expect(course.usesTokens).toBe(false);
    });
    it("Return 400 when course is opted out of tokens", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/tokensRemaining`)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(400);
    });
    it("Return 202 when course successfully opted in", async () => {
      const response = await request
        .post(`${endpoint}/${courses[0].id}/optIn`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
      });
      expect(course.usesTokens).toBe(true);
    });
    it("Return 401 when no authorization token is provided", async () => {
      const response = await request.get(
        `${endpoint}/${courses[0].id}/tokensRemaining`
      );
      expect(response.status).toBe(401);
    });
    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/tokensRemaining`)
        .set("Authorization", "bearer " + users[0].expiredToken);
      expect(response.status).toBe(401);
    });
    it("Return 400 when invalid course id is provided", async () => {
      const response = await request
        .get(`${endpoint}/-1/tokensRemaining`)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when invalid courseToken id is provided", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/tokensRemaining/-1`)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(400);
    });
    it("Return 403 when user is not in course", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/tokensRemaining`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.userName === "user2").token
        );
      expect(response.status).toBe(403);
    });
    it("Return 200 when no body is included", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/tokensRemaining`)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(202);
    });
  });
  describe("HTTP GET request - remaining tokens for student", () => {
    it("Return 202 when course successfully opted out", async () => {
      const response = await request
        .post(`${endpoint}/${courses[0].id}/optIn`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
      });
      expect(course.usesTokens).toBe(false);
    });
    it("Return 400 when course is opted out of tokens", async () => {
      const response = await request
        .get(
          `${endpoint}/${courses[0].id}/tokensRemainingForStudent/${users[0].id}}`
        )
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 202 when course successfully opted in", async () => {
      const response = await request
        .post(`${endpoint}/${courses[0].id}/optIn`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
      });
      expect(course.usesTokens).toBe(true);
    });
    it("Return 401 when no authorization token is provided", async () => {
      const response = await request.get(
        `${endpoint}/${courses[0].id}/tokensRemainingForStudent/${users[0].id}`
      );
      expect(response.status).toBe(401);
    });
    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .get(
          `${endpoint}/${courses[0].id}/tokensRemainingForStudent/${users[0].id}`
        )
        .set("Authorization", "bearer " + users[0].expiredToken);
      expect(response.status).toBe(401);
    });
    it("Return 400 when invalid course id is provided", async () => {
      const response = await request
        .get(`${endpoint}/-1/tokensRemainingForStudent/${users[0].id}`)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(400);
    });
    it("Return 403 when invalid user id is provided", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/tokensRemainingForStudent/-1`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.userName === "user2").token
        );
      expect(response.status).toBe(403);
    });
    it("Return 400 when user is not a student in course", async () => {
      const response = await request
        .get(
          `${endpoint}/${courses[0].id}/tokensRemainingForStudent/${users[2].id}}`
        )
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 200 when no body is included", async () => {
      const response = await request
        .get(
          `${endpoint}/${courses[0].id}/tokensRemainingForStudent/${users[0].id}}`
        )
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
    });
  });
  describe("HTTP GET request - get num of tokens used", () => {
    it("Return 202 when course successfully opted out", async () => {
      const response = await request
        .post(`${endpoint}/${courses[0].id}/optIn`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
      });
      expect(course.usesTokens).toBe(false);
    });
    it("Return 400 when course is opted out of tokens", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/tokensUsed/${courseTokens[0].id}`)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(400);
    });
    it("Return 202 when course successfully opted in", async () => {
      const response = await request
        .post(`${endpoint}/${courses[0].id}/optIn`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
      });
      expect(course.usesTokens).toBe(true);
    });
    it("Return 401 when no authorization token is provided", async () => {
      const response = await request.get(
        `${endpoint}/${courses[0].id}/tokensUsed/${courseTokens[0].id}`
      );
      expect(response.status).toBe(401);
    });
    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/tokensUsed/${courseTokens[0].id}`)
        .set("Authorization", "bearer " + users[0].expiredToken);
      expect(response.status).toBe(401);
    });
    it("Return 400 when invalid course id is provided", async () => {
      const response = await request
        .get(`${endpoint}/-1/tokensUsed/${courseTokens[0].id}`)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when invalid courseToken id is provided", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/tokensUsed/-1`)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(400);
    });
    it("Return 403 when user is not in course", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/tokensUsed/${courseTokens[0].id}`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.userName === "user2").token
        );
      expect(response.status).toBe(403);
    });
    it("Return 200 when no body is included", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/tokensUsed/${courseTokens[0].id}`)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(202);
    });
  });
  describe("HTTP GET request - get num of tokens remaining", () => {
    it("Return 202 when course successfully opted out", async () => {
      const response = await request
        .post(`${endpoint}/${courses[0].id}/optIn`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
      });
      expect(course.usesTokens).toBe(false);
    });
    it("Return 400 when course is not opted into tokens", async () => {
      const response = await request
        .get(
          `${endpoint}/${courses[0].id}/tokensRemaining/${courseTokens[0].id}`
        )
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(400);
    });
    it("Return 202 when course successfully opted in", async () => {
      const response = await request
        .post(`${endpoint}/${courses[0].id}/optIn`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
      });
      expect(course.usesTokens).toBe(true);
    });
    it("Return 401 when no authorization token is provided", async () => {
      const response = await request.get(
        `${endpoint}/${courses[0].id}/tokensRemaining/${courseTokens[0].id}`
      );
      expect(response.status).toBe(401);
    });
    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .get(
          `${endpoint}/${courses[0].id}/tokensRemaining/${courseTokens[0].id}`
        )
        .set("Authorization", "bearer " + users[0].expiredToken);
      expect(response.status).toBe(401);
    });
    it("Return 400 when invalid course id is provided", async () => {
      const response = await request
        .get(`${endpoint}/-1/tokensRemaining/${courseTokens[0].id}`)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when invalid courseToken id is provided", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/tokensRemaining/-1`)
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(400);
    });
    it("Return 403 when user is not in course", async () => {
      const response = await request
        .get(
          `${endpoint}/${courses[0].id}/tokensRemaining/${courseTokens[0].id}`
        )
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.userName === "user2").token
        );
      expect(response.status).toBe(403);
    });
    it("Return 200 when no body is included", async () => {
      const response = await request
        .get(
          `${endpoint}/${courses[0].id}/tokensRemaining/${courseTokens[0].id}`
        )
        .set("Authorization", "bearer " + users[0].token);
      expect(response.status).toBe(202);
    });
  });
  describe("HTTP DELETE request - delete override amount", () => {
    it("Return 202 when course successfully opted out", async () => {
      const response = await request
        .post(`${endpoint}/${courses[0].id}/optIn`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
      });
      expect(course.usesTokens).toBe(false);
    });
    it("Return 400 when course not opted into tokens", async () => {
      const response = await request
        .delete(
          `${endpoint}/${courses[0].id}/deleteOverrideAmount/${courseTokens[0].id}/student/${users[0].id}`
        )
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 202 when course successfully opted in", async () => {
      const response = await request
        .post(`${endpoint}/${courses[0].id}/optIn`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
      });
      expect(course.usesTokens).toBe(true);
    });
    it("Return 401 when no authorization token is provided", async () => {
      const response = await request.delete(
        `${endpoint}/${courses[0].id}/deleteOverrideAmount/${courseTokens[0].id}/student/${users[0].id}`
      );
      expect(response.status).toBe(401);
    });
    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .delete(
          `${endpoint}/${courses[0].id}/deleteOverrideAmount/${courseTokens[0].id}/student/${users[0].id}`
        )
        .set("Authorization", "bearer " + users[2].expiredToken);
      expect(response.status).toBe(401);
    });
    it("Return 400 when course id is not valid", async () => {
      const response = await request
        .delete(
          `${endpoint}/-1/deleteOverrideAmount/${courseTokens[0].id}/student/${users[0].id}`
        )
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when course token id is not valid", async () => {
      const response = await request
        .delete(
          `${endpoint}/${courses[0].id}/deleteOverrideAmount/-1/student/${users[0].id}`
        )
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when user is not student in course", async () => {
      const response = await request
        .delete(
          `${endpoint}/${courses[0].id}/deleteOverrideAmount/${courseTokens[0].id}/student/-1}`
        )
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 202 when course successfully archived", async () => {
      const response = await request
        .post(`/api/course/${courses[0].id}/archiveCourse`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
    });
    it("Return 400 when override limit of issue token deleted", async () => {
      const response = await request
        .delete(
          `${endpoint}/${courses[0].id}/deleteOverrideAmount/${courseTokens[0].id}/student/${users[0].id}`
        )
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 202 when course successfully unarchived", async () => {
      const response = await request
        .post(`/api/course/${courses[0].id}/archiveCourse`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
    });
    it("Return 202 when course successfully paused", async () => {
      const response = await request
        .post(`/api/course/${courses[0].id}/pauseCourse`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
    });
    it("Return 400 when override limit of issue token deleted for paused course", async () => {
      const response = await request
        .delete(
          `${endpoint}/${courses[0].id}/deleteOverrideAmount/${courseTokens[0].id}/student/${users[0].id}`
        )
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 202 when course successfully unpaused", async () => {
      const response = await request
        .post(`/api/course/${courses[0].id}/pauseCourse`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
    });
    it("Return 200 when no body included", async () => {
      const response = await request
        .delete(
          `${endpoint}/${courses[0].id}/deleteOverrideAmount/${courseTokens[0].id}/student/${users[0].id}`
        )
        .set("Authorization", "bearer " + users[2].token);
      let issueToken;

      issueToken = await prisma.issueToken.findFirst({
        where: {
          CourseToken: {
            courseId: courses[0].id,
          },
        },
      });
      expect(response.status).toBe(202);
      expect(issueToken.overrideAmount).toBe(null);
    });
  });
  describe("HTTP DELETE Request - delete single", () => {
    it("Return 202 when course successfully opted out", async () => {
      const response = await request
        .post(`${endpoint}/${courses[0].id}/optIn`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
      });
      expect(course.usesTokens).toBe(false);
    });
    it("Return 400 when course not opted into tokens", async () => {
      let response = await request
        .delete(
          `${endpoint}/${courses[0].id}/deleteSingle/${courseTokens[0].id}`
        )
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 202 when course successfully opted in", async () => {
      const response = await request
        .post(`${endpoint}/${courses[0].id}/optIn`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
      });
      expect(course.usesTokens).toBe(true);
    });
    it("Return 401 when no authorization token is provided", async () => {
      const response = await request.delete(
        `${endpoint}/${courses[0].id}/deleteSingle/${courseTokens[0].id}`
      );
      expect(response.status).toBe(401);
    });
    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .delete(
          `${endpoint}/${courses[0].id}/deleteSingle/${courseTokens[0].id}`
        )
        .set("Authorization", "bearer " + users[2].expiredToken);
      expect(response.status).toBe(401);
    });
    it("Return 400 when invalid course id is provided", async () => {
      const response = await request
        .delete(`${endpoint}/-1/deleteSingle/${courseTokens[0].id}`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 400 when invalid course token id is provided", async () => {
      const response = await request
        .delete(`${endpoint}/${courses[0].id}/deleteSingle/-1`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 403 when user is not in course", async () => {
      const response = await request
        .delete(
          `${endpoint}/${courses[0].id}/deleteSingle/${courseTokens[0].id}`
        )
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.userName === "user2").token
        );
      expect(response.status).toBe(403);
    });
    it("Return 202 when course successfully archived", async () => {
      const response = await request
        .post(`/api/course/${courses[0].id}/archiveCourse`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
    });
    it("Return 400 when no body is included", async () => {
      let response = await request
        .delete(
          `${endpoint}/${courses[0].id}/deleteSingle/${courseTokens[0].id}`
        )
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 202 when course successfully unarchived", async () => {
      const response = await request
        .post(`/api/course/${courses[0].id}/archiveCourse`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
    });
    it("Return 200 when no body is included", async () => {
      let response = await request
        .delete(
          `${endpoint}/${courses[0].id}/deleteSingle/${courseTokens[0].id}`
        )
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const deleted = await prisma.courseToken.findUnique({
        where: {
          id: courseTokens[0].id,
        },
      });
      expect(deleted).toBe(null);
      courseTokens.pop();
      expect(courseTokens.length).toBe(0);
    });
  });
  describe("HTTP DELETE Request - delete all", () => {
    it("Return 202 when course successfully opted out", async () => {
      const response = await request
        .post(`${endpoint}/${courses[0].id}/optIn`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
      });
      expect(course.usesTokens).toBe(false);
    });
    it("Return 400 when course not opted into tokens", async () => {
      let response = await request
        .delete(`${endpoint}/${courses[0].id}/deleteAll`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 202 when course successfully opted in", async () => {
      const response = await request
        .post(`${endpoint}/${courses[0].id}/optIn`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const course = await prisma.course.findUnique({
        where: {
          id: courses[0].id,
        },
      });
      expect(course.usesTokens).toBe(true);
    });
    it("Return 401 when no authorization token is provided", async () => {
      const response = await request.delete(
        `${endpoint}/${courses[0].id}/deleteAll`
      );
      expect(response.status).toBe(401);
    });
    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .delete(`${endpoint}/${courses[0].id}/deleteAll`)
        .set("Authorization", "bearer " + users[2].expiredToken);
      expect(response.status).toBe(401);
    });
    it("Return 400 when invalid course id is provided", async () => {
      const response = await request
        .delete(`${endpoint}/-1/deleteAll`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 403 when user is not in course", async () => {
      const response = await request
        .delete(`${endpoint}/${courses[0].id}/deleteAll`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.userName === "user2").token
        );
      expect(response.status).toBe(403);
    });
    it("Return 201 when course token is created", async () => {
      const attributes = {
        title: "title",
        description: "This is a description",
        tokenLimit: 5,
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}/createToken`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      let courseToken;
      courseToken = await prisma.courseToken.findFirst({
        where: {
          title: "title",
        },
      });
      courseTokens.push(courseToken);
      expect(response.status).toBe(201);
    });
    it("Return 201 when course token is created", async () => {
      const attributes = {
        title: "title 1",
        description: "This is a description 1",
        tokenLimit: 6,
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}/createToken`)
        .send(attributes)
        .set("Authorization", "bearer " + users[2].token);
      let courseToken;
      courseToken = await prisma.courseToken.findFirst({
        where: {
          title: "title 1",
        },
      });
      courseTokens.push(courseToken);
      expect(response.status).toBe(201);
    });
    it("Return 202 when course successfully archived", async () => {
      const response = await request
        .post(`/api/course/${courses[0].id}/archiveCourse`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
    });
    it("Return 400 when archived course tokens is deleted", async () => {
      let response = await request
        .delete(`${endpoint}/${courses[0].id}/deleteAll`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(400);
    });
    it("Return 202 when course successfully unarchived", async () => {
      const response = await request
        .post(`/api/course/${courses[0].id}/archiveCourse`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
    });
    it("Return 200 when no body is included", async () => {
      let response = await request
        .delete(`${endpoint}/${courses[0].id}/deleteAll`)
        .set("Authorization", "bearer " + users[2].token);
      expect(response.status).toBe(202);
      const deleted1 = await prisma.courseToken.findUnique({
        where: {
          id: courseTokens[1].id,
        },
      });
      expect(deleted1).toBe(null);
      courseTokens.pop();
      const deleted2 = await prisma.courseToken.findUnique({
        where: {
          id: courseTokens[0].id,
        },
      });
      expect(deleted2).toBe(null);
      courseTokens.pop();
      expect(courseTokens.length).toBe(0);
    });
  });
  afterAll(async () => {
    const userIds = users.map((user) => user.id);
    const courseIds = courses.map((course) => course.id);
    const courseTokenIds = courseTokens.map((courseToken) => courseToken.id);

    const deleteIssueTokens = prisma.issueToken.deleteMany();

    const deleteCourseTokens = prisma.courseToken.deleteMany();

    const deleteTopics = prisma.topic.deleteMany();
    const deleteTimeOptions = prisma.officeHourTimeOptions.deleteMany();

    const deleteUsers = prisma.account.deleteMany();

    const deleteCourses = prisma.course.deleteMany();
    await prisma.$transaction([deleteCourseTokens]);
    await prisma.$transaction([deleteTopics]);
    await prisma.$transaction([deleteTimeOptions]);
    await prisma.$transaction([deleteCourses]);
    await prisma.$transaction([deleteUsers]);
    await prisma.$disconnect();
  });
});
