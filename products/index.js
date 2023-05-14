/** @format */

const express = require("express");
const bodyParser = require("body-parser");
const { randomBytes } = require("crypto");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const PRODUCTS = require("./Product");
const ACCESS_TOKEN_SECRET =
  "cfb62c7e5f017b1531ecf97e60c1e90b2927a5923a163a43e287e50ac21cab5192a03c6e1698bd7012153f985274cf8d6b9eb84b3efa10d895278b68442f89bf";
let dbURL =
  "mongodb+srv://Simha:Simha@cluster0.w56omxb.mongodb.net/Products?retryWrites=true&w=majority";

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

//TODO
app.post("/events", async (req, res) => {
  const { data, type } = req.body;
  if (type === "OrderCreated") {
    //const products_copy = structuredClone(products);
    console.log("Received Event", req.body.type);

    const products = await PRODUCTS.find({});
    let flag = true;
    const orderedProducts = data.products;

    for (let orderedProduct of orderedProducts) {
      const product = products.filter(
        (prod) => prod.productId === orderedProduct.productId
      )[0];

      const updated_stock =
        Number(product.stock) - Number(orderedProduct.quantity);

      if (updated_stock >= 0) {
        product.stock = updated_stock;

        //Update in Backend
        PRODUCTS.findOneAndUpdate(
          { productId: orderedProduct.productId }, // Filter to find the product by its ID
          { $set: { stock: updated_stock } }, // Update the stock field with the new value
          { new: true }
        )
          .then((updatedProduct) => {
            console.log("Product updated successfully:");
          })
          .catch((error) => {
            console.error("Error updating product:", error);
          });
      } else {
        flag = false;
        break;
      }
    }

    //Broadcase result to ORDERS and QUERY service
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

  res.send({});
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
