import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about page-content">
      <div className="container">
        <div className="about-header">
          <h1>About <span>Swasthya+</span></h1>
          <p>Intelligent Disease Prediction Using Hybrid Deep Learning and Explainable AI</p>
        </div>

        <div className="about-grid">
          <div className="about-card">
            <div className="about-icon">🎯</div>
            <h3>Our Mission</h3>
            <p>
              To revolutionize healthcare by providing accessible, accurate, and interpretable
              AI-powered disease prediction tools that assist medical professionals and empower
              patients with early diagnosis.
            </p>
          </div>

          <div className="about-card">
            <div className="about-icon">🧠</div>
            <h3>Technology</h3>
            <p>
              Swasthya+ combines a self-lightweight Transformer encoder for contextual learning,
              BiLSTM network for sequential dependencies, and attention mechanisms for feature
              prioritization.
            </p>
          </div>

          <div className="about-card">
            <div className="about-icon">📊</div>
            <h3>Explainability</h3>
            <p>
              SHAP-based interpretability ensures transparent predictions, helping healthcare
              professionals understand the reasoning behind each diagnosis for building trust
              and confidence.
            </p>
          </div>

          <div className="about-card">
            <div className="about-icon">🌐</div>
            <h3>Scalability</h3>
            <p>
              Built with a three-tier architecture using React.js, Flask/Node.js, and MongoDB/MySQL,
              enabling real-time predictions and seamless healthcare management.
            </p>
          </div>
        </div>

        <div className="about-team">
          <h2>Project Team</h2>
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
            <p>Department of Computer Science & Engineering - Data Science</p>
            <p>ABES Engineering College, Ghaziabad</p>
          </div>
        </div>

        <div className="about-achievements">
          <h2>Key Achievements</h2>
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