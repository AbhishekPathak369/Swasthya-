
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create a reusable Axios instance
export const api = axios.create({
  baseURL: `${API_URL}/api`,
});

// ===================================
// ML PREDICTION (Existing functionality)
// ===================================

export const predictDisease = async (symptoms) => {
  try {
    const response = await api.post('/predict', {
      symptoms,
    });

    return response.data.data;
  } catch (error) {
    const message =
      error.response?.data?.message || error.message;

    throw new Error(message);
  }
};

// ===================================
// AUTHENTICATION (New functionality)
// ===================================

// Register patient / request doctor registration
export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);

  return response.data;
};

// Login
export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);

  return response.data;
};

// Get current logged-in user
export const getCurrentUser = async (token) => {
  const response = await api.get('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
