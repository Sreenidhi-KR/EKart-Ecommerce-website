import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../Utils/auth_context";

const Navbar = () => {
  const auth = useAuth();
  return (
    <>
      <nav className="primary-nav d-flex flex-row justify-content-between align-items-between">
        <NavLink to="/">Ekart</NavLink>
        <div>
          <NavLink to="product-create">Create</NavLink>
          <NavLink to="user-orders">Orders</NavLink>
          <NavLink to="user-cart">Cart</NavLink>
          <NavLink to="user-profile">Profile</NavLink>
        </div>
      </nav>
      <Outlet />
    </>
  );
};

export default Navbar;
