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
  const course = await prisma.course.update({
    where: {
      id: courseId,
    },
    data: {
      usesTokens: true,
    },
  });
  debug("Updated course to use tokens...");
  return res.status(StatusCodes.ACCEPTED).json({ course });
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
  const updatedDatesUsed = issueToken.datesUsed.filter(
    (dateTime) =>
      !new Date(dateTime)
        .toISOString()
        .startsWith(dateObj.format("iso").slice(0, 10))
  );
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
  const datesUsedLength = issueToken.datesUsed.length;
  const remainingTokens = numTokenLimit - datesUsedLength;
  return res.status(StatusCodes.ACCEPTED).json({ remainingTokens });
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
