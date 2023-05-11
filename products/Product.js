/** @format */

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  sellerName: String,
  productId: String,
  name: String,
  price: String,
  imageUrl: String,
  stock: Number,
});

// const Products = mongoose.model("Products", productSchema);
module.exports = PRODUCTS = mongoose.model("Products", productSchema);
