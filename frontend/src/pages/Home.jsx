import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [typedText, setTypedText] = useState('');
  const [showFeatures, setShowFeatures] = useState(false);
  const fullText = 'Intelligent Disease Prediction';

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
        setTimeout(() => setShowFeatures(true), 500);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              <div className="hero-badge">
                <span className="pulse-dot"></span>
                AI-Powered Healthcare
              </div>
              <h1 className="hero-title">
                <span className="logo-main">Swasthya</span>
                <span className="logo-plus">+</span>
                <br />
                <span className="typing-text">{typedText}</span>
                <span className="cursor-blink">|</span>
              </h1>
              <p className="hero-desc">
                Leveraging Hybrid Deep Learning and Explainable AI to provide accurate,
                interpretable, and personalized disease predictions for early diagnosis
                and better healthcare outcomes.
              </p>
              <div className="hero-buttons">
                <Link to="/contact" className="btn btn-primary">
                  <span>Get Started</span>
                  <svg className="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
                <a href="#" className="btn btn-outline">
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
                    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
                  </svg>
                  Research Paper
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
            <div className="hero-visual">
              <div className="hero-card">
                <div className="card-glow"></div>
                <div className="card-header-dots">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                </div>
                <div className="card-body">
                  <div className="card-icon-wrapper">
                    <span className="card-main-icon">🏥</span>
                    <span className="card-badge">AI</span>
                  </div>
                  <h3>Swasthya+ Predictor</h3>
                  <p>Enter your symptoms for AI-powered diagnosis</p>
                  <div className="card-input">
                    <input type="text" placeholder="e.g., fever, cough, headache..." />
                    <button>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
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
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`features-section ${showFeatures ? 'visible' : ''}`}>
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Why Choose Us</span>
            <h2>Powered by <span>Advanced AI</span> Technology</h2>
            <p>Combining state-of-the-art deep learning models for accurate and interpretable disease prediction</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">🧬</span>
              </div>
              <h3>Hybrid Deep Learning</h3>
              <p>Combines Transformer encoder for contextual learning with BiLSTM network for sequential dependencies</p>
              <div className="feature-tag">Core Technology</div>
            </div>
            <div className="feature-card highlight">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">🔍</span>
              </div>
              <h3>Explainable AI</h3>
              <p>SHAP-based interpretability ensures transparent predictions for healthcare professionals</p>
              <div className="feature-tag">Transparency</div>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">⚡</span>
              </div>
              <h3>Real-Time Predictions</h3>
              <p>Web-based platform with instant healthcare insights and rapid inference time</p>
              <div className="feature-tag">Speed</div>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">📊</span>
              </div>
              <h3>Patient Personalization</h3>
              <p>Integrates demographic data and medical history for tailored diagnosis</p>
              <div className="feature-tag">Personalized</div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section className="tech-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Technology Stack</span>
            <h2>Built with <span>Cutting-Edge</span> Technologies</h2>
          </div>
          <div className="tech-grid">
            <div className="tech-item">
              <div className="tech-icon-wrapper">
                <span className="tech-icon">⚛️</span>
              </div>
              <span className="tech-name">React.js</span>
              <span className="tech-role">Frontend</span>
            </div>
            <div className="tech-item">
              <div className="tech-icon-wrapper">
                <span className="tech-icon">🐍</span>
              </div>
              <span className="tech-name">Flask</span>
              <span className="tech-role">Backend</span>
            </div>
            <div className="tech-item">
              <div className="tech-icon-wrapper">
                <span className="tech-icon">🍃</span>
              </div>
              <span className="tech-name">MongoDB</span>
              <span className="tech-role">Database</span>
            </div>
            <div className="tech-item">
              <div className="tech-icon-wrapper">
                <span className="tech-icon">🐘</span>
              </div>
              <span className="tech-name">MySQL</span>
              <span className="tech-role">Database</span>
            </div>
            <div className="tech-item">
              <div className="tech-icon-wrapper">
                <span className="tech-icon">🤖</span>
              </div>
              <span className="tech-name">TensorFlow</span>
              <span className="tech-role">ML Framework</span>
            </div>
            <div className="tech-item">
              <div className="tech-icon-wrapper">
                <span className="tech-icon">☁️</span>
              </div>
              <span className="tech-name">Cloud</span>
              <span className="tech-role">Deployment</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-content">
              <h2>Ready to Experience <span>Smart Healthcare</span>?</h2>
              <p>Get started with Swasthya+ and revolutionize your healthcare journey</p>
              <div className="cta-buttons">
                <Link to="/contact" className="btn btn-primary btn-lg">
                  Contact Us
                  <svg className="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
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