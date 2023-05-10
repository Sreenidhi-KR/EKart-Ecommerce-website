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

let products = {};

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

app.post("/product/update", authenticateToken, async (req, res) => {
  const { name, price, stock, imageUrl, productId } = req.body;
  const sellerName = req.user.userName;

  products[productId] = {
    productId,
    sellerName,
    name,
    price,
    imageUrl,
    stock,
  };

  await axios.post("http://eventbus-srv:4005/events", {
    type: "ProductUpdated",
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

app.post("/events", async (req, res) => {
  console.log("Received Event", req.body.type);
  const { data, type } = req.body;

  if (type === "OrderCreated") {
    const products_copy = structuredClone(products);
    let flag = true;
    const orderedProducts = data.products;
    for (let orderedProduct of orderedProducts) {
      if (
        Number(products[orderedProduct.productId].stock) >=
        Number(orderedProduct.quantity)
      ) {
        products[orderedProduct.productId].stock -= Number(
          orderedProduct.quantity
        );
      } else {
        console.log("out of stock", orderedProduct);
        flag = false;
        //Need to reset stock to values before this transaction started
        products = structuredClone(products_copy);
        break;
      }
    }
    try {
      if (flag) {
        console.log("Order Accepted");
        await axios.post("http://eventbus-srv:4005/events", {
          type: "OrderAccepted",
          data: {
            order_id: data.order_id,
            userName: data.userName,
            products: data.products,
          },
        });
      } else {
        console.log("Order Rejected");
        await axios.post("http://eventbus-srv:4005/events", {
          type: "OrderRejected",
          data: {
            order_id: data.order_id,
            userName: data.userName,
          },
        });
      }
    } catch (err) {
      console.log(err);
    }
  }

  res.send({});
});

app.get("/product/seller", authenticateToken, (req, res) => {
  const filteredProducts = {};

  Object.keys(products)
    .filter((key) => products[key].sellerName === req.user.userName)
    .forEach((key) => {
      filteredProducts[key] = products[key];
    });

  res.send({ ...filteredProducts });
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
