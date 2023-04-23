const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

const events = [];

app.post("/events", (req, res) => {
  const event = req.body;

  events.push(event);
  console.log(event);
  axios.post("http://products-srv:4000/events", event).catch((err) => {
    console.log("products");
    console.log(err.message);
  });
  axios.post("http://reviews-srv:4001/events", event).catch((err) => {
    console.log("reviews");
    console.log(err.message);
  });
  axios.post("http://query-srv:4002/events", event).catch((err) => {
    console.log("query");
    console.log(err.message);
  });
  axios.post("http://moderation-srv:4003/events", event).catch((err) => {
    console.log("moderation");
    console.log(err.message);
  });
  // axios.post("http://orders-srv:4004/events", event).catch((err) => {
  //   console.log("orders");
  //   console.log(err.message);
  // });
  res.send({ status: "OK" });
});

app.get("/events", (req, res) => {
  res.send(events);
});

app.listen(4005, () => {
  console.log("Eventbus Listening on 4005");
});
