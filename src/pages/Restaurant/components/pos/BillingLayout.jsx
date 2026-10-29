import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaToggleOn, FaStore, FaDesktop, FaClipboardList,
  FaHistory, FaHandPaper, FaBell
} from 'react-icons/fa';

const BillingLayout = ({ showMenu = true, isBillingDesk = false, children }) => {
  const [mobileTab, setMobileTab] = useState('menu');
  const navigate = useNavigate();

  return (
    <div
      className={isBillingDesk ? "pos-billing-layout-full" : "pos-billing-layout-split"}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        background: '#f8fafc',
        overflow: 'hidden'
      }}
    >
      {/* ── Petpooja Upper Header Bar: All Icons (Item On/Off, Store, Live View, Orders, Recent, Hold, Alerts, Logout, Help) ── */}
      <div style={{
        height: '46px',
        minHeight: '46px',
        background: '#ffffff',
        borderBottom: '1.5px solid #cbd5e1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        boxSizing: 'border-box',
        zIndex: 40,
        flexShrink: 0
      }}>
        {/* Left Side: Back to Tables */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => navigate('/restaurant/display-table')}
            style={{
              background: '#f1f5f9',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap'
            }}
            className="hover:bg-slate-200 hover:text-teal-800"
            title="Back to Tables"
          >
            ← Tables
          </button>
        </div>

        {/* Right Side: Petpooja Header Icons Strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* 1. Item On/Off */}
          {/* <button
            type="button"
            onClick={() => navigate('/restaurant/menu-item-master')}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', color: '#475569'
            }}
            title="Item On/Off"
          >
            <FaToggleOn size={14} color="#059669" />
            <span style={{ fontSize: '7.5px', fontWeight: 800, color: '#475569', marginTop: '1px' }}>Item On/Off</span>
          </button> */}

          {/* 2. Store */}
          {/* <button
            type="button"
            onClick={() => navigate('/restaurant/restaurant-outlets')}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', color: '#475569'
            }}
            title="Store"
          >
            <FaStore size={13} color="#475569" />
            <span style={{ fontSize: '7.5px', fontWeight: 800, color: '#475569', marginTop: '1px' }}>Store</span>
          </button> */}

          {/* 3. Live View */}
          {/* <button
            type="button"
            onClick={() => navigate('/restaurant/display-table')}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', color: '#475569'
            }}
            title="Live View"
          >
            <FaDesktop size={13} color="#475569" />
            <span style={{ fontSize: '7.5px', fontWeight: 800, color: '#475569', marginTop: '1px' }}>Live View</span>
          </button> */}

          {/* 4. Orders */}
          {/* <button
            type="button"
            onClick={() => navigate('/restaurant/order-details')}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', color: '#475569'
            }}
            title="Orders"
          >
            <FaClipboardList size={13} color="#475569" />
            <span style={{ fontSize: '7.5px', fontWeight: 800, color: '#475569', marginTop: '1px' }}>Orders</span>
          </button> */}

          {/* 5. Recent */}
          {/* <button
            type="button"
            onClick={() => navigate('/restaurant/booking-list')}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', color: '#475569'
            }}
            title="Recent"
          >
            <FaHistory size={13} color="#475569" />
            <span style={{ fontSize: '7.5px', fontWeight: 800, color: '#475569', marginTop: '1px' }}>Recent</span>
          </button> */}

          {/* 6. Hold */}
          {/* <button
            type="button"
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', color: '#475569'
            }}
            title="Hold"
          >
            <FaHandPaper size={13} color="#d97706" />
            <span style={{ fontSize: '7.5px', fontWeight: 800, color: '#475569', marginTop: '1px' }}>Hold</span>
          </button> */}

          {/* 7. Alerts */}
          {/* <button
            type="button"
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', color: '#475569', position: 'relative'
            }}
            title="Alerts"
          >
            <FaBell size={13} color="#475569" />
            <span style={{ fontSize: '7.5px', fontWeight: 800, color: '#475569', marginTop: '1px' }}>Alerts</span>
          </button> */}


          {/* 9. Need Help? Callout */}
          <div
            onClick={() => window.open('tel:7017671730')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              border: '1.5px solid #c92534',
              borderRadius: '6px',
              padding: '2px 8px',
              background: '#fff1f2',
              color: '#c92534',
              cursor: 'pointer',
              lineHeight: 1.15,
              marginLeft: '4px'
            }}
            title="Call Support: 7017671730"
          >
            <span style={{ fontSize: '7px', fontWeight: 800, textTransform: 'uppercase' }}>Need Help ?</span>
            <span style={{ fontSize: '9px', fontWeight: 900 }}>7017671730</span>
          </div>
        </div>
      </div>
      <style>{`
        .content-area {
          padding: 0 !important;
          margin: 0 !important;
          background-color: #f8fafc !important;
        }
        .pos-layout-inner {
          display: flex;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        
        /* Billing Desk (100% Single Page - Never Divided into 2 parts) */
        .pos-billing-layout-full .pos-menu-section {
          display: none !important;
        }
        .pos-billing-layout-full .mobile-tab-bar {
          display: none !important;
        }
        .pos-billing-layout-full .pos-billing-section {
          flex: 1 1 100% !important;
          max-width: 100% !important;
          width: 100% !important;
          display: flex !important;
          flex-direction: column !important;
          height: 100% !important;
          max-height: 100% !important;
          overflow: hidden !important;
        }

        /* Desktop POS Billing Split View (1024px+) */
        @media (min-width: 1024px) {
          .pos-billing-layout-split .pos-menu-section {
            flex: 0 0 55% !important;
            max-width: 55% !important;
            display: flex !important;
            height: 100% !important;
            overflow: hidden !important;
          }
          .pos-billing-layout-split .pos-billing-section {
            flex: 0 0 45% !important;
            max-width: 45% !important;
            display: flex !important;
            flex-direction: column !important;
            height: 100% !important;
            max-height: 100% !important;
            overflow: hidden !important;
          }
          .pos-billing-layout-split .mobile-tab-bar {
            display: none !important;
          }
        }

        /* Large Desktop Screens (1600px+) */
        @media (min-width: 1600px) {
          .pos-billing-layout-split .pos-menu-section {
            flex: 0 0 52% !important;
            max-width: 52% !important;
          }
          .pos-billing-layout-split .pos-billing-section {
            flex: 0 0 48% !important;
            max-width: 48% !important;
          }
        }

        /* Mobile & Tablet POS Billing View (1023px and smaller) - Clean Tabbed View */
        @media (max-width: 1023px) {
          .pos-layout-inner {
            flex-direction: column !important;
            overflow-y: auto !important;
          }
          .pos-billing-layout-split .mobile-tab-bar {
            display: flex !important;
          }
          .pos-billing-layout-split .pos-menu-section {
            width: 100% !important;
            max-width: 100% !important;
            flex: 1 1 100% !important;
            display: ${mobileTab === 'menu' ? 'flex' : 'none'} !important;
          }
          .pos-billing-layout-split .pos-billing-section {
            width: 100% !important;
            max-width: 100% !important;
            flex: 1 1 100% !important;
            display: ${mobileTab === 'billing' ? 'flex' : 'none'} !important;
          }
        }
      `}</style>

      {/* Mobile Tab Switcher Bar */}
      <div className="mobile-tab-bar" style={{
        display: 'flex', background: '#0e7490', color: '#ffffff',
        borderBottom: '1px solid #0891b2', zIndex: 10
      }}>
        <button
          type="button"
          onClick={() => setMobileTab('menu')}
          style={{
            flex: 1, padding: '10px 0', fontSize: '0.85rem', fontWeight: 800, border: 'none',
            background: mobileTab === 'menu' ? '#ffffff' : 'transparent',
            color: mobileTab === 'menu' ? '#0e7490' : '#e0f2fe',
            cursor: 'pointer', transition: 'all 0.15s'
          }}
        >
          🛒 Menu & Items
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('billing')}
          style={{
            flex: 1, padding: '10px 0', fontSize: '0.85rem', fontWeight: 800, border: 'none',
            background: mobileTab === 'billing' ? '#ffffff' : 'transparent',
            color: mobileTab === 'billing' ? '#0e7490' : '#e0f2fe',
            cursor: 'pointer', transition: 'all 0.15s'
          }}
        >
          🧾 {isBillingDesk ? 'Billing Desk' : 'Bill & Pay'}
        </button>
      </div>

      <div className="pos-layout-inner">
        {children}
      </div>
    </div>
  );
};

export default BillingLayout;
