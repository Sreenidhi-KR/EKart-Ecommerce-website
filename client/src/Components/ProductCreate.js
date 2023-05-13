import React, { useState } from "react";
import axios from "axios";
import getHeaders from "../Utils/jwt_header";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Utils/auth_context";
import ClipLoader from "react-spinners/ClipLoader";

const ProductCreate = () => {
  let [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth();
  let defualtImage =
    "https://www.rallis.com/Upload/Images/thumbnail/Product-inside.png";
  const [productName, setProductName] = useState("");
  const [productImage, setProducImage] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productStock, setProductStock] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      await axios.post(
        "http://ekart.com/product/create",
        {
          name: productName,
          price: productPrice,
          imageUrl: productImage || defualtImage,
          stock: productStock,
        },
        {
          headers: await getHeaders(navigate, auth),
        }
      );
      toast.success("Added Sucessfully");
    } catch (err) {
      toast.error("Error while creating");
    } finally {
      setLoading(false);
    }

    setProductName("");
    setProductPrice("");
    setProductStock("");
    setProducImage("");
  };

  return (
    <div>
      {loading ? (
        <center>
          <ClipLoader
            loading={loading}
            color="white"
            size={50}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </center>
      ) : null}

      <div
        style={{ color: "grey" }}
        className="d-flex justify-content-center align-items-center mt-5"
      >
        <div
          className="card p-5 "
          style={{
            width: "50%",
            height: "70%",
          }}
        >
          <form onSubmit={onSubmit}>
            <div className="form-group">
              <h3 className="mb-3">Add Lisiting</h3>
              <label>Name</label>
              <input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="form-control"
                inputMode="text"
                required
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
                required
              />

              <label>Stock</label>
              <input
                value={productStock}
                onChange={(e) => setProductStock(e.target.value)}
                className="form-control"
                inputMode="numeric"
                type="number"
                required
              />
            </div>
            <button className="btn btn-dark">Submit</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductCreate;
