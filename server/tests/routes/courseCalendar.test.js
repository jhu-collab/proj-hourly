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

  beforeAll(async() => {
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
      where: {userName: {contains: "Test Student"}},
    });
    students = noTokenStud.map((user) => ({
      ...user,
      token: createToken({user}),
      expiredToken: createToken({user, expiresIn: "0"}),
    }));

    let noTokenInst = await prisma.account.findFirst({
      where: {userName: {contains: "Test Instructor"}},
    });

    console.log(noTokenInst)
    
    instructor = ({
      ...noTokenInst,
      token: createToken({noTokenInst}),
      expiredToken: createToken({noTokenInst, expiresIn: "0"}),
    });

    console.log(instructor)
  
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
          connect: [
            { id: students[0].id },
            { id: students[1].id },
          ],
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
      const response = await request.post(`${endpoint}/$create`).send(attributes);
      expect(response.status).toBe(401);
    });

    it("Return 401 when no authorization token is provided", async () => {
      let courseDate = new Date();
      courseDate.setMonth(courseDate.getMonth() + 3);
      let secondCourseDate = new Date(courseDate);
      secondCourseDate.setMonth(courseDate.getMonth() + 1);  
      var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
      const attributes = { 
        title: "Calendar Event I",
        courseId: course.id,
        begDate: (new Date(courseDate - tzoffset)).toISOString().split('T')[0],
        endDate: (new Date(secondCourseDate - tzoffset)).toISOString().split('T')[0],
        daysOfWeek: [
          weekday[courseDate.getDay()],
          weekday[(courseDate.getDay() + 2) % 7],
        ],
        location: "zoom",
        isRemote: true,
      };
      const response = await request.post(`${endpoint}/$create`).send(attributes);
      expect(response.status).toBe(401);
    });

    it("Return 401 when authorization token is expired", async () => {
      let courseDate = new Date();
      courseDate.setMonth(courseDate.getMonth() + 3);
      let secondCourseDate = new Date(courseDate);
      secondCourseDate.setMonth(courseDate.getMonth() + 1);  
      var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
      const attributes = { 
        title: "Calendar Event I",
        courseId: course.id,
        begDate: (new Date(courseDate - tzoffset)).toISOString().split('T')[0],
        endDate: (new Date(secondCourseDate - tzoffset)).toISOString().split('T')[0],
          daysOfWeek: [
          weekday[courseDate.getDay()],
          weekday[(courseDate.getDay() + 2) % 7],
        ],
        location: "zoom",
        isRemote: true,
      };
      const response = await request.post(`${endpoint}/$create`).send(attributes).set("Authorization", "Bearer " + instructor.expiredToken);
      expect(response.status).toBe(401);
    });

    it("Return 400 when course ID is invalid and nonzero", async () => {
      let courseDate = new Date();
      courseDate.setMonth(courseDate.getMonth() + 3);
      let secondCourseDate = new Date(courseDate);
      secondCourseDate.setMonth(courseDate.getMonth() + 1);          
      var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
      const attributes = { 
        title: "Calendar Event I",
        courseId: course.id * 2,
        begDate: (new Date(courseDate - tzoffset)).toISOString().split('T')[0],
        endDate: (new Date(secondCourseDate - tzoffset)).toISOString().split('T')[0],
          daysOfWeek: [
          weekday[courseDate.getDay()],
          weekday[(courseDate.getDay() + 2) % 7],
        ],
        location: "zoom",
        isRemote: true,
      };     
      const response = await request.post(`${endpoint}/create`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      console.log(response.text)
      expect(response.status).toBe(400);
    });

    it("Return 400 when course ID is 0", async () => {
      let courseDate = new Date();
      courseDate.setMonth(courseDate.getMonth() + 3);
      let secondCourseDate = new Date(courseDate);
      secondCourseDate.setMonth(courseDate.getMonth() + 1);  
              var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
      const attributes = { 
        title: "Calendar Event I",
        courseId: 0,
        begDate: (new Date(courseDate - tzoffset)).toISOString().split('T')[0],
        endDate: (new Date(secondCourseDate - tzoffset)).toISOString().split('T')[0],
          daysOfWeek: [
          weekday[courseDate.getDay()],
          weekday[(courseDate.getDay() + 2) % 7],
        ],
        location: "zoom",
        isRemote: true,
      };
      const response = await request.post(`${endpoint}/create`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when Course ID < 0", async () => {
      let courseDate = new Date();
      courseDate.setMonth(courseDate.getMonth() + 3);
      let secondCourseDate = new Date(courseDate);
      secondCourseDate.setMonth(courseDate.getMonth() + 1);          
      var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
      const attributes = { 
        title: "Calendar Event I",
        courseId: -course.id,
        begDate: (new Date(courseDate - tzoffset)).toISOString().split('T')[0],
        endDate: (new Date(secondCourseDate - tzoffset)).toISOString().split('T')[0],
          daysOfWeek: [
          weekday[courseDate.getDay()],
          weekday[(courseDate.getDay() + 2) % 7],
        ],
        location: "zoom",
        isRemote: true,
      };   
      const response = await request.post(`${endpoint}/create`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when begDate is a date now", async () => {
      let courseDate = new Date();
      courseDate.setMonth(courseDate.getMonth() + 3);
      let secondCourseDate = new Date(courseDate);
      secondCourseDate.setMonth(courseDate.getMonth() + 1);          
      var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
      const attributes = { 
        title: "Calendar Event I",
        courseId: course.id,
        begDate: (new Date(Date.now() - tzoffset)).toISOString().split('T')[0],
        endDate: (new Date(secondCourseDate - tzoffset)).toISOString().split('T')[0],
          daysOfWeek: [
          weekday[courseDate.getDay()],
          weekday[(courseDate.getDay() + 2) % 7],
        ],
        location: "zoom",
        isRemote: true,
      };   
      const response = await request.post(`${endpoint}/create`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });


    it("Return 400 when begDate is a date in the past", async () => {
      let courseDate = new Date();
      courseDate.setMonth(courseDate.getMonth() + 3);
      let secondCourseDate = new Date(courseDate);
      secondCourseDate.setMonth(courseDate.getMonth() + 1);  
      let pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 3);        
      var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds

      const attributes = { 
        title: "Calendar Event I",
        courseId: course.id,
        begDate: (new Date(pastDate - tzoffset)).toISOString().split('T')[0],
        endDate: (new Date(secondCourseDate - tzoffset)).toISOString().split('T')[0],
          daysOfWeek: [
          weekday[courseDate.getDay()],
          weekday[(courseDate.getDay() + 2) % 7],
        ],
        location: "zoom",
        isRemote: true,
      };   
      const response = await request.post(`${endpoint}/create`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when endDate is a date now", async () => {
      let courseDate = new Date();
      courseDate.setMonth(courseDate.getMonth() + 3);
      let secondCourseDate = new Date(courseDate);
      secondCourseDate.setMonth(courseDate.getMonth() + 1);          
      var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
      const attributes = { 
        title: "Calendar Event I",
        courseId: course.id,
        begDate: (new Date(courseDate - tzoffset)).toISOString().split('T')[0],
        endDate: (new Date(Date.now() - tzoffset)).toISOString().split('T')[0],
          daysOfWeek: [
          weekday[courseDate.getDay()],
          weekday[(courseDate.getDay() + 2) % 7],
        ],
        location: "zoom",
        isRemote: true,
      };   
      const response = await request.post(`${endpoint}/create`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when endDate is a date in the past", async () => {
      let courseDate = new Date();
      courseDate.setMonth(courseDate.getMonth() + 3);
      let secondCourseDate = new Date(courseDate);
      secondCourseDate.setMonth(courseDate.getMonth() + 1);  
      let pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 3);        
      var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
      const attributes = { 
        title: "Calendar Event I",
        courseId: course.id,
        begDate: (new Date(courseDate - tzoffset)).toISOString().split('T')[0],
        endDate: (new Date(pastDate - tzoffset)).toISOString().split('T')[0],
          daysOfWeek: [
          weekday[courseDate.getDay()],
          weekday[(courseDate.getDay() + 2) % 7],
        ],
        location: "zoom",
        isRemote: true,
      };  
      const response = await request.post(`${endpoint}/create`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when title is empty", async () => {
      let courseDate = new Date();
      courseDate.setMonth(courseDate.getMonth() + 3);
      let secondCourseDate = new Date(courseDate);
      secondCourseDate.setMonth(courseDate.getMonth() + 1);          
      var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
      const attributes = { 
        title: "",
        courseId: course.id,
        begDate: (new Date(courseDate - tzoffset)).toISOString().split('T')[0],
        endDate: (new Date(secondCourseDate - tzoffset)).toISOString().split('T')[0],
          daysOfWeek: [
          weekday[courseDate.getDay()],
          weekday[(courseDate.getDay() + 2) % 7],
        ],
        location: "zoom",
        isRemote: true,
      };  
      const response = await request.post(`${endpoint}/create`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when location is empty", async () => {
      let courseDate = new Date();
      courseDate.setMonth(courseDate.getMonth() + 3);
      let secondCourseDate = new Date(courseDate);
      secondCourseDate.setMonth(courseDate.getMonth() + 1);        
      var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
      const attributes = { 
        title: "Calendar Event I",
        courseId: course.id,
        begDate: (new Date(courseDate - tzoffset)).toISOString().split('T')[0],
        endDate: (new Date(secondCourseDate - tzoffset)).toISOString().split('T')[0],
          daysOfWeek: [
          weekday[courseDate.getDay()],
          weekday[(courseDate.getDay() + 2) % 7],
        ],
        location: "",
        isRemote: true,
      };        const response = await request.post(`${endpoint}/create`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when daysOfWeek is empty", async () => {
      let courseDate = new Date();
      courseDate.setMonth(courseDate.getMonth() + 3);
      let secondCourseDate = new Date(courseDate);
      secondCourseDate.setMonth(courseDate.getMonth() + 1);          
      var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
      const attributes = { 
        title: "Calendar Event I",
        courseId: course.id,
        begDate: (new Date(courseDate - tzoffset)).toISOString().split('T')[0],
        endDate: (new Date(secondCourseDate - tzoffset)).toISOString().split('T')[0],
          daysOfWeek: [],
        location: "zoom",
        isRemote: true,
      };        
      const response = await request.post(`${endpoint}/create`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 202 when event is created", async () => {
      let courseDate = new Date();
      courseDate.setMonth(courseDate.getMonth() + 3);
      let secondCourseDate = new Date(courseDate);
      secondCourseDate.setMonth(courseDate.getMonth() + 1); 
      var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
      const attributes = { 
        title: "Calendar Event",
        courseId: course.id,
        begDate: (new Date(courseDate - tzoffset)).toISOString().split('T')[0],
        endDate: (new Date(secondCourseDate - tzoffset)).toISOString().split('T')[0],
        daysOfWeek: [
          weekday[courseDate.getDay()],
          weekday[(courseDate.getDay() + 2) % 7],
        ],
        location: "zoom",
        isRemote: true,
      };
      // console.log(attributes)
      const response = await request.post(`${endpoint}/create`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      // console.log(response.text)
      const calendarEvents = await prisma.calendarEvent.findMany({
        where: {
          courseId: course.id,
        }
      });
      expect(response.status).toBe(202);

      const calendarJSON = response.body.eventJSon;
      for(let i in calendarJSON) { 
        calendarEvents.push(calendarJSON[i]);
      }; 
      const firstCalendarEvent = prisma.calendarEvent.findUniqueOrThrow({ where: { courseId_date: {
        date: attributes.begDate,
        courseId: attributes.courseId,
      } } });
      expect(firstCalendarEvent).toBeDefined();
    });

  });

  // describe(`Test POST: ${endpoint}/changeCancellation`, async () => {
  //   it("Return 401 when no body is included", async () => {
  //     const attributes = {};
  //     const response = await request.post(`${endpoint}/$changeCancellation`).send(attributes);
  //     expect(response.status).toBe(401);
  //   });

  //   it("Return 401 when no authorization token is provided", async () => {
  //     const attributes = {
  //       date: calendarEvents[0].start,
  //       courseId: course.id,
  //     };
  //     const response = await request.post(`${endpoint}/$changeCancellation`).send(attributes);
  //     expect(response.status).toBe(401);
  //   });

  //   it("Return 401 when authorization token is expired", async () => {
  //     const attributes = {
  //       date: calendarEvents[0].start,
  //       courseId: course.id,
  //     };
  //     const response = await request.post(`${endpoint}/$changeCancellation`).send(attributes).set("Authorization", "Bearer " + instructor.expiredToken);
  //     expect(response.status).toBe(401);
  //   });

  //   it("Return 400 when course ID is invalid and nonzero", async () => {
  //     const attributes = {
  //       date: calendarEvents[0].start,
  //       courseId: course.id * 2,
  //     };
  //     const response = await request.post(`${endpoint}/changeCancellation`).send(attributes).set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when course ID is 0", async () => {
  //     const attributes = {
  //       date: calendarEvents[0].start,
  //       courseId: 0,
  //     };
  //     const response = await request.post(`${endpoint}/changeCancellation`).send(attributes).set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when Course ID < 0", async () => {
  //     const attributes = {
  //       date: calendarEvents[0].start,
  //       courseId: -course.id,
  //     };
  //     const response = await request.post(`${endpoint}/changeCancellation`).send(attributes).set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when date is a date now", async () => {
  //     var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
  //     const attributes = {
  //       courseId: course.id,
  //       date: (new Date(Date.now() - tzoffset)).toISOString().split('T')[0],
  //     };
  //     const response = await request.post(`${endpoint}/changeCancellation`).send(attributes).set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when date is a date in the past", async () => {
  //     let pastDate = new Date();
  //     pastDate.setMonth(pastDate.getMonth() - 3);
  //     var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
  //     const attributes = {
  //       courseId: course.id,
  //       date: (new Date(pastDate - tzoffset)).toISOString().split('T')[0],
  //     };
  //     const response = await request.post(`${endpoint}/changeCancellation`).send(attributes).set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(400);
  //   });
    
  //   it("Return 202 with all valid parameters", async () => {
  //     const attributes = {
  //       date: calendarEvents[0].start,
  //       courseId: course.id,
  //     };
  //     const response = await request.post(`${endpoint}/changeCancellation`).send(attributes).set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(202);
      
  //     const calendarJSON = response.body.eventJSon;
  //     calendarEvents = [];
  //     for(let i in calendarJSON) { 
  //       calendarEvents.push(calendarJSON[i]);
  //     }; 
  //     const firstCalendarEvent = prisma.calendarEvent.findUniqueOrThrow({ where: { courseId_date: {
  //       date: attributes.date,
  //       courseId: attributes.courseId,
  //     } } });
  //     expect(firstCalendarEvent).toBeDefined();
  //   });

  // });

  // describe(`Test POST: ${endpoint}/changeRemote`, async () => {
  //   it("Return 401 when no body is included", async () => {
  //     const attributes = {};
  //     const response = await request.post(`${endpoint}/$changeRemote`).send(attributes);
  //     expect(response.status).toBe(401);
  //   });

  //   it("Return 401 when no authorization token is provided", async () => {
  //     const attributes = {
  //       date: calendarEvents[0].start,
  //       courseId: course.id,
  //     };
  //     const response = await request.post(`${endpoint}/$changeRemote`).send(attributes);
  //     expect(response.status).toBe(401);
  //   });

  //   it("Return 401 when authorization token is expired", async () => {
  //     const attributes = {
  //       date: calendarEvents[0].start,
  //       courseId: course.id,
  //     };
  //     const response = await request.post(`${endpoint}/$changeRemote`).send(attributes).set("Authorization", "Bearer " + instructor.expiredToken);
  //     expect(response.status).toBe(401);
  //   });

  //   it("Return 400 when course ID is invalid and nonzero", async () => {
  //     const attributes = {
  //       date: calendarEvents[0].start,
  //       courseId: course.id * 2,
  //     };
  //     const response = await request.post(`${endpoint}/changeRemote`).send(attributes).set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when course ID is 0", async () => {
  //     const attributes = {
  //       date: calendarEvents[0].start,
  //       courseId: 0,
  //     };
  //     const response = await request.post(`${endpoint}/changeRemote`).send(attributes).set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when Course ID < 0", async () => {
  //     const attributes = {
  //       date: calendarEvents[0].start,
  //       courseId: -course.id,
  //     };
  //     const response = await request.post(`${endpoint}/changeRemote`).send(attributes).set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when date is a date now", async () => {
  //     var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
  //     const attributes = {
  //       courseId: course.id,
  //       date: (new Date(Date.now() - tzoffset)).toISOString().split('T')[0],
  //     };
  //     const response = await request.post(`${endpoint}/changeRemote`).send(attributes).set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when date is a date in the past", async () => {
  //     let pastDate = new Date();
  //     pastDate.setMonth(pastDate.getMonth() - 3);
  //     var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
  //     const attributes = {
  //       courseId: course.id,
  //       date: (new Date(pastDate - tzoffset)).toISOString().split('T')[0],
  //     };
  //     const response = await request.post(`${endpoint}/changeRemote`).send(attributes).set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 202 with all valid parameters", async () => {
  //     const attributes = {
  //       date: calendarEvents[0].start,
  //       courseId: course.id,
  //     };     
  //     const response = await request.post(`${endpoint}/changeRemote`).send(attributes).set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(202);
  //     const calendarJSON = response.body.eventJSon;
  //     calendarEvents = [];
  //     for(let i in calendarJSON) { 
  //       calendarEvents.push(calendarJSON[i]);
  //     }; 
  //     const firstCalendarEvent = prisma.calendarEvent.findUniqueOrThrow({ where: { courseId_date: {
  //       date: attributes.date,
  //       courseId: attributes.courseId,
  //     } } });
  //     expect(firstCalendarEvent).toBeDefined();
  //   });

  // });
  
  // describe(`Test POST: ${endpoint}/edit`, async () => {
  //   it("Return 400 when no body is included", async () => {
  //     const attributes = {};
  //     const response = await request.post(`${endpoint}/edit`).send(attributes).set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 401 when no authorization token is provided", async () => {
  //     const date = new Date(calendarEvents[1].start);
  //     let newDate = new Date(date);
  //     newDate.setDate(newDate.getDate() + 1);
  //     var tzoffset2 = (newDate).getTimezoneOffset() * 60000;
  //     let attributes = {
  //       title: "title",
  //       additionalInfo: "description",
  //       isCancelled: false,
  //       isRemote: true,
  //       location: "zoom",
  //       newDate: (new Date(newDate - tzoffset2)).toISOString().split('T')[0],
  //       date: date.toISOString().split('T')[0],
  //       courseId: course.id,
  //     };      
  //     const response = await request.post(`${endpoint}/$edit`).send(attributes);
  //     expect(response.status).toBe(401);
  //   });

  //   it("Return 401 when authorization token is expired", async () => {
  //     const date = new Date(calendarEvents[1].start);
  //     let newDate = new Date(date);
  //     newDate.setDate(newDate.getDate() + 1);
  //     var tzoffset2 = (newDate).getTimezoneOffset() * 60000;
  //     let attributes = {
  //       title: "title",
  //       additionalInfo: "description",
  //       isCancelled: false,
  //       isRemote: true,
  //       location: "zoom",
  //       newDate: (new Date(newDate - tzoffset2)).toISOString().split('T')[0],
  //       date: date.toISOString().split('T')[0],
  //       courseId: course.id,
  //     };      
  //     const response = await request.post(`${endpoint}/$edit`).send(attributes).set("Authorization", "Bearer " + instructor.expiredToken);
  //     expect(response.status).toBe(401);
  //   });

  //   it("Return 400 when course ID is invalid and nonzero", async () => {
  //     const date = new Date(calendarEvents[1].start);
  //     let newDate = new Date(date);
  //     newDate.setDate(newDate.getDate() + 1);
  //     var tzoffset2 = (newDate).getTimezoneOffset() * 60000;
  //     let attributes = {
  //       title: "title",
  //       additionalInfo: "description",
  //       isCancelled: false,
  //       isRemote: true,
  //       location: "zoom",
  //       newDate: (new Date(newDate - tzoffset2)).toISOString().split('T')[0],
  //       date: date.toISOString().split('T')[0],
  //       courseId: course.id * 2,
  //     };      
  //     const response = await request.post(`${endpoint}/edit`).send(attributes).set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when course ID is 0", async () => {
  //     const date = new Date(calendarEvents[1].start);
  //     let newDate = new Date(date);
  //     newDate.setDate(newDate.getDate() + 1);
  //     var tzoffset2 = (newDate).getTimezoneOffset() * 60000;
  //     let attributes = {
  //       title: "title",
  //       additionalInfo: "description",
  //       isCancelled: false,
  //       isRemote: true,
  //       location: "zoom",
  //       newDate: (new Date(newDate - tzoffset2)).toISOString().split('T')[0],
  //       date: date.toISOString().split('T')[0],
  //       courseId: 0,
  //     };      
  //     const response = await request.post(`${endpoint}/edit`).send(attributes).set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when Course ID < 0", async () => {
  //     const date = new Date(calendarEvents[1].start);
  //     let newDate = new Date(date);
  //     newDate.setDate(newDate.getDate() + 1);
  //     var tzoffset2 = (newDate).getTimezoneOffset() * 60000;
  //     let attributes = {
  //       title: "title",
  //       additionalInfo: "description",
  //       isCancelled: false,
  //       isRemote: true,
  //       location: "zoom",
  //       newDate: (new Date(newDate - tzoffset2)).toISOString().split('T')[0],
  //       date: date.toISOString().split('T')[0],
  //       courseId: -course.id,
  //     };      
  //     const response = await request.post(`${endpoint}/create`).send(attributes).set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when date is a date now", async () => {
  //     const date = new Date(calendarEvents[1].start);
  //     let newDate = new Date(date);        
  //     var tzoffset1 = (new Date()).getTimezoneOffset() * 60000;
  //     var tzoffset2 = (newDate).getTimezoneOffset() * 60000;
  //     newDate.setDate(newDate.getDate() + 1);
  //     let attributes = {
  //       title: "title",
  //       additionalInfo: "description",
  //       isCancelled: false,
  //       isRemote: true,
  //       location: "zoom",
  //       newDate: (new Date(newDate - tzoffset2)).toISOString().split('T')[0],
  //       date: (new Date(Date.now() - tzoffset1)).toISOString().split('T')[0],
  //       courseId: course.id,
  //     };      
  //     const response = await request.post(`${endpoint}/edit`).send(attributes).set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when date is a date in the past", async () => {
  //     let pastDate = new Date();
  //     pastDate.setMonth(pastDate.getMonth() - 3);
  //     const date = new Date(calendarEvents[1].start);
  //     let newDate = new Date(date);
  //     newDate.setDate(newDate.getDate() + 1);
  //     var tzoffset1 = (pastDate).getTimezoneOffset() * 60000;
  //     var tzoffset2 = (newDate).getTimezoneOffset() * 60000;
  //     let attributes = {
  //       title: "title",
  //       additionalInfo: "description",
  //       isCancelled: false,
  //       isRemote: true,
  //       location: "zoom",
  //       newDate: (new Date(newDate - tzoffset2)).toISOString().split('T')[0],
  //       date: (new Date(pastDate - tzoffset1)).toISOString().split('T')[0],
  //       courseId: course.id,
  //     };      
  //     const response = await request.post(`${endpoint}/edit`).send(attributes).set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when newDate is a date now", async () => {
  //     const date = new Date(calendarEvents[1].start);
  //     let newDate = new Date(date);
  //     newDate.setDate(newDate.getDate() + 1);
  //     var tzoffset2 = (new Date()).getTimezoneOffset() * 60000;
  //     let attributes = {
  //       title: "title",
  //       additionalInfo: "description",
  //       isCancelled: false,
  //       isRemote: true,
  //       location: "zoom",
  //       newDate: (new Date(Date.now() - tzoffset2)).toISOString().split('T')[0],
  //       date: date.toISOString().split('T')[0],
  //       courseId: course.id,
  //     };      
  //     const response = await request.post(`${endpoint}/edit`).send(attributes).set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when newDate is a date in the past", async () => {
  //     let pastDate = new Date();
  //     pastDate.setMonth(pastDate.getMonth() - 3);
  //     const date = new Date(calendarEvents[1].start);
  //     var tzoffset2 = (pastDate).getTimezoneOffset() * 60000;
  //     let attributes = {
  //       title: "title",
  //       additionalInfo: "description",
  //       isCancelled: false,
  //       isRemote: true,
  //       location: "zoom",
  //       newDate: (new Date(pastDate - tzoffset2)).toISOString().split('T')[0],
  //       date: date.toISOString().split('T')[0],
  //       courseId: course.id,
  //     };      
  //     const response = await request.post(`${endpoint}/edit`).send(attributes).set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when title is empty", async () => {
  //     const date = new Date(calendarEvents[1].start);
  //     let newDate = new Date(date);
  //     newDate.setDate(newDate.getDate() + 1);
  //     var tzoffset2 = (newDate).getTimezoneOffset() * 60000;
  //     let attributes = {
  //       title: "",
  //       additionalInfo: "description",
  //       isCancelled: false,
  //       isRemote: true,
  //       location: "zoom",
  //       newDate: (new Date(newDate - tzoffset2)).toISOString().split('T')[0],
  //       date: date.toISOString().split('T')[0],
  //       courseId: course.id,
  //     };      
  //     const response = await request.post(`${endpoint}/edit`).send(attributes).set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when location is empty", async () => {
  //     const date = new Date(calendarEvents[1].start);
  //     let newDate = new Date(date);
  //     newDate.setDate(newDate.getDate() + 1);
  //     var tzoffset2 = (newDate).getTimezoneOffset() * 60000;
  //     let attributes = {
  //       title: "title",
  //       additionalInfo: "description",
  //       isCancelled: false,
  //       isRemote: true,
  //       location: "",
  //       newDate: (new Date(newDate - tzoffset2)).toISOString().split('T')[0],
  //       date: date.toISOString().split('T')[0],
  //       courseId: course.id,
  //     };      
  //     const response = await request.post(`${endpoint}/edit`).send(attributes).set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 202 with all valid parameters", async () => {
  //     const date = new Date(calendarEvents[1].start);
  //     let newDate = new Date(date);
  //     newDate.setDate(newDate.getDate() + 1);
  //     var tzoffset2 = (newDate).getTimezoneOffset() * 60000;
  //     let attributes = {
  //       title: "title",
  //       additionalInfo: "description",
  //       isCancelled: false,
  //       isRemote: true,
  //       location: "zoom",
  //       newDate: (new Date(newDate - tzoffset2)).toISOString().split('T')[0],
  //       date: date.toISOString().split('T')[0],
  //       courseId: course.id,
  //     };
  //     const response = await request.post(`${endpoint}/edit`).send(attributes).set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(202);
  //     const calendarJSON = response.body.eventJSon;
  //     calendarEvents = [];
  //     for(let i in calendarJSON) { 
  //       calendarEvents.push(calendarJSON[i]);
  //     }; 
  //     const firstCalendarEvent = prisma.calendarEvent.findUniqueOrThrow({ where: 
  //       { 
  //         courseId_date: {
  //           date: attributes.newDate,
  //         courseId: attributes.courseId,
  //         } 
  //       } 
  //     });
  //     expect(firstCalendarEvent).toBeDefined();
  //   });
  // });

  // describe(`Test POST: ${endpoint}/createEvent`, async () => {
  //   it("Return 401 when no body is included", async () => {
  //     const attributes = {};
  //     const response = await request.post(`${endpoint}/$createEvent`).send(attributes);
  //     expect(response.status).toBe(401);
  //   });

  //   it("Return 401 when no authorization token is provided", async () => {
  //     const date = new Date(calendarEvents[0].start);
  //     let newDate = new Date(date);
  //     newDate.setDate(newDate.getDate() + 1);  
  //     const attributes = { 
  //       title: "Calendar Event II",
  //       courseId: course.id,
  //       date: newDate.toISOString().split('T')[0],
  //       location: "zoom",
  //       isRemote: true,
  //     };
  //     const response = await request.post(`${endpoint}/$createEvent`).send(attributes);
  //     expect(response.status).toBe(401);
  //   });

  //   it("Return 401 when authorization token is expired", async () => {
  //     const date = new Date(calendarEvents[0].start);
  //     let newDate = new Date(date);
  //     newDate.setDate(newDate.getDate() + 1);  
  //     const attributes = { 
  //       title: "Calendar Event II",
  //       courseId: course.id,
  //       date: newDate.toISOString().split('T')[0],
  //       location: "zoom",
  //       isRemote: true,
  //     };    
  //     const response = await request.post(`${endpoint}/$createEvent`).send(attributes).set("Authorization", "Bearer " + instructor.expiredToken);
  //     expect(response.status).toBe(401);
  //   });

  //   it("Return 400 when course ID is invalid and nonzero", async () => {
  //     const date = new Date(calendarEvents[0].start);
  //     let newDate = new Date(date);
  //     newDate.setDate(newDate.getDate() + 1);  
  //     const attributes = { 
  //       title: "Calendar Event II",
  //       courseId: course.id * 2,
  //       date: newDate.toISOString().split('T')[0],
  //       location: "zoom",
  //       isRemote: true,
  //     };      const response = await request.post(`${endpoint}/createEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when course ID is 0", async () => {
  //     const date = new Date(calendarEvents[0].start);
  //     let newDate = new Date(date);
  //     newDate.setDate(newDate.getDate() + 1);  
  //     const attributes = { 
  //       title: "Calendar Event II",
  //       courseId: 0,
  //       date: newDate.toISOString().split('T')[0],
  //       location: "zoom",
  //       isRemote: true,
  //     };      const response = await request.post(`${endpoint}/createEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when Course ID < 0", async () => {
  //     const date = new Date(calendarEvents[0].start);
  //     let newDate = new Date(date);
  //     newDate.setDate(newDate.getDate() + 1);  
  //     const attributes = { 
  //       title: "Calendar Event II",
  //       courseId: -course.id,
  //       date: newDate.toISOString().split('T')[0],
  //       location: "zoom",
  //       isRemote: true,
  //     };      const response = await request.post(`${endpoint}/createEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when date is a date now", async () => {
  //     const attributes = { 
  //       title: "Calendar Event II",
  //       courseId: course.id,
  //       date: new Date(Date.now()).toISOString().split('T')[0],
  //       location: "zoom",
  //       isRemote: true,
  //     };
  //     console.log(attributes)
  //     const response = await request.post(`${endpoint}/createEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when date is a date in the past", async () => {
  //     let pastDate = new Date();
  //     pastDate.setMonth(pastDate.getMonth() - 3);
  //     const attributes = { 
  //       title: "Calendar Event II",
  //       courseId: course.id,
  //       date: pastDate.toISOString().split('T')[0],
  //       location: "zoom",
  //       isRemote: true,
  //     };
  //     console.log(attributes)
  //     const response = await request.post(`${endpoint}/createEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when title is empty", async () => {
  //     const date = new Date(calendarEvents[0].start);
  //     let newDate = new Date(date);
  //     newDate.setDate(newDate.getDate() + 1);  
  //     const attributes = { 
  //       title: "",
  //       courseId: course.id,
  //       date: newDate.toISOString().split('T')[0],
  //       location: "zoom",
  //       isRemote: true,
  //     };      
  //     const response = await request.post(`${endpoint}/createEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when location is empty", async () => {
  //     const date = new Date(calendarEvents[0].start);
  //     let newDate = new Date(date);
  //     newDate.setDate(newDate.getDate() + 1);  
  //     const attributes = { 
  //       title: "Calendar Event II",
  //       courseId: course.id,
  //       date: newDate.toISOString().split('T')[0],
  //       location: "",
  //       isRemote: true,
  //     };
  //     const response = await request.post(`${endpoint}/createEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 202 with all valid parameters", async () => {
  //     const date = new Date(calendarEvents[0].start);
  //     let newDate = new Date(date);
  //     newDate.setDate(newDate.getDate() + 1);  
  //     const attributes = { 
  //       title: "Calendar Event II",
  //       courseId: course.id,
  //       date: newDate.toISOString().split('T')[0],
  //       location: "zoom",
  //       isRemote: true,
  //     };
  //     const response = await request.post(`${endpoint}/createEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(202);

  //     const calendarJSON = response.body.eventJSon;
  //     for(let i in calendarJSON) { 
  //       calendarEvents.push(calendarJSON[i]);
  //     }; 
  //     const firstCalendarEvent = prisma.calendarEvent.findUniqueOrThrow({ where: { courseId_date: {
  //       date: attributes.date,
  //       courseId: attributes.courseId,
  //     } } });
  //     expect(firstCalendarEvent).toBeDefined();
  //   });
  // });

  // // describe(`Test POST: ${endpoint}/createRecurringEvent`, async () => {
  //   let courseDate = new Date();
  //   courseDate.setMonth(courseDate.getMonth() + 3);
  //   courseDate.setDate(courseDate.getDate() + 1);
  //   let secondCourseDate = new Date(courseDate);
  //   secondCourseDate.setMonth(courseDate.getMonth() + 1);

  //   it("Return 401 when no body is included", async () => {
  //     const attributes = {};
  //     const response = await request.post(`${endpoint}/$createRecurringEvent`).send(attributes);
  //     expect(response.status).toBe(401);
  //   });

  //   it("Return 401 when no authorization token is provided", async () => {
  //     const attributes = { 
  //       title: "Calendar Event III",
  //       courseId: course.id,
  //       begDate: courseDate.toISOString().split('T')[0],
  //       endDate: secondCourseDate.toISOString().split('T')[0],
  //       location: "zoom",
  //       isRemote: true,
  //       daysOfWeek: [
  //         weekday[courseDate.getDay()],
  //         weekday[(courseDate.getDay() + 2) % 7],
  //       ],
  //     };
  //     const response = await request.post(`${endpoint}/$createRecurringEvent`).send(attributes);
  //     expect(response.status).toBe(401);
  //   });

  //   it("Return 401 when authorization token is expired", async () => {
  //     const attributes = { 
  //       title: "Calendar Event III",
  //       courseId: course.id,
  //       begDate: courseDate.toISOString().split('T')[0],
  //       endDate: secondCourseDate.toISOString().split('T')[0],
  //       location: "zoom",
  //       isRemote: true,
  //       daysOfWeek: [
  //         weekday[courseDate.getDay()],
  //         weekday[(courseDate.getDay() + 2) % 7],
  //       ],
  //     };
  //     const response = await request.post(`${endpoint}/$createRecurringEvent`).send(attributes).set("Authorization", "Bearer " + instructor.expiredToken);
  //     expect(response.status).toBe(401);
  //   });

  //   it("Return 400 when course ID is invalid and nonzero", async () => {
  //     const attributes = { 
  //       title: "Calendar Event III",
  //       courseId: course.id * 2,
  //       begDate: courseDate.toISOString().split('T')[0],
  //       endDate: secondCourseDate.toISOString().split('T')[0],
  //       location: "zoom",
  //       isRemote: true,
  //       daysOfWeek: [
  //         weekday[courseDate.getDay()],
  //         weekday[(courseDate.getDay() + 2) % 7],
  //       ],
  //     };
  //     const response = await request.post(`${endpoint}/createRecurringEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when course ID is 0", async () => {
  //     const attributes = { 
  //       title: "Calendar Event III",
  //       courseId: 0,
  //       begDate: courseDate.toISOString().split('T')[0],
  //       endDate: secondCourseDate.toISOString().split('T')[0],
  //       location: "zoom",
  //       isRemote: true,
  //       daysOfWeek: [
  //         weekday[courseDate.getDay()],
  //         weekday[(courseDate.getDay() + 2) % 7],
  //       ],
  //     };      
  //     const response = await request.post(`${endpoint}/createRecurringEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when Course ID < 0", async () => {
  //     const attributes = { 
  //       title: "Calendar Event III",
  //       courseId: -course.id,
  //       begDate: courseDate.toISOString().split('T')[0],
  //       endDate: secondCourseDate.toISOString().split('T')[0],
  //       location: "zoom",
  //       isRemote: true,
  //       daysOfWeek: [
  //         weekday[courseDate.getDay()],
  //         weekday[(courseDate.getDay() + 2) % 7],
  //       ],
  //     };      
  //     const response = await request.post(`${endpoint}/createRecurringEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when begDate is a date now", async () => {
  //     const attributes = { 
  //       title: "Calendar Event III",
  //       courseId: course.id,
  //       begDate: courseDate.toISOString().split('T')[0],
  //       endDate: new Date(Date.now()).toISOString().split('T')[0],
  //       location: "zoom",
  //       isRemote: true,
  //       daysOfWeek: [
  //         weekday[courseDate.getDay()],
  //         weekday[(courseDate.getDay() + 2) % 7],
  //       ],
  //     };
  //     const response = await request.post(`${endpoint}/createRecurringEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when begDate is a date in the past", async () => {
  //     let pastDate = new Date();
  //     pastDate.setMonth(pastDate.getMonth() - 3);
  //     const attributes = { 
  //       title: "Calendar Event III",
  //       courseId: course.id,
  //       begDate: pastDate.toISOString().split('T')[0],
  //       endDate: secondCourseDate.toISOString().split('T')[0],
  //       location: "zoom",
  //       isRemote: true,
  //       daysOfWeek: [
  //         weekday[courseDate.getDay()],
  //         weekday[(courseDate.getDay() + 2) % 7],
  //       ],
  //     };
  //     const response = await request.post(`${endpoint}/createRecurringEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when endDate is a date now", async () => {
  //     const attributes = { 
  //       title: "Calendar Event III",
  //       courseId: course.id,
  //       begDate: courseDate.toISOString().split('T')[0],
  //       endDate: new Date(Date.now()).toISOString().split('T')[0],
  //       location: "zoom",
  //       isRemote: true,
  //       daysOfWeek: [
  //         weekday[courseDate.getDay()],
  //         weekday[(courseDate.getDay() + 2) % 7],
  //       ],
  //     };
  //     const response = await request.post(`${endpoint}/createRecurringEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when endDate is a date in the past", async () => {
  //     let pastDate = new Date();
  //     pastDate.setMonth(pastDate.getMonth() - 3);
  //     const attributes = { 
  //       title: "Calendar Event III",
  //       courseId: course.id,
  //       begDate: courseDate.toISOString().split('T')[0],
  //       endDate: pastDate.toISOString().split('T')[0],
  //       location: "zoom",
  //       isRemote: true,
  //       daysOfWeek: [
  //         weekday[courseDate.getDay()],
  //         weekday[(courseDate.getDay() + 2) % 7],
  //       ],
  //     };
  //     const response = await request.post(`${endpoint}/createRecurringEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when title is empty", async () => {
  //     const attributes = { 
  //       title: "",
  //       courseId: course.id,
  //       begDate: courseDate.toISOString().split('T')[0],
  //       endDate: secondCourseDate.toISOString().split('T')[0],
  //       location: "zoom",
  //       isRemote: true,
  //       daysOfWeek: [
  //         weekday[courseDate.getDay()],
  //         weekday[(courseDate.getDay() + 2) % 7],
  //       ],
  //     };      
  //     const response = await request.post(`${endpoint}/createRecurringEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when location is empty", async () => {
  //     const attributes = { 
  //       title: "Calendar Event III",
  //       courseId: course.id,
  //       begDate: courseDate.toISOString().split('T')[0],
  //       endDate: secondCourseDate.toISOString().split('T')[0],
  //       location: "",
  //       isRemote: true,
  //       daysOfWeek: [
  //         weekday[courseDate.getDay()],
  //         weekday[(courseDate.getDay() + 2) % 7],
  //       ],
  //     };      
  //     const response = await request.post(`${endpoint}/createRecurringEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when daysOfWeek is empty", async () => {
  //     const attributes = { 
  //       title: "Calendar Event III",
  //       courseId: course.id,
  //       begDate: courseDate.toISOString().split('T')[0],
  //       endDate: secondCourseDate.toISOString().split('T')[0],
  //       location: "zoom",
  //       isRemote: true,
  //       daysOfWeek: [],
  //     };      
  //     const response = await request.post(`${endpoint}/createRecurringEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 202 with all valid parameters", async () => {
  //     const attributes = { 
  //       title: "Calendar Event III",
  //       courseId: course.id,
  //       begDate: courseDate.toISOString().split('T')[0],
  //       endDate: secondCourseDate.toISOString().split('T')[0],
  //       location: "zoom",
  //       isRemote: true,
  //       daysOfWeek: [
  //         weekday[courseDate.getDay()],
  //         weekday[(courseDate.getDay() + 2) % 7],
  //       ],
  //     };
  //     const response = await request.post(`${endpoint}/createRecurringEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(202);

  //     const calendarJSON = response.body.eventJSon;
  //     for(let i in calendarJSON) { 
  //       calendarEvents.push(calendarJSON[i]);
  //     }; 
  //     const firstCalendarEvent = prisma.calendarEvent.findUniqueOrThrow({ where: { courseId_date: {
  //       date: attributes.begDate,
  //       courseId: attributes.courseId,
  //     } } });
  //     expect(firstCalendarEvent).toBeDefined();
  //   });
  // });

  // describe(`Test DELETE: ${endpoint}/deleteCourse/:courseId`, async () => {

  //   it("Return 401 when no authorization token is provided", async () => {
  //     const response = await request.delete(`${endpoint}/deleteCourse/${course.id}`);
  //     expect(response.status).toBe(401);
  //   });

  //   it("Return 401 when authorization token is expired", async () => {
  //     const response = await request.delete(`${endpoint}/deleteCourse/${course.id}`).set("Authorization", "Bearer " + instructor.expiredToken);
  //     expect(response.status).toBe(401);
  //   });

  //   it("Return 400 when invalid course id is provided", async () => {
  //     const response = await request.delete(`${endpoint}/deleteCourse/${-course.id}`).set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 202 when course events are deleted", async () => {
  //     let response = await request.delete(`${endpoint}/deleteCourse/${course.id}`).set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(202);
  //   });

  //   it("Return 200 when no body is included", async () => {
  //     let response = await request.delete(`${endpoint}/deleteCourse/${course.id}`).set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(202);
  //   });
  // });

  // describe(`Test DELETE: ${endpoint}/deleteCourse/:courseId/date/:date`, async () => {
  //   it("Return 401 when no authorization token is provided", async () => {
  //     const response = await request.delete(`${endpoint}/deleteCourse/${course.id}/date/${calendarEvents[0].date}`);
  //     expect(response.status).toBe(401);
  //   });

  //   it("Return 401 when authorization token is expired", async () => {
  //     const response = await request.delete(`${endpoint}/deleteCourse/${course.id}/date/${calendarEvents[0].date}`).set("Authorization", "Bearer " + instructor.expiredToken);
  //     expect(response.status).toBe(401);
  //   });

  //   it("Return 400 when invalid course id is provided", async () => {
  //     const response = await request.delete(`${endpoint}/deleteCourse/${-course.id}/date/${calendarEvents[0].date}`).set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 202 when course event is deleted", async () => {
  //     let response = await request.delete(`${endpoint}/deleteCourse/${course.id}/date/${calendarEvents[0].date}`).set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(202);
  //   });

  //   it("Return 200 when no body is included", async () => {
  //     let response = await request.delete(`${endpoint}/deleteCourse/${course.id}/date/${calendarEvents[0].date}`).set("Authorization", "Bearer " + instructor.token);
  //     expect(response.status).toBe(202);
  //   });
  // });

  // describe(`Test GET: ${endpoint}/getAllEventsForCourse/:courseId`, async () => {
  //   it("Return 200 when no body is included", async () => {
  //     const response = await request.post(`${endpoint}/getAllEventsForCourse/${course.id}`).set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(202);
  //   });

  //   it("Return 401 when no authorization token is provided", async () => {
  //     const response = await request.get(`${endpoint}/getAllEventsForCourse/${course.id}`);
  //     expect(response.status).toBe(401);
  //   });

  //   it("Return 401 when authorization token is expired", async () => {
  //     const response = await request.get(`${endpoint}/getAllEventsForCourse/${course.id}`).set("Authorization", "Bearer " + students[0].expiredToken);
  //     expect(response.status).toBe(401);
  //   });

  //   it("Return 400 when invalid, nonzero course id is provided", async () => {
  //     const response = await request.get(`${endpoint}/getAllEventsForCourse/${course.id * 2}`).set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when course id = 0 is provided", async () => {
  //     const response = await request.get(`${endpoint}/getAllEventsForCourse/0`).set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when course id < 0 is provided", async () => {
  //     const response = await request.get(`${endpoint}/getAllEventsForCourse/-${course.id}`).set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 403 when user is not in course", async () => {
  //     const response = await request.get(`${endpoint}/getAllEventsForCourse/${course.id}}`).set("Authorization", "Bearer " + students[2].token);
  //     expect(response.status).toBe(403);
  //   });

  //   it("Return 200 when no body is included", async () => {
  //     const response = await request.get(`${endpoint}/getAllEventsForCourse/${course.id}}`).set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(202);
  //   });

  //   it("Return 202 with all valid parameters", async () => {
  //     const response = await request.post(`${endpoint}/getAllEventsForCourse/${course.id}`).set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(202);

  //     const calendarJSON = response.body.eventJSon;
  //     for(let i in calendarJSON) { 
  //       calendarEvents.push(calendarJSON[i]);
  //     }; 
  //     const event = await prisma.calendarEvent.findMany(
  //       { 
  //         where: { 
  //           courseId: course.id, 
  //         } 
  //       });
  //     expect(event).toBeDefined();
  //   });

  // });

  // describe(`Test GET: ${endpoint}/getAllNotCancelledEventsForCourse/:courseId`, async () => {

  //   it("Return 401 when no authorization token is provided", async () => {
  //     const response = await request.get(`${endpoint}/getAllNotCancelledEventsForCourse/${course.id}`);
  //     expect(response.status).toBe(401);
  //   });

  //   it("Return 401 when authorization token is expired", async () => {
  //     const response = await request.get(`${endpoint}/getAllNotCancelledEventsForCourse/${course.id}`).set("Authorization", "Bearer " + students[0].expiredToken);
  //     expect(response.status).toBe(401);
  //   });

  //   it("Return 400 when invalid, nonzero course id is provided", async () => {
  //     const response = await request.get(`${endpoint}/getAllNotCancelledEventsForCourse/${course.id * 2}`).set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when course id = 0 is provided", async () => {
  //     const response = await request.get(`${endpoint}/getAllNotCancelledEventsForCourse/0`).set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when course id < 0 is provided", async () => {
  //     const response = await request.get(`${endpoint}/getAllNotCancelledEventsForCourse/-${course.id}`).set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 403 when user is not in course", async () => {
  //     const response = await request.get(`${endpoint}/getAllNotCancelledEventsForCourse/${course.id}}`).set("Authorization", "Bearer " + students[2].token);
  //     expect(response.status).toBe(403);
  //   });

  //   it("Return 200 when no body is included", async () => {
  //     const response = await request.get(`${endpoint}/getAllNotCancelledEventsForCourse/${course.id}}`).set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(202);
  //   });

  //   it("Return 202 with all valid parameters", async () => {
  //     const response = await request.post(`${endpoint}/getAllNotCancelledEventsForCourse/${course.id}`).set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(202);

  //     const calendarJSON = response.body.eventJSon;
  //     for(let i in calendarJSON) { 
  //       calendarEvents.push(calendarJSON[i]);
  //     }; 
  //     const event = await prisma.calendarEvent.findMany(
  //       { 
  //         where: { 
  //           courseId: course.id,
  //         } 
  //       });
  //     expect(event).toBeDefined();
  //   });

  //   it("Return 200 when no body is included", async () => {
  //     const response = await request.post(`${endpoint}/getAllNotCancelledEventsForCourse/${course.id}`).set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(202);
  //   });
  // });

  // describe(`Test GET: ${endpoint}/getAllCancelledEventsForCourse/:courseId`, async () => {

  //   it("Return 401 when no authorization token is provided", async () => {
  //     const response = await request.get(`${endpoint}/getAllCancelledEventsForCourse/${course.id}`);
  //     expect(response.status).toBe(401);
  //   });

  //   it("Return 401 when authorization token is expired", async () => {
  //     const response = await request.get(`${endpoint}/getAllCancelledEventsForCourse/${course.id}`).set("Authorization", "Bearer " + students[0].expiredToken);
  //     expect(response.status).toBe(401);
  //   });

  //   it("Return 400 when invalid, nonzero course id is provided", async () => {
  //     const response = await request.get(`${endpoint}/getAllCancelledEventsForCourse/${course.id * 2}`).set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when course id = 0 is provided", async () => {
  //     const response = await request.get(`${endpoint}/getAllCancelledEventsForCourse/0`).set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when course id < 0 is provided", async () => {
  //     const response = await request.get(`${endpoint}/getAllCancelledEventsForCourse/-${course.id}`).set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 403 when user is not in course", async () => {
  //     const response = await request.get(`${endpoint}/getAllCancelledEventsForCourse/${course.id}}`).set("Authorization", "Bearer " + students[2].token);
  //     expect(response.status).toBe(403);
  //   });

  //   it("Return 200 when no body is included", async () => {
  //     const response = await request.get(`${endpoint}/getAllCancelledEventsForCourse/${course.id}}`).set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(202);
  //   });

  //   it("Return 202 with all valid parameters", async () => {
  //     const response = await request.post(`${endpoint}/getAllCancelledEventsForCourse/${course.id}`).set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(202);

  //     const calendarJSON = response.body.eventJSon;
  //     for(let i in calendarJSON) { 
  //       calendarEvents.push(calendarJSON[i]);
  //     }; 
  //     const event = await prisma.calendarEvent.findMany(
  //       { 
  //         where: { 
  //           courseId: course.id,
  //         } 
  //       });
  //     expect(event).toBeDefined();
  //   });

  //   it("Return 200 when no body is included", async () => {
  //     const response = await request.post(`${endpoint}/getAllCancelledEventsForCourse/${course.id}`).set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(202);
  //   });

  // });

  // describe(`Test GET: ${endpoint}/getEventOnDay/:courseId/date/:date`, async () => {
  //   it("Return 401 when no authorization token is provided", async () => {
  //     const response = await request.get(`${endpoint}/getEventOnDay/${course.id}/date/${calendarEvents[0].date}`);
  //     expect(response.status).toBe(401);
  //   });

  //   it("Return 401 when authorization token is expired", async () => {
  //     const response = await request.get(`${endpoint}/getEventOnDay/${course.id}/date/${calendarEvents[0].date}`).set("Authorization", "Bearer " + students[0].expiredToken);
  //     expect(response.status).toBe(401);
  //   });

  //   it("Return 400 when invalid, nonzero course id is provided", async () => {
  //     const response = await request.get(`${endpoint}/getEventOnDay/${course.id * 2}/date/${calendarEvents[0].date}`).set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when course id = 0 is provided", async () => {
  //     const response = await request.get(`${endpoint}/getEventOnDay/0/date/${calendarEvents[0].date}`).set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 400 when course id < 0 is provided", async () => {
  //     const response = await request.get(`${endpoint}/getEventOnDay/-${course.id}/date/${calendarEvents[0].date}`).set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(400);
  //   });

  //   it("Return 403 when user is not in course", async () => {
  //     const response = await request.get(`${endpoint}/getEventOnDay/${course.id}/date/${calendarEvents[0].date}`).set("Authorization", "Bearer " + students[2].token);
  //     expect(response.status).toBe(403);
  //   });

  //   it("Return 200 when no body is included", async () => {
  //     const response = await request.get(`${endpoint}/getEventOnDay/${course.id}/date/${calendarEvents[0].date}`).set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(202);
  //   });

  //   it("Return 202 with all valid parameters", async () => {
  //     const response = await request.post(`${endpoint}/getEventOnDay/${course.id}/date/${calendarEvents[0].date}`).set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(202);

  //     const calendarJSON = response.body.eventJSon;
  //     for(let i in calendarJSON) { 
  //       calendarEvents.push(calendarJSON[i]);
  //     }; 
  //     const event = await prisma.calendarEvent.findUnique(
  //       { 
  //         where: { 
  //           courseId_date: {
  //             courseId: course.id,
  //             date: calendarEvents[0].date,
  //           } 
  //         } 
  //       });
  //     expect(event).toBeDefined();
  //   });

  //   it("Return 200 when no body is included", async () => {
  //     const response = await request.post(`${endpoint}/getEventOnDay/${course.id}/date/${calendarEvents[0].date}`).set("Authorization", "Bearer " + students[0].token);
  //     expect(response.status).toBe(202);
  //   });

  // });

  afterAll(async() => {
    // console.log(instructor)
    // console.log(students)
    // console.log(course)
    // console.log(calendarEvents)
    
    const studentIds = students.map((user) => user.id);
    const instructorId = instructor.id;
    const courseId = course.id;
    let deleteEvents = await prisma.calendarEvent.deleteMany({
      where: {
        courseId: courseId,
      },
    });
    let deleteAccounts = await prisma.account.deleteMany({
      where: {
        OR: [
          {id: {in: studentIds}},
          {id: {in: instructorId}},
        ],
      },
    });
    let deleteCourse = await prisma.course.delete({
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

