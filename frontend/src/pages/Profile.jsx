import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../services/api';
import './Profile.css';

/* ==========================================================
   Professional SVG Icons
   ========================================================== */
const UserIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ChartIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const HospitalIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
    <path d="M3 21h18" />
    <path d="M5 21V7l7-4 7 4v14" />
    <path d="M12 9v6" />
    <path d="M9 12h6" />
  </svg>
);

const HeartIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);

const SettingsIcon = ({ size = 18 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

const FileTextIcon = ({ size = 18 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const MailIcon = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M22 6l-10 7L2 6" />
  </svg>
);

const PhoneIcon = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
  </svg>
);

const CheckIcon = ({ size = 12 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const EditIcon = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const LogoutIcon = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const Profile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch the logged-in user's profile from the backend
  useEffect(() => {
    let active = true;

    const fetchProfile = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login', { replace: true });
        return;
      }

      try {
        const data = await getCurrentUser(token);

        if (!active) return;

        if (!data?.user) {
          setError('Unable to load your profile. Please log in again.');
          return;
        }

        setUser(data.user);

        localStorage.setItem(
          'user',
          JSON.stringify(data.user)
        );
      } catch (err) {
        if (!active) return;

        console.error('Profile loading error:', err);

        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login', { replace: true });
        } else {
          setError(
            err.response?.data?.message ||
            'Unable to load profile. Please check your connection and try again.'
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      active = false;
    };
  }, [navigate]);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/', { replace: true });
  };

  // Get initials when the user has no avatar
  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return 'U';

    return name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Loading state
  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner-large"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="profile-loading">
        <p role="alert">{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
        <button onClick={() => navigate('/login')}>Go to Login</button>
      </div>
    );
  }

  // Safety check: never render profile fields for a null user
  if (!user) {
    return (
      <div className="profile-loading">
        <p>Profile information is unavailable.</p>
        <button onClick={() => navigate('/login')}>Go to Login</button>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="container">

        {/* ===== Page Heading ===== */}
        <div className="profile-page-header">
          <div>
            <span className="profile-page-badge">Account</span>
            <h1 className="profile-page-title">My Profile</h1>
            <p className="profile-page-subtitle">
              Manage your personal information, activity, and preferences.
            </p>
          </div>
          <div className="profile-page-actions">
            <button className="btn-edit-profile">
              <EditIcon /> Edit Profile
            </button>
            <button className="btn-logout" onClick={handleLogout}>
              <LogoutIcon /> Logout
            </button>
          </div>
        </div>

        {/* ===== Main Layout: Sidebar + Content ===== */}
        <div className="profile-layout">

          {/* ---------- Sidebar ---------- */}
          <aside className="profile-sidebar">
            {/* User identity card */}
            <div className="profile-identity-card">
              <div className="identity-cover"></div>
              <div className="identity-avatar-wrap">
                <div className="identity-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt="Profile" />
                  ) : (
                    <span>{getInitials(user.name)}</span>
                  )}
                </div>
                <div className="identity-verified"><CheckIcon /></div>
              </div>
              <div className="identity-body">
                <h2>{user.name}</h2>
                <span className="identity-role">{user.role}</span>
              </div>
              <div className="identity-meta">
                <div className="identity-meta-item">
                  <MailIcon />
                  <span>{user.email}</span>
                </div>
                <div className="identity-meta-item">
                  <PhoneIcon />
                  <span>{user.mobile || 'Not provided'}</span>
                </div>
              </div>
            </div>

            {/* Sidebar navigation */}
            <nav className="profile-side-nav">
              <button
                className={`side-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <UserIcon size={16} /> Overview
              </button>
              <button
                className={`side-nav-item ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                <FileTextIcon size={16} /> Prediction History
              </button>
              <button
                className={`side-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <SettingsIcon size={16} /> Settings
              </button>
            </nav>
          </aside>

          {/* ---------- Main content ---------- */}
          <main className="profile-main">

            {/* --- Overview Tab --- */}
            {activeTab === 'overview' && (
              <div className="profile-content">

                {/* Personal information section */}
                <section className="section-card">
                  <header className="section-header">
                    <div className="section-icon"><UserIcon size={16} /></div>
                    <div>
                      <h2>Personal Information</h2>
                      <p>Your basic account details</p>
                    </div>
                  </header>

                  <div className="section-body">
                    <div className="field-grid">
                      <div className="field">
                        <span className="field-label">Full Name</span>
                        <span className="field-value">{user.name}</span>
                      </div>
                      <div className="field">
                        <span className="field-label">Email Address</span>
                        <span className="field-value">{user.email}</span>
                      </div>
                      <div className="field">
                        <span className="field-label">Mobile Number</span>
                        <span className="field-value">{user.mobile || 'Not provided'}</span>
                      </div>
                      <div className="field">
                        <span className="field-label">Account Role</span>
                        <span className="field-value">
                          <span className="role-chip">{user.role}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Activity summary */}
                <section className="section-card">
                  <header className="section-header">
                    <div className="section-icon"><ChartIcon size={16} /></div>
                    <div>
                      <h2>Activity Summary</h2>
                      <p>Your usage overview</p>
                    </div>
                  </header>

                  <div className="section-body">
                    <div className="activity-grid">
                      <div className="activity-tile">
                        <div className="activity-tile-icon blue">
                          <ChartIcon size={18} />
                        </div>
                        <span className="activity-tile-num">12</span>
                        <span className="activity-tile-lbl">Predictions</span>
                      </div>

                      <div className="activity-tile">
                        <div className="activity-tile-icon violet">
                          <FileTextIcon size={18} />
                        </div>
                        <span className="activity-tile-num">3</span>
                        <span className="activity-tile-lbl">Reports</span>
                      </div>

                      <div className="activity-tile">
                        <div className="activity-tile-icon green">
                          <HospitalIcon size={18} />
                        </div>
                        <span className="activity-tile-num">7</span>
                        <span className="activity-tile-lbl">Appointments</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Recent predictions */}
                <section className="section-card">
                  <header className="section-header">
                    <div className="section-icon"><HospitalIcon size={16} /></div>
                    <div>
                      <h2>Recent Predictions</h2>
                      <p>Your latest AI-based health assessments</p>
                    </div>
                  </header>

                  <div className="section-body">
                    {/* Demo data — replace with backend history later */}
                    <div className="prediction-list">
                      <div className="prediction-row">
                        <div className="prediction-row-icon">
                          <HospitalIcon size={18} />
                        </div>
                        <div className="prediction-row-info">
                          <strong>General Checkup</strong>
                          <span>Fever, Cough • 2 days ago</span>
                        </div>
                        <span className="risk-chip low">Low Risk</span>
                      </div>

                      <div className="prediction-row">
                        <div className="prediction-row-icon heart">
                          <HeartIcon size={18} />
                        </div>
                        <div className="prediction-row-info">
                          <strong>Cardiac Assessment</strong>
                          <span>Chest pain, Fatigue • 1 week ago</span>
                        </div>
                        <span className="risk-chip medium">Medium Risk</span>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* --- History Tab --- */}
            {activeTab === 'history' && (
              <div className="profile-content">
                <section className="section-card">
                  <header className="section-header">
                    <div className="section-icon"><FileTextIcon size={16} /></div>
                    <div>
                      <h2>Prediction History</h2>
                      <p>All your past AI predictions</p>
                    </div>
                  </header>
                  <div className="section-body">
                    <p className="empty-state">
                      Your prediction history will appear here once you start using the predictor.
                    </p>
                  </div>
                </section>
              </div>
            )}

            {/* --- Settings Tab --- */}
            {activeTab === 'settings' && (
              <div className="profile-content">
                <section className="section-card">
                  <header className="section-header">
                    <div className="section-icon"><SettingsIcon size={16} /></div>
                    <div>
                      <h2>Account Settings</h2>
                      <p>Manage your preferences</p>
                    </div>
                  </header>
                  <div className="section-body">
                    <div className="settings-list">
                      <div className="setting-row">
                        <div>
                          <strong>Email Notifications</strong>
                          <p>Receive updates about your health predictions</p>
                        </div>
                        <label className="toggle-switch">
                          <input type="checkbox" defaultChecked />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>

                      <div className="setting-row">
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
                </section>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;