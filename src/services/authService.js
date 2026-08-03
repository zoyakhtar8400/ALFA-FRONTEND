import apiClient from './apiClient';

export const authService = {
  async login(credentials) {
    const data = await apiClient.post('/login', credentials);
    if (data && data.token) {
      localStorage.setItem('alfa_token', data.token);
    }
    return data;
  },

  logout() {
    localStorage.removeItem('alfa_token');
  },

  getToken() {
    return localStorage.getItem('alfa_token');
  },
};

export default authService;
