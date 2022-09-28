import express from "express";
import prisma from "../../prisma/client.js";
import { verifyPassword } from "../util/password.js";
import { createToken } from "../util/token.js";
import ApiError from "../model/ApiError.js";
import { factory } from "../util/debug.js";

const debug = factory(import.meta.url);
const router = express.Router();
const endpoint = "/authenticate";

router.post(`${endpoint}`, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      debug(`Request is missing username or password or both!`);
      throw new ApiError(400, "You must provide both username and password.");
    }

    debug(`Looking up ${username} in the database...`);
    const user = await prisma.account.findUnique({
      where: { userName: username },
    });

    if (!user) {
      debug(`Did not find ${username}!`);
      throw new ApiError(403, "Wrong username or password.");
    }

    debug(`Verifying password for ${username}...`);
    const passwordValid = verifyPassword(password, user.hashedPassword);
    if (!passwordValid) {
      debug(`Wrong password!`);
      throw new ApiError(403, "Wrong username or password.");
    }

    debug(`Creating auth token...`);
    const {
      hashedPassword,
      createdAt,
      updatedAt,
      token: storedToken,
      ...userInfo
    } = user;
    const token = createToken({ user: { ...userInfo } });

    debug(`Storing the token in the database...`);
    await prisma.account.update({
      where: { id: user.id },
      data: {
        token,
      },
    });

    debug(`Preparing the response payload...`);
    res.json({
      status: 200,
      message: "Authentication successful!",
      data: {
        userName: user.username,
      },
      token,
    });
    debug(`Done with ${req.method} ${req.path} `);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

export default router;
