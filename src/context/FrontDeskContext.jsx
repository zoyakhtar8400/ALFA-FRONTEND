import React, { createContext, useContext, useState, useEffect } from 'react';

const FrontDeskContext = createContext(null);

const DEFAULT_ROOMS = [
  { no: '101', type: 'Standard', status: 'Clean' },
  { no: '102', type: 'Standard', status: 'Dirty' },
  { no: '103', type: 'Deluxe', status: 'Clean' },
  { no: '104', type: 'Deluxe', status: 'Maintenance' },
  { no: '201', type: 'Suite', status: 'Clean' },
  { no: '202', type: 'Suite', status: 'Dirty' },
  { no: '203', type: 'Executive', status: 'Clean' },
  { no: '204', type: 'Executive', status: 'Clean' }
];

const DEFAULT_ARRIVALS = [
  { id: 'arr-1', guest: 'John Doe', room: '103', pax: 2, time: '12:00 PM', status: 'Expected' },
  { id: 'arr-2', guest: 'Sarah Jenkins', room: '201', pax: 1, time: '02:30 PM', status: 'Expected' },
  { id: 'arr-3', guest: 'Michael Chang', room: '203', pax: 3, time: '04:00 PM', status: 'Expected' }
];

const DEFAULT_DEPARTURES = [
  { id: 'dep-1', guest: 'Robert Smith', room: '101', pax: 2, time: '11:00 AM', status: 'Checking Out' },
  { id: 'dep-2', guest: 'Emma Watson', room: '102', pax: 1, time: '12:00 PM', status: 'Delayed' }
];

const DEFAULT_NOTIFICATIONS = [
  { id: 1, title: 'New Reservation', message: 'Room 204 booked for Vikas P.', time: '5m ago', read: false },
  { id: 2, title: 'Late Checkout', message: 'Room 101 requested 12:30 PM checkout', time: '12m ago', read: false },
  { id: 3, title: 'Dirty Room Alert', message: 'Room 102 checked out - cleaning needed', time: '30m ago', read: false },
  { id: 4, title: 'Payment Pending', message: 'Table 04 request checkout settlement', time: '45m ago', read: false }
];

const DEFAULT_AUDIT_LOGS = [
  { id: 1, user: 'Zoya', action: 'Shift Login', target: 'Front Office Console', time: '09:00 AM', date: 'Today' },
  { id: 2, user: 'Amit', action: 'KOT Generated', target: 'Table 02 (₹1,070)', time: '10:15 AM', date: 'Today' }
];

export const FrontDeskProvider = ({ children }) => {
  const [rooms, setRooms] = useState(() => {
    try {
      const saved = localStorage.getItem('alfa_frontdesk_rooms');
      return saved ? JSON.parse(saved) : DEFAULT_ROOMS;
    } catch {
      return DEFAULT_ROOMS;
    }
  });

  const [arrivals, setArrivals] = useState(() => {
    try {
      const saved = localStorage.getItem('alfa_frontdesk_arrivals');
      return saved ? JSON.parse(saved) : DEFAULT_ARRIVALS;
    } catch {
      return DEFAULT_ARRIVALS;
    }
  });

  const [departures, setDepartures] = useState(() => {
    try {
      const saved = localStorage.getItem('alfa_frontdesk_departures');
      return saved ? JSON.parse(saved) : DEFAULT_DEPARTURES;
    } catch {
      return DEFAULT_DEPARTURES;
    }
  });

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('alfa_frontdesk_notifications');
      return saved ? JSON.parse(saved) : DEFAULT_NOTIFICATIONS;
    } catch {
      return DEFAULT_NOTIFICATIONS;
    }
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('alfa_frontdesk_audit_logs');
      return saved ? JSON.parse(saved) : DEFAULT_AUDIT_LOGS;
    } catch {
      return DEFAULT_AUDIT_LOGS;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('alfa_frontdesk_rooms', JSON.stringify(rooms));
      localStorage.setItem('alfa_frontdesk_arrivals', JSON.stringify(arrivals));
      localStorage.setItem('alfa_frontdesk_departures', JSON.stringify(departures));
      localStorage.setItem('alfa_frontdesk_notifications', JSON.stringify(notifications));
      localStorage.setItem('alfa_frontdesk_audit_logs', JSON.stringify(auditLogs));
    } catch (err) {
      console.error("Failed to persist front desk states", err);
    }
  }, [rooms, arrivals, departures, notifications, auditLogs]);

  // Actions
  const logAction = (action, target, user = 'Zoya') => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newLog = {
      id: Date.now(),
      user,
      action,
      target,
      time: timeStr,
      date: 'Today'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const addNotification = (title, message) => {
    const newNotif = {
      id: Date.now(),
      title,
      message,
      time: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const cycleRoomStatus = (roomNo, showToast) => {
    setRooms(prev => prev.map(room => {
      if (room.no === roomNo) {
        let newStatus = 'Clean';
        if (room.status === 'Clean') newStatus = 'Dirty';
        else if (room.status === 'Dirty') newStatus = 'Maintenance';
        else newStatus = 'Clean';
        
        if (showToast) {
          showToast(`Room ${roomNo} status updated to: ${newStatus}`);
        }
        logAction(`Changed Room Status to ${newStatus}`, `Room ${roomNo}`);
        return { ...room, status: newStatus };
      }
      return room;
    }));
  };

  const checkInGuest = (arrivalId, roomNo, showToast) => {
    const arrival = arrivals.find(a => a.id === arrivalId);
    if (!arrival) return;

    // Remove from arrivals roster
    setArrivals(prev => prev.filter(a => a.id !== arrivalId));

    // Update Room Status to occupied / Clean
    setRooms(prev => prev.map(r => {
      if (r.no === roomNo) {
        return { ...r, status: 'Clean' }; // Occupied (Clean)
      }
      return r;
    }));

    if (showToast) {
      showToast(`Guest ${arrival.guest} checked into Room ${roomNo} successfully!`, "success");
    }

    logAction('Check-In Complete', `Guest: ${arrival.guest} to Room ${roomNo}`);
    addNotification('Check-In Complete', `${arrival.guest} is now in Room ${roomNo}`);
  };

  const checkOutGuest = (departureId, roomNo, showToast) => {
    const departure = departures.find(d => d.id === departureId);
    if (!departure) return;

    // Remove from departures roster
    setDepartures(prev => prev.filter(d => d.id !== departureId));

    // Mark room status to Dirty after Checkout
    setRooms(prev => prev.map(r => {
      if (r.no === roomNo) {
        return { ...r, status: 'Dirty' };
      }
      return r;
    }));

    if (showToast) {
      showToast(`Guest ${departure.guest} checked out from Room ${roomNo} successfully!`, "success");
    }

    logAction('Check-Out Settle', `Guest: ${departure.guest} from Room ${roomNo}`);
    addNotification('Dirty Room Alert', `Room ${roomNo} checked out - cleaning needed`);
  };

  return (
    <FrontDeskContext.Provider value={{
      rooms, setRooms, arrivals, departures, notifications, auditLogs,
      cycleRoomStatus, checkInGuest, checkOutGuest, logAction, addNotification,
      markAllNotificationsRead, clearNotification
    }}>
      {children}
    </FrontDeskContext.Provider>
  );
};

export const useFrontDesk = () => {
  const context = useContext(FrontDeskContext);
  if (!context) {
    throw new Error('useFrontDesk must be used within a FrontDeskProvider');
  }
  return context;
};
