/** @format */

const mongoose = require("mongoose");
const reviewSchema = new mongoose.Schema({
  reviewId: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
});

const productSchema = new mongoose.Schema({
  sellerName: {
    type: String,
    required: true,
  },
  productId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  reviews: [reviewSchema],
});

const Product = mongoose.model("QueryProduct", productSchema);

module.exports = Product;
