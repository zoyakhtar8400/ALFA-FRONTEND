import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard/Dashboard';
import FrontDesk from '../pages/FrontDesk/FrontDesk';
import HouseKeeping from '../pages/HouseKeeping/HouseKeeping';
import PointOfSale from '../pages/PointOfSale/PointOfSale';
import RoomServices from '../pages/RoomServices/RoomServices';
import Restaurant from '../pages/Restaurant/Restaurant';
import Banquet from '../pages/Banquet/Banquet';
import Purchase from '../pages/Purchase/Purchase';
import Setting from '../pages/Setting/Setting';

const AppRoutes = ({ showToast }) => {
  return (
    <Routes>
      <Route path="#" element={<Dashboard showToast={showToast} />} />
      <Route path="/front-desk/*" element={<FrontDesk showToast={showToast} />} />
      <Route path="/housekeeping" element={<HouseKeeping />} />
      <Route path="/pos" element={<PointOfSale />} />
      <Route path="/room-services" element={<RoomServices />} />
      <Route path="/restaurant" element={<Restaurant />} />
      <Route path="/banquet" element={<Banquet />} />
      <Route path="/purchase" element={<Purchase />} />
      <Route path="/setting" element={<Setting />} />
    </Routes>
  );
};

export default AppRoutes;
