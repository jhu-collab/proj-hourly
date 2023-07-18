import prisma from "../../prisma/client.js";
import { StatusCodes } from "http-status-codes";
import { factory } from "./debug.js";
import validate from "../util/checkValidation.js";

const debug = factory(import.meta.url);

export const isCourseUsingTokens = async (req, res, next) => {
    const courseId = parseInt(req.params.courseId, 10);
    const course = await prisma.course.findUnique({
        where: {
            id: courseId,
        },
    });
    if (!(course.usesTokens)) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ msg: "Course not using tokens" });
    } else {
        next();
    }
}

//checking if it's the correct course token
export const isCourseToken = async (req, res, next) => {
    if (validate(req, res)) {
        return res;
    }
    const courseTokenId = parseInt(req.params.courseTokenId, 10);
    const courseToken = await prisma.courseToken.findUnique({
        where: {
            id: courseTokenId
        },
    });
    if (courseToken === null) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ msg: "Course Token does not exist" });
    } else {
        debug("Course Token exists!");
        next();
    }
}

//validates whether the student has reached the token limit
export const tokenLimitReached = async (req, res, next) => {
    if (validate(req, res)) {
        return res;
    }
    const courseTokenId = parseInt(req.params.courseTokenId, 10);
    const studentId = parseInt(req.params.studentId, 10);
    const courseToken = await prisma.courseToken.findUnique({
        where: {
            id: courseTokenId
        },
    });
    const issueToken = await prisma.issueToken.findFirst({
        where: {
            accountId: studentId,
            courseTokenId
        }
    });
    const dates = issueToken.datesUsed;
    if (dates === null) {
        next()
    }
    if (dates.length >= courseToken.tokenLimit) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ msg: "Student has used all their tokens" });
    } else {
        next();
    }
}
