import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/login");
  };

  return (
    <nav className={`navbar-v2 glass smooth-transition ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-container">
        <Link to="/" className="nav-brand" onClick={() => setMenuOpen(false)}>
          <div className="logo-icon">G</div>
          <span className="logo-text">GLIDE</span>
        </Link>

        <div className={`nav-menu ${menuOpen ? "open" : ""}`}>
          <Link 
            to="/" 
            className={`nav-item ${location.pathname === "/" ? "active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            Video Chat
          </Link>
          <Link 
            to="/messages" 
            className={`nav-item ${location.pathname === "/messages" ? "active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            Messages
          </Link>
          <Link 
            to="/profile" 
            className={`nav-item ${location.pathname === "/profile" ? "active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            Profile
          </Link>
        </div>

        <div className="nav-actions">
          {user ? (
            <div className="nav-profile-group">
              <Link to="/profile" className="nav-user-pill glass" onClick={() => setMenuOpen(false)}>
                <img src={user.avatar} alt="avatar" className="nav-avatar" />
                <span className="nav-username">{user.username}</span>
              </Link>
              <button className="nav-logout-btn" onClick={handleLogout} title="Logout">
                🚪
              </button>
            </div>
          ) : (
            <div className="nav-auth-btns">
              <Link to="/login" className="nav-login-link" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="nav-register-btn" onClick={() => setMenuOpen(false)}>Join Now</Link>
            </div>
          )}

          <button className={`menu-toggle ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(!menuOpen)}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
      
      {menuOpen && <div className="nav-overlay" onClick={() => setMenuOpen(false)}></div>}
    </nav>
  );
}