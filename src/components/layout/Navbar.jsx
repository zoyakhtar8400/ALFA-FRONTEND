import { useState, useRef, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaBell, FaSearch, FaUserCircle, FaFlask, FaTimes, FaHistory, FaCheckCircle, FaTrash } from 'react-icons/fa';
import { useFrontDesk } from '../../context/FrontDeskContext';
import companyProfileService from '../../services/companyProfileService';

// Enterprise Global Search Mock Data (Guests, Rooms, Bookings, Companies, Bills, GRC records)
const SEARCH_DATA = [
  { type: 'Guest', name: 'John Smith', detail: 'Room 101 | +91 98765 43210', link: '/front-desk/mis-reservation-dashboard' },
  { type: 'Guest', name: 'Emma Johnson', detail: 'Room 102 | +1 555-0199', link: '/front-desk/mis-reservation-dashboard' },
  { type: 'Guest', name: 'Michael Brown', detail: 'Room 104 | +1 202-555-0143', link: '/front-desk/mis-reservation-dashboard' },
  { type: 'Company', name: 'Alfa Group Ltd', detail: 'Nature: Corporate | GSTIN: 29AAAAA1111A1Z1', link: '/front-desk/master-company-master' },
  { type: 'Company', name: 'Google Inc.', detail: 'Nature: Corporate', link: '/front-desk/master-company-master' },
  { type: 'Booking', name: 'BK-10029 (Alice Smith)', detail: 'Check-In: 18-06-2026', link: '/' },
  { type: 'Room', name: 'Room 101', detail: 'Category: Standard | Status: Clean', link: '/' },
  { type: 'Room', name: 'Room 104', detail: 'Category: Deluxe | Status: Checked-In', link: '/' },
  { type: 'Bill', name: 'BL-9801 (Robert Johnson)', detail: 'Amount: Rs. 180.00 | Visa Card', link: '/' },
  { type: 'GRC', name: 'GRC-8902 (John Doe)', detail: 'Company: Google | Plan: CP', link: '/' },
];

const Navbar = ({ toggleSidebar, toggleCollapse, sidebarCollapsed, showToast, onOpenSearch }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  // Notifications, Audit, and Company Profile states
  const { notifications, auditLogs, markAllNotificationsRead, clearNotification } = useFrontDesk();
  const [showNotif, setShowNotif] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const [companyProfile, setCompanyProfile] = useState(null);
  const notifRef = useRef(null);

  // Load real Company Profile from PostgreSQL on mount and listen for live updates
  useEffect(() => {
    let isMounted = true;
    const loadComp = async () => {
      try {
        const res = await companyProfileService.getProfile();
        const p = res?.data || res?.companyProfile || (res && res.id ? res : null);
        if (isMounted && p) {
          setCompanyProfile(p);
        }
      } catch (e) {
        console.warn('Failed to load company profile in Navbar:', e);
      }
    };
    loadComp();

    const handleUpdate = (e) => {
      if (isMounted) {
        setCompanyProfile(e.detail);
      }
    };
    window.addEventListener('companyProfileUpdated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('companyProfileUpdated', handleUpdate);
    };
  }, []);

  // Close dropdowns on outside clicks
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const getPageTitle = (path) => {
    const parts = path.split('/').filter(Boolean);
    if (parts.length >= 2) {
      const section = parts[0];
      const item = parts[1].split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      return `${section.charAt(0).toUpperCase() + section.slice(1)}: ${item}`;
    }

    switch (path) {
      case '/':
        return 'Dashboard Overview';
      case '/front-desk':
        return 'Front Desk Operations';
      case '/housekeeping':
        return 'House Keeping';
      case '/pos':
        return 'Point Of Sale (POS)';
      case '/room-services':
        return 'Room Services';
      case '/restaurant':
        return 'Restaurant Management';
      case '/banquet':
        return 'Banquet & Events';
      case '/purchase':
        return 'Purchase & Inventory';
      case '/setting':
        return 'System Settings';
      default:
        return 'ALFA HMS';
    }
  };

  const handleHamburger = () => {
    if (window.innerWidth > 768) {
      toggleCollapse();
    } else {
      toggleSidebar();
    }
  };

  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return SEARCH_DATA.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.type.toLowerCase().includes(query) ||
      item.detail.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleResultClick = (item) => {
    showToast(`Navigating to ${item.type}: ${item.name}`);
    setSearchQuery('');
    setShowResults(false);
    navigate(item.link);
  };

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  return (
    <header className="navbar relative" style={{ position: 'relative' }}>
      <div className="navbar-left">
        <button
          className="menu-toggle-btn"
          onClick={handleHamburger}
          aria-label={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <FaBars />
        </button>
        <span className="navbar-page-title">{getPageTitle(location.pathname)}</span>
      </div>

      {/* Mobile-only search icon button */}
      <button
        className="mobile-search-btn"
        onClick={onOpenSearch}
        aria-label="Open Search"
        title="Search pages"
      >
        <FaSearch size={16} />
      </button>

      {/* Global Search Component — desktop only */}
      <div className="flex-1 max-w-md mx-8 relative no-print navbar-search" ref={searchRef}>
        <div className="relative">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            placeholder="Search Guest, Company, Booking, Room, Bill, GRC... (Ctrl+F)"
            className="w-full bg-slate-50 border border-slate-200 rounded-full py-1.5 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:bg-white transition-all duration-200"
          />
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            {/* <FaSearch size={11} /> */}
          </div>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setShowResults(false);
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Clear Search"
            >
              <FaTimes size={11} />
            </button>
          )}
        </div>

        {/* Global Search Results Dropdown */}
        {showResults && searchQuery.trim() && (
          <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-lg z-[1001] max-h-80 overflow-y-auto p-1.5 flex flex-col gap-0.5">
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wide border-b border-slate-50">
              Search Results ({filteredResults.length})
            </div>
            {filteredResults.length > 0 ? (
              filteredResults.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleResultClick(item)}
                  className="px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer flex justify-between items-center gap-4 transition-colors"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold text-slate-700">{item.name}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{item.detail}</span>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${item.type === 'Room' ? 'bg-indigo-50 text-indigo-500' :
                    item.type === 'Guest' ? 'bg-emerald-50 text-emerald-500' :
                      item.type === 'Booking' ? 'bg-amber-50 text-amber-500' :
                        item.type === 'Company' ? 'bg-cyan-50 text-[#418a8b]' :
                          'bg-slate-100 text-slate-600'
                    }`}>
                    {item.type}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-xs text-slate-400 font-medium">
                No matches found for "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>

      <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Audit Trail Button */}
        <button
          className="navbar-dummy-btn"
          onClick={() => setShowAudit(true)}
          title="Audit Trail Logs"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '700', color: '#475569' }}
        >
          <FaHistory size={12} color="#0e7490" />
          <span>Audit Log</span>
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef} style={{ position: 'relative' }}>
          <button className="navbar-action-btn" aria-label="Notifications" onClick={() => setShowNotif(!showNotif)}
            style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer' }}>
            <FaBell size={18} color="#475569" />
            {unreadCount > 0 && (
              <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: '#fff', borderRadius: '50%', width: '15px', height: '15px', fontSize: '9px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <div style={{ position: 'absolute', right: 0, marginTop: '8px', width: '320px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 1000, padding: '12px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px 8px 16px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a' }}>Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllNotificationsRead} style={{ background: 'none', border: 'none', color: '#0e7490', fontSize: '10px', fontWeight: '700', cursor: 'pointer' }}>
                    Mark all read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
                    No notifications available
                  </div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} style={{ display: 'flex', gap: '8px', padding: '10px 16px', borderBottom: '1px solid #f8fafc', background: n.read ? 'transparent' : '#f0f9ff', position: 'relative' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#1e293b' }}>{n.title}</div>
                        <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{n.message}</div>
                        <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '4px' }}>{n.time}</div>
                      </div>
                      <button onClick={() => clearNotification(n.id)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', alignSelf: 'flex-start', fontSize: '12px', padding: 0 }}>
                        <FaTimes size={10} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile / Company Header */}
        <div
          className="user-profile"
          onClick={() => navigate('/company-profile')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
          title="Open Company Profile"
        >
          <div
            className="user-avatar"
            style={{
              width: '42px',
              height: '42px',
              minWidth: '42px',
              borderRadius: '8px',
              background: '#ffffff',
              border: '1.5px solid #cbd5e1',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: companyProfile?.logo ? '3px' : '0'
            }}
          >
            {companyProfile?.logo ? (
              <img
                src={companyProfile.logo}
                alt="Logo"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  objectPosition: 'center',
                  imageRendering: '-webkit-optimize-contrast'
                }}
              />
            ) : (
              <FaUserCircle size={24} style={{ color: '#0f766e' }} />
            )}
          </div>
          <div className="user-info">
            <span className="user-name" style={{ fontWeight: 800 }}>
              {companyProfile?.company_name || companyProfile?.name || 'ALFA Restaurant'}
            </span>
            <span className="user-role" style={{ fontSize: '11px', color: '#64748b' }}>
              {companyProfile?.city ? `${companyProfile.city}, ${companyProfile.state || ''}`.replace(/,\s*$/, '') : 'Company Profile'}
            </span>
          </div>
        </div>
      </div>

      {/* Audit Trail Modal */}
      {showAudit && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '12px', width: '640px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden', fontFamily: 'system-ui' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: '#244E5F', color: '#fff' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaHistory /> PMS Security Audit Trail Logs
              </h3>
              <button onClick={() => setShowAudit(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '16px' }}><FaTimes /></button>
            </div>
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', color: '#475569', fontWeight: '800' }}>
                    <th style={{ padding: '10px 8px', textAlign: 'left' }}>User</th>
                    <th style={{ padding: '10px 8px', textAlign: 'left' }}>Action</th>
                    <th style={{ padding: '10px 8px', textAlign: 'left' }}>Target</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right' }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9', color: '#334155' }}>
                      <td style={{ padding: '10px 8px', fontWeight: '700' }}>{log.user}</td>
                      <td style={{ padding: '10px 8px' }}>{log.action}</td>
                      <td style={{ padding: '10px 8px', color: '#0e7490', fontWeight: '600' }}>{log.target}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', color: '#64748b' }}>{log.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '12px 20px', background: '#f8fafc', borderTop: '1px solid #cbd5e1', textAlign: 'right' }}>
              <button onClick={() => setShowAudit(false)} style={{ padding: '8px 16px', background: '#244E5F', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>Close Log</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
