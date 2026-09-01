import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="nav-container container">
        <NavLink to="/" className="nav-logo">
          <img 
            src="/logo2.png" 
            alt="Swasthya+ Logo" 
            className="logo-image"
          />
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
          <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''}>
            About
          </NavLink>
          <NavLink to="/faq" className={({ isActive }) => isActive ? 'active' : ''}>
            FAQ
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''}>
            Contact
          </NavLink>
          <button className="nav-cta">Try Demo</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;