import prisma from "../../prisma/client.js";
import { StatusCodes } from "http-status-codes";
import spacetime from "spacetime";
import { factory } from "../util/debug.js";
import validate from "../util/checkValidation.js";

const debug = factory(import.meta.url);

export const optIn = async (req, res) => {
  if (validate(req, res)) {
    return res;
  }
  const courseId = parseInt(req.params.courseId, 10);
  debug("Updating course to use tokens...");
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
  });
  const courseUpdate = await prisma.course.update({
    where: {
      id: courseId,
    },
    data: {
      usesTokens: !course.usesTokens,
    },
  });
  debug("Updated course to use tokens...");
  return res.status(StatusCodes.ACCEPTED).json({ courseUpdate });
};

export const createToken = async (req, res) => {
  if (validate(req, res)) {
    return res;
  }
  const courseId = parseInt(req.params.courseId, 10);
  const { title, description, tokenLimit } = req.body;
  debug("Finding course...");
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      students: true,
    },
  });
  debug("Found course...");
  debug("Creating course token...");
  const courseToken = await prisma.courseToken.create({
    data: {
      title: title,
      description: description,
      course: {
        connect: {
          id: courseId,
        },
      },
      tokenLimit: tokenLimit,
    },
  });
  debug("Created course token...");
  const array = [];
  course.students.forEach((student) => {
    array.push({
      accountId: student.id,
      courseTokenId: courseToken.id,
    });
  });
  debug("Creating issue tokens...");
  await prisma.issueToken.createMany({
    data: array,
  });
  debug("Created issue tokens...");
  return res.status(StatusCodes.CREATED).json({ courseToken });
};

export const getTokens = async (req, res) => {
  if (validate(req, res)) {
    return res;
  }
  debug("Get tokens called...");
  const courseId = parseInt(req.params.courseId, 10);
  debug("Querying for tokens...");
  const courseTokens = await prisma.courseToken.findMany({
    where: {
      courseId,
    },
  });
  debug("Returning tokens!");
  return res.status(StatusCodes.ACCEPTED).json({ courseTokens });
};

export const editCourseToken = async (req, res) => {
  const courseTokenId = parseInt(req.params.courseTokenId, 10);
  const { title, description, tokenLimit } = req.body;
  debug("Updating course tokens...");
  const courseToken = await prisma.courseToken.update({
    where: {
      id: courseTokenId,
    },
    data: {
      title,
      description,
      tokenLimit,
    },
  });
  debug("Updated course tokens...");
  debug("Updating issue tokens...");
  const issueTokens = await prisma.issueToken.updateMany({
    where: {
      courseTokenId: courseTokenId,
      overrideAmount: {
        lte: tokenLimit,
      },
    },
    data: {
      overrideAmount: null,
    },
  });
  debug("Updated issue tokens...");
  return res.status(StatusCodes.ACCEPTED).json({ courseToken });
};

export const usedToken = async (req, res) => {
  const courseTokenId = parseInt(req.params.courseTokenId, 10);
  const accountId = parseInt(req.params.accountId, 10);
  const { reason } = req.body;
  const id = req.id;
  debug("Finding issueToken for student...");
  const issueToken = await prisma.issueToken.findFirst({
    where: {
      accountId: accountId,
      courseTokenId,
    },
    include: {
      usedTokens: true,
    },
  });
  debug("issueToken found for student...");
  debug("Creating used token...");
  const usedToken = await prisma.usedToken.create({
    data: {
      issueTokenId: issueToken.id,
      appliedById: id,
      reason: reason,
    },
    include: {
      unDoneBy: {
        select: {
          userName: true,
          firstName: true,
          lastName: true,
        },
      },
      appliedBy: {
        select: {
          userName: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });
  debug("Used token created...");
  return res.status(StatusCodes.ACCEPTED).json({ usedToken });
};

export const undoUsedToken = async (req, res) => {
  const usedTokenId = parseInt(req.params.usedTokenId, 10);
  const accountId = parseInt(req.params.accountId, 10);
  const { reason } = req.body;
  const id = req.id;
  debug("Finding used token");
  const updatedUsedToken = await prisma.usedToken.update({
    where: {
      id: usedTokenId,
    },
    data: {
      unDoneById: id,
      reason: reason,
    },
    include: {
      unDoneBy: {
        select: {
          userName: true,
          firstName: true,
          lastName: true,
        },
      },
      appliedBy: {
        select: {
          userName: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });
  debug("Updated used token");
  return res.status(StatusCodes.ACCEPTED).json({ updatedUsedToken });
};

export const getRemainingTokens = async (req, res) => {
  if (validate(req, res)) {
    return res;
  }
  const courseTokenId = parseInt(req.params.courseTokenId, 10);
  const id = req.id;
  debug("Finding courseToken...");
  const courseToken = await prisma.courseToken.findUnique({
    where: {
      id: courseTokenId,
    },
  });
  debug("Found courseToken...");
  debug("Finding issueToken...");
  const issueToken = await prisma.issueToken.findFirst({
    where: {
      accountId: id,
      courseTokenId,
    },
    include: {
      usedTokens: true,
    },
  });
  debug("Found issueToken...");
  const numTokenLimit = courseToken.tokenLimit;
  const overrideAmount = issueToken.overrideAmount;
  const usedTokensLength = issueToken.usedTokens.filter(
    (usedToken) =>
      usedToken.unDoneById === null || usedToken.unDoneById === undefined
  ).length;
  const remainingTokens =
    overrideAmount !== null
      ? overrideAmount - usedTokensLength
      : numTokenLimit - usedTokensLength;
  return res.status(StatusCodes.ACCEPTED).json({ remainingTokens });
};

export const getAllRemainingTokens = async (req, res) => {
  if (validate(req, res)) {
    return res;
  }
  const courseId = parseInt(req.params.courseId, 10);
  const id = req.id;
  debug("Finding courseToken...");
  const courseTokens = await prisma.courseToken.findMany({
    where: {
      courseId: courseId,
    },
  });
  debug("Found courseTokens...");
  const courseTokenIds = courseTokens.map((courseToken) => courseToken.id);
  const issueTokens = await prisma.issueToken.findMany({
    where: {
      accountId: id,
      courseTokenId: {
        in: courseTokenIds,
      },
    },
    include: {
      CourseToken: true,
      usedTokens: {
        include: {
          unDoneBy: {
            select: {
              userName: true,
              firstName: true,
              lastName: true,
            },
          },
          appliedBy: {
            select: {
              userName: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
    orderBy: {
      id: "asc",
    },
  });
  debug("Found issueToken...");
  debug("filtering issue tokens");
  let filteredIssueTokens = [];
  for (const issueToken of issueTokens) {
    const remainingTokens =
      issueToken.overrideAmount !== null
        ? issueToken.overrideAmount -
          issueToken.usedTokens.filter(
            (usedToken) =>
              usedToken.unDoneById === null ||
              usedToken.unDoneById === undefined
          ).length
        : issueToken.CourseToken.tokenLimit -
          issueToken.usedTokens.filter(
            (usedToken) =>
              usedToken.unDoneById === null ||
              usedToken.unDoneById === undefined
          ).length;
    filteredIssueTokens.push(issueToken);
  }
  debug("issue tokens filtered");
  return res.status(StatusCodes.ACCEPTED).json({ filteredIssueTokens });
};

export const getUsedTokens = async (req, res) => {
  if (validate(req, res)) {
    return res;
  }

  const courseTokenId = parseInt(req.params.courseTokenId, 10);
  const id = req.id;
  debug("Finding issueToken for student...");
  const issueToken = await prisma.issueToken.findFirst({
    where: {
      accountId: id,
      courseTokenId,
    },
    include: {
      usedTokens: true,
    },
  });
  debug("Found issueToken for student...");
  const usedTokensLength = issueToken.usedTokens.filter(
    (usedToken) =>
      usedToken.unDoneById === null || usedToken.unDoneById === undefined
  ).length;

  return res.status(StatusCodes.ACCEPTED).json({ balance: usedTokensLength });
};

export const deleteSingle = async (req, res) => {
  if (validate(req, res)) {
    return res;
  }
  const courseTokenId = parseInt(req.params.courseTokenId, 10);
  const issueTokens = await prisma.issueToken.findMany({
    where: {
      courseTokenId,
    },
    include: {
      usedTokens: true,
    },
  });
  let issueTokenIds = [];
  for (let issueToken of issueTokens) {
    issueTokenIds.push(issueToken.id);
  }
  debug("deleting used tokens...");
  await prisma.usedToken.deleteMany({
    where: {
      issueTokenId: {
        in: issueTokenIds,
      },
    },
  });
  debug("used tokens deleted");
  debug("Deleting issueTokens...");
  await prisma.issueToken.deleteMany({
    where: {
      courseTokenId,
    },
  });
  debug("issueTokens deleted");
  debug("Deleting course token...");
  const courseToken = await prisma.courseToken.delete({
    where: {
      id: courseTokenId,
    },
  });
  debug("Deleted course token...");
  return res.status(StatusCodes.ACCEPTED).json({ courseToken });
};

export const deleteAll = async (req, res) => {
  if (validate(req, res)) {
    return res;
  }
  const courseId = parseInt(req.params.courseId, 10);
  const courseTokenId = [];
  debug("Finding course tokens...");
  const courseTokens = await prisma.courseToken.findMany({
    where: {
      courseId: courseId,
    },
  });
  debug("Course tokens found...");
  for (let courseToken of courseTokens) {
    courseTokenId.push(courseToken.id);
  }
  debug("Deleting all issueTokens...");
  const issueTokens = await prisma.issueToken.findMany({
    where: {
      courseTokenId: {
        in: courseTokenId,
      },
    },
    include: {
      usedTokens: true,
    },
  });
  let issueTokenIds = [];
  for (let issueToken of issueTokens) {
    issueTokenIds.push(issueToken.id);
  }
  debug("Deleting all usedTokens...");
  await prisma.usedToken.deleteMany({
    where: {
      issueTokenId: {
        in: issueTokenIds,
      },
    },
  });
  debug("All usedTokens deleted...");
  debug("Deleting all issueTokens...");
  await prisma.issueToken.deleteMany({
    where: {
      courseTokenId: {
        in: courseTokenId,
      },
    },
  });
  debug("All issueTokens deleted...");
  debug("Deleting all course tokens...");
  const courseToken = await prisma.courseToken.deleteMany({
    where: {
      courseId: courseId,
    },
  });
  debug("All course tokens deleted...");
  return res.status(StatusCodes.ACCEPTED).json({ courseToken });
};

export const getTokensForStudent = async (req, res) => {
  if (validate(req, res)) {
    return res;
  }
  const accountId = parseInt(req.params.accountId, 10);
  const courseId = parseInt(req.params.courseId, 10);
  debug("Finding issue tokens for student...");
  const issueTokens = await prisma.issueToken.findMany({
    where: {
      CourseToken: {
        courseId,
      },
      accountId,
    },
    include: {
      CourseToken: true,
      usedTokens: {
        include: {
          unDoneBy: {
            select: {
              userName: true,
              firstName: true,
              lastName: true,
            },
          },
          appliedBy: {
            select: {
              userName: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
    orderBy: {
      id: "asc",
    },
  });
  debug("Found issue tokens for student...");
  debug("filtering issue tokens");
  let filteredIssueTokens = issueTokens;
  // for (const issueToken of issueTokens) {
  //   const remainingTokens =
  //     issueToken.overrideAmount !== null
  //       ? issueToken.overrideAmount -
  //         issueToken.usedTokens.filter(
  //           (usedToken) =>
  //             usedToken.unDoneById === null ||
  //             usedToken.unDoneById === undefined
  //         ).length
  //       : issueToken.CourseToken.tokenLimit -
  //         issueToken.usedTokens.filter(
  //           (usedToken) =>
  //             usedToken.unDoneById === null ||
  //             usedToken.unDoneById === undefined
  //         ).length;
  //   if (remainingTokens > 0) {
  //     filteredIssueTokens.push(issueToken);
  //   }
  // }
  debug("issue tokens filtered");
  return res.status(StatusCodes.ACCEPTED).json({ filteredIssueTokens });
};

export const addOverride = async (req, res) => {
  if (validate(req, res)) {
    return res;
  }
  const courseTokenId = parseInt(req.params.courseTokenId, 10);
  const { overrideAmount } = req.body;
  const accountId = parseInt(req.params.accountId, 10);
  debug("Finding issue token for student...");
  const issueToken = await prisma.issueToken.updateMany({
    where: {
      courseTokenId,
      accountId: accountId,
    },
    data: {
      overrideAmount,
    },
  });
  debug("Added override amount for student...");
  return res.status(StatusCodes.ACCEPTED).json({ issueToken });
};

export const deleteOverride = async (req, res) => {
  if (validate(req, res)) {
    return res;
  }
  const courseTokenId = parseInt(req.params.courseTokenId, 10);
  const accountId = parseInt(req.params.accountId, 10);
  debug("Finding issue token for student...");
  const issueToken = await prisma.issueToken.updateMany({
    where: {
      accountId: accountId,
      courseTokenId,
    },
    data: {
      overrideAmount: null,
    },
  });
  debug("Removed override amount for student...");
  return res.status(StatusCodes.ACCEPTED).json({ issueToken });
};

export const editUsedToken = async (req, res) => {
  if (validate(req, res)) {
    return res;
  }
  const usedTokenId = parseInt(req.params.usedTokenId, 10);
  const courseId = parseInt(req.params.courseId, 10);
  const { reason, appliedById, unDoneById, issueTokenId } = req.body;
  debug("Updating used token for student...");
  const usedToken = await prisma.usedToken.update({
    where: {
      id: usedTokenId,
    },
    data: {
      reason: reason,
      appliedById: appliedById,
      unDoneById: unDoneById,
      issueTokenId: issueTokenId,
    },
    include: {
      unDoneBy: {
        select: {
          userName: true,
          firstName: true,
          lastName: true,
        },
      },
      appliedBy: {
        select: {
          userName: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });
  debug("Edited used token for student...");
  return res.status(StatusCodes.ACCEPTED).json({ usedToken });
};
