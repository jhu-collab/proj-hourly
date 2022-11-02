import prisma from "../../prisma/client.js";
import { StatusCodes } from "http-status-codes";
import validate from "../util/checkValidation.js";
import ical from "ical-generator";
import { generateCalendar } from "../util/icalHelpers.js";
import sendEmail from "../util/notificationUtil.js";

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
  if (validate(req, res)) {
    return res;
  }
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
  const { title, number, semester, year } = req.body;
  const id = req.id;
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
  const account = await prisma.account.findUnique({
    where: {
      id,
    },
  });
  const text =
    account.userName +
    " your course " +
    title +
    " was created. Give this code, " +
    code +
    ", to your students to join the course with.";
  await sendEmail({
    email: account.email,
    subject: title + " Created!",
    text,
    html: "<p> " + text + " <p/>",
  });
  return res.status(StatusCodes.CREATED).json({ course });
};

export const register = async (req, res) => {
  if (validate(req, res)) {
    return res;
  }
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
  if (validate(req, res)) {
    return res;
  }
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
  if (validate(req, res)) {
    return res;
  }
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
  if (validate(req, res)) {
    return res;
  }
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
  if (validate(req, res)) {
    return res;
  }
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
  const officeHours = await prisma.officeHour.findMany({
    where: {
      courseId,
      hosts: {
        some: {
          id,
        },
      },
    },
  });
  const officeHourIds = [];
  officeHours.forEach((officeHour) =>
    officeHourIds.push({ id: officeHour.id })
  );
  await prisma.account.update({
    where: {
      id,
    },
    data: {
      isHosting: {
        disconnect: officeHourIds,
      },
    },
  });
  await prisma.officeHour.deleteMany({
    where: {
      courseId,
      hosts: {
        none: {},
      },
    },
  });
  await generateCalendar(course.id);
  return res.status(StatusCodes.ACCEPTED).json({ course });
};

export const removeStudent = async (req, res) => {
  if (validate(req, res)) {
    return res;
  }
  const courseId = parseInt(req.params.courseId, 10);
  const id = parseInt(req.params.studentId, 10);
  const course = await prisma.course.update({
    where: {
      id: courseId,
    },
    data: {
      students: {
        disconnect: {
          id,
        },
      },
    },
  });
  await prisma.registration.deleteMany({
    where: {
      accountId: id,
      officeHour: {
        courseId,
      },
    },
  });
  return res.status(StatusCodes.ACCEPTED).json({ course });
};

export const leaveCourse = async (req, res) => {
  if (validate(req, res)) {
    return res;
  }
  const courseId = parseInt(req.params.courseId, 10);
  const accountId = req.id;
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
  await prisma.registration.deleteMany({
    where: {
      accountId: accountId,
      officeHour: {
        courseId,
      },
    },
  });
  return res.status(StatusCodes.ACCEPTED).json({ course });
};

export const getCourse = async (req, res) => {
  if (validate(req, res)) {
    return res;
  }
  const courseId = parseInt(req.params.courseId, 10);
  const accountId = req.id;
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
  if (validate(req, res)) {
    return res;
  }
  const courseId = parseInt(req.params.courseId, 10);
  const id = req.id;
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
  if (validate(req, res)) {
    return res;
  }
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

export const getAllRegistrations = async (req, res) => {
  if (validate(req, res)) {
    return res;
  }
  const courseId = parseInt(req.params.courseId, 10);
  const id = req.id;
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
  let registrations = [];
  if (role === "Student") {
    registrations = await prisma.registration.findMany({
      where: {
        accountId: id,
        officeHour: {
          courseId,
        },
        isCancelled: false,
        isCancelledStaff: false,
      },
    });
  } else {
    registrations = await prisma.registration.findMany({
      where: {
        officeHour: {
          courseId,
          hosts: {
            some: {
              id,
            },
          },
        },
        isCancelled: false,
        isCancelledStaff: false,
      },
    });
  }
  return res.status(StatusCodes.ACCEPTED).json({ registrations });
};

export const addInstructor = async (req, res) => {
  validate(req);
  const courseId = parseInt(req.params.courseId, 10);
  const id = parseInt(req.get("id"), 10);
  const prevCourse = await prisma.course.findFirst({
    where: {
      id: courseId,
    },
    select: {
      instructors: true,
    },
  });
  const instructorIds = prevCourse.instructors.map((instructor) => ({
    id: instructor.id,
  }));
  const allInstructors = [...instructorIds, { id: id }];
  const course = await prisma.course.update({
    where: {
      id: courseId,
    },
    data: {
      instructors: {
        set: allInstructors,
      },
    },
  });
  return res.status(StatusCodes.ACCEPTED).json({ course });
};

export const deleteCourse = async (req, res) => {
  const id = parseInt(req.params.courseId, 10);
  await prisma.registration.deleteMany({
    where: {
      courseId: id,
    },
  });
  await prisma.topic.deleteMany({
    where: {
      courseId: id,
    },
  });
  await prisma.officeHour.deleteMany({
    where: {
      courseId: id,
    },
  });
  const course = await prisma.course.delete({
    where: {
      id,
    },
  });
  return res.status(StatusCodes.ACCEPTED).json({ deletedCourse: course });
};

export const promote = async (req, res) => {
  const id = req.body.studentId;
  const role = req.body.role;
  const courseId = parseInt(req.params.courseId, 10);
  let account;
  if (role === "Instructor" && req.currentRole === "Student") {
    account = await prisma.account.update({
      where: {
        id,
      },
      data: {
        studentCourses: {
          disconnect: {
            id: courseId,
          },
        },
        instructorCourses: {
          connect: {
            id: courseId,
          },
        },
      },
    });
  } else if (role === "Instructor" && req.currentRole === "Staff") {
    account = await prisma.account.update({
      where: {
        id,
      },
      data: {
        staffCourses: {
          disconnect: {
            id: courseId,
          },
        },
        instructorCourses: {
          connect: {
            id: courseId,
          },
        },
      },
    });
  } else {
    account = await prisma.account.update({
      where: {
        id,
      },
      data: {
        studentCourses: {
          disconnect: {
            id: courseId,
          },
        },
        staffCourses: {
          connect: {
            id: courseId,
          },
        },
      },
    });
  }
  return res
    .status(StatusCodes.ACCEPTED)
    .json({ ...account, newRole: role, oldRole: req.currentRole });
};

export const demote = async (req, res) => {
  const id = req.body.studentId;
  const role = req.body.role;
  const courseId = parseInt(req.params.courseId, 10);
  let account;
  if (role === "Student" && req.currentRole === "Staff") {
    account = await prisma.account.update({
      where: {
        id,
      },
      data: {
        studentCourses: {
          connect: {
            id: courseId,
          },
        },
        staffCourses: {
          disconnect: {
            id: courseId,
          },
        },
      },
    });
  }
  return res
    .status(StatusCodes.ACCEPTED)
    .json({ ...account, newRole: role, oldRole: req.currentRole });
};
