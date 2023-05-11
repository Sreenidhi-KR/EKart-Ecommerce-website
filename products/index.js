/** @format */

const express = require("express");
const bodyParser = require("body-parser");
const { randomBytes } = require("crypto");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const PRODUCTS = require("./Product");
const ACCESS_TOKEN_SECRET =
  "cfb62c7e5f017b1531ecf97e60c1e90b2927a5923a163a43e287e50ac21cab5192a03c6e1698bd7012153f985274cf8d6b9eb84b3efa10d895278b68442f89bf";

const app = express();
app.use(bodyParser.json());
app.use(cors());

let dbURL =
  "mongodb+srv://Simha:Simha@cluster0.w56omxb.mongodb.net/Products?retryWrites=true&w=majority";
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
    console.log("=================================");
  })
  .catch((e) => {
    console.log("Failed to connect to MONGOO", e.message);
  });

app.post("/product/create", authenticateToken, async (req, res) => {
  const productId = randomBytes(4).toString("hex");
  const { name, price, stock, imageUrl } = req.body;
  const sellerName = req.user.userName;

  products[productId] = {
    sellerName,
    productId,
    name,
    price,
    imageUrl,
    stock,
  };

  //Add to MongoDB

  const newProduct = new PRODUCTS({
    sellerName,
    productId,
    name,
    price,
    imageUrl,
    stock,
  });
  // console.log("DB DATA : ", products);
  newProduct
    .save()
    .then((savedProduct) => {
      console.log("Product saved successfully:");
    })
    .catch((error) => {
      console.error("\n\tERROR saving product in Mongi:", error);
    });

  //Broadcast so ORDERS and QUERY Service
  await axios.post("http://eventbus-srv:4005/events", {
    type: "ProductCreated",
    data: {
      sellerName,
      productId,
      name,
      price,
      imageUrl,
      stock,
    },
  });
  res.status(201).send(products[productId]);
});

////For Debugging without Authentication
// app.post("/product/update", async (req, res) => {
//   console.log("LOG: in PRODUCT UPDATE");
//   const sellerName = "Mr.Bean";

app.post("/product/update", authenticateToken, async (req, res) => {
  const sellerName = req.user.userName;
  const { name, price, stock, imageUrl, productId } = req.body;

  products[productId] = {
    productId,
    sellerName,
    name,
    price,
    imageUrl,
    stock,
  };

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
      console.log("Product updated in PRODUCTS successfully:", updatedProduct);
    })
    .catch((error) => {
      console.error("Error updating product in  PRODUCTS:", error);
    });

  await axios.post("http://eventbus-srv:4005/events", {
    type: "ProductUpdated",
    data: {
      sellerName,
      productId,
      name,
      price,
      imageUrl,
      stock,
    },
  });
  res.status(201).send(products[productId]);
});

//***********TODO : Handle synch for OrderCreated to Update the stock ->
// Revert to previous state if mismatch (Handling pending)
app.post("/events", async (req, res) => {
  console.log("Received Event", req.body.type);
  const { data, type } = req.body;
  products = await PRODUCTS.find({});

  if (type === "OrderCreated") {
    //const products_copy = structuredClone(products);
    let flag = true;
    const orderedProducts = data.products;
    console.log("ORDEREDPRODS", orderedProducts);
    console.log("PRODUCTSS", products);

    for (let orderedProduct of orderedProducts) {
      const product = products.filter(
        (prod) => prod.productId === orderedProduct.productId
      )[0]; //Getting the respective product

      const updated_stock =
        Number(product.stock) - Number(orderedProduct.quantity);

      if (updated_stock >= 0) {
        //Update Locally
        console.log(" Updated STOCK ", updated_stock);
        product.stock = updated_stock;

        //Update in Backend
        PRODUCTS.findOneAndUpdate(
          { productId: orderedProduct.productId }, // Filter to find the product by its ID
          { $set: { stock: updated_stock } }, // Update the stock field with the new value
          { new: true }
        )
          .then((updatedProduct) => {
            console.log("Product updated successfully:");
          })
          .catch((error) => {
            console.error("Error updating product:", error);
          });
      } else {
        flag = false;
        break;
      }
    }

    //Broadcase result to ORDERS and QUERY service
    try {
      if (flag) {
        console.log("Order Accepted");
        await axios.post("http://eventbus-srv:4005/events", {
          type: "OrderAccepted",
          data: {
            order_id: data.order_id,
            userName: data.userName,
            products: data.products,
          },
        });
      } else {
        console.log("Order Rejected");
        await axios.post("http://eventbus-srv:4005/events", {
          type: "OrderRejected",
          data: {
            order_id: data.order_id,
            userName: data.userName,
          },
        });
      }
    } catch (err) {
      console.log(err.message);
    }
  }

  res.send({});
});

app.get("/product/seller", authenticateToken, (req, res) => {
  const filteredProducts = {};

  Object.keys(products)
    .filter((key) => products[key].sellerName === req.user.userName)
    .forEach((key) => {
      filteredProducts[key] = products[key];
    });

  res.send({ ...filteredProducts });
});

////For Dubugging without Authentication
// app.get("/product/seller", async (req, res) => {
//   const products = await PRODUCTS.find({});
//   const filteredProducts = {};

//   Object.keys(products)
//     .filter((key) => products[key].sellerName === req.body.sellerName)
//     .forEach((key) => {
//       filteredProducts[key] = products[key];
//     });

//   res.send({ ...filteredProducts });
// });

app.get("/", (req, res) => {
  res.send({ products });
});

//Get all products in PRODUCTS collection
app.get("/proddb", async (req, res) => {
  const pro = await PRODUCTS.find({});

  res.send({ all_products: pro });
});

// //Get data of local product (J)
// app.get("/prodlocal", async (req, res) => {
//   res.send({ all_products: products });
// });
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);
  try {
    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
      console.log(err);
      if (err) {
        return res.sendStatus(403);
      }
      //set user from jwt token
      req.user = user;
      next();
    });
  } catch (err) {
    console.log(err);
  }
}

app.listen(4000, () => {
  console.log("Products Listening on - 4000");
});
