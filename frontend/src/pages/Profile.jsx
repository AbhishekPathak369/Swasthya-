import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // ============================================================
    // BACKEND CONNECTION AREA - GET USER DATA
    // ============================================================
    // TODO: Fetch user data from backend using token
    // Example:
    // const token = localStorage.getItem('token');
    // if (!token) { navigate('/login'); return; }
    // try {
    //   const response = await fetch('http://localhost:5000/api/user/profile', {
    //     headers: { 'Authorization': `Bearer ${token}` }
    //   });
    //   const data = await response.json();
    //   setUser(data.user);
    // } catch (err) {
    //   navigate('/login');
    // }
    // ============================================================

    // TEMPORARY MOCK - Get user from localStorage
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!storedUser || !token) {
      navigate('/login');
      return;
    }

    setUser(JSON.parse(storedUser));
  }, [navigate]);

  const handleLogout = () => {
    // ============================================================
    // BACKEND CONNECTION AREA - LOGOUT
    // ============================================================
    // TODO: Call logout API if needed (e.g., invalidate token)
    // Example:
    // await fetch('http://localhost:5000/api/auth/logout', {
    //   method: 'POST',
    //   headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    // });
    // ============================================================

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user) {
    return (
      <div className="profile-loading">
        <div className="spinner-large"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="profile-page">
      <div className="container">
        {/* Profile Header Card */}
        <div className="profile-header-card">
          <div className="profile-header-bg"></div>
          <div className="profile-header-content">
            <div className="profile-avatar-section">
              <div className="profile-avatar-large">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  <span>{getInitials(user.name)}</span>
                )}
                <div className="avatar-badge">✓</div>
              </div>
              <div className="profile-info">
                <h1>{user.name}</h1>
                <p className="profile-role">
                  <span className="role-badge">{user.role}</span>
                </p>
                <p className="profile-email">📧 {user.email}</p>
              </div>
            </div>
            <div className="profile-actions">
              <button className="btn-edit-profile">✏️ Edit Profile</button>
              <button className="btn-logout" onClick={handleLogout}>
                🚪 Logout
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Prediction History
          </button>
          <button
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>

        {/* Tab Content */}
        <div className="profile-content">
          {activeTab === 'overview' && (
            <div className="tab-pane">
              <div className="overview-grid">
                <div className="info-card">
                  <h3>👤 Personal Information</h3>
                  <div className="info-list">
                    <div className="info-row">
                      <span className="info-label">Full Name</span>
                      <span className="info-value">{user.name}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Email</span>
                      <span className="info-value">{user.email}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Mobile</span>
                      <span className="info-value">{user.mobile || 'Not provided'}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Role</span>
                      <span className="info-value">{user.role}</span>
                    </div>
                  </div>
                </div>

                <div className="info-card">
                  <h3>📊 Activity Summary</h3>
                  <div className="stats-grid-mini">
                    <div className="mini-stat">
                      <span className="mini-stat-num">12</span>
                      <span className="mini-stat-label">Predictions</span>
                    </div>
                    <div className="mini-stat">
                      <span className="mini-stat-num">3</span>
                      <span className="mini-stat-label">Reports</span>
                    </div>
                    <div className="mini-stat">
                      <span className="mini-stat-num">7</span>
                      <span className="mini-stat-label">Appointments</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="info-card full-width">
                <h3>🏥 Recent Predictions</h3>
                {/* BACKEND CONNECTION AREA - Replace with actual prediction history */}
                <div className="predictions-list">
                  <div className="prediction-item">
                    <div className="prediction-icon">🩺</div>
                    <div className="prediction-info">
                      <strong>General Checkup</strong>
                      <span>Fever, Cough • 2 days ago</span>
                    </div>
                    <span className="prediction-result low">Low Risk</span>
                  </div>
                  <div className="prediction-item">
                    <div className="prediction-icon">❤️</div>
                    <div className="prediction-info">
                      <strong>Cardiac Assessment</strong>
                      <span>Chest pain, Fatigue • 1 week ago</span>
                    </div>
                    <span className="prediction-result medium">Medium Risk</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="tab-pane">
              <div className="info-card full-width">
                <h3>📋 Prediction History</h3>
                <p className="empty-state">
                  Your prediction history will appear here once you start using the predictor.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="tab-pane">
              <div className="info-card full-width">
                <h3>⚙️ Account Settings</h3>
                <div className="settings-list">
                  <div className="setting-item">
                    <div>
                      <strong>Email Notifications</strong>
                      <p>Receive updates about your health predictions</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <div>
                      <strong>Two-Factor Authentication</strong>
                      <p>Add an extra layer of security to your account</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;