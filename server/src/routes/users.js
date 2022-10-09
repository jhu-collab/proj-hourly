import express from "express";
import { checkToken, refreshToken } from "../util/middleware.js";
import prisma from "../../prisma/client.js";
import {
  usernameSchema,
  emailSchema,
  requestIdSchema,
} from "../util/validators.js";
import checkPermission from "../util/auth.js";
import { hashPassword } from "../util/password.js";
import { factory } from "../util/debug.js";

const debug = factory(import.meta.url);
const router = express.Router();
const endpoint = "/users";

// Guide: https://www.prisma.io/docs/concepts/components/prisma-client/crud

router.get(
  `${endpoint}`,
  checkToken,
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);

    try {
      debug(`Check access permission...`);
      checkPermission(req, {
        method: "GET",
        resource: endpoint,
        role: req.user.role,
        user: req.user.id,
      });

      debug(`Reading request query parameters...`);
      const { skip, take, ...rest } = req.query;
      // "skip" and "take" are for pagination,
      // see https://www.prisma.io/docs/concepts/components/prisma-client/pagination

      const conditions = [];
      for (const key in rest) {
        conditions.push({
          [key]: { contains: rest[key] },
        });
      }

      const filter =
        conditions.length > 0
          ? {
              AND: conditions,
            }
          : {};

      debug(`Reading users from the database...`);
      const data = await prisma.user.findMany({
        where: filter,
        take: Number(take) || undefined,
        skip: Number(skip) || undefined,
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
          preferredName: true,
          role: true,
        },
      });
      debug(`Successfully retrieved ${data.length} users!`);

      debug(`Preparing the response payload...`);
      res.locals.payload = {
        status: 200,
        message: `Successfully retrieved ${data.length} users!`,
        data: data,
      };

      debug(`Done with ${req.method} ${req.path} `);
      next();
    } catch (err) {
      debug(`There was an error processing ${req.method} ${req.path} `);
      next(err);
    }
  },
  refreshToken
);

router.get(
  `${endpoint}/:id`,
  checkToken,
  async (req, res, next) => {
    debug(`${req.method} ${req.originalUrl} called...`);

    try {
      debug(`Parse user ID recieved as request parameter...`);
      const id = Number(req.params.id);
      requestIdSchema.parse(id);

      debug(`Check access permission...`);
      checkPermission(req, {
        method: "GET",
        resource: endpoint,
        role: req.user.role,
        user: req.user.id,
        owner: id,
      });

      debug(`Find the user in the database...`);
      const data = await prisma.user.findUniqueOrThrow({
        where: { id },
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
          preferredName: true,
          role: true,
        },
      });

      debug(`Found ${data.username} - preparing the response payload...`);
      res.locals.payload = {
        status: 200,
        message: `Successfully retrieved the following user!`,
        data: data,
      };

      debug(`Done with ${req.method} ${req.originalUrl}`);
      next();
    } catch (err) {
      debug(`There was an error processing ${req.method} ${req.originalUrl}`);
      next(err);
    }
  },
  refreshToken
);

router.post(
  `${endpoint}`,
  checkToken,
  async (req, res, next) => {
    debug(`${req.method} ${req.path} called...`);

    try {
      debug(`Check access permission...`);
      checkPermission(req, {
        method: "POST",
        resource: endpoint,
        role: req.user.role,
        user: req.user.id,
      });

      debug(`Validating the request payload body...`);
      const { username, email, password, ...rest } = req.body;
      usernameSchema.parse(username);
      emailSchema.parse(email);
      const hashedPassword = password ? hashPassword(password) : undefined;

      debug(`Storing the user in the database...`);
      const data = await prisma.user.create({
        data: { username, email, hashedPassword, ...rest },
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
          preferredName: true,
          role: true,
        },
      });

      debug(`Created ${data.username} - preparing the response payload...`);
      res.locals.payload = {
        status: 201,
        message: `Successfully created the following user!`,
        data: data,
      };

      debug(`Done with ${req.method} ${req.path}`);
      next();
    } catch (err) {
      debug(`There was an error processing ${req.method} ${req.path}`);
      next(err);
    }
  },
  refreshToken
);

router.put(
  `${endpoint}/:id`,
  checkToken,
  async (req, res, next) => {
    debug(`${req.method} ${req.originalUrl} called...`);

    try {
      debug(`Parse user ID recieved as request parameter...`);
      const id = Number(req.params.id);
      requestIdSchema.parse(id);

      debug(`Check access permission...`);
      checkPermission(req, {
        method: "PUT",
        resource: endpoint,
        role: req.user.role,
        user: req.user.id,
        owner: id,
      });

      debug(`Validating the request payload body...`);
      const { username, email, password, ...rest } = req.body;
      username && usernameSchema.parse(username); // FIXME: perhaps disallow updating username!
      email && emailSchema.parse(email);
      const hashedPassword = password ? hashPassword(password) : undefined;

      debug(`Update the user from the database...`);
      const data = await prisma.user.update({
        where: { id },
        data: { username, email, hashedPassword, ...rest },
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
          preferredName: true,
          role: true,
        },
      });

      debug(`Updated ${data.username} - preparing the response payload...`);
      res.locals.payload = {
        status: 200,
        message: `Successfully updated the following user!`,
        data: data,
      };

      debug(`Done with ${req.method} ${req.originalUrl}`);
      next();
    } catch (err) {
      debug(`There was an error processing ${req.method} ${req.originalUrl}`);
      next(err);
    }
  },
  refreshToken
);

router.delete(
  `${endpoint}/:id`,
  checkToken,
  async (req, res, next) => {
    debug(`${req.method} ${req.originalUrl} called...`);

    try {
      debug(`Parse user ID recieved as request parameter...`);
      const id = Number(req.params.id);
      requestIdSchema.parse(id);

      debug(`Check access permission...`);
      checkPermission(req, {
        method: "DELETE",
        resource: endpoint,
        role: req.user.role,
        user: req.user.id,
        owner: id,
      });

      debug(`Delete the user from the database...`);
      const data = await prisma.user.delete({
        where: { id },
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
          preferredName: true,
          role: true,
        },
      });

      debug(`Deleted ${data.username} - preparing the response payload...`);
      res.locals.payload = {
        status: 200,
        message: `Successfully deleted the following user!`,
        data: data,
      };

      debug(`Done with ${req.method} ${req.originalUrl}`);
      next();
    } catch (err) {
      debug(`There was an error processing ${req.method} ${req.originalUrl}`);
      next(err);
    }
  },
  refreshToken
);

export default router;
