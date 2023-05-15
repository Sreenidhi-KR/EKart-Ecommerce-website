const express = require("express");
const bodyParser = require("body-parser");
const { randomBytes } = require("crypto");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const PRODUCTS = require("./Product");
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

let dbURL = process.env.DB_URL;

const app = express();
app.use(bodyParser.json());
app.use(cors());

mongoose
  .connect(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .catch((e) => {
    console.log("Failed to connect to MONGOO", e.message);
  });

app.post("/product/create", authenticateToken, async (req, res) => {
  const productId = randomBytes(4).toString("hex");
  const { name, price, stock, imageUrl } = req.body;
  const sellerName = req.user.userName;

  const newProduct = new PRODUCTS({
    sellerName,
    productId,
    name,
    price,
    imageUrl,
    stock,
  });

  newProduct
    .save()
    .then(async (savedProduct) => {
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
      res.status(201).send(savedProduct);
    })
    .catch((error) => {
      console.error("ERROR saving product in MongoDB:", error);
      res.sendStatus(500);
    });
});

app.post("/product/update", authenticateToken, async (req, res) => {
  const sellerName = req.user.userName;
  const { name, price, stock, imageUrl, productId } = req.body;

  PRODUCTS.findOneAndUpdate(
    { productId },
    {
      $set: {
        sellerName: sellerName,
        name: name,
        price: price,
        imageUrl: imageUrl,
        stock: stock,
      },
    },
    { new: true }
  )
    .then(async (updatedProduct) => {
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
      res.status(201).send(updatedProduct);
    })
    .catch((error) => {
      console.error("Error updating product in  MongoDB:", error);
      res.sendStatus(500);
    });
});

app.get("/product/seller", authenticateToken, async (req, res) => {
  const filteredProducts = {};
  const products = await PRODUCTS.find({ sellerName: req.user.userName });
  res.send({ products });
});

app.post("/events", async (req, res) => {
  const { data, type } = req.body;
  handleEvent(type, data);
  res.send({});
});

const handleEvent = async (type, data) => {
  if (type === "OrderCreated") {
    console.log("Received Event", type);
    let flag = true;
    const orderedProducts = data.products;

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      for (let orderedProduct of orderedProducts) {
        const quantityToReduce = Number(orderedProduct.quantity);
        const existingProduct = await PRODUCTS.findOne({
          productId: orderedProduct.productId,
        }).session(session);

        if (!existingProduct || existingProduct.stock < quantityToReduce) {
          console.log("Insufficient stock. Transaction rolled back.");
          flag = false;
          throw new Error("Insufficient stock. Transaction rolled back.");
        }
        existingProduct.stock -= quantityToReduce;
        await existingProduct.save();
      }
      await session.commitTransaction();
      session.endSession();
      console.log("Transaction committed successfully.");
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      flag = false;
      console.error("An error occurred. Transaction rolled back.", err);
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
      console.log(err.message);
    }
  }
};

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
module.exports = { app, handleEvent };
