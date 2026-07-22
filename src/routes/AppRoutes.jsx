import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoadingState from '../components/common/LoadingState';

// Lazy loaded domain routes for dynamic bundle code-splitting
const Dashboard = lazy(() => import('../pages/Dashboard/Dashboard'));
const FrontDesk = lazy(() => import('../pages/FrontDesk/FrontDesk'));
const HouseKeeping = lazy(() => import('../pages/HouseKeeping/HouseKeeping'));
const PointOfSale = lazy(() => import('../pages/PointOfSale/PointOfSale'));
const RoomServices = lazy(() => import('../pages/RoomServices/RoomServices'));
const Restaurant = lazy(() => import('../pages/Restaurant/Restaurant'));
const Banquet = lazy(() => import('../pages/Banquet/Banquet'));
const Purchase = lazy(() => import('../pages/Purchase/Purchase'));
const Setting = lazy(() => import('../pages/Setting/Setting'));

const AppRoutes = ({ showToast }) => {
  return (
    <Suspense fallback={<LoadingState message="Loading module workspace..." />}>
      <Routes>
        <Route path="/" element={<Dashboard showToast={showToast} />} />
        <Route path="/front-desk/*" element={<FrontDesk showToast={showToast} />} />
        <Route path="/housekeeping" element={<HouseKeeping />} />
        <Route path="/pos/*" element={<PointOfSale showToast={showToast} />} />
        <Route path="/room-services" element={<RoomServices />} />
        <Route path="/restaurant/*" element={<Restaurant showToast={showToast} />} />
        <Route path="/banquet" element={<Banquet />} />
        <Route path="/purchase" element={<Purchase />} />
        <Route path="/setting/*" element={<Setting showToast={showToast} />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
