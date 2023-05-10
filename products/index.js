/** @format */

const express = require("express");
const bodyParser = require("body-parser");
const { randomBytes } = require("crypto");

const cors = require("cors");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const ACCESS_TOKEN_SECRET =
  "cfb62c7e5f017b1531ecf97e60c1e90b2927a5923a163a43e287e50ac21cab5192a03c6e1698bd7012153f985274cf8d6b9eb84b3efa10d895278b68442f89bf";

const app = express();
app.use(bodyParser.json());
app.use(cors());

const products = {};

app.post("/product/create", authenticateToken, async (req, res) => {
  const productId = randomBytes(4).toString("hex");
  const { name, price, stock, imageUrl } = req.body;
  const sellerName = req.user.userName;

  products[productId] = {
    sellerName,
    productId,
    name,
    price,
    imageUrl,
    stock,
  };

  await axios.post("http://eventbus-srv:4005/events", {
    type: "ProductCreated",
    data: {
      sellerName,
      productId,
      name,
      price,
      imageUrl,
      stock,
    },
  });
  res.status(201).send(products[productId]);
});

app.post("/events", (req, res) => {
  console.log("Received Event", req.body.type);
  const { data, type } = req.body;

  if (type === "OrderCreated") {
    const orderedProducts = data.products;
    for (let orderedProduct of orderedProducts) {
      products[orderedProduct.productId].stock =
        Number(products[orderedProduct.productId].stock) -
        Number(orderedProduct.quantity);
    }
  }

  if (type === "StockUpdated") {
    const { new_stock, productId } = data;
    products[productId].stock = new_stock;
  }
  res.send({});
});

app.get("/", (req, res) => {
  res.send({ products });
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);
  try {
    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
      console.log(err);
      if (err) {
        return res.sendStatus(403);
      }
      //set user from jwt token
      req.user = user;
      next();
    });
  } catch (err) {
    console.log(err);
  }
}

app.listen(4000, () => {
  console.log("Products Listening on - 4000");
});
