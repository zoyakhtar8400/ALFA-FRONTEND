import React from 'react';
import { FaTimes, FaPrint, FaExchangeAlt, FaCheckCircle, FaUser, FaHotel, FaCreditCard, FaUserPlus, FaMoneyBillWave, FaBroom } from 'react-icons/fa';

const FrontOfficeViewDrawer = ({ isOpen, activeTab, item = {}, onClose, onAction, showToast }) => {
  if (!isOpen || !item) return null;

  return (
    <div 
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', justifyContent: 'flex-end', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(3px)' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '520px',
          height: '100%',
          background: '#fff',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Drawer Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
              <FaUser />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{item.guestName || `Room ${item.roomNo}`}</h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {activeTab} • Room {item.roomNo || 'N/A'} • GRC {item.grcNo || item.bookingNo || 'N/A'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '6px', borderRadius: '50%' }}
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Drawer Body Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Guest Information */}
          <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '16px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              <FaUser style={{ color: 'var(--primary)' }} />
              <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>Guest Information</h4>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.83rem' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>GUEST NAME</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.guestName || 'PRAMOD MISHRA'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>MOBILE</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.mobile || '+91 77788 91234'}</span>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>ADDRESS</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.address || '123 Park Street, Tech Zone'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>CITY</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.city || 'Mumbai'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>COMPANY</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.company || 'SELF'}</span>
              </div>
            </div>
          </div>

          {/* Stay Information */}
          <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '16px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              <FaHotel style={{ color: 'var(--primary)' }} />
              <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>Stay Information</h4>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.83rem' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>ROOM NO</span>
                <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1rem' }}>{item.roomNo || '104'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>GRC NO</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.grcNo || item.bookingNo || '119'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>ARRIVAL DATE</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.arrival || '29 Jun 2026'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>ARRIVAL TIME</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>12:00 PM</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>EXPECTED DEPARTURE</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.departure || '30 Jun 2026'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>DEPARTURE TIME</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>11:00 AM</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>PACKAGE</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.pkg || 'CP STANDARD'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>PAX</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.pax || 2} Guests</span>
              </div>
            </div>
          </div>

          {/* Financial */}
          <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '16px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              <FaCreditCard style={{ color: 'var(--primary)' }} />
              <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>Financial</h4>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.83rem' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>RATE</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.rate || '₹3,500'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>PENDING AMOUNT</span>
                <span style={{ fontWeight: 800, color: item.pending === '₹0' ? '#10B981' : '#EF4444', fontSize: '1.05rem' }}>{item.pending || '₹0'}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Drawer Footer Operational Buttons */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px', background: 'var(--surface)', flexWrap: 'wrap' }}>
          <button
            onClick={() => showToast('Printing guest folio...')}
            className="btn-secondary"
            style={{ flex: 1, padding: '9px 12px', fontSize: '0.82rem', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <FaPrint /> Print
          </button>

          {activeTab === 'Current Occupancy' && (
            <>
              <button
                onClick={() => { onClose(); onAction('roomChange', item); }}
                className="btn-secondary"
                style={{ flex: 1, padding: '9px 12px', fontSize: '0.82rem', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <FaExchangeAlt /> Room Change
              </button>
              <button
                onClick={() => { onClose(); onAction('checkout', item); }}
                className="btn-primary"
                style={{ flex: 1, padding: '9px 12px', fontSize: '0.82rem', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#EF4444', borderColor: '#EF4444' }}
              >
                <FaCheckCircle /> Checkout
              </button>
            </>
          )}

          {activeTab === 'Arrivals' && (
            <button
              onClick={() => { onClose(); onAction('checkIn', item); }}
              className="btn-primary"
              style={{ flex: 1, padding: '9px 12px', fontSize: '0.82rem', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <FaCheckCircle /> Check-In
            </button>
          )}

          {activeTab === 'Room Status' && (
            <button
              onClick={() => { onClose(); onAction('changeStatus', item); }}
              className="btn-primary"
              style={{ flex: 1, padding: '9px 12px', fontSize: '0.82rem', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <FaBroom /> Change Status
            </button>
          )}

          {activeTab === 'Departures' && (
            <button
              onClick={() => { onClose(); onAction('checkout', item); }}
              className="btn-primary"
              style={{ flex: 1, padding: '9px 12px', fontSize: '0.82rem', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#EF4444', borderColor: '#EF4444' }}
            >
              <FaCheckCircle /> Checkout
            </button>
          )}

          {activeTab === 'Expected Arrivals' && (
            <button
              onClick={() => { onClose(); onAction('assignRoom', item); }}
              className="btn-primary"
              style={{ flex: 1, padding: '9px 12px', fontSize: '0.82rem', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <FaUserPlus /> Assign Room
            </button>
          )}

          {activeTab === 'Pending Bills' && (
            <button
              onClick={() => { onClose(); onAction('receivePayment', item); }}
              className="btn-primary"
              style={{ flex: 1, padding: '9px 12px', fontSize: '0.82rem', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#10B981', borderColor: '#10B981' }}
            >
              <FaMoneyBillWave /> Receive Payment
            </button>
          )}

          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: '9px 16px', fontSize: '0.82rem', borderRadius: '10px' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FrontOfficeViewDrawer;
