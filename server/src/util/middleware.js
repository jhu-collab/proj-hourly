import { isPrismaError, prismaErrorToHttpError } from "./helpers.js";
import { ZodError } from "zod";
import { createToken, decodeToken } from "./token.js";
import ApiError from "../model/ApiError.js";
import prisma from "../../prisma/client.js";
import { factory } from "./debug.js";

const debug = factory(import.meta.url);

export const checkApiKey = async (req, res, next) => {
  debug(`checkApiKey is called...`);
  try {
    debug(`Read the stored API key from ENV variable...`);
    const sourceKey = process.env.HOURLY_API_KEY;
    debug(`Read the request header to extract the provided API key...`);
    const givenKey = req.headers["api_key"];

    if (!givenKey) {
      debug(`No API key was provided!..`);
      throw new ApiError(401, "No API key was provided!");
    }

    if (sourceKey !== givenKey) {
      debug(`Invalid API key!..`);
      throw new ApiError(403, "Invalid API key!");
    }

    debug("Api key is valid!");
    debug(`checkApiKey is done!`);
    next();
  } catch (err) {
    debug("Error in checkApiKey...");
    debug({ err });
    next(err);
  }
};

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
    debug(`Token belongs to ${userInfo.username}`);

    debug(
      `Attaching user and token (and its decoded expirtation date) to the req object`
    );
    req.user = userInfo;
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
        debug(`Check if the incoming token matches the stored token...`);
        if (token !== user.token) {
          debug(`Tokens did not match!`);
          throw new ApiError(401, "Authorization token error!");
        }

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
        // 1. A verifued and authenticated user deleted itself!
        // 2. The token was created manually without correct user info (e.g. by a developer)
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
