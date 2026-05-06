import React, {createContext, useState, useEffect, useContext} from "react";

import axios from "../api/axiosConfig";
export const AuthContext = createContext(); 

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser(storedUser);
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await axios.post("/auth/login", { email, password });

    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
  };

  const register = async (username, email, password) => {
  const { data } = await axios.post("/auth/register", {
    username,
    email,
    password,
  });

  localStorage.setItem("user", JSON.stringify(data));
  setUser(data);
};

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  return useContext(AuthContext);
}; 
