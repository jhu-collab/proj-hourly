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
  } else {
    next();
  }
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
  } else {
    next();
  }
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
    } else {
      next();
    }
  }
};

export const isAccountIdValid = async (req, res, next) => {
  const id = req.id;
  const query = await prisma.Account.findUnique({
    where: {
      id,
    },
  });
  if (query === null) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "Account does not exists" });
  } else {
    next();
  }
};

export const isAccountStudent = async (req, res, next) => {
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
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "Account is not a student in the course" });
  } else {
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
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "staffId is not staff for the course" });
  } else {
    next();
  }
};

export const areAccountsIdsValid = async (req, res, next) => {
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
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "Account does not exists" });
  } else {
    next();
  }
};

export const isAccountValidHeader = async (req, res, next) => {
  const id = req.id;
  const query = await prisma.Account.findUnique({
    where: {
      id,
    },
  });
  if (query === null) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: is not a valid account" });
  } else {
    next();
  }
};

export const isAccountInstructor = async (req, res, next) => {
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
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "Account is not an instructor in the course" });
  } else {
    next();
  }
};

export const accountIsNotInstructor = async (req, res, next) => {
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
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "Account is already an instructor in the course" });
  }
  next();
};

export const isAccountStaff = async (req, res, next) => {
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
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "Account is not a staff in the course" });
  } else {
    next();
  }
};

export const isAccountStaffOrInstructor = async (req, res, next) => {
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
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "Account is not a staff or instructor in the course" });
  } else {
    next();
  }
};

export const isAccountInstructorBody = async (req, res, next) => {
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
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "Account is not an instructor in the course" });
  } else {
    next();
  }
};

export const isAccountValidParams = async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
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
