import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';  // ← ADDED useLocation
import './Navbar.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();  // ← ADDED

  // ============================================================
  // BACKEND CONNECTION AREA - USER SESSION CHECK
  // ============================================================
  // TODO: On mount, verify token with backend and fetch user
  // Example:
  // useEffect(() => {
  //   const token = localStorage.getItem('token');
  //   if (!token) return;
  //   fetch('http://localhost:5000/api/auth/verify', {
  //     headers: { 'Authorization': `Bearer ${token}` }
  //   })
  //     .then(res => res.json())
  //     .then(data => setUser(data.user))
  //     .catch(() => {
  //       localStorage.removeItem('token');
  //       localStorage.removeItem('user');
  //     });
  // }, [location.pathname]);
  // ============================================================

  // Re-check user whenever route changes (after login / signup / logout)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');  // ← ADDED token check

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);  // ← ADDED clear when no token
    }
  }, [location.pathname]);  // ← CHANGED from [] to [location.pathname]

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change  ← ADDED (optional but nice)
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    // BACKEND CONNECTION AREA - Logout API call if needed
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setDropdownOpen(false);
    navigate('/');
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="navbar">
      <div className="nav-container container">
        <NavLink to="/" className="nav-logo">
          <img src="/logo2.png" alt="Swasthya+ Logo" className="logo-image" />
          {/* <span className="logo-text">Swasthya<span>+</span></span> */}
        </NavLink>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>

        <div className={`nav-links ${menuOpen ? 'active' : ''}`}>
          <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
            Home
          </NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
           Dashboard
          </NavLink>
           <NavLink to="/predict" className={({ isActive }) => isActive ? 'active' : ''}>
            Predict
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''}>
            About
          </NavLink>
          <NavLink to="/faq" className={({ isActive }) => isActive ? 'active' : ''}>
            FAQ
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''}>
            Contact
          </NavLink>

          {user ? (
            // Logged in - show profile dropdown
            <div className="user-dropdown" ref={dropdownRef}>
              <button
                className="user-menu-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="user-avatar-nav">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    <span>{getInitials(user.name)}</span>
                  )}
                </div>
                <span className="user-name-nav">{user.name.split(' ')[0]}</span>
                <span className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`}>▾</span>
              </button>

              {dropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} />
                      ) : (
                        <span>{getInitials(user.name)}</span>
                      )}
                    </div>
                    <div>
                      <strong>{user.name}</strong>
                      <small>{user.email}</small>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <NavLink to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    👤 My Profile
                  </NavLink>
                  <NavLink to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    📊 Predictions
                  </NavLink>
                  <NavLink to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    ⚙️ Settings
                  </NavLink>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item logout" onClick={handleLogout}>
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Not logged in - show login/signup buttons
            <div className="auth-buttons">
              <NavLink to="/login" className="btn-login">
                Sign In
              </NavLink>
              <NavLink to="/signup" className="btn-signup">
                Sign Up
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;