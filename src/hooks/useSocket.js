import { useState, useEffect } from 'react';
import socketService from '../services/socketService';

export function useSocket(eventName, callback) {
  useEffect(() => {
    const socket = socketService.connect();
    if (eventName && callback) {
      socketService.on(eventName, callback);
    }

    return () => {
      if (eventName && callback) {
        socketService.off(eventName, callback);
      }
    };
  }, [eventName, callback]);

  return socketService;
}

export default useSocket;
