import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import './Signup.css';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    role: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  
const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  // Frontend validation
  if (!formData.name.trim()) {
    return setError('Please enter your full name');
  }

  if (!formData.email.trim() ||
      !/\S+@\S+\.\S+/.test(formData.email)) {
    return setError('Please enter a valid email address');
  }

  if (!/^[6-9]\d{9}$/.test(formData.mobile.trim())) {
    return setError('Please enter a valid 10-digit mobile number');
  }

  if (!formData.role) {
    return setError('Please select your role');
  }

  if (
    formData.password.length < 12 ||
    new TextEncoder().encode(formData.password).length > 72
  ) {
    return setError(
      'Password must be at least 12 characters and at most 72 UTF-8 bytes'
    );
  }

  setLoading(true);

  try {
    // Call our actual Express backend
    const data = await registerUser({
      name: formData.name.trim(),
      email: formData.email.trim(),
      mobile: formData.mobile.trim(),
      role: formData.role.toLowerCase(),
      password: formData.password
    });

    // Temporarily persist the response using the
    // existing frontend session convention.
    // We will improve session storage before production.
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    // Redirect after successful registration
    navigate('/profile');

  } catch (err) {
    const message =
      err.response?.data?.message ||
      'Registration failed. Please try again.';

    setError(message);

  } finally {
    setLoading(false);
  }
};

  return (
    <div className="auth-page signup-page">
      <div className="auth-container signup-container">
        {/* Left Visual */}
        <div className="auth-visual signup-visual">
          <div className="visual-content">
            <div className="visual-logo">
              <img src="/logo2.png" alt="Swasthya+" className="visual-logo-img" />
              <span>Swasthya<span className="plus">+</span></span>
            </div>
            <h2>Join Swasthya+</h2>
            <p>Create your account and start your journey towards smarter, AI-powered healthcare.</p>
            <div className="visual-features">
              <div className="visual-feature">
                <span className="vf-icon">✨</span>
                <span>Free Forever</span>
              </div>
              <div className="visual-feature">
                <span className="vf-icon">🛡️</span>
                <span>Your Data is Secure</span>
              </div>
              <div className="visual-feature">
                <span className="vf-icon">🎯</span>
                <span>Personalized Predictions</span>
              </div>
            </div>
          </div>
          <div className="visual-ornament">
            <div className="ornament o1"></div>
            <div className="ornament o2"></div>
          </div>
        </div>

        {/* Right Form */}
        <div className="auth-form-section">
          <div className="auth-form-wrapper">
            <div className="auth-header">
              <h1>Create Account</h1>
              <p>Already have an account? <Link to="/login">Sign in</Link></p>
            </div>

            {error && (
              <div className="auth-error">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              {/* Name */}
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
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
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <span className="input-icon">📧</span>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              {/* Mobile */}
              <div className="form-group">
                <label htmlFor="mobile">Mobile Number</label>
                <div className="input-wrapper">
                  <span className="input-icon">📱</span>
                  <input
                    type="tel"
                    id="mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
              </div>

              {/* Role */}
              <div className="form-group">
                <label>I am a</label>
                <div className="role-selector">
                  <label className={`role-option ${formData.role === 'Patient' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="role"
                      value="Patient"
                      checked={formData.role === 'Patient'}
                      onChange={handleChange}
                    />
                    <span className="role-emoji">👤</span>
                    <span className="role-name">Patient</span>
                  </label>
                  <label className={`role-option ${formData.role === 'Doctor' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="role"
                      value="Doctor"
                      checked={formData.role === 'Doctor'}
                      onChange={handleChange}
                    />
                    <span className="role-emoji">👨‍⚕️</span>
                    <span className="role-name">Doctor</span>
                  </label>
                </div>
              </div>

              {/* Password */}
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 12 characters"
                    minLength={12}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-auth" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span> Creating...
                  </>
                ) : (
                  <>Create Account →</>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;