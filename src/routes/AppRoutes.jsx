import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoadingState from '../components/common/LoadingState';

// Helper for lazy loading with automatic recovery on Vite HMR module 404 errors
const lazyWithRetry = (componentImport) =>
  lazy(async () => {
    try {
      const page = await componentImport();
      sessionStorage.removeItem('vite_chunk_retry');
      return page;
    } catch (error) {
      if (!sessionStorage.getItem('vite_chunk_retry')) {
        sessionStorage.setItem('vite_chunk_retry', 'true');
        window.location.reload();
      } else {
        sessionStorage.removeItem('vite_chunk_retry');
      }
      throw error;
    }
  });

// Lazy loaded domain routes with dynamic import recovery
const Dashboard = lazyWithRetry(() => import('../pages/Dashboard/Dashboard'));
const FrontDesk = lazyWithRetry(() => import('../pages/FrontDesk/FrontDesk'));
const HouseKeeping = lazyWithRetry(() => import('../pages/HouseKeeping/HouseKeeping'));
const PointOfSale = lazyWithRetry(() => import('../pages/PointOfSale/PointOfSale'));
const RoomServices = lazyWithRetry(() => import('../pages/RoomServices/RoomServices'));
const Restaurant = lazyWithRetry(() => import('../pages/Restaurant/Restaurant'));
const Banquet = lazyWithRetry(() => import('../pages/Banquet/Banquet'));
const Purchase = lazyWithRetry(() => import('../pages/Purchase/Purchase'));
const Setting = lazyWithRetry(() => import('../pages/Setting/Setting'));
const CompanyProfilePage = lazyWithRetry(() => import('../pages/Setting/CompanyProfile/CompanyProfilePage'));

const AppRoutes = ({ showToast }) => {
  return (
    <Suspense fallback={<LoadingState message="Loading module workspace..." />}>
      <Routes>
        <Route path="/" element={<Dashboard showToast={showToast} />} />
        <Route path="/profile" element={<CompanyProfilePage showToast={showToast} />} />
        <Route path="/company-profile" element={<CompanyProfilePage showToast={showToast} />} />
        <Route path="/front-desk/*" element={<FrontDesk showToast={showToast} />} />
        <Route path="/housekeeping" element={<HouseKeeping />} />
        <Route path="/pos/master/outlet/:outletId/*" element={<Restaurant showToast={showToast} />} />
        <Route path="/pos/*" element={<PointOfSale showToast={showToast} />} />
        <Route path="/room-services" element={<RoomServices />} />
        <Route path="/restaurant/*" element={<Restaurant showToast={showToast} />} />
        <Route path="/banquet" element={<Banquet />} />
        <Route path="/purchase/*" element={<Purchase showToast={showToast} />} />
        <Route path="/setting/*" element={<Setting showToast={showToast} />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
