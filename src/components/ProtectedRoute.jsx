import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "var(--bg-dark)" }}>
        <div className="loading-spinner-auth" style={{ width: "40px", height: "40px", borderWidth: "4px" }}></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
}