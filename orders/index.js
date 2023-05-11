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
    }
}

*/

app.post("/orders/create", authenticateToken, async (req, res) => {
  /*
  {
    "total":"10000"
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
  const { products, total } = req.body;

  const userName = req.user.userName;
  if (!ordersList[userName]) ordersList[userName] = {};
  const order_id = randomBytes(4).toString("hex");
  ordersList[userName][order_id] = {}; //Created empty obj as w/o this line it was overwriting existing entry
  ordersList[userName][order_id] = {
    order_id,
    total,
    status: "Pending",
    products: [],
  };
  const orders = [];
  for (let product of products) orders.push(product);
  ordersList[userName][order_id].products = orders;
  try {
    await axios.post("http://eventbus-srv:4005/events", {
      type: "OrderCreated",
      data: {
        order_id,
        userName,
        products,
      },
    });
  } catch (err) {
    console.log(err);
  }
  res.status(201).send({});
});

app.get("/orders", authenticateToken, (req, res) => {
  res.send(ordersList[req.user.userName]);
});

app.post("/events", (req, res) => {
  const { type, data } = req.body;
  if (type === "OrderAccepted") {
    console.log("Recieved Event", req.body);
    const { order_id, userName } = data;
    ordersList[userName][order_id].status = "Accepted";
  }
  if (type === "OrderRejected") {
    console.log("Recieved Event", req.body);
    const { order_id, userName } = data;
    ordersList[userName][order_id].status = "Rejected";
  }
  res.status(201).send({});
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);
  try {
    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
      console.log("erre", err);
      if (err) {
        return res.sendStatus(403);
      }
      //set user from jwt token
      req.user = user;
      next();
    });
  } catch (err) {
    console.log("err", err);
  }
}

//For debuggin thru nodeport
app.get("/ordersList", (req, res) => {
  res.send(ordersList);
});

app.listen(4004, console.log("Orders listening on port 4004"));
