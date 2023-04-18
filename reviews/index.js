const express = require("express");
const bodyParser = require("body-parser");
const { randomBytes } = require("crypto");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const reviewsByProductId = {};

// app.get("/product/:id/reviews", (req, res) => {
//   res.send(reviewsByProductId[req.params.id] || []);
// });

app.post("/product/:id/reviews", async (req, res) => {
  const reviewId = randomBytes(4).toString("hex");
  const { content } = req.body;

  const reviews = reviewsByProductId[req.params.id] || [];

  reviews.push({ reviewId, content, status: "pending" });

  reviewsByProductId[req.params.id] = reviews;

  await axios.post("http://localhost:4005/events", {
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
    review.status = status;
    console.log("RM", {
      reviewId,
      status,
      productId,
      content,
    });
    await axios.post("http://localhost:4005/events", {
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

app.listen(4001, () => {
  console.log("Listening on 4001");
});
