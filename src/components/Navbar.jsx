import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";

export default function Navbar() {

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (

    <nav className="navbar">

      {/* Logo */}
      <div className="logo">
        GLIDE
      </div>

      {/* Desktop Links */}
      <div className={`nav-links ${menuOpen ? "active" : ""}`}>

        <NavLink to="/" onClick={() => setMenuOpen(false)}>
          New Chat
        </NavLink>

        <NavLink to="/messages" onClick={() => setMenuOpen(false)}>
          Messages
          <span className="badge">3</span>
        </NavLink>

        <NavLink to="/profile" onClick={() => setMenuOpen(false)}>
          Profile
        </NavLink>

      </div>

      {/* Right Side */}
      <div className="nav-right">

        {/* Profile */}
        <div
          className="profile"
          onClick={() => setProfileOpen(!profileOpen)}
        >
          <img
            src="https://i.pravatar.cc/40"
            alt="profile"
          />

          {profileOpen && (

            <div className="profile-dropdown">

              <Link to="/profile">My Profile</Link>
              <Link to="/messages">Messages</Link>
              <div className="divider"></div>
              <button>Logout</button>

            </div>

          )}

        </div>

        {/* Mobile Menu Button */}
        <div
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </div>

      </div>

    </nav>

  );

}