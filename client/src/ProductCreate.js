import React, { useState } from "react";
import axios from "axios";

const ProductCreate = () => {
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();

    await axios.post("http://ecommerce.com/products/create", {
      name: productName,
      price: productPrice,
    });

    setProductName("");
    setProductPrice("");
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="form-control"
          />
          <label>Price</label>
          <input
            value={productPrice}
            onChange={(e) => setProductPrice(e.target.value)}
            className="form-control"
          />
        </div>
        <button className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
};

export default ProductCreate;
