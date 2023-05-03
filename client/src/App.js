import React from "react";
import ProductCreate from "./Components/ProductCreate";
import ProductList from "./Components/ProductList";
import { Route, Routes } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Cart from "./Components/Cart";
import Orders from "./Components/Orders";
import { AuthProvider } from "./Utils/auth_context";
import { Login } from "./Components/Login";
import Profile from "./Components/Profile";
import { RequireAuth } from "./Utils/require_auth";

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route
          path="/"
          element={
            <RequireAuth>
              <Navbar />
            </RequireAuth>
          }
        >
          <Route index element={<ProductList />} />
          <Route path="create" element={<ProductCreate />} />
          <Route path="cart" element={<Cart />} />
          <Route path="orders" element={<Orders />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="login" element={<Login />} />

        <Route path="*" element={<h1> Page Not Found</h1>} />
      </Routes>
    </AuthProvider>
  );
};
export default App;
