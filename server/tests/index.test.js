import supertest from "supertest";
import app from "../src/index.js";

const request = supertest(app);

// test.skip( /*  to skip this test */ )
// test.only( /*  to only run this test */ )
test("Get 200 for API homepage", async () => {
  const response = await request.get("/");
  expect(response.status).toBe(200);
});
