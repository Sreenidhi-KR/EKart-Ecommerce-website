/** @format */

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());
app.use(cors());
const mongoose = require("mongoose");
const PRODUCTS = require("./QueryProducts");

let dbURL =
  "mongodb+srv://Simha:Simha@cluster0.w56omxb.mongodb.net/QueryProducts?retryWrites=true&w=majority";
let products = {};

mongoose
  .connect(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("Connected To QUERY MongoDB");
  })
  .catch((e) => {
    console.log("Failed to connect to QUERY MONGODB", e.message);
  });

app.get("/products", async (req, res) => {
  try {
    const products = await PRODUCTS.find({});
    res.send(products);
  } catch (err) {
    res.sendStatus(500);
  }
});

app.post("/events", (req, res) => {
  const { type, data } = req.body;
  handleEvent(type, data);
  res.send({});
});

const handleEvent = async (type, data) => {
  console.log("Event Received:", type);

  if (type === "ProductCreated") {
    const { productId, name, price, stock, imageUrl, sellerName } = data;

    const newProduct = new PRODUCTS({
      sellerName,
      productId,
      name,
      stock,
      imageUrl,
      price,
      reviews: [],
    });
    try {
      await newProduct.save();
      console.log("New product added:", savedProduct);
      return;
    } catch (error) {
      console.error("Error saving product:", error);
    }
  }

  if (type === "ReviewCreated") {
    const { reviewId, content, productId, status } = data;
    PRODUCTS.findOne({ productId: productId })
      .then((product) => {
        if (!product) {
          throw new Error("Product not found while adding Review");
        }
        const newReview = {
          reviewId,
          content,
          status,
        };

        product.reviews.push(newReview);
        return product.save();
      })
      .then((updatedProduct) => {
        console.log("Review added to product:");
      })
      .catch((error) => {
        console.error("Error adding review:", error);
      });
  }

  if (type === "ReviewUpdated") {
    const { reviewId, content, productId, status } = data;

    PRODUCTS.findOne({ productId: productId })
      .then((product) => {
        if (!product) {
          throw new Error("Product not found");
        }
        const reviewIndex = product.reviews.findIndex(
          (review) => review.reviewId === reviewId
        );

        if (reviewIndex === -1) {
          throw new Error("Review not found");
        }
        product.reviews[reviewIndex].content = content;
        product.reviews[reviewIndex].status = status;
        return product.save();
      })
      .then((updatedProduct) => {
        console.log("Review updated:");
      })
      .catch((error) => {
        console.error("Error updating review:", error);
      });
  }

  if (type === "OrderAccepted") {
    const products = await PRODUCTS.find({});
    const orderedProducts = data.products;

    for (let orderedProduct of orderedProducts) {
      const product = products.find(
        (prod) => prod.productId === orderedProduct.productId
      );
      const updated_stock =
        Number(product.stock) - Number(orderedProduct.quantity);

      product.stock = updated_stock;

      PRODUCTS.findOneAndUpdate(
        { productId: orderedProduct.productId }, // Filter to find the product by its ID
        { $set: { stock: updated_stock } }, // Update the stock field with the new value
        { new: true }
      )
        .then((updatedProduct) => {
          console.log("Stock in QUERY updated successfully:");
        })
        .catch((error) => {
          console.error("Error updating Stock in QUERY :", error);
        });
    }
  }

  if (type === "ProductUpdated") {
    const { sellerName, productId, name, price, imageUrl, stock } = data;

    PRODUCTS.findOneAndUpdate(
      { productId: productId }, // Filter to find the product by its ID
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
      .then((updatedProduct) => {
        console.log("Product in QUERY updated successfully:");
      })
      .catch((error) => {
        console.log("Product in QUERY updated ERROR:");
      });
  }
};

app.listen(4002, async () => {
  console.log("Query Listening on :  4002");
  // try {
  //   const res = await axios.get("http://eventbus-srv:4005/events");

  //   for (let event of res.data) {
  //     console.log("Processing event:", event.type);

  //     handleEvent(event.type, event.data);
  //   }
  // } catch (error) {
  //   console.log(error.message);
  // }
});
