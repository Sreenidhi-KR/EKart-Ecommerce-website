const request = require("supertest");
const app = require("./app.js");

describe("Workflow Test", () => {
  describe("Start test", () => {
    jest.setTimeout(30000);
    test("QUERY PRODUCT :", async () => {
      const response = await request(app).get("/products").send();
      expect(response.statusCode).toBe(200);
      expect(response.body).toBeDefined();
    });
  });
});
