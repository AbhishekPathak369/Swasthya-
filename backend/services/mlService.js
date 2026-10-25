// backend/services/mlService.js
const axios = require('axios');

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const ML_KEY = process.env.ML_API_KEY || 'dev-secret-key-change-me';

const mlClient = axios.create({
  baseURL: ML_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': ML_KEY,
  },
  timeout: 10000, // 10 seconds
});

const getPrediction = async (symptoms) => {
  try {
    const response = await mlClient.post('/predict', { symptoms });
    return response.data;
  } catch (error) {
    const status = error.response?.status || 500;
    const detail = error.response?.data?.detail || error.message;
    const err = new Error(`ML Prediction failed: ${detail}`);
    err.status = status;
    throw err;
  }
};

const getExplanation = async (symptoms) => {
  try {
    const response = await mlClient.post('/explain', { symptoms });
    return response.data;
  } catch (error) {
    const status = error.response?.status || 500;
    const detail = error.response?.data?.detail || error.message;
    const err = new Error(`ML Explanation failed: ${detail}`);
    err.status = status;
    throw err;
  }
};

module.exports = {
  getPrediction,
  getExplanation,
};