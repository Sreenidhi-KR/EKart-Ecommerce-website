const express = require("express");
const bodyParser = require("body-parser");
const { randomBytes } = require("crypto");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const products = {};

// app.get("/products", (req, res) => {
//   res.send(products);
// });

app.post("/products", async (req, res) => {
  const productId = randomBytes(4).toString("hex");
  const { name, price } = req.body;

  products[productId] = {
    productId,
    name,
    price,
  };

  await axios.post("http://localhost:4005/events", {
    type: "ProductCreated",
    data: {
      productId,
      name,
      price,
    },
  });
  res.status(201).send(products[productId]);
});

app.post("/events", (req, res) => {
  //console.log("Received Event", req.body.type);
  res.send({});
});

app.listen(4000, () => {
  console.log("Listening on 4000");
});
