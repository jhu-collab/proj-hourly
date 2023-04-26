import { defineConfig } from "cypress";
import prisma from "../server/prisma/client.js";
import registerCodeCoverageTasks from "@cypress/code-coverage/task.js";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      registerCodeCoverageTasks(on, config);
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
          if (!course) {
            return null;
          }
          await prisma.officeHour.deleteMany({
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
        async deleteStudentCourses(userName) {
          await prisma.account.update({
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
          const user = await prisma.account.findUnique({
            where: {
              userName: userName,
            },
            include: {
              instructorCourses: true,
            },
          });
          if (!user) {
            return null;
          }
          for (const c of user.instructorCourses) {
            console.log(c);
            await prisma.officeHourTimeOptions.deleteMany({
              where: { courseId: c.id },
            });
            await prisma.topic.deleteMany({
              where: { courseId: c.id },
            });
            await prisma.course.delete({ where: { id: c.id } });
          }
          await prisma.account.update({
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
        async getCourseByNumber(number) {
          const course = await prisma.course.findFirst({
            where: {
              courseNumber: number,
            },
          });
          return course;
        },
      });
      return config;
    },
    experimentalRunAllSpecs: true,
  },
});
