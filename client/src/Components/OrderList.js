import React, { useEffect, useState } from "react";
import ReviewCreate from "./ReviewCreate";
import axios from "axios";
import getHeaders from "../Utils/jwt_header";

const OrderList = () => {
  const [orders, setOrders] = useState({});

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`http://ekart.com/orders`, {
        headers: await getHeaders(),
      });
      console.log(res.data.orders);
      setOrders(res.data.orders);
    } catch (err) {
      console.log(err);
    }
  };

  const renderedOrders = Object.values(orders).map((order) => (
    <div key={order.orderId}>
      <div>
        <div style={{ marginLeft: 20, marginTop: 5 }}>
          <h6> Order Id : {order.orderId}</h6>
          <h6> Order Total : ₹ {order.total}</h6>
          <h6> Order Status : {order.status}</h6>
        </div>
        <div className="d-flex flex-row flex-wrap justify-content-start ">
          {order.products.map((product) => (
            <div
              className="m-2 card justify-content-around align-items-around"
              style={{
                width: "31%",
                height: "40%",
                backgroundColor:
                  order.status === "Accepted" ? "white" : "#d9d9d9",
              }}
              key={product.productId + order.orderId}
            >
              <div className="card-body">
                <div className="d-flex flex-row justify-content-around">
                  <img
                    src={product.imageUrl}
                    style={{ marginRight: "20px" }}
                    width="50%"
                    height="90%"
                    alt="product"
                  />
                  <div className="d-flex flex-column justify-content-start align-items-start ">
                    <h3>{product.name}</h3>
                    <h6>Price : ₹ {product.price}</h6>
                    <h6>Quantity : {product.quantity} Units</h6>
                    {order.status === "Accepted" ? (
                      <ReviewCreate productId={product.productId} />
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <hr></hr>
    </div>
  ));

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="d-flex flex-column flex-wrap justify-content-start">
      {Object.keys(orders).length > 0 ? (
        <h1 className="m-3">My Orders</h1>
      ) : (
        <center className="mt-5">No Orders</center>
      )}
      {renderedOrders}
    </div>
  );
};

export default OrderList;
