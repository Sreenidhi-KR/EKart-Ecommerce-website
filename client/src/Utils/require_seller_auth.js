import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./auth_context";

export const RequireSellerAuth = ({ children }) => {
  const location = useLocation();
  const auth = useAuth();
  if (!auth?.user || !auth?.user?.isSeller) {
    return <Navigate to="/user-login" state={{ path: location.pathname }} />;
  }
  return (
    <div>
      {children}
      <Outlet />
    </div>
  );
};
