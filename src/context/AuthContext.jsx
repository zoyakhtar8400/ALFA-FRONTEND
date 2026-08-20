import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import apiClient from '../services/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [verifying, setVerifying] = useState(true);

  const clearSession = () => {
    localStorage.removeItem('alfa_token');
    localStorage.removeItem('alfa_user');
    setIsAuthenticated(false);
    setUser(null);
  };

  // Verify token against backend on every mount/refresh
  useEffect(() => {
    const token = localStorage.getItem('alfa_token');
    if (!token) {
      setVerifying(false);
      return;
    }

    apiClient.get('/auth/me')
      .then((res) => {
        const verifiedUser = res?.user || res;
        if (verifiedUser && verifiedUser.id) {
          setIsAuthenticated(true);
          setUser(verifiedUser);
          localStorage.setItem('alfa_user', JSON.stringify(verifiedUser));
          localStorage.setItem('user', JSON.stringify(verifiedUser));
        } else {
          clearSession();
        }
      })
      .catch(() => {
        clearSession();
      })
      .finally(() => {
        setVerifying(false);
      });
  }, []);

  // Issue 1 fix: listen for mid-session 401s dispatched by apiClient interceptor
  useEffect(() => {
    const handleSessionExpired = () => {
      clearSession();
      const toastFn = window.showToast;
      if (toastFn) toastFn('Session expired. Please log in again.', 'warning');
    };
    window.addEventListener('alfa_session_expired', handleSessionExpired);
    return () => window.removeEventListener('alfa_session_expired', handleSessionExpired);
  }, []);

  // 30-minute inactivity auto-logout
  useEffect(() => {
    if (!isAuthenticated) return;

    let timeoutId;
    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => logout(true), 30 * 60 * 1000);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [isAuthenticated]);

  const login = async (email, password, showToast, callback) => {
    const toastFn = showToast || window.showToast;
    try {
      const response = await authService.login({
        username: email,
        email: email,
        password: password
      });

      if (response && response.token && response.user) {
        localStorage.setItem('alfa_token', response.token);
        localStorage.setItem('token', response.token);
        localStorage.setItem('alfa_user', JSON.stringify(response.user));
        localStorage.setItem('user', JSON.stringify(response.user));

        setIsAuthenticated(true);
        setUser(response.user);

        if (toastFn) {
          toastFn(`Welcome back, ${response.user.name || response.user.username || 'User'}! Logged in successfully. 🎉`, 'success');
        }

        window.dispatchEvent(new Event('authLoginSuccess'));

        if (callback) callback();
        return true;
      } else {
        const msg = response?.message || 'Login failed. Invalid username or password.';
        if (toastFn) toastFn(`⛔ ${msg}`, 'error');
        return false;
      }
    } catch (err) {
      console.error('Login API authentication error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Invalid credentials or inactive account.';
      if (toastFn) toastFn(`⛔ ${errMsg}`, 'error');
      return false;
    }
  };

  const logout = (autoLogout = false, showToast) => {
    clearSession();
    const toastFn = showToast || window.showToast;
    if (toastFn) {
      if (autoLogout === true) {
        toastFn('Session expired due to 30 mins inactivity. Logged out.', 'warning');
      } else {
        toastFn('Logged out successfully.', 'success');
      }
    }
  };

  if (verifying) return null;

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

export default AuthContext;
