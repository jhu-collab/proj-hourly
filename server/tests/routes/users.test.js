import supertest from "supertest";
import app from "../../src/index.js";
import prisma from "../../prisma/client.js";
import { createToken } from "../../src/util/helpers.js";

const request = supertest(app);
const endpoint = "/api/users";

describe(`Test endpoint ${endpoint}`, () => {
  let users = [];

  beforeAll(async () => {
    // create the users
    await prisma.user.createMany({
      data: [
        {
          name: "Test User I",
          email: "user1@test.io",
          role: "USER",
        },
        {
          name: "Test User II",
          email: "user2@test.io",
          role: "USER",
        },
        {
          name: "Test User III",
          email: "user3@test.io",
          role: "ADMIN",
        },
        {
          name: "Test User IIII",
          email: "user4@test.io",
          role: "ADMIN",
        },
      ],
      skipDuplicates: true,
    });

    users = await prisma.user.findMany({
      orderBy: {
        id: "asc",
      },
    });

    // Augment the users' objects with auth tokens
    users = users.map((user) => ({
      ...user,
      token: createToken({ user }),
      expiredToken: createToken({ user, expiresIn: "0" }),
    }));
  });

  describe("HTTP GET request", () => {
    it("Return 401 when no authorization token is provided", async () => {
      const response = await request.get(`${endpoint}`);
      expect(response.status).toBe(401);
    });

    it("Return 401 when authorization token is expired", async () => {
      const response = await request
        .get(`${endpoint}`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === "ADMIN").expiredToken
        );
      expect(response.status).toBe(401);
    });

    it("Return 403 when authorization token belongs to a (regular) USER", async () => {
      const response = await request
        .get(`${endpoint}`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === "USER").token
        );
      expect(response.status).toBe(403);
    });

    test("Return 200 with all users when authorization token belongs to an ADMIN", async () => {
      const response = await request
        .get(`${endpoint}`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === "ADMIN").token
        );
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe("HTTP GET Request with QUERY parameter", () => {
    test("Return 200 with no users", async () => {
      const query_key = "searchString"; // some query key!
      const query_value = "non-existing"; // some invalid query value!
      const response = await request
        .get(`${endpoint}?${query_key}=${query_value}`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === "ADMIN").token
        );
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(0);
    });

    test("Return 200 with target user", async () => {
      const query_key = "searchString"; // some query key!
      const query_value = users[0].name; // some valid query value!
      const response = await request
        .get(`${endpoint}?${query_key}=${query_value}`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === "ADMIN").token
        );
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe("HTTP GET Request with PATH parameter", () => {
    it("Return 401 when no authorization token is provided", async () => {
      const id = users.slice(1)[0].id; // valid user ID
      const response = await request.get(`${endpoint}/${id}`);
      expect(response.status).toBe(401);
    });

    it("Return 401 when authorization token is expired", async () => {
      const id = users.slice(1)[0].id; // valid user ID
      const response = await request
        .get(`${endpoint}/${id}`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === "ADMIN").expiredToken
        );
      expect(response.status).toBe(401);
    });

    it("Return 403 when a USER attempts to access another USER's account", async () => {
      const regularUsers = users.filter((u) => u.role === "USER");
      const id = regularUsers[0].id; // valid user ID
      const response = await request
        .get(`${endpoint}/${id}`)
        .set("Authorization", "bearer " + regularUsers[1].token);
      expect(response.status).toBe(403);
    });

    test("Return 400 for bad request", async () => {
      const id = "one"; // invalid ID
      const response = await request
        .get(`${endpoint}/${id}`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === "ADMIN").token
        );
      expect(response.status).toBe(400);
    });

    test("Return 404 for user not found", async () => {
      const id = Number(users.slice(-1)[0].id) + 10; // user does not exist
      const response = await request
        .get(`${endpoint}/${id}`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === "ADMIN").token
        );
      expect(response.status).toBe(404);
    });

    test("Return 200 when an ADMIN request any user account", async () => {
      const id = users.slice(1)[0].id; // valid user ID
      const response = await request
        .get(`${endpoint}/${id}`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === "ADMIN").token
        );
      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(Number(id));
    });

    it("Return 200 when a USER attempts to access own account", async () => {
      const regularUsers = users.filter((u) => u.role === "USER");
      const id = regularUsers[0].id; // valid user ID
      const response = await request
        .get(`${endpoint}/${id}`)
        .set("Authorization", "bearer " + regularUsers[0].token);
      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(Number(id));
    });
  });

  describe("HTTP POST Request", () => {
    it("Return 401 when no authorization token is provided", async () => {
      const attributes = {
        email: "test-user@example.com",
        name: "test user",
      };
      const response = await request.post(`${endpoint}`).send(attributes);
      expect(response.status).toBe(401);
    });

    it("Return 401 when authorization token is expired", async () => {
      const attributes = {
        email: "test-user@example.com",
        name: "test user",
      };
      const response = await request
        .post(`${endpoint}`)
        .send(attributes)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === "ADMIN").expiredToken
        );
      expect(response.status).toBe(401);
    });

    it("Return 403 when a USER attempts to create an account", async () => {
      const regularUsers = users.filter((u) => u.role === "USER");
      const attributes = {
        email: "test-user@example.com",
        name: "test user",
      };
      const response = await request
        .post(`${endpoint}`)
        .send(attributes)
        .set("Authorization", "bearer " + regularUsers[1].token);
      expect(response.status).toBe(403);
    });

    test("Return 400 for bad request for providing extra attribute", async () => {
      const attributes = {
        email: "test-user@example.com",
        name: "test user",
        key: "value",
      }; // includes an invalid attribute!
      const response = await request
        .post(`${endpoint}`)
        .send(attributes)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === "ADMIN").token
        );
      expect(response.status).toBe(400);
    });

    test("Return 400 for bad request for invalid email attribute", async () => {
      const attributes = {
        email: "test-user-email",
        name: "test user",
      }; // includes an invalid attribute!
      const response = await request
        .post(`${endpoint}`)
        .send(attributes)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === "ADMIN").token
        );
      expect(response.status).toBe(400);
    });

    test("Return 400 for bad request for missing a required attribute", async () => {
      const attributes = {
        name: "test user",
      }; // missing email attribute!
      const response = await request
        .post(`${endpoint}`)
        .send(attributes)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === "ADMIN").token
        );
      expect(response.status).toBe(400);
    });

    test("Return 201 for creating an existing user", async () => {
      const attributes = {
        email: "test-user@example.com",
        name: "test user",
      };
      const response = await request
        .post(`${endpoint}`)
        .send(attributes)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === "ADMIN").token
        );
      expect(response.status).toBe(201);
      expect(response.body.data.email).toBe("test-user@example.com");
      expect(response.body.data.name).toBe("test user");
    });
  });

  describe("HTTP PUT Request", () => {
    it("Return 401 when no authorization token is provided", async () => {
      const id = users.slice(1)[0].id; // valid user ID
      const attributes = {
        name: "updated name from test",
      };
      const response = await request.put(`${endpoint}/${id}`).send(attributes);
      expect(response.status).toBe(401);
    });

    it("Return 401 when authorization token is expired", async () => {
      const id = users.slice(1)[0].id; // valid user ID
      const attributes = {
        name: "updated name from test",
      };
      const response = await request
        .put(`${endpoint}/${id}`)
        .send(attributes)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === "ADMIN").expiredToken
        );
      expect(response.status).toBe(401);
    });

    it("Return 403 when a USER attempts to update another USER's account", async () => {
      const regularUsers = users.filter((u) => u.role === "USER");
      const id = regularUsers[0].id; // valid user ID
      const attributes = {
        name: "updated name from test",
      };
      const response = await request
        .put(`${endpoint}/${id}`)
        .send(attributes)
        .set("Authorization", "bearer " + regularUsers[1].token);
      expect(response.status).toBe(403);
    });

    test("Return 400 for bad request for bad user ID", async () => {
      const id = "one"; // invalid ID
      const attributes = {}; // new values for some attributes
      const response = await request
        .put(`${endpoint}/${id}`)
        .send(attributes)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === "ADMIN").token
        );
      expect(response.status).toBe(400);
    });

    test("Return 400 for bad request for bad user attribute", async () => {
      const id = users.slice(1)[0].id; // valid user ID
      const attributes = {
        key: "value",
      }; // an invalid attribute!
      const response = await request
        .put(`${endpoint}/${id}`)
        .send(attributes)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === "ADMIN").token
        );
      expect(response.status).toBe(400);
    });

    test("Return 404 for user not found", async () => {
      const id = Number(users.slice(-1)[0].id) + 10; // user does not exist
      const attributes = {
        name: "updated name from test",
      };
      const response = await request
        .put(`${endpoint}/${id}`)
        .send(attributes)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === "ADMIN").token
        );
      expect(response.status).toBe(404);
    });

    test("Return 200 when an ADMIN updates a user account", async () => {
      const regularUsers = users.filter((u) => u.role === "USER");
      const id = regularUsers[1].id; // valid user ID
      const attributes = {
        name: "updated name from test",
      };
      const response = await request
        .put(`${endpoint}/${id}`)
        .send(attributes)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === "ADMIN").token
        );
      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(Number(id));
      expect(response.body.data.name).toBe("updated name from test");
    });

    it("Return 200 when a USER attempts to update own account", async () => {
      const regularUsers = users.filter((u) => u.role === "USER");
      const id = regularUsers[0].id; // valid user ID
      const attributes = {
        name: "updated name from test",
      };
      const response = await request
        .put(`${endpoint}/${id}`)
        .send(attributes)
        .set("Authorization", "bearer " + regularUsers[0].token);
      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(Number(id));
      expect(response.body.data.name).toBe("updated name from test");
    });
  });

  describe("HTTP DELETE Request", () => {
    it("Return 401 when no authorization token is provided", async () => {
      const id = users.slice(1)[0].id; // valid user ID
      const response = await request.delete(`${endpoint}/${id}`);
      expect(response.status).toBe(401);
    });

    it("Return 401 when authorization token is expired", async () => {
      const id = users.slice(1)[0].id; // valid user ID
      const response = await request
        .delete(`${endpoint}/${id}`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === "ADMIN").expiredToken
        );
      expect(response.status).toBe(401);
    });

    it("Return 403 when a USER attempts to delete another USER's account", async () => {
      const regularUsers = users.filter((u) => u.role === "USER");
      const id = regularUsers[0].id; // valid user ID
      const response = await request
        .delete(`${endpoint}/${id}`)
        .set("Authorization", "bearer " + regularUsers[1].token);
      expect(response.status).toBe(403);
    });

    test("Return 400 for bad request", async () => {
      const id = "one"; // invalid ID
      const response = await request
        .delete(`${endpoint}/${id}`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === "ADMIN").token
        );
      expect(response.status).toBe(400);
    });

    test("Return 404 for user not found", async () => {
      const id = Number(users.slice(-1)[0].id) + 10; // user does not exist
      const response = await request
        .delete(`${endpoint}/${id}`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === "ADMIN").token
        );
      expect(response.status).toBe(404);
    });

    test("Return 200 for deleting an existing user", async () => {
      const id = users.slice(1)[0].id; // valid user ID
      const response = await request
        .delete(`${endpoint}/${id}`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === "ADMIN").token
        );
      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(Number(id));
    });

    it("Return 200 when a USER attempts to delete own account", async () => {
      const regularUsers = users.filter((u) => u.role === "USER");
      const id = regularUsers[0].id; // valid user ID
      const response = await request
        .delete(`${endpoint}/${id}`)
        .set("Authorization", "bearer " + regularUsers[0].token);
      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(Number(id));
    });
  });

  afterAll(async () => {
    const deleteUsers = prisma.user.deleteMany();

    await prisma.$transaction([deleteUsers]);

    await prisma.$disconnect();
    // Tear down the test database by `yarn docker:down`
  });
});
