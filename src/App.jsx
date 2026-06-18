import React, { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import AppRoutes from './routes/AppRoutes';
import Login from './pages/Login/Login';
import { FaInfoCircle } from 'react-icons/fa';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

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

      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} onLogout={handleLogout} />
      
      <div className="main-layout">
        <Navbar toggleSidebar={toggleSidebar} showToast={showToast} />
        <main className="content-area">
          <AppRoutes showToast={showToast} />
        </main>
      </div>
    </div>
  );
}

export default App;
