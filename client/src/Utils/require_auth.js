import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./auth_context";

export const RequireAuth = ({ children }) => {
  const location = useLocation();
  const auth = useAuth();
  if (!auth.user) {
    return <Navigate to="/user-login" state={{ path: location.pathname }} />;
  }
  return (
    <div>
      {children}
      <Outlet />
    </div>
  );
};
