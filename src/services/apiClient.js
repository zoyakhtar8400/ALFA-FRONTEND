import axios from 'axios';
import { BASE_URL } from '../config/apiConfig';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let activeRequestsCount = 0;

const startProgress = () => {
  activeRequestsCount++;
  if (activeRequestsCount === 1) {
    window.dispatchEvent(new Event('alfa_ajax_start'));
  }
};

const endProgress = () => {
  activeRequestsCount = Math.max(0, activeRequestsCount - 1);
  if (activeRequestsCount === 0) {
    window.dispatchEvent(new Event('alfa_ajax_end'));
  }
};

// Request interceptor — attach JWT bearer token
apiClient.interceptors.request.use(
  (config) => {
    startProgress();
    const token = localStorage.getItem('alfa_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    endProgress();
    return Promise.reject(error);
  }
);

// Response interceptor — on 401, clear storage AND notify AuthContext via event
apiClient.interceptors.response.use(
  (response) => {
    endProgress();
    return response.data;
  },
  (error) => {
    endProgress();
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
