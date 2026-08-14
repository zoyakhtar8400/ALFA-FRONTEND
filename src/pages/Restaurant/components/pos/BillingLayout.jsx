import React, { useState } from 'react';

const BillingLayout = ({ showMenu = true, isBillingDesk = false, children }) => {
  const [mobileTab, setMobileTab] = useState('menu'); // Default to 'menu' so menu is always accessible on mobile/tablet

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
            flex: 0 0 68% !important;
            max-width: 68% !important;
            display: flex !important;
            height: 100% !important;
            overflow: hidden !important;
          }
          .pos-billing-layout-split .pos-billing-section {
            flex: 0 0 32% !important;
            max-width: 32% !important;
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
