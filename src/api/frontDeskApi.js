import apiClient from './apiClient';

export const frontDeskApi = {
  getBookings: (params) => apiClient.get('/frontdesk/bookings', { params }),
  createBooking: (data) => apiClient.post('/frontdesk/bookings', data),
  updateBooking: (id, data) => apiClient.put(`/frontdesk/bookings/${id}`, data),
  cancelBooking: (id) => apiClient.delete(`/frontdesk/bookings/${id}`),

  getGuestProfiles: (params) => apiClient.get('/frontdesk/guests', { params }),
  createGuestProfile: (data) => apiClient.post('/frontdesk/guests', data),
  
  getRooms: (params) => apiClient.get('/frontdesk/rooms', { params }),
  checkIn: (data) => apiClient.post('/frontdesk/check-in', data),
  checkOut: (data) => apiClient.post('/frontdesk/check-out', data),
};

export default frontDeskApi;
