import React, { useEffect } from "react";
import { useAuth } from "../Utils/auth_context";

const SellerHome = () => {
  useEffect(() => {}, []);
  const auth = useAuth();

  return <div>Welcome {auth.user.userName}</div>;
};

export default SellerHome;
