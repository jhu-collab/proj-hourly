import prisma from "../../prisma/client.js";
import { StatusCodes } from "http-status-codes";
import { stringToTimeObj } from "../util/officeHourValidator.js";
import checkValidation from "../util/checkValidation.js";
import { combineTimeAndDate, generateCalendar } from "../util/icalHelpers.js";
import { computeDiff, handleUTCDateChange } from "../util/helpers.js";
import { weekday } from "../util/officeHourValidator.js";
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
  const studentId = parseInt(req.params.studentId, 10);
  const { date } = req.body;
  const dateObj = spacetime(date);
  debug("Finding issueToken for student...");
  const issueToken = await prisma.issueToken.findFirst({
    where: {
      accountId: studentId,
      courseTokenId,
    },
  });
  debug("issueToken found for student...");
  debug("Updating issueToken...");
  const updateIssueToken = await prisma.issueToken.update({
    where: {
      id: issueToken.id,
    },
    data: {
      datesUsed: {
        push: dateObj.toNativeDate(),
      },
    },
  });
  debug("Updated issueToken...");
  return res.status(StatusCodes.ACCEPTED).json({ updateIssueToken });
};

export const undoUsedToken = async (req, res) => {
  const courseTokenId = parseInt(req.params.courseTokenId, 10);
  const studentId = parseInt(req.params.studentId, 10);
  const { date } = req.body;
  const dateObj = spacetime(date);
  debug("Finding issueToken for student...");
  const issueToken = await prisma.issueToken.findFirst({
    where: {
      accountId: studentId,
      courseTokenId,
    },
  });
  debug("Found issueToken for student...");
  const dateToFind = dateObj.format("iso").slice(0, 10);
  const indexToRemove = issueToken.datesUsed.findIndex((dateTime) =>
    new Date(dateTime).toISOString().startsWith(dateToFind)
  );
  let updatedDatesUsed = issueToken.datesUsed;
  if (indexToRemove !== -1) {
    updatedDatesUsed = issueToken.datesUsed.splice(indexToRemove, 1);
  }
  debug("Updating issueToken for student...");
  const updateIssueToken = await prisma.issueToken.update({
    where: {
      id: issueToken.id,
    },
    data: {
      datesUsed: updatedDatesUsed,
    },
  });
  debug("Updated issueToken for student...");
  return res.status(StatusCodes.ACCEPTED).json({ updateIssueToken });
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
  });
  debug("Found issueToken...");
  const numTokenLimit = courseToken.tokenLimit;
  const overrideAmount = issueToken.overrideAmount;
  const datesUsedLength = issueToken.datesUsed.length;
  const remainingTokens =
    overrideAmount !== null
      ? overrideAmount - datesUsedLength
      : numTokenLimit - datesUsedLength;
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
    },
  });
  debug("Found issueToken...");
  return res.status(StatusCodes.ACCEPTED).json({ issueTokens });
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
  });
  debug("Found issueToken for student...");
  const datesUsedLength = issueToken.datesUsed.length;

  return res.status(StatusCodes.ACCEPTED).json({ balance: datesUsedLength });
};

export const deleteSingle = async (req, res) => {
  if (validate(req, res)) {
    return res;
  }
  const courseTokenId = parseInt(req.params.courseTokenId, 10);
  debug("Deleting issueTokens...");
  const issueToken = await prisma.issueToken.deleteMany({
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
  const issueToken = await prisma.issueToken.deleteMany({
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
    },
  });
  debug("Found issue tokens for student...");
  return res.status(StatusCodes.ACCEPTED).json({ issueTokens });
};

export const addOverride = async (req, res) => {
  if (validate(req, res)) {
    return res;
  }
  const courseTokenId = parseInt(req.params.courseTokenId, 10);
  const { overrideAmount } = req.body;
  const studentId = parseInt(req.params.studentId, 10);
  debug("Finding issue token for student...");
  const issueToken = await prisma.issueToken.updateMany({
    where: {
      accountId: studentId,
      courseTokenId,
    },
    data: {
      overrideAmount,
    },
  });
  debug("Added override amount for student...");
  return res.status(StatusCodes.ACCEPTED).json({ issueToken });
};

export const editOverride = async (req, res) => {
  if (validate(req, res)) {
    return res;
  }
  const courseTokenId = parseInt(req.params.courseTokenId, 10);
  const { overrideAmount } = req.body;
  const studentId = parseInt(req.params.studentId, 10);
  debug("Finding issue token for student...");
  const issueToken = await prisma.issueToken.updateMany({
    where: {
      accountId: studentId,
      courseTokenId,
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
  const studentId = parseInt(req.params.studentId, 10);
  debug("Finding issue token for student...");
  const issueToken = await prisma.issueToken.updateMany({
    where: {
      accountId: studentId,
      courseTokenId,
    },
    data: {
      overrideAmount: null,
    },
  });
  debug("Removed override amount for student...");
  return res.status(StatusCodes.ACCEPTED).json({ issueToken });
};
