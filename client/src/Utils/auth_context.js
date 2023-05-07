import { useState, createContext, useContext } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (credentials) => {
    try {
      const res = await axios.post(`http://ekart.com/auth/login`, credentials);
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
    } catch (err) {
      console.log(err);
    }
  };

  const register = async (credentials) => {
    try {
      console.log(`http://ekart.com/auth/register`, credentials);
      const res = await axios.post(
        `http://ekart.com/auth/register`,
        credentials
      );
      return res.data;
    } catch (err) {
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
