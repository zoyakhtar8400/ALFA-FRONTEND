import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import AppRoutes from './routes/AppRoutes';
import Login from './pages/Login/Login';
import { FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa';
import { initKeyboardNavigation } from './utils/keyboardNavigation';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import GlobalSearch from './components/common/GlobalSearch';

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
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebarCollapsed') === 'true';
    } catch {
      return false;
    }
  });

  const [searchOpen, setSearchOpen] = useState(false);

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

  // Auto-close sidebar when screen resizes to mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    // Run once on mount in case initial size is mobile
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    const timer = setTimeout(() => {
      setToast({ message: '', type: 'info' });
    }, 3500);
    return () => clearTimeout(timer);
  };

  useEffect(() => {
    window.showToast = showToast;
    const keyboardCleanup = initKeyboardNavigation();

    const handleGlobalKeyDown = (e) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      
      // Ctrl + K to toggle command palette
      if (isCtrl && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
        return;
      }

      // Do NOT hijack F-keys if user is on Restaurant or POS pages so page-level shortcuts work cleanly
      const isRestaurantOrPosPage = window.location.pathname.startsWith('/restaurant') || window.location.pathname.startsWith('/pos');

      // Function keys mapping
      if (e.key === 'F1') {
        e.preventDefault();
        navigate('/');
      } else if (e.key === 'F2' && !isRestaurantOrPosPage) {
        e.preventDefault();
        navigate('/front-desk/operation/booking');
      } else if (e.key === 'F3' && !isRestaurantOrPosPage) {
        e.preventDefault();
        navigate('/front-desk');
      } else if (e.key === 'F4' && !isRestaurantOrPosPage) {
        e.preventDefault();
        navigate('/restaurant/display-table');
      } else if (e.key === 'F6' && !isRestaurantOrPosPage) {
        e.preventDefault();
        navigate('/front-desk/mis/reservation-dashboard');
      } else if (e.key === 'F7' && !isRestaurantOrPosPage) {
        e.preventDefault();
        navigate('/front-desk/operation/guest-profile');
      } else if (e.key === 'F8' && !isRestaurantOrPosPage) {
        e.preventDefault();
        navigate('/front-desk/operation/payment-recieve-entry');
      } else if (e.key === 'F9' && !isRestaurantOrPosPage) {
        e.preventDefault();
        navigate('/pos/report');
      } else if (e.key === 'F10' && !isRestaurantOrPosPage) {
        e.preventDefault();
        window.print();
      } else if (e.key === 'F11') {
        e.preventDefault();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      keyboardCleanup();
      window.removeEventListener('keydown', handleGlobalKeyDown);
      delete window.showToast;
    };
  }, [navigate]);

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
          onOpenSearch={() => setSearchOpen(true)}
        />
        <main className="content-area relative" style={{ position: 'relative' }}>
          <ProtectedRoute>
            <AppRoutes showToast={showToast} />
          </ProtectedRoute>
        </main>
      </div>

      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}

export default App;
