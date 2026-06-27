import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import AppRoutes from './routes/AppRoutes';
import Login from './pages/Login/Login';
import { FaInfoCircle } from 'react-icons/fa';
import { initKeyboardNavigation } from './utils/keyboardNavigation';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  // Mobile drawer state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Desktop collapse state — persisted in localStorage
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebarCollapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [toastMessage, setToastMessage] = useState('');

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const toggleCollapse = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem('sidebarCollapsed', String(next)); } catch {}
      return next;
    });
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  useEffect(() => {
    window.showToast = showToast;
    const cleanup = initKeyboardNavigation();
    return () => {
      cleanup();
      delete window.showToast;
    };
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    showToast("Logged out successfully.");
  };

  // If not authenticated, force display the premium login screen
  if (!isAuthenticated) {
    return (
      <div className="login-root-container">
        {toastMessage && (
          <div className="toast-container">
            <FaInfoCircle size={18} />
            <span>{toastMessage}</span>
          </div>
        )}
        <Login onLogin={handleLogin} showToast={showToast} />
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="toast-container">
          <FaInfoCircle size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        isCollapsed={sidebarCollapsed}
        toggleCollapse={toggleCollapse}
        onLogout={handleLogout}
      />

      <div className="main-layout">
        <Navbar
          toggleSidebar={toggleSidebar}
          toggleCollapse={toggleCollapse}
          sidebarCollapsed={sidebarCollapsed}
          showToast={showToast}
        />
        <main className="content-area relative" style={{ position: 'relative' }}>
          <AppRoutes showToast={showToast} />
        </main>
      </div>
    </div>
  );
}

export default App;
