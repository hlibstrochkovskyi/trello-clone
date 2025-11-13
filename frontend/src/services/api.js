import axios from 'axios';

// Create an "instance" (setup) for all our requests
const api = axios.create({
  baseURL: '/api', // Thanks to the proxy, this will go to localhost:8080/api
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically add a token to each request if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;