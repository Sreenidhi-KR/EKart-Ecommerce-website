import React, { useEffect } from "react";
import { useAuth } from "../Utils/auth_context";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  useEffect(() => {}, []);
  const auth = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.logout();
    navigate("/login");
  };

  return (
    <div>
      Welcome {auth.user}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Profile;
