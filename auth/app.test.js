const request = require("supertest");
const authApp = require("./app.js");
//const queryApp = require("../query/app.js");

describe("Workflow Test", () => {
  describe("Start test", () => {
    let seller;
    let user;
    //AUTH
    test("REGISTER SELLER : should PASS", async () => {
      const response = await request(authApp).post("/auth/register").send({
        userName: "testSeller",
        password: "password",
        isSeller: true,
      });
      expect(response.statusCode).toBe(201);
    });
    test("REGISTER USER : should PASS", async () => {
      const response = await request(authApp).post("/auth/register").send({
        userName: "testUSER",
        password: "password",
        isSeller: true,
      });
      expect(response.statusCode).toBe(201);
    });
    test("LOGIN SELLER : should PASS", async () => {
      const response = await request(authApp).post("/auth/login").send({
        userName: "testSeller",
        password: "password",
      });
      seller = response;
      expect(response.statusCode).toBe(201);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      expect(response.body.userName).toBeDefined();
      expect(response.body.isSeller).toBeDefined();
    });
    test("LOGIN USER : should PASS", async () => {
      const response = await request(authApp).post("/auth/login").send({
        userName: "testUSER",
        password: "password",
      });
      user = response;
      expect(response.statusCode).toBe(201);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      expect(response.body.userName).toBeDefined();
      expect(response.body.isSeller).toBeDefined();
    });
    test("LOGIN USER : should FAIL", async () => {
      const response = await request(authApp).post("/auth/login").send({
        userName: "testSeller",
      });
      expect(response.statusCode).toBe(400);
    });
    test("LOGIN USER :should FAIL", async () => {
      const response = await request(authApp).post("/auth/login").send({
        password: "password",
      });
      expect(response.statusCode).toBe(400);
    });

    //QUERY

    // test("QUERY PRODUCT :", async () => {
    //   const response = await request(queryApp).get("/products").send();
    //   expect(response.statusCode).toBe(201);
    // });

    // test("QUERY PRODUCT :", async () => {
    //   const response = await request(queryApp)
    //     .post("/product/create")
    //     .set("Authorization", `Bearer ${seller.accessToken}`)
    //     .send({
    //       name: "test",
    //       price: "1000",
    //       stock: "20",
    //       imageUrl:
    //         "https://www.rallis.com/Upload/Images/thumbnail/Product-inside.png",
    //     });
    //   expect(response.statusCode).toBe(201);
    // });

    test("DELETE USER : should PASS", async () => {
      const response = await request(authApp).delete("/auth/delete").send({
        userName: "testSeller",
      });
      expect(response.statusCode).toBe(201);
    });
  });
});
