import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../Utils/auth_context";
import Profile from "./Profile";

const Navbar = () => {
  const auth = useAuth();
  return auth?.user?.isSeller ? (
    <>
      <nav className="primary-nav d-flex flex-row justify-content-between align-items-between">
        <NavLink to="seller-home">Ekart</NavLink>
        <div className="d-flex flex-row">
          <NavLink to="product-create">Create</NavLink>
          <Profile />
        </div>
      </nav>
      <Outlet />
    </>
  ) : (
    <>
      <nav className="primary-nav d-flex flex-row justify-content-between align-items-between">
        <NavLink to="/">Ekart</NavLink>
        <div className="d-flex flex-row">
          <NavLink to="user-orders">Orders</NavLink>
          <NavLink to="user-cart">Cart</NavLink>
          <Profile />
        </div>
      </nav>
      <Outlet />
    </>
  );
};

export default Navbar;
