// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const predictRoutes = require('./routes/predict.routes');

// Initialize Express
const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors()); // Allows React on port 5173 to talk to Node on port 5000
app.use(express.json()); // Parses incoming JSON payloads

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Node Backend is running' });
});

// Mount Routes
app.use('/api/predict', predictRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});