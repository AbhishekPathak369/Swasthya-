import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  
const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  // Validate inputs
  if (!formData.email.trim() || !formData.password) {
    return setError('Please fill in all fields');
  }

  setLoading(true);

  try {
    // Send credentials to Express backend
    const data = await loginUser({
      email: formData.email.trim(),
      password: formData.password
    });

    // Remove any previous mock session
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Save actual authentication response
    // Temporary development approach; we'll improve
    // token storage before production.
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    // Redirect to profile
    navigate('/profile');

  } catch (err) {
    const message =
      err.response?.data?.message ||
      (err.response
        ? 'Login failed. Please try again.'
        : 'Unable to connect to server. Please try again.');

    setError(message);

  } finally {
    setLoading(false);
  }
};


  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side - Visual */}
        <div className="auth-visual">
          <div className="visual-content">
            <div className="visual-logo">
              <img src="/logo2.png" alt="Swasthya+" className="visual-logo-img" />
              <span>Swasthya<span className="plus">+</span></span>
            </div>
            <h2>Welcome Back!</h2>
            <p>Sign in to access your personalized healthcare dashboard and AI-powered disease predictions.</p>
            <div className="visual-features">
              <div className="visual-feature">
                <span className="vf-icon">🔒</span>
                <span>Secure & Private</span>
              </div>
              <div className="visual-feature">
                <span className="vf-icon">⚡</span>
                <span>Real-time Predictions</span>
              </div>
              <div className="visual-feature">
                <span className="vf-icon">🧠</span>
                <span>AI-Powered Insights</span>
              </div>
            </div>
            <div className="visual-stats">
              <div className="v-stat">
                <span className="v-stat-num">97.8%</span>
                <span className="v-stat-label">Accuracy</span>
              </div>
              <div className="v-stat">
                <span className="v-stat-num">50K+</span>
                <span className="v-stat-label">Users</span>
              </div>
            </div>
          </div>
          <div className="visual-ornament">
            <div className="ornament o1"></div>
            <div className="ornament o2"></div>
            <div className="ornament o3"></div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="auth-form-section">
          <div className="auth-form-wrapper">
            <div className="auth-header">
              <h1>Sign In</h1>
              <p>Don't have an account? <Link to="/signup">Create one</Link></p>
            </div>

            {error && (
              <div className="auth-error">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
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
                    placeholder="Enter your password"
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

              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" /> Remember me
                </label>
                <a href="#" className="forgot-link">Forgot password?</a>
              </div>

              <button type="submit" className="btn-auth" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span> Signing in...
                  </>
                ) : (
                  <>Sign In →</>
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>or continue with</span>
            </div>

            <div className="social-auth">
              <button className="social-btn google">
                <span>🔵</span> Google
              </button>
              <button className="social-btn github">
                <span>⚫</span> GitHub
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;