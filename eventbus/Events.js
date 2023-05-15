const mongoose = require("mongoose");

const eventsSchema = new mongoose.Schema({
  event: Object,
  service: String,
  createdAt: {
    type: Date,
    default: () => new Date().toLocaleString(),
  },
});

// const Products = mongoose.model("Products", eventsSchema);
module.exports = EVENTS = mongoose.model("Events", eventsSchema);
