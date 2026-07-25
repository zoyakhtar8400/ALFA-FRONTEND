import React from 'react';
import { PurchaseProvider } from './context/PurchaseContext';
import PurchaseRoutes from './PurchaseRoutes';

const PurchaseLayout = ({ showToast }) => {
  return (
    <PurchaseProvider>
      <PurchaseRoutes showToast={showToast} />
    </PurchaseProvider>
  );
};

export default PurchaseLayout;
