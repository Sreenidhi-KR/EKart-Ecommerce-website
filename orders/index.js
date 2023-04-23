const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());
// app.use(cors())

let ordersList = {};
/* ORDER LIST : 
{
    "user_id":"1",
    "products":[{
        "product_id":"001",
        "product_name":"Bananna",
        "quantity":"10",
        "price":"100"

    },
    {
        "product_id":"001",
        "product_name":"Shampoo",
        "quantity":"20",
        "price":"1000"

    }]
}
*/

app.post("/addItem", (req, res) => {
  /*
    REQUEST FORMAT :
 {
    "user_id":"1",
    "products":[{
        "product_id":"001",
        "product_name":"Bananna",
        "quantity":"10",
        "price":"100"

    }]
}
    */
  const { user_id, products } = req.body;
  const orders = ordersList[user_id] || [];
  for (let product of products) orders.push(product);
  ordersList[user_id] = orders;
  console.log(ordersList);
  res.send({ products });
});

app.get("/getOrders/:user_id", (req, res) => {
  res.send(ordersList[req.params.user_id]);
});

app.listen(4004, console.log("Orders listening on port 4004"));
