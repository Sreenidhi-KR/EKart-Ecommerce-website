const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
const app = express();
app.use(bodyParser.json());
app.use(cors());
const mongoose = require("mongoose");
const PRODUCTS = require("./QueryProducts");

let dbURL = process.env.DB_URL;

mongoose
  .connect(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .catch((e) => {
    console.log("Failed to connect to QUERY MONGODB", e.message);
  });

app.get("/products", async (req, res) => {
  try {
    const products = await PRODUCTS.find({});
    res.send(products).status(200);
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

      return;
    } catch (error) {
      console.error("Error saving product:", error);
    }
  }

  if (type === "ReviewCreated") {
    try {
      const { reviewId, content, productId, status } = data;
      const product = await PRODUCTS.findOne({ productId: productId });
      if (!product) {
        throw new Error("Product not found while adding Review");
      }
      const newReview = {
        reviewId,
        content,
        status,
      };

      product.reviews.push(newReview);
      const updatedProduct = await product.save();
      return updatedProduct;
    } catch (err) {
      console.log(err);
    }
  }

  if (type === "ReviewUpdated") {
    const { reviewId, content, productId, status } = data;

    PRODUCTS.findOne({ productId })
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
    for (let orderedProduct of data.products) {
      PRODUCTS.findOneAndUpdate(
        { productId: orderedProduct.productId },
        { $inc: { stock: -Number(orderedProduct.quantity) } },
        { new: true }
      ).catch((error) => {
        console.error("Error updating Stock in QUERY :", error);
      });
    }
  }

  if (type === "ProductUpdated") {
    const { sellerName, productId, name, price, imageUrl, stock } = data;

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
    ).catch((error) => {
      console.log("Product in QUERY updated ERROR:");
    });
  }
};
module.exports = { app, handleEvent };
