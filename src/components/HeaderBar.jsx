import React from "react";
import { Link } from "react-router-dom";

export default function HeaderBar({ user, partner, status }) {
  return (
    <header className="premium-header-bar glass smooth-transition">
      <div className="header-left">
        <Link to="/" className="header-logo">
          <div className="logo-icon-small">G</div>
          <span className="logo-text-small">GLIDE</span>
        </Link>
      </div>

      <div className="header-center">
        {status === "chatting" ? (
          <div className="connection-status chatting">
            <span className="status-dot"></span>
            Connected with <strong>{partner?.username || "Stranger"}</strong>
          </div>
        ) : status === "waiting" ? (
          <div className="connection-status waiting">
            <span className="status-dot blink"></span>
            Searching for a match...
          </div>
        ) : (
          <div className="connection-status idle">
            Ready to connect
          </div>
        )}
      </div>

      <div className="header-right">
        {user && (
          <div className="header-user">
            <span className="user-name">{user.username}</span>
            <img src={user.avatar} alt="avatar" className="header-avatar" />
          </div>
        )}
      </div>
    </header>
  );
}
