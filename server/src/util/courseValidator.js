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
  }
  next();
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
  }
  next();
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
  }
  next();
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
  }
  next();
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
  }
  next();
};

export const areCourseStaffOrInstructor = async (req, res, next) => {
  const { courseId, hosts } = req.body;
  hosts.forEach(async (element) => {
    const instructorQuery = await prisma.course.findFirst({
      where: {
        id: courseId,
      },
      include: {
        instructors: {
          where: {
            id: element,
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
            id: element,
          },
        },
      },
    });
    if (staffQuery === null && instructorQuery == null) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ msg: "User is not a member of course staff" });
    }
  });
  next();
};

export const isInCourseFromHeader = async (req, res, next) => {
  const courseId = parseInt(req.params.courseId, 10);
  const id = parseInt(req.get("id"), 10);
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
  }
  next();
};

export const isInCourseForOfficeHour = async (req, res, next) => {
  const { officeHourId } = req.body;
  const id = parseInt(req.get("id"), 10);
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
  }
  next();
};

export const areTopicsForCourse = async (req, res, next) => {
  const { officeHourId, TopicIds } = req.body;
  const officeHour = await prisma.officeHour.findUnique({
    where: {
      id: officeHourId,
    },
  });
  if (TopicIds !== null && TopicIds !== undefined) {
    TopicIds.forEach(async (topicId) => {
      const topic = await prisma.topic({
        where: {
          id: topicId,
        },
        include: {
          courseId: officeHour.courseId,
        },
      });
      if (topic === null) {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json({ msg: "ERROR: topic is not for course" });
      }
    });
  }
  next();
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
  }
  next();
};
