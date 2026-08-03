import apiClient from './apiClient';

export const housekeepingApi = {
  getRoomStatuses: () => apiClient.get('/housekeeping/rooms'),
  updateRoomStatus: (roomId, status) => apiClient.put(`/housekeeping/rooms/${roomId}`, { status }),
  getTasks: (params) => apiClient.get('/housekeeping/tasks', { params }),
  assignTask: (data) => apiClient.post('/housekeeping/tasks', data),
};

export default housekeepingApi;
