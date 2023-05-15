const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

function containsKeywords(sentence, keywords) {
  for (const keyword of keywords) {
    if (sentence.includes(keyword)) {
      return true;
    }
  }
  return false;
}
const keywords = ["fuck", "asshole", "mental"];

app.post("/events", async (req, res) => {
  const { type, data } = req.body;

  handleEvent(type, data);

  res.sendStatus(201);
});

const handleEvent = async (type, data) => {
  if (type === "ReviewCreated") {
    console.log(type);
    const status = containsKeywords(data.content, keywords)
      ? "rejected"
      : "approved";
    await axios.post("http://eventbus-srv:4005/events", {
      type: "ReviewModerated",
      data: {
        reviewId: data.reviewId,
        productId: data.productId,
        status,
        content: data.content,
      },
    });
  }
};

module.exports = { app, handleEvent };
