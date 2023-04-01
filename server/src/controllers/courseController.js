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
  await prisma.OfficeHourTimeOptions.create({
    data: {
      title: "Default",
      duration: 10,
      course: {
        connect: {
          id: course.id,
        },
      },
    },
  });
  const donotreply = "--- Do not reply to this email ---";
  const text =
    donotreply +
    "\n\n" +
    "Dear " +
    account.firstName +
    " " +
    account.lastName +
    " your course " +
    title +
    " was created. Give this code, " +
    code +
    ", to your students to join the course with.\n\n" +
    "Sincerely,\n" +
    "Hourly Team" +
    "\n\n" +
    donotreply;
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
  const { code } = req.body;
  const id = req.id;
  const course = await prisma.Course.findUnique({
    where: {
      code: code.toUpperCase(),
    },
    include: {
      instructors: true,
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
  let instructors = "";
  let counter = 0;

  course.instructors.forEach((instructor) => {
    instructors += instructor.firstName + " " + instructor.lastName;
    if (course.instructors.length === 1) {
      return;
    } else if (counter !== course.instructors.length - 1) {
      instructors += ", ";
    }
    counter += 1;
  });

  const userEmail = updateAccount.email;
  const subject =
    "Successfully registered for " +
    course.title +
    " in " +
    course.semester +
    " " +
    course.calendarYear +
    "!";
  const donotreply = "--- Do not reply to this email ---";
  const emailBody =
    donotreply +
    "\n\n" +
    "Dear " +
    updateAccount.firstName +
    " " +
    updateAccount.lastName +
    ",\n\n" +
    "You have successfully  registered for " +
    course.courseNumber +
    ": " +
    course.title +
    " in " +
    course.semester +
    " " +
    course.calendarYear +
    "!" +
    "\n\n" +
    "See you in class!" +
    "\n\n" +
    "Your instructors, \n" +
    instructors +
    "\n\n" +
    donotreply;

  let emailReq = {
    email: userEmail,
    subject: subject,
    text: emailBody,
  };
  sendEmail(emailReq);
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
      isCancelled: false,
      isCancelledStaff: false,
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
  course.instructors.forEach((instructor) => {
    delete instructor["hashedPassword"];
    delete instructor["token"];
  });
  course.courseStaff.forEach((staff) => {
    delete staff["hashedPassword"];
    delete staff["token"];
  });
  course.students.forEach((student) => {
    delete student["hashedPassword"];
    delete student["token"];
  });
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
  curCourse.instructors.forEach((instructor) => {
    delete instructor["hashedPassword"];
    delete instructor["token"];
  });
  curCourse.courseStaff.forEach((staff) => {
    delete staff["hashedPassword"];
    delete staff["token"];
  });
  curCourse.students.forEach((student) => {
    delete student["hashedPassword"];
    delete student["token"];
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
      include: {
        topics: true,
        account: {
          select: {
            id: true,
            userName: true,
            email: true,
            firstName: true,
            lastName: true,
            preferredName: true,
          },
        },
        officeHour: {
          select: {
            hosts: {
              select: {
                id: true,
                userName: true,
                email: true,
                firstName: true,
                lastName: true,
                preferredName: true,
              },
            },
          },
        },
      },
    });
  } else if (role === "Instructor") {
    registrations = await prisma.registration.findMany({
      where: {
        officeHour: {
          courseId,
        },
        isCancelled: false,
        isCancelledStaff: false,
      },
      include: {
        topics: true,
        account: {
          select: {
            id: true,
            userName: true,
            email: true,
            firstName: true,
            lastName: true,
            preferredName: true,
          },
        },
        officeHour: {
          select: {
            hosts: {
              select: {
                id: true,
                userName: true,
                email: true,
                firstName: true,
                lastName: true,
                preferredName: true,
              },
            },
          },
        },
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
      include: {
        topics: true,
        account: {
          select: {
            id: true,
            userName: true,
            email: true,
            firstName: true,
            lastName: true,
            preferredName: true,
          },
        },
        officeHour: {
          select: {
            hosts: {
              select: {
                id: true,
                userName: true,
                email: true,
                firstName: true,
                lastName: true,
                preferredName: true,
              },
            },
          },
        },
      },
    });
  }
  const OfficeHourTimeOptions = await prisma.officeHourTimeOptions.findMany({
    where: {
      courseId,
    },
  });
  registrations.forEach((registration) => {
    let endTime = registration.endTime;
    if (registration.endTime < registration.startTime) {
      endTime.setUTCDate(endTime.getUTCDate() + 1);
    }
    const duration =
      (endTime.getTime() - registration.startTime.getTime()) / (1000 * 60);
    OfficeHourTimeOptions.forEach((option) => {
      if (duration == option.duration) {
        registration.type = option.title;
      }
    });
  });
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
  const officeHour = await prisma.officeHour.findMany({
    where: {
      courseId: id,
    },
  });
  let officeHourIds = [];
  officeHour.forEach((oh) => {
    officeHourIds.push(oh.id);
  });
  await prisma.registration.deleteMany({
    where: {
      officeHourId: {
        in: officeHourIds,
      },
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
  await prisma.officeHourTimeOptions.deleteMany({
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

export const createTimeLength = async (req, res) => {
  if (validate(req, res)) {
    return res;
  }
  const id = parseInt(req.params.courseId, 10);
  const { length, title } = req.body;
  const time = await prisma.OfficeHourTimeOptions.create({
    data: {
      title,
      duration: length,
      course: {
        connect: {
          id,
        },
      },
    },
  });
  return res.status(StatusCodes.ACCEPTED).json({ time });
};

export const getTimeLengths = async (req, res) => {
  const id = parseInt(req.params.courseId, 10);
  const times = await prisma.OfficeHourTimeOptions.findMany({
    where: {
      courseId: id,
    },
  });
  return res.status(StatusCodes.ACCEPTED).json({ times });
};

export const editTimeLength = async (req, res) => {
  const { length, title } = req.body;
  const id = parseInt(req.params.id, 10);
  const time = await prisma.OfficeHourTimeOptions.update({
    where: {
      id,
    },
    data: {
      title,
      duration: length,
    },
  });
  return res.status(StatusCodes.ACCEPTED).json({ time });
};

export const deleteTimeLength = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const time = await prisma.OfficeHourTimeOptions.delete({
    where: {
      id,
    },
  });
  return res.status(StatusCodes.ACCEPTED).json({ deletedTime: time });
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

export const editTopic = async (req, res) => {
  const { topicId, value } = req.body;
  const topic = await prisma.topic.update({
    where: {
      id: topicId,
    },
    data: {
      value,
    },
  });
  return res.status(StatusCodes.ACCEPTED).json(topic);
};

export const deleteTopic = async (req, res) => {
  const topicId = parseInt(req.params.topicId, 10);
  const topic = await prisma.topic.delete({
    where: {
      id: topicId,
    },
  });
  return res.status(StatusCodes.ACCEPTED).json(topic);
};

export const getTopics = async (req, res) => {
  const courseId = parseInt(req.params.courseId, 10);
  const topics = await prisma.topic.findMany({
    where: {
      courseId,
    },
  });
  return res.status(StatusCodes.ACCEPTED).json(topics);
};

export const getRoleInCourseParams = async (req, res) => {
  if (validate(req, res)) {
    return res;
  }
  const courseId = parseInt(req.params.courseId, 10);
  const id = parseInt(req.params.id, 10);
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
  course.instructors.forEach((instructor) => {
    delete instructor["hashedPassword"];
    delete instructor["token"];
  });
  course.courseStaff.forEach((staff) => {
    delete staff["hashedPassword"];
    delete staff["token"];
  });
  course.students.forEach((student) => {
    delete student["hashedPassword"];
    delete student["token"];
  });
  return res.status(StatusCodes.ACCEPTED).json({
    role,
    course,
  });
};

export const updateRegistrationConstraints = async (req, res) => {
  const { start, end } = req.body;
  const id = parseInt(req.params.courseId, 10);
  const course = await prisma.course.update({
    where: {
      id,
    },
    data: {
      startRegConstraint: start,
      endRegConstraint: end,
    },
  });
  return res.status(StatusCodes.ACCEPTED).json({ course });
};
