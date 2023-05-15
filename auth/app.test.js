const request = require("supertest");
const authApp = require("./testapp.js");
//const queryApp = require("../query/app.js");

describe("Workflow Test", () => {
  describe("Start test", () => {
    let seller;
    let user;
    //AUTH
    test("REGISTER SELLER : should respond 201", async () => {
      const response = await request(authApp).post("/auth/register").send({
        userName: "testSeller",
        password: "password",
        isSeller: true,
      });
      expect(response.statusCode).toBe(201);
    });
    test("REGISTER USER : should respond 201", async () => {
      const response = await request(authApp).post("/auth/register").send({
        userName: "testUSER3",
        password: "password",
        isSeller: true,
      });
      expect(response.statusCode).toBe(201);
    });
    test("REGISTER USER Invalid/No Username: should respond 400", async () => {
      const response = await request(authApp).post("/auth/register").send({
        password: "password",
        isSeller: true,
      });
      expect(response.statusCode).toBe(400);
    });
    test("REGISTER USER Already exists : should respond 400", async () => {
      const response = await request(authApp).post("/auth/register").send({
        userName: "testUSER3",
        password: "password",
        isSeller: true,
      });
      expect(response.statusCode).toBe(400);
    });

    test("LOGIN SELLER : should PASS", async () => {
      const response = await request(authApp).post("/auth/login").send({
        userName: "testSeller",
        password: "password",
      });
      seller = response.body;
      expect(response.statusCode).toBe(201);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      expect(response.body.userName).toBeDefined();
      expect(response.body.isSeller).toBeDefined();
    });
    test("LOGIN USER : should PASS", async () => {
      const response = await request(authApp).post("/auth/login").send({
        userName: "testUSER3",
        password: "password",
      });
      user = response.body;
      expect(response.statusCode).toBe(201);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      expect(response.body.userName).toBeDefined();
      expect(response.body.isSeller).toBeDefined();
    });
    test("LOGIN USER no Password/username : should return 400", async () => {
      const response = await request(authApp).post("/auth/login").send({
        userName: "testSeller",
      });
      expect(response.statusCode).toBe(400);
    });
    test("LOGIN USER  Wrong Password :should return 400", async () => {
      const response = await request(authApp).post("/auth/login").send({
        userName: "testUSER3",
        password: "wrongPassword",
      });
      expect(response.statusCode).toBe(400);
    });

    test("REFRESH TOKEN USER : should return with new Refreshtoken", async () => {
      const response = await request(authApp).post("/auth/new-token").send({
        refreshToken: user.refreshToken,
      });
      expect(response.statusCode).toBe(200);
      expect(response.body.accessToken).toBeDefined();
    });

    test("DELETE SELLER : should respond with 201", async () => {
      const response = await request(authApp).delete("/auth/delete").send({
        userName: "testSeller",
      });
      expect(response.statusCode).toBe(201);
    });
    test("DELETE USER : should respond with 201", async () => {
      const response = await request(authApp).delete("/auth/delete").send({
        userName: "testUSER3",
      });
      expect(response.statusCode).toBe(201);
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
  });
});
