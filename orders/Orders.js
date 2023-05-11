/** @format */

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  imageUrl: String,
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
});

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  products: [productSchema],
});

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  orders: [orderSchema],
});

const User = mongoose.model("User", userSchema);

module.exports = User;
