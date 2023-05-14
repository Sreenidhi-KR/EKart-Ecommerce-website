/** @format */

const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const logger = require("./logger/index");

const app = express();
app.use(bodyParser.json());

const events = [];
let failedEvents = [];

app.post("/events", (req, res) => {
  const event = req.body;

  events.push(event);
  console.log(event.type);
  logger.info(`${event.type} : ${JSON.stringify(event.data)}`);

  axios.post("http://products-srv:4000/events", event).catch((err) => {
    console.log("products service failed to capture event");
    handleFailedEvent(event, "products");
    console.log(err.message);
  });

  axios.post("http://reviews-srv:4001/events", event).catch((err) => {
    console.log("reviews service failed to capture event");
    handleFailedEvent(event, "reviews");
    console.log(err.message);
  });

  axios.post("http://query-srv:4002/events", event).catch((err) => {
    console.log("query service failed to capture event");
    handleFailedEvent(event, "query");
    console.log(err.message);
  });

  axios.post("http://moderation-srv:4003/events", event).catch((err) => {
    console.log("moderation service failed to capture event");
    handleFailedEvent(event, "moderation");
    console.log(err.message);
  });

  axios.post("http://orders-srv:4004/events", event).catch((err) => {
    console.log("orders service failed to capture event");
    handleFailedEvent(event, "orders");
    console.log(err.message);
  });
  res.send({ status: "OK" });
});

app.get("/events", (req, res) => {
  res.send(events);
});

const handleFailedEvent = (event, service) => {
  failedEvents.push({
    event,
    dateTime: new Date().toLocaleString(),
    service,
  });
};

app.get("/failedEvents/:service", (req, res) => {
  const service = req.params.service;
  const filteredEvents = failedEvents.filter(
    (event) => event.service === service
  );
  failedEvents = failedEvents.filter((event) => event.service !== service);
  console.log("filteredEvents", filteredEvents);
  console.log("failedEvents", failedEvents);
  res.send(filteredEvents);
});

app.listen(4005, () => {
  console.log("Eventbus Listening on 4005");
});
