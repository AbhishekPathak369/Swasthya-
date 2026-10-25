import React, { useState } from 'react';
import './FAQ.css';

/* ==========================================================
   SVG Icons
   ========================================================== */
const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const HelpIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'What is Swasthya+?',
      answer: 'Swasthya+ is an AI-powered disease prediction system that uses Hybrid Deep Learning (Transformer + BiLSTM) and Explainable AI (SHAP) to provide accurate, interpretable, and personalized disease predictions based on patient symptoms and demographic data.'
    },
    {
      question: 'How accurate is the prediction system?',
      answer: 'Swasthya+ achieves a test accuracy of 97.8% with a cross-validation standard deviation of 0.010, ensuring high predictive power and stability across different data splits.'
    },
    {
      question: 'What makes Swasthya+ different from other disease prediction systems?',
      answer: 'Unlike traditional systems, Swasthya+ combines contextual learning (Transformer), sequential modeling (BiLSTM), attention mechanisms, and SHAP-based explainability. It also incorporates demographic data and medical history for personalized predictions.'
    },
    {
      question: 'How does the explainability feature work?',
      answer: 'Swasthya+ uses SHAP (SHapley Additive Explanations) to compute feature importance scores, helping healthcare professionals understand which symptoms and factors most influenced the prediction, building trust and transparency.'
    },
    {
      question: 'What technologies are used in Swasthya+?',
      answer: 'The system uses a three-tier architecture: React.js frontend, Flask/Node.js backend, and MongoDB/MySQL database. The ML model uses TensorFlow with Transformer, BiLSTM, and attention layers.'
    },
    {
      question: 'Is Swasthya+ available for public use?',
      answer: 'Currently, Swasthya+ is in the development and testing phase. The team is working on deploying it as a web-based application for healthcare professionals and patients to use.'
    },
    {
      question: 'How can I contribute to this project?',
      answer: 'You can contribute by providing feedback, suggesting features, or collaborating on the research. Contact the team at agrimg8@gmail.com for more information.'
    },
    {
      question: 'What are the future plans for Swasthya+?',
      answer: 'Future plans include integrating multimodal data (medical images, clinical notes), IoT-based wearables for real-time monitoring, federated learning for privacy-preserving updates, and telemedicine connectivity.'
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq page-content">
      <div className="container">
        {/* ===== Header ===== */}
        <div className="faq-header">
          <span className="faq-badge">Support &amp; Help Center</span>
          <h1>Frequently Asked <span>Questions</span></h1>
          <p>Everything you need to know about Swasthya+ — from accuracy to contribution.</p>
        </div>

        {/* ===== FAQ List ===== */}
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`faq-item ${openIndex === index ? 'active' : ''}`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <button
                type="button"
                className="faq-question"
                onClick={() => toggleFAQ(index)}
                aria-expanded={openIndex === index}
              >
                <span className="faq-number">{String(index + 1).padStart(2, '0')}</span>
                <h3>{faq.question}</h3>
                <span className="faq-toggle">
                  <ChevronIcon />
                </span>
              </button>

              <div className="faq-answer">
                <div className="faq-answer-inner">
                  <p>{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ===== Contact CTA ===== */}
        <div className="faq-contact-card">
          <div className="faq-contact-icon">
            <HelpIcon />
          </div>
          <div className="faq-contact-text">
            <h4>Still have questions?</h4>
            <p>Can't find the answer you're looking for? Our team is happy to help.</p>
          </div>
          <a href="/contact" className="faq-contact-btn">
            Contact Us <ArrowRightIcon />
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQ;