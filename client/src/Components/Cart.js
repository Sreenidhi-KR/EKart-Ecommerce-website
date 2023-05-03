import React, { useEffect, useState } from "react";
import { useAuth } from "../Utils/auth_context";
import axios from "axios";

const Cart = () => {
  const [cartItems, setCartItems] = useState(
    JSON.parse(localStorage.getItem("cartItems")) || {}
  );

  const auth = useAuth();

  const removeFromCart = (item) => {
    const cartItems = JSON.parse(localStorage.getItem("cartItems")) || {};
    delete cartItems[item.productId];
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    setCartItems(cartItems);
    console.log(JSON.parse(localStorage.getItem("cartItems")));
  };

  const renderedProducts = Object.values(cartItems).map((product) => {
    console.log(product);
    return (
      <div
        className="card justify-content-center align-items-center"
        style={{ width: "47%", margin: "10px" }}
        key={product.productId}
      >
        <div className="card-body">
          <div className="d-flex flex-row justify-content-between">
            <img
              src={product.imageUrl}
              height="200vh"
              width="200hw"
              style={{ marginRight: "30px" }}
              alt="product"
            />
            <div className="d-flex flex-column justify-content-start align-items-start ">
              <h3>{product.name}</h3>
              <h6>Price : ₹ {product.price}</h6>
              <button
                className="btn btn-danger"
                onClick={() => {
                  removeFromCart(product);
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  });

  const computeTotalPrice = () => {
    let total = 0;
    Object.values(cartItems).forEach((product) => {
      total += parseInt(product.price);
    });
    return total;
  };

  const placeOrder = async () => {
    const userId = auth.user;
    const products = Object.values(cartItems);
    const result = products.map(({ productId, name, imageUrl, price }) => ({
      productId,
      name,
      imageUrl,
      price,
      quantity: 1,
    }));

    console.log({
      userId,
      result,
    });
    try {
      await axios.post("http://ekart.com/orders/create", {
        userId,
        products: result,
      });
    } catch (err) {
      console.log(err);
    }
    setCartItems({});
    localStorage.clear();
  };

  useEffect(() => {}, []);

  return computeTotalPrice() > 0 ? (
    <div className="row">
      <div className="col-9">
        <div className="d-flex flex-row flex-wrap justify-content-start">
          {renderedProducts}
        </div>
      </div>
      <div className="col  ">
        <h4 className="m-3"> Cart Summary</h4>
        <h6 className="m-3"> Total Amount : ₹ {computeTotalPrice()}</h6>
        <button className="btn btn-success ml-3" onClick={placeOrder}>
          Place Order
        </button>
      </div>
    </div>
  ) : (
    <center className="mt-5">No Items in Cart</center>
  );
};

export default Cart;
