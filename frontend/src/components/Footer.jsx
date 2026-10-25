import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <span>❤️</span>
              <span>Swasthya<span>+</span></span>
            </div>
            <p className="footer-desc">
              Intelligent Disease Prediction using Hybrid Deep Learning and Explainable AI.
              Making healthcare accessible and interpretable.
            </p>
            <div className="footer-social">
              <a href="#" aria-label="Twitter">🐦</a>
              <a href="#" aria-label="LinkedIn">💼</a>
              <a href="#" aria-label="GitHub">🐙</a>
              <a href="#" aria-label="YouTube">▶️</a>
            </div>
          </div>

          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Resources</h4>
            <ul>
              <li><a href="#">Research Paper</a></li>
              <li><a href="#">GitHub Repo</a></li>
              <li><a href="#">Documentation</a></li>
              <li><a href="#">API Reference</a></li>
            </ul>
          </div>

          <div className="footer-contact">
            <h4>Get in Touch</h4>
            <p>📧 agrimg8@gmail.com</p>
            <p>📍 ABES Engineering College, Ghaziabad</p>
            <p>📱 +91-XXXXXXXXXX</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {currentYear} Swasthya+ Team. All rights reserved.</p>
          <p>Department of Information Technology | ABES Engineering College</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;