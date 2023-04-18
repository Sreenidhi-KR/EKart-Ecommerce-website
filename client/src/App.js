import React from "react";
import ProductCreate from "./ProductCreate";
import ProductList from "./ProductList";

const App = () => {
  return (
    <div className="container">
      <h1>Create Product</h1>
      <ProductCreate />
      <hr />
      <h1>Products</h1>
      <ProductList />
    </div>
  );
};
export default App;
