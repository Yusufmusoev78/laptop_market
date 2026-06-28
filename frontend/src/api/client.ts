import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || (window.location.origin.includes('localhost:5173') ? 'http://localhost:8000/api/v1' : '/api/v1');

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
