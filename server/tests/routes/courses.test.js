import supertest from "supertest";
import app from "../../src/index.js";
import prisma from "../../prisma/client.js";
import { createToken } from "../../src/util/helpers.js";
import { Role } from "@prisma/client";

const request = supertest(app);
const endpoint = "/api/course";

describe(`Test endpoint ${endpoint}`, () => {
  let courses = [];
  let users = [];
  let userInCourse = [];
  let topics = [];
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
  });

  describe("HTTP POST request", () => {
    it("Return 401 when no authorization toke is provided", async () => {
      const response = await request.post(`${endpoint}`);
      expect(response.status).toBe(401);
    });
    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .post(`${endpoint}`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).expiredToken
        );
      expect(response.status).toBe(401);
    });
    it("Return 400 when no body is included", async () => {
      const attributes = {};
      const response = await request
        .post(`${endpoint}`)
        .send(attributes)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
      expect(response.status).toBe(400);
    });
    it("Return 400 when course title is not included", async () => {
      const attributes = {
        //title: "title",
        number: "601.421",
        semester: "Spring",
        year: 2023,
      };
      const response = await request
        .post(`${endpoint}`)
        .send(attributes)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
      expect(response.status).toBe(400);
    });
    it("Return 400 when course number is not included", async () => {
      const attributes = {
        title: "title",
        //number: "601.421",
        semester: "Spring",
        year: 2023,
      };
      const response = await request
        .post(`${endpoint}`)
        .send(attributes)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
      expect(response.status).toBe(400);
    });
    it("Return 400 when course semester is not included", async () => {
      const attributes = {
        title: "title",
        number: "601.421",
        //semester: "Spring",
        year: 2023,
      };
      const response = await request
        .post(`${endpoint}`)
        .send(attributes)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
      expect(response.status).toBe(400);
    });
    it("Return 400 when course semester is not valid", async () => {
      const attributes = {
        title: "title",
        number: "601.421",
        semester: "not-spring",
        year: 2023,
      };
      const response = await request
        .post(`${endpoint}`)
        .send(attributes)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
      expect(response.status).toBe(400);
    });
    it("Return 200 when course is created", async () => {
      const attributes = {
        title: "OOSE",
        number: "601.421",
        semester: "Spring",
        year: 2023,
      };
      const response = await request
        .post(`${endpoint}`)
        .send(attributes)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
      expect(response.status).toBe(201);
      const course = JSON.parse(response.text).course;
      expect(course.title).toBe("OOSE");
      expect(course.courseNumber).toBe("601.421");
      expect(course.semester).toBe("Spring");
      expect(course.calendarYear).toBe(2023);
      courses.push(course);
      userInCourse.push(users.find((u) => u.role === Role.Admin));
    });
    it("Return 409 when duplicate course is created", async () => {
      const attributes = {
        title: "OOSE",
        number: "601.421",
        semester: "Spring",
        year: 2023,
      };
      const response = await request
        .post(`${endpoint}`)
        .send(attributes)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.User).expiredToken
        );
      expect(response.status).toBe(401);
    });
    it("Return 400 when no body is included", async () => {
      const attributes = {};
      const response = await request
        .post(`${endpoint}/signup`)
        .send(attributes)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.User).token
        );
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.User).token
        );
      expect(response.status).toBe(400);
    });
    it("Return 202 when student is registered for course", async () => {
      const attributes = {
        code: courses[0].code,
      };
      const response = await request
        .post(`${endpoint}/signup`)
        .send(attributes)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.User).token
        );
      expect(response.status).toBe(202);
      userInCourse.push(users.find((u) => u.role === Role.User));
    });
    it("Return 409 when student is already registered for course", async () => {
      const attributes = {
        code: courses[0].code,
      };
      const response = await request
        .post(`${endpoint}/signup`)
        .send(attributes)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.User).token
        );
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.User).expiredToken
        );
      expect(response.status).toBe(401);
    });
    it("Return 200 when no body is included", async () => {
      const response = await request
        .get(`${endpoint}`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.User).token
        );
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.User).expiredToken
        );
      expect(response.status).toBe(401);
    });
    it("Return 400 when invalid course id is provided", async () => {
      const response = await request
        .get(`${endpoint}/-1`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.User).token
        );
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.User).token
        );
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.User).expiredToken
        );
      expect(response.status).toBe(401);
    });
    it("Return 400 when invalid course id is provided", async () => {
      const response = await request
        .delete(`${endpoint}/leave/-1`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.User).token
        );
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.User).token
        );
      expect(response.status).toBe(202);
      await prisma.account.update({
        where: {
          id: users.find((u) => u.role === Role.User).id,
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
  });

  describe("HTTP Delete Request - delete course", () => {
    it("Return 401 when no authorization toke is provided", async () => {
      const response = await request.delete(`${endpoint}/${courses[0].id}`);
      expect(response.status).toBe(401);
    });
    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .delete(`${endpoint}/${courses[0].id}`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).expiredToken
        );
      expect(response.status).toBe(401);
    });
    it("Return 400 when invalid course id is provided", async () => {
      const response = await request
        .delete(`${endpoint}/-1`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
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
      let response = await request
        .delete(`${endpoint}/${courses[0].id}`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
      expect(response.status).toBe(202);
      const attributes = {
        title: "OOSE",
        number: "601.421",
        semester: "Spring",
        year: 2023,
      };
      response = await request
        .post(`${endpoint}`)
        .send(attributes)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
      expect(response.status).toBe(201);
      const course = JSON.parse(response.text).course;
      expect(course.title).toBe("OOSE");
      expect(course.courseNumber).toBe("601.421");
      expect(course.semester).toBe("Spring");
      expect(course.calendarYear).toBe(2023);
      courses[0] = course;
      await prisma.account.update({
        where: {
          id: users.find((u) => u.role === Role.User).id,
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
      const response = await request.delete(
        `${endpoint}/${courses[0].id}/removeStaff/${user2.id}`
      );
      expect(response.status).toBe(401);
    });
    it("Return 401 when authorization token is expired", async () => {
      const user2 = users.find((u) => u.userName === "user2");
      const response = await request
        .delete(`${endpoint}/${courses[0].id}/removeStaff/${user2.id}`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).expiredToken
        );
      expect(response.status).toBe(401);
    });
    it("Return 400 when invalid course id is provided", async () => {
      const user2 = users.find((u) => u.userName === "user2");
      const response = await request
        .delete(`${endpoint}/-1/removeStaff/${user2.id}`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
      expect(response.status).toBe(400);
    });
    it("Return 403 when user is not instructor", async () => {
      const user2 = users.find((u) => u.userName === "user2");
      const response = await request
        .delete(`${endpoint}/${courses[0].id}/removeStaff/${user2.id}`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.User).token
        );
      expect(response.status).toBe(403);
    });
    it("Return 403 when user id is invalid", async () => {
      const response = await request
        .delete(`${endpoint}/${courses[0].id}/removeStaff/-1`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
      expect(response.status).toBe(403);
    });
    it("Return 403 when user id is not staff", async () => {
      const user = users.find((u) => u.userName === "user4");
      const response = await request
        .delete(`${endpoint}/${courses[0].id}/removeStaff/${user.id}`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
      expect(response.status).toBe(403);
    });
    it("Return 202 when staff is deleted", async () => {
      const user = users.find((u) => u.userName === "user2");
      const response = await request
        .delete(`${endpoint}/${courses[0].id}/removeStaff/${user.id}`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
      expect(response.status).toBe(202);
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).expiredToken
        );
      expect(response.status).toBe(401);
    });
    it("Return 400 when invalid course id is provided", async () => {
      const user2 = users.find((u) => u.userName === "user2");
      const response = await request
        .delete(`${endpoint}/-1/removeStudent/${user2.id}`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
      expect(response.status).toBe(400);
    });
    it("Return 403 when user is not instructor", async () => {
      const user2 = users.find((u) => u.userName === "user2");
      const response = await request
        .delete(`${endpoint}/${courses[0].id}/removeStudent/${user2.id}`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.User).token
        );
      expect(response.status).toBe(403);
    });
    it("Return 403 when user id is invalid", async () => {
      const response = await request
        .delete(`${endpoint}/${courses[0].id}/removeStudent/-1`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
      expect(response.status).toBe(403);
    });
    it("Return 403 when user id is not student", async () => {
      const user = users.find((u) => u.userName === "user4");
      const response = await request
        .delete(`${endpoint}/${courses[0].id}/removeStudent/${user.id}`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
      expect(response.status).toBe(403);
    });
    it("Return 202 when student is deleted", async () => {
      const user = users.find((u) => u.userName === "user2");
      const response = await request
        .delete(`${endpoint}/${courses[0].id}/removeStudent/${user.id}`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
      expect(response.status).toBe(202);
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.User).expiredToken
        );
      expect(response.status).toBe(401);
    });
    it("Return 400 when invalid course id", async () => {
      const response = await request
        .get(`${endpoint}/-1/officeHours`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.User).token
        );
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.User).token
        );
      expect(response.status).toBe(202);
      const officeHours = JSON.parse(response.text).calendar;
      expect(officeHours.test).toBe("test");
    });
  });

  describe("HTTP Get request - get office hours for course filtered", () => {
    it("Return 401 when no authorization toke is provided", async () => {
      const user4 = users.find((u) => u.userName === "user4");
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
              id: users.find((u) => u.role === Role.Admin).id,
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.User).expiredToken
        );
      expect(response.status).toBe(401);
    });
    it("Return 400 when invalid filter", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/officeHours/yours`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
      expect(response.status).toBe(400);
    });
    it("Return 400 when invalid course id", async () => {
      const response = await request
        .get(`${endpoint}/-1/officeHours/mine`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.User).token
        );
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
      expect(response.status).toBe(202);
      const officeHours = JSON.parse(response.text).officeHours;
      expect(officeHours.length).toBe(1);
    });
    it("Return 202", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/officeHours/all`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).expiredToken
        );
      expect(response.status).toBe(401);
    });
    it("Return 400 when no body is included", async () => {
      const attributes = {};
      const response = await request
        .post(`${endpoint}/createTopic`)
        .send(attributes)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
      expect(response.status).toBe(400);
    });
    it("Return 400 when course id is not included", async () => {
      const attributes = {
        value: "Exams",
      };
      const response = await request
        .post(`${endpoint}/createTopic`)
        .send(attributes)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
      expect(response.status).toBe(400);
    });
    it("Return 400 when value is not included", async () => {
      const attributes = {
        courseId: courses[0].id,
      };
      const response = await request
        .post(`${endpoint}/createTopic`)
        .send(attributes)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.User).token
        );
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
      expect(response.status).toBe(409);
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).expiredToken
        );
      expect(response.status).toBe(401);
    });
    it("Return 400 when no body is included", async () => {
      const attributes = {};
      const response = await request
        .post(`${endpoint}/editTopic`)
        .send(attributes)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
      expect(response.status).toBe(400);
    });
    it("Return 400 when value is not included", async () => {
      const attributes = {
        courseId: courses[0].id,
        value: "Midterms",
      };
      const response = await request
        .post(`${endpoint}/editTopic`)
        .send(attributes)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.User).token
        );
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.User).expiredToken
        );
      expect(response.status).toBe(401);
    });
    it("Return 400 when invalid course id", async () => {
      const response = await request
        .get(`${endpoint}/-1/topics`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.User).token
        );
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.User).token
        );
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).expiredToken
        );
      expect(response.status).toBe(401);
    });
    it("Return 400 when invalid topic id is provided", async () => {
      const response = await request
        .delete(`${endpoint}/topic/-1`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
      expect(response.status).toBe(400);
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
    it("Return 202 when course is deleted", async () => {
      let response = await request
        .delete(`${endpoint}/topic/${topics[0].id}`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.User).expiredToken
        );
      expect(response.status).toBe(401);
    });
    it("Return 400 when invalid course id", async () => {
      const response = await request
        .get(`${endpoint}/-1/role`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.User).token
        );
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.User).token
        );
      expect(response.status).toBe(202);
      expect(JSON.parse(response.text).role).toBe("Student");
    });
    it("Return 200 - instructor", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/role`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
      expect(response.status).toBe(202);
      expect(JSON.parse(response.text).role).toBe("Instructor");
    });
    it("Return 200 - course staff", async () => {
      const user4 = users.find((u) => u.userName === "user4");
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.User).expiredToken
        );
      expect(response.status).toBe(401);
    });
    it("Return 400 when invalid course id", async () => {
      const response = await request
        .get(`${endpoint}/-1/getRoster`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.User).token
        );
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.User).token
        );
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).expiredToken
        );
      expect(response.status).toBe(401);
    });
    it("Return 400 when invalid course id", async () => {
      const response = await request
        .get(`${endpoint}/-1/${users[0].id}/getRole`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
      expect(response.status).toBe(400);
    });
    it("Return 400 when invalid user id", async () => {
      const response = await request
        .get(`${endpoint}/${courses[0].id}/-1/getRole`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
      expect(response.status).toBe(202);
      expect(JSON.parse(response.text).role).toBe("Student");
    });
    it("Return 200 - gets role - staff", async () => {
      const user4 = users.find((u) => u.userName === "user4");
      const response = await request
        .get(`${endpoint}/${courses[0].id}/${user4.id}/getRole`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
      expect(response.status).toBe(202);
      expect(JSON.parse(response.text).role).toBe("Staff");
    });
    it("Return 200 - gets role - instructor", async () => {
      const user4 = users.find((u) => u.userName === "user3");
      const response = await request
        .get(`${endpoint}/${courses[0].id}/${user4.id}/getRole`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).expiredToken
        );
      expect(response.status).toBe(401);
    });
    it("Return 400 when no body is included", async () => {
      const attributes = {};
      const response = await request
        .post(`${endpoint}/${courses[0].id}/officeHourTimeInterval`)
        .send(attributes)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
      expect(response.status).toBe(400);
    });
    it("Return 400 when length is not included", async () => {
      const attributes = {
        title: "title",
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}/officeHourTimeInterval`)
        .send(attributes)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
      expect(response.status).toBe(400);
    });
    it("Return 400 when length is not a multiple of 5", async () => {
      const attributes = {
        title: "title",
        length: 6,
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}/officeHourTimeInterval`)
        .send(attributes)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.User).token
        );
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
      expect(response.status).toBe(202);
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.User).expiredToken
        );
      expect(response.status).toBe(401);
    });
    it("Return 401 when course id is invalid", async () => {
      const response = await request
        .get(`${endpoint}/-1/officeHourTimeInterval`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.User).expiredToken
        );
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.User).token
        );
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.User).expiredToken
        );
      expect(response.status).toBe(401);
    });
    it("Return 400 when body is empty", async () => {
      const attributes = {};
      const response = await request
        .post(`${endpoint}/${courses[0].id}/officeHourTimeInterval/1/update`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.User).token
        )
        .send(attributes);
      expect(response.status).toBe(400);
    });
    it("Return 400 when length is not included", async () => {
      const attributes = {
        title: "title",
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}/officeHourTimeInterval/1/update`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.User).token
        )
        .send(attributes);
      expect(response.status).toBe(400);
    });
    it("Return 400 when title is not included", async () => {
      const attributes = {
        length: 10,
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}/officeHourTimeInterval/1/update`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.User).token
        )
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.User).token
        )
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.User).token
        )
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.User).token
        )
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        )
        .send(attributes);
      expect(response.status).toBe(400);
    });
    it("Return 409 when option is not for course", async () => {
      const attributes = {
        length: 15,
        title: "title",
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}/officeHourTimeInterval/-1/update`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        )
        .send(attributes);
      expect(response.status).toBe(409);
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        )
        .send(attributes);
      expect(response.status).toBe(202);
      const timeOption = JSON.parse(response.text).time;
      expect(timeOption.title).toBe("title");
      expect(timeOption.duration).toBe(15);
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.User).expiredToken
        );
      expect(response.status).toBe(401);
    });
    it("Return 400 when course id is invalid", async () => {
      const response = await request
        .delete(`${endpoint}/-1/officeHourTimeInterval/1`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.User).token
        );
      expect(response.status).toBe(400);
    });
    it("Return 403 when user is not instructor", async () => {
      const response = await request
        .delete(`${endpoint}/${courses[0].id}/officeHourTimeInterval/1`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.User).token
        );
      expect(response.status).toBe(403);
    });
    it("Return 409 when option is not for course", async () => {
      const response = await request
        .delete(`${endpoint}/${courses[0].id}/officeHourTimeInterval/-1`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
      expect(response.status).toBe(409);
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
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
        },
      });
      const response = await request
        .delete(
          `${endpoint}/${courses[0].id}/officeHourTimeInterval/${timeOptions.id}`
        )
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).expiredToken
        );
      expect(response.status).toBe(401);
    });
    it("Return 400 when no body is included", async () => {
      const attributes = {};
      const response = await request
        .post(`${endpoint}/${courses[0].id}/registrationConstraints`)
        .send(attributes)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
      expect(response.status).toBe(400);
    });
    it("Return 400 when start is not included", async () => {
      const attributes = {
        end: 0,
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}/registrationConstraints`)
        .send(attributes)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
      expect(response.status).toBe(400);
    });
    it("Return 400 when end is not included", async () => {
      const attributes = {
        start: 72,
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}/registrationConstraints`)
        .send(attributes)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.User).token
        );
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
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
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
      expect(response.status).toBe(400);
    });
    it("Return 202 when course is created", async () => {
      const attributes = {
        start: 72,
        end: 0,
      };
      const response = await request
        .post(`${endpoint}/${courses[0].id}/registrationConstraints`)
        .send(attributes)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === Role.Admin).token
        );
      expect(response.status).toBe(202);
      const course = JSON.parse(response.text).course;
      expect(course.startRegConstraint).toBe(72);
      expect(course.endRegConstraint).toBe(0);
    });
  });

  afterAll(async () => {
    const deleteOfficeHours = prisma.officeHour.deleteMany();
    const deleteUsers = prisma.account.deleteMany();
    const deleteTopics = prisma.topic.deleteMany();
    const deleteTimeOptions = prisma.officeHourTimeOptions.deleteMany();
    const deleteCourses = prisma.course.deleteMany();
    await prisma.$transaction([deleteOfficeHours]);
    await prisma.$transaction([deleteUsers]);
    await prisma.$transaction([deleteTopics]);
    await prisma.$transaction([deleteTimeOptions]);
    await prisma.$transaction([deleteCourses]);

    await prisma.$disconnect();
    // Tear down the test database by `yarn docker:down`
  });
});
