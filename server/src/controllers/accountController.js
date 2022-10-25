import prisma from "../../prisma/client.js";
import { StatusCodes } from "http-status-codes";
import validate from "../util/checkValidation.js";
import sendEmail from "../util/notificationUtil.js";

export const create = async (req, res) => {
  if (validate(req, res)) {
    return res;
  }
  const { email, name, phoneNumber } = req.body;
  if (phoneNumber === null || phoneNumber === undefined) {
    await prisma.Account.create({
      data: {
        email,
        userName: name,
      },
    });
  } else {
    await prisma.Account.create({
      data: {
        email,
        userName: name,
        phoneNumber,
      },
    });
  }

  const account = await prisma.Account.findUnique({
    where: {
      email,
    },
  });
  const text = account.userName + " congrats on creating your Hourly account!";
  await sendEmail({
    email,
    subject: "Hourly Account Creation",
    text,
    html: "<p> " + text + " </p>",
  });
  return res.status(StatusCodes.CREATED).json({ account });
};

export const login = async (req, res) => {
  if (validate(req, res)) {
    return res;
  }
  const { email } = req.body;
  const account = await prisma.Account.findUnique({
    where: {
      email,
    },
  });
  return res.status(StatusCodes.ACCEPTED).json({ account });
};

export const getCourses = async (req, res) => {
  if (validate(req, res)) {
    return res;
  }
  const id = req.id;
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
  if (validate(req, res)) {
    return res;
  }
  const id = req.id;
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
  const account = await prisma.account.findUnique({
    where: {
      id,
    },
  });
  await prisma.account.delete({
    where: {
      id,
    },
  });
  const text =
    account.userName +
    " your Hourly account has been succeesfully deleted. All of your associated data has been removed";
  await sendEmail({
    email: account.email,
    subject: "Hourly Account Deletion",
    text: text,
    html: "<p> " + text + " </p>",
  });
  return res.status(StatusCodes.ACCEPTED).json({ msg: "Account deleted!" });
};

export const getAll = async (req, res) => {
  const accounts = await prisma.account.findMany({
    select: {
      id: true,
      userName: true,
      email: true,
      firstName: true,
      lastName: true,
      preferredName: true,
      role: true,
    },
  });
  return res.status(StatusCodes.ACCEPTED).json({ accounts });
};
