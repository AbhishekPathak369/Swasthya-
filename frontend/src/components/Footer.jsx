import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

/* ---------- Professional SVG Icons ---------- */
const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M22 6l-10 7L2 6" />
  </svg>
);

const PinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
  </svg>
);

const TwitterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23 4.5a8.6 8.6 0 01-2.5.7A4.3 4.3 0 0022.4 3a8.5 8.5 0 01-2.7 1.05 4.3 4.3 0 00-7.4 3.9A12.3 12.3 0 013.4 3.2a4.3 4.3 0 001.35 5.75 4.2 4.2 0 01-1.95-.55v.06a4.3 4.3 0 003.45 4.23 4.3 4.3 0 01-1.95.07 4.3 4.3 0 004.02 3 8.6 8.6 0 01-6.35 1.78A12.2 12.2 0 007.5 20a12.15 12.15 0 0015.5-12.15A8.7 8.7 0 0023 4.5z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 110-4.12 2.06 2.06 0 010 4.12zM7.12 20.45H3.55V9h3.57v11.45z" />
  </svg>
);

const GithubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.69-3.87-1.37-3.87-1.37-.52-1.32-1.28-1.67-1.28-1.67-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.19a11.1 11.1 0 015.79 0c2.21-1.5 3.18-1.19 3.18-1.19.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.25 5.69.41.36.77 1.06.77 2.13v3.16c0 .31.21.67.8.56A11.5 11.5 0 0023.5 12C23.5 5.65 18.35.5 12 .5z" />
  </svg>
);

const YoutubeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 00.5 6.2 31.3 31.3 0 000 12a31.3 31.3 0 00.5 5.8 3 3 0 002.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 002.1-2.1A31.3 31.3 0 0024 12a31.3 31.3 0 00-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z" />
  </svg>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container container">
        <div className="footer-grid">
          {/* Brand column */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <img src="/logo2.png" alt="Swasthya+" className="footer-logo-img" />
            </Link>
            <p className="footer-desc">
              Intelligent Disease Prediction using Hybrid Deep Learning and Explainable AI.
              Making healthcare accessible and interpretable.
            </p>
            <div className="footer-social">
              <a href="#" aria-label="Twitter" className="social-link"><TwitterIcon /></a>
              <a href="#" aria-label="LinkedIn" className="social-link"><LinkedInIcon /></a>
              <a href="#" aria-label="GitHub" className="social-link"><GithubIcon /></a>
              <a href="#" aria-label="YouTube" className="social-link"><YoutubeIcon /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="footer-links">
            <h4>Resources</h4>
            <ul>
              <li><a href="#">Research Paper</a></li>
              <li><a href="#">GitHub Repository</a></li>
              <li><a href="#">Documentation</a></li>
              <li><a href="#">API Reference</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-contact">
            <h4>Get in Touch</h4>
            <p>
              <span className="contact-icon"><MailIcon /></span>
              <span>Abhiii_Pathak_@gmail.com</span>
            </p>
            <p>
              <span className="contact-icon"><PinIcon /></span>
              <span>ABES Engineering College, Ghaziabad</span>
            </p>
            <p>
              <span className="contact-icon"><PhoneIcon /></span>
              <span>+91-XXXXXXXXXX</span>
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {currentYear} Swasthya+ Team. All rights reserved.</p>
          <p>Department of Information Technology · ABES Engineering College</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;