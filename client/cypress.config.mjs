import { defineConfig } from "cypress";
import prisma from "../server/prisma/client.js";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on("task", {
        async removeOH(courseCode) {
          const course = await prisma.course.findUnique({
            where: {
              code: courseCode,
            },
            include: {
              officeHours: true,
            },
          });
          await prisma.OfficeHour.deleteMany({
            where: {
              courseId: course.id,
            },
          });
          await prisma.course.update({
            where: {
              code: courseCode,
            },
            data: {
              officeHours: {
                set: [],
              },
              iCalJson: {
                set: [],
              },
            },
          });
          const c = await prisma.course.findUnique({
            where: {
              code: courseCode,
            },
          });
          return null;
        },
        async deleteCourse(courseCode) {
          const course = await prisma.course.findUnique({
            where: {
              code: courseCode,
            },
          });
          if (!course) {
            console.log("is null");
            return null;
          }
          const courseId = course.id;
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
          await prisma.course.delete({
            where: {
              id: courseId,
            },
          });
          return null;
        },
        async deleteStudentCourses(userName) {
          await prisma.Account.update({
            where: {
              userName: userName,
            },
            data: {
              studentCourses: {
                set: [],
              },
            },
          });
          return null;
        },
        async deleteInstructorCourses(userName) {
          await prisma.Account.update({
            where: {
              userName: userName,
            },
            data: {
              instructorCourses: {
                set: [],
              },
            },
          });
          return null;
        },
        async getCourseByCode(code) {
          const course = await prisma.course.findUnique({
            where: {
              code: code,
            },
          });
          return course;
        },
      });
    },
  },
});
