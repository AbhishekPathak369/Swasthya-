import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import './Signup.css';

/* ---------- SVG Icons (only ones still used) ---------- */
const EyeIcon = ({ open }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const SparkIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.9 5.8 5.8 1.9-5.8 1.9L12 18.4l-1.9-5.8L4.3 10.7l5.8-1.9L12 3z" />
  </svg>
);

const TargetIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

/* ---------- Component ---------- */
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

    if (!formData.name.trim()) {
      return setError('Please enter your full name');
    }

    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
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
      const data = await registerUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
        role: formData.role.toLowerCase(),
        password: formData.password
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

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
            </div>
            <h2>Create your account</h2>
            <p>Join Swasthya+ and start your journey towards smarter, AI-powered healthcare.</p>
            <div className="visual-features">
              <div className="visual-feature">
                <span className="vf-icon"><SparkIcon /></span>
                <span>Free forever</span>
              </div>
              <div className="visual-feature">
                <span className="vf-icon"><ShieldIcon /></span>
                <span>Your data is secure</span>
              </div>
              <div className="visual-feature">
                <span className="vf-icon"><TargetIcon /></span>
                <span>Personalized predictions</span>
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
              <h1>Create account</h1>
              <p>Already have an account? <Link to="/login">Sign in</Link></p>
            </div>

            {error && (
              <div className="auth-error">
                <AlertIcon />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              {/* Name */}
              <div className="form-group">
                <label htmlFor="name">Full name</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="email">Email address</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@company.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Mobile */}
              <div className="form-group">
                <label htmlFor="mobile">Mobile number</label>
                <div className="input-wrapper">
                  <input
                    type="tel"
                    id="mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    autoComplete="tel"
                    required
                  />
                </div>
              </div>

              {/* Role */}
              <div className="form-group">
                <label>Account type</label>
                <div className="role-selector">
                  <label className={`role-option ${formData.role === 'Patient' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="role"
                      value="Patient"
                      checked={formData.role === 'Patient'}
                      onChange={handleChange}
                    />
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
                    <span className="role-name">Doctor</span>
                  </label>
                </div>
              </div>

              {/* Password */}
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 12 characters"
                    autoComplete="new-password"
                    minLength={12}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-auth" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span> Creating account...
                  </>
                ) : (
                  <>Create account</>
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