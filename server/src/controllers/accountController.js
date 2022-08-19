import prisma from "../../prisma/client.js";
import { StatusCodes } from "http-status-codes";
import validate from "../util/checkValidation.js";
import * as hash from "../util/hash.js";
import * as tokenJS from "../util/token.js";

export const create = async (req, res) => {
  validate(req);
  const { email, name, phoneNumber, password } = req.body;
  const hashPassword = await hash.hash(password);
  if (phoneNumber === null || phoneNumber === undefined) {
    await prisma.Account.create({
      data: {
        email: email.toLowerCase(),
        userName: name,
        password: hashPassword,
      },
    });
  } else {
    await prisma.Account.create({
      data: {
        email: email.toLowerCase(),
        userName: name,
        phoneNumber,
        password: hashPassword,
      },
    });
  }

  const account = await prisma.Account.findUnique({
    where: {
      email,
    },
  });
  return res.status(StatusCodes.CREATED).json({ account });
};

export const login = async (req, res) => {
  validate(req);
  const { email } = req.body;
  const account = await prisma.Account.findUnique({
    where: {
      email: email.toLowerCase(),
    },
  });
  tokenJS.createToken(account, "5 days", (err, token) => {
    if (err) throw err;
    return res.status(StatusCodes.ACCEPTED).json({ account, token });
  });
};

export const getCourses = async (req, res) => {
  validate(req);
  const id = parseInt(req.get("id"), 10);
  const studentCourses = await prisma.course.findMany({
    where: {
      students: {
        some: {
          id,
        },
      },
    },
  });
  studentCourses.forEach((course) => {
    delete course["code"];
  });
  const staffCourses = await prisma.course.findMany({
    where: {
      courseStaff: {
        some: {
          id,
        },
      },
    },
  });
  const instructorCourses = await prisma.course.findMany({
    where: {
      instructors: {
        some: {
          id,
        },
      },
    },
  });
  return res.status(StatusCodes.ACCEPTED).json({
    student: studentCourses,
    staff: staffCourses,
    instructor: instructorCourses,
  });
};

export const deleteAccount = async (req, res) => {
  validate(req);
  const id = parseInt(req.get("id"), 10);
  await prisma.registration.deleteMany({
    where: {
      accountId: id,
    },
  });
  const officeHours = await prisma.officeHour.findMany({
    where: {
      hosts: {
        some: {
          id,
        },
      },
    },
  });
  let deleteOH = [];
  officeHours.forEach(async (officeHour) => {
    if (officeHour.hosts.length === 1) {
      deleteOH.push(officeHour.id);
    }
  });
  await prisma.officeHour.deleteMany({
    where: {
      id: {
        in: deleteOH,
      },
    },
  });
  const courses = await prisma.course.findMany({
    where: {
      instructors: {
        some: {
          id,
        },
      },
    },
  });
  let deleteCourse = [];
  courses.forEach(async (course) => {
    if (course.instructors.length === 1) {
      deleteCourse.push(course.id);
    }
  });
  await prisma.course.deleteMany({
    where: {
      id: {
        in: deleteCourse,
      },
    },
  });
  await prisma.account.delete({
    where: {
      id,
    },
  });
  return res.status(StatusCodes.ACCEPTED).json({ msg: "Account deleted!" });
};
