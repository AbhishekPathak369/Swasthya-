import React, { useState } from 'react';
import './FAQ.css';

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
        <div className="faq-header">
          <h1>Frequently Asked <span>Questions</span></h1>
          <p>Find answers to common questions about Swasthya+</p>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`faq-item ${openIndex === index ? 'active' : ''}`}
            >
              <div className="faq-question" onClick={() => toggleFAQ(index)}>
                <span className="faq-number">{String(index + 1).padStart(2, '0')}</span>
                <h3>{faq.question}</h3>
                <span className="faq-toggle">{openIndex === index ? '−' : '+'}</span>
              </div>
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="faq-contact">
          <p>Still have questions? <a href="/contact">Contact our team</a></p>
        </div>
      </div>
    </div>
  );
};

export default FAQ;