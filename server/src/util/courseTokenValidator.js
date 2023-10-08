import prisma from "../../prisma/client.js";
import { StatusCodes } from "http-status-codes";
import { factory } from "./debug.js";
import validate from "../util/checkValidation.js";

const debug = factory(import.meta.url);

export const isCourseUsingTokens = async (req, res, next) => {
  if (validate(req, res)) {
    return res;
  }
  const courseId = parseInt(req.params.courseId, 10);
  debug("Finding course...");
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
  });
  debug("Course found...");
  if (!course.usesTokens) {
    debug("Course not using course tokens...");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Course not using tokens" });
  } else {
    debug("Course using course tokens!");
    next();
  }
};

//checking if it's the correct course token
export const isCourseToken = async (req, res, next) => {
  if (validate(req, res)) {
    return res;
  }
  const courseTokenId = parseInt(req.params.courseTokenId, 10);
  debug("Finding course token...");
  const courseToken = await prisma.courseToken.findUnique({
    where: {
      id: courseTokenId,
    },
  });
  debug("Found course token...");
  if (courseToken === null) {
    debug("Course token doesn't exist...");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Course Token does not exist" });
  } else {
    debug("Course Token exists!");
    next();
  }
};

//validates whether the student has reached the token limit
export const tokenLimitReached = async (req, res, next) => {
  if (validate(req, res)) {
    return res;
  }
  const courseTokenId = parseInt(req.params.courseTokenId, 10);
  const studentId = parseInt(req.params.studentId, 10);
  debug("Finding course token...");
  const courseToken = await prisma.courseToken.findUnique({
    where: {
      id: courseTokenId,
    },
  });
  debug("Course token found...");
  debug("Finding issue token...");
  const issueToken = await prisma.issueToken.findFirst({
    where: {
      accountId: studentId,
      courseTokenId,
    },
  });
  debug("Found issue token...");
  const dates = issueToken.datesUsed;
  if (dates === null) {
    debug("Student has used no tokens yet!");
    next();
  }
  if (
    (courseToken.overrideAmount !== null &&
      dates.length >= courseToken.overrideAmount) ||
    (courseToken.overrideAmount === null &&
      dates.length >= courseToken.tokenLimit)
  ) {
    debug("Course token limit reached!");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Student has used all their tokens" });
  } else {
    debug("Student has not yet reached course token limit!");
    next();
  }
};