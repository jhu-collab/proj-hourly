import prisma from "../../prisma/client.js";
import { StatusCodes } from "http-status-codes";
import validate from "../util/checkValidation.js";
import ical from "ical-generator";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";

function makeCourseCode() {
  let result = "";
  const alphabetLen = alphabet.length;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < 6; i++) {
    result += alphabet.charAt(Math.floor(Math.random() * alphabetLen));
  }
  return result;
}

export const create = async (req, res) => {
  validate(req);
  let code = "";
  let codeIsUnique = false;
  while (!codeIsUnique) {
    code = makeCourseCode();
    // eslint-disable-next-line no-await-in-loop
    const matchingCourse = await prisma.Course.findFirst({
      where: {
        code,
      },
    });
    if (matchingCourse === null) {
      codeIsUnique = true;
    }
  }
  const { title, number, semester, year, id } = req.body;
  const cal = ical({ name: title });
  await prisma.Course.create({
    data: {
      title,
      courseNumber: number,
      semester,
      calendarYear: year,
      code,
      instructors: {
        connect: {
          id,
        },
      },
      iCalJson: cal.toJSON(),
    },
  });
  const course = await prisma.Course.findUnique({
    where: {
      code,
    },
  });
  return res.status(StatusCodes.CREATED).json({ course });
};

export const register = async (req, res) => {
  validate(req);
  const { code, id } = req.body;
  const course = await prisma.Course.findUnique({
    where: {
      code,
    },
  });
  const updateAccount = await prisma.account.update({
    where: {
      id,
    },
    data: {
      studentCourses: {
        connect: {
          id: course.id,
        },
      },
    },
  });
  return res.status(StatusCodes.ACCEPTED).json({ course });
};

export const getTopicCounts = async (req, res) => {
  const id = parseInt(req.params.courseId, 10);
  const counts = await prisma.topic.findMany({
    where: {
      courseId: id,
    },
    include: {
      _count: {
        select: {
          registrations: true,
        },
      },
    },
  });
  return res.status(StatusCodes.ACCEPTED).json({ counts });
};

export const createTopic = async (req, res) => {
  const { value, courseId } = req.body;
  const topic = await prisma.topic.create({
    data: {
      courseId,
      value,
    },
  });
  return res.status(StatusCodes.ACCEPTED).json({ topic });
};

export const getRegistrationStudentCounts = async (req, res) => {
  const id = parseInt(req.params.courseId, 10);
  const registrationsList = await prisma.registration.groupBy({
    by: ["accountId"],
    where: {
      officeHour: {
        courseId: id,
      },
    },
    _count: {
      id: true,
    },
    orderBy: {
      accountId: "desc",
    },
  });
  const accounts = await prisma.account.findMany({
    where: {
      studentCourses: {
        some: {
          id,
        },
      },
    },
    orderBy: {
      id: "desc",
    },
  });
  let count = 0;
  const countsAndAccount = accounts.map((account, index) => {
    if (
      registrationsList[index - count] !== undefined &&
      registrationsList[index - count].accountId === account.id
    ) {
      return {
        ...account,
        numRegistrations: registrationsList[index - count]._count.id,
      };
    }
    count += 1;
    return {
      ...account,
      numRegistrations: 0,
    };
  });
  return res.status(StatusCodes.ACCEPTED).json({ countsAndAccount });
};

export const removeStaff = async (req, res) => {
  validate(req);
  const courseId = parseInt(req.params.courseId, 10);
  const id = parseInt(req.params.staffId, 10);
  const course = await prisma.course.update({
    where: {
      id: courseId,
    },
    data: {
      courseStaff: {
        disconnect: {
          id,
        },
      },
    },
  });
  await prisma.officeHour.update({
    where: {
      courseId,
    },
    data: {
      hosts: {
        disconnect: {
          id,
        },
      },
    },
  });
  await prisma.officeHour.delete({
    where: {
      courseId,
      hosts: {
        none: {},
      },
    },
  });
  return res.status(StatusCodes.ACCEPTED).json({ course });
};

export const leaveCourse = async (req, res) => {
  validate(req);
  const courseId = parseInt(req.params.courseId, 10);
  const accountId = parseInt(req.get("id"), 10);
  const course = await prisma.course.update({
    where: {
      id: courseId,
    },
    data: {
      students: {
        disconnect: {
          id: accountId,
        },
      },
    },
  });
  return res.status(StatusCodes.ACCEPTED).json({ course });
};

export const getCourse = async (req, res) => {
  validate(req);
  const courseId = parseInt(req.params.courseId, 10);
  const accountId = parseInt(req.get("id"), 10);
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      instructors: {
        where: {
          id: accountId,
        },
      },
      courseStaff: {
        where: {
          id: accountId,
        },
      },
    },
  });
  if (course.instructors.length === 0 && course.courseStaff.length === 0) {
    delete course["code"];
  }
  delete course["instructors"];
  delete course["courseStaff"];
  return res.status(StatusCodes.ACCEPTED).json({ course });
};

export const getRoleInCourse = async (req, res) => {
  const courseId = parseInt(req.params.courseId, 10);
  const id = parseInt(req.get("id"), 10);
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      instructors: {
        where: {
          id,
        },
      },
      courseStaff: {
        where: {
          id,
        },
      },
      students: {
        where: {
          id,
        },
      },
    },
  });
  const role =
    course.instructors.length === 1
      ? "Instructor"
      : course.courseStaff.length === 1
      ? "Staff"
      : "Student";
  if (role === "Student") {
    delete course["code"];
  }
  return res.status(StatusCodes.ACCEPTED).json({
    role,
    course,
  });
};

export const getRoster = async (req, res) => {
  validate(req);
  const courseId = parseInt(req.params.courseId, 10);
  const curCourse = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      instructors: true,
      students: true,
      courseStaff: true,
    },
  });
  return res.status(StatusCodes.ACCEPTED).json({
    instructors: curCourse.instructors,
    staff: curCourse.courseStaff,
    students: curCourse.students,
  });
};