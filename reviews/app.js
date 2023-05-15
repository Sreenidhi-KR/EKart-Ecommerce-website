const express = require("express");
const bodyParser = require("body-parser");
const { randomBytes } = require("crypto");
const cors = require("cors");
const axios = require("axios");
const app = express();
const mongoose = require("mongoose");

const REVIEWSBYPROD = require("./Reviews");
let dbURL = process.env.DB_URL;

mongoose
  .connect(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .catch((e) => {
    console.log("Failed to connect to MONGOO : REVIEWS", e.message);
  });

app.use(bodyParser.json());
app.use(cors());

app.post("/product/:id/reviews", async (req, res) => {
  const reviewId = randomBytes(4).toString("hex");
  const { content } = req.body;
  const review = { reviewId, content, status: "pending" };
  const productId = req.params.id;

  try {
    await REVIEWSBYPROD.findOneAndUpdate(
      { productId },
      { $setOnInsert: { productId }, $addToSet: { reviews: review } },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error("Error adding review:", error);
  }

  await axios.post("http://eventbus-srv:4005/events", {
    type: "ReviewCreated",
    data: {
      reviewId,
      content,
      productId: req.params.id,
      status: "pending",
    },
  });

  res.status(201).send({});
});

app.post("/events", async (req, res) => {
  const { type, data } = req.body;
  handleEvent(type, data);
  res.send({});
});

async function editReviewContent(productId, reviewId, newContent, newStatus) {
  try {
    const updatedProduct = await REVIEWSBYPROD.findOneAndUpdate(
      { productId, "reviews.reviewId": reviewId },
      {
        $set: {
          "reviews.$.content": newContent,
          "reviews.$.status": newStatus,
        },
      },
      { new: true }
    );
    if (!updatedProduct) {
      console.log(
        `Product with productId ${productId} or review with reviewId ${reviewId} not found.`
      );
      return;
    }
  } catch (error) {
    console.error("Error editing review content:", error);
  }
}
const handleEvent = async (type, data) => {
  if (type === "ReviewModerated") {
    console.log("Event Received:", type);
    const { productId, reviewId, status, content } = data;
    await editReviewContent(productId, reviewId, content, status);
    await axios.post("http://eventbus-srv:4005/events", {
      type: "ReviewUpdated",
      data: {
        reviewId,
        status,
        productId,
        content,
      },
    });
  }
};
module.exports = app;
