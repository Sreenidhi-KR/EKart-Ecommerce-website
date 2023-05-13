import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./auth_context";
import { useEffect } from "react";

export const RequireSellerAuth = ({ children }) => {
  const location = useLocation();
  const auth = useAuth();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (user) {
      auth.setUser(user);
    }
  }, []);

  if (!user || !user?.isSeller) {
    return <Navigate to="/user-login" state={{ path: location.pathname }} />;
  }
  return (
    <div>
      {children}
      <Outlet />
    </div>
  );
};
