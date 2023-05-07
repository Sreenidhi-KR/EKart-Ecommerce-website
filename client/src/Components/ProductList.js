import React, { useState, useEffect } from "react";
import axios from "axios";

import ReviewsList from "./ReviewsList";

const ProductList = () => {
  const [products, setProducts] = useState({});

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://ekart.com/products");
      setProducts(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const addToCart = (item) => {
    const cartItems = JSON.parse(localStorage.getItem("cartItems")) || {};
    cartItems[item.productId] = item;
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const renderedProducts = Object.values(products).map((product) => {
    return (
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
          <h6>Stock : {product.stock} Units</h6>
          <h6>Seller : {product.sellerName}</h6>
          <h6> Product Reviews</h6>
          <ReviewsList reviews={product.reviews} />
          {/* <ReviewCreate productId={product.productId} /> */}
          <button
            onClick={() => addToCart(product)}
            className="btn btn-primary"
            style={{ alignSelf: "flex-end" }}
          >
            Add To Cart
          </button>
        </div>
      </div>
    );
  });

  return (
    <div className="d-flex flex-row flex-wrap justify-content-start">
      {renderedProducts}
    </div>
  );
};

export default ProductList;
