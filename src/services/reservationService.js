import apiClient from './apiClient';

export const reservationService = {
  // Load all reservations from PostgreSQL
  async getReservations() {
    return await apiClient.get('/reservations');
  },

  // Create a new booking/reservation
  async createReservation(payload) {
    return await apiClient.post('/reservations', payload);
  },

  // Update an existing reservation (edit guest name, phone, status etc.)
  async updateReservation(id, payload) {
    return await apiClient.put(`/reservations/${id}`, payload);
  },

  // Cancel / update reservation status
  async patchReservation(id, payload) {
    return await apiClient.patch(`/reservations/${id}`, payload);
  },

  // Delete a reservation
  async deleteReservation(id) {
    return await apiClient.delete(`/reservations/${id}`);
  }
};

export default reservationService;
