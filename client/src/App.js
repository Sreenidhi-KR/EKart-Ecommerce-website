import React from "react";
import ProductCreate from "./Components/ProductCreate";
import ProductList from "./Components/ProductList";
import { Route, Routes } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Cart from "./Components/Cart";
import OrderList from "./Components/OrderList";
import { AuthProvider } from "./Utils/auth_context";
import { Login } from "./Components/Login";
import Profile from "./Components/Profile";
import { RequireAuth } from "./Utils/require_auth";

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route
          element={
            <RequireAuth>
              <Navbar />
            </RequireAuth>
          }
        >
          <Route path="/" element={<ProductList />} />
          <Route path="product-create" element={<ProductCreate />} />
          <Route path="user-cart" element={<Cart />} />
          <Route path="user-profile" element={<Profile />} />
          <Route path="user-orders" element={<OrderList />} />
        </Route>

        <Route path="user-login" element={<Login />} />

        <Route path="*" element={<h1> Page Not Found</h1>} />
      </Routes>
    </AuthProvider>
  );
};
export default App;
