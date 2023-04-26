import supertest from "supertest";
import { it, expect, beforeAll, describe, afterAll, afterEach } from "vitest";
import app from "../../src/index.js";
import prisma from "../../prisma/client.js";
import { Role } from "@prisma/client";
import { createToken } from "../../src/util/helpers.js";

const request = supertest(app);
const endpoint = "/api/account";

describe(`Test endpoint ${endpoint}`, () => {
  let user, deleteUser, admin, deleteAdmin = {};
  let accountIds = [];

  beforeAll(async () => {
    user = await prisma.account.create({
      data: {
        userName: "Test User",
        email: "user@test.io",
        role: Role.User
      }
    });
    user = {...user, token: createToken({ user: user })};

    deleteUser = await prisma.account.create({
      data: {
        userName: "Test Delete User",
        email: "deletemeuser@test.io",
        role: Role.User
      }
    });
    deleteUser = {...deleteUser, token: createToken({ user: deleteUser })};

    admin = await prisma.account.create({
      data: {
        userName: "Test Admin",
        email: "admin@test.io",
        role: Role.Admin
      }
    });
    admin = {...admin, token: createToken({ user: admin })};

    deleteAdmin = await prisma.account.create({
      data: {
        userName: "Test Delete Admin",
        email: "deletemeadmin@test.io",
        role: Role.Admin
      }
    });
    deleteAdmin = {...deleteAdmin, token: createToken({ user: deleteAdmin })};

    accountIds = [user.id, deleteUser.id, admin.id, deleteAdmin.id];
  });

  afterAll(async () => {
    await prisma.account.deleteMany({
      where: {
        id: {
          in: accountIds
        }
      }
    })
  });

  describe(`Test POST: ${endpoint}/signup`, async () => {
    it("Return 201 with no phone number", async () => {
      const body = {
        email: "email1@test.io",
        name: "test name1",
      }
      const response = await request
        .post(`${endpoint}/signup`)
        .send(body);
        console.log(response.text)
      expect(response.statusCode).toBe(201);
      const user = await prisma.account.findFirst({
        where: {
          email: "email1@test.io"
        }
      });
      expect(user).toBeDefined();
      expect(user.userName).toEqual("test name1");
      accountIds.push(user.id);
    });

    it("Return 201 with phone number", async () => {
      const body = {
        email: "email2@test.io",
        phoneNumber: "11111111111",
        name: "test name2",
      }
      const response = await request
        .post(`${endpoint}/signup`)
        .send(body);
      expect(response.statusCode).toBe(201);
      const user = await prisma.account.findFirst({
        where: {
          email: "email2@test.io"
        }
      });
      expect(user).toBeDefined();
      expect(user.userName).toEqual("test name2");
      expect(user.phoneNumber).toEqual("11111111111");
      accountIds.push(user.id);
    });

    it("Return 409 when email is not unique", async () => {
      const body = {
        email: "user@test.io",
        name: "test name3",
      }
      const response = await request
        .post(`${endpoint}/signup`)
        .send(body);
      expect(response.statusCode).toBe(409);
    });

    it("Return 409 when phone number is not unique", async () => {
      const body = {
        email: "email3@test.io",
        phoneNumber: "11111111111",
        name: "test name3",
      }
      const response = await request
        .post(`${endpoint}/signup`)
        .send(body);
      expect(response.statusCode).toBe(409);
    });

    it("Return 400 when phone number is invalid", async () => {
      const body = {
        email: "email3@test.io",
        phoneNumber: "11111",
        name: "test name3",
      }
      const response = await request
        .post(`${endpoint}/signup`)
        .send(body);
      expect(response.statusCode).toBe(400);
    });

    it("Return 400 when email is invalid", async () => {
      const body = {
        email: "email3",
        name: "test name3",
      }
      const response = await request
        .post(`${endpoint}/signup`)
        .send(body);
      expect(response.statusCode).toBe(400);
    });

    it("Return 400 when name is empty", async () => {
      const body = {
        email: "email3@test.io",
      }
      const response = await request
        .post(`${endpoint}/signup`)
        .send(body);
      expect(response.statusCode).toBe(400);
    });
  });
  describe(`Test POST: ${endpoint}/login`, async () => {
    it("Return 202 with valid user email", async () => {
      const body = {
        email: "user@test.io",
      };
      const response = await request
        .post(`${endpoint}/login`)
        .send(body);
      expect(response.statusCode).toBe(202);
    });

    it("Return 202 with valid admin email", async () => {
      const body = {
        email: "admin@test.io",
      };
      const response = await request
        .post(`${endpoint}/login`)
        .send(body);
      expect(response.statusCode).toBe(202);
    });

    it("Return 403 with invalid email", async () => {
      const body = {
        email: "blah@test.io",
      };
      const response = await request
        .post(`${endpoint}/login`)
        .send(body);
      expect(response.statusCode).toBe(403);
    });
  });

  describe(`Test DELETE: ${endpoint}/:id`, async () => {
    it("Return 202 when deleting a user account", async () => {
      const response = await request
        .delete(`${endpoint}/${deleteUser.id}`)
        .set(
          "Authorization",
          "Bearer " + deleteUser.token
        );
      expect(response.statusCode).toBe(202);
      const deleted = await prisma.account.findFirst({
        where: {
          id: deleteUser.id
        }
      });
      expect(deleted).toBeNull();
    });

    it("Return 202 when deleting an admin account", async () => {
      const response = await request
        .delete(`${endpoint}/${deleteAdmin.id}`)
        .set(
          "Authorization",
          "Bearer " + deleteAdmin.token
        );
      expect(response.statusCode).toBe(202);
      const deleted = await prisma.account.findFirst({
        where: {
          id: deleteAdmin.id
        }
      });
      expect(deleted).toBeNull();
    });

    it("Return 401 when there's no token", async () => {
      const response = await request
        .delete(`${endpoint}/${deleteUser.id}`);
      expect(response.statusCode).toBe(401);
    });

    it("Return 404 when id is invalid", async () => {
      const response = await request
        .delete(`${endpoint}/${deleteUser.id * 2}`)
        .set(
          "Authorization",
          "Bearer " + deleteUser.token
        );
      expect(response.statusCode).toBe(404);
    })
  });

  describe(`Test GET: ${endpoint}/`, async () => {
    it("Return 202 when admin makes the request", async () => {
      const response = await request
        .get(`${endpoint}/`)
        .set(
          "Authorization",
          "Bearer " + admin.token
        );
      expect(response.statusCode).toBe(202);
      expect(response.body.accounts.length).toBeGreaterThanOrEqual(1);
    });

    it("Return 403 when user makes the request", async () => {
      const response = await request
        .get(`${endpoint}/`)
        .set(
          "Authorization",
          "Bearer " + user.token
        );
      expect(response.statusCode).toBe(403);
    })
  });

  describe(`Test POST: ${endpoint}/:id`, async () => {
    it("Return 202 when admin promotes a user", async () => {
      const response = await request
        .post(`${endpoint}/${user.id}`)
        .set(
          "Authorization",
          "Bearer " + admin.token
        );
      expect(response.statusCode).toBe(202);
      const promoted = await prisma.account.findFirst({
        where: {
          id: user.id
        }
      });
      expect(promoted.role).toEqual(Role.Admin);
    });

    it("Return 400 when user id does not exist", async () => {
      const response = await request
        .post(`${endpoint}/${user.id * 2}`)
        .set(
          "Authorization",
          "Bearer " + admin.token
        );
      expect(response.statusCode).toBe(400);
    });

    it("Return 403 when providing a user token", async () => {
      const response = await request
        .post(`${endpoint}/${user.id}`)
        .set(
          "Authorization",
          "Bearer " + user.token
        );
      expect(response.statusCode).toBe(403);
    });
  });
})