import React from 'react';
import './About.css';

/* ==========================================================
   Professional SVG Icons
   ========================================================== */
const TargetIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const BrainIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 01-4.96.44 2.5 2.5 0 01-2.96-3.08 3 3 0 01-.34-5.58 2.5 2.5 0 011.32-4.24 2.5 2.5 0 011.98-3A2.5 2.5 0 019.5 2z" />
    <path d="M14.5 2A2.5 2.5 0 0012 4.5v15a2.5 2.5 0 004.96.44 2.5 2.5 0 002.96-3.08 3 3 0 00.34-5.58 2.5 2.5 0 00-1.32-4.24 2.5 2.5 0 00-1.98-3A2.5 2.5 0 0014.5 2z" />
  </svg>
);

const ChartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const GlobeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
  </svg>
);

const AwardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
);

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const About = () => {
  return (
    <div className="about page-content">
      <div className="container">
        {/* ===== Header ===== */}
        <div className="about-header">
          <span className="about-badge">About the Project</span>
          <h1>About <span>Swasthya+</span></h1>
          <p>Intelligent Disease Prediction Using Hybrid Deep Learning and Explainable AI</p>
        </div>

        {/* ===== Mission / Tech / Explainability / Scale ===== */}
        <div className="about-grid">
          <div className="about-card">
            <div className="about-icon">
              <TargetIcon />
            </div>
            <h3>Our Mission</h3>
            <p>
              To revolutionize healthcare by providing accessible, accurate, and interpretable
              AI-powered disease prediction tools that assist medical professionals and empower
              patients with early diagnosis.
            </p>
          </div>

          <div className="about-card">
            <div className="about-icon">
              <BrainIcon />
            </div>
            <h3>Technology</h3>
            <p>
              Swasthya+ combines a self-lightweight Transformer encoder for contextual learning,
              BiLSTM network for sequential dependencies, and attention mechanisms for feature
              prioritization.
            </p>
          </div>

          <div className="about-card">
            <div className="about-icon">
              <ChartIcon />
            </div>
            <h3>Explainability</h3>
            <p>
              SHAP-based interpretability ensures transparent predictions, helping healthcare
              professionals understand the reasoning behind each diagnosis for building trust
              and confidence.
            </p>
          </div>

          <div className="about-card">
            <div className="about-icon">
              <GlobeIcon />
            </div>
            <h3>Scalability</h3>
            <p>
              Built with a three-tier architecture using React.js, Flask/Node.js, and MongoDB/MySQL,
              enabling real-time predictions and seamless healthcare management.
            </p>
          </div>
        </div>

        {/* ===== Team ===== */}
        <div className="about-team">
          <div className="about-section-title">
            <div className="section-title-icon"><UsersIcon /></div>
            <h2>Project Team</h2>
          </div>

          <div className="team-grid">
            <div className="team-member">
              <div className="member-avatar">AG</div>
              <h4>Agrim Gupta</h4>
              <p>Lead Developer</p>
            </div>
            <div className="team-member">
              <div className="member-avatar">AM</div>
              <h4>Anurag Mishra</h4>
              <p>ML Engineer</p>
            </div>
            <div className="team-member">
              <div className="member-avatar">AP</div>
              <h4>Abhishek Pathak</h4>
              <p>Frontend Developer</p>
            </div>
            <div className="team-member">
              <div className="member-avatar">AS</div>
              <h4>Anany Sahu</h4>
              <p>Backend Developer</p>
            </div>
          </div>

          <div className="team-guide">
            <p><strong>Project Guide:</strong> Mr. Bharat Bhardwaj</p>
            <p>Department of Computer Science &amp; Engineering – Data Science</p>
            <p>ABES Engineering College, Ghaziabad</p>
          </div>
        </div>

        {/* ===== Achievements ===== */}
        <div className="about-achievements">
          <div className="about-section-title">
            <div className="section-title-icon"><AwardIcon /></div>
            <h2>Key Achievements</h2>
          </div>

          <div className="achievement-grid">
            <div className="achievement">
              <span className="achievement-number">97.8%</span>
              <span className="achievement-label">Test Accuracy</span>
            </div>
            <div className="achievement">
              <span className="achievement-number">0.010</span>
              <span className="achievement-label">CV Standard Deviation</span>
            </div>
            <div className="achievement">
              <span className="achievement-number">0.97</span>
              <span className="achievement-label">F1-Score</span>
            </div>
            <div className="achievement">
              <span className="achievement-number">120ms</span>
              <span className="achievement-label">Inference Time</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;