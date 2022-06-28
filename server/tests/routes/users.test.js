import supertest from "supertest";
import app from "../../src/index.js";
import prisma from "../../prisma/client.js";

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
        },
        {
          name: "Test User II",
          email: "user2@test.io",
        },
      ],
      skipDuplicates: true,
    });

    users = await prisma.user.findMany({
      orderBy: {
        id: "asc",
      },
    });
  });

  describe("HTTP GET request", () => {
    test("Return 200 with all users", async () => {
      const response = await request.get(`${endpoint}`);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe("HTTP GET Request with QUERY parameter", () => {
    test("Return 200 with no users", async () => {
      const query_key = "searchString"; // some query key!
      const query_value = "non-existing"; // some invalid query value!
      const token = ""; // some auth token if needed!
      const response = await request
        .get(`${endpoint}?${query_key}=${query_value}`)
        .set("Authorization", `bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(0);
    });

    test("Return 200 with target user", async () => {
      const query_key = "searchString"; // some query key!
      const query_value = users[0].name; // some valid query value!
      const token = ""; // some auth token if needed!
      const response = await request
        .get(`${endpoint}?${query_key}=${query_value}`)
        .set("Authorization", `bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe("HTTP GET Request with PATH parameter", () => {
    test("Return 400 for bad request", async () => {
      const id = "one"; // invalid ID
      const token = ""; // some auth token if needed!
      const response = await request
        .get(`${endpoint}/${id}`)
        .set("Authorization", `bearer ${token}`);
      expect(response.status).toBe(400);
    });

    test("Return 404 for user not found", async () => {
      const id = Number(users.slice(-1)[0].id) + 10; // user does not exist
      const token = ""; // some auth token if needed!
      const response = await request
        .get(`${endpoint}/${id}`)
        .set("Authorization", `bearer ${token}`);
      expect(response.status).toBe(404);
    });

    test("Return 200 for retriving a user", async () => {
      const id = users.slice(1)[0].id; // valid user ID
      const token = ""; // some auth token if needed!
      const response = await request
        .get(`${endpoint}/${id}`)
        .set("Authorization", `bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(Number(id));
    });
  });

  describe("HTTP POST Request", () => {
    test("Return 400 for bad request for providing extra attribute", async () => {
      const token = ""; // some auth token if needed!
      const attributes = {
        email: "test-user@example.com",
        name: "test user",
        key: "value",
      }; // includes an invalid attribute!
      const response = await request
        .post(`${endpoint}`)
        .send(attributes)
        .set("Authorization", `bearer ${token}`);
      expect(response.status).toBe(400);
    });

    test("Return 400 for bad request for missing a required attribute", async () => {
      const token = ""; // some auth token if needed!
      const attributes = {
        name: "test user",
      }; // missing email attribute!
      const response = await request
        .post(`${endpoint}`)
        .send(attributes)
        .set("Authorization", `bearer ${token}`);
      expect(response.status).toBe(400);
    });

    test("Return 201 for creating an existing user", async () => {
      const token = ""; // some auth token if needed!
      const attributes = {
        email: "test-user@example.com",
        name: "test user",
      };
      const response = await request
        .post(`${endpoint}`)
        .send(attributes)
        .set("Authorization", `bearer ${token}`);
      expect(response.status).toBe(201);
      expect(response.body.data.email).toBe("test-user@example.com");
      expect(response.body.data.name).toBe("test user");
    });
  });

  describe("HTTP PUT Request", () => {
    test("Return 400 for bad request for bad user ID", async () => {
      const id = "one"; // invalid ID
      const token = ""; // some auth token if needed!
      const attributes = {}; // new values for some attributes
      const response = await request
        .put(`${endpoint}/${id}`)
        .send(attributes)
        .set("Authorization", `bearer ${token}`);
      expect(response.status).toBe(400);
    });

    test("Return 400 for bad request for bad user attribute", async () => {
      const id = users.slice(1)[0].id; // valid user ID
      const token = ""; // some auth token if needed!
      const attributes = {
        key: "value",
      }; // an invalid attribute!
      const response = await request
        .put(`${endpoint}/${id}`)
        .send(attributes)
        .set("Authorization", `bearer ${token}`);
      expect(response.status).toBe(400);
    });

    test("Return 404 for user not found", async () => {
      const id = Number(users.slice(-1)[0].id) + 10; // user does not exist
      const token = ""; // some auth token if needed!
      const attributes = {}; // new values for some attributes
      const response = await request
        .put(`${endpoint}/${id}`)
        .send(attributes)
        .set("Authorization", `bearer ${token}`);
      expect(response.status).toBe(404);
    });

    test("Return 200 for updating an existing user", async () => {
      const id = users.slice(1)[0].id; // valid user ID
      const token = ""; // some auth token if needed!
      const attributes = {
        name: "updated name from test",
      };
      const response = await request
        .put(`${endpoint}/${id}`)
        .send(attributes)
        .set("Authorization", `bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(Number(id));
      expect(response.body.data.name).toBe("updated name from test");
    });
  });

  describe("HTTP DELETE Request", () => {
    test("Return 400 for bad request", async () => {
      const id = "one"; // invalid ID
      const token = ""; // some auth token if needed!
      const response = await request
        .delete(`${endpoint}/${id}`)
        .set("Authorization", `bearer ${token}`);
      expect(response.status).toBe(400);
    });

    test("Return 404 for user not found", async () => {
      const id = Number(users.slice(-1)[0].id) + 10; // user does not exist
      const token = ""; // some auth token if needed!
      const response = await request
        .delete(`${endpoint}/${id}`)
        .set("Authorization", `bearer ${token}`);
      expect(response.status).toBe(404);
    });

    test("Return 200 for deleting an existing user", async () => {
      const id = users.slice(1)[0].id; // valid user ID
      const token = ""; // some auth token if needed!
      const response = await request
        .delete(`${endpoint}/${id}`)
        .set("Authorization", `bearer ${token}`);
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
