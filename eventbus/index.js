/** @format */

const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const logger = require("./logger/index");
const mongoose = require("mongoose");
const EVENTS = require("./Events");

let dbURL = process.env.DB_URL;

mongoose
  .connect(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .catch((e) => {
    console.log("Failed to connect to MONGOO", e.message);
  });

const app = express();
app.use(bodyParser.json());

const events = [];

app.post("/events", (req, res) => {
  const event = req.body;
  const { type, data } = req.body;

  if (type == "ProductCreated" || type == "ProductUpdated") {
    logger.info(`${type};Productname:${data.name}`);
  }
  if (type == "OrderAccepted") {
    for (let prods of data.products)
      logger.info(`${type};Productname:${prods.name}`);
  }
  if (type == "ReviewCreated")
    logger.info(
      `${event.type};Productname:${data.productName};Review:${data.content}`
    );

  events.push(event);
  console.log(event.type);
  //logger.info(`${event.type} : ${JSON.stringify(event.data)}`);

  axios.post("http://products-srv:4000/events", event).catch(async (err) => {
    console.log("products service failed to capture event");
    await handleFailedEvent(event, "products");
    console.log(err.message);
  });

  axios.post("http://reviews-srv:4001/events", event).catch(async (err) => {
    console.log("reviews service failed to capture event");
    await handleFailedEvent(event, "reviews");
    console.log(err.message);
  });

  axios.post("http://query-srv:4002/events", event).catch(async (err) => {
    console.log("query service failed to capture event");
    await handleFailedEvent(event, "query");
    console.log(err.message);
  });

  axios.post("http://moderation-srv:4003/events", event).catch(async (err) => {
    console.log("moderation service failed to capture event");
    await handleFailedEvent(event, "moderation");
    console.log(err.message);
  });

  axios.post("http://orders-srv:4004/events", event).catch(async (err) => {
    console.log("orders service failed to capture event");
    await handleFailedEvent(event, "orders");
    console.log(err.message);
  });
  res.send({ status: "OK" });
});

app.get("/events", (req, res) => {
  res.send(events);
});

const handleFailedEvent = async (event, service) => {
  try {
    const newevent = new EVENTS({
      event,
      service,
    });

    await newevent.save();
  } catch (err) {
    console.log("unable to save event", err);
  }
};

app.get("/failedEvents/:service", async (req, res) => {
  const service = req.params.service;
  let filteredEvents = await EVENTS.find({ service });
  await EVENTS.deleteMany({ service });
  console.log("filteredEvents", filteredEvents);
  const failedEvents = [];
  filteredEvents.forEach((e) => {
    failedEvents.push(e.event);
  });
  res.send(failedEvents);
});

app.listen(4005, () => {
  console.log("Eventbus Listening on :: 4005");
});
