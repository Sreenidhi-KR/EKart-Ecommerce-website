import React from "react";
import ProductCreate from "./Components/ProductCreate";
import ProductList from "./Components/ProductList";
import { Route, Routes } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Cart from "./Components/Cart";
import OrderList from "./Components/OrderList";
import { AuthProvider } from "./Utils/auth_context";
import { Login } from "./Components/Login";
import { RequireAuth } from "./Utils/require_auth";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SellerHome from "./Components/SellerHome";
import { RequireSellerAuth } from "./Utils/require_seller_auth";

const App = () => {
  return (
    <AuthProvider>
      <ToastContainer position="bottom-right" autoClose={2500} />
      <Routes>
        <Route element={<Navbar />}>
          <Route element={<RequireAuth />}>
            <Route path="/" element={<ProductList />} />
            <Route path="user-cart" element={<Cart />} />
            <Route path="user-orders" element={<OrderList />} />
          </Route>
          <Route element={<RequireSellerAuth />}>
            <Route path="product-create" element={<ProductCreate />} />
            <Route path="seller-home" element={<SellerHome />} />
          </Route>
        </Route>

        <Route path="user-login" element={<Login />} />

        <Route path="*" element={<h1> Page Not Found</h1>} />
      </Routes>
    </AuthProvider>
  );
};
export default App;
