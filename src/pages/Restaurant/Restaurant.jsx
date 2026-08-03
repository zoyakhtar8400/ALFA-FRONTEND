import React from 'react';
import { useLocation } from 'react-router-dom';
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

const Restaurant = ({ showToast }) => {
  const location = useLocation();
  const path = location.pathname;

  const renderSubPage = () => {
    if (path.includes('/restaurant/masters/steward-master')) {
      return <StewardMasterPage showToast={showToast} />;
    }
    if (path.includes('/restaurant/master/printer-master')) {
      return <PrinterMasterPage />;
    }
    if (path.includes('/restaurant/master/production-category')) {
      return <ProductionCategoryPage />;
    }
    if (path.includes('/restaurant/master') || path.includes('/restaurant/masters')) {
      return <POSMasterPage showToast={showToast} />;
    }
    if (path.includes('/restaurant/booking-list')) {
      return <BookingListPage />;
    }
    if (path.includes('/restaurant/view-kot')) {
      return <ViewKOTPage />;
    }
    if (path.includes('/restaurant/invoice')) {
      return <OrderInvoicePage showToast={showToast} />;
    }
    if (path.includes('/restaurant/order-details')) {
      return <OrderDetailsPage showToast={showToast} />;
    }
    if (path.includes('/restaurant/billing-desk')) {
      return <BillingDeskPage />;
    }
    if (path.includes('/restaurant/pos-billing')) {
      return <POSBillingPage />;
    }
    // Default fallback to Display Table
    return <DisplayTablePage />;
  };

  return (
    <div style={{ minHeight: '100%' }}>
      {renderSubPage()}
    </div>
  );
};

export default Restaurant;
