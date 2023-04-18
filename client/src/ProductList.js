import React, { useState, useEffect } from "react";
import axios from "axios";
import ReviewCreate from "./ReviewCreate";
import ReviewsList from "./ReviewsList";

const ProductList = () => {
  const [products, setProducts] = useState({});

  const fetchProducts = async () => {
    const res = await axios.get("http://localhost:4002/products");

    setProducts(res.data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const renderedProducts = Object.values(products).map((product) => {
    return (
      <div
        className="card"
        style={{ width: "30%", marginBottom: "20px" }}
        key={product.productId}
      >
        <div className="card-body">
          <h3>{product.name}</h3>
          <h5>₹ {product.price}</h5>
          <h5> Product Reviews</h5>
          <ReviewsList reviews={product.reviews} />
          <ReviewCreate productId={product.productId} />
        </div>
      </div>
    );
  });

  return (
    <div className="d-flex flex-row flex-wrap justify-content-between">
      {renderedProducts}
    </div>
  );
};

export default ProductList;
