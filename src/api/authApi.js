import apiClient from './apiClient';

export const authApi = {
  login: (credentials) => apiClient.post('/login', credentials),
  logout: () => apiClient.post('/logout'),
  getCurrentUser: () => apiClient.get('/auth/me'),
  verifyToken: (token) => apiClient.post('/auth/verify', { token }),
};

export default authApi;
