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
      console.log(res.data?.orders);
      if (res.data?.orders) {
        setOrders(res.data?.orders);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const renderedOrders = Object.values(orders).map((order) => (
    <div key={order.orderId}>
      <hr style={{ backgroundColor: "white", opacity: 0.2, height: 0.1 }}></hr>
      <div>
        <div style={{ marginLeft: 20 }}>
          <h6>
            Order Id : {order.orderId} &emsp; |&emsp; Order Total : ₹{" "}
            {order.total}
            &emsp; | &emsp;Order Status : {order.status}
          </h6>
        </div>
        <div className="d-flex flex-row flex-wrap justify-content-start ">
          {order.products.map((product) => (
            <div
              className="myCard card justify-content-center align-items-around"
              style={{
                width: "31%",
                height: "40%",
                margin: "10px",
              }}
              key={product.productId + order.orderId}
            >
              <div className="myCard card-body">
                <div className="d-flex flex-row">
                  <img
                    src={product.imageUrl}
                    style={{ marginRight: "20px" }}
                    width="50%"
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
    </div>
  ));

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="d-flex flex-column flex-wrap justify-content-start">
      {Object.keys(orders).length > 0 ? null : (
        <center className="mt-5">No Orders</center>
      )}
      {renderedOrders}
    </div>
  );
};

export default OrderList;
