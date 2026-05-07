import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../api/axiosConfig";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    restoreSession();

    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          if (location.pathname !== "/login" && location.pathname !== "/register") {
            setUser(null);
            navigate("/login");
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [navigate, location.pathname]);

  const restoreSession = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/auth/me");
      if (data.success) {
        setUser(data.user);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data } = await axios.post("/auth/login", { email, password });
    if (data.success) {
      setUser(data.user);
      return data;
    }
  };

  const register = async (username, email, password) => {
    const { data } = await axios.post("/auth/register", {
      username,
      email,
      password,
    });
    if (data.success) {
      setUser(data.user);
      return data;
    }
  };

  const loginAsGuest = async () => {
    const { data } = await axios.get("/auth/guest");
    if (data.success) {
      setUser(data.user);
      return data;
    }
  };

  const logout = async () => {
    try {
      await axios.post("/auth/logout");
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      setUser(null);
      navigate("/login");
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, loginAsGuest, logout, loading, restoreSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
}; 
