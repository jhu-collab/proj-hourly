import prisma from "../../prisma/client.js";
import { StatusCodes } from "http-status-codes";

export const isUniqueEmail = async (req, res, next) => {
  const { email } = req.body;
  const query = await prisma.Account.findFirst({
    where: {
      email,
    },
  });
  if (query !== null) {
    return res
      .status(StatusCodes.CONFLICT)
      .json({ msg: "Email already in use" });
  }
  next();
};

export const emailExists = async (req, res, next) => {
  const { email } = req.body;
  const query = await prisma.Account.findFirst({
    where: {
      email,
    },
  });
  if (query === null) {
    return res.status(StatusCodes.FORBIDDEN).json({ msg: "Invalid Email" });
  }
  next();
};

export const isUniquePhone = async (req, res, next) => {
  const { phoneNumber } = req.body;
  if (phoneNumber === null || phoneNumber === undefined) {
    next();
  } else {
    const query = await prisma.Account.findFirst({
      where: {
        phoneNumber,
      },
    });
    if (query !== null) {
      return res
        .status(StatusCodes.CONFLICT)
        .json({ msg: "phoneNumber already associated with an account" });
    }
    next();
  }
};

export const isAccountIdValid = async (req, res, next) => {
  const { id } = req.body;
  const query = await prisma.Account.findUnique({
    where: {
      id,
    },
  });
  if (query === null) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "Account does not exists" });
  }
  next();
};

export const isAccountStudent = async (req, res, next) => {
  const id = parseInt(req.get("id"), 10);
  const courseId = parseInt(req.params.courseId, 10);
  const query = await prisma.course.findUnique({
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
  if (query === null) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "Account is not a student in the course" });
  }
  next();
};

export const isUrlStaff = async (req, res, next) => {
  const id = parseInt(req.params.staffId, 10);
  const courseId = parseInt(req.params.courseId, 10);
  const query = await prisma.course.findUnique({
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
  if (query === null) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "staffId is not staff for the course" });
  }
  next();
};
export const areAccountsIdsValid = async (req, res, next) => {
  const { hosts } = req.body;
  hosts.forEach(async (element) => {
    const query = await prisma.Account.findUnique({
      where: {
        id: element,
      },
    });
    if (query === null) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ msg: "Account does not exists" });
    }
  });
  next();
};

export const isAccountValidHeader = async (req, res, next) => {
  const id = parseInt(req.get("id"), 10);
  const query = await prisma.Account.findUnique({
    where: {
      id,
    },
  });
  if (query === null) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: is not a valid account" });
  }
  next();
};

export const isAccountInstructor = async (req, res, next) => {
  const id = parseInt(req.get("id"), 10);
  const courseId = parseInt(req.params.courseId, 10);
  const query = await prisma.course.findUnique({
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
  if (query === null) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "Account is not an instructor in the course" });
  }
  next();
};

export const isAccountInstructorBody = async (req, res, next) => {
  const id = parseInt(req.get("id"), 10);
  const { courseId } = req.body;
  const query = await prisma.course.findUnique({
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
  if (query === null) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "Account is not an instructor in the course" });
  }
  next();
};
