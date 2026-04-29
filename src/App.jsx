import React from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import VideoChat from "./pages/VideoChat";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";

import ErrorBoundary from "./components/ErrorBoundary";

import "./App.css";

function App() {
  return (
    <ErrorBoundary>
      <div className="app-bg">
        <Navbar />

        <main className="main-container">
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