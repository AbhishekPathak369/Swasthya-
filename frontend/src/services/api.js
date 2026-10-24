// frontend/src/services/api.js
import axios from 'axios';

// If you are using Vite, it proxies requests or uses an env variable.
// Default fallback to localhost:5000
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const predictDisease = async (symptoms) => {
  try {
    const response = await axios.post(`${API_URL}/api/predict`, {
      symptoms,
    });
    return response.data.data; // Returns { prediction, explanation, historyId }
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    throw new Error(message);
  }
};