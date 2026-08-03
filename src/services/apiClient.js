import axios from 'axios';
import { BASE_URL } from '../config/apiConfig';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('alfa_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error management
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('alfa_token');
      // Redirect to login if unauthenticated
    }
    return Promise.reject(error);
  }
);

export default apiClient;
