import axios from 'axios';
import { BASE_URL } from '../config/apiConfig';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT bearer token
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

// Response interceptor — on 401, clear storage AND notify AuthContext via event
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('alfa_token');
      localStorage.removeItem('alfa_user');
      // Dispatch event so AuthContext can update React state immediately
      window.dispatchEvent(new Event('alfa_session_expired'));
    }
    return Promise.reject(error);
  }
);

export default apiClient;
