import React, { useEffect, useState } from "react";
import ReviewCreate from "./ReviewCreate";
import axios from "axios";
import { useAuth } from "../Utils/auth_context";

const OrderList = () => {
  const [orders, setOrders] = useState({});
  const auth = useAuth();
  const fetchOrders = async () => {
    try {
      const res = await axios.get(`http://ekart.com/orders/${auth.user}`);
      console.log(res.data);
      setOrders(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const renderedOrders = Object.values(orders).map((order) => {
    return (
      <div
        className="container card justify-content-center align-items-center"
        style={{ width: "30%", height: "40%", margin: "20px" }}
        key={order.productId}
      >
        <div className="card-body">
          <img
            src={order.imageUrl}
            style={{ marginBottom: "50px" }}
            height="200vh"
            width="200hw"
            alt="order"
          />
          <h3>{order.name}</h3>
          <h6>Price : ₹ {order.price}</h6>
          <ReviewCreate productId={order.productId} />
        </div>
      </div>
    );
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="d-flex flex-row flex-wrap justify-content-start">
      {renderedOrders}
    </div>
  );
};

export default OrderList;
