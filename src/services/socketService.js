import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config/apiConfig';

let socket = null;

export const socketService = {
  connect() {
    if (!socket) {
      const token = localStorage.getItem('alfa_token');
      socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
      });

      socket.on('connect', () => {
        console.log('Socket.io connected:', socket.id);
      });

      socket.on('disconnect', () => {
        console.log('Socket.io disconnected');
      });
    }
    return socket;
  },

  disconnect() {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  on(eventName, callback) {
    if (socket) {
      socket.on(eventName, callback);
    }
  },

  off(eventName, callback) {
    if (socket) {
      socket.off(eventName, callback);
    }
  },

  emit(eventName, data) {
    if (socket) {
      socket.emit(eventName, data);
    }
  },
};

export default socketService;
