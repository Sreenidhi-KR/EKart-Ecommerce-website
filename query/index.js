/** @format */

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());
app.use(cors());
const mongoose = require("mongoose");
const PRODUCTS = require("./QueryProducts");

let dbURL =
  "mongodb+srv://Simha:Simha@cluster0.w56omxb.mongodb.net/QueryProducts?retryWrites=true&w=majority";
let products = {};

mongoose
  .connect(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("\n\t Connected TO Mongooo");
    products = await PRODUCTS.find({});
    console.log(products);
    console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^");
  })
  .catch((e) => {
    console.log("Failed to connect to MONGOO", e.message);
  });

const handleEvent = async (type, data) => {
  console.log("Event Received:", type);

  if (type === "ProductCreated") {
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

    const newProduct = new PRODUCTS({
      sellerName,
      productId,
      name,
      stock,
      imageUrl,
      price,
      reviews: [],
    });
    // Save the new product to the database
    newProduct
      .save()
      .then((savedProduct) => {
        console.log("New product added:", savedProduct);
      })
      .catch((error) => {
        console.error("Error saving product:", error);
      });
  }

  if (type === "ReviewCreated") {
    const { reviewId, content, productId, status } = data;
    products = await PRODUCTS.find({});
    const product = products.find((prod) => prod.productId === productId);
    product.reviews.push({ reviewId, content, status });

    PRODUCTS.findOne({ productId: productId })
      .then((product) => {
        if (!product) {
          throw new Error("Product not found while adding Review");
        }

        // Create a new review object
        const newReview = {
          reviewId,
          content,
          status,
        };

        // Push the new review into the reviews array
        product.reviews.push(newReview);

        // Save the updated product to the database
        return product.save();
      })
      .then((updatedProduct) => {
        console.log("Review added to product:", updatedProduct);
      })
      .catch((error) => {
        console.error("Error adding review:", error);
      });
  }

  if (type === "ReviewUpdated") {
    const { reviewId, content, productId, status } = data;
    console.log("Searchinf for ", reviewId);

    setTimeout(() => {
      // const product = products.find((prod) => prod.productId === productId);

      // console.log(" FOUND sdsdsddsdsd L :", product.reviews);
      // const review = product.reviews.find((review) => {
      //   return review[reviewId] === reviewId;
      // });
      // console.log(" FOUND REVUEWWWWW L :", review);
      // review.status = status;
      // review.content = content;

      PRODUCTS.findOne({ productId: productId })
        .then((product) => {
          if (!product) {
            throw new Error("Product not found");
          }
          console.log("OUrrrrrrrrrrr PRODUCT:", product);
          console.log("OUrrrrrrrrrrr PRODUCT REVIEW:", product.reviews);

          // Find the index of the review within the reviews array based on its unique identifier
          const reviewIndex = product.reviews.findIndex(
            (review) => review.reviewId === reviewId
          );

          if (reviewIndex === -1) {
            throw new Error("Review not found");
          }

          // Update the fields of the review
          product.reviews[reviewIndex].content = content;
          product.reviews[reviewIndex].status = status;

          // Save the updated product to the database
          return product.save();
        })
        .then((updatedProduct) => {
          console.log("Review updated:", updatedProduct);
        })
        .catch((error) => {
          console.error("Error updating review:", error);
        });
    }, 2000);
  }

  if (type === "OrderAccepted") {
    products = await PRODUCTS.find({});
    const orderedProducts = data.products;
    // for (let orderedProduct of orderedProducts) {
    //   products[orderedProduct.productId].stock =
    //     Number(products[orderedProduct.productId].stock) -
    //     Number(orderedProduct.quantity);
    // }

    //Update the stocks in remaining orders
    for (let orderedProduct of orderedProducts) {
      const product = products.find(
        (prod) => prod.productId === orderedProduct.productId
      );
      const updated_stock =
        Number(product.stock) - Number(orderedProduct.quantity);

      //Update Locally
      product.stock = updated_stock;

      //Update in DB
      PRODUCTS.findOneAndUpdate(
        { productId: orderedProduct.productId }, // Filter to find the product by its ID
        { $set: { stock: updated_stock } }, // Update the stock field with the new value
        { new: true }
      )
        .then((updatedProduct) => {
          console.log("Stock in QUERY updated successfully:");
        })
        .catch((error) => {
          console.error("Error updating Stock in QUERY :", error);
        });
    }
  }

  if (type === "ProductUpdated") {
    const { sellerName, productId, name, price, imageUrl, stock } = data;

    PRODUCTS.findOneAndUpdate(
      { productId: productId }, // Filter to find the product by its ID
      {
        $set: {
          sellerName: sellerName,
          name: name,
          price: price,
          imageUrl: imageUrl,
          stock: stock,
        },
      },
      { new: true }
    )
      .then((updatedProduct) => {
        console.log("Product updated in QUERY successfully:", updatedProduct);
      })
      .catch((error) => {
        console.error("Error updating product in QUERy:", error);
      });

    const product = products.find((prod) => prod.productId === productId);
    product.sellerName = sellerName || product.sellerName;
    product.name = name || product.name;
    product.price = price || product.price;
    product.imageUrl = imageUrl || product.imageUrl;
    product.stock = stock || product.stock;
  }
};

app.get("/products", async (req, res) => {
  products = await PRODUCTS.find({});
  res.send(products);
});

app.post("/events", (req, res) => {
  const { type, data } = req.body;

  handleEvent(type, data);

  res.send({});
});

app.listen(4002, async () => {
  console.log("Query Listening on :  4002");
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
