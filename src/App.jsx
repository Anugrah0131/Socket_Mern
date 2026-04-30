import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";

import VideoChat from "./pages/VideoChat";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";

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
            <Route path="/" element={<VideoChat />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>

      </div>
    </ErrorBoundary>
  );
}

export default App;