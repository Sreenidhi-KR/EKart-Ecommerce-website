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
/*
{
    "user_1": {
        "0e576b84": {
            "order_id": "0e576b84",
            "total": 110,
            "products": [
                {
                    "productId": "b3018b7c",
                    "name": "yoyo",
                    "imageUrl": "",
                    "price": "10",
                    "quantity": 1
                },
                {
                    "productId": "83fcd35a",
                    "name": "batter",
                    "imageUrl": "",
                    "price": "100",
                    "quantity": 1
                }
            ]
        }
    },
    "user_2": {
        "95bfc3a6": {
            "order_id": "95bfc3a6",
            "total": 100,
            "products": [
                {
                    "productId": "b3018b7c",
                    "name": "yoyo",
                    "imageUrl": "",
                    "price": "10",
                    "quantity": 1
                },
                {
                    "productId": "7308f9e3",
                    "name": "pillow",
                    "imageUrl": "",
                    "price": "90",
                    "quantity": 1
                }
            ]
        }
    }
}

*/

let productsInventory = {};
/*
  {
    "dd2711a6": {
        "productId": "dd2711a6",
        "name": "bat",
        "stock": "12"
    },
    "13ff86fb": {
        "productId": "13ff86fb",
        "name": "yoyo",
        "stock": "89"
    }
}
*/

//For Creating new Orders
app.post("/orders/create", authenticateToken, async (req, res) => {
  /*
  {
    "products":[
      {
        "productId":"001",
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
    if (
      Number(productsInventory[product.productId].stock) -
        Number(product.quantity) <
      0
    ) {
      console.log("\n\t ERROR: Inventroy OUT o ");
      return res
        .status(401)
        .send({ message: "Sorry,1 or more items are Out of Stock" });
    }
  }
  //1)Update the stock
  //2)Calculate Order total
  let total = 0;
  for (let product of products) {
    total += Number(product.quantity) * Number(product.price);
    productsInventory[product.productId].stock =
      Number(productsInventory[product.productId].stock) -
      Number(product.quantity);
  }
  console.log("\n TOTAL for the order : ", total);

  //Create an Order-------------------
  const userName = req.user.userName;
  if (!ordersList[userName]) ordersList[userName] = {}; //Creating a new user profile

  console.log("\n\t ALL ORDERLIST : \n", ordersList);
  console.log("\n\t USER : \n", ordersList[userName]);
  const order_id = randomBytes(4).toString("hex");
  ordersList[userName][order_id] = {}; //Created empty obj as w/o this line it was overwriting existing entry (always only 1 prod was avaliable)
  // const order_id =  `OID${ordersList[userName].length}`

  ordersList[userName][order_id] = {
    order_id,
    total,
    products: [],
  };
  const orders = [];
  for (let product of products) orders.push(product);
  ordersList[userName][order_id].products = orders;

  //Broadcast the OrderCreated to PRODUCTS and QUERY services
  try {
    await axios.post("http://eventbus-srv:4005/events", {
      type: "OrderCreated",
      data: {
        products,
      },
    });
  } catch (err) {
    console.log("\n ERROR : Couldnot Broadcase ORDERCREATED ".err);
  }
  res.status(201).send({});
});

app.get("/orders", authenticateToken, (req, res) => {
  res.send(ordersList[req.user.userName]);
});

app.post("/updateStock", async (req, res) => {
  const { productId, new_stock } = req.body;
  try {
    productsInventory[productId].stock = new_stock;
  } catch (err) {
    console.log("\n\nERROR :  Item Does not Exists", err.message);
    return res.status(401).send({ message: "Invalid Product" });
  }
  console.log("\n\t Updated Stock", productsInventory[productId]);

  //Broadcast the StockUpdated to PRODUCTS and QUERY services
  try {
    await axios.post("http://eventbus-srv:4005/events", {
      type: "StockUpdated",
      data: {
        productId,
        new_stock,
      },
    });
  } catch (err) {
    console.log("\n ERROR : Couldnot Broadcase StockUpdated ", err.message);
  }

  res.status(201).send(productsInventory[productId]);
});

app.post("/events", (req, res) => {
  const { type, data } = req.body;

  console.log("---------------Recieved Event", req.body);
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

app.listen(4004, console.log("Orders listening on port 4004"));
