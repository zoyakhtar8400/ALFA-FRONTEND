import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import AppRoutes from './routes/AppRoutes';
import Login from './pages/Login/Login';
import { FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa';
import { initKeyboardNavigation } from './utils/keyboardNavigation';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import GlobalSearch from './components/common/GlobalSearch';
import ToastContainer, { showToast as unifiedShowToast } from './components/common/ToastContainer';
import ServerConfigModal from './components/common/ServerConfigModal';

function App() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Hide sidebar on operational POS pages (Display Table, View KOT, Order Details, Billing Desk, POS Billing)
  const isPosOperationalPage = [
    '/display-table',
    '/view-kot',
    '/order-details',
    '/billing-desk',
    '/pos-billing',
    '/invoice'
  ].some(subpath => location.pathname.includes(subpath));

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebarCollapsed') === 'true';
    } catch {
      return false;
    }
  });

  const [searchOpen, setSearchOpen] = useState(false);
  const [initialSetupOpen, setInitialSetupOpen] = useState(false);

  useEffect(() => {
    const checkConfig = async () => {
      let url = null;
      try {
        if (window.electronAPI && typeof window.electronAPI.getConfig === 'function') {
          const cfg = await window.electronAPI.getConfig();
          if (cfg && cfg.serverUrl) {
            url = cfg.serverUrl;
            localStorage.setItem('alfa_server_url', url);
          }
        }
      } catch (e) {}

      if (!url) {
        url = localStorage.getItem('alfa_server_url');
      }

      if (!url) {
        setInitialSetupOpen(true);
      }
    };
    checkConfig();
  }, []);

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

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleEnd = () => setLoading(false);

    window.addEventListener('alfa_ajax_start', handleStart);
    window.addEventListener('alfa_ajax_end', handleEnd);

    return () => {
      window.removeEventListener('alfa_ajax_start', handleStart);
      window.removeEventListener('alfa_ajax_end', handleEnd);
    };
  }, []);

  const showToast = (message, type = null, duration = null) => {
    return unifiedShowToast(message, type, duration);
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
          document.documentElement.requestFullscreen().catch(() => { });
        } else {
          document.exitFullscreen().catch(() => { });
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

  if (!isAuthenticated) {
    return (
      <div className="login-root-container">
        <style>{`
          @keyframes topLoaderBar {
            0% { width: 0%; left: 0%; }
            50% { width: 50%; left: 25%; }
            100% { width: 100%; left: 100%; }
          }
        `}</style>
        {loading && (
          <div style={{
            position: 'fixed', top: 0, left: 0, height: '3px',
            background: 'linear-gradient(90deg, #3b82f6, #6366f1, #10b981)',
            zIndex: 99999, animation: 'topLoaderBar 1.2s ease-in-out infinite',
            boxShadow: '0 1px 8px rgba(59, 130, 246, 0.5)'
          }} />
        )}
        <ToastContainer />
        <Login showToast={showToast} />
      </div>
    );
  }

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <style>{`
        @keyframes topLoaderBar {
          0% { width: 0%; left: 0%; }
          50% { width: 50%; left: 25%; }
          100% { width: 100%; left: 100%; }
        }
      `}</style>

      {loading && (
        <div style={{
          position: 'fixed', top: 0, left: 0, height: '3px',
          background: 'linear-gradient(90deg, #3b82f6, #6366f1, #10b981)',
          zIndex: 99999, animation: 'topLoaderBar 1.2s ease-in-out infinite',
          boxShadow: '0 1px 8px rgba(59, 130, 246, 0.5)'
        }} />
      )}

      {/* Global Standard Toast Notifications */}
      <ToastContainer />

      {/* Main Workspace Frame */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {!isPosOperationalPage && (
          <Sidebar
            isOpen={sidebarOpen}
            toggleSidebar={toggleSidebar}
            isCollapsed={sidebarCollapsed}
            toggleCollapse={toggleCollapse}
            onLogout={handleLogout}
          />
        )}

        <div className="main-layout" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <Navbar
            toggleSidebar={toggleSidebar}
            toggleCollapse={toggleCollapse}
            sidebarCollapsed={sidebarCollapsed}
            showToast={showToast}
            onOpenSearch={() => setSearchOpen(true)}
            isPosOperationalPage={isPosOperationalPage}
          />
          <main className="content-area relative" style={{ position: 'relative', flex: 1, overflowY: 'auto' }}>
            <ProtectedRoute>
              <AppRoutes showToast={showToast} />
            </ProtectedRoute>
          </main>
        </div>
      </div>

      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <ServerConfigModal
        isOpen={initialSetupOpen}
        isInitialSetup={true}
        onClose={() => setInitialSetupOpen(false)}
        onSaved={() => setInitialSetupOpen(false)}
      />
    </div>
  );
}

export default App;
