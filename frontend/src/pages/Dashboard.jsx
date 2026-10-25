import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const [appointmentForm, setAppointmentForm] = useState({
    patientName: '',
    doctorName: '',
    fees: '',
    date: '',
    time: '',
    notes: ''
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  // ============================================================
  // BACKEND CONNECTION AREA - LOAD USER + DASHBOARD DATA
  // ============================================================
  // TODO: Fetch user from backend using token, then load
  // appointments & reports based on role.
  //
  // useEffect(() => {
  //   const token = localStorage.getItem('token');
  //   if (!token) { navigate('/login'); return; }
  //
  //   // 1. Get user profile
  //   fetch('http://localhost:5000/api/auth/me', {
  //     headers: { 'Authorization': `Bearer ${token}` }
  //   })
  //     .then(res => res.json())
  //     .then(data => {
  //       setUser(data.user);
  //
  //       // 2. Load appointments (role-aware endpoint)
  //       const endpoint = data.user.role === 'Doctor'
  //         ? '/api/appointments/doctor'
  //         : '/api/appointments/patient';
  //
  //       return fetch(`http://localhost:5000${endpoint}`, {
  //         headers: { 'Authorization': `Bearer ${token}` }
  //       });
  //     })
  //     .then(res => res.json())
  //     .then(data => setAppointments(data.appointments || []))
  //     .catch(() => navigate('/login'));
  // }, [navigate]);
  // ============================================================

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!storedUser || !token) {
      navigate('/login');
      return;
    }

    setUser(JSON.parse(storedUser));

    // TEMPORARY MOCK DATA (Remove when backend is ready)
    setAppointments([
      {
        id: 1,
        patientName: 'Rahul Sharma',
        doctorName: 'Dr. Anjali Verma',
        fees: 500,
        date: '2025-11-10',
        time: '10:30 AM',
        status: 'Completed'
      },
      {
        id: 2,
        patientName: 'Priya Singh',
        doctorName: 'Dr. Anjali Verma',
        fees: 700,
        date: '2025-11-12',
        time: '02:00 PM',
        status: 'Upcoming'
      },
      {
        id: 3,
        patientName: 'Amit Kumar',
        doctorName: 'Dr. Rajesh Mehta',
        fees: 400,
        date: '2025-11-15',
        time: '11:00 AM',
        status: 'Upcoming'
      }
    ]);

    setReports([
      { id: 1, name: 'Blood Test Report.pdf', size: '2.3 MB', date: '2025-11-05' },
      { id: 2, name: 'X-Ray Scan.pdf', size: '4.8 MB', date: '2025-11-08' }
    ]);
  }, [navigate]);

  // ============================================================
  // BACKEND CONNECTION AREA - ADD APPOINTMENT
  // ============================================================
  // TODO: Replace mock with real API call:
  //
  // const handleAddAppointment = async () => {
  //   const token = localStorage.getItem('token');
  //   const formData = new FormData();
  //   formData.append('patientName', appointmentForm.patientName);
  //   formData.append('doctorName', appointmentForm.doctorName);
  //   formData.append('fees', appointmentForm.fees);
  //   formData.append('date', appointmentForm.date);
  //   formData.append('time', appointmentForm.time);
  //   formData.append('notes', appointmentForm.notes);
  //   selectedFiles.forEach(f => formData.append('reports', f));
  //
  //   const res = await fetch('http://localhost:5000/api/appointments', {
  //     method: 'POST',
  //     headers: { 'Authorization': `Bearer ${token}` },
  //     body: formData
  //   });
  //   const data = await res.json();
  //   if (data.success) {
  //     setAppointments([data.appointment, ...appointments]);
  //     setShowAppointmentModal(false);
  //     resetForm();
  //   }
  // };
  // ============================================================

  const resetForm = () => {
    setAppointmentForm({
      patientName: '',
      doctorName: '',
      fees: '',
      date: '',
      time: '',
      notes: ''
    });
    setSelectedFiles([]);
    setUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAppointmentChange = (e) => {
    setAppointmentForm({ ...appointmentForm, [e.target.name]: e.target.value });
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const pdfs = files.filter(f => f.type === 'application/pdf');

    if (pdfs.length !== files.length) {
      setUploadError('Only PDF files are allowed');
    } else {
      setUploadError('');
    }

    setSelectedFiles(prev => [...prev, ...pdfs].slice(0, 5)); // max 5 files
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddAppointment = (e) => {
    e.preventDefault();
    setLoading(true);

    // TEMPORARY MOCK (replace with API call in BACKEND area above)
    setTimeout(() => {
      const newAppointment = {
        id: Date.now(),
        patientName: appointmentForm.patientName,
        doctorName: appointmentForm.doctorName,
        fees: Number(appointmentForm.fees),
        date: appointmentForm.date,
        time: appointmentForm.time,
        status: 'Upcoming'
      };

      setAppointments(prev => [newAppointment, ...prev]);

      if (selectedFiles.length > 0) {
        setReports(prev => [
          ...selectedFiles.map((f, i) => ({
            id: Date.now() + i,
            name: f.name,
            size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
            date: new Date().toISOString().split('T')[0]
          })),
          ...prev
        ]);
      }

      setLoading(false);
      setShowAppointmentModal(false);
      resetForm();
    }, 800);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user) return null;

  const isDoctor = user.role === 'Doctor';
  const getInitials = (name) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  // Stats depend on role
  const doctorStats = [
    { label: 'Total Appointments', value: appointments.length, icon: '📅', color: '#2563eb' },
    { label: 'Total Patients', value: new Set(appointments.map(a => a.patientName)).size, icon: '👥', color: '#7c3aed' },
    { label: 'Earnings', value: `₹${appointments.reduce((s, a) => s + a.fees, 0)}`, icon: '💰', color: '#22c55e' },
    { label: 'Upcoming', value: appointments.filter(a => a.status === 'Upcoming').length, icon: '⏰', color: '#f59e0b' }
  ];

  const patientStats = [
    { label: 'My Appointments', value: appointments.length, icon: '📅', color: '#2563eb' },
    { label: 'Doctors Consulted', value: new Set(appointments.map(a => a.doctorName)).size, icon: '👨‍⚕️', color: '#7c3aed' },
    { label: 'Total Spent', value: `₹${appointments.reduce((s, a) => s + a.fees, 0)}`, icon: '💳', color: '#22c55e' },
    { label: 'Reports', value: reports.length, icon: '📄', color: '#f59e0b' }
  ];

  const stats = isDoctor ? doctorStats : patientStats;

  return (
    <div className="dashboard-page">
      <div className="container">
        {/* ===== Dashboard Header ===== */}
        <div className={`dash-hero ${isDoctor ? 'doctor-hero' : 'patient-hero'}`}>
          <div className="dash-hero-content">
            <div className="dash-avatar">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <span>{getInitials(user.name)}</span>
              )}
            </div>
            <div className="dash-hero-text">
              <span className="dash-role-badge">
                {isDoctor ? '👨‍⚕️ Doctor' : '👤 Patient'}
              </span>
              <h1>Welcome back, {user.name.split(' ')[0]}!</h1>
              <p>
                {isDoctor
                  ? 'Manage your patients, appointments, and reports — all in one place.'
                  : 'Track your appointments, reports, and health journey here.'}
              </p>
            </div>
          </div>
          <div className="dash-hero-actions">
            <button
              className="btn-add-appointment"
              onClick={() => setShowAppointmentModal(true)}
            >
              ➕ New Appointment
            </button>
            <button className="btn-logout-dash" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
          <div className="dash-hero-ornament"></div>
        </div>

        {/* ===== Stats Cards ===== */}
        <div className="dash-stats-grid">
          {stats.map((s, i) => (
            <div className="dash-stat-card" key={i}>
              <div
                className="stat-icon-box"
                style={{ background: `${s.color}15`, color: s.color }}
              >
                {s.icon}
              </div>
              <div>
                <span className="stat-val">{s.value}</span>
                <span className="stat-lbl">{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ===== Tabs ===== */}
        <div className="dash-tabs">
          <button
            className={`dash-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button
            className={`dash-tab ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            📅 Appointments
          </button>
          <button
            className={`dash-tab ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            📄 Reports
          </button>
        </div>

        {/* ===== Tab Content ===== */}
        <div className="dash-content">
          {activeTab === 'overview' && (
            <div className="dash-overview">
              <div className="dash-card">
                <div className="dash-card-header">
                  <h3>🕐 Recent Appointments</h3>
                  <button
                    className="link-btn"
                    onClick={() => setActiveTab('appointments')}
                  >
                    View All →
                  </button>
                </div>
                {appointments.length === 0 ? (
                  <p className="empty-state">No appointments yet.</p>
                ) : (
                  <div className="mini-list">
                    {appointments.slice(0, 4).map(a => (
                      <div className="mini-item" key={a.id}>
                        <div className="mini-item-icon">📅</div>
                        <div className="mini-item-body">
                          <strong>
                            {isDoctor ? a.patientName : a.doctorName}
                          </strong>
                          <span>
                            {a.date} • {a.time} • ₹{a.fees}
                          </span>
                        </div>
                        <span
                          className={`status-pill ${
                            a.status === 'Completed' ? 'completed' : 'upcoming'
                          }`}
                        >
                          {a.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="dash-card">
                <div className="dash-card-header">
                  <h3>📄 Recent Reports</h3>
                  <button
                    className="link-btn"
                    onClick={() => setActiveTab('reports')}
                  >
                    View All →
                  </button>
                </div>
                {reports.length === 0 ? (
                  <p className="empty-state">No reports uploaded yet.</p>
                ) : (
                  <div className="mini-list">
                    {reports.slice(0, 3).map(r => (
                      <div className="mini-item" key={r.id}>
                        <div className="mini-item-icon pdf">📄</div>
                        <div className="mini-item-body">
                          <strong>{r.name}</strong>
                          <span>
                            {r.size} • {r.date}
                          </span>
                        </div>
                        <button className="icon-btn">⬇️</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="dash-card full">
              <div className="dash-card-header">
                <h3>
                  {isDoctor ? 'All Patient Appointments' : 'My Appointments'}
                </h3>
                <button
                  className="btn-primary-sm"
                  onClick={() => setShowAppointmentModal(true)}
                >
                  ➕ Add Appointment
                </button>
              </div>

              {appointments.length === 0 ? (
                <p className="empty-state">
                  No appointments found. Click "Add Appointment" to create one.
                </p>
              ) : (
                <div className="table-wrapper">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Patient Name</th>
                        <th>Doctor Name</th>
                        <th>Date & Time</th>
                        <th>Fees</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map(a => (
                        <tr key={a.id}>
                          <td>
                            <div className="table-user">
                              <span className="table-avatar">
                                {getInitials(a.patientName)}
                              </span>
                              {a.patientName}
                            </div>
                          </td>
                          <td>{a.doctorName}</td>
                          <td>
                            {a.date}
                            <br />
                            <small>{a.time}</small>
                          </td>
                          <td>
                            <strong>₹{a.fees}</strong>
                          </td>
                          <td>
                            <span
                              className={`status-pill ${
                                a.status === 'Completed' ? 'completed' : 'upcoming'
                              }`}
                            >
                              {a.status}
                            </span>
                          </td>
                          <td>
                            <button className="icon-btn">👁️</button>
                            <button className="icon-btn danger">🗑️</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="dash-card full">
              <div className="dash-card-header">
                <h3>📄 Uploaded Reports</h3>
                <button
                  className="btn-primary-sm"
                  onClick={() => {
                    setActiveTab('appointments');
                    setShowAppointmentModal(true);
                  }}
                >
                  ➕ Upload Report
                </button>
              </div>

              {reports.length === 0 ? (
                <p className="empty-state">No reports uploaded yet.</p>
              ) : (
                <div className="reports-grid">
                  {reports.map(r => (
                    <div className="report-card" key={r.id}>
                      <div className="report-icon">📄</div>
                      <div className="report-info">
                        <strong>{r.name}</strong>
                        <span>
                          {r.size} • {r.date}
                        </span>
                      </div>
                      <div className="report-actions">
                        <button className="icon-btn">⬇️</button>
                        <button className="icon-btn danger">🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ===== Appointment Modal ===== */}
      {showAppointmentModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowAppointmentModal(false)}
        >
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>➕ New Appointment</h2>
              <button
                className="modal-close"
                onClick={() => setShowAppointmentModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAppointment} className="modal-form">
              <div className="modal-grid">
                <div className="form-group">
                  <label>Patient Name</label>
                  <input
                    type="text"
                    name="patientName"
                    value={appointmentForm.patientName}
                    onChange={handleAppointmentChange}
                    placeholder="Enter patient name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Doctor Name</label>
                  <input
                    type="text"
                    name="doctorName"
                    value={appointmentForm.doctorName}
                    onChange={handleAppointmentChange}
                    placeholder="Enter doctor name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Fees (₹)</label>
                  <input
                    type="number"
                    name="fees"
                    value={appointmentForm.fees}
                    onChange={handleAppointmentChange}
                    placeholder="e.g., 500"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    name="date"
                    value={appointmentForm.date}
                    onChange={handleAppointmentChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Time</label>
                  <input
                    type="time"
                    name="time"
                    value={appointmentForm.time}
                    onChange={handleAppointmentChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Notes (optional)</label>
                  <input
                    type="text"
                    name="notes"
                    value={appointmentForm.notes}
                    onChange={handleAppointmentChange}
                    placeholder="Any additional notes"
                  />
                </div>
              </div>

              {/* PDF Upload */}
              <div className="form-group">
                <label>Upload Reports (PDF only, max 5)</label>
                <div
                  className="file-drop-area"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span className="file-drop-icon">📤</span>
                  <p>Click to select PDF files</p>
                  <small>Multiple files allowed</small>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  multiple
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />

                {uploadError && <p className="upload-error">{uploadError}</p>}

                {selectedFiles.length > 0 && (
                  <div className="file-list">
                    {selectedFiles.map((f, i) => (
                      <div className="file-chip" key={i}>
                        <span>📄 {f.name}</span>
                        <button type="button" onClick={() => removeFile(i)}>
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setShowAppointmentModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-save" disabled={loading}>
                  {loading ? 'Saving...' : '💾 Save Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;