import supertest from "supertest";
import app from "../../src/index.js";

const request = supertest(app);
const endpoint = "/api/users";

describe(`Test endpoint ${endpoint}`, () => {
  beforeAll(async () => {
    // set up a test database and seed it with test data
  });

  describe("HTTP GET request", () => {
    test("Return 501", async () => {
      const response = await request.get(`${endpoint}`);
      expect(response.status).toBe(501);
    });
  });

  describe("HTTP GET Request with QUERY parameter", () => {
    test("Return 501", async () => {
      const query_key = "key"; // some query key!
      const query_value = "value"; // some query value!
      const token = ""; // some auth token if needed!
      const response = await request
        .get(`${endpoint}?${query_key}=${query_value}`)
        .set("Authorization", `bearer ${token}`);
      expect(response.status).toBe(501);
    });
  });

  describe("HTTP GET Request with PATH parameter", () => {
    test("Return 501", async () => {
      const id = "001"; // some user id to get info about!
      const token = ""; // some auth token if needed!
      const response = await request
        .get(`${endpoint}/${id}`)
        .set("Authorization", `bearer ${token}`);
      expect(response.status).toBe(501);
    });
  });

  describe("HTTP POST Request", () => {
    test("Return 501", async () => {
      const token = ""; // some auth token if needed!
      const attributes = {}; // new user's attributes
      const response = await request
        .post(`${endpoint}`)
        .send(attributes)
        .set("Authorization", `bearer ${token}`);
      expect(response.status).toBe(501);
    });
  });

  describe("HTTP PUT Request", () => {
    test("Return 501", async () => {
      const id = "001"; // some user id to be updated!
      const token = ""; // some auth token if needed!
      const attributes = {}; // new values for some attributes
      const response = await request
        .put(`${endpoint}/${id}`)
        .send(attributes)
        .set("Authorization", `bearer ${token}`);
      expect(response.status).toBe(501);
    });
  });

  describe("HTTP DELETE Request", () => {
    test("Return 501", async () => {
      const id = "001"; // some user id to be deleted!
      const token = ""; // some auth token if needed!
      const response = await request
        .delete(`${endpoint}/${id}`)
        .set("Authorization", `bearer ${token}`);
      expect(response.status).toBe(501);
    });
  });

  afterAll(async () => {
    // tear down the test database or delete the test data
  });
});
