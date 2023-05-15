const express = require("express");
const bodyParser = require("body-parser");
const { randomBytes } = require("crypto");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const mongoose = require("mongoose");
const ORDERS = require("./Orders");
const app = express();
app.use(bodyParser.json());
app.use(cors());

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

let dbURL = process.env.DB_URL;

mongoose
  .connect(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .catch((e) => {
    console.log("Failed to connect to Order Service MongoDb", e.message);
  });

app.post("/orders/create", authenticateToken, async (req, res) => {
  try {
    const { products, total } = req.body;
    const userName = req.user.userName;
    const orderId = randomBytes(4).toString("hex");

    let order = {
      orderId,
      total,
      status: "Pending",
      products: [],
    };
    const orderProducts = [];
    for (let product of products) orderProducts.push(product);
    order.products = orderProducts;

    await ORDERS.findOneAndUpdate(
      { userId: userName },
      { $push: { orders: { orderId, ...order } } },
      { new: true, upsert: true }
    );

    await axios.post("http://eventbus-srv:4005/events", {
      type: "OrderCreated",
      data: {
        order_id: orderId,
        userName,
        products,
      },
    });
    res.status(201).send({});
  } catch (err) {
    console.log(err);
    res.status(500).send({ errMsg: "Could not create Order" });
  }
});

app.get("/orders", authenticateToken, async (req, res) => {
  try {
    const ordersList = await ORDERS.find({
      userId: req.user.userName,
    });
    res.send({ ordersList });
  } catch (err) {
    console.log("ERROR : Getting Orders ", err.message);
    res.status(500).send({ errMsg: "Could not fetch Order" });
  }
});

app.post("/events", async (req, res) => {
  const { type, data } = req.body;
  handleEvent(type, data);
  res.status(201).send({});
});

const handleEvent = async (type, data) => {
  if (type === "OrderAccepted") {
    const { order_id, userName } = data;
    await updateOrderStatus(userName, order_id, "Accepted");
  }
  if (type === "OrderRejected") {
    const { order_id, userName } = data;
    await updateOrderStatus(userName, order_id, "Rejected");
  }
};

async function updateOrderStatus(userId, orderId, newStatus) {
  try {
    await ORDERS.findOneAndUpdate(
      { userId, "orders.orderId": orderId },
      { $set: { "orders.$.status": newStatus } },
      { new: true }
    );
  } catch (error) {
    console.error("Error updating order status:", error);
  }
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);
  try {
    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
      console.log("erre", err);
      if (err) {
        return res.sendStatus(403);
      }
      //set user from jwt token
      req.user = user;
      next();
    });
  } catch (err) {
    console.log("err", err);
  }
}
module.exports = { app, handleEvent };
