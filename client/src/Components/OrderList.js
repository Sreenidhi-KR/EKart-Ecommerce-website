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
      setOrders(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const renderedOrders = Object.values(orders).map((order) => (
    <div>
      <div className="d-flex flex-column flex-wrap justify-content-start align-items-start">
        <div style={{ marginLeft: 20, marginTop: 20 }}>
          <h6> Order Id : {order.order_id}</h6>
          <h6> Order Total : ₹ {order.total}</h6>
        </div>
        <div className="d-flex flex-row flex-wrap container ">
          {order.products.map((product) => (
            <div
              className="container card justify-content-center align-items-center"
              style={{ width: "30%", height: "40%", margin: "20px" }}
              key={product.productId}
            >
              <div className="card-body">
                <img
                  src={product.imageUrl}
                  style={{ marginBottom: "50px" }}
                  height="200vh"
                  width="200hw"
                  alt="product"
                />
                <h3>{product.name}</h3>
                <h6>Price : ₹ {product.price}</h6>
                <h6>Quantity : {product.quantity} Units</h6>
                <ReviewCreate productId={product.productId} />
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
      ) : null}
      {renderedOrders}
    </div>
  );
};

export default OrderList;
