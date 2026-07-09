import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('alfa_token');
      return !!token;
    } catch {
      return false;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('alfa_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // Verify token on mount to handle refresh correctly
  useEffect(() => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('alfa_token');
    if (token) {
      setIsAuthenticated(true);
      const savedUser = localStorage.getItem('alfa_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  // 30-Minute Inactivity Auto-Logout Tracker
  useEffect(() => {
    if (!isAuthenticated) return;

    let timeoutId;
    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        logout(true);
      }, 30 * 60 * 1000); // 30 minutes
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [isAuthenticated]);

  const login = (email, password, showToast, callback) => {
    const mockToken = 'mock-jwt-token-for-alfa-hms';
    const mockUser = {
      id: 1,
      name: 'Zoya',
      role: 'admin',
      email: email,
      permissions: ['manage_rooms', 'manage_restaurant', 'manage_billing']
    };

    try {
      localStorage.setItem('alfa_token', mockToken);
      localStorage.setItem('authToken', mockToken);
      localStorage.setItem('alfa_user', JSON.stringify(mockUser));
    } catch (err) {
      console.error("Failed to store credentials", err);
    }

    setIsAuthenticated(true);
    setUser(mockUser);

    const toastFn = showToast || window.showToast;
    if (toastFn) {
      toastFn("Welcome back, Zoya! Logged in successfully. 🎉", "success");
    }

    if (callback) {
      callback();
    }
  };

  const logout = (autoLogout = false, showToast) => {
    try {
      localStorage.removeItem('alfa_token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('alfa_user');
    } catch (err) {
      console.error("Failed to clear credentials", err);
    }

    setIsAuthenticated(false);
    setUser(null);

    const toastFn = showToast || window.showToast;
    if (toastFn) {
      if (autoLogout === true) {
        toastFn("Session expired due to 30 mins inactivity. Logged out.", "warning");
      } else {
        toastFn("Logged out successfully.", "success");
      }
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
