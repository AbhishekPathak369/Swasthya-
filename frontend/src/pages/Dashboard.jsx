import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

/* ==========================================================
   Professional SVG Icons
   ========================================================== */
const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const WalletIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M21 12V7H5a2 2 0 010-4h14v4" />
    <path d="M3 5v14a2 2 0 002 2h16v-5" />
    <path d="M18 12a2 2 0 000 4h4v-4z" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const DoctorIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M8 3h8v4a4 4 0 01-8 0V3z" />
    <path d="M16 7h2a2 2 0 012 2v2a4 4 0 01-4 4" />
    <path d="M8 7H6a2 2 0 00-2 2v2a4 4 0 004 4" />
    <path d="M12 15v6" />
    <path d="M9 21h6" />
  </svg>
);

const CardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
  </svg>
);

const FileTextIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
  </svg>
);

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const ChartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

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
  //   fetch('http://localhost:5000/api/auth/me', {
  //     headers: { 'Authorization': `Bearer ${token}` }
  //   })
  //     .then(res => res.json())
  //     .then(data => {
  //       setUser(data.user);
  //
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
      { id: 1, patientName: 'Rahul Sharma', doctorName: 'Dr. Anjali Verma', fees: 500, date: '2025-11-10', time: '10:30 AM', status: 'Completed' },
      { id: 2, patientName: 'Priya Singh', doctorName: 'Dr. Anjali Verma', fees: 700, date: '2025-11-12', time: '02:00 PM', status: 'Upcoming' },
      { id: 3, patientName: 'Amit Kumar', doctorName: 'Dr. Rajesh Mehta', fees: 400, date: '2025-11-15', time: '11:00 AM', status: 'Upcoming' }
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
    setAppointmentForm({ patientName: '', doctorName: '', fees: '', date: '', time: '', notes: '' });
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

    setSelectedFiles(prev => [...prev, ...pdfs].slice(0, 5));
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

  const doctorStats = [
    { label: 'Total Appointments', value: appointments.length, Icon: CalendarIcon, color: '#2563eb', bg: 'rgba(37, 99, 235, 0.10)' },
    { label: 'Total Patients', value: new Set(appointments.map(a => a.patientName)).size, Icon: UsersIcon, color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.10)' },
    { label: 'Total Earnings', value: `₹${appointments.reduce((s, a) => s + a.fees, 0)}`, Icon: WalletIcon, color: '#16a34a', bg: 'rgba(22, 163, 74, 0.10)' },
    { label: 'Upcoming', value: appointments.filter(a => a.status === 'Upcoming').length, Icon: ClockIcon, color: '#d97706', bg: 'rgba(217, 119, 6, 0.10)' }
  ];

  const patientStats = [
    { label: 'My Appointments', value: appointments.length, Icon: CalendarIcon, color: '#2563eb', bg: 'rgba(37, 99, 235, 0.10)' },
    { label: 'Doctors Consulted', value: new Set(appointments.map(a => a.doctorName)).size, Icon: DoctorIcon, color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.10)' },
    { label: 'Total Spent', value: `₹${appointments.reduce((s, a) => s + a.fees, 0)}`, Icon: CardIcon, color: '#16a34a', bg: 'rgba(22, 163, 74, 0.10)' },
    { label: 'Reports', value: reports.length, Icon: FileTextIcon, color: '#d97706', bg: 'rgba(217, 119, 6, 0.10)' }
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
                {isDoctor ? <><DoctorIcon /> Doctor</> : <><UserIcon /> Patient</>}
              </span>
              <h1>Welcome back, {user.name.split(' ')[0]}</h1>
              <p>
                {isDoctor
                  ? 'Manage your patients, appointments, and reports — all in one place.'
                  : 'Track your appointments, reports, and health journey here.'}
              </p>
            </div>
          </div>
          <div className="dash-hero-actions">
            <button className="btn-add-appointment" onClick={() => setShowAppointmentModal(true)}>
              <PlusIcon /> New Appointment
            </button>
            <button className="btn-logout-dash" onClick={handleLogout}>
              <LogoutIcon /> Logout
            </button>
          </div>
          <div className="dash-hero-ornament"></div>
        </div>

        {/* ===== Stats Cards ===== */}
        <div className="dash-stats-grid">
          {stats.map((s, i) => {
            const IconComponent = s.Icon;
            return (
              <div className="dash-stat-card" key={i}>
                <div className="stat-icon-box" style={{ background: s.bg, color: s.color }}>
                  <IconComponent />
                </div>
                <div>
                  <span className="stat-val">{s.value}</span>
                  <span className="stat-lbl">{s.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ===== Tabs ===== */}
        <div className="dash-tabs">
          <button
            className={`dash-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <ChartIcon /> Overview
          </button>
          <button
            className={`dash-tab ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            <CalendarIcon /> Appointments
          </button>
          <button
            className={`dash-tab ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <FileTextIcon size={16} /> Reports
          </button>
        </div>

        {/* ===== Tab Content ===== */}
        <div className="dash-content">
          {activeTab === 'overview' && (
            <div className="dash-overview">
              <div className="dash-card">
                <div className="dash-card-header">
                  <h3>Recent Appointments</h3>
                  <button className="link-btn" onClick={() => setActiveTab('appointments')}>
                    View All →
                  </button>
                </div>
                {appointments.length === 0 ? (
                  <p className="empty-state">No appointments yet.</p>
                ) : (
                  <div className="mini-list">
                    {appointments.slice(0, 4).map(a => (
                      <div className="mini-item" key={a.id}>
                        <div className="mini-item-icon">
                          <CalendarIcon />
                        </div>
                        <div className="mini-item-body">
                          <strong>{isDoctor ? a.patientName : a.doctorName}</strong>
                          <span>{a.date} • {a.time} • ₹{a.fees}</span>
                        </div>
                        <span className={`status-pill ${a.status === 'Completed' ? 'completed' : 'upcoming'}`}>
                          {a.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="dash-card">
                <div className="dash-card-header">
                  <h3>Recent Reports</h3>
                  <button className="link-btn" onClick={() => setActiveTab('reports')}>
                    View All →
                  </button>
                </div>
                {reports.length === 0 ? (
                  <p className="empty-state">No reports uploaded yet.</p>
                ) : (
                  <div className="mini-list">
                    {reports.slice(0, 3).map(r => (
                      <div className="mini-item" key={r.id}>
                        <div className="mini-item-icon pdf">
                          <FileTextIcon size={18} />
                        </div>
                        <div className="mini-item-body">
                          <strong>{r.name}</strong>
                          <span>{r.size} • {r.date}</span>
                        </div>
                        <button className="icon-btn" aria-label="Download"><DownloadIcon /></button>
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
                <h3>{isDoctor ? 'All Patient Appointments' : 'My Appointments'}</h3>
                <button className="btn-primary-sm" onClick={() => setShowAppointmentModal(true)}>
                  <PlusIcon /> Add Appointment
                </button>
              </div>

              {appointments.length === 0 ? (
                <p className="empty-state">No appointments found. Click "Add Appointment" to create one.</p>
              ) : (
                <div className="table-wrapper">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Patient Name</th>
                        <th>Doctor Name</th>
                        <th>Date &amp; Time</th>
                        <th>Fees</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map(a => (
                        <tr key={a.id}>
                          <td>
                            <div className="table-user">
                              <span className="table-avatar">{getInitials(a.patientName)}</span>
                              {a.patientName}
                            </div>
                          </td>
                          <td>{a.doctorName}</td>
                          <td>
                            {a.date}
                            <br />
                            <small>{a.time}</small>
                          </td>
                          <td><strong>₹{a.fees}</strong></td>
                          <td>
                            <span className={`status-pill ${a.status === 'Completed' ? 'completed' : 'upcoming'}`}>
                              {a.status}
                            </span>
                          </td>
                          <td>
                            <button className="icon-btn" aria-label="View"><EyeIcon /></button>
                            <button className="icon-btn danger" aria-label="Delete"><TrashIcon /></button>
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
                <h3>Uploaded Reports</h3>
                <button
                  className="btn-primary-sm"
                  onClick={() => { setActiveTab('appointments'); setShowAppointmentModal(true); }}
                >
                  <PlusIcon /> Upload Report
                </button>
              </div>

              {reports.length === 0 ? (
                <p className="empty-state">No reports uploaded yet.</p>
              ) : (
                <div className="reports-grid">
                  {reports.map(r => (
                    <div className="report-card" key={r.id}>
                      <div className="report-icon"><FileTextIcon size={18} /></div>
                      <div className="report-info">
                        <strong>{r.name}</strong>
                        <span>{r.size} • {r.date}</span>
                      </div>
                      <div className="report-actions">
                        <button className="icon-btn" aria-label="Download"><DownloadIcon /></button>
                        <button className="icon-btn danger" aria-label="Delete"><TrashIcon /></button>
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
        <div className="modal-backdrop" onClick={() => setShowAppointmentModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><PlusIcon /> New Appointment</h2>
              <button className="modal-close" onClick={() => setShowAppointmentModal(false)} aria-label="Close">
                <XIcon />
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
                <div className="file-drop-area" onClick={() => fileInputRef.current?.click()}>
                  <span className="file-drop-icon"><UploadIcon /></span>
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
                        <FileTextIcon size={14} />
                        <span>{f.name}</span>
                        <button type="button" onClick={() => removeFile(i)} aria-label="Remove">
                          <XIcon />
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
                  onClick={() => { setShowAppointmentModal(false); resetForm(); }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-save" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Appointment'}
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