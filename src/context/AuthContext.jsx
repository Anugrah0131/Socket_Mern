/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import api from "../api/axiosConfig";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      const storedAuth = localStorage.getItem("authState");

      if (storedAuth) {
        const parsedAuth = JSON.parse(storedAuth);
        setUser(parsedAuth.user);
        setToken(parsedAuth.token);
      } else {
        // Auto-create guest user
        const guestUser = {
          userId: uuidv4(),
          username: `guest_${Math.floor(Math.random() * 10000)}`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
          isGuest: true,
        };
        
        setUser(guestUser);
        setToken(null);

        localStorage.setItem(
          "authState",
          JSON.stringify({ user: guestUser, token: null })
        );
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const { user: loggedInUser, token: authToken } = response.data;
    
    setUser(loggedInUser);
    setToken(authToken);
    
    localStorage.setItem(
      "authState",
      JSON.stringify({ user: loggedInUser, token: authToken })
    );
  };

  const register = async (username, email, password) => {
    const response = await api.post("/auth/register", { username, email, password });
    const { user: registeredUser, token: authToken } = response.data;
    
    setUser(registeredUser);
    setToken(authToken);
    
    localStorage.setItem(
      "authState",
      JSON.stringify({ user: registeredUser, token: authToken })
    );
  };

  const logout = () => {
    // Revert to a new guest user
    const guestUser = {
      userId: uuidv4(),
      username: `guest_${Math.floor(Math.random() * 10000)}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
      isGuest: true,
    };
    
    setUser(guestUser);
    setToken(null);
    
    localStorage.setItem(
      "authState",
      JSON.stringify({ user: guestUser, token: null })
    );
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-zinc-950"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);