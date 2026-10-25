import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

/* ==========================================================
   Professional SVG Icons
   ========================================================== */
const ArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="btn-arrow">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const FileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="btn-icon">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const DnaIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 15c6.667-6 13.333 0 20-6" />
    <path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993" />
    <path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993" />
    <path d="M17 6l-2.5-2.5" />
    <path d="M14 8l-1-1" />
    <path d="M7 18l2.5 2.5" />
    <path d="M10 16l1 1" />
    <path d="M7 9l12 6" />
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const BoltIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const ChartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const HospitalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21h18" />
    <path d="M5 21V7l7-4 7 4v14" />
    <path d="M12 9v6" />
    <path d="M9 12h6" />
  </svg>
);

/* ==========================================================
   Component
   ========================================================== */
const Home = () => {
  const featuresRef = useRef(null);
  const [featuresVisible, setFeaturesVisible] = useState(false);

  // Reveal-on-scroll for features section
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setFeaturesVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (featuresRef.current) observer.observe(featuresRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="home">
      {/* ============= HERO ============= */}
      <section className="hero-section">
        <div className="hero-bg-orb hero-orb-1"></div>
        <div className="hero-bg-orb hero-orb-2"></div>

        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              <div className="hero-badge">
                <span className="pulse-dot"></span>
                AI-Powered Healthcare Platform
              </div>

              <h1 className="hero-title">
                <span className="title-line">Swasthya<span className="logo-plus">+</span></span>
                <span className="title-line title-sub">Intelligent Disease Prediction</span>
              </h1>

              <p className="hero-desc">
                Leveraging hybrid deep learning and explainable AI to deliver accurate,
                interpretable, and personalized disease predictions — designed for
                early diagnosis and better healthcare outcomes.
              </p>

              <div className="hero-buttons">
                <Link to="/contact" className="btn btn-primary">
                  <span>Get Started</span>
                  <ArrowRight />
                </Link>
                <a href="#" className="btn btn-outline">
                  <FileIcon />
                  <span>Research Paper</span>
                </a>
              </div>

              <div className="hero-stats">
                <div className="stat">
                  <span className="stat-number">97.8%</span>
                  <span className="stat-label">Test Accuracy</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat">
                  <span className="stat-number">0.010</span>
                  <span className="stat-label">CV Std Dev</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat">
                  <span className="stat-number">0.97</span>
                  <span className="stat-label">F1-Score</span>
                </div>
              </div>
            </div>

            {/* Hero visual card */}
            <div className="hero-visual">
              <div className="hero-card">
                <div className="card-window-bar">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                  <span className="window-title">swasthya.ai / predictor</span>
                </div>

                <div className="card-body">
                  <div className="card-header-row">
                    <div className="card-icon-wrapper">
                      <HospitalIcon />
                    </div>
                    <span className="card-badge">AI</span>
                  </div>

                  <h3>Swasthya+ Predictor</h3>
                  <p>Enter your symptoms for AI-powered diagnosis</p>

                  <div className="card-input">
                    <input type="text" placeholder="e.g., fever, cough, headache..." />
                    <button aria-label="Predict">
                      <ArrowRight />
                    </button>
                  </div>

                  <div className="card-tags">
                    <span className="tag">Transformer</span>
                    <span className="tag">BiLSTM</span>
                    <span className="tag">SHAP</span>
                    <span className="tag">Explainable</span>
                  </div>
                </div>
              </div>

              <div className="hero-float-badge hero-float-1">
                <span className="float-dot green"></span>
                Real-time inference
              </div>
              <div className="hero-float-badge hero-float-2">
                <span className="float-dot blue"></span>
                Explainable AI
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============= FEATURES ============= */}
      <section
        ref={featuresRef}
        className={`features-section ${featuresVisible ? 'visible' : ''}`}
      >
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Why Choose Us</span>
            <h2>Powered by <span>Advanced AI</span> Technology</h2>
            <p>Combining state-of-the-art deep learning models for accurate and interpretable disease prediction</p>
          </div>

          <div className="features-grid">
            <div className="feature-card" style={{ transitionDelay: '0.05s' }}>
              <div className="feature-icon-wrapper">
                <DnaIcon />
              </div>
              <h3>Hybrid Deep Learning</h3>
              <p>Combines a Transformer encoder for contextual learning with a BiLSTM network for sequential dependencies.</p>
              <div className="feature-tag">Core Technology</div>
            </div>

            <div className="feature-card highlight" style={{ transitionDelay: '0.15s' }}>
              <div className="feature-icon-wrapper">
                <SearchIcon />
              </div>
              <h3>Explainable AI</h3>
              <p>SHAP-based interpretability ensures transparent predictions that healthcare professionals can trust.</p>
              <div className="feature-tag">Transparency</div>
            </div>

            <div className="feature-card" style={{ transitionDelay: '0.25s' }}>
              <div className="feature-icon-wrapper">
                <BoltIcon />
              </div>
              <h3>Real-Time Predictions</h3>
              <p>Web-based platform with instant healthcare insights and rapid, low-latency inference.</p>
              <div className="feature-tag">Speed</div>
            </div>

            <div className="feature-card" style={{ transitionDelay: '0.35s' }}>
              <div className="feature-icon-wrapper">
                <ChartIcon />
              </div>
              <h3>Patient Personalization</h3>
              <p>Integrates demographic data and medical history for tailored, context-aware diagnosis.</p>
              <div className="feature-tag">Personalized</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============= TECHNOLOGY ============= */}
      <section className="tech-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Technology Stack</span>
            <h2>Built with <span>Cutting-Edge</span> Technologies</h2>
          </div>

          <div className="tech-grid">
            <div className="tech-item">
              <span className="tech-name">React.js</span>
              <span className="tech-role">Frontend</span>
            </div>
            <div className="tech-item">
              <span className="tech-name">Flask</span>
              <span className="tech-role">Backend</span>
            </div>
            <div className="tech-item">
              <span className="tech-name">MongoDB</span>
              <span className="tech-role">Database</span>
            </div>
            <div className="tech-item">
              <span className="tech-name">MySQL</span>
              <span className="tech-role">Database</span>
            </div>
            <div className="tech-item">
              <span className="tech-name">TensorFlow</span>
              <span className="tech-role">ML Framework</span>
            </div>
            <div className="tech-item">
              <span className="tech-name">Cloud</span>
              <span className="tech-role">Deployment</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============= CTA ============= */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-content">
              <h2>Ready to Experience <span>Smart Healthcare</span>?</h2>
              <p>Get started with Swasthya+ and revolutionize your healthcare journey.</p>
              <div className="cta-buttons">
                <Link to="/contact" className="btn btn-primary btn-lg">
                  Contact Us
                  <ArrowRight />
                </Link>
                <a href="#" className="btn btn-outline-light">
                  Learn More
                </a>
              </div>
            </div>
            <div className="cta-ornament">
              <div className="ornament-circle"></div>
              <div className="ornament-circle"></div>
              <div className="ornament-circle"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;