import supertest from "supertest";
import { it, expect, beforeAll, describe, afterAll, afterEach } from "vitest";
import app from "../../src/index.js";
import prisma from "../../prisma/client.js";
import { weekday } from "../../src/util/courseCalendarValidator.js";
import { Role } from "@prisma/client";
import { createToken } from "../../src/util/helpers.js";
import { create } from "domain";

const request = supertest(app);
const endpoint = "/api/calendarEvent";

// Equivalence Partitioning Map: https://docs.google.com/spreadsheets/d/1RgJwzfZvhTxP1DhYJ5uqjq8Q7btXx3zo1JZutNZkVZQ/edit?usp=sharing

let ids = {
  students: [],
  instructor: {},
  course: {},
  calendarEvents: [],
};

function updateIds(field, createdIds) {
  if (field === "students") {
    ids.students = ids.students.concat(createdIds);
  } else if (field === "course") {
    ids.course = createdIds[0];
  } else if (field === "calendarEvents") {
    ids.calendarEvents = ids.calendarEvents.concat(createdIds);
  } else if (field === "instructor") {
    ids.instructor = createdIds[0];
  }
}

function resetIds() {
  ids = {
    students: [],
    instructor: {},
    course: {},
    calendarEvents: [],
  };
}

async function setup() {
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

  let users = await prisma.account.findMany({
    orderBy: {
      id: "asc",
    },
  });

  // users auth tokens

  let students = await prisma.account.findMany({
    where: {userName: {contains: "Student"}},
  });
  const realStudents = students.map((user) => ({
    ...user,
    token: createToken({user}),
    expiredToken: createToken({user, expiresIn: "0"}),
  }));

  let instructor = await prisma.account.findFirst({
    where: {userName: {contains: "Instructor"}},
  });
  const realInstructor = {
    ...instructor,
    token: createToken({ user: instructor }),
    expiredToken: createToken({user: instructor, expiresIn: "0"}),
  };

  const course = await prisma.course.create({
    data: {
      title: "Test Course",
      courseNumber: "0",
      semester: "Fall",
      calendarYear: 2023,
      code: "AAAAZZ",
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

  updateIds(
    "students",
    students.map((student) => student.id)
  );
  updateIds("instructor", [instructor.id]);
  updateIds("course", [course.id]);

  return {
    students: realStudents,
    instructor: realInstructor,
    course: course,
    calendarEvents: [],
  };
}

async function teardown() {
  
  const calendarEvents = await prisma.calendarEvent.deleteMany({
    where: {
      courseId: ids.course,
    },
  });
  const course = await prisma.course.delete({
    where: {
      id: ids.course,
    },
  });
  const accounts = await prisma.account.deleteMany({
    where: {
      OR: [
        {id: {in: ids.students}},
        {id: {in: ids.instructor}},
      ],
    },
  });

  await prisma.$disconnect();

  resetIds();

}

describe(`Test endpoint ${endpoint}`, () => {
  let instructor = {};
  let course = {};
  let students = [];
  let calendarEvents = [];

  beforeAll(async() => {
    const params = await setup();
    instructor = params.instructor;
    course = params.course;
    students = params.students;
    calendarEvents = params.calendarEvents;
  });

  describe(`Test POST: ${endpoint}/create`, async () => {
    let courseDate = new Date();
    courseDate.setMonth(courseDate.getMonth() + 3);
    let secondCourseDate = new Date(courseDate);
    secondCourseDate.setMonth(courseDate.getMonth() + 1);

    it("Return 400 when no body is included", async () => {
      const attributes = {};
      const response = await request.post(`${endpoint}/$create`).send(attributes);
      expect(response.status).toBe(400);
    });

    it("Return 401 when no authorization token is provided", async () => {
      const attributes = { 
        title: "Calendar Event I",
        courseId: course.id,
        begDate: courseDate.toISOString().split('T')[0],
        endDate: secondCourseDate.toISOString().split('T')[0],
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
      const attributes = { 
        title: "Calendar Event I",
        courseId: course.id,
        begDate: courseDate.toISOString().split('T')[0],
        endDate: secondCourseDate.toISOString().split('T')[0],
        daysOfWeek: ["Monday", "Wednesday"],
        location: "zoom",
        isRemote: true,
      };
      const response = await request.post(`${endpoint}/$create`).send(attributes).set("Authorization", "Bearer " + instructor.expiredToken);
      expect(response.status).toBe(401);
    });

    it("Return 400 when course ID is invalid and nonzero", async () => {
      const attributes = { 
        title: "Calendar Event I",
        courseId: course.id * 2,
        begDate: courseDate.toISOString().split('T')[0],
        endDate: secondCourseDate.toISOString().split('T')[0],
        daysOfWeek: ["Monday", "Wednesday"],
        location: "zoom",
        isRemote: true,
      };     
      const response = await request.post(`${endpoint}/create`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when course ID is 0", async () => {
      const attributes = { 
        title: "Calendar Event I",
        courseId: 0,
        begDate: courseDate.toISOString().split('T')[0],
        endDate: secondCourseDate.toISOString().split('T')[0],
        daysOfWeek: ["Monday", "Wednesday"],
        location: "zoom",
        isRemote: true,
      };
      const response = await request.post(`${endpoint}/create`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when Course ID < 0", async () => {
      const attributes = { 
        title: "Calendar Event I",
        courseId: -course.id,
        begDate: courseDate.toISOString().split('T')[0],
        endDate: secondCourseDate.toISOString().split('T')[0],
        daysOfWeek: ["Monday", "Wednesday"],
        location: "zoom",
        isRemote: true,
      };   
      const response = await request.post(`${endpoint}/create`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when endDate is a date now", async () => {
      const attributes = { 
        title: "Calendar Event I",
        courseId: course.id,
        begDate: courseDate.toISOString().split('T')[0],
        endDate: new Date(Date.now()).toISOString().split('T')[0],
        daysOfWeek: ["Monday", "Wednesday"],
        location: "zoom",
        isRemote: true,
      };   
      const response = await request.post(`${endpoint}/create`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });


    it("Return 400 when begDate is a date in the past", async () => {
      let pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 3);
      const attributes = { 
        title: "Calendar Event I",
        courseId: course.id,
        begDate: pastDate.toISOString().split('T')[0],
        endDate: secondCourseDate.toISOString().split('T')[0],
        daysOfWeek: ["Monday", "Wednesday"],
        location: "zoom",
        isRemote: true,
      };   
      const response = await request.post(`${endpoint}/create`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when endDate is a date now", async () => {
      const attributes = { 
        title: "Calendar Event I",
        courseId: course.id,
        begDate: courseDate.toISOString().split('T')[0],
        endDate: new Date(Date.now()).toISOString().split('T')[0],
        daysOfWeek: ["Monday", "Wednesday"],
        location: "zoom",
        isRemote: true,
      };   
      const response = await request.post(`${endpoint}/create`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when endDate is a date in the past", async () => {
      let pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 3);
      const attributes = { 
        title: "Calendar Event I",
        courseId: course.id,
        begDate: courseDate.toISOString().split('T')[0],
        endDate: pastDate.toISOString().split('T')[0],
        daysOfWeek: ["Monday", "Wednesday"],
        location: "zoom",
        isRemote: true,
      };  
      const response = await request.post(`${endpoint}/create`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when title is empty", async () => {
      const attributes = { 
        title: "",
        courseId: course.id,
        begDate: courseDate.toISOString().split('T')[0],
        endDate: secondCourseDate.toISOString().split('T')[0],
        daysOfWeek: ["Monday", "Wednesday"],
        location: "zoom",
        isRemote: true,
      };  
      const response = await request.post(`${endpoint}/create`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when location is empty", async () => {
      const attributes = { 
        title: "Calendar Event I",
        courseId: course.id,
        begDate: courseDate.toISOString().split('T')[0],
        endDate: secondCourseDate.toISOString().split('T')[0],
        daysOfWeek: ["Monday", "Wednesday"],
        location: "",
        isRemote: true,
      };        const response = await request.post(`${endpoint}/create`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when daysOfWeek is empty", async () => {
      const attributes = { 
        title: "Calendar Event I",
        courseId: course.id,
        begDate: courseDate.toISOString().split('T')[0],
        endDate: secondCourseDate.toISOString().split('T')[0],
        daysOfWeek: [],
        location: "zoom",
        isRemote: true,
      };        
      const response = await request.post(`${endpoint}/create`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 202 when event is created", async () => {
      const attributes = { 
        title: "Calendar Event",
        courseId: course.id,
        begDate: courseDate.toISOString().split('T')[0],
        endDate: secondCourseDate.toISOString().split('T')[0],
        daysOfWeek: [
          weekday[courseDate.getDay()],
          weekday[(courseDate.getDay() + 2) % 2],
        ],
        location: "zoom",
        isRemote: true,
      };
      const response = await request.post(`${endpoint}/create`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(202);

      const calendarJSON = response.body.eventJSon;
      for(let i in calendarJSON) { 
        updateIds("calendarEvents", calendarJSON[i]);
        calendarEvents.push(calendarJSON[i]);
      }; 
      const firstCalendarEvent = prisma.calendarEvent.findUniqueOrThrow({ where: { courseId_date: {
        date: attributes.begDate,
        course: attributes.courseId,
      } } });
      expect(firstCalendarEvent).toBeDefined();
    });

  });

  describe(`Test POST: ${endpoint}/changeCancellation`, async () => {
    it("Return 400 when no body is included", async () => {
      const attributes = {};
      const response = await request.post(`${endpoint}/$changeCancellation`).send(attributes);
      expect(response.status).toBe(400);
    });

    it("Return 401 when no authorization token is provided", async () => {
      const attributes = {
        date: calendarEvents[0].start,
        courseId: course.id,
      };
      const response = await request.post(`${endpoint}/$changeCancellation`).send(attributes);
      expect(response.status).toBe(401);
    });

    it("Return 401 when authorization token is expired", async () => {
      const attributes = {
        date: calendarEvents[0].start,
        courseId: course.id,
      };
      const response = await request.post(`${endpoint}/$changeCancellation`).send(attributes).set("Authorization", "Bearer " + instructor.expiredToken);
      expect(response.status).toBe(401);
    });

    it("Return 400 when course ID is invalid and nonzero", async () => {
      const attributes = {
        date: calendarEvents[0].start,
        courseId: course.id * 2,
      };
      const response = await request.post(`${endpoint}/changeCancellation`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when course ID is 0", async () => {
      const attributes = {
        date: calendarEvents[0].start,
        courseId: 0,
      };
      const response = await request.post(`${endpoint}/changeCancellation`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when Course ID < 0", async () => {
      const attributes = {
        date: calendarEvents[0].start,
        courseId: -course.id,
      };
      const response = await request.post(`${endpoint}/changeCancellation`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when date is a date now", async () => {
      const attributes = {
        courseId: course.id,
        date: new Date(Date.now()).toISOString().split('T')[0],
      };
      const response = await request.post(`${endpoint}/changeCancellation`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when date is a date in the past", async () => {
      let pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 3);
      const attributes = {
        date: pastDate.toISOString().split('T')[0],
        courseId: course.id,
      };
      const response = await request.post(`${endpoint}/changeCancellation`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });
    
    it("Return 202 with all valid parameters", async () => {
      const attributes = {
        date: calendarEvents[0].start,
        courseId: course.id,
      };
      const response = await request.post(`${endpoint}/changeCancellation`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(202);
      
      const calendarJSON = response.body.eventJSon;
      calendarEvents = [];
      for(let i in calendarJSON) { 
        updateIds("calendarEvents", calendarJSON[i]);
        calendarEvents.push(calendarJSON[i]);
      }; 
      const firstCalendarEvent = prisma.calendarEvent.findUniqueOrThrow({ where: { courseId_date: {
        date: attributes.date,
        course: attributes.courseId,
      } } });
      expect(firstCalendarEvent).toBeDefined();
    });

  });

  describe(`Test POST: ${endpoint}/changeRemote`, async () => {
    it("Return 400 when no body is included", async () => {
      const attributes = {};
      const response = await request.post(`${endpoint}/$changeRemote`).send(attributes);
      expect(response.status).toBe(400);
    });

    it("Return 401 when no authorization token is provided", async () => {
      const attributes = {
        date: calendarEvents[0].start,
        courseId: course.id,
      };
      const response = await request.post(`${endpoint}/$changeRemote`).send(attributes);
      expect(response.status).toBe(401);
    });

    it("Return 401 when authorization token is expired", async () => {
      const attributes = {
        date: calendarEvents[0].start,
        courseId: course.id,
      };
      const response = await request.post(`${endpoint}/$changeRemote`).send(attributes).set("Authorization", "Bearer " + instructor.expiredToken);
      expect(response.status).toBe(401);
    });

    it("Return 400 when course ID is invalid and nonzero", async () => {
      const attributes = {
        date: calendarEvents[0].start,
        courseId: course.id * 2,
      };
      const response = await request.post(`${endpoint}/changeRemote`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when course ID is 0", async () => {
      const attributes = {
        date: calendarEvents[0].start,
        courseId: 0,
      };
      const response = await request.post(`${endpoint}/changeRemote`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when Course ID < 0", async () => {
      const attributes = {
        date: calendarEvents[0].start,
        courseId: -course.id,
      };
      const response = await request.post(`${endpoint}/changeRemote`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when date is a date now", async () => {
      const attributes = {
        date: new Date(Date.now()).toISOString().split('T')[0],
        courseId: course.id,
      };
      const response = await request.post(`${endpoint}/changeRemote`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when date is a date in the past", async () => {
      let pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 3);
      const attributes = {
        date: pastDate.toISOString().split('T')[0],
        courseId: course.id,
      };
      const response = await request.post(`${endpoint}/changeRemote`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 202 with all valid parameters", async () => {
      const attributes = {
        date: calendarEvents[0].start,
        courseId: course.id,
      };     
      const response = await request.post(`${endpoint}/changeRemote`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(202);
      const calendarJSON = response.body.eventJSon;
      calendarEvents = [];
      for(let i in calendarJSON) { 
        updateIds("calendarEvents", calendarJSON[i]);
        calendarEvents.push(calendarJSON[i]);
      }; 
      const firstCalendarEvent = prisma.calendarEvent.findUniqueOrThrow({ where: { courseId_date: {
        date: attributes.date,
        course: attributes.courseId,
      } } });
      expect(firstCalendarEvent).toBeDefined();
    });

  });

  describe(`Test POST: ${endpoint}/edit`, async () => {
    const date = new Date(calendarEvents[1].start);
    let newDate = new Date(date);
    newDate.setDate(newDate.getDay() + 1);
    let baseAttributes = {
      title: "title",
      additionalInfo: "description",
      isCancelled: false,
      isRemote: true,
      location: "zoom",
      newDate: newDate,
      date: date,
    };

    it("Return 400 when no body is included", async () => {
      const attributes = {};
      const response = await request.post(`${endpoint}/edit`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 201 with all valid parameters", async () => {
      const attributes = { ...baseAttributes };
      const response = await request.post(`${endpoint}/edit`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(201);
      const event = response.body.calendarEvent;
      updateIds("calendarEvents", [event]);
      const calendarEvent = await prisma.calendarEvent.findUniqueOrThrow(
        { 
          where: { 
            courseId_date: {
              date: event.date,
              course: event.course.id,
            } 
          } 
        });
      expect(calendarEvent).toBeDefined();
    });

    it("Return 401 when no authorization token is provided", async () => {
      const attributes = {...baseAttributes};
      const response = await request.post(`${endpoint}/$edit`).send(attributes);
      expect(response.status).toBe(401);
    });

    it("Return 401 when authorization token is expired", async () => {
      const attributes = {...baseAttributes};
      const response = await request.post(`${endpoint}/$edit`).send(attributes).set("Authorization", "Bearer " + instructor.expiredToken);
      expect(response.status).toBe(401);
    });

    it("Return 400 when course ID is invalid and nonzero", async () => {
      const attributes = { ...baseAttributes, courseId: course.id * 2 };
      const response = await request.post(`${endpoint}/edit`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when course ID is 0", async () => {
      const attributes = { ...baseAttributes, courseId: 0 };
      const response = await request.post(`${endpoint}/edit`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when Course ID < 0", async () => {
      const attributes = { ...baseAttributes, courseId: -course.id };
      const response = await request.post(`${endpoint}/create`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when date is a date now", async () => {
      const attributes = {
        ...baseAttributes,
        date: new Date(Date.now()).toISOString().split('T')[0],
      };
      const response = await request.post(`${endpoint}/edit`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when date is a date in the past", async () => {
      let pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 3);
      const attributes = {
        ...baseAttributes,
        begDate: pastDate.toISOString().split('T')[0],
      };
      const response = await request.post(`${endpoint}/edit`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when newDate is a date now", async () => {
      const attributes = {
        ...baseAttributes,
        newDate: new Date(Date.now()).toISOString().split('T')[0],
      };
      const response = await request.post(`${endpoint}/edit`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when newDate is a date in the past", async () => {
      let pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 3);
      const attributes = {
        ...baseAttributes,
        newDate: pastDate,
      };
      const response = await request.post(`${endpoint}/edit`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when title is empty", async () => {
      const attributes = { ...baseAttributes, title: "", };
      const response = await request.post(`${endpoint}/edit`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when location is empty", async () => {
      const attributes = { ...baseAttributes, location: "", };
      const response = await request.post(`${endpoint}/edit`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 201 with all valid parameters", async () => {
      const attributes = { ...baseAttributes };
      const response = await request.post(`${endpoint}/edit`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(201);
      const event = response.body.calendarEvent;
      updateIds("calendarEvents", [event]);
      const calendarEvent = await prisma.calendarEvent.findUniqueOrThrow(
        { 
          where: { 
            courseId_date: {
              date: event.date,
              course: event.course.id,
            } 
          } 
        });
      expect(calendarEvent).toBeDefined();
    });

  });

  describe(`Test POST: ${endpoint}/createEvent`, async () => {
    const date = new Date(calendarEvents[0].start);
    let newDate = new Date(date);
    newDate.setDate(newDate.getDay() + 1);

    it("Return 400 when no body is included", async () => {
      const attributes = {};
      const response = await request.post(`${endpoint}/$createEvent`).send(attributes);
      expect(response.status).toBe(400);
    });

    it("Return 401 when no authorization token is provided", async () => {
      const attributes = { 
        title: "Calendar Event II",
        courseId: course.id,
        date: newDate.toISOString().split('T')[0],
        location: "zoom",
        isRemote: true,
      };
      const response = await request.post(`${endpoint}/$createEvent`).send(attributes);
      expect(response.status).toBe(401);
    });

    it("Return 401 when authorization token is expired", async () => {
      const attributes = { 
        title: "Calendar Event II",
        courseId: course.id,
        date: newDate.toISOString().split('T')[0],
        location: "zoom",
        isRemote: true,
      };    
      const response = await request.post(`${endpoint}/$createEvent`).send(attributes).set("Authorization", "Bearer " + instructor.expiredToken);
      expect(response.status).toBe(401);
    });

    it("Return 400 when course ID is invalid and nonzero", async () => {
      const attributes = { 
        title: "Calendar Event II",
        courseId: course.id * 2,
        date: newDate.toISOString().split('T')[0],
        location: "zoom",
        isRemote: true,
      };      const response = await request.post(`${endpoint}/createEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when course ID is 0", async () => {
      const attributes = { 
        title: "Calendar Event II",
        courseId: 0,
        date: newDate.toISOString().split('T')[0],
        location: "zoom",
        isRemote: true,
      };      const response = await request.post(`${endpoint}/createEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when Course ID < 0", async () => {
      const attributes = { 
        title: "Calendar Event II",
        courseId: -course.id,
        date: newDate.toISOString().split('T')[0],
        location: "zoom",
        isRemote: true,
      };      const response = await request.post(`${endpoint}/createEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when date is a date now", async () => {
      const attributes = { 
        title: "Calendar Event II",
        courseId: course.id,
        date: new Date(Date.now()).toISOString().split('T')[0],
        location: "zoom",
        isRemote: true,
      };
      const response = await request.post(`${endpoint}/createEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when date is a date in the past", async () => {
      let pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 3);
      const attributes = { 
        title: "Calendar Event II",
        courseId: course.id,
        date: pastDate.toISOString().split('T')[0],
        location: "zoom",
        isRemote: true,
      };
      const response = await request.post(`${endpoint}/createEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when title is empty", async () => {
      const attributes = { 
        title: "",
        courseId: course.id,
        date: newDate.toISOString().split('T')[0],
        location: "zoom",
        isRemote: true,
      };      
      const response = await request.post(`${endpoint}/createEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when location is empty", async () => {
      const attributes = { 
        title: "Calendar Event II",
        courseId: course.id,
        date: newDate.toISOString().split('T')[0],
        location: "",
        isRemote: true,
      };
      const response = await request.post(`${endpoint}/createEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 202 with all valid parameters", async () => {
      const attributes = { 
        title: "Calendar Event II",
        courseId: course.id,
        date: newDate.toISOString().split('T')[0],
        location: "zoom",
        isRemote: true,
      };
      const response = await request.post(`${endpoint}/createEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(202);

      const calendarJSON = response.body.eventJSon;
      for(let i in calendarJSON) { 
        updateIds("calendarEvents", calendarJSON[i]);
        calendarEvents.push(calendarJSON[i]);
      }; 
      const firstCalendarEvent = prisma.calendarEvent.findUniqueOrThrow({ where: { courseId_date: {
        date: attributes.date,
        course: attributes.courseId,
      } } });
      expect(firstCalendarEvent).toBeDefined();
    });


  });

  describe(`Test POST: ${endpoint}/createRecurringEvent`, async () => {
    let courseDate = new Date();
    courseDate.setMonth(courseDate.getMonth() + 3);
    courseDate.setDate(courseDate.getDay() + 1);
    let secondCourseDate = new Date(courseDate);
    secondCourseDate.setMonth(courseDate.getMonth() + 1);

    it("Return 400 when no body is included", async () => {
      const attributes = {};
      const response = await request.post(`${endpoint}/$createRecurringEvent`).send(attributes);
      expect(response.status).toBe(400);
    });

    it("Return 401 when no authorization token is provided", async () => {
      const attributes = { 
        title: "Calendar Event III",
        courseId: course.id,
        begDate: courseDate.toISOString().split('T')[0],
        endDate: secondCourseDate.toISOString().split('T')[0],
        location: "zoom",
        isRemote: true,
        daysOfWeek: [
          weekday[courseDate.getDay()],
          weekday[(courseDate.getDay() + 2) % 7],
        ],
      };
      const response = await request.post(`${endpoint}/$createRecurringEvent`).send(attributes);
      expect(response.status).toBe(401);
    });

    it("Return 401 when authorization token is expired", async () => {
      const attributes = { 
        title: "Calendar Event III",
        courseId: course.id,
        begDate: courseDate.toISOString().split('T')[0],
        endDate: secondCourseDate.toISOString().split('T')[0],
        location: "zoom",
        isRemote: true,
        daysOfWeek: [
          weekday[courseDate.getDay()],
          weekday[(courseDate.getDay() + 2) % 7],
        ],
      };
      const response = await request.post(`${endpoint}/$createRecurringEvent`).send(attributes).set("Authorization", "Bearer " + instructor.expiredToken);
      expect(response.status).toBe(401);
    });

    it("Return 400 when course ID is invalid and nonzero", async () => {
      const attributes = { 
        title: "Calendar Event III",
        courseId: course.id * 2,
        begDate: courseDate.toISOString().split('T')[0],
        endDate: secondCourseDate.toISOString().split('T')[0],
        location: "zoom",
        isRemote: true,
        daysOfWeek: [
          weekday[courseDate.getDay()],
          weekday[(courseDate.getDay() + 2) % 7],
        ],
      };
      const response = await request.post(`${endpoint}/createRecurringEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when course ID is 0", async () => {
      const attributes = { 
        title: "Calendar Event III",
        courseId: 0,
        begDate: courseDate.toISOString().split('T')[0],
        endDate: secondCourseDate.toISOString().split('T')[0],
        location: "zoom",
        isRemote: true,
        daysOfWeek: [
          weekday[courseDate.getDay()],
          weekday[(courseDate.getDay() + 2) % 7],
        ],
      };      
      const response = await request.post(`${endpoint}/createRecurringEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when Course ID < 0", async () => {
      const attributes = { 
        title: "Calendar Event III",
        courseId: -course.id,
        begDate: courseDate.toISOString().split('T')[0],
        endDate: secondCourseDate.toISOString().split('T')[0],
        location: "zoom",
        isRemote: true,
        daysOfWeek: [
          weekday[courseDate.getDay()],
          weekday[(courseDate.getDay() + 2) % 7],
        ],
      };      
      const response = await request.post(`${endpoint}/createRecurringEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when begDate is a date now", async () => {
      const attributes = { 
        title: "Calendar Event III",
        courseId: course.id,
        begDate: courseDate.toISOString().split('T')[0],
        endDate: new Date(Date.now()).toISOString().split('T')[0],
        location: "zoom",
        isRemote: true,
        daysOfWeek: [
          weekday[courseDate.getDay()],
          weekday[(courseDate.getDay() + 2) % 7],
        ],
      };
      const response = await request.post(`${endpoint}/createRecurringEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when begDate is a date in the past", async () => {
      let pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 3);
      const attributes = { 
        title: "Calendar Event III",
        courseId: course.id,
        begDate: pastDate.toISOString().split('T')[0],
        endDate: secondCourseDate.toISOString().split('T')[0],
        location: "zoom",
        isRemote: true,
        daysOfWeek: [
          weekday[courseDate.getDay()],
          weekday[(courseDate.getDay() + 2) % 7],
        ],
      };
      const response = await request.post(`${endpoint}/createRecurringEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when endDate is a date now", async () => {
      const attributes = { 
        title: "Calendar Event III",
        courseId: course.id,
        begDate: courseDate.toISOString().split('T')[0],
        endDate: new Date(Date.now()).toISOString().split('T')[0],
        location: "zoom",
        isRemote: true,
        daysOfWeek: [
          weekday[courseDate.getDay()],
          weekday[(courseDate.getDay() + 2) % 7],
        ],
      };
      const response = await request.post(`${endpoint}/createRecurringEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when endDate is a date in the past", async () => {
      let pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 3);
      const attributes = { 
        title: "Calendar Event III",
        courseId: course.id,
        begDate: courseDate.toISOString().split('T')[0],
        endDate: pastDate.toISOString().split('T')[0],
        location: "zoom",
        isRemote: true,
        daysOfWeek: [
          weekday[courseDate.getDay()],
          weekday[(courseDate.getDay() + 2) % 7],
        ],
      };
      const response = await request.post(`${endpoint}/createRecurringEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when title is empty", async () => {
      const attributes = { 
        title: "",
        courseId: course.id,
        begDate: courseDate.toISOString().split('T')[0],
        endDate: secondCourseDate.toISOString().split('T')[0],
        location: "zoom",
        isRemote: true,
        daysOfWeek: [
          weekday[courseDate.getDay()],
          weekday[(courseDate.getDay() + 2) % 7],
        ],
      };      
      const response = await request.post(`${endpoint}/createRecurringEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when location is empty", async () => {
      const attributes = { 
        title: "Calendar Event III",
        courseId: course.id,
        begDate: courseDate.toISOString().split('T')[0],
        endDate: secondCourseDate.toISOString().split('T')[0],
        location: "",
        isRemote: true,
        daysOfWeek: [
          weekday[courseDate.getDay()],
          weekday[(courseDate.getDay() + 2) % 7],
        ],
      };      
      const response = await request.post(`${endpoint}/createRecurringEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when daysOfWeek is empty", async () => {
      const attributes = { 
        title: "Calendar Event III",
        courseId: course.id,
        begDate: courseDate.toISOString().split('T')[0],
        endDate: secondCourseDate.toISOString().split('T')[0],
        location: "zoom",
        isRemote: true,
        daysOfWeek: [],
      };      
      const response = await request.post(`${endpoint}/createRecurringEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 202 with all valid parameters", async () => {
      const attributes = { 
        title: "Calendar Event III",
        courseId: course.id,
        begDate: courseDate.toISOString().split('T')[0],
        endDate: secondCourseDate.toISOString().split('T')[0],
        location: "zoom",
        isRemote: true,
        daysOfWeek: [
          weekday[courseDate.getDay()],
          weekday[(courseDate.getDay() + 2) % 7],
        ],
      };
      const response = await request.post(`${endpoint}/createRecurringEvent`).send(attributes).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(202);

      const calendarJSON = response.body.eventJSon;
      for(let i in calendarJSON) { 
        updateIds("calendarEvents", calendarJSON[i]);
        calendarEvents.push(calendarJSON[i]);
      }; 
      const firstCalendarEvent = prisma.calendarEvent.findUniqueOrThrow({ where: { courseId_date: {
        date: attributes.begDate,
        course: attributes.courseId,
      } } });
      expect(firstCalendarEvent).toBeDefined();
    });
  });

  describe(`Test DELETE: ${endpoint}/deleteCourse/:courseId`, async () => {

    it("Return 401 when no authorization token is provided", async () => {
      const response = await request.delete(`${endpoint}/deleteCourse/${course.id}`);
      expect(response.status).toBe(401);
    });

    it("Return 401 when authorization token is expired", async () => {
      const response = await request.delete(`${endpoint}/deleteCourse/${course.id}`).set("Authorization", "Bearer " + instructor.expiredToken);
      expect(response.status).toBe(401);
    });

    it("Return 400 when invalid course id is provided", async () => {
      const response = await request.delete(`${endpoint}/deleteCourse/${-course.id}`).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 202 when course events are deleted", async () => {
      let response = await request.delete(`${endpoint}/deleteCourse/${course.id}`).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(202);
    });

    it("Return 200 when no body is included", async () => {
      let response = await request.delete(`${endpoint}/deleteCourse/${course.id}`).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(202);
    });
  });

  describe(`Test DELETE: ${endpoint}/deleteCourse/:courseId/date/:date`, async () => {
    it("Return 401 when no authorization token is provided", async () => {
      const response = await request.delete(`${endpoint}/deleteCourse/${course.id}/date/${calendarEvents[0].date}`);
      expect(response.status).toBe(401);
    });

    it("Return 401 when authorization token is expired", async () => {
      const response = await request.delete(`${endpoint}/deleteCourse/${course.id}/date/${calendarEvents[0].date}`).set("Authorization", "Bearer " + instructor.expiredToken);
      expect(response.status).toBe(401);
    });

    it("Return 400 when invalid course id is provided", async () => {
      const response = await request.delete(`${endpoint}/deleteCourse/${-course.id}/date/${calendarEvents[0].date}`).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(400);
    });

    it("Return 202 when course event is deleted", async () => {
      let response = await request.delete(`${endpoint}/deleteCourse/${course.id}/date/${calendarEvents[0].date}`).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(202);
    });

    it("Return 200 when no body is included", async () => {
      let response = await request.delete(`${endpoint}/deleteCourse/${course.id}/date/${calendarEvents[0].date}`).set("Authorization", "Bearer " + instructor.token);
      expect(response.status).toBe(202);
    });
  });

  describe(`Test GET: ${endpoint}/getAllEventsForCourse/:courseId`, async () => {
    it("Return 200 when no body is included", async () => {
      const response = await request.post(`${endpoint}/getAllEventsForCourse/${course.id}`).set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(202);
    });

    it("Return 401 when no authorization token is provided", async () => {
      const response = await request.get(`${endpoint}/getAllEventsForCourse/${course.id}`);
      expect(response.status).toBe(401);
    });

    it("Return 401 when authorization token is expired", async () => {
      const response = await request.get(`${endpoint}/getAllEventsForCourse/${course.id}`).set("Authorization", "Bearer " + students[0].expiredToken);
      expect(response.status).toBe(401);
    });

    it("Return 400 when invalid, nonzero course id is provided", async () => {
      const response = await request.get(`${endpoint}/getAllEventsForCourse/${course.id * 2}`).set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when course id = 0 is provided", async () => {
      const response = await request.get(`${endpoint}/getAllEventsForCourse/0`).set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when course id < 0 is provided", async () => {
      const response = await request.get(`${endpoint}/getAllEventsForCourse/-${course.id}`).set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });

    it("Return 403 when user is not in course", async () => {
      const response = await request.get(`${endpoint}/getAllEventsForCourse/${course.id}}`).set("Authorization", "Bearer " + students[2].token);
      expect(response.status).toBe(403);
    });

    it("Return 200 when no body is included", async () => {
      const response = await request.get(`${endpoint}/getAllEventsForCourse/${course.id}}`).set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(202);
    });

    it("Return 202 with all valid parameters", async () => {
      const response = await request.post(`${endpoint}/getAllEventsForCourse/${course.id}`).set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(202);

      const calendarJSON = response.body.eventJSon;
      for(let i in calendarJSON) { 
        updateIds("calendarEvents", calendarJSON[i]);
        calendarEvents.push(calendarJSON[i]);
      }; 
      const calendarEvent = await prisma.calendarEvent.findMany(
        { 
          where: { 
            courseId_date: {
              course: course.id,
            } 
          } 
        });
      expect(calendarEvent).toBeDefined();
    });

  });

  describe(`Test GET: ${endpoint}/getAllNotCancelledEventsForCourse/:courseId`, async () => {

    it("Return 401 when no authorization token is provided", async () => {
      const response = await request.get(`${endpoint}/getAllNotCancelledEventsForCourse/${course.id}`);
      expect(response.status).toBe(401);
    });

    it("Return 401 when authorization token is expired", async () => {
      const response = await request.get(`${endpoint}/getAllNotCancelledEventsForCourse/${course.id}`).set("Authorization", "Bearer " + students[0].expiredToken);
      expect(response.status).toBe(401);
    });

    it("Return 400 when invalid, nonzero course id is provided", async () => {
      const response = await request.get(`${endpoint}/getAllNotCancelledEventsForCourse/${course.id * 2}`).set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when course id = 0 is provided", async () => {
      const response = await request.get(`${endpoint}/getAllNotCancelledEventsForCourse/0`).set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when course id < 0 is provided", async () => {
      const response = await request.get(`${endpoint}/getAllNotCancelledEventsForCourse/-${course.id}`).set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });

    it("Return 403 when user is not in course", async () => {
      const response = await request.get(`${endpoint}/getAllNotCancelledEventsForCourse/${course.id}}`).set("Authorization", "Bearer " + students[2].token);
      expect(response.status).toBe(403);
    });

    it("Return 200 when no body is included", async () => {
      const response = await request.get(`${endpoint}/getAllNotCancelledEventsForCourse/${course.id}}`).set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(202);
    });

    it("Return 202 with all valid parameters", async () => {
      const response = await request.post(`${endpoint}/getAllNotCancelledEventsForCourse/${course.id}`).set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(202);

      const calendarJSON = response.body.eventJSon;
      for(let i in calendarJSON) { 
        updateIds("calendarEvents", calendarJSON[i]);
        calendarEvents.push(calendarJSON[i]);
      }; 
      const calendarEvent = await prisma.calendarEvent.findMany(
        { 
          where: { 
            courseId_date: {
              course: course.id,
            } 
          } 
        });
      expect(calendarEvent).toBeDefined();
    });

    it("Return 200 when no body is included", async () => {
      const response = await request.post(`${endpoint}/getAllNotCancelledEventsForCourse/${course.id}`).set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(202);
    });
  });

  describe(`Test GET: ${endpoint}/getAllCancelledEventsForCourse/:courseId`, async () => {

    it("Return 401 when no authorization token is provided", async () => {
      const response = await request.get(`${endpoint}/getAllCancelledEventsForCourse/${course.id}`);
      expect(response.status).toBe(401);
    });

    it("Return 401 when authorization token is expired", async () => {
      const response = await request.get(`${endpoint}/getAllCancelledEventsForCourse/${course.id}`).set("Authorization", "Bearer " + students[0].expiredToken);
      expect(response.status).toBe(401);
    });

    it("Return 400 when invalid, nonzero course id is provided", async () => {
      const response = await request.get(`${endpoint}/getAllCancelledEventsForCourse/${course.id * 2}`).set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when course id = 0 is provided", async () => {
      const response = await request.get(`${endpoint}/getAllCancelledEventsForCourse/0`).set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when course id < 0 is provided", async () => {
      const response = await request.get(`${endpoint}/getAllCancelledEventsForCourse/-${course.id}`).set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });

    it("Return 403 when user is not in course", async () => {
      const response = await request.get(`${endpoint}/getAllCancelledEventsForCourse/${course.id}}`).set("Authorization", "Bearer " + students[2].token);
      expect(response.status).toBe(403);
    });

    it("Return 200 when no body is included", async () => {
      const response = await request.get(`${endpoint}/getAllCancelledEventsForCourse/${course.id}}`).set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(202);
    });

    it("Return 202 with all valid parameters", async () => {
      const response = await request.post(`${endpoint}/getAllCancelledEventsForCourse/${course.id}`).set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(202);

      const calendarJSON = response.body.eventJSon;
      for(let i in calendarJSON) { 
        updateIds("calendarEvents", calendarJSON[i]);
        calendarEvents.push(calendarJSON[i]);
      }; 
      const calendarEvent = await prisma.calendarEvent.findMany(
        { 
          where: { 
            courseId_date: {
              course: course.id,
            } 
          } 
        });
      expect(calendarEvent).toBeDefined();
    });

    it("Return 200 when no body is included", async () => {
      const response = await request.post(`${endpoint}/getAllCancelledEventsForCourse/${course.id}`).set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(202);
    });

  });

  describe(`Test GET: ${endpoint}/getEventOnDay/:courseId/date/:date`, async () => {
    it("Return 401 when no authorization token is provided", async () => {
      const response = await request.get(`${endpoint}/getEventOnDay/${course.id}/date/${calendarEvents[0].date}`);
      expect(response.status).toBe(401);
    });

    it("Return 401 when authorization token is expired", async () => {
      const response = await request.get(`${endpoint}/getEventOnDay/${course.id}/date/${calendarEvents[0].date}`).set("Authorization", "Bearer " + students[0].expiredToken);
      expect(response.status).toBe(401);
    });

    it("Return 400 when invalid, nonzero course id is provided", async () => {
      const response = await request.get(`${endpoint}/getEventOnDay/${course.id * 2}/date/${calendarEvents[0].date}`).set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when course id = 0 is provided", async () => {
      const response = await request.get(`${endpoint}/getEventOnDay/0/date/${calendarEvents[0].date}`).set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });

    it("Return 400 when course id < 0 is provided", async () => {
      const response = await request.get(`${endpoint}/getEventOnDay/-${course.id}/date/${calendarEvents[0].date}`).set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(400);
    });

    it("Return 403 when user is not in course", async () => {
      const response = await request.get(`${endpoint}/getEventOnDay/${course.id}/date/${calendarEvents[0].date}`).set("Authorization", "Bearer " + students[2].token);
      expect(response.status).toBe(403);
    });

    it("Return 200 when no body is included", async () => {
      const response = await request.get(`${endpoint}/getEventOnDay/${course.id}/date/${calendarEvents[0].date}`).set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(202);
    });

    it("Return 202 with all valid parameters", async () => {
      const response = await request.post(`${endpoint}/getEventOnDay/${course.id}/date/${calendarEvents[0].date}`).set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(202);

      const calendarJSON = response.body.eventJSon;
      for(let i in calendarJSON) { 
        updateIds("calendarEvents", calendarJSON[i]);
        calendarEvents.push(calendarJSON[i]);
      }; 
      const calendarEvent = await prisma.calendarEvent.findMany(
        { 
          where: { 
            courseId_date: {
              course: course.id,
              date: calendarEvents[0].date,
            } 
          } 
        });
      expect(calendarEvent).toBeDefined();
    });

    it("Return 200 when no body is included", async () => {
      const response = await request.post(`${endpoint}/getEventOnDay/${course.id}/date/${calendarEvents[0].date}`).set("Authorization", "Bearer " + students[0].token);
      expect(response.status).toBe(202);
    });

  });

  afterAll(async() => {
    await teardown();
  });

});