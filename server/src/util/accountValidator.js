import prisma from "../../prisma/client.js";
import { StatusCodes } from "http-status-codes";
import { factory } from "./debug.js";

const debug = factory(import.meta.url);

export const isUniqueEmail = async (req, res, next) => {
  debug("checking if email is unique...");
  const { email } = req.body;
  const query = await prisma.Account.findFirst({
    where: {
      email,
    },
  });
  if (query !== null) {
    debug("email already in use!");
    return res
      .status(StatusCodes.CONFLICT)
      .json({ msg: "Email already in use" });
  } else {
    debug("email is unique!");
    next();
  }
};

export const emailExists = async (req, res, next) => {
  debug("checking if email exists...");
  const { email } = req.body;
  const query = await prisma.Account.findFirst({
    where: {
      email,
    },
  });
  if (query === null) {
    debug("invalid email!");
    return res.status(StatusCodes.FORBIDDEN).json({ msg: "Invalid Email" });
  } else {
    debug("email exists!");
    next();
  }
};

export const isUniquePhone = async (req, res, next) => {
  debug("checking if phone number is unique...");
  const { phoneNumber } = req.body;
  if (phoneNumber === null || phoneNumber === undefined) {
    debug("phone number not provided...");
    next();
  } else {
    const query = await prisma.Account.findFirst({
      where: {
        phoneNumber,
      },
    });
    if (query !== null) {
      debug("phone already associated with an account!");
      return res
        .status(StatusCodes.CONFLICT)
        .json({ msg: "phoneNumber already associated with an account" });
    } else {
      debug("phone number is unique!");
      next();
    }
  }
};

export const isAccountIdValid = async (req, res, next) => {
  debug("checking if account is valid...");
  const id = req.id;
  const query = await prisma.Account.findUnique({
    where: {
      id,
    },
  });
  if (query === null) {
    debug("account does not exist!");
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "Account does not exists" });
  } else {
    debug("account is valid!");
    next();
  }
};

export const isAccountStudent = async (req, res, next) => {
  debug("checking if account is student...");
  const id = req.id;
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
  if (query.students.length === 0) {
    debug("account is not a student in the course!");
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "Account is not a student in the course" });
  } else {
    debug("account is a student in the course!");
    next();
  }
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
  if (query.courseStaff.length === 0) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "staffId is not staff for the course" });
  } else {
    next();
  }
};

export const isUrlStudent = async (req, res, next) => {
  debug("checking if url is student...");
  const id = parseInt(req.params.studentId, 10);
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
  if (query.students.length === 0) {
    debug("staffId is not staff for the course!");
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "staffId is not staff for the course" });
  } else {
    debug("url is student!");
    next();
  }
};

export const areAccountsIdsValid = async (req, res, next) => {
  debug("checking if accounts are valid...");
  console.log(req.body);
  const { hosts } = req.body;
  let checkAllAccounts = [];
  hosts.forEach((element) => {
    checkAllAccounts.push({
      id: element,
    });
  });
  const query = await prisma.account.findMany({
    where: {
      OR: checkAllAccounts,
    },
  });
  if (query.length !== checkAllAccounts.length) {
    debug("accounts do not exist!");
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "Account does not exists" });
  } else {
    debug("accounts are valid!");
    next();
  }
};

export const isAccountValidHeader = async (req, res, next) => {
  debug("checking if account is valid...");
  const id = req.id;
  const query = await prisma.Account.findUnique({
    where: {
      id,
    },
  });
  if (query === null) {
    debug("is not a valid account!");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: is not a valid account" });
  } else {
    debug("is a valid account!");
    next();
  }
};

export const isAccountInstructor = async (req, res, next) => {
  debug("checking if account is instructor...");
  const id = req.id;
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
  if (query.instructors.length === 0) {
    debug("account is not an instructor in the course!");
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "Account is not an instructor in the course" });
  } else {
    debug("account is an instructor in the course!");
    next();
  }
};

export const accountIsNotInstructor = async (req, res, next) => {
  debug("checking if account is not instructor...");
  const id = parseInt(req.params.id, 10);
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
  if (query.instructors.length !== 0) {
    debug("account is already an instructor in the course!");
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "Account is already an instructor in the course" });
  }
  debug("account is not an instructor in the course!");
  next();
};

export const isAccountStaff = async (req, res, next) => {
  debug("checking if account is staff...");
  const id = req.id;
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
  if (query.courseStaff.length === 0) {
    debug("account is not a staff in the course!");
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "Account is not a staff in the course" });
  } else {
    debug("account is a staff in the course!");
    next();
  }
};

export const isAccountStaffOrInstructor = async (req, res, next) => {
  debug("checking if account is staff or instructor...");
  const id = req.id;
  const courseId = parseInt(req.params.courseId, 10);
  const staff = await prisma.course.findUnique({
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
  const instructor = await prisma.course.findUnique({
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
  if (staff.courseStaff.length === 0 && instructor.instructors.length === 0) {
    debug("account is not a staff or instructor in the course!");
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "Account is not a staff or instructor in the course" });
  } else {
    debug("account is a staff or instructor in the course!");
    next();
  }
};

export const isAccountInstructorBody = async (req, res, next) => {
  debug("checking if account is instructor...");
  const id = req.id;
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
  if (query.instructors.length === 0) {
    debug("account is not an instructor in the course!");
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "Account is not an instructor in the course" });
  } else {
    debug("account is an instructor in the course!");
    next();
  }
};

export const isAdmin = async (req, res, next) => {
  debug("checking if account is admin...");
  const id = req.id;
  const account = await prisma.account.findUnique({
    where: {
      id,
    },
  });
  if (account.role !== "Admin") {
    debug("account is not admin!");
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "Account must be admin to retrieve all accounts" });
  } else {
    debug("account is admin!");
    next();
  }
};

export const isAccountValidParams = async (req, res, next) => {
  debug("checking if account is valid...");
  const id = parseInt(req.params.id, 10);
  const query = await prisma.Account.findUnique({
    where: {
      id,
    },
  });
  if (query === null) {
    debug("account is not valid!");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: is not a valid account" });
  }
  debug("account is valid!");
  next();
};

export const isAccountUserParams = async (req, res, next) => {
  debug("checking if account is user...");
  const id = parseInt(req.params.id, 10);
  const query = await prisma.Account.findUnique({
    where: {
      id,
    },
  });
  if (query.role === "Admin") {
    debug("account is not user, account is already admin!");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERORR: account is already admin" });
  } else {
    debug("account is user!");
    next();
  }
};
