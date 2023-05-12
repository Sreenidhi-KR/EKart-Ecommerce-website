const express = require("express");
const bodyParser = require("body-parser");
const { randomBytes } = require("crypto");
const cors = require("cors");
const axios = require("axios");
const app = express();
const mongoose = require("mongoose");

const REVIEWSBYPROD = require("./Reviews");
let dbURL = `mongodb+srv://Simha:Simha@cluster0.w56omxb.mongodb.net/Reviews?retryWrites=true&w=majority`;

mongoose
  .connect(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("Connected TO REVIEWS Mongooo");
  })
  .catch((e) => {
    console.log("Failed to connect to MONGOO", e.message);
  });

app.use(bodyParser.json());
app.use(cors());

const reviewsByProductId = {};

app.post("/product/:id/reviews", async (req, res) => {
  const reviewId = randomBytes(4).toString("hex");
  const { content } = req.body;

  const reviews = reviewsByProductId[req.params.id] || [];

  reviews.push({ reviewId, content, status: "pending" });

  reviewsByProductId[req.params.id] = reviews;

  const review = { reviewId, content, status: "pending" };

  await addReview(req.params.id, review);

  await axios.post("http://eventbus-srv:4005/events", {
    type: "ReviewCreated",
    data: {
      reviewId,
      content,
      productId: req.params.id,
      status: "pending",
    },
  });

  res.status(201).send(reviews);
});

app.post("/events", async (req, res) => {
  const { type, data } = req.body;

  if (type === "ReviewModerated") {
    console.log("Event Received:", req.body.type);
    const { productId, reviewId, status, content } = data;
    const reviews = reviewsByProductId[productId];

    const review = reviews.find((review) => {
      return review.reviewId === reviewId;
    });

    await editReviewContent(productId, reviewId, content, status);
    review.status = status;
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

  res.send({});
});

async function addReview(productId, review) {
  try {
    const existingProduct = await REVIEWSBYPROD.findOneAndUpdate(
      { productId },
      { $setOnInsert: { productId }, $addToSet: { reviews: review } },
      { upsert: true, new: true }
    );

    console.log("Review added to product:", existingProduct);
  } catch (error) {
    console.error("Error adding review:", error);
  }
}

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

app.listen(4001, () => {
  console.log("Reviews Listening on 4001");
});
