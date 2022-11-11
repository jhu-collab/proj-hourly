import prisma from "../../prisma/client.js";
import { StatusCodes } from "http-status-codes";

export const isUniqueCourse = async (req, res, next) => {
  const { title, number, semester, year } = req.body;
  const query = await prisma.course.findFirst({
    where: {
      title,
      courseNumber: number,
      calendarYear: year,
      semester,
    },
  });
  if (query !== null) {
    return res
      .status(StatusCodes.CONFLICT)
      .json({ msg: "course already exists" });
  } else {
    next();
  }
};

export const isCourseCode = async (req, res, next) => {
  const { code } = req.body;
  const query = await prisma.course.findUnique({
    where: {
      code,
    },
  });
  if (query === null) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Course with this code does not exists" });
  } else {
    next();
  }
};

export const isCourseIdUrlValid = async (req, res, next) => {
  const id = parseInt(req.params.courseId, 10);
  const query = await prisma.course.findUnique({
    where: {
      id,
    },
  });
  if (query === null) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Course does not exist" });
  } else {
    next();
  }
};

export const isCourseId = async (req, res, next) => {
  const { courseId } = req.body;
  const query = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
  });
  if (query === null) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Course with this id does not exists" });
  } else {
    next();
  }
};

export const isCourseIdParams = async (req, res, next) => {
  const courseId = parseInt(req.params.courseId, 10);
  const query = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
  });
  if (query === null) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Course with this id does not exists" });
  } else {
    next();
  }
};

export const isCourseStaffOrInstructor = async (req, res, next) => {
  const { courseId } = req.body;
  const id = req.id;
  let roleQuery = {
    OR: [
      {
        instructors: {
          some: {
            id,
          },
        },
      },
      {
        courseStaff: {
          some: {
            id,
          },
        },
      },
    ],
  };
  const staffQuery = await prisma.course.findFirst({
    where: {
      id: courseId,
      AND: roleQuery,
    },
  });
  if (staffQuery === null) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "User is not a member of course staff" });
  } else {
    next();
  }
};

export const areCourseStaffOrInstructor = async (req, res, next) => {
  const { courseId, hosts } = req.body;
  let roleQuery = [];
  hosts.forEach((element) => {
    roleQuery.push({
      OR: [
        {
          instructors: {
            some: {
              id: element,
            },
          },
        },
        {
          courseStaff: {
            some: {
              id: element,
            },
          },
        },
      ],
    });
  });
  const staffQuery = await prisma.course.findFirst({
    where: {
      id: courseId,
      AND: roleQuery,
    },
  });
  if (staffQuery === null) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "User is not a member of course staff" });
  } else {
    next();
  }
};

export const isInCourseFromHeader = async (req, res, next) => {
  const courseId = parseInt(req.params.courseId, 10);
  const id = req.id;
  const studentQuery = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      students: {
        where: {
          id,
        },
      },
    },
  });
  const staffQuery = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      courseStaff: {
        where: {
          id,
        },
      },
    },
  });
  const instructorQuery = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      instructors: {
        where: {
          id,
        },
      },
    },
  });
  if (
    studentQuery === null &&
    staffQuery === null &&
    instructorQuery === null
  ) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "User is not in course" });
  } else {
    next();
  }
};

export const isInCourseForOfficeHour = async (req, res, next) => {
  const { officeHourId } = req.body;
  const id = req.id;
  const officeHour = await prisma.officeHour.findUnique({
    where: {
      id: officeHourId,
    },
    include: {
      course: true,
    },
  });
  const studentQuery = await prisma.course.findUnique({
    where: {
      id: officeHour.course.id,
    },
    include: {
      students: {
        where: {
          id,
        },
      },
    },
  });
  if (studentQuery === null) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "ERROR: student is not enrolled in course" });
  } else {
    next();
  }
};

export const isInCourseForOfficeHourParam = async (req, res, next) => {
  const officeHourId = parseInt(req.params.officeHourId, 10);
  const id = req.id;
  const officeHour = await prisma.officeHour.findUnique({
    where: {
      id: officeHourId,
    },
  });
  const studentQuery = await prisma.course.findUnique({
    where: {
      id: officeHour.courseId,
    },
    include: {
      students: {
        where: {
          id,
        },
      },
    },
  });
  if (studentQuery === null) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "ERROR: student is not enrolled in course" });
  } else {
    next();
  }
};

export const areTopicsForCourse = async (req, res, next) => {
  const { officeHourId, TopicIds } = req.body;
  const officeHour = await prisma.officeHour.findUnique({
    where: {
      id: officeHourId,
    },
  });
  if (TopicIds !== null && TopicIds !== undefined) {
    let topicQuery = [];
    TopicIds.forEach(async (topicId) => {
      topicQuery.push({
        AND: {
          id: topicId,
          courseId: officeHour.courseId,
        },
      });
    });
    const topic = await prisma.topic.findMany({
      where: {
        OR: topicQuery,
      },
    });
    if (topic.length !== TopicIds.length) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ msg: "ERROR: topic is not for course" });
    } else {
      next();
    }
  } else {
    next();
  }
};

export const isNotDuplicateTopic = async (req, res, next) => {
  const { courseId, value } = req.body;
  const topic = await prisma.topic.findFirst({
    where: {
      courseId,
      value,
    },
  });
  if (topic !== null) {
    return res
      .status(StatusCodes.CONFLICT)
      .json({ msg: "ERROR: topic already exists" });
  } else {
    next();
  }
};

export const isNotInCourse = async (req, res, next) => {
  const { code } = req.body;
  const id = req.id;
  const roster = await prisma.course.findUnique({
    where: {
      code,
    },
    include: {
      students: true,
      courseStaff: true,
      instructors: true,
    },
  });
  const inCourse =
    roster.students.some((student) => student.id === id) ||
    roster.courseStaff.some((staff) => staff.id === id) ||
    roster.instructors.some((instructor) => instructor.id === id);
  if (inCourse) {
    return res
      .status(StatusCodes.CONFLICT)
      .json({ msg: "User is already in course" });
  } else {
    next();
  }
};

export const doesTimeLengthExist = async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const time = await prisma.OfficeHourTimeOptions.findUnique({
    where: {
      id,
    },
  });
  if (time === null || time === undefined) {
    return res
      .status(StatusCodes.CONFLICT)
      .json({ msg: "ERROR: time option does not exist" });
  } else {
    next();
  }
};

export const isTimeLengthForCourse = async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const courseId = parseInt(req.params.courseId, 10);
  const time = await prisma.OfficeHourTimeOptions.findFirst({
    where: {
      id,
      courseId,
    },
  });
  if (time === null || time === undefined) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "ERROR: user does not have access to time length" });
  } else {
    next();
  }
};

export const isLengthMultipleOf5 = async (req, res, next) => {
  const { length } = req.body;
  if (length % 5 !== 0) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: length must be a multiple of 5" });
  } else {
    next();
  }
};

export const isInCourseBelowRoleForPromotionTo = async (req, res, next) => {
  const courseId = parseInt(req.params.courseId, 10);
  const studentId = req.body.studentId;
  const role = req.body.role;
  const roster = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      students: true,
      courseStaff: true,
      instructors: true,
    },
  });
  const inCourse =
    roster.students.some((student) => student.id === studentId) ||
    roster.courseStaff.some((staff) => staff.id === studentId) ||
    roster.instructors.some((instructor) => instructor.id === studentId);
  if (!inCourse) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: account to be promoted not in course" });
  } else if (roster.students.some((student) => student.id === studentId)) {
    req.currentRole = "Student";
    next();
  } else if (
    roster.courseStaff.some((staff) => staff.id === studentId) &&
    role === "Instructor"
  ) {
    req.currentRole = "Staff";
    next();
  } else {
    return res
      .status(StatusCodes.CONFLICT)
      .json({ msg: "ERROR: account can not be promoted further" });
  }
};

export const isInCourseBelowRoleForDemotionTo = async (req, res, next) => {
  const courseId = parseInt(req.params.courseId, 10);
  const studentId = req.body.studentId;
  const role = req.body.role;
  const roster = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      students: true,
      courseStaff: true,
      instructors: true,
    },
  });
  const inCourse =
    roster.students.some((student) => student.id === studentId) ||
    roster.courseStaff.some((staff) => staff.id === studentId) ||
    roster.instructors.some((instructor) => instructor.id === studentId);
  if (!inCourse) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: account to be demoted not in course" });
  } else if (
    roster.courseStaff.some((staff) => staff.id === studentId) &&
    role === "Student"
  ) {
    req.currentRole = "Staff";
    next();
  } else {
    return res
      .status(StatusCodes.CONFLICT)
      .json({ msg: "ERROR: account can not be demoted further" });
  }
};

export const checkPromoteRoles = (req, res, next) => {
  const { role } = req.body;
  if (role === "Staff" || role === "Instructor") {
    next();
  } else {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: invalid promotion role" });
  }
};

export const checkDemoteRoles = (req, res, next) => {
  const { role } = req.body;
  if (role === "Student") {
    next();
  } else {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: invalid promotion role" });
  }
};

export const doesTopicIdExist = async (req, res, next) => {
  const { topicId, courseId } = req.body;
  const topic = await prisma.topic.findUnique({
    where: {
      id: topicId,
    },
    include: {
      course: true,
    },
  });
  if (topic === null || topic === undefined) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "ERROR: topic does not exist" });
  } else if (topic.course.id !== courseId) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "ERROR: topic is not for specific course" });
  } else {
    next();
  }
};

export const isAccountInstructorForTopic = async (req, res, next) => {
  const topicId = parseInt(req.params.topicId, 10);
  const id = req.id;
  if (topicId === null || topicId === undefined) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: did not include a topic id" });
  } else {
    const topic = await prisma.topic.findUnique({
      where: {
        id: topicId,
      },
      include: {
        course: true,
      },
    });
    if (topic === null || topic === undefined) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "ERROR: did not include a valid topic id" });
    } else {
      const query = await prisma.course.findUnique({
        where: {
          id: topic.course.id,
        },
        include: {
          instructors: {
            where: {
              id,
            },
          },
        },
      });
      if (query === null) {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json({ msg: "Account is not an instructor in the course" });
      } else {
        next();
      }
    }
  }
};
