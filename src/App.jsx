import { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import AppRoutes from './routes/AppRoutes';
import Login from './pages/Login/Login';
import { FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa';
import { initKeyboardNavigation } from './utils/keyboardNavigation';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

const TOAST_THEMES = {
  success: {
    classes: 'bg-[#d1fae5] border-[#a7f3d0] text-[#065f46]',
    icon: <FaCheckCircle size={15} />
  },
  warning: {
    classes: 'bg-[#fef3c7] border-[#fde68a] text-[#92400e]',
    icon: <FaExclamationTriangle size={15} />
  },
  error: {
    classes: 'bg-[#fee2e2] border-[#fecaca] text-[#991b1b]',
    icon: <FaTimesCircle size={15} />
  },
  info: {
    classes: 'bg-[#e0f2fe] border-[#bae6fd] text-[#075985]',
    icon: <FaInfoCircle size={15} />
  }
};

function App() {
  const { isAuthenticated, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebarCollapsed') === 'true';
    } catch {
      return false;
    }
  });

  // Enterprise Toast State
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const toggleCollapse = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('sidebarCollapsed', String(next));
      } catch (err) {
        /* ignore */
      }
      return next;
    });
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    const timer = setTimeout(() => {
      setToast({ message: '', type: 'info' });
    }, 3500);
    return () => clearTimeout(timer);
  };

  useEffect(() => {
    window.showToast = showToast;
    const cleanup = initKeyboardNavigation();
    return () => {
      cleanup();
      delete window.showToast;
    };
  }, []);

  const handleLogout = () => {
    logout(showToast);
  };

  const activeToastTheme = TOAST_THEMES[toast.type] || TOAST_THEMES.info;

  if (!isAuthenticated) {
    return (
      <div className="login-root-container">
        {toast.message && (
          <div 
            className={`fixed bottom-6 right-6 flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-lg z-[9999] transition-all duration-300 ${activeToastTheme.classes}`}
          >
            {activeToastTheme.icon}
            <span className="text-xs font-bold">{toast.message}</span>
          </div>
        )}
        <Login showToast={showToast} />
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Global Enterprise Toast Notification */}
      {toast.message && (
        <div 
          className={`fixed bottom-6 right-6 flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-lg z-[9999] transition-all duration-300 ${activeToastTheme.classes}`}
        >
          {activeToastTheme.icon}
          <span className="text-xs font-bold">{toast.message}</span>
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
          <ProtectedRoute>
            <AppRoutes showToast={showToast} />
          </ProtectedRoute>
        </main>
      </div>
    </div>
  );
}

export default App;
