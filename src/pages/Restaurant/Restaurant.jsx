import React, { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import DisplayTablePage from './pages/DisplayTablePage';
import ViewKOTPage from './pages/ViewKOTPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import OrderInvoicePage from './pages/OrderInvoicePage';
import POSBillingPage from './pages/POSBillingPage';
import BillingDeskPage from './pages/BillingDeskPage';
import PrinterMasterPage from './pages/PrinterMasterPage';
import ProductionCategoryPage from './pages/ProductionCategoryPage';
import BookingListPage from './pages/BookingListPage';
import POSMasterPage from '../PointOfSale/PointOfSale';
import StewardMasterPage from '../PointOfSale/Masters/StewardMaster/StewardMasterPage';
import { useRestaurant } from '../../context/RestaurantContext';

const Restaurant = ({ showToast }) => {
  const { outletId } = useParams();
  const location = useLocation();
  const path = location.pathname;
  const { selectOutlet, activeOutletId, outletNotFound, loading } = useRestaurant();

  useEffect(() => {
    if (outletId) {
      const parsedId = Number(outletId);
      if (activeOutletId !== parsedId) {
        selectOutlet(parsedId);
      }
    }
  }, [outletId, activeOutletId, selectOutlet]);

  if (outletNotFound) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', fontFamily: 'var(--font-family, system-ui)' }}>
        <div style={{ padding: '40px', textAlign: 'center', color: '#b91c1c', border: '1px dashed #fca5a5', borderRadius: '16px', background: '#fef2f2', maxWidth: '480px', boxShadow: '0 4px 12px rgba(220, 38, 38, 0.05)' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 12px 0' }}>404 — Outlet Not Found</h2>
          <p style={{ fontSize: '0.95rem', color: '#991b1b', margin: 0, fontWeight: 600, lineHeight: 1.5 }}>
            The requested outlet ID <span style={{ textDecoration: 'underline', fontWeight: 800 }}>{outletId}</span> does not exist in the database or you do not have permission to access it.
          </p>
        </div>
      </div>
    );
  }

  if (loading && outletId) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', color: '#64748b', fontSize: '0.95rem', fontWeight: 700 }}>
        Loading outlet workspace...
      </div>
    );
  }

  const renderSubPage = () => {
    if (path.includes('/steward-master')) {
      return <StewardMasterPage showToast={showToast} />;
    }
    if (path.includes('/printer-master')) {
      return <PrinterMasterPage />;
    }
    if (path.includes('/production-category')) {
      return <ProductionCategoryPage />;
    }
    // Outlet workspace sub-pages — must be checked BEFORE the broad /master catch
    if (path.includes('/display-table')) {
      return <DisplayTablePage />;
    }
    if (path.includes('/view-kot')) {
      return <ViewKOTPage />;
    }
    if (path.includes('/invoice')) {
      return <OrderInvoicePage showToast={showToast} />;
    }
    if (path.includes('/order-details')) {
      return <OrderDetailsPage showToast={showToast} />;
    }
    if (path.includes('/billing-desk')) {
      return <BillingDeskPage />;
    }
    if (path.includes('/pos-billing')) {
      return <POSBillingPage />;
    }
    if (path.includes('/booking-list')) {
      return <BookingListPage />;
    }

    // Master sub-pages — only when NOT inside an outlet workspace
    const isOutletWorkspacePath = /\/outlet\/\d+\//.test(path);
    if (!isOutletWorkspacePath && (path.includes('/master') || path.includes('/masters'))) {
      return <POSMasterPage showToast={showToast} />;
    }

    // Default fallback to Display Table
    return <DisplayTablePage />;
  };

  return (
    <div style={{ flex: 1, height: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {renderSubPage()}
    </div>
  );
};

export default Restaurant;
