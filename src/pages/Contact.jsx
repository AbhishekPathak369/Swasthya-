import React, { useState } from 'react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="contact page-content">
      <div className="container">
        <div className="contact-header">
          <h1>Get in <span>Touch</span></h1>
          <p>Have questions about Swasthya+? Reach out to our team</p>
        </div>

        <div className="contact-grid">
          <div className="contact-info">
            <h2>Contact Information</h2>
            <div className="info-item">
              <span className="info-icon">📧</span>
              <div>
                <strong>Email</strong>
                <p>agrimg8@gmail.com</p>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">📍</span>
              <div>
                <strong>Location</strong>
                <p>ABES Engineering College, Ghaziabad, UP, India</p>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">📱</span>
              <div>
                <strong>Phone</strong>
                <p>+91-XXXXXXXXXX</p>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">🔬</span>
              <div>
                <strong>Department</strong>
                <p>Information Technology</p>
              </div>
            </div>

            <div className="contact-social">
              <h3>Follow Us</h3>
              <div className="social-links">
                <a href="#" aria-label="Twitter">🐦</a>
                <a href="#" aria-label="LinkedIn">💼</a>
                <a href="#" aria-label="GitHub">🐙</a>
                <a href="#" aria-label="YouTube">▶️</a>
              </div>
            </div>
          </div>

          <div className="contact-form-wrapper">
            <h2>Send a Message</h2>
            {submitted ? (
              <div className="success-message">
                ✅ Thank you! Your message has been sent successfully.
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What is this about?"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Write your message here..."
                    required
                  />
                </div>
                <button type="submit" className="btn-submit">
                  Send Message →
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;