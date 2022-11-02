import express from "express";
import prisma from "../../prisma/client.js";
import { Role } from "@prisma/client";
import { createToken } from "../util/token.js";
import { checkApiKey } from "../util/middleware.js";
import { factory } from "../util/debug.js";

const debug = factory(import.meta.url);
const router = express.Router();
const endpoint = "/sso/jhu";

router.post(`${endpoint}`, checkApiKey, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);

  try {
    let status = 200;
    const { jhed, role, email, firstName, lastName, preferredName } = req.body;
    debug(`Looking up username=${jhed} in the database...`);
    let user = await prisma.account.findUnique({
      where: { userName: jhed },
    });

    if (!user) {
      debug(
        `Did not find username=${jhed}! It must be first time they are siging it...`
      );
      debug(`Storing this user in the database...`);
      debug(
        `User role on SIS is ${role}; their role in our database will be ${Role.User}`
      );
      user = await prisma.account.create({
        data: {
          userName: jhed,
          email,
          firstName,
          lastName,
          preferredName,
          role: Role.User,
        },
      });
      status = 201;
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
    res.status(status).json({
      status,
      message: "Authentication successful!",
      data: {
        username: user.username,
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
