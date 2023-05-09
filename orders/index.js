/** @format */

const express = require("express");
const bodyParser = require("body-parser");
const { randomBytes } = require("crypto");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const ACCESS_TOKEN_SECRET =
  "cfb62c7e5f017b1531ecf97e60c1e90b2927a5923a163a43e287e50ac21cab5192a03c6e1698bd7012153f985274cf8d6b9eb84b3efa10d895278b68442f89bf";

let ordersList = {};
/* ORDER LIST : (Currently) (Need to add total and order_id)
"user_id" : {
    [
      {
        "product_id":"001",
        "product_name":"Bananna",
        "product_url" : "/abc.png "
        "quantity":"10",
        "price":"100"

      },
      {
        "product_id":"001",
        "product_name":"Shampoo",
        "product_url" : "/abc.png "
        "quantity":"20",
        "price":"1000"

      }
    ]

}
*/

let productsInventory = {};
/*
  {
      {product_id,name,stock}
    
  }
*/

app.post("/orders/create", authenticateToken, async (req, res) => {
  /*
  {
    "products":[
      {
        "product_id":"001",
        "product_name":"Bananna",
        "quantity":"10",
        "price":"100"
      }
    ]
  }
  */
  const { products } = req.body;

  //Check if Stock is avaliable
  for (let product of products) {
    if (product.quantity < productsInventory[product.productId].stock)
      res.status(401).send({ message: "Sorry, Out of Stock" });
  }
  //Update the stock
  for (let product of products) {
    productsInventory[product.productId].stock =
      Number(productsInventory[product.productId].stock) -
      Number(product.quantity);
  }

  //Create an Order
  const userName = req.user.userName;
  const orders = ordersList[userName] || [];
  for (let product of products) orders.push(product);
  ordersList[userName] = orders;
  res.status(201).send({});
});

app.get("/orders", authenticateToken, (req, res) => {
  res.send(ordersList[req.user.userName]);
});

app.post("/events", (req, res) => {
  const { type, data } = req.body;

  console.log("Recieved Event", req.body);
  if (type === "ProductCreated") {
    const { productId, name, stock } = data;
    productsInventory[productId] = { productId, name, stock };
    console.log("\n\t New Product Added", productsInventory[productId]);
  }

  res.status(201).send({});
});

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

//For debuggin thru nodeport
app.get("/ordersList", (req, res) => {
  res.send(ordersList);
});
//For debuggin thru nodeport
app.get("/productsInventory", (req, res) => {
  res.send(productsInventory);
});

app.listen(4004, console.log("Orders listening on port  4004"));
