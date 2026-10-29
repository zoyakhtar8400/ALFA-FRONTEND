import { io } from 'socket.io-client';
import { getServerUrl } from '../config/apiConfig';

let socket = null;

export const socketService = {
  connect() {
    if (!socket) {
      const token = localStorage.getItem('alfa_token');
      const targetUrl = getServerUrl();
      socket = io(targetUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
      });

      socket.on('connect', () => {
        console.log('Socket.io connected:', socket.id, 'to:', targetUrl);
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
