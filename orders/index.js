const express = require("express");
const bodyParser = require("body-parser");
const { randomBytes } = require("crypto");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());
app.use(cors());

let ordersList = {};
/* ORDER LIST : 
"1" : {
    "userId":"1",
    "products":
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

app.post("/orders/create", async (req, res) => {
  /*
    REQUEST FORMAT :
 {
    "userId":"1",
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
  const { userId, products } = req.body;
  const orders = ordersList[userId] || [];
  for (let product of products) orders.push(product);
  ordersList[userId] = orders;
  console.log(ordersList);
  res.status(201).send({});
});

app.get("/orders/:userId", (req, res) => {
  res.send(ordersList[req.params.userId]);
});

app.listen(4004, console.log("Orders listening on port 4004"));
