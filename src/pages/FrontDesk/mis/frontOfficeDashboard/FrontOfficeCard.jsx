import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../../routes/routes';
import {
  FaEye, FaUser, FaBed, FaChevronDown,
  FaUserEdit, FaExchangeAlt, FaFileInvoice,
  FaPlusCircle, FaMoneyBillWave, FaSignOutAlt,
  FaUsers, FaCalendarAlt, FaBan, FaCoins, FaCalendarCheck
} from 'react-icons/fa';

const ACTION_MENU = [
  { label: 'Change Guest Profile',  path: ROUTES.GUEST_PROFILE,           icon: FaUserEdit,       color: '#3B82F6' },
  { label: 'Room Change Entry',     path: ROUTES.ROOM_CHANGE,        icon: FaExchangeAlt,    color: '#0D9488' },
  { label: 'Display Folio',         path: ROUTES.CHECKOUT,           icon: FaFileInvoice,    color: '#8B5CF6' },
  { label: 'Charge Entry',          path: ROUTES.SERVICE_CHARGE,     icon: FaPlusCircle,     color: '#10B981' },
  { label: 'Payment Receive Entry', path: ROUTES.PAYMENT_RECEIVE,    icon: FaMoneyBillWave,  color: '#22C55E' },
  { label: 'Check Out Entry',       path: ROUTES.CHECKOUT,           icon: FaSignOutAlt,     color: '#F43F5E' },
  { label: 'All Guest In Status',   path: ROUTES.WALKIN_CHECKIN,     icon: FaUsers,          color: '#6366F1' },
  { label: 'Reservation Calendar',  path: ROUTES.RESERVATION_DASHBOARD,          icon: FaCalendarAlt,    color: '#F59E0B' },
  { label: 'Check Out Bill Cancel', path: null, icon: FaBan, color: '#EF4444', isToast: true, toastMsg: 'Check Out Bill Cancel action triggered.' },
  { label: 'Refund Entry',          path: ROUTES.REFUND,             icon: FaCoins,          color: '#F97316' },
  { label: 'Amend Stay',            path: null, isModal: true, modalType: 'amendStay',      icon: FaCalendarCheck,  color: '#7C3AED' },
];

const FrontOfficeCard = ({ item = {}, activeTab, onView, onAction }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const displayName = item.guestName || (item.roomNo ? `Room ${item.roomNo}` : 'Guest Record');
  const isRoomStatus = activeTab === 'Room Status';

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Occupied':     return { color: '#10B981', bg: '#d1fae5' };
      case 'Clean':        return { color: '#3B82F6', bg: '#dbeafe' };
      case 'Dirty':        return { color: '#ca8a04', bg: '#fef9c3' };
      case 'Out Of Order': return { color: '#EF4444', bg: '#fee2e2' };
      case 'Arrival':      return { color: '#8B5CF6', bg: '#ede9fe' };
      case 'Departure':    return { color: '#F59E0B', bg: '#fef3c7' };
      case 'Reserved':     return { color: '#6366F1', bg: '#e0e7ff' };
      case 'Pending Bill': return { color: '#EF4444', bg: '#fee2e2' };
      default:             return { color: '#64748b', bg: '#f1f5f9' };
    }
  };

  const statusStyle = getStatusColor(item.status);

  const handleActionClick = (action) => {
    setDropdownOpen(false);
    if (action.isModal && onAction) {
      onAction(action.modalType, item);
    } else if (action.isToast) {
      if (window.showToast) window.showToast(action.toastMsg);
    } else if (action.path) {
      let targetUrl = action.path;
      if (targetUrl.includes('/operation/')) {
        const queryParams = new URLSearchParams();
        queryParams.set('add', 'true');
        if (action.label === 'Display Folio') {
          queryParams.set('displayFolio', 'true');
        }
        if (item.grcNo) queryParams.set('grcNo', item.grcNo);
        if (item.roomNo) queryParams.set('roomNo', item.roomNo);
        if (item.guestName) {
          queryParams.set('guestName', item.guestName);
          queryParams.set('name', item.guestName); // fallback key
        }
        if (item.mobile) queryParams.set('mobile', item.mobile);
        targetUrl += `?${queryParams.toString()}`;
      }
      navigate(targetUrl, { state: { returnTo: ROUTES.FRONT_OFFICE_DASHBOARD } });
    }
  };

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '12px',
        boxShadow: 'var(--shadow-sm)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        height: '100%',
        minHeight: '150px',
        position: 'relative',
      }}
      className="hover:shadow-md hover:-translate-y-0.5"
    >
      {/* Card Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{
          width: '38px', height: '38px', borderRadius: '10px',
          background: 'var(--primary-light)', color: 'var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px', flexShrink: 0,
        }}>
          {isRoomStatus ? <FaBed /> : <FaUser />}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
          <span
            style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            title={displayName}
          >
            {displayName}
          </span>
          {item.roomNo && !isRoomStatus && (
            <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 600 }}>Room {item.roomNo}</span>
          )}
          {item.status && (
            <span style={{
              fontSize: '0.8rem', fontWeight: 700,
              color: statusStyle.color, background: statusStyle.bg,
              padding: '3px 10px', borderRadius: '10px',
              marginTop: '4px', display: 'inline-block', width: 'fit-content'
            }}>
              {item.status}
            </span>
          )}
        </div>
      </div>

      {/* Card Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>

        {/* View Button */}
        <button
          onClick={() => onView(item)}
          style={{
            flex: 1,
            height: '34px',
            padding: '0 12px',
            fontSize: '0.82rem',
            borderRadius: '8px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontWeight: 600,
            backgroundColor: '#ffffff',
            color: '#475569',
            border: '1px solid #f1f5f9',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = '#f8fafc';
            e.currentTarget.style.borderColor = '#cbd5e1';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = '#ffffff';
            e.currentTarget.style.borderColor = '#f1f5f9';
          }}
        >
          <FaEye size={12} /> View
        </button>

        {/* Action Dropdown Button */}
        <div ref={dropdownRef} style={{ position: 'relative', flex: 1 }}>
          <button
            onClick={() => setDropdownOpen(prev => !prev)}
            style={{
              width: '100%',
              height: '34px',
              padding: '0 12px',
              fontSize: '0.82rem',
              borderRadius: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #0D9488, #0891b2)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Action
            <FaChevronDown
              size={10}
              style={{
                transition: 'transform 0.2s',
                transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
              }}
            />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div
              style={{
                position: 'absolute',
                bottom: 'calc(100% + 6px)',
                right: 0,
                minWidth: '220px',
                background: '#ffffff',
                border: '1px solid rgba(226,232,240,0.9)',
                borderRadius: '12px',
                boxShadow: '0 12px 32px -8px rgba(15,23,42,0.18)',
                zIndex: 1000,
                overflow: 'hidden',
                padding: '5px',
              }}
            >
              {/* Dropdown Header */}
              <div style={{
                padding: '6px 12px 5px',
                fontSize: '0.72rem',
                fontWeight: 800,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                borderBottom: '1px solid #f1f5f9',
                marginBottom: '4px'
              }}>
                Quick Actions
              </div>

              {ACTION_MENU.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleActionClick(action)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: '#334155',
                      textAlign: 'left',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = action.color; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#334155'; }}
                  >
                    <span style={{
                      width: '24px', height: '24px', borderRadius: '6px',
                      background: action.color + '18',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, color: action.color
                    }}>
                      <Icon size={12} />
                    </span>
                    {action.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default FrontOfficeCard;
