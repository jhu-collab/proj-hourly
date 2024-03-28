import prisma from "../../prisma/client.js";
import { StatusCodes } from "http-status-codes";
import { factory } from "./debug.js";
import { hashPassword } from "../util/password.js";

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

export const isUniqueUsername = async (req, res, next) => {
  debug("checking if username is unique...");
  const { username } = req.body;
  const query = await prisma.Account.findFirst({
    where: {
      userName: username,
    },
  });
  if (query !== null) {
    debug("username already in use!");
    return res
      .status(StatusCodes.CONFLICT)
      .json({ msg: "username already in use" });
  } else {
    debug("username is unique!");
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
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "Email is not associated with an account" });
  } else {
    debug("email exists!");
    next();
  }
};

export const usernameExists = async (req, res, next) => {
  debug("checking if username exists...");
  const { username } = req.body;
  const query = await prisma.Account.findFirst({
    where: {
      userName: username,
    },
  });
  if (query === null) {
    debug("invalid username!");
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "username is not associated with an account" });
  } else {
    debug("username exists!");
    next();
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
      .json({ msg: "Account does not exists for the given Account Id" });
  } else {
    debug("account is valid!");
    next();
  }
};

export const isAccountIdValidParam = async (req, res, next) => {
  debug("checking if account is valid...");
  const id = parseInt(req.params.accountId, 10);
  const query = await prisma.Account.findUnique({
    where: {
      id,
    },
  });
  if (query === null) {
    debug("account does not exist!");
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "Account does not exists for the given Account Id" });
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
      .json({ msg: "At least one of the host accounts does not exist" });
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

/* c8 ignore start */
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
/* c8 ignore end */

/* c8 ignore start */
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
/* c8 ignore start */

export const isAccountStaffOrInstructor = async (req, res, next) => {
  debug("checking if account is staff or instructor...");
  const id = req.id;
  const courseId = parseInt(req.params.courseId, 10);
  debug("getting course staff...");
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
  debug("getting course instructors...");
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
  /* c8 ignore start */ // Unreachable -> other validators prior to this one already check this
  if (query === null) {
    debug("account is not valid!");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: is not a valid account given the account id" });
  }
  /* c8 ignore end */
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

export const doesResetPasswordCodeMatch = async (req, res, next) => {
  debug("checking if reset code matches the one on the account...");
  const { email, id } = req.body;
  debug("getting account by email...");
  const account = await prisma.account.findUnique({
    where: {
      email,
    },
  });
  if (account.resetToken == id) {
    debug("reset code matches!");
    next();
  } else {
    debug("reset code does not match!");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Reset token did not match" });
  }
};

export const codeNotExpired = async (req, res, next) => {
  debug("checking if reset token is not expired...");
  const { email } = req.body;
  const date = new Date();
  debug("getting account by email...");
  const account = await prisma.account.findUnique({
    where: {
      email,
    },
  });
  const createDate = account.tokenCreatedAt;
  createDate.setUTCHours(createDate.getUTCHours() + 1);
  if (createDate < date) {
    debug("token is expired!");
    return res.status(StatusCodes.CONFLICT).json({ msg: "Link has expired" });
  } else {
    debug("token is not expired!");
    next();
  }
};

export const doesNotHaveExistingActiveLink = async (req, res, next) => {
  debug("checking if account has active expiration link...");
  const { username } = req.body;
  debug("getting account by username...");
  const account = await prisma.account.findUnique({
    where: {
      userName: username,
    },
  });
  if (account.resetToken == null) {
    debug("account does not have link!");
    next();
  } else {
    const date = new Date();
    const createDate = account.tokenCreatedAt;
    createDate.setUTCHours(createDate.getUTCHours() + 1);
    if (createDate > date) {
      debug("account has active link!");
      return res
        .status(StatusCodes.CONFLICT)
        .json({ msg: "Account has an existing reset link available" });
    } else {
      debug("account does not have active link!");
      next();
    }
  }
};

export const isOldPasswordAccurate = async (req, res, next) => {
  const id = req.id;
  const { oldPassword } = req.body;
  const oldPasswordHashed = hashPassword(oldPassword);
  const account = await prisma.account.findUnique({
    where: {
      id,
    },
  });
  if (account.hashedPassword == oldPasswordHashed) {
    next();
  } else {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "Old Password was incorrect!" });
  }
};

export const isNewPasswordNew = async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  if (oldPassword != newPassword) {
    next();
  } else {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "New Password is not new!" });
  }
};
