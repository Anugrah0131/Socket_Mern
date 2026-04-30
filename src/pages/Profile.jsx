import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar-large">
            <img src={user.avatar} alt="User Avatar" />
            <div className={`status-dot ${user.isGuest ? 'guest' : 'online'}`}></div>
          </div>
          <h1 className="profile-name">{user.username}</h1>
          <p className="profile-role">{user.isGuest ? "Guest Explorer" : "Premium Member"}</p>
        </div>

        <div className="profile-stats">
          <div className="stat-item">
            <span className="stat-value">124</span>
            <span className="stat-label">Chats</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">4.9</span>
            <span className="stat-label">Rating</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">12</span>
            <span className="stat-label">Friends</span>
          </div>
        </div>

        <div className="profile-info">
          <div className="info-group">
            <label>User ID</label>
            <div className="info-value">{user.userId}</div>
          </div>
          {!user.isGuest && (
            <div className="info-group">
              <label>Email Address</label>
              <div className="info-value">{user.email || "No email linked"}</div>
            </div>
          )}
          <div className="info-group">
            <label>Member Since</label>
            <div className="info-value">April 2026</div>
          </div>
        </div>

        <div className="profile-actions">
          <button className="edit-btn">Edit Profile</button>
          {!user.isGuest && (
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          )}
        </div>
        
        {user.isGuest && (
          <div className="guest-notice">
            <p>You are currently browsing as a guest. Register an account to save your chat history and unlock premium features!</p>
            <button className="register-btn-small" onClick={() => navigate("/register")}>Register Now</button>
          </div>
        )}
      </div>
    </div>
  );
}