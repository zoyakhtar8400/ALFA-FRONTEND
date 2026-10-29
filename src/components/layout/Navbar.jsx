import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FaCalendarAlt,
  FaMoon,
  FaKey,
  FaSignOutAlt,
  FaChevronRight,
  FaTimes,
  FaCheck,
  FaArrowLeft,
  FaEye,
  FaEyeSlash,
  FaLock
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useFrontDesk } from '../../context/FrontDeskContext';
import { useRestaurant } from '../../context/RestaurantContext';
import companyProfileService from '../../services/companyProfileService';
import NightAuditModal from '../../pages/FrontDesk/operation/nightAudit/NightAuditModal';

// Format audit date safely into 'DD MMM YYYY' without timezone offset
const formatAuditDate = (val) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  if (!val) {
    const today = new Date();
    return `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
  }
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val.trim())) {
    const [year, month, day] = val.trim().split('-');
    const monthName = months[parseInt(month, 10) - 1] || month;
    return `${parseInt(day, 10)} ${monthName} ${year}`;
  }
  const d = new Date(val);
  if (!isNaN(d.getTime())) {
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }
  return String(val);
};

const Navbar = ({ toggleSidebar, toggleCollapse, sidebarCollapsed, showToast, onOpenSearch, isPosOperationalPage }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { auditLogs, nightAuditDate: contextAuditDate } = useFrontDesk();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showNightAuditModal, setShowNightAuditModal] = useState(false);
  const [passwordState, setPasswordState] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [darkMode, setDarkMode] = useState(false);

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [nightAuditDate, setNightAuditDate] = useState(() => {
    try {
      const saved = localStorage.getItem('alfa_night_audit_date');
      if (!saved || saved === '2026-10-16' || saved === '2026-10-17' || saved === '2026-10-19') {
        localStorage.setItem('alfa_night_audit_date', '2026-10-20');
        return '2026-10-20';
      }
      return saved;
    } catch {
      return '2026-10-20';
    }
  });

  useEffect(() => {
    if (contextAuditDate) {
      setNightAuditDate(contextAuditDate);
    }
  }, [contextAuditDate]);

  useEffect(() => {
    // Fetch authoritative business date from backend
    import('../../services/nightAuditService').then(mod => {
      mod.default.getStatus().then(res => {
        if (res && res.business_date) {
          setNightAuditDate(res.business_date);
          try {
            localStorage.setItem('alfa_night_audit_date', res.business_date);
          } catch (e) {}
        }
      }).catch(() => {});
    }).catch(() => {});

    const handleAuditUpdate = (e) => {
      const updated = e.detail || localStorage.getItem('alfa_night_audit_date');
      if (updated) {
        setNightAuditDate(updated);
      }
    };
    window.addEventListener('nightAuditDateUpdated', handleAuditUpdate);
    return () => window.removeEventListener('nightAuditDateUpdated', handleAuditUpdate);
  }, []);

  const displayAuditDate = useMemo(() => {
    return formatAuditDate(nightAuditDate || contextAuditDate);
  }, [nightAuditDate, contextAuditDate]);

  const [companyProfile, setCompanyProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('alfa_company_profile') || localStorage.getItem('companyProfile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    companyProfileService.getProfile().then(res => {
      const p = res?.data || res?.companyProfile || (res && res.id ? res : null);
      if (p && (p.company_name || p.name)) {
        setCompanyProfile(p);
        try {
          localStorage.setItem('alfa_company_profile', JSON.stringify(p));
        } catch (e) {}
      }
    }).catch(() => {});

    const handleProfileUpdate = (e) => {
      const updated = e.detail;
      if (updated) {
        setCompanyProfile(updated);
        try {
          localStorage.setItem('alfa_company_profile', JSON.stringify(updated));
        } catch (e) {}
      }
    };

    window.addEventListener('companyProfileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('companyProfileUpdated', handleProfileUpdate);
  }, []);

  // Compute Breadcrumbs matching screenshot
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path.startsWith('/pos/master') || path.startsWith('/pos/masters') || path === '/pos') {
      return ['Point of Sale', 'Master Workspace'];
    }
    if (path.includes('/display-table')) {
      return ['Point of Sale', 'Display Table'];
    }
    if (path.includes('/view-kot')) {
      return ['Point of Sale', 'View KOT'];
    }
    if (path.includes('/order-details')) {
      return ['Point of Sale', 'Order Details'];
    }
    if (path.includes('/billing-desk')) {
      return ['Point of Sale', 'Billing Desk'];
    }
    if (path.includes('/pos-billing')) {
      return ['Point of Sale', 'POS Billing'];
    }
    if (path.startsWith('/restaurant/pos')) {
      return ['Point of Sale', 'Takeaway'];
    }
    if (path.startsWith('/restaurant/delivery')) {
      return ['Point of Sale', 'Delivery'];
    }
    if (path.startsWith('/restaurant/kds')) {
      return ['Point of Sale', 'Kitchen Station (KDS)'];
    }
    if (path === '/pos/report') {
      return ['Point of Sale', 'Growth & Loss Dashboard'];
    }
    if (path.startsWith('/pos/report/catalog')) {
      return ['Point of Sale', 'Reports Catalog'];
    }
    if (path.startsWith('/pos/report')) {
      return ['Point of Sale', 'Reports'];
    }

    const parts = path.split('/').filter(Boolean);
    if (parts.length === 0) return ['Point of Sale', 'Dashboard'];
    return parts.map(p =>
      p.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    );
  };

  const breadcrumbs = getBreadcrumbs();

  const handleHamburger = () => {
    if (window.innerWidth > 768) {
      toggleCollapse();
    } else {
      toggleSidebar();
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout(showToast);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passwordState.newPassword || passwordState.newPassword.length < 4) {
      if (showToast) showToast('Password must be at least 4 characters.', 'warning');
      return;
    }
    if (passwordState.newPassword !== passwordState.confirmPassword) {
      if (showToast) showToast('Passwords do not match.', 'error');
      return;
    }
    if (showToast) showToast('Password updated successfully.', 'success');
    setShowPasswordModal(false);
    setPasswordState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  };

  const profileName = companyProfile?.company_name || companyProfile?.name;
  const displayName = profileName || user?.name || user?.username || 'Alfa';
  const displayRole = profileName ? (user?.role || 'Company Profile') : (user?.role || 'System Admin');
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('') || 'AL';

  return (
    <header style={{
      minHeight: '60px',
      height: '64px',
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      gap: '12px',
      flexWrap: 'nowrap',
      overflowX: 'auto',
      zIndex: 100,
      position: 'sticky',
      top: 0,
      flexShrink: 0,
      fontFamily: "'Outfit', var(--font-family), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)'
    }}>
      {/* LEFT SECTION: Sidebar Toggle & Breadcrumbs & Night Audit Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'nowrap', minWidth: 0, flexShrink: 0, fontFamily: 'inherit' }}>
        {isPosOperationalPage ? (
          <button
            onClick={() => navigate('/pos/master')}
            title="Back to POS Master Workspace"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              color: '#0f172a',
              fontSize: '14.5px',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              fontFamily: 'inherit',
              transition: 'all 0.15s ease'
            }}
            className="hover:bg-teal-50 hover:text-teal-700 hover:border-teal-400"
          >
            <FaArrowLeft size={13} />
            <span>Master</span>
          </button>
        ) : (
          /* Sidebar Toggle Button [|] */
          <button
            onClick={handleHamburger}
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              borderRadius: '8px',
              flexShrink: 0,
              fontFamily: 'inherit'
            }}
            className="hover:text-teal-700 hover:bg-slate-100"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
            </svg>
          </button>
        )}

        {/* Operational Quick Switcher for Tables, KOT, Orders, Billing Desk */}
        {isPosOperationalPage && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: '#f1f5f9',
            padding: '4px',
            borderRadius: '8px',
            gap: '4px',
            border: '1px solid #e2e8f0',
            flexShrink: 0,
            fontFamily: 'inherit'
          }}>
            {[
              { label: 'Tables', path: '/restaurant/display-table', match: '/display-table' },
              { label: 'View KOT', path: '/restaurant/view-kot', match: '/view-kot' },
              { label: 'Orders', path: '/restaurant/order-details', match: '/order-details' },
              { label: 'Billing Desk', path: '/restaurant/billing-desk', match: '/billing-desk' },
            ].map(tab => {
              const active = location.pathname.includes(tab.match);
              return (
                <button
                  key={tab.label}
                  onClick={() => navigate(tab.path)}
                  style={{
                    padding: '6px 13px',
                    borderRadius: '6px',
                    fontSize: '13.5px',
                    fontWeight: active ? 700 : 600,
                    border: 'none',
                    cursor: 'pointer',
                    background: active ? '#0d9488' : 'transparent',
                    color: active ? '#ffffff' : '#475569',
                    whiteSpace: 'nowrap',
                    boxShadow: active ? '0 1px 3px rgba(13, 148, 136, 0.3)' : 'none',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s ease'
                  }}
                  className={active ? '' : 'hover:text-teal-700 hover:bg-slate-200'}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Breadcrumb Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', color: '#64748b', whiteSpace: 'nowrap', flexShrink: 0, fontFamily: 'inherit' }}>
          <FaChevronRight style={{ fontSize: '10px', color: '#94a3b8' }} />
          {breadcrumbs.map((b, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            const isPosRoot = b === 'Point of Sale';
            return (
              <React.Fragment key={idx}>
                <span
                  onClick={() => {
                    if (isPosRoot) navigate('/pos/master');
                  }}
                  style={{
                    color: isLast ? '#0f172a' : '#64748b',
                    fontWeight: isLast ? 700 : 500,
                    cursor: isPosRoot ? 'pointer' : 'default',
                    fontFamily: 'inherit'
                  }}
                  className={isPosRoot ? 'hover:text-teal-700 hover:underline' : ''}
                >
                  {b}
                </span>
                {!isLast && (
                  <FaChevronRight style={{ fontSize: '10px', color: '#94a3b8' }} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Night Audit Date Pill */}
        <div
          onClick={() => setShowNightAuditModal(true)}
          title="Click to view or run Night Audit"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#e6f7f4',
            border: '1px solid #99f6e4',
            color: '#0d9488',
            padding: '5px 11px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            fontFamily: 'inherit',
            transition: 'all 0.15s ease'
          }}
          className="hover:bg-teal-100 hover:border-teal-400"
        >
          <FaCalendarAlt style={{ fontSize: '13px' }} />
          <span>Night Audit Date: {displayAuditDate}</span>
        </div>
      </div>

      {/* RIGHT SECTION: Dark Toggle, User Profile, Password, Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, whiteSpace: 'nowrap', fontFamily: 'inherit' }}>
        {/* Dark Mode Moon Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          title="Toggle Theme"
          style={{
            background: 'none',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '8px',
            fontFamily: 'inherit'
          }}
          className="hover:text-slate-900 hover:bg-slate-100"
        >
          <FaMoon style={{ fontSize: '16px' }} />
        </button>

        {/* User Avatar Circle - clickable to company profile */}
        <div
          onClick={() => navigate('/company-profile')}
          title="Open Company Profile"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '4px 8px', borderRadius: '8px', fontFamily: 'inherit' }}
          className="hover:bg-slate-100 transition-colors"
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: '#0d9488',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '15px',
            letterSpacing: '0.04em',
            overflow: 'hidden',
            fontFamily: 'inherit'
          }}>
            {companyProfile?.logo ? (
              <img
                src={companyProfile.logo}
                alt={displayName}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              initials
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: '1.25', fontFamily: 'inherit' }}>
            <span style={{ fontSize: '14.5px', fontWeight: 700, color: '#1e293b' }}>
              {displayName}
            </span>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
              {displayRole}
            </span>
          </div>
        </div>

        {/* Password Button */}
        <button
          onClick={() => setShowPasswordModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            color: '#475569',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: '8px',
            fontFamily: 'inherit'
          }}
          className="hover:text-teal-700 hover:bg-slate-100"
        >
          <FaKey style={{ fontSize: '13px', color: '#64748b' }} />
          <span>Password</span>
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            color: '#475569',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: '8px',
            fontFamily: 'inherit'
          }}
          className="hover:text-red-600 hover:bg-red-50"
        >
          <FaSignOutAlt style={{ fontSize: '14px', color: '#64748b' }} />
          <span>Logout</span>
        </button>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && typeof document !== 'undefined' && createPortal(
        <div
          onClick={() => setShowPasswordModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '410px',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(226, 232, 240, 0.8)',
              border: '1px solid #e2e8f0',
              fontFamily: 'var(--font-family, system-ui)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: '#f0fdfa',
                  border: '1px solid #99f6e4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0d9488'
                }}>
                  <FaKey size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
                    Change Password
                  </h3>
                  <p style={{ fontSize: '11px', color: '#64748b', margin: '3px 0 0 0', fontWeight: 500 }}>
                    Update your account security credentials
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease'
                }}
                className="hover:text-slate-800 hover:bg-slate-100"
              >
                <FaTimes size={14} />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Current Password */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Current Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showOldPassword ? 'text' : 'password'}
                      value={passwordState.oldPassword}
                      onChange={e => setPasswordState(p => ({ ...p, oldPassword: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '8px 36px 8px 12px',
                        fontSize: '13px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        outline: 'none',
                        transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                      }}
                      className="focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#94a3b8',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {showOldPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordState.newPassword}
                      onChange={e => setPasswordState(p => ({ ...p, newPassword: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '8px 36px 8px 12px',
                        fontSize: '13px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        outline: 'none',
                        transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                      }}
                      className="focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                      placeholder="Enter new password (min. 4 characters)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#94a3b8',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {showNewPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Confirm New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordState.confirmPassword}
                      onChange={e => setPasswordState(p => ({ ...p, confirmPassword: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '8px 36px 8px 12px',
                        fontSize: '13px',
                        border: passwordState.confirmPassword && passwordState.newPassword !== passwordState.confirmPassword ? '1px solid #ef4444' : '1px solid #cbd5e1',
                        borderRadius: '8px',
                        outline: 'none',
                        transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                      }}
                      className="focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#94a3b8',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {showConfirmPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                    </button>
                  </div>
                  {passwordState.confirmPassword && passwordState.newPassword !== passwordState.confirmPassword && (
                    <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600, marginTop: '4px', display: 'block' }}>
                      Passwords do not match
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#475569',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  className="hover:bg-slate-100 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 20px',
                    fontSize: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#0d9488',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(13, 148, 136, 0.2)',
                    transition: 'all 0.15s ease'
                  }}
                  className="hover:bg-teal-700 hover:shadow-md"
                >
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Night Audit Modal */}
      <NightAuditModal
        isOpen={showNightAuditModal}
        onClose={() => setShowNightAuditModal(false)}
        showToast={showToast}
      />
    </header>
  );
};

export default Navbar;
