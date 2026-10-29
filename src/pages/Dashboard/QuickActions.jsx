import React, { memo, useCallback } from 'react';
import { LuCalendarPlus, LuUserPlus, LuLogIn, LuLogOut, LuReceipt, LuUtensils, LuClipboardList, LuHotel, LuChartBar, LuHistory } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';

const ACTIONS = [
  { label: 'New Reservation', icon: LuCalendarPlus, color: '#1b7a6d', bg: '#f0fdfa', path: '/front-desk/reservations/new' },
  { label: 'Walk-In',         icon: LuUserPlus,     color: '#29b49b', bg: '#ecfdf5', path: '/front-desk/walk-in' },
  { label: 'Check-In',        icon: LuLogIn,        color: '#16a34a', bg: '#f0fdf4', path: '/front-desk/check-in' },
  { label: 'Check-Out',       icon: LuLogOut,       color: '#c92534', bg: '#fef2f2', path: '/front-desk/check-out' },
  { label: 'POS Billing',     icon: LuReceipt,      color: '#d97706', bg: '#fffbeb', path: '/restaurant/pos' },
  { label: 'Restaurant',      icon: LuUtensils,     color: '#0284c7', bg: '#eff6ff', path: '/restaurant' },
  { label: 'Housekeeping',    icon: LuClipboardList,color: '#112936', bg: '#f1f5f9', path: '/housekeeping' },
  { label: 'Banquet',         icon: LuHotel,        color: '#112936', bg: '#f0fdfa', path: '/banquet' },
  { label: 'Reports',         icon: LuChartBar,     color: '#15803d', bg: '#f0fdf4', path: '/reports' },
  { label: 'Guest History',   icon: LuHistory,      color: '#64748b', bg: '#f8fafc', path: '/front-desk/guest-history' },
];

const QuickActions = memo(({ showToast }) => {
  const navigate = useNavigate();

  const handleClick = useCallback((action) => {
    try { navigate(action.path); }
    catch { showToast?.(`Navigating to ${action.label}`); }
  }, [navigate, showToast]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '10px' }}>
      {ACTIONS.map((a, i) => {
        const Icon = a.icon;
        return (
          <button key={i} onClick={() => handleClick(a)}
            style={{
              background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px',
              padding: '14px 6px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '8px', cursor: 'pointer',
              transition: 'all 180ms', textAlign: 'center',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = a.color;
              e.currentTarget.style.background = a.bg;
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 6px 16px ${a.color}25`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.background = '#fff';
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={18} color={a.color} />
            </div>
            <span style={{ fontSize: '10px', fontWeight: '700', color: '#475569', lineHeight: 1.3 }}>{a.label}</span>
          </button>
        );
      })}
    </div>
  );
});

export default QuickActions;
