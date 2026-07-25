import { useContext } from 'react';
import { PurchaseContext } from '../context/PurchaseContext';

export const usePurchase = () => {
  const context = useContext(PurchaseContext);
  if (!context) {
    throw new Error('usePurchase hook must be used within a PurchaseProvider');
  }
  return context;
};

export default usePurchase;
