import prisma from "../../prisma/client.js";
import { StatusCodes } from "http-status-codes";
import validate from "../util/checkValidation.js";
import sendEmail from "../util/notificationUtil.js";
import { Role } from "@prisma/client";
import { generateCalendar } from "../util/icalHelpers.js";
import { factory } from "../util/debug.js";
import { hashPassword } from "../util/password.js";
import { createToken } from "../util/token.js";

const debug = factory(import.meta.url);

export const create = async (req, res) => {
  debug("creating account...");
  if (validate(req, res)) {
    return res;
  }
  const { email, username, password, firstName, lastName } = req.body;
  const hashedPassword = hashPassword(password);
  await prisma.account.create({
    data: {
      email,
      userName: username,
      hashedPassword,
      firstName: firstName,
      lastName: lastName,
    },
  });
  const account = await prisma.account.findUnique({
    where: {
      email,
    },
  });
  debug("account created...");

  debug("sending account creation email...");
  const donotreply = "--- Do not reply to this email ---";
  const text = "Congrats on creating your Hourly account!";
  const emailBody =
    donotreply +
    "\n\n" +
    "Dear " +
    account.firstName +
    " " +
    account.lastName +
    ",\n\n" +
    text +
    "\n\n" +
    "Thanks,\n" +
    "The Hourly Team" +
    "\n\n" +
    donotreply;

  await sendEmail({
    email: email,
    subject: "Hourly Account Creation",
    text: emailBody,
    html: "<p> " + emailBody + " </p>",
  });
  debug("account creation email sent...");
  const {
    hashedPassword: hashedPassword2,
    createdAt,
    updatedAt,
    token: storedToken,
    ...userInfo
  } = account;
  const token = createToken({ user: { ...userInfo } });
  return res.status(StatusCodes.CREATED).json({ token, account });
};

export const login = async (req, res) => {
  debug("logging in...");
  if (validate(req, res)) {
    return res;
  }
  const { email } = req.body;
  const account = await prisma.account.findUnique({
    where: {
      email,
    },
  });
  debug("logged in...");
  return res.status(StatusCodes.ACCEPTED).json({ account });
};

export const getCourses = async (req, res) => {
  debug("retrieving all courses...");
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
      isArchived: false,
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
  debug("courses retrieved...");
  return res.status(StatusCodes.ACCEPTED).json({
    student: studentCourses,
    staff: staffCourses,
    instructor: instructorCourses,
  });
};

export const deleteAccount = async (req, res) => {
  debug("deleting account...");
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
    include: {
      hosts: true,
      course: true,
    },
  });
  let deleteOH = [];
  let courseDeletedOH = [];
  officeHours.forEach((officeHour) => {
    if (officeHour.hosts.length === 1) {
      deleteOH.push(officeHour.id);
      courseDeletedOH.push(officeHour.course.id);
    }
  });
  await prisma.registration.deleteMany({
    where: {
      officeHourId: {
        in: deleteOH,
      },
    },
  });
  await prisma.officeHour.deleteMany({
    where: {
      id: {
        in: deleteOH,
      },
    },
  });
  courseDeletedOH.forEach(async (id) => {
    await generateCalendar(id);
  });
  const courses = await prisma.course.findMany({
    where: {
      instructors: {
        some: {
          id,
        },
      },
    },
    include: {
      instructors: true,
    },
  });
  let deleteCourse = [];
  courses.forEach((course) => {
    if (course.instructors.length === 1) {
      deleteCourse.push(course.id);
    }
  });
  await prisma.topic.deleteMany({
    where: {
      courseId: {
        in: deleteCourse,
      },
    },
  });
  await prisma.officeHourTimeOptions.deleteMany({
    where: {
      courseId: {
        in: deleteCourse,
      },
    },
  });
  await prisma.officeHour.deleteMany({
    where: {
      courseId: {
        in: deleteCourse,
      },
    },
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
  debug("account deleted...");
  debug("sending account deletion email...");
  const donotreply = "--- Do not reply to this email ---";
  const text =
    "Your Hourly account has been succeesfully deleted. All of your associated data has been removed";
  const emailBody =
    donotreply +
    "\n\n" +
    "Dear " +
    account.firstName +
    " " +
    account.lastName +
    ",\n\n" +
    text +
    "\n\n" +
    "Thanks,\n" +
    "The Hourly Team" +
    "\n\n" +
    donotreply;
  await sendEmail({
    email: account.email,
    subject: "Hourly Account Deletion",
    text: emailBody,
    html: "<p> " + emailBody + " </p>",
  });
  debug("account deletion email sent...");
  return res.status(StatusCodes.ACCEPTED).json({ msg: "Account deleted!" });
};

export const getAll = async (req, res) => {
  debug("retrieving all account...");
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
  debug("accounts retrieved...");
  return res.status(StatusCodes.ACCEPTED).json({ accounts });
};

export const promoteToAdmin = async (req, res) => {
  debug("promoting to admin...");
  const id = parseInt(req.params.id, 10);
  const account = await prisma.account.update({
    where: {
      id,
    },
    data: {
      role: Role.Admin,
    },
  });
  debug("promoted to admin...");
  return res.status(StatusCodes.ACCEPTED).json(account);
};
