import React from 'react';
import { useLocation } from 'react-router-dom';
import DisplayTablePage from './pages/DisplayTablePage';
import ViewKOTPage from './pages/ViewKOTPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import POSBillingPage from './pages/POSBillingPage';
import POSMasterPage from '../PointOfSale/PointOfSale';
import StewardMasterPage from '../PointOfSale/Masters/StewardMaster/StewardMasterPage';

const Restaurant = ({ showToast }) => {
  const location = useLocation();
  const path = location.pathname;

  const renderSubPage = () => {
    if (path.includes('/restaurant/masters/steward-master')) {
      return <StewardMasterPage showToast={showToast} />;
    }
    if (path.includes('/restaurant/master') || path.includes('/restaurant/masters')) {
      return <POSMasterPage showToast={showToast} />;
    }
    if (path.includes('/restaurant/view-kot')) {
      return <ViewKOTPage />;
    }
    if (path.includes('/restaurant/order-details')) {
      return <OrderDetailsPage />;
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
