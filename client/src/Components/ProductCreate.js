import React, { useState } from "react";
import axios from "axios";
import getHeaders from "../Utils/jwt_header";
import { toast } from "react-toastify";

const ProductCreate = () => {
  let defualtImage =
    "https://www.rallis.com/Upload/Images/thumbnail/Product-inside.png";
  const [productName, setProductName] = useState("");
  const [productImage, setProducImage] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productStock, setProductStock] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();

    try {
      await axios.post(
        "http://ekart.com/product/create",
        {
          name: productName,
          price: productPrice,
          imageUrl: productImage || defualtImage,
          stock: productStock,
        },
        {
          headers: await getHeaders(),
        }
      );
      toast.success("Added Sucessfully");
    } catch (err) {
      toast.error("Error while creating");
    }

    setProductName("");
    setProductPrice("");
    setProductStock("");
    setProducImage("");
  };

  return (
    <div className="container">
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="form-control"
            inputMode="text"
          />
          <label>Image Link</label>
          <input
            value={productImage}
            onChange={(e) => setProducImage(e.target.value)}
            className="form-control"
            inputMode="url"
            type="url"
          />

          <label>Price</label>
          <input
            value={productPrice}
            onChange={(e) => setProductPrice(e.target.value)}
            className="form-control"
            inputMode="numeric"
            type="number"
          />

          <label>Stock</label>
          <input
            value={productStock}
            onChange={(e) => setProductStock(e.target.value)}
            className="form-control"
            inputMode="numeric"
            type="number"
          />
        </div>
        <button className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
};

export default ProductCreate;
