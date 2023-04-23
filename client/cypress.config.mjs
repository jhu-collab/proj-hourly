import { defineConfig } from "cypress";
import prisma from "../server/prisma/client.js";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on("task", {
        async removeOH() {
          await prisma.officeHour.deleteMany();
          return null;
        },
        async deleteCourse(code) {
          const course = await prisma.course.findUnique({
            where: {
              code: code,
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
