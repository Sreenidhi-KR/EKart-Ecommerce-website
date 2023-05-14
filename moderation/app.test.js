const request = require("supertest");
const app = require("./app.js");

describe("Moderation Service Test", () => {
  describe("on recieve event", () => {
    test("ReviewCreated : should respond with a 200 status code", async () => {
      const response = await request(app)
        .post("/events")
        .send({
          type: "ReviewCreated",
          data: {
            content: "good",
            status: "ReviewCreated",
          },
        });
      expect(response.statusCode).toBe(201);
    });
  });
});
