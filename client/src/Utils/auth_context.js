import { useState, createContext, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (credentials) => {
    try {
      const res = await axios.post(`http://ekart.com/auth/login`, credentials);
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
      toast.success("Logged In Sucessfully");
    } catch (err) {
      console.log(err);
      toast.error(`Error : ${err.response.data}`);
      console.log(err);
    }
  };

  const register = async (credentials, setRegister) => {
    try {
      const res = await axios.post(
        `http://ekart.com/auth/register`,
        credentials
      );
      toast.success("Registered Sucessfully");
      setRegister(false);
      return res.data;
    } catch (err) {
      toast.error(`Error : ${err.response.data}`);
      console.log(err);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
