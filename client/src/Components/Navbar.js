import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../Utils/auth_context";

const Navbar = () => {
  const auth = useAuth();
  return (
    <>
      <nav className="primary-nav d-flex flex-row justify-content-between align-items-between">
        <NavLink to="/">Ekart</NavLink>
        <div>
          <NavLink to="create">Create</NavLink>
          <NavLink to="orders">Orders</NavLink>
          <NavLink to="cart">Cart</NavLink>
          <NavLink to="profile">Profile</NavLink>
          {!auth.user && <NavLink to="/login">Login</NavLink>}
        </div>
      </nav>
      <Outlet />
    </>
  );
};

export default Navbar;
