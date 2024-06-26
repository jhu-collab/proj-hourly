import { isPrismaError, prismaErrorToHttpError } from "./helpers.js";
import { ZodError } from "zod";
import { createToken, decodeToken } from "./token.js";
import ApiError from "../model/ApiError.js";
import prisma from "../../prisma/client.js";
import { factory } from "./debug.js";

const debug = factory(import.meta.url);

export const checkToken = async (req, res, next) => {
  debug(`checkToken is called!`);
  try {
    const bearerHeader = req.headers["authorization"];
    debug(`Read the authorization header...`);
    if (!bearerHeader) {
      throw new ApiError(401, "No authorization token was provided!");
    }
    debug(`Extract the token from auth header...`);
    const bearer = bearerHeader.split(" ");
    const token = bearer[1];

    debug(`Decoding the token ...`);
    const { iat, exp, ...userInfo } = decodeToken(token);
    const account = await prisma.account.findUnique({
      where: {
        id: userInfo.id,
      },
    });
    if (account == null || account == undefined) {
      throw new ApiError(404, "Authorization token not found!");
    } else if (
      account.userName != userInfo.userName ||
      account.firstName != userInfo.firstName ||
      account.lastName != userInfo.lastName ||
      account.email != userInfo.email ||
      account.role != userInfo.role
    ) {
      throw new ApiError(401, "Invalid Authorization token was provided!");
    }
    debug(`Token belongs to ${userInfo.userName}`);

    debug(
      `Attaching user and token (and its decoded expirtation date) to the req object`
    );
    req.user = userInfo;
    req.id = userInfo.id;
    req.token = {
      value: token,
      expiresIn: exp,
      issuedAt: iat,
    };
    debug(`checkToken is done!`);
    next();
  } catch (err) {
    debug(`Error in checkToken: ${JSON.stringify(err, null, 2)}`);
    if (err && err.name === "TokenExpiredError") {
      next(new ApiError(401, "Authorization token expired!"));
    } else if (err && err.name === "JsonWebTokenError") {
      next(new ApiError(401, `Authorization error ${err.message}`));
    } else {
      next(err);
    }
  }
};

// Pre: req object contains the token and user info
/* c8 ignore start */
export const refreshToken = async (req, res, next) => {
  debug(`refreshToken is called!`);

  try {
    const { value: token, expiresIn } = req.token;
    const { payload } = res.locals;

    let refreshedToken = "";
    if (!expiresIn) {
      debug("It's a non-expiring token - no need to refresh it!");
      refreshedToken = token;
    } else {
      debug("Retrieve the owner of this token from the database...");
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      if (user) {
        /* 
          BUG: If we check against the stored one, a user cannot work with the app from two different devices as 
          they will have to sign out and in from one device every time they work from another. 
          We can still use the refresh token strategy to update the token so effectively that a user session does 
          not expire as long as they are working with the app.
        */
        // debug(`Check if the incoming token matches the stored token...`);
        // if (token !== user.token) {
        //   debug(`Tokens did not match!`);
        //   throw new ApiError(401, "Authorization token error!");
        // }

        debug(`Create a new token...`);
        const {
          hashedPassword,
          createdAt,
          updatedAt,
          token: storedToken,
          ...userInfo
        } = user;
        refreshedToken = createToken({
          user: { ...userInfo },
        });

        debug(`Store the new token in the database...`);
        await prisma.user.update({
          where: { id: userInfo.id },
          data: {
            token: refreshedToken,
          },
        });
      } else {
        debug(`No user found with this token!`);
        // This can happen under two conditions:
        // 1. A verified and authenticated user deleted itself!
        //    TODO: for this case, perhaps we should expire the token!
        // 2. The token was created manually without correct user info (e.g. by a developer)
        //    TODO: for this case, perhaps we should not allow a developer to do this!
        debug(`Returning the original token without refreshing it!`);
        refreshedToken = token;
      }
    }

    debug(`Return payload with refresh token attached...`);
    res.status(payload.status || 200).json({
      ...payload,
      token: refreshedToken,
    });

    debug(`refreshToken is done!`);
    next();
  } catch (err) {
    debug(`Error in refreshToken: ${JSON.stringify(err, null, 2)}`);
    next(err);
  }
};
/* c8 ignore end */

export const globalErrorHandler = (err, req, res, next) => {
  debug(`globalErrorHandler is called!`);
  if (err) {
    debug(err);
    if (err instanceof ZodError) {
      return res
        .status(400)
        .json({ message: err.issues[0].message || "Bad request!" });
    } else if (
      (err.name && err.name === "NotFoundError") ||
      (err.name && err.name === "RecordNotFound")
    ) {
      // Prisma throws NotFoundError when findUnique fails to find the resource!
      // It throws RecordNotFound when delete or update operations fail to find the record.
      return res.status(404).json({ message: err.message });
    } else if (isPrismaError(err)) {
      // Check for other Prisma Errors
      prismaErrorToHttpError(err, res);
    } else {
      return res
        .status(err.status || 500)
        .json({ message: err.message || "Internal server error!" });
    }
  }
  next();
};
