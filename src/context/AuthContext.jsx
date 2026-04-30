/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axiosConfig";

const AuthContext = createContext(null);

const getAvatarUrl = (seed) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      // 1. Check for persistent authenticated user
      const storedAuth = localStorage.getItem("authState");
      if (storedAuth) {
        const parsedAuth = JSON.parse(storedAuth);
        
        // If it's a real user, we use it
        if (!parsedAuth.user.isGuest) {
          setUser({
            ...parsedAuth.user,
            avatar: getAvatarUrl(parsedAuth.user.username)
          });
          setToken(parsedAuth.token);
          setLoading(false);
          return;
        } else {
          // If it was a guest in localStorage (old logic), clean it up
          localStorage.removeItem("authState");
        }
      }

      // 2. Check for guest in current session
      const sessionGuest = sessionStorage.getItem("guestAuthState");
      if (sessionGuest) {
        const parsedGuest = JSON.parse(sessionGuest);
        setUser({
          ...parsedGuest.user,
          avatar: getAvatarUrl(parsedGuest.user.username)
        });
        setToken(parsedGuest.token);
      } else {
        // 3. Create fresh guest for this tab
        try {
          const response = await api.get("/auth/guest");
          const { user: guestUser, token: guestToken } = response.data;
          
          const userWithAvatar = {
            ...guestUser,
            avatar: getAvatarUrl(guestUser.username)
          };

          setUser(userWithAvatar);
          setToken(guestToken);

          sessionStorage.setItem(
            "guestAuthState",
            JSON.stringify({ user: userWithAvatar, token: guestToken })
          );
        } catch (err) {
          console.error("Failed to create guest user:", err);
          const fallbackUsername = `guest_${Math.floor(Math.random() * 10000)}`;
          const fallbackGuest = {
            userId: `local_${Math.random().toString(36).substr(2, 9)}`,
            username: fallbackUsername,
            avatar: getAvatarUrl(fallbackUsername),
            isGuest: true,
          };
          setUser(fallbackGuest);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const { user: loggedInUser, token: authToken } = response.data;
    
    const userWithAvatar = {
      ...loggedInUser,
      avatar: getAvatarUrl(loggedInUser.username)
    };

    setUser(userWithAvatar);
    setToken(authToken);
    
    // Authenticated users go to localStorage
    localStorage.setItem(
      "authState",
      JSON.stringify({ user: userWithAvatar, token: authToken })
    );
    // Clear any guest state
    sessionStorage.removeItem("guestAuthState");
  };

  const register = async (username, email, password) => {
    const response = await api.post("/auth/register", { username, email, password });
    const { user: registeredUser, token: authToken } = response.data;
    
    const userWithAvatar = {
      ...registeredUser,
      avatar: getAvatarUrl(registeredUser.username)
    };

    setUser(userWithAvatar);
    setToken(authToken);
    
    localStorage.setItem(
      "authState",
      JSON.stringify({ user: userWithAvatar, token: authToken })
    );
    sessionStorage.removeItem("guestAuthState");
  };

  const logout = async () => {
    try {
      localStorage.removeItem("authState");
      
      const response = await api.get("/auth/guest");
      const { user: guestUser, token: guestToken } = response.data;
      
      const userWithAvatar = {
        ...guestUser,
        avatar: getAvatarUrl(guestUser.username)
      };

      setUser(userWithAvatar);
      setToken(guestToken);
      
      sessionStorage.setItem(
        "guestAuthState",
        JSON.stringify({ user: userWithAvatar, token: guestToken })
      );
    } catch (err) {
      console.error("Logout reset error:", err);
      localStorage.removeItem("authState");
      sessionStorage.removeItem("guestAuthState");
      window.location.reload(); 
    }
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