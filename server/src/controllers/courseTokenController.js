import prisma from "../../prisma/client.js";
import { StatusCodes } from "http-status-codes";
import { stringToTimeObj } from "../util/officeHourValidator.js";
import checkValidation from "../util/checkValidation.js";
import { combineTimeAndDate, generateCalendar } from "../util/icalHelpers.js";
import { computeDiff, handleUTCDateChange } from "../util/helpers.js";
import { weekday } from "../util/officeHourValidator.js";
import spacetime from "spacetime";
import { factory } from "../util/debug.js";

export const optIn = async (req, res) => {
    if (validate(req, res)) {
        return res;
    }
    const courseId = parseInt(req.params.courseId, 10);

    const course = await prisma.course.update({
        where: {
            id: courseId
        },
        data: {
            usesTokens: true
        }
    });

    return res.status(StatusCodes.ACCEPTED).json({ course });
}

export const createToken = async (req, res) => {
    if (validate(req, res)) {
        return res;
    }
    const courseId = parseInt(req.params.courseId, 10);
    const { title, description, tokenLimit } = req.body;

    const course = await prisma.course.findUnique({
        where: {
          id: courseId,
        },
        include: {
            students: true
        }
    });
    const courseToken = await prisma.courseToken.create({
        data: {
            title: title,
            description: description,
            course: {
                connect: courseId
            },
            tokenLimit: tokenLimit,
        }
    });
    const array = [];
    course.students.forEach(student => {
        array.push({
            accountId: student.id,
            courseTokenId: courseToken.id
        })
    })
    await prisma.issueToken.createMany({
        data: array
    })

    return res.status(StatusCodes.CREATED).json({ courseToken });
}

export const editCourseToken = async (req, res) => {
    const courseTokenId = parseInt(req.params.courseTokenId, 10);
    const { title, description, tokenLimit } = req.body;
    const courseToken = await prisma.courseToken.update({
        where: {
            id: courseTokenId
        },
        data: {
            title,
            description,
            tokenLimit
        }
    });
    return res.status(StatusCodes.ACCEPTED).json( { courseToken } );
}

export const usedToken = async (req, res) => {
    const courseTokenId = parseInt(req.params.courseTokenId, 10);
    const studentId = parseInt(req.params.studentId, 10);
    const { date } = req.body;
    const dateObj = spacetime(date);

    const updateIssueToken = await prisma.issueToken.update({
        where: {
            accountId: studentId,
            courseTokenId
        },
        data: {
            datesUsed: {
                push: dateObj.toNativeDate()
            }
        }
    });
    return res.status(StatusCodes.ACCEPTED).json( { updateIssueToken } );
}

export const undoUsedToken = async (req, res) => {
    const courseTokenId = parseInt(req.params.courseTokenId, 10);
    const studentId = parseInt(req.params.studentId, 10);
    const { date } = req.body;
    const dateObj = spacetime(date);

    const issueToken = await prisma.issueToken.findUnique({
        where: {
            accountId: studentId,
            courseTokenId
        }
    })
    const updatedDatesUsed = issueToken.datesUsed.filter(dateTime => !dateTime.isEqual(dateObj.toNativeDate()));
    const updateIssueToken = await prisma.issueToken.update({
        where: {
            accountId: studentId,
            courseTokenId
        },
        data: {
            datesUsed: updatedDatesUsed
        }
    });
    return res.status(StatusCodes.ACCEPTED).json( { updateIssueToken } );
}

export const getRemainingTokens = async (req, res) => {
    if (validate(req, res)) {
        return res;
    }
    const courseTokenId = parseInt(req.params.courseTokenId, 10);
    const id = req.id; 
    const courseToken = await prisma.courseToken.findUnique({
        where: {
            id: courseTokenId
        },
    });
    const issueToken = await prisma.issueToken.findUnique({
        where: {
            accountId: id,
            courseTokenId
        },
    });
    const numTokenLimit = courseToken.tokenLimit;
    const datesUsedLength = issueToken.datesUsed.length;
    const remainingTokens = numTokenLimit - datesUsedLength;
    return res.status(StatusCodes.ACCEPTED).json( { remainingTokens } );
}

export const getUsedTokens = async (req, res) => {
    if (validate(req, res)) {
        return res;
    }

    const courseTokenId = parseInt(req.params.courseTokenId, 10);
    const id = req.id; 

    const issueToken = await prisma.issueToken.findUnique({
        where: {
            accountId: id,
            courseTokenId
        },
    })
    const datesUsedLength = issueToken.datesUsed.length;

    return res.status(StatusCodes.ACCEPTED).json( { balance: datesUsedLength } );
}

export const deleteSingle = async (req, res) => {
    if (validate(req, res)) {
        return res;
    }
    const courseTokenId = parseInt(req.params.courseTokenId, 10);
    const issueToken = await prisma.issueToken.deleteMany({
        where: {
            courseTokenId
        }
    });
    const courseToken = await prisma.courseToken.delete({
        where: {
            id: courseTokenId
        }
    });
    return res.status(StatusCodes.ACCEPTED).json({courseToken});
}

export const deleteAll = async (req, res) => {
    if (validate(req, res)) {
        return res;
    }
    const courseId = parseInt(req.params.courseId, 10);
    const issueToken = await prisma.issueToken.deleteMany({
        where: {
            courseTokenId
        }
    });
    const courseToken = await prisma.courseToken.deleteMany({
        where: {
            courseId: courseId
        }
    });
    return res.status(StatusCodes.ACCEPTED).json({courseToken});
}