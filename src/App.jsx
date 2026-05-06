import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import { Navigate } from "react-router-dom";
import VideoChat from "./pages/VideoChat";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";

import "./App.css";

function App() {
  const location = useLocation();
  const isVideoChat = location.pathname === "/";

  return (
    <ErrorBoundary>
      <div className="app-bg" style={{ height: '100%' }}>
        {!isVideoChat && <Navbar />}

        <main className={isVideoChat ? "immersive-container" : "main-container"}>
          <Routes>

            <Route path="/messages" element={<Messages />} />
            <Route path="/profile" element={<Profile />} />

            <Route path="/register" element={<Register />} />

            <Route path="/" element={<Navigate to="/login" />} />

            <Route path="/login" element={<Login />} />

            <Route
              path="/video"
              element={
                <ProtectedRoute>
                  <VideoChat />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>

      </div>
    </ErrorBoundary>
  );
}

export default App;