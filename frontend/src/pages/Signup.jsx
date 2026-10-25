import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

    if (!formData.name.trim()) return setError('Please enter your full name');
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email))
      return setError('Please enter a valid email address');
    if (!formData.mobile.trim() || formData.mobile.length < 10)
      return setError('Please enter a valid mobile number');
    if (!formData.role) return setError('Please select your role');
    if (formData.password.length < 6) return setError('Password must be at least 6 characters');

    setLoading(true);

    // ============================================================
    // BACKEND CONNECTION AREA - SIGNUP
    // ============================================================
    // TODO: Replace mock logic with real API call
    // try {
    //   const response = await fetch('http://localhost:5000/api/auth/signup', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       name: formData.name,
    //       email: formData.email,
    //       mobile: formData.mobile,
    //       role: formData.role,
    //       password: formData.password
    //     })
    //   });
    //   const data = await response.json();
    //   if (data.success) {
    //     localStorage.setItem('token', data.token);
    //     localStorage.setItem('user', JSON.stringify(data.user));
    //     navigate('/profile');
    //   } else {
    //     setError(data.message || 'Signup failed');
    //   }
    // } catch (err) {
    //   setError('Server error. Please try again.');
    // } finally {
    //   setLoading(false);
    // }
    // ============================================================

    // TEMPORARY MOCK LOGIC (Remove when backend is ready)
    setTimeout(() => {
      const mockUser = {
        id: Date.now(),
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        role: formData.role,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=2563eb&color=fff&size=128`
      };
      localStorage.setItem('token', 'mock-token-123');
      localStorage.setItem('user', JSON.stringify(mockUser));
      navigate('/profile');
    }, 1000);
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
                    placeholder="Min 6 characters"
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