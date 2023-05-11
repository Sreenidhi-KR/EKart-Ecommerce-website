/** @format */

const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  reviewId: {
    type: String,
    required: true,
    unique: true,
  },
  content: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: "pending",
  },
});

const productReviewSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true,
  },
  reviews: [reviewSchema],
});

const ReviewsByProd = mongoose.model("ReviewsByProd", productReviewSchema);

module.exports = ReviewsByProd;
