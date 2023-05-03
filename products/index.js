const express = require("express");
const bodyParser = require("body-parser");
const { randomBytes } = require("crypto");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const products = {};

app.post("/product/create", async (req, res) => {
  const productId = randomBytes(4).toString("hex");
  const { name, price, stock, imageUrl } = req.body;

  products[productId] = {
    productId,
    name,
    price,
    imageUrl,
    stock,
  };

  await axios.post("http://eventbus-srv:4005/events", {
    type: "ProductCreated",
    data: {
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
  //console.log("Received Event", req.body.type);
  res.send({});
});

app.listen(4000, () => {
  console.log("Products Listening on 4000");
});
