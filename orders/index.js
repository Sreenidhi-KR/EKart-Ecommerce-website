/** @format */

const express = require("express");
const bodyParser = require("body-parser");
const { randomBytes } = require("crypto");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const mongoose = require("mongoose");
const ORDERS = require("./Orders");
const app = express();
app.use(bodyParser.json());
app.use(cors());

const ACCESS_TOKEN_SECRET =
  "cfb62c7e5f017b1531ecf97e60c1e90b2927a5923a163a43e287e50ac21cab5192a03c6e1698bd7012153f985274cf8d6b9eb84b3efa10d895278b68442f89bf";

let dbURL =
  "mongodb+srv://Simha:Simha@cluster0.w56omxb.mongodb.net/Orders?retryWrites=true&w=majority";

mongoose
  .connect(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .catch((e) => {
    console.log("Failed to connect to Order Service MongoDb", e.message);
  });

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
app.post("/orders/create", authenticateToken, async (req, res) => {
  try {
    const { products, total } = req.body;
    const userName = req.user.userName;
    const orderId = randomBytes(4).toString("hex");

    let order = {
      orderId,
      total,
      status: "Pending",
      products: [],
    };
    const orderProducts = [];
    for (let product of products) orderProducts.push(product);
    order.products = orderProducts;

    await ORDERS.findOneAndUpdate(
      { userId: userName },
      { $push: { orders: { orderId, ...order } } },
      { new: true, upsert: true }
    );

    await axios.post("http://eventbus-srv:4005/events", {
      type: "OrderCreated",
      data: {
        order_id: orderId,
        userName,
        products,
      },
    });
    res.status(201).send({});
  } catch (err) {
    console.log(err);
    res.status(500).send({ errMsg: "Could not create Order" });
  }
});

app.get("/orders", authenticateToken, async (req, res) => {
  try {
    const ordersList = await ORDERS.find({
      userId: req.user.userName,
    });
    res.send({ ordersList });
  } catch (err) {
    console.log("ERROR : Getting Orders ", err.message);
    res.status(500).send({ errMsg: "Could not fetch Order" });
  }
});

app.post("/events", async (req, res) => {
  const { type, data } = req.body;
  if (type === "OrderAccepted") {
    const { order_id, userName } = data;
    await updateOrderStatus(userName, order_id, "Accepted");
  }
  if (type === "OrderRejected") {
    const { order_id, userName } = data;
    await updateOrderStatus(userName, order_id, "Rejected");
  }
  res.status(201).send({});
});

async function updateOrderStatus(userId, orderId, newStatus) {
  try {
    await ORDERS.findOneAndUpdate(
      { userId, "orders.orderId": orderId },
      { $set: { "orders.$.status": newStatus } },
      { new: true }
    );
  } catch (error) {
    console.error("Error updating order status:", error);
  }
}

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

app.listen(4004, console.log("Orders listening on port 4004"));

//ordersList :
/*


{
  user_id:{
   [ order_id,
    total.
    status,
    products:[]
  ]
  }
  ------------------------------Examle : 

[
    {
        "_id": "645d3ce5f74978ad32c877be",
        "userId": "u1",
        "__v": 0,
        "orders": [
            {
                "orderId": "b1182c9e",
                "total": 12,
                "status": "Pending",
                "products": [
                    {
                        "productId": "a79027c1",
                        "name": "yuyuyuy",
                        "imageUrl": "https://www.rallis.com/Upload/Images/thumbnail/Product-inside.png",
                        "price": 12,
                        "quantity": 1,
                        "_id": "645d3ce4154cd65b6a9ff90f"
                    }
                ],
                "_id": "645d3ce4154cd65b6a9ff90e"
            },
            {
                "orderId": "0d20cfd6",
                "total": 24,
                "status": "Pending",
                "products": [
                    {
                        "productId": "66473d88",
                        "name": "bike",
                        "imageUrl": "https://www.rallis.com/Upload/Images/thumbnail/Product-inside.png",
                        "price": 12,
                        "quantity": 1,
                        "_id": "645d3d0b154cd65b6a9ff914"
                    },
                    {
                        "productId": "a79027c1",
                        "name": "yuyuyuy",
                        "imageUrl": "https://www.rallis.com/Upload/Images/thumbnail/Product-inside.png",
                        "price": 12,
                        "quantity": 1,
                        "_id": "645d3d0b154cd65b6a9ff915"
                    }
                ],
                "_id": "645d3d0b154cd65b6a9ff913"
            }
        ]
    },
    {
        "_id": "645d3e07f74978ad32cb667f",
        "userId": "s1",
        "__v": 0,
        "orders": [
            {
                "orderId": "6d9c19c8",
                "total": 24,
                "status": "Pending",
                "products": [
                    {
                        "productId": "66473d88",
                        "name": "bike",
                        "imageUrl": "https://www.rallis.com/Upload/Images/thumbnail/Product-inside.png",
                        "price": 12,
                        "quantity": 1,
                        "_id": "645d3e064d05b599882c3967"
                    },
                    {
                        "productId": "a79027c1",
                        "name": "yuyuyuy",
                        "imageUrl": "https://www.rallis.com/Upload/Images/thumbnail/Product-inside.png",
                        "price": 12,
                        "quantity": 1,
                        "_id": "645d3e064d05b599882c3968"
                    }
                ],
                "_id": "645d3e064d05b599882c3966"
            },
            {
                "orderId": "b8d24909",
                "total": 24,
                "status": "Pending",
                "products": [
                    {
                        "productId": "66473d88",
                        "name": "bike",
                        "imageUrl": "https://www.rallis.com/Upload/Images/thumbnail/Product-inside.png",
                        "price": 12,
                        "quantity": 1,
                        "_id": "645d4235e492d104e918aa30"
                    },
                    {
                        "productId": "a79027c1",
                        "name": "yuyuyuy",
                        "imageUrl": "https://www.rallis.com/Upload/Images/thumbnail/Product-inside.png",
                        "price": 12,
                        "quantity": 1,
                        "_id": "645d4235e492d104e918aa31"
                    }
                ],
                "_id": "645d4235e492d104e918aa2f"
            },
            {
                "orderId": "6d6007b2",
                "total": 12,
                "status": "Accepted",
                "products": [
                    {
                        "productId": "a79027c1",
                        "name": "yuyuyuy",
                        "imageUrl": "https://www.rallis.com/Upload/Images/thumbnail/Product-inside.png",
                        "price": 12,
                        "quantity": 1,
                        "_id": "645d42bd278ab32aa6b30c02"
                    }
                ],
                "_id": "645d42bd278ab32aa6b30c01"
            }
        ]
    },
  
]




}

*/
