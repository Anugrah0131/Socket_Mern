import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL || "http://localhost:3000/api",
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
  (config) => {
    // You can parse the token from localStorage
    const storedAuth = localStorage.getItem("authState");
    if (storedAuth) {
      const { token } = JSON.parse(storedAuth);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
