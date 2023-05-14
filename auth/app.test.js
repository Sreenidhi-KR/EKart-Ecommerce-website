const request = require("supertest");
const app = require("./app.js");

describe("Auth Service Test", () => {
  describe("given a username and password", () => {
    test("REGISTER USER : should respond with a 200 status code", async () => {
      const response = await request(app).post("/auth/register").send({
        userName: "testUser3",
        password: "testPassword",
        isSeller: true,
      });
      expect(response.statusCode).toBe(201);
    });
    test("LOGIN USER : should respond with a 200 status code", async () => {
      const response = await request(app).post("/auth/login").send({
        userName: "testUser3",
        password: "testPassword",
      });
      expect(response.statusCode).toBe(201);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      expect(response.body.userName).toBeDefined();
      expect(response.body.isSeller).toBeDefined();
    });
    test("LOGIN USER : should respond with a 400 status code", async () => {
      const response = await request(app).post("/auth/login").send({
        userName: "testUser3",
      });
      expect(response.statusCode).toBe(400);
    });
    test("LOGIN USER :should respond with a 400 status code", async () => {
      const response = await request(app).post("/auth/login").send({
        password: "password",
      });
      expect(response.statusCode).toBe(400);
    });
    test("DELETE USER : should respond with a 200 status code", async () => {
      const response = await request(app).delete("/auth/delete").send({
        userName: "testUser3",
      });
      expect(response.statusCode).toBe(201);
    });
  });
});
