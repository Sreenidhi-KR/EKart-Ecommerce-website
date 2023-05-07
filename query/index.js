const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const products = {};

const handleEvent = (type, data) => {
  if (type === "ProductCreated") {
    console.log("Event Received:", type);
    const { productId, name, price, stock, imageUrl, sellerName } = data;
    products[productId] = {
      sellerName,
      productId,
      name,
      stock,
      imageUrl,
      price,
      reviews: [],
    };
  }

  if (type === "ReviewCreated") {
    console.log("Event Received:", type);
    const { reviewId, content, productId, status } = data;
    const product = products[productId];
    product.reviews.push({ reviewId, content, status });
  }

  if (type === "ReviewUpdated") {
    console.log("Event Received:", type);
    const { reviewId, content, productId, status } = data;
    const product = products[productId];
    const review = product.reviews.find((review) => {
      return review.reviewId === reviewId;
    });
    review.status = status;
    review.content = content;
  }
};

app.get("/products", (req, res) => {
  res.send(products);
});

app.post("/events", (req, res) => {
  const { type, data } = req.body;

  handleEvent(type, data);

  res.send({});
});

app.listen(4002, async () => {
  console.log("Query Listening on 4002");
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
