import React, { useEffect, useState } from "react";
import axios from "axios";
import getHeaders from "../Utils/jwt_header";
import { toast } from "react-toastify";

const SellerHome = () => {
  const [products, setProducts] = useState({});
  const [editKey, setEditKey] = useState(-1);
  const [productName, setProductName] = useState("");
  const [productImage, setProducImage] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productStock, setProductStock] = useState("");

  let defualtImage =
    "https://www.rallis.com/Upload/Images/thumbnail/Product-inside.png";

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`http://ekart.com/product/seller`, {
        headers: await getHeaders(),
      });
      setProducts(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const updateProduct = async (product) => {
    try {
      await axios.post(
        "http://ekart.com/product/update",
        {
          productId: product.productId,
          sellerName: product.sellerName,
          name: productName,
          price: productPrice,
          imageUrl: productImage || defualtImage,
          stock: productStock,
        },
        {
          headers: await getHeaders(),
        }
      );
      toast.success("Edited Sucessfully");
      setEditKey(-1);
      await fetchProducts();
    } catch (err) {
      toast.error("Error while Editing");
    }
  };

  const renderedProducts = Object.values(products).map((product) => {
    return (
      <div
        className="myCard card justify-content-center align-items-center"
        style={{ width: "45%", margin: 20 }}
        key={product.productId}
      >
        <div className="card-body justify-content-start">
          <div className="d-flex flex-row justify-content-around align-items-center">
            <img
              src={product.imageUrl}
              height="200vh"
              width="200hw"
              style={{ marginRight: "30px" }}
              alt="product"
            />
            <div className="d-flex flex-column justify-content-start align-items-start ">
              <label>Name</label>
              <input
                disabled={editKey !== product.productId}
                value={
                  editKey === product.productId ? productName : product.name
                }
                onChange={(e) => setProductName(e.target.value)}
                className="form-control"
                inputMode="text"
              />
              <label>Image Link</label>
              <input
                disabled={editKey !== product.productId}
                value={
                  editKey === product.productId
                    ? productImage
                    : product.imageUrl
                }
                onChange={(e) => setProducImage(e.target.value)}
                className="form-control"
                inputMode="url"
                type="url"
              />

              <label>Price</label>
              <input
                disabled={editKey !== product.productId}
                value={
                  editKey === product.productId ? productPrice : product.price
                }
                onChange={(e) => setProductPrice(e.target.value)}
                className="form-control"
                inputMode="numeric"
                type="number"
              />

              <label>Stock</label>
              <input
                disabled={editKey !== product.productId}
                value={
                  editKey === product.productId ? productStock : product.stock
                }
                onChange={(e) => setProductStock(e.target.value)}
                className="form-control"
                inputMode="numeric"
                type="number"
              />
              {editKey === product.productId ? (
                <div style={{ marginTop: 20 }}>
                  <button
                    style={{ marginRight: 20 }}
                    className="btn btn-success rounded-0"
                    onClick={() => {
                      updateProduct(product);
                    }}
                  >
                    Submit
                  </button>
                  <button
                    className="btn btn-danger rounded-0"
                    onClick={() => {
                      setEditKey(-1);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  style={{ marginTop: 20 }}
                  className="btn myBtn rounded-0"
                  onClick={() => {
                    setProducImage(product.imageUrl);
                    setProductName(product.name);
                    setProductStock(product.stock);
                    setProductPrice(product.price);
                    setEditKey(product.productId);
                  }}
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  });

  useEffect(() => {
    console.log("fetching");
    fetchProducts();
  }, []);

  return (
    <div>
      {products?.length <= 0 ? <h6>No Listings</h6> : null}
      <div className="d-flex flex-row flex-wrap justify-content-start">
        {renderedProducts}
      </div>
    </div>
  );
};

export default SellerHome;
